// Fallback match service that works with basic schema
// This service gracefully handles missing columns until migration is applied
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export interface BasicMatch {
  id: string;
  league: string;
  home_team: string;
  away_team: string;
  kickoff_utc: string;
  status: string;
}

export interface FootballDataMatch {
  id: number;
  utcDate: string;
  status: string;
  homeTeam: { name: string; crest?: string };
  awayTeam: { name: string; crest?: string };
  competition: { name: string; id: number; emblem?: string };
  score?: {
    fullTime?: { home?: number; away?: number };
  };
  venue?: string;
  referees?: Array<{ name: string }>;
}

export class FallbackMatchService {
  private supabase = createClient(supabaseUrl, supabaseKey);

  /**
   * Get available columns in the matches table
   */
  private async getAvailableColumns(): Promise<string[]> {
    try {
      // Start with basic required columns that should always exist
      const basicColumns = ['id', 'league', 'home_team', 'away_team', 'kickoff_utc', 'status'];
      const availableColumns = [...basicColumns];
      
      // Test each optional column individually
      const optionalColumns = [
        'venue', 'referee', 'home_score', 'away_score', 'competition_id',
        'external_id', 'data_source', 'home_team_logo', 'away_team_logo',
        'is_published', 'is_analyzed', 'created_at', 'updated_at', 'season',
        'matchday', 'stage', 'group_name', 'league_logo', 'is_pulled',
        'analysis_status', 'analysis_priority', 'current_minute'
      ];

      for (const column of optionalColumns) {
        try {
          const { error } = await this.supabase
            .from('matches')
            .select(column)
            .limit(1)
            .single();
          
          // If no error (or just "no rows" error), column exists
          if (!error || !error.message.includes('column')) {
            availableColumns.push(column);
            console.log(`✅ Column ${column} available`);
          }
        } catch (error: any) {
          if (error.message && error.message.includes('column')) {
            console.log(`❌ Column ${column} not available`);
          } else {
            // Assume column exists if it's not a column error
            availableColumns.push(column);
          }
        }
      }

      console.log(`📋 Total available columns: ${availableColumns.length}`);
      return availableColumns;
    } catch (error) {
      console.log('⚠️ Error detecting columns, using basic fallback');
      return ['id', 'league', 'home_team', 'away_team', 'kickoff_utc', 'status'];
    }
  }

  /**
   * Transform external match to basic format with available columns
   */
  private transformMatchSafely(match: FootballDataMatch, availableColumns: string[]): any {
    const statusMap: Record<string, string> = {
      'SCHEDULED': 'PRE',
      'TIMED': 'PRE', 
      'IN_PLAY': 'LIVE',
      'PAUSED': 'LIVE',
      'FINISHED': 'FT',
      'POSTPONED': 'POSTPONED',
      'CANCELLED': 'CANCELLED'
    };

    // Always include basic required fields
    const basicMatch: any = {
      id: crypto.randomUUID(),
      league: match.competition.name,
      home_team: match.homeTeam.name,
      away_team: match.awayTeam.name,
      kickoff_utc: match.utcDate,
      status: statusMap[match.status] || 'PRE'
    };

    // Add optional fields if columns exist
    if (availableColumns.includes('external_id')) {
      basicMatch.external_id = match.id.toString();
    }
    if (availableColumns.includes('competition_id')) {
      basicMatch.competition_id = match.competition.id.toString();
    }
    if (availableColumns.includes('data_source')) {
      basicMatch.data_source = 'football-data';
    }
    if (availableColumns.includes('venue')) {
      basicMatch.venue = match.venue || null;
    }
    if (availableColumns.includes('referee')) {
      basicMatch.referee = match.referees?.[0]?.name || null;
    }
    if (availableColumns.includes('home_score')) {
      basicMatch.home_score = match.score?.fullTime?.home || null;
    }
    if (availableColumns.includes('away_score')) {
      basicMatch.away_score = match.score?.fullTime?.away || null;
    }
    if (availableColumns.includes('home_team_logo')) {
      basicMatch.home_team_logo = match.homeTeam.crest || null;
    }
    if (availableColumns.includes('away_team_logo')) {
      basicMatch.away_team_logo = match.awayTeam.crest || null;
    }
    if (availableColumns.includes('is_published')) {
      basicMatch.is_published = false; // All new matches start unpublished
    }
    if (availableColumns.includes('is_analyzed')) {
      basicMatch.is_analyzed = false;
    }
    if (availableColumns.includes('created_at')) {
      basicMatch.created_at = new Date().toISOString();
    }
    if (availableColumns.includes('updated_at')) {
      basicMatch.updated_at = new Date().toISOString();
    }

    return basicMatch;
  }

  /**
   * Find existing match using available columns
   */
  private async findExistingMatchSafely(match: any, availableColumns: string[]): Promise<any> {
    try {
      // Strategy 1: Use external_id if available
      if (availableColumns.includes('external_id') && match.external_id) {
        const { data } = await this.supabase
          .from('matches')
          .select('*')
          .eq('external_id', match.external_id)
          .single();
        if (data) return data;
      }

      // Strategy 2: Use team names and date (basic deduplication)
      const matchDate = new Date(match.kickoff_utc);
      const dayStart = new Date(matchDate);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(matchDate);
      dayEnd.setHours(23, 59, 59, 999);

      const { data } = await this.supabase
        .from('matches')
        .select('*')
        .eq('home_team', match.home_team)
        .eq('away_team', match.away_team)
        .gte('kickoff_utc', dayStart.toISOString())
        .lte('kickoff_utc', dayEnd.toISOString())
        .limit(1);

      return data?.[0] || null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Safely insert or update matches
   */
  async upsertMatchesSafely(matches: FootballDataMatch[]): Promise<{
    success: boolean;
    inserted: number;
    updated: number;
    skipped: number;
    errors: string[];
  }> {
    const results = {
      success: true,
      inserted: 0,
      updated: 0,
      skipped: 0,
      errors: [] as string[]
    };

    console.log('🔧 Getting available database columns...');
    const availableColumns = await this.getAvailableColumns();
    console.log(`📋 Available columns: ${availableColumns.join(', ')}`);

    for (const externalMatch of matches) {
      try {
        const transformedMatch = this.transformMatchSafely(externalMatch, availableColumns);
        const existingMatch = await this.findExistingMatchSafely(transformedMatch, availableColumns);

        if (existingMatch) {
          // Update existing match with available columns
          const updateData: any = {};
          
          // Only update fields that exist in the schema, but preserve publish status
          availableColumns.forEach(column => {
            if (column !== 'id' && column !== 'is_published' && transformedMatch[column] !== undefined) {
              updateData[column] = transformedMatch[column];
            }
          });

          if (availableColumns.includes('updated_at')) {
            updateData.updated_at = new Date().toISOString();
          }

          const { error } = await this.supabase
            .from('matches')
            .update(updateData)
            .eq('id', existingMatch.id);

          if (error) {
            results.errors.push(`Update failed: ${error.message}`);
            results.skipped++;
          } else {
            results.updated++;
            console.log(`✅ Updated: ${transformedMatch.home_team} vs ${transformedMatch.away_team}`);
          }
        } else {
          // Insert new match
          const { error } = await this.supabase
            .from('matches')
            .insert(transformedMatch);

          if (error) {
            results.errors.push(`Insert failed: ${error.message}`);
            results.skipped++;
          } else {
            results.inserted++;
            console.log(`✅ Inserted: ${transformedMatch.home_team} vs ${transformedMatch.away_team}`);
          }
        }

        // Small delay to avoid overwhelming the database
        await new Promise(resolve => setTimeout(resolve, 50));

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        results.errors.push(`Processing failed: ${errorMessage}`);
        results.skipped++;
      }
    }

    results.success = results.errors.length === 0;
    return results;
  }

  /**
   * Get matches with available columns only
   */
  async getMatchesSafely(): Promise<BasicMatch[]> {
    try {
      const availableColumns = await this.getAvailableColumns();
      const selectColumns = availableColumns.join(', ');

      console.log(`📋 Fetching matches with columns: ${selectColumns}`);

      const { data, error } = await this.supabase
        .from('matches')
        .select(selectColumns)
        .order('kickoff_utc', { ascending: true });

      if (error) {
        throw error;
      }

      console.log(`📊 Fetched ${data?.length || 0} matches from database`);
      return data || [];
    } catch (error) {
      console.error('Error fetching matches:', error);
      return [];
    }
  }
}

export const fallbackMatchService = new FallbackMatchService();