import { footballAPI, type FootballMatch } from './football';
import { supabase } from '../supabase';

interface SyncResult {
  success: boolean;
  matchesAdded: number;
  matchesUpdated: number;
  matchesDeleted: number;
  error?: string;
}

interface SyncOptions {
  force?: boolean;
  dryRun?: boolean;
  logProgress?: boolean;
}

class DataSyncService {
  private isRunning = false;
  private lastSyncTime: Date | null = null;

  // Sync today's matches with database
  async syncTodayMatches(options: SyncOptions = {}): Promise<SyncResult> {
    if (this.isRunning) {
      return {
        success: false,
        matchesAdded: 0,
        matchesUpdated: 0,
        matchesDeleted: 0,
        error: 'Sync already in progress'
      };
    }

    this.isRunning = true;
    const startTime = Date.now();

    try {
      if (options.logProgress) {
        console.log('[Data Sync] Starting today matches sync...');
      }

      // Fetch matches from football API
      const apiResponse = await footballAPI.getTodayMatches();
      
      if (!apiResponse.success || !apiResponse.data) {
        throw new Error(apiResponse.error || 'Failed to fetch matches from API');
      }

      const apiMatches = apiResponse.data as FootballMatch[];
      
      if (options.logProgress) {
        console.log(`[Data Sync] Fetched ${apiMatches.length} matches from API`);
      }

      if (options.dryRun) {
        return {
          success: true,
          matchesAdded: apiMatches.length,
          matchesUpdated: 0,
          matchesDeleted: 0
        };
      }

      // Get existing matches from database
      const { data: existingMatches, error: fetchError } = await supabase
        .from('matches')
        .select('id, home_team, away_team, kickoff_utc, status, is_published, analysis_status')
        .gte('kickoff_utc', new Date().toISOString().split('T')[0]);

      if (fetchError) {
        throw new Error(`Database fetch error: ${fetchError.message}`);
      }

      const existingMatchesMap = new Map(
        existingMatches?.map(match => [match.id, match]) || []
      );

      let matchesAdded = 0;
      let matchesUpdated = 0;
      let matchesDeleted = 0;

      // Process each API match
      for (const apiMatch of apiMatches) {
        const matchData = this.transformAPIMatchToDB(apiMatch);
        
        if (existingMatchesMap.has(apiMatch.id)) {
          // Update existing match
          const existingMatch = existingMatchesMap.get(apiMatch.id)!;
          const needsUpdate = this.matchNeedsUpdate(existingMatch, matchData);
          
          if (needsUpdate) {
            const { error: updateError } = await supabase
              .from('matches')
              .update(matchData)
              .eq('id', apiMatch.id);

            if (updateError) {
              console.error(`[Data Sync] Error updating match ${apiMatch.id}:`, updateError);
            } else {
              matchesUpdated++;
              if (options.logProgress) {
                console.log(`[Data Sync] Updated match: ${matchData.home_team} vs ${matchData.away_team}`);
              }
            }
          }
        } else {
          // Insert new match
          const { error: insertError } = await supabase
            .from('matches')
            .insert(matchData);

          if (insertError) {
            console.error(`[Data Sync] Error inserting match ${apiMatch.id}:`, insertError);
          } else {
            matchesAdded++;
            if (options.logProgress) {
              console.log(`[Data Sync] Added match: ${matchData.home_team} vs ${matchData.away_team}`);
            }
          }
        }
      }

      // Handle deleted matches (matches in DB but not in API)
      if (options.force) {
        const apiMatchIds = new Set(apiMatches.map(m => m.id));
        const matchesToDelete = existingMatches?.filter(m => !apiMatchIds.has(m.id)) || [];

        for (const matchToDelete of matchesToDelete) {
          const { error: deleteError } = await supabase
            .from('matches')
            .delete()
            .eq('id', matchToDelete.id);

          if (deleteError) {
            console.error(`[Data Sync] Error deleting match ${matchToDelete.id}:`, deleteError);
          } else {
            matchesDeleted++;
            if (options.logProgress) {
              console.log(`[Data Sync] Deleted match: ${matchToDelete.home_team} vs ${matchToDelete.away_team}`);
            }
          }
        }
      }

      this.lastSyncTime = new Date();
      const duration = Date.now() - startTime;

      if (options.logProgress) {
        console.log(`[Data Sync] Sync completed in ${duration}ms`);
        console.log(`[Data Sync] Added: ${matchesAdded}, Updated: ${matchesUpdated}, Deleted: ${matchesDeleted}`);
      }

      return {
        success: true,
        matchesAdded,
        matchesUpdated,
        matchesDeleted
      };

    } catch (error) {
      console.error('[Data Sync] Sync failed:', error);
      return {
        success: false,
        matchesAdded: 0,
        matchesUpdated: 0,
        matchesDeleted: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    } finally {
      this.isRunning = false;
    }
  }

  // Transform API match data to database format
  private transformAPIMatchToDB(apiMatch: FootballMatch) {
    return {
      id: apiMatch.id,
      league: apiMatch.competition.name,
      home_team: apiMatch.homeTeam.name,
      away_team: apiMatch.awayTeam.name,
      kickoff_utc: apiMatch.date,
      status: apiMatch.status,
      is_published: false, // Default to unpublished
      analysis_status: 'none' as const, // Default to no analysis
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      // Additional metadata
      home_team_id: apiMatch.homeTeam.id,
      away_team_id: apiMatch.awayTeam.id,
      competition_id: apiMatch.competition.id,
      country: apiMatch.competition.country,
      score_home: apiMatch.score?.fullTime?.home || null,
      score_away: apiMatch.score?.fullTime?.away || null,
    };
  }

  // Check if a match needs to be updated
  private matchNeedsUpdate(existingMatch: any, newData: any): boolean {
    const fieldsToCheck = [
      'status',
      'score_home',
      'score_away',
      'updated_at'
    ];

    return fieldsToCheck.some(field => existingMatch[field] !== newData[field]);
  }

  // Sync specific match details
  async syncMatchDetails(matchId: string): Promise<boolean> {
    try {
      const apiResponse = await footballAPI.getMatchDetails(matchId);
      
      if (!apiResponse.success || !apiResponse.data) {
        console.error(`[Data Sync] Failed to fetch match details for ${matchId}:`, apiResponse.error);
        return false;
      }

      const matchData = apiResponse.data;
      
      // Update match with additional details
      const { error } = await supabase
        .from('matches')
        .update({
          status: matchData.status,
          score_home: matchData.score?.fullTime?.home || null,
          score_away: matchData.score?.fullTime?.away || null,
          updated_at: new Date().toISOString(),
          // Store additional data as JSON
          events: matchData.events ? JSON.stringify(matchData.events) : null,
          statistics: matchData.statistics ? JSON.stringify(matchData.statistics) : null,
        })
        .eq('id', matchId);

      if (error) {
        console.error(`[Data Sync] Error updating match details for ${matchId}:`, error);
        return false;
      }

      return true;
    } catch (error) {
      console.error(`[Data Sync] Error syncing match details for ${matchId}:`, error);
      return false;
    }
  }

  // Get sync status
  getSyncStatus() {
    return {
      isRunning: this.isRunning,
      lastSyncTime: this.lastSyncTime,
    };
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      // Check football API health
      const apiHealth = await footballAPI.checkHealth();
      
      // Check database connection
      const { error } = await supabase
        .from('matches')
        .select('id')
        .limit(1);

      return apiHealth && !error;
    } catch (error) {
      console.error('[Data Sync] Health check failed:', error);
      return false;
    }
  }

  // Clean up old matches (older than 7 days)
  async cleanupOldMatches(): Promise<number> {
    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data, error } = await supabase
        .from('matches')
        .delete()
        .lt('kickoff_utc', sevenDaysAgo.toISOString())
        .select('id');

      if (error) {
        console.error('[Data Sync] Error cleaning up old matches:', error);
        return 0;
      }

      const deletedCount = data?.length || 0;
      console.log(`[Data Sync] Cleaned up ${deletedCount} old matches`);
      
      return deletedCount;
    } catch (error) {
      console.error('[Data Sync] Error in cleanup:', error);
      return 0;
    }
  }
}

// Export singleton instance
export const dataSync = new DataSyncService();
export type { SyncResult, SyncOptions }; 