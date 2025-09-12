// Comprehensive database schema types and mapping utilities
// This ensures type safety and consistent data mapping across all sources

export interface DatabaseMatch {
  // Core identification
  id: string;
  external_id: string | null;
  data_source: 'football-data' | 'sports-db' | 'manual' | 'multi-source';
  
  // Basic match info
  league: string;
  home_team: string;
  away_team: string;
  kickoff_utc: string;
  status: 'PRE' | 'LIVE' | 'FT' | 'HT' | 'PAUSED' | 'POSTPONED' | 'CANCELLED';
  
  // Match details
  venue?: string | null;
  referee?: string | null;
  home_score?: number | null;
  away_score?: number | null;
  current_minute?: number | null;
  
  // Competition metadata
  competition_id?: string | null;
  season?: string | null;
  matchday?: number | null;
  stage?: string | null;
  group_name?: string | null;
  
  // Visual assets
  home_team_logo?: string | null;
  away_team_logo?: string | null;
  league_logo?: string | null;
  
  // Workflow states
  is_pulled: boolean;
  is_analyzed: boolean;
  is_published: boolean;
  analysis_status: 'none' | 'pending' | 'completed' | 'failed';
  analysis_priority: 'low' | 'normal' | 'high';
  
  // Relational IDs (for future multi-source aggregation)
  home_team_id?: string | null;
  away_team_id?: string | null;
  league_id?: string | null;
  
  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface FootballDataMatch {
  id: number;
  utcDate: string;
  status: string;
  matchday?: number;
  stage?: string;
  group?: string;
  lastUpdated: string;
  venue?: string;
  homeTeam: {
    id: number;
    name: string;
    shortName: string;
    tla: string;
    crest: string;
  };
  awayTeam: {
    id: number;
    name: string;
    shortName: string;
    tla: string;
    crest: string;
  };
  score: {
    winner?: string | null;
    duration: string;
    fullTime: {
      home: number | null;
      away: number | null;
    };
    halfTime: {
      home: number | null;
      away: number | null;
    };
  };
  referees?: Array<{
    id: number;
    name: string;
    type: string;
    nationality: string;
  }>;
  competition: {
    id: number;
    name: string;
    code: string;
    type: string;
    emblem: string;
  };
  season: {
    id: number;
    startDate: string;
    endDate: string;
    currentMatchday?: number;
  };
}

// Status mapping utility
export const statusMap = {
  // Football-data.org statuses
  'SCHEDULED': 'PRE' as const,
  'TIMED': 'PRE' as const,
  'IN_PLAY': 'LIVE' as const,
  'PAUSED': 'LIVE' as const,
  'FINISHED': 'FT' as const,
  'POSTPONED': 'POSTPONED' as const,
  'CANCELLED': 'CANCELLED' as const,
  'SUSPENDED': 'POSTPONED' as const,
  // Future API statuses can be added here
  'HALFTIME': 'HT' as const,
};

// Data source transformation utilities
export class DataSourceMapper {
  
  static fromFootballData(match: FootballDataMatch): Omit<DatabaseMatch, 'id' | 'created_at' | 'updated_at'> {
    const now = new Date().toISOString();
    
    return {
      external_id: match.id.toString(),
      data_source: 'football-data',
      league: match.competition.name,
      home_team: match.homeTeam.name,
      away_team: match.awayTeam.name,
      kickoff_utc: match.utcDate,
      status: statusMap[match.status as keyof typeof statusMap] || 'PRE',
      venue: match.venue || null,
      referee: match.referees?.[0]?.name || null,
      home_score: match.score?.fullTime?.home || null,
      away_score: match.score?.fullTime?.away || null,
      current_minute: null, // Not provided by football-data.org
      competition_id: match.competition.id.toString(),
      season: match.season.startDate ? new Date(match.season.startDate).getFullYear().toString() : null,
      matchday: match.matchday || null,
      stage: match.stage || null,
      group_name: match.group || null,
      home_team_logo: match.homeTeam.crest || null,
      away_team_logo: match.awayTeam.crest || null,
      league_logo: match.competition.emblem || null,
      is_pulled: true,
      is_analyzed: false,
      is_published: false,
      analysis_status: 'none',
      analysis_priority: 'normal',
      home_team_id: null, // Will be populated when we aggregate team data
      away_team_id: null,
      league_id: null,
    };
  }
  
  // Generate unique match key for deduplication
  static generateMatchKey(match: { 
    home_team: string; 
    away_team: string; 
    kickoff_utc: string; 
    competition_id?: string | null;
  }): string {
    // Create deterministic key for match deduplication
    const date = new Date(match.kickoff_utc).toISOString().split('T')[0];
    const teams = [match.home_team, match.away_team].sort().join('_');
    const competition = match.competition_id || 'unknown';
    return `${date}_${teams}_${competition}`.toLowerCase().replace(/[^a-z0-9_]/g, '');
  }
  
  // Check if two matches are duplicates
  static areDuplicateMatches(match1: DatabaseMatch, match2: DatabaseMatch): boolean {
    const key1 = this.generateMatchKey(match1);
    const key2 = this.generateMatchKey(match2);
    return key1 === key2;
  }
  
  // Merge match data from multiple sources (preference order: external APIs > manual)
  static mergeMatchData(existingMatch: DatabaseMatch, newMatch: Partial<DatabaseMatch>): DatabaseMatch {
    const dataSourcePriority = ['football-data', 'sports-db', 'multi-source', 'manual', 'internal'];
    const existingPriority = dataSourcePriority.indexOf(existingMatch.data_source);
    const newPriority = dataSourcePriority.indexOf(newMatch.data_source || 'internal');
    
    // If new data source has higher priority, use it for most fields
    const useNewData = newPriority < existingPriority || newPriority === existingPriority;
    
    return {
      ...existingMatch,
      // Always update timestamps
      updated_at: new Date().toISOString(),
      // Use better data source
      ...(useNewData ? {
        external_id: newMatch.external_id || existingMatch.external_id,
        data_source: newMatch.data_source || existingMatch.data_source,
        league: newMatch.league || existingMatch.league,
        home_team: newMatch.home_team || existingMatch.home_team,
        away_team: newMatch.away_team || existingMatch.away_team,
        venue: newMatch.venue || existingMatch.venue,
        referee: newMatch.referee || existingMatch.referee,
        home_team_logo: newMatch.home_team_logo || existingMatch.home_team_logo,
        away_team_logo: newMatch.away_team_logo || existingMatch.away_team_logo,
        league_logo: newMatch.league_logo || existingMatch.league_logo,
        competition_id: newMatch.competition_id || existingMatch.competition_id,
        season: newMatch.season || existingMatch.season,
        matchday: newMatch.matchday || existingMatch.matchday,
        stage: newMatch.stage || existingMatch.stage,
        group_name: newMatch.group_name || existingMatch.group_name,
      } : {}),
      // Always update scores and status if provided
      status: newMatch.status || existingMatch.status,
      home_score: newMatch.home_score !== undefined ? newMatch.home_score : existingMatch.home_score,
      away_score: newMatch.away_score !== undefined ? newMatch.away_score : existingMatch.away_score,
      current_minute: newMatch.current_minute !== undefined ? newMatch.current_minute : existingMatch.current_minute,
      // Preserve workflow states unless explicitly updated
      is_pulled: newMatch.is_pulled !== undefined ? newMatch.is_pulled : existingMatch.is_pulled,
      is_analyzed: existingMatch.is_analyzed, // Don't overwrite analysis state
      is_published: existingMatch.is_published, // Don't overwrite publish state
      analysis_status: existingMatch.analysis_status,
      analysis_priority: existingMatch.analysis_priority,
    };
  }
}

// Validation utilities
export class MatchValidator {
  static validateMatch(match: Partial<DatabaseMatch>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!match.home_team || match.home_team.trim() === '') {
      errors.push('Home team name is required');
    }
    
    if (!match.away_team || match.away_team.trim() === '') {
      errors.push('Away team name is required');
    }
    
    if (!match.kickoff_utc || !Date.parse(match.kickoff_utc)) {
      errors.push('Valid kickoff time is required');
    }
    
    if (!match.league || match.league.trim() === '') {
      errors.push('League name is required');
    }
    
    if (match.status && !['PRE', 'LIVE', 'FT', 'HT', 'PAUSED', 'POSTPONED', 'CANCELLED'].includes(match.status)) {
      errors.push('Invalid match status');
    }
    
    if (match.data_source && !['football-data', 'sports-db', 'manual', 'multi-source', 'internal'].includes(match.data_source)) {
      errors.push('Invalid data source');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
}