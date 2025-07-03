// Match Analysis Data Structure for AI Agent Response
// Version 1.0 - MVP Schema

export interface MatchAnalysisResponse {
  success: boolean;
  version: string;
  generated_at: string;
  match_id: string;
  data?: MatchAnalysisData;
  error?: ApiError;
  warnings?: string[];
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
  recoverable: boolean;
}

export interface MatchAnalysisData {
  // Basic Match Info
  match_info: MatchInfo;
  
  // AI Analysis Sections
  tactical_analysis?: TacticalAnalysis;
  team_statistics?: TeamStatistics;
  head_to_head?: HeadToHeadPatterns;
  betting_odds?: BettingOdds;
  
  // Metadata
  confidence_score: number; // 0-1
  data_completeness: number; // 0-1
  last_updated: string;
}

export interface MatchInfo {
  home_team: string;
  away_team: string;
  league: string;
  kickoff_utc: string;
  status: 'PRE' | 'LIVE' | 'FT' | 'POSTPONED' | 'CANCELLED';
  venue?: string;
  referee?: string;
}

export interface TacticalAnalysis {
  home_team: TeamTacticalProfile;
  away_team: TeamTacticalProfile;
  key_players: KeyPlayersAnalysis;
  head_to_head_patterns: HeadToHeadPatterns;
  match_prediction?: MatchPrediction;
}

export interface TeamTacticalProfile {
  formation: string;
  playing_style: string;
  strengths: string[];
  weaknesses: string[];
  recent_form: FormData[];
  confidence: number; // AI confidence in this analysis (0-1)
}

export interface FormData {
  result: 'W' | 'D' | 'L';
  score: string;
  opponent: string;
  date: string;
  competition?: string;
}

export interface KeyPlayersAnalysis {
  home_team: PlayerProfile[];
  away_team: PlayerProfile[];
}

export interface PlayerProfile {
  name: string;
  role: string;
  impact_description: string;
  injury_status?: 'fit' | 'doubtful' | 'injured';
  confidence: number;
}

export interface HeadToHeadPatterns {
  last_matches: HeadToHeadMatch[];
  patterns: string[];
  statistical_trends: Record<string, number>;
}

export interface HeadToHeadMatch {
  date: string;
  result: string;
  home_goals: number;
  away_goals: number;
  competition?: string;
}

export interface MatchPrediction {
  summary: string;
  key_factors: string[];
  confidence: number;
}

export interface TeamStatistics {
  data_period: string; // e.g., "last_10_league_games"
  home_team: TeamStatsProfile;
  away_team: TeamStatsProfile;
}

export interface TeamStatsProfile {
  possession: StatValue;
  shots: ShotsData;
  attacks: StatValue;
  discipline: DisciplineData;
  fouls: StatValue;
  corners: StatValue;
  pass_accuracy: StatValue;
  goals: GoalsData;
  form_sequence: FormData[];
}

export interface StatValue {
  value: number;
  confidence: number;
  sample_size: number;
}

export interface ShotsData {
  total: StatValue;
  on_target: StatValue;
}

export interface DisciplineData {
  yellow_cards: StatValue;
  red_cards: StatValue;
}

export interface GoalsData {
  scored: StatValue;
  conceded: StatValue;
  clean_sheets_percentage: StatValue;
}

export interface BettingOdds {
  last_updated: string;
  bookmakers: BookmakerOdds[];
  disclaimer: string;
}

export interface BookmakerOdds {
  name: string;
  home_win: number;
  draw: number;
  away_win: number;
  over_2_5: number;
  both_teams_score: number;
  url?: string;
}

// Error Handling Types
export interface DataValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  message: string;
  severity: 'critical' | 'major' | 'minor';
}

export interface ValidationWarning {
  field: string;
  message: string;
  fallback_used: boolean;
}

// API Response Status
export type ApiStatus = 'loading' | 'success' | 'error' | 'partial';

export interface ApiState<T> {
  status: ApiStatus;
  data?: T;
  error?: ApiError;
  warnings?: string[];
  loading: boolean;
} 