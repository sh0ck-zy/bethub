/**
 * Discovery Module - Autonomous Match Discovery and Filtering
 * Automatically discovers matches and filters them based on competition rules
 */

import { eventBus, emitEvent } from './event-bus';
import { competitionManager, type CompetitionRule } from './competition-config';
import { dataSyncService } from '../services/data-sync';
import { supabase } from '../supabase';
import { randomUUID } from 'crypto';

export interface DiscoveredMatch {
  id: string;
  league: string;
  home_team: string;
  away_team: string;
  kickoff_utc: string;
  status: string;
  competition_rule: CompetitionRule;
  discovery_metadata: {
    discovered_at: string;
    source: string;
    confidence_score: number;
    auto_analyze: boolean;
    auto_publish: boolean;
  };
}

/**
 * Discovery Module - Core logic for autonomous match discovery
 */
export class DiscoveryModule {
  private isRunning = false;
  private discoveryInterval: NodeJS.Timeout | null = null;
  private readonly DISCOVERY_INTERVAL_MS = 60 * 60 * 1000; // 1 hour

  constructor() {
    this.setupEventHandlers();
  }

  /**
   * Start the autonomous discovery process
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      console.log('[Discovery] Already running');
      return;
    }

    console.log('[Discovery] Starting autonomous match discovery...');
    this.isRunning = true;

    // Initial discovery run
    await this.runDiscovery();

    // Schedule periodic discovery
    this.discoveryInterval = setInterval(() => {
      this.runDiscovery().catch(error => {
        console.error('[Discovery] Scheduled discovery failed:', error);
      });
    }, this.DISCOVERY_INTERVAL_MS);

    console.log('[Discovery] Started successfully');
  }

  /**
   * Stop the discovery process
   */
  stop(): void {
    console.log('[Discovery] Stopping autonomous discovery...');
    this.isRunning = false;

    if (this.discoveryInterval) {
      clearInterval(this.discoveryInterval);
      this.discoveryInterval = null;
    }

    console.log('[Discovery] Stopped');
  }

  /**
   * Run a single discovery cycle
   */
  async runDiscovery(): Promise<{
    discovered: number;
    filtered: number;
    errors: string[];
  }> {
    console.log('[Discovery] Running discovery cycle...');
    
    const results = {
      discovered: 0,
      filtered: 0,
      errors: [] as string[]
    };

    try {
      // Get upcoming matches from data provider (next 7 days)
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 7);
      
      const syncResult = await dataSyncService.syncMatchesForDateRange(
        new Date(),
        endDate
      );

      if (!syncResult.success) {
        results.errors.push(`Data sync failed: ${syncResult.error}`);
        return results;
      }

      // Get all matches from the database that aren't processed yet
      const { data: rawMatches, error: dbError } = await supabase
        .from('matches')
        .select('*')
        .gte('kickoff_utc', new Date().toISOString())
        .lte('kickoff_utc', endDate.toISOString())
        .is('analysis_status', null)
        .or('analysis_status.eq.none')
        .eq('is_published', false);

      if (dbError) {
        results.errors.push(`Database query failed: ${dbError.message}`);
        return results;
      }

      if (!rawMatches || rawMatches.length === 0) {
        console.log('[Discovery] No new matches found');
        return results;
      }

      console.log(`[Discovery] Found ${rawMatches.length} potential matches`);

      // Filter matches based on competition rules
      for (const match of rawMatches) {
        try {
          const coverageResult = competitionManager.shouldCoverMatch({
            league: match.league,
            home_team: match.home_team,
            away_team: match.away_team,
            kickoff_utc: match.kickoff_utc
          });

          if (!coverageResult.should_cover) {
            console.log(`[Discovery] Filtered out match: ${match.home_team} vs ${match.away_team} - ${coverageResult.reason}`);
            results.filtered++;
            continue;
          }

          // Create discovered match object
          const discoveredMatch: DiscoveredMatch = {
            id: match.id,
            league: match.league,
            home_team: match.home_team,
            away_team: match.away_team,
            kickoff_utc: match.kickoff_utc,
            status: match.status,
            competition_rule: coverageResult.rule!,
            discovery_metadata: {
              discovered_at: new Date().toISOString(),
              source: 'autonomous-discovery',
              confidence_score: this.calculateMatchConfidence(match, coverageResult.rule!),
              auto_analyze: coverageResult.rule!.analysis.auto_analyze,
              auto_publish: coverageResult.rule!.analysis.auto_publish
            }
          };

          // Update match in database with discovery metadata
          await this.markMatchAsDiscovered(discoveredMatch);

          // Emit match discovered event
          await emitEvent(
            'match.discovered',
            'discovery-module',
            {
              match_id: discoveredMatch.id,
              league: discoveredMatch.league,
              home_team: discoveredMatch.home_team,
              away_team: discoveredMatch.away_team,
              kickoff_utc: discoveredMatch.kickoff_utc,
              competition_config: discoveredMatch.competition_rule.id
            },
            `discovery_${discoveredMatch.id}`
          );

          console.log(`[Discovery] Discovered match: ${match.home_team} vs ${match.away_team} (${match.league})`);
          results.discovered++;

        } catch (error) {
          console.error(`[Discovery] Error processing match ${match.id}:`, error);
          results.errors.push(`Match ${match.id}: ${error instanceof Error ? error.message : String(error)}`);
        }
      }

      console.log(`[Discovery] Cycle complete - Discovered: ${results.discovered}, Filtered: ${results.filtered}, Errors: ${results.errors.length}`);
      
    } catch (error) {
      console.error('[Discovery] Discovery cycle failed:', error);
      results.errors.push(`Discovery cycle failed: ${error instanceof Error ? error.message : String(error)}`);
    }

    return results;
  }

  /**
   * Calculate confidence score for a match
   */
  private calculateMatchConfidence(match: any, rule: CompetitionRule): number {
    let confidence = 50; // Base confidence

    // Higher confidence for high-priority competitions
    if (rule.priority === 'high') confidence += 30;
    else if (rule.priority === 'medium') confidence += 15;

    // Boost for included teams
    if (rule.criteria.include_teams?.some(team =>
      match.home_team.includes(team) || match.away_team.includes(team)
    )) {
      confidence += 20;
    }

    // Boost for popular leagues
    const popularLeagues = ['Premier League', 'Champions League', 'La Liga'];
    if (popularLeagues.some(league => match.league.includes(league))) {
      confidence += 15;
    }

    // Timing factor
    const kickoffTime = new Date(match.kickoff_utc);
    const now = new Date();
    const hoursUntilKickoff = (kickoffTime.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    if (hoursUntilKickoff >= 12 && hoursUntilKickoff <= 48) {
      confidence += 10; // Optimal timing window
    }

    return Math.min(100, Math.max(0, confidence));
  }

  /**
   * Mark match as discovered in database
   */
  private async markMatchAsDiscovered(match: DiscoveredMatch): Promise<void> {
    const { error } = await supabase
      .from('matches')
      .update({
        analysis_status: 'pending',
        discovery_metadata: match.discovery_metadata,
        competition_rule_id: match.competition_rule.id,
        updated_at: new Date().toISOString()
      })
      .eq('id', match.id);

    if (error) {
      throw new Error(`Failed to mark match as discovered: ${error.message}`);
    }
  }

  /**
   * Setup event handlers
   */
  private setupEventHandlers(): void {
    // Listen for system events that might trigger additional discovery
    eventBus.on('system.error', async (event) => {
      if (event.source === 'discovery-module') {
        console.log('[Discovery] Handling discovery error, will retry on next cycle');
      }
    });
  }

  /**
   * Get discovery statistics
   */
  async getStats(): Promise<{
    is_running: boolean;
    discovered_today: number;
    pending_analysis: number;
    competition_coverage: any;
    last_discovery: string | null;
  }> {
    const today = new Date().toISOString().split('T')[0];
    
    const { count: discoveredToday } = await supabase
      .from('matches')
      .select('*', { count: 'exact', head: true })
      .gte('discovery_metadata->discovered_at', `${today}T00:00:00Z`)
      .lte('discovery_metadata->discovered_at', `${today}T23:59:59Z`);

    const { count: pendingAnalysis } = await supabase
      .from('matches')
      .select('*', { count: 'exact', head: true })
      .eq('analysis_status', 'pending');

    const { data: lastDiscovery } = await supabase
      .from('matches')
      .select('discovery_metadata')
      .not('discovery_metadata', 'is', null)
      .order('discovery_metadata->discovered_at', { ascending: false })
      .limit(1)
      .single();

    return {
      is_running: this.isRunning,
      discovered_today: discoveredToday || 0,
      pending_analysis: pendingAnalysis || 0,
      competition_coverage: competitionManager.getStats(),
      last_discovery: lastDiscovery?.discovery_metadata?.discovered_at || null
    };
  }

  /**
   * Manual discovery trigger for testing/debugging
   */
  async triggerDiscovery(): Promise<any> {
    if (!this.isRunning) {
      throw new Error('Discovery module is not running');
    }
    
    return await this.runDiscovery();
  }
}

// Export singleton instance
export const discoveryModule = new DiscoveryModule();

// Auto-start discovery in production
if (process.env.NODE_ENV === 'production') {
  discoveryModule.start().catch(error => {
    console.error('[Discovery] Failed to auto-start discovery module:', error);
  });
}