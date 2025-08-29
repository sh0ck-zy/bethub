import { providerRegistry } from '../providers/registry';
import { supabase } from '../supabase';
import { randomUUID } from 'crypto';
import type { Match, DataProvider } from '../types';

/**
 * Data Sync Service - Fetches real sports data and syncs with database
 * Now uses provider registry for multi-source data providers
 */
export class DataSyncService {
  private getDataProvider(): DataProvider {
    const provider = providerRegistry.getDataProvider();
    if (!provider) {
      throw new Error('No data provider registered. Make sure providers are initialized.');
    }
    return provider;
  }

  /**
   * Sync today's matches from Football-Data.org to our database
   */
  async syncTodaysMatches(): Promise<{ success: boolean; matchesAdded: number; error?: string }> {
    try {
      console.log('🔄 Starting data sync for today\'s matches...');
      
      // Fetch today's matches from data provider
      const realMatches = await this.getDataProvider().getMatches(new Date());
      
      if (realMatches.length === 0) {
        console.log('📅 No matches found for today');
        return { success: true, matchesAdded: 0 };
      }

      console.log(`📊 Found ${realMatches.length} matches from Football-Data.org`);

      // Transform and insert matches into our database
      const matchesToInsert = realMatches.map((match: any) => ({
        id: randomUUID(), // Generate proper UUID
        league: match.league,
        home_team: match.home_team,
        away_team: match.away_team,
        kickoff_utc: match.kickoff_utc,
        status: match.status,
        is_published: true, // Auto-publish real matches
        analysis_status: 'none',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));

      // Upsert matches (insert or update if exists)
      const { data, error } = await supabase
        .from('matches')
        .upsert(matchesToInsert, { 
          onConflict: 'id',
          ignoreDuplicates: false 
        });

      if (error) {
        console.error('❌ Database error:', error);
        return { success: false, matchesAdded: 0, error: error.message };
      }

      console.log(`✅ Successfully synced ${matchesToInsert.length} matches to database`);
      return { success: true, matchesAdded: matchesToInsert.length };

    } catch (error: any) {
      console.error('❌ Data sync failed:', error);
      return { success: false, matchesAdded: 0, error: error.message };
    }
  }

  /**
   * Sync matches for a specific date range
   */
  async syncMatchesForDateRange(startDate: Date, endDate: Date): Promise<{ success: boolean; matchesAdded: number; error?: string }> {
    try {
      console.log(`🔄 Syncing matches from ${startDate.toDateString()} to ${endDate.toDateString()}...`);
      
      let totalMatches = 0;
      const currentDate = new Date(startDate);

      while (currentDate <= endDate) {
        try {
          const dayMatches = await this.getDataProvider().getMatches(currentDate);
          
          if (dayMatches.length > 0) {
            const matchesToInsert = dayMatches.map((match: any) => ({
              id: randomUUID(), // Generate proper UUID
              league: match.league,
              home_team: match.home_team,
              away_team: match.away_team,
              kickoff_utc: match.kickoff_utc,
              status: match.status,
              is_published: true,
              analysis_status: 'none',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }));

            const { error } = await supabase
              .from('matches')
              .upsert(matchesToInsert, { onConflict: 'id' });

            if (error) {
              console.error(`❌ Error syncing matches for ${currentDate.toDateString()}:`, error);
            } else {
              totalMatches += matchesToInsert.length;
              console.log(`✅ Synced ${matchesToInsert.length} matches for ${currentDate.toDateString()}`);
            }
          }

          // Add delay to respect rate limits (Football-Data.org: 10 requests per minute)
          await new Promise(resolve => setTimeout(resolve, 7000)); // 7 second delay

        } catch (error) {
          console.error(`❌ Error fetching matches for ${currentDate.toDateString()}:`, error);
        }

        currentDate.setDate(currentDate.getDate() + 1);
      }

      return { success: true, matchesAdded: totalMatches };

    } catch (error: any) {
      console.error('❌ Date range sync failed:', error);
      return { success: false, matchesAdded: 0, error: error.message };
    }
  }

  /**
   * Update live match scores
   */
  async updateLiveScores(): Promise<{ success: boolean; matchesUpdated: number; error?: string }> {
    try {
      console.log('🔄 Updating live match scores...');

      // Get live matches from our database
      const { data: liveMatches, error: dbError } = await supabase
        .from('matches')
        .select('id')
        .eq('status', 'LIVE')
        .eq('is_published', true);

      if (dbError) {
        return { success: false, matchesUpdated: 0, error: dbError.message };
      }

      if (!liveMatches || liveMatches.length === 0) {
        console.log('📺 No live matches to update');
        return { success: true, matchesUpdated: 0 };
      }

      let updatedCount = 0;

      for (const match of liveMatches) {
        try {
          // Extract the original match ID (remove our 'fd_' prefix)
          const originalId = match.id.replace('fd_', '');
          
          // Fetch updated data from data provider
          const updatedMatch = await this.getDataProvider().getLiveScore(originalId);
          
          // Update in our database
          const { error: updateError } = await supabase
            .from('matches')
            .update({
              status: updatedMatch.status,
              home_score: updatedMatch.home_score,
              away_score: updatedMatch.away_score,
              current_minute: updatedMatch.current_minute,
              updated_at: new Date().toISOString(),
            })
            .eq('id', match.id);

          if (updateError) {
            console.error(`❌ Error updating match ${match.id}:`, updateError);
          } else {
            updatedCount++;
            console.log(`✅ Updated match ${match.id}`);
          }

          // Rate limit delay
          await new Promise(resolve => setTimeout(resolve, 6000));

        } catch (error) {
          console.error(`❌ Error updating match ${match.id}:`, error);
        }
      }

      return { success: true, matchesUpdated: updatedCount };

    } catch (error: any) {
      console.error('❌ Live score update failed:', error);
      return { success: false, matchesUpdated: 0, error: error.message };
    }
  }

  /**
   * Get sync status and statistics
   */
  async getSyncStatus(): Promise<{
    totalMatches: number;
    liveMatches: number;
    todaysMatches: number;
    lastSyncTime?: string;
  }> {
    try {
      const { count: totalMatches } = await supabase
        .from('matches')
        .select('*', { count: 'exact', head: true })
        .eq('is_published', true);

      const { count: liveMatches } = await supabase
        .from('matches')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'LIVE')
        .eq('is_published', true);

      const today = new Date().toISOString().split('T')[0];
      const { count: todaysMatches } = await supabase
        .from('matches')
        .select('*', { count: 'exact', head: true })
        .gte('kickoff_utc', `${today}T00:00:00Z`)
        .lte('kickoff_utc', `${today}T23:59:59Z`)
        .eq('is_published', true);

      const { data: lastSync } = await supabase
        .from('matches')
        .select('updated_at')
        .eq('is_published', true)
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();

      return {
        totalMatches: totalMatches || 0,
        liveMatches: liveMatches || 0,
        todaysMatches: todaysMatches || 0,
        lastSyncTime: lastSync?.updated_at,
      };

    } catch (error) {
      console.error('❌ Error getting sync status:', error);
      return {
        totalMatches: 0,
        liveMatches: 0,
        todaysMatches: 0,
      };
    }
  }

  /**
   * Clean up old matches (optional - for database maintenance)
   */
  async cleanupOldMatches(daysToKeep: number = 30): Promise<{ success: boolean; matchesDeleted: number }> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      const { data, error } = await supabase
        .from('matches')
        .delete()
        .lt('kickoff_utc', cutoffDate.toISOString())
        .eq('status', 'FT');

      if (error) {
        console.error('❌ Cleanup error:', error);
        return { success: false, matchesDeleted: 0 };
      }

      const deletedCount = Array.isArray(data) ? (data as any[]).length : 0;
      console.log(`🧹 Cleaned up ${deletedCount} old matches`);
      
      return { success: true, matchesDeleted: deletedCount };

    } catch (error) {
      console.error('❌ Cleanup failed:', error);
      return { success: false, matchesDeleted: 0 };
    }
  }
}

// Export singleton instance
export const dataSyncService = new DataSyncService(); 