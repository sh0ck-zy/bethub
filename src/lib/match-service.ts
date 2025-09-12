// Robust match service for multi-source data aggregation and deduplication
import { createClient } from '@supabase/supabase-js';
import { DatabaseMatch, FootballDataMatch, DataSourceMapper, MatchValidator } from './database-schema';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export class MatchService {
  private supabase = createClient(supabaseUrl, supabaseKey);
  
  /**
   * Safely upsert matches with deduplication logic
   */
  async upsertMatches(matches: FootballDataMatch[]): Promise<{ 
    success: boolean; 
    inserted: number; 
    updated: number; 
    skipped: number; 
    errors: string[] 
  }> {
    const results = {
      success: true,
      inserted: 0,
      updated: 0,
      skipped: 0,
      errors: [] as string[]
    };
    
    console.log(`🔄 Processing ${matches.length} matches for upsert...`);
    
    for (const externalMatch of matches) {
      try {
        // Transform external match to database format
        const matchData = DataSourceMapper.fromFootballData(externalMatch);
        
        // Validate the match data
        const validation = MatchValidator.validateMatch(matchData);
        if (!validation.valid) {
          results.errors.push(`Invalid match data: ${validation.errors.join(', ')}`);
          results.skipped++;
          continue;
        }
        
        // Check for existing match using multiple strategies
        const existingMatch = await this.findExistingMatch(matchData);
        
        if (existingMatch) {
          // Update existing match with merged data
          const mergedData = DataSourceMapper.mergeMatchData(existingMatch, matchData);
          
          const { error: updateError } = await this.supabase
            .from('matches')
            .update(mergedData)
            .eq('id', existingMatch.id);
          
          if (updateError) {
            results.errors.push(`Update failed for match ${matchData.home_team} vs ${matchData.away_team}: ${updateError.message}`);
            results.skipped++;
          } else {
            results.updated++;
            console.log(`✅ Updated: ${matchData.home_team} vs ${matchData.away_team}`);
          }
        } else {
          // Insert new match
          const newMatch: DatabaseMatch = {
            id: crypto.randomUUID(),
            ...matchData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          
          const { error: insertError } = await this.supabase
            .from('matches')
            .insert(newMatch);
          
          if (insertError) {
            results.errors.push(`Insert failed for match ${matchData.home_team} vs ${matchData.away_team}: ${insertError.message}`);
            results.skipped++;
          } else {
            results.inserted++;
            console.log(`✅ Inserted: ${matchData.home_team} vs ${matchData.away_team}`);
          }
        }
        
        // Small delay to avoid overwhelming the database
        await new Promise(resolve => setTimeout(resolve, 50));
        
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        results.errors.push(`Processing failed for match: ${errorMessage}`);
        results.skipped++;
      }
    }
    
    results.success = results.errors.length === 0;
    
    console.log(`📊 Upsert results: ${results.inserted} inserted, ${results.updated} updated, ${results.skipped} skipped`);
    if (results.errors.length > 0) {
      console.log(`❌ Errors: ${results.errors.length}`);
    }
    
    return results;
  }
  
  /**
   * Find existing match using multiple strategies to prevent duplicates
   */
  private async findExistingMatch(matchData: Omit<DatabaseMatch, 'id' | 'created_at' | 'updated_at'>): Promise<DatabaseMatch | null> {
    // Strategy 1: Exact external_id + data_source match
    if (matchData.external_id && matchData.data_source) {
      const { data: exactMatch } = await this.supabase
        .from('matches')
        .select('*')
        .eq('external_id', matchData.external_id)
        .eq('data_source', matchData.data_source)
        .single();
      
      if (exactMatch) {
        return exactMatch;
      }
    }
    
    // Strategy 2: Find by match characteristics (teams + date + competition)
    const matchDate = new Date(matchData.kickoff_utc);
    const dayStart = new Date(matchDate);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(matchDate);
    dayEnd.setHours(23, 59, 59, 999);
    
    const { data: similarMatches } = await this.supabase
      .from('matches')
      .select('*')
      .eq('home_team', matchData.home_team)
      .eq('away_team', matchData.away_team)
      .gte('kickoff_utc', dayStart.toISOString())
      .lte('kickoff_utc', dayEnd.toISOString());
    
    if (similarMatches && similarMatches.length > 0) {
      // If competition_id matches, it's definitely the same match
      if (matchData.competition_id) {
        const exactCompetitionMatch = similarMatches.find(
          m => m.competition_id === matchData.competition_id
        );
        if (exactCompetitionMatch) {
          return exactCompetitionMatch;
        }
      }
      
      // Return first similar match (same teams, same day)
      return similarMatches[0];
    }
    
    return null;
  }
  
  /**
   * Get all matches with optional filtering
   */
  async getMatches(filters?: {
    published?: boolean;
    league?: string;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
    limit?: number;
  }): Promise<DatabaseMatch[]> {
    let query = this.supabase
      .from('matches')
      .select('*')
      .order('kickoff_utc', { ascending: true });
    
    if (filters?.published !== undefined) {
      query = query.eq('is_published', filters.published);
    }
    
    if (filters?.league) {
      query = query.eq('league', filters.league);
    }
    
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    
    if (filters?.dateFrom) {
      query = query.gte('kickoff_utc', filters.dateFrom);
    }
    
    if (filters?.dateTo) {
      query = query.lte('kickoff_utc', filters.dateTo);
    }
    
    if (filters?.limit) {
      query = query.limit(filters.limit);
    }
    
    const { data: matches, error } = await query;
    
    if (error) {
      console.error('Error fetching matches:', error);
      throw error;
    }
    
    return matches || [];
  }
  
  /**
   * Get match statistics and metadata
   */
  async getMatchStats(): Promise<{
    total: number;
    published: number;
    unpublished: number;
    analyzed: number;
    byDataSource: Record<string, number>;
    byStatus: Record<string, number>;
    byLeague: Record<string, number>;
  }> {
    const { data: matches, error } = await this.supabase
      .from('matches')
      .select('*');
    
    if (error) {
      throw error;
    }
    
    const allMatches = matches || [];
    
    const stats = {
      total: allMatches.length,
      published: allMatches.filter(m => m.is_published).length,
      unpublished: allMatches.filter(m => !m.is_published).length,
      analyzed: allMatches.filter(m => m.is_analyzed).length,
      byDataSource: {} as Record<string, number>,
      byStatus: {} as Record<string, number>,
      byLeague: {} as Record<string, number>,
    };
    
    // Count by data source
    allMatches.forEach(match => {
      stats.byDataSource[match.data_source] = (stats.byDataSource[match.data_source] || 0) + 1;
      stats.byStatus[match.status] = (stats.byStatus[match.status] || 0) + 1;
      stats.byLeague[match.league] = (stats.byLeague[match.league] || 0) + 1;
    });
    
    return stats;
  }
  
  /**
   * Clean up duplicate matches (safe operation)
   */
  async cleanupDuplicates(): Promise<{ removed: number; errors: string[] }> {
    const results = { removed: 0, errors: [] as string[] };
    
    try {
      const allMatches = await this.getMatches();
      const matchGroups = new Map<string, DatabaseMatch[]>();
      
      // Group matches by their unique key
      allMatches.forEach(match => {
        const key = DataSourceMapper.generateMatchKey(match);
        if (!matchGroups.has(key)) {
          matchGroups.set(key, []);
        }
        matchGroups.get(key)!.push(match);
      });
      
      // Find and remove duplicates
      for (const [key, matches] of matchGroups) {
        if (matches.length > 1) {
          // Sort by data source priority and creation date
          const dataSourcePriority = ['football-data', 'sports-db', 'multi-source', 'manual', 'internal'];
          matches.sort((a, b) => {
            const aPriority = dataSourcePriority.indexOf(a.data_source);
            const bPriority = dataSourcePriority.indexOf(b.data_source);
            if (aPriority !== bPriority) {
              return aPriority - bPriority;
            }
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          });
          
          // Keep the best match, remove the rest
          const keepMatch = matches[0];
          const removeMatches = matches.slice(1);
          
          for (const match of removeMatches) {
            const { error } = await this.supabase
              .from('matches')
              .delete()
              .eq('id', match.id);
            
            if (error) {
              results.errors.push(`Failed to remove duplicate match ${match.id}: ${error.message}`);
            } else {
              results.removed++;
              console.log(`🗑️ Removed duplicate: ${match.home_team} vs ${match.away_team}`);
            }
          }
        }
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      results.errors.push(`Cleanup failed: ${errorMessage}`);
    }
    
    return results;
  }
}

// Export a singleton instance
export const matchService = new MatchService();