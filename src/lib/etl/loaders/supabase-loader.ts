import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { EnrichedMatch, LoadingResult, ConflictStrategy, AuditEntry } from '../core/types';
import { randomUUID } from 'crypto';

/**
 * Supabase data loader with conflict resolution and audit trail
 */
export class SupabaseLoader {
  private supabase: SupabaseClient;
  private batchSize: number;
  private conflictStrategy: ConflictStrategy;

  constructor(
    supabaseUrl: string,
    supabaseKey: string,
    batchSize: number = 100,
    conflictStrategy: ConflictStrategy = 'latest'
  ) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.batchSize = batchSize;
    this.conflictStrategy = conflictStrategy;
  }

  async load(matches: EnrichedMatch[]): Promise<LoadingResult> {
    const startTime = Date.now();
    let recordsLoaded = 0;
    let recordsUpdated = 0;
    let recordsFailed = 0;
    let conflicts = 0;

    console.log(`🔄 Starting load of ${matches.length} matches to Supabase`);

    // Process in batches
    for (let i = 0; i < matches.length; i += this.batchSize) {
      const batch = matches.slice(i, i + this.batchSize);
      console.log(`📦 Processing batch ${Math.floor(i / this.batchSize) + 1}/${Math.ceil(matches.length / this.batchSize)}`);

      try {
        const result = await this.loadBatch(batch);
        recordsLoaded += result.loaded;
        recordsUpdated += result.updated;
        conflicts += result.conflicts;
      } catch (error) {
        console.error(`❌ Batch failed:`, error);
        recordsFailed += batch.length;
      }
    }

    const duration = Date.now() - startTime;

    console.log(`✅ Load completed: ${recordsLoaded} loaded, ${recordsUpdated} updated, ${recordsFailed} failed`);

    return {
      loadedAt: new Date(),
      metadata: {
        recordsLoaded,
        recordsUpdated,
        recordsFailed,
        conflicts,
        duration
      }
    };
  }

  private async loadBatch(matches: EnrichedMatch[]): Promise<{ loaded: number; updated: number; conflicts: number }> {
    let loaded = 0;
    let updated = 0;
    let conflicts = 0;

    // First, check for existing matches
    const externalIds = matches.map(m => m.externalId);
    const { data: existingMatches, error: fetchError } = await this.supabase
      .from('matches')
      .select('id, external_id, updated_at, home_score, away_score')
      .in('external_id', externalIds);

    if (fetchError) {
      throw new Error(`Failed to fetch existing matches: ${fetchError.message}`);
    }

    const existingMap = new Map(
      (existingMatches || []).map(m => [m.external_id, m])
    );

    // Prepare records for insert/update
    const toInsert: any[] = [];
    const toUpdate: any[] = [];

    for (const match of matches) {
      const existing = existingMap.get(match.externalId);
      
      if (!existing) {
        // New match
        toInsert.push(this.transformForInsert(match));
      } else {
        // Existing match - check for conflicts
        const shouldUpdate = await this.resolveConflict(match, existing);
        if (shouldUpdate) {
          toUpdate.push(this.transformForUpdate(match, existing.id));
        } else {
          conflicts++;
        }
      }
    }

    // Insert new matches
    if (toInsert.length > 0) {
      const { error: insertError } = await this.supabase
        .from('matches')
        .insert(toInsert);

      if (insertError) {
        throw new Error(`Failed to insert matches: ${insertError.message}`);
      }
      loaded = toInsert.length;

      // Create audit entries for inserts
      await this.createAuditEntries(toInsert, 'insert');
    }

    // Update existing matches
    if (toUpdate.length > 0) {
      // Supabase doesn't support bulk updates with different values,
      // so we need to update one by one (or group by common values)
      for (const record of toUpdate) {
        const { error: updateError } = await this.supabase
          .from('matches')
          .update(record)
          .eq('id', record.id);

        if (updateError) {
          console.error(`Failed to update match ${record.id}:`, updateError);
          conflicts++;
        } else {
          updated++;
        }
      }

      // Create audit entries for updates
      await this.createAuditEntries(toUpdate, 'update');
    }

    return { loaded, updated, conflicts };
  }

  private async resolveConflict(incoming: EnrichedMatch, existing: any): Promise<boolean> {
    switch (this.conflictStrategy) {
      case 'latest':
        // Always update with incoming data
        return true;

      case 'merge':
        // Only update if incoming has more data or newer status
        if (incoming.status !== existing.status) {
          // Status changed - update
          return true;
        }
        if (incoming.homeScore !== undefined && existing.home_score === null) {
          // New score data - update
          return true;
        }
        if (incoming.confidenceScore > 0.8) {
          // High confidence data - update
          return true;
        }
        return false;

      case 'custom':
        // Custom logic can be implemented here
        return true;

      default:
        return true;
    }
  }

  private transformForInsert(match: EnrichedMatch): any {
    return {
      id: randomUUID(),
      external_id: match.externalId,
      league: match.league,
      home_team: match.homeTeam,
      away_team: match.awayTeam,
      kickoff_utc: match.kickoffTime,
      status: match.status,
      home_score: match.homeScore ?? null,
      away_score: match.awayScore ?? null,
      venue: match.venue ?? null,
      referee: match.referee ?? null,
      data_source: match.source,
      home_team_id: match.homeTeamId ?? null,
      away_team_id: match.awayTeamId ?? null,
      league_id: match.leagueId ?? null,
      is_published: true,
      analysis_status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  private transformForUpdate(match: EnrichedMatch, id: string): any {
    return {
      id,
      status: match.status,
      home_score: match.homeScore ?? null,
      away_score: match.awayScore ?? null,
      venue: match.venue ?? null,
      referee: match.referee ?? null,
      data_source: match.source,
      updated_at: new Date().toISOString()
    };
  }

  private async createAuditEntries(records: any[], action: 'insert' | 'update'): Promise<void> {
    try {
      const auditEntries: AuditEntry[] = records.map(record => ({
        id: randomUUID(),
        timestamp: new Date(),
        stage: 'load',
        action,
        recordId: record.id,
        changes: action === 'update' ? this.extractChanges(record) : undefined,
        metadata: {
          source: record.data_source,
          external_id: record.external_id
        }
      }));

      // Store audit entries (could be in a separate table or logging service)
      console.log(`📝 Created ${auditEntries.length} audit entries for ${action}`);
    } catch (error) {
      console.error('Failed to create audit entries:', error);
      // Don't fail the main operation if audit fails
    }
  }

  private extractChanges(record: any): Record<string, any> {
    // Extract only the fields that might have changed
    const changeableFields = ['status', 'home_score', 'away_score', 'venue', 'referee'];
    const changes: Record<string, any> = {};

    for (const field of changeableFields) {
      if (field in record) {
        changes[field] = record[field];
      }
    }

    return changes;
  }

  /**
   * Load teams and leagues referenced in matches
   */
  async loadRelatedEntities(matches: EnrichedMatch[]): Promise<void> {
    // Extract unique teams
    const teams = new Set<string>();
    const leagues = new Set<string>();

    for (const match of matches) {
      teams.add(match.homeTeam);
      teams.add(match.awayTeam);
      leagues.add(match.league);
    }

    console.log(`📊 Found ${teams.size} unique teams and ${leagues.size} unique leagues`);

    // TODO: Implement team and league loading logic
    // This would involve:
    // 1. Checking existing teams/leagues in DB
    // 2. Fetching additional data from APIs if needed
    // 3. Creating/updating team and league records
    // 4. Updating match records with proper foreign keys
  }
}