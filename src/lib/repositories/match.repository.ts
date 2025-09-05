import { BaseRepository } from './base.repository';
import { Match, MatchFilters } from '../types/match.types';

export class MatchRepository extends BaseRepository {

  async upsertMatches(matches: Partial<Match>[]): Promise<{ created: Match[], updated: Match[] }> {
    if (matches.length === 0) {
      return { created: [], updated: [] };
    }

    // Map matches to include ALL fields (no data loss!)
    const matchesToUpsert = matches.map(match => ({
      // Core identifiers
      id: match.id,
      external_id: match.external_id,
      data_source: match.data_source || 'football-data',
      
      // Match details
      league: match.league,
      home_team: match.home_team,
      away_team: match.away_team,
      kickoff_utc: match.kickoff_utc,
      venue: match.venue,
      referee: match.referee,
      
      // Match status and scores
      status: match.status,
      home_score: match.home_score,
      away_score: match.away_score,
      current_minute: match.current_minute,
      
      // Logo/display fields (CRITICAL - was being lost!)
      home_team_logo: match.home_team_logo,
      away_team_logo: match.away_team_logo,
      league_logo: match.league_logo,
      
      // Workflow states (CRITICAL - was being lost!)
      is_pulled: match.is_pulled ?? true,
      is_analyzed: match.is_analyzed ?? false,
      is_published: match.is_published ?? false,
      analysis_status: match.analysis_status || 'none',
      analysis_priority: match.analysis_priority || 'normal',
      
      // Optional relationship IDs (can be null for now)
      home_team_id: match.home_team_id || null,
      away_team_id: match.away_team_id || null,
      league_id: match.league_id || null,
      
      // Metadata
      created_by: match.created_by || null,
      updated_at: this.now(),
      created_at: match.created_at || this.now()
    }));

    try {
      const { data, error } = await this.supabase
        .from('matches')
        .upsert(matchesToUpsert, {
          onConflict: 'external_id,data_source',
          ignoreDuplicates: false
        })
        .select('*');

      if (error) {
        this.handleError(error, 'upsert matches');
      }

      // For simplicity, return all as created (in real app, track created vs updated)
      return { created: data || [], updated: [] };
      
    } catch (error) {
      this.handleError(error, 'upsert matches');
    }
  }

  async findMatches(filters: MatchFilters): Promise<{ matches: Match[], total: number }> {
    try {
      let query = this.supabase
        .from('matches')
        .select('*', { count: 'exact' });

      // Apply filters
      if (filters.status === 'pulled') {
        query = query.eq('is_pulled', true);
      } else if (filters.status === 'analyzed') {
        query = query.eq('is_analyzed', true);
      } else if (filters.status === 'published') {
        query = query.eq('is_published', true);
      }

      if (filters.analysis_status) {
        query = query.eq('analysis_status', filters.analysis_status);
      }

      if (filters.league) {
        query = query.ilike('league', `%${filters.league}%`);
      }

      // Sorting
      const [sortField, sortOrder] = filters.sort?.split('_') || ['kickoff', 'asc'];
      const column = sortField === 'kickoff' ? 'kickoff_utc' : `${sortField}_at`;
      query = query.order(column, { ascending: sortOrder === 'asc' });

      // Pagination
      if (filters.limit) {
        query = query.limit(filters.limit);
      }
      if (filters.offset) {
        query = query.range(filters.offset, (filters.offset + (filters.limit || 50)) - 1);
      }

      const { data, error, count } = await query;

      if (error) {
        this.handleError(error, 'find matches');
      }

      return {
        matches: data || [],
        total: count || 0
      };
      
    } catch (error) {
      this.handleError(error, 'find matches');
    }
  }

  async findPublishedMatches(filters: MatchFilters): Promise<{ matches: Match[], total: number }> {
    return this.findMatches({ ...filters, status: 'published' });
  }

  async findById(id: string): Promise<Match | null> {
    try {
      const { data, error } = await this.supabase
        .from('matches')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') { // Not found
          return null;
        }
        this.handleError(error, 'find match by id');
      }

      return data;
      
    } catch (error) {
      if (error.message.includes('not found')) {
        return null;
      }
      throw error;
    }
  }

  async findByIds(ids: string[]): Promise<Match[]> {
    if (ids.length === 0) {
      return [];
    }

    try {
      const { data, error } = await this.supabase
        .from('matches')
        .select('*')
        .in('id', ids);

      if (error) {
        this.handleError(error, 'find matches by ids');
      }

      return data || [];
      
    } catch (error) {
      this.handleError(error, 'find matches by ids');
    }
  }

  async updateMatch(id: string, updates: Partial<Match>): Promise<Match> {
    try {
      const { data, error } = await this.supabase
        .from('matches')
        .update({
          ...updates,
          updated_at: this.now()
        })
        .eq('id', id)
        .select('*')
        .single();

      if (error) {
        this.handleError(error, 'update match');
      }

      return data;
      
    } catch (error) {
      this.handleError(error, 'update match');
    }
  }

  async updateMatches(ids: string[], updates: Partial<Match>): Promise<Match[]> {
    if (ids.length === 0) {
      return [];
    }

    try {
      const { data, error } = await this.supabase
        .from('matches')
        .update({
          ...updates,
          updated_at: this.now()
        })
        .in('id', ids)
        .select('*');

      if (error) {
        this.handleError(error, 'update matches');
      }

      return data || [];
      
    } catch (error) {
      this.handleError(error, 'update matches');
    }
  }

  async countByStatus(status: 'pulled' | 'analyzed' | 'published'): Promise<number> {
    try {
      let query = this.supabase
        .from('matches')
        .select('id', { count: 'exact', head: true });

      switch (status) {
        case 'pulled':
          query = query.eq('is_pulled', true);
          break;
        case 'analyzed':
          query = query.eq('is_analyzed', true);
          break;
        case 'published':
          query = query.eq('is_published', true);
          break;
      }

      const { count, error } = await query;

      if (error) {
        this.handleError(error, 'count matches by status');
      }

      return count || 0;
      
    } catch (error) {
      this.handleError(error, 'count matches by status');
    }
  }

  async getDashboardStats(): Promise<{
    total_matches: number;
    total_pulled: number;
    total_analyzed: number;
    total_published: number;
    pending_analysis: number;
    failed_analysis: number;
  }> {
    try {
      const [
        totalMatches,
        totalPulled,
        totalAnalyzed,
        totalPublished,
        pendingAnalysis,
        failedAnalysis
      ] = await Promise.all([
        this.supabase.from('matches').select('id', { count: 'exact', head: true }),
        this.supabase.from('matches').select('id', { count: 'exact', head: true }).eq('is_pulled', true),
        this.supabase.from('matches').select('id', { count: 'exact', head: true }).eq('is_analyzed', true),
        this.supabase.from('matches').select('id', { count: 'exact', head: true }).eq('is_published', true),
        this.supabase.from('matches').select('id', { count: 'exact', head: true }).eq('analysis_status', 'pending'),
        this.supabase.from('matches').select('id', { count: 'exact', head: true }).eq('analysis_status', 'failed')
      ]);

      return {
        total_matches: totalMatches.count || 0,
        total_pulled: totalPulled.count || 0,
        total_analyzed: totalAnalyzed.count || 0,
        total_published: totalPublished.count || 0,
        pending_analysis: pendingAnalysis.count || 0,
        failed_analysis: failedAnalysis.count || 0
      };
      
    } catch (error) {
      this.handleError(error, 'get dashboard stats');
    }
  }

  async deleteMatch(id: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('matches')
        .delete()
        .eq('id', id);

      if (error) {
        this.handleError(error, 'delete match');
      }
      
    } catch (error) {
      this.handleError(error, 'delete match');
    }
  }
}