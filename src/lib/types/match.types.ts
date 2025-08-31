export interface Match {
  // Primary identifiers
  id: string;
  external_id?: string;
  data_source: 'football-data' | 'api-sports' | 'manual';
  
  // Match details
  league: string;
  home_team: string;
  away_team: string;
  kickoff_utc: string; // ISO string
  venue?: string;
  referee?: string;
  
  // Live data
  status: 'PRE' | 'LIVE' | 'HT' | 'FT' | 'POSTPONED' | 'CANCELLED';
  home_score?: number;
  away_score?: number;
  current_minute?: number;
  
  // Admin workflow states
  is_pulled: boolean;
  is_analyzed: boolean;
  is_published: boolean;
  
  // Analysis workflow
  analysis_status: 'none' | 'pending' | 'completed' | 'failed';
  analysis_priority: 'low' | 'normal' | 'high';
  
  // Metadata
  created_at: string;
  updated_at: string;
  analyzed_at?: string;
  published_at?: string;
  created_by?: string;
  
  // Optional display data
  home_team_logo?: string;
  away_team_logo?: string;
  league_logo?: string;
}

export interface MatchFilters {
  status?: 'pulled' | 'analyzed' | 'published' | 'all';
  analysis_status?: 'none' | 'pending' | 'completed' | 'failed';
  league?: string;
  limit?: number;
  offset?: number;
  sort?: 'kickoff_asc' | 'kickoff_desc' | 'created_asc' | 'created_desc';
}

export interface PullMatchesRequest {
  competitions?: string[];
  date_range?: {
    from: string; // YYYY-MM-DD
    to: string;   // YYYY-MM-DD
  };
}

export interface PullMatchesResponse {
  success: boolean;
  data: {
    matches_pulled: number;
    matches_updated: number;
    matches_new: number;
    processing_time_ms: number;
  };
  matches: Match[];
  errors: string[];
}

// Public API types (what frontend sees)
export interface PublicMatch {
  id: string;
  league: string;
  home_team: string;
  away_team: string;
  kickoff_utc: string;
  venue?: string;
  status: Match['status'];
  home_score?: number;
  away_score?: number;
  current_minute?: number;
  home_team_logo?: string;
  away_team_logo?: string;
  league_logo?: string;
  has_analysis: boolean;
}

// External API response types
export interface FootballDataMatch {
  id: number;
  utcDate: string;
  status: string;
  matchday: number;
  homeTeam: {
    id: number;
    name: string;
    crest?: string;
  };
  awayTeam: {
    id: number;
    name: string;
    crest?: string;
  };
  competition: {
    id: number;
    name: string;
    emblem?: string;
  };
  venue?: string;
  referees?: Array<{ name: string }>;
  score?: {
    fullTime?: { home: number | null; away: number | null };
    halfTime?: { home: number | null; away: number | null };
  };
}