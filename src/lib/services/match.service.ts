import { MatchRepository } from '../repositories/match.repository';
import { ExternalAPIService } from './external-api.service';
import { Match, MatchFilters, PullMatchesRequest, PullMatchesResponse, FootballDataMatch, PublicMatch } from '../types/match.types';

export class MatchService {
  constructor(
    private matchRepo: MatchRepository,
    private externalAPI: ExternalAPIService
  ) {}

  async pullMatchesFromAPIs(request: PullMatchesRequest = {}): Promise<PullMatchesResponse> {
    const startTime = Date.now();
    
    try {
      console.log('🔄 Admin triggered: Pulling matches from external APIs...');
      
      // Default to major competitions if none specified
      const competitions = request.competitions || ['PL', 'PD', 'BL1', 'SA', 'FL1'];
      
      // Fetch from external APIs
      const rawMatches = await this.externalAPI.fetchMatches(competitions, request.date_range);
      
      if (rawMatches.length === 0) {
        console.log('⚠️  No matches found from external APIs');
        return {
          success: true,
          data: {
            matches_pulled: 0,
            matches_updated: 0,
            matches_new: 0,
            processing_time_ms: Date.now() - startTime
          },
          matches: [],
          errors: ['No matches found for the specified criteria']
        };
      }
      
      // Transform and validate
      const processedMatches = rawMatches.map(match => this.transformExternalMatch(match));
      
      // Upsert to database (update existing, insert new)
      const { created, updated } = await this.matchRepo.upsertMatches(processedMatches);
      
      const processingTime = Date.now() - startTime;
      console.log(`✅ Pulled ${created.length + updated.length} matches in ${processingTime}ms`);
      
      return {
        success: true,
        data: {
          matches_pulled: created.length + updated.length,
          matches_updated: updated.length,
          matches_new: created.length,
          processing_time_ms: processingTime
        },
        matches: [...created, ...updated],
        errors: []
      };
      
    } catch (error) {
      console.error('❌ Failed to pull matches:', error);
      
      const processingTime = Date.now() - startTime;
      
      return {
        success: false,
        data: {
          matches_pulled: 0,
          matches_updated: 0,
          matches_new: 0,
          processing_time_ms: processingTime
        },
        matches: [],
        errors: [error instanceof Error ? error.message : 'Unknown error occurred']
      };
    }
  }

  async getMatches(filters: MatchFilters): Promise<{ matches: Match[], total: number }> {
    try {
      return await this.matchRepo.findMatches(filters);
    } catch (error) {
      console.error('Failed to get matches:', error);
      throw new Error(`Failed to retrieve matches: ${error.message}`);
    }
  }

  async getPublishedMatches(filters: MatchFilters): Promise<{ matches: PublicMatch[], total: number }> {
    try {
      const { matches, total } = await this.matchRepo.findPublishedMatches(filters);
      
      // Transform to public format
      const publicMatches = matches.map(this.transformToPublicMatch);
      
      return { matches: publicMatches, total };
    } catch (error) {
      console.error('Failed to get published matches:', error);
      throw new Error(`Failed to retrieve published matches: ${error.message}`);
    }
  }

  async getMatchById(id: string): Promise<Match | null> {
    try {
      return await this.matchRepo.findById(id);
    } catch (error) {
      console.error(`Failed to get match ${id}:`, error);
      throw new Error(`Failed to retrieve match: ${error.message}`);
    }
  }

  async updateMatch(id: string, updates: Partial<Match>): Promise<Match> {
    try {
      return await this.matchRepo.updateMatch(id, {
        ...updates,
        updated_at: new Date().toISOString()
      });
    } catch (error) {
      console.error(`Failed to update match ${id}:`, error);
      throw new Error(`Failed to update match: ${error.message}`);
    }
  }

  async publishMatches(matchIds: string[]): Promise<{ published: Match[], failed: Array<{ id: string, error: string }> }> {
    const published: Match[] = [];
    const failed: Array<{ id: string, error: string }> = [];
    
    for (const matchId of matchIds) {
      try {
        // Check if match is analyzed
        const match = await this.matchRepo.findById(matchId);
        
        if (!match) {
          failed.push({ id: matchId, error: 'Match not found' });
          continue;
        }
        
        if (!match.is_analyzed || match.analysis_status !== 'completed') {
          failed.push({ id: matchId, error: 'Match not analyzed yet' });
          continue;
        }
        
        // Publish the match
        const publishedMatch = await this.matchRepo.updateMatch(matchId, {
          is_published: true,
          published_at: new Date().toISOString()
        });
        
        published.push(publishedMatch);
        console.log(`✅ Published match: ${publishedMatch.home_team} vs ${publishedMatch.away_team}`);
        
      } catch (error) {
        console.error(`Failed to publish match ${matchId}:`, error);
        failed.push({ 
          id: matchId, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
      }
    }
    
    return { published, failed };
  }

  async unpublishMatches(matchIds: string[]): Promise<{ unpublished: Match[], failed: Array<{ id: string, error: string }> }> {
    const unpublished: Match[] = [];
    const failed: Array<{ id: string, error: string }> = [];
    
    for (const matchId of matchIds) {
      try {
        const unpublishedMatch = await this.matchRepo.updateMatch(matchId, {
          is_published: false,
          published_at: null
        });
        
        unpublished.push(unpublishedMatch);
        console.log(`🔄 Unpublished match: ${unpublishedMatch.home_team} vs ${unpublishedMatch.away_team}`);
        
      } catch (error) {
        console.error(`Failed to unpublish match ${matchId}:`, error);
        failed.push({ 
          id: matchId, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
      }
    }
    
    return { unpublished, failed };
  }

  async getDashboardStats() {
    try {
      return await this.matchRepo.getDashboardStats();
    } catch (error) {
      console.error('Failed to get dashboard stats:', error);
      throw new Error(`Failed to retrieve dashboard stats: ${error.message}`);
    }
  }

  async deleteMatch(id: string): Promise<void> {
    try {
      await this.matchRepo.deleteMatch(id);
      console.log(`🗑️  Deleted match: ${id}`);
    } catch (error) {
      console.error(`Failed to delete match ${id}:`, error);
      throw new Error(`Failed to delete match: ${error.message}`);
    }
  }

  private transformExternalMatch(externalMatch: FootballDataMatch): Partial<Match> {
    // Generate a consistent ID based on external data
    const id = `match_${externalMatch.id}_${externalMatch.competition.id}`;
    
    return {
      id,
      external_id: externalMatch.id?.toString(),
      data_source: 'football-data',
      league: externalMatch.competition?.name || 'Unknown League',
      home_team: externalMatch.homeTeam?.name || 'Home Team',
      away_team: externalMatch.awayTeam?.name || 'Away Team',
      kickoff_utc: externalMatch.utcDate,
      venue: externalMatch.venue,
      referee: externalMatch.referees?.[0]?.name,
      status: this.mapStatus(externalMatch.status),
      home_score: externalMatch.score?.fullTime?.home ?? undefined,
      away_score: externalMatch.score?.fullTime?.away ?? undefined,
      home_team_logo: externalMatch.homeTeam?.crest,
      away_team_logo: externalMatch.awayTeam?.crest,
      league_logo: externalMatch.competition?.emblem,
      
      // Set workflow states for new matches
      is_pulled: true,
      is_analyzed: false,
      is_published: false,
      analysis_status: 'none',
      analysis_priority: 'normal'
    };
  }

  private mapStatus(externalStatus: string): Match['status'] {
    const statusMap: Record<string, Match['status']> = {
      'SCHEDULED': 'PRE',
      'TIMED': 'PRE',
      'IN_PLAY': 'LIVE',
      'PAUSED': 'LIVE',
      'FINISHED': 'FT',
      'POSTPONED': 'POSTPONED',
      'CANCELLED': 'CANCELLED'
    };
    return statusMap[externalStatus] || 'PRE';
  }

  private transformToPublicMatch(match: Match): PublicMatch {
    return {
      id: match.id,
      league: match.league,
      home_team: match.home_team,
      away_team: match.away_team,
      kickoff_utc: match.kickoff_utc,
      venue: match.venue,
      status: match.status,
      home_score: match.home_score,
      away_score: match.away_score,
      current_minute: match.current_minute,
      home_team_logo: match.home_team_logo,
      away_team_logo: match.away_team_logo,
      league_logo: match.league_logo,
      has_analysis: match.is_analyzed && match.analysis_status === 'completed'
    };
  }
}