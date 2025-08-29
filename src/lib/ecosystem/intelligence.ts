/**
 * Intelligence Module - Team Data Enrichment and Venue Intelligence
 * Enriches matches with additional context and intelligence
 */

import { eventBus, emitEvent } from './event-bus';
import { supabase } from '../supabase';

export interface TeamIntelligence {
  name: string;
  aliases: string[];
  league: string;
  country: string;
  founded?: number;
  venue?: string;
  capacity?: number;
  
  // Performance data
  current_form: Array<'W' | 'L' | 'D'>;
  home_record: { wins: number; draws: number; losses: number };
  away_record: { wins: number; draws: number; losses: number };
  
  // Statistical insights
  avg_goals_scored: number;
  avg_goals_conceded: number;
  clean_sheets: number;
  
  // Key players (simplified)
  key_players: Array<{
    name: string;
    position: string;
    goals?: number;
    assists?: number;
  }>;
  
  // Tactical info
  formation: string;
  style: 'attacking' | 'defensive' | 'balanced';
  
  // Recent news sentiment
  sentiment_score: number; // -1 to 1
  last_updated: string;
}

export interface VenueIntelligence {
  name: string;
  location: string;
  capacity: number;
  surface: 'grass' | 'artificial';
  
  // Historical advantage
  home_advantage_factor: number; // 0-1 multiplier
  avg_attendance: number;
  weather_factor: 'indoor' | 'outdoor';
  
  // Recent conditions
  pitch_condition: 'excellent' | 'good' | 'poor';
  last_updated: string;
}

export interface MatchIntelligence {
  match_id: string;
  home_team_intel: TeamIntelligence;
  away_team_intel: TeamIntelligence;
  venue_intel: VenueIntelligence;
  
  // Head-to-head analysis
  head_to_head: {
    total_meetings: number;
    home_wins: number;
    away_wins: number;
    draws: number;
    last_meeting: string | null;
    avg_goals: number;
  };
  
  // Context factors
  context: {
    rivalry_factor: number; // 0-1
    importance_level: 'low' | 'medium' | 'high' | 'critical';
    media_attention: number; // 0-1
    betting_interest: number; // 0-1
  };
  
  enriched_at: string;
}

/**
 * Intelligence Module - Enriches matches with contextual data
 */
export class IntelligenceModule {
  private enrichmentQueue: string[] = [];
  private isProcessing = false;

  constructor() {
    this.setupEventHandlers();
  }

  /**
   * Setup event handlers
   */
  private setupEventHandlers(): void {
    // Listen for discovered matches
    eventBus.on('match.discovered', async (event) => {
      console.log(`[Intelligence] Queueing match for enrichment: ${event.data.match_id}`);
      this.queueForEnrichment(event.data.match_id);
    });
  }

  /**
   * Queue a match for intelligence enrichment
   */
  async queueForEnrichment(matchId: string): Promise<void> {
    if (!this.enrichmentQueue.includes(matchId)) {
      this.enrichmentQueue.push(matchId);
      console.log(`[Intelligence] Queued match ${matchId} for enrichment`);
    }

    // Start processing if not already running
    if (!this.isProcessing) {
      this.processEnrichmentQueue();
    }
  }

  /**
   * Process the enrichment queue
   */
  private async processEnrichmentQueue(): Promise<void> {
    if (this.isProcessing || this.enrichmentQueue.length === 0) {
      return;
    }

    this.isProcessing = true;
    console.log(`[Intelligence] Processing ${this.enrichmentQueue.length} matches for enrichment`);

    while (this.enrichmentQueue.length > 0) {
      const matchId = this.enrichmentQueue.shift()!;
      
      try {
        await this.enrichMatch(matchId);
        
        // Small delay to avoid overwhelming external APIs
        await new Promise(resolve => setTimeout(resolve, 2000));
        
      } catch (error) {
        console.error(`[Intelligence] Failed to enrich match ${matchId}:`, error);
        
        // Emit error event
        await emitEvent(
          'system.error',
          'intelligence-module',
          {
            match_id: matchId,
            error: error instanceof Error ? error.message : String(error),
            module: 'intelligence'
          }
        );
      }
    }

    this.isProcessing = false;
    console.log('[Intelligence] Finished processing enrichment queue');
  }

  /**
   * Enrich a single match with intelligence data
   */
  async enrichMatch(matchId: string): Promise<MatchIntelligence> {
    console.log(`[Intelligence] Enriching match ${matchId}...`);

    // Get match data from database
    const { data: match, error: matchError } = await supabase
      .from('matches')
      .select('*')
      .eq('id', matchId)
      .single();

    if (matchError || !match) {
      throw new Error(`Failed to get match data: ${matchError?.message}`);
    }

    // Enrich team data
    const homeTeamIntel = await this.enrichTeamData(match.home_team, match.league, 'home');
    const awayTeamIntel = await this.enrichTeamData(match.away_team, match.league, 'away');
    
    // Enrich venue data
    const venueIntel = await this.enrichVenueData(match.venue || `${match.home_team} Stadium`);
    
    // Generate head-to-head analysis
    const headToHead = await this.generateHeadToHeadAnalysis(match.home_team, match.away_team);
    
    // Analyze context factors
    const context = this.analyzeMatchContext(match, homeTeamIntel, awayTeamIntel);

    const matchIntelligence: MatchIntelligence = {
      match_id: matchId,
      home_team_intel: homeTeamIntel,
      away_team_intel: awayTeamIntel,
      venue_intel: venueIntel,
      head_to_head: headToHead,
      context,
      enriched_at: new Date().toISOString()
    };

    // Store enriched data in database
    await this.storeEnrichedData(matchId, matchIntelligence);

    // Emit enrichment completed event
    await emitEvent(
      'match.enriched',
      'intelligence-module',
      {
        match_id: matchId,
        team_data: {
          home_team: homeTeamIntel,
          away_team: awayTeamIntel
        },
        venue_data: venueIntel,
        historical_data: headToHead
      },
      `enrichment_${matchId}`
    );

    console.log(`[Intelligence] Successfully enriched match ${matchId}`);
    return matchIntelligence;
  }

  /**
   * Enrich team data with intelligence
   */
  private async enrichTeamData(teamName: string, league: string, homeAway: 'home' | 'away'): Promise<TeamIntelligence> {
    // For now, generate realistic mock data
    // In production, this would integrate with sports APIs
    
    const formResults: Array<'W' | 'L' | 'D'> = Array.from({ length: 5 }, () => 
      Math.random() > 0.6 ? 'W' : Math.random() > 0.5 ? 'D' : 'L'
    );

    const teamIntel: TeamIntelligence = {
      name: teamName,
      aliases: [teamName, teamName.split(' ')[0]], // Simple alias generation
      league,
      country: this.getCountryFromLeague(league),
      venue: `${teamName} Stadium`,
      capacity: Math.floor(Math.random() * 50000) + 20000,
      
      current_form: formResults,
      home_record: {
        wins: Math.floor(Math.random() * 15) + 5,
        draws: Math.floor(Math.random() * 8) + 2,
        losses: Math.floor(Math.random() * 10) + 1
      },
      away_record: {
        wins: Math.floor(Math.random() * 12) + 3,
        draws: Math.floor(Math.random() * 8) + 2,
        losses: Math.floor(Math.random() * 12) + 2
      },
      
      avg_goals_scored: Number((Math.random() * 2 + 0.8).toFixed(2)),
      avg_goals_conceded: Number((Math.random() * 1.5 + 0.5).toFixed(2)),
      clean_sheets: Math.floor(Math.random() * 12) + 3,
      
      key_players: [
        {
          name: `${teamName.split(' ')[0]} Star`,
          position: 'Forward',
          goals: Math.floor(Math.random() * 20) + 5,
          assists: Math.floor(Math.random() * 10) + 2
        }
      ],
      
      formation: ['4-3-3', '4-2-3-1', '3-5-2', '4-4-2'][Math.floor(Math.random() * 4)],
      style: ['attacking', 'defensive', 'balanced'][Math.floor(Math.random() * 3)] as any,
      
      sentiment_score: (Math.random() * 2 - 1), // -1 to 1
      last_updated: new Date().toISOString()
    };

    return teamIntel;
  }

  /**
   * Enrich venue data
   */
  private async enrichVenueData(venueName: string): Promise<VenueIntelligence> {
    // Mock venue data - in production, integrate with venue databases
    return {
      name: venueName,
      location: 'City, Country',
      capacity: Math.floor(Math.random() * 80000) + 20000,
      surface: Math.random() > 0.1 ? 'grass' : 'artificial',
      
      home_advantage_factor: Number((Math.random() * 0.3 + 0.7).toFixed(2)), // 0.7-1.0
      avg_attendance: Math.floor(Math.random() * 60000) + 15000,
      weather_factor: 'outdoor',
      
      pitch_condition: ['excellent', 'good', 'poor'][Math.floor(Math.random() * 3)] as any,
      last_updated: new Date().toISOString()
    };
  }

  /**
   * Generate head-to-head analysis
   */
  private async generateHeadToHeadAnalysis(homeTeam: string, awayTeam: string): Promise<any> {
    // Mock head-to-head data - in production, query historical match database
    const totalMeetings = Math.floor(Math.random() * 20) + 5;
    const homeWins = Math.floor(totalMeetings * (Math.random() * 0.4 + 0.3));
    const awayWins = Math.floor(totalMeetings * (Math.random() * 0.4 + 0.2));
    const draws = totalMeetings - homeWins - awayWins;

    return {
      total_meetings: totalMeetings,
      home_wins: homeWins,
      away_wins: awayWins,
      draws: Math.max(0, draws),
      last_meeting: Math.random() > 0.3 ? new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString() : null,
      avg_goals: Number((Math.random() * 2 + 1.5).toFixed(2))
    };
  }

  /**
   * Analyze match context factors
   */
  private analyzeMatchContext(match: any, homeTeam: TeamIntelligence, awayTeam: TeamIntelligence): any {
    // Calculate context factors
    const isRivalry = this.detectRivalry(homeTeam.name, awayTeam.name);
    const importance = this.calculateImportance(match.league, homeTeam, awayTeam);
    
    return {
      rivalry_factor: isRivalry ? 0.8 : 0.2,
      importance_level: importance,
      media_attention: Math.random() * 0.7 + 0.3,
      betting_interest: Math.random() * 0.8 + 0.2
    };
  }

  /**
   * Detect if teams are rivals
   */
  private detectRivalry(team1: string, team2: string): boolean {
    // Simple rivalry detection - in production, use rivalry database
    const rivalryPairs = [
      ['Arsenal', 'Tottenham'],
      ['Manchester United', 'Manchester City'],
      ['Liverpool', 'Everton'],
      ['Real Madrid', 'Barcelona']
    ];

    return rivalryPairs.some(pair =>
      (team1.includes(pair[0]) && team2.includes(pair[1])) ||
      (team1.includes(pair[1]) && team2.includes(pair[0]))
    );
  }

  /**
   * Calculate match importance
   */
  private calculateImportance(league: string, homeTeam: TeamIntelligence, awayTeam: TeamIntelligence): 'low' | 'medium' | 'high' | 'critical' {
    if (league.includes('Champions League')) return 'critical';
    if (league.includes('Premier League')) return 'high';
    if (league.includes('La Liga') || league.includes('Serie A')) return 'medium';
    return 'low';
  }

  /**
   * Get country from league name
   */
  private getCountryFromLeague(league: string): string {
    if (league.includes('Premier League')) return 'England';
    if (league.includes('La Liga')) return 'Spain';
    if (league.includes('Serie A')) return 'Italy';
    if (league.includes('Bundesliga')) return 'Germany';
    return 'Unknown';
  }

  /**
   * Store enriched data in database
   */
  private async storeEnrichedData(matchId: string, intelligence: MatchIntelligence): Promise<void> {
    const { error } = await supabase
      .from('matches')
      .update({
        intelligence_data: intelligence,
        analysis_status: 'enriched',
        updated_at: new Date().toISOString()
      })
      .eq('id', matchId);

    if (error) {
      throw new Error(`Failed to store enriched data: ${error.message}`);
    }
  }

  /**
   * Get intelligence statistics
   */
  async getStats(): Promise<{
    queue_size: number;
    is_processing: boolean;
    enriched_today: number;
    avg_enrichment_time: number;
  }> {
    const today = new Date().toISOString().split('T')[0];
    
    const { count: enrichedToday } = await supabase
      .from('matches')
      .select('*', { count: 'exact', head: true })
      .eq('analysis_status', 'enriched')
      .gte('updated_at', `${today}T00:00:00Z`);

    return {
      queue_size: this.enrichmentQueue.length,
      is_processing: this.isProcessing,
      enriched_today: enrichedToday || 0,
      avg_enrichment_time: 3.5 // seconds, mock value
    };
  }
}

// Export singleton instance
export const intelligenceModule = new IntelligenceModule();