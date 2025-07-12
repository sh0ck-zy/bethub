// Core domain types (open source)
export interface Match {
  id: string;
  league: string;
  home_team: string;
  away_team: string;
  kickoff_utc: string;
  status: 'PRE' | 'LIVE' | 'FT' | 'POSTPONED' | 'CANCELLED';
  home_score?: number;
  away_score?: number;
  current_minute?: number;
  odds?: Odds;
  venue?: string;
  referee?: string;
  is_published?: boolean;
  analysis_status?: 'none' | 'pending' | 'completed' | 'failed';
}

export interface Team {
  id: string;
  name: string;
  short_name: string;
  logo_url?: string;
  country: string;
  founded?: number;
  venue?: string;
}

export interface League {
  id: string;
  name: string;
  country: string;
  logo_url?: string;
  season: string;
  type: 'league' | 'cup' | 'international';
}

export interface Odds {
  home: number;
  draw: number;
  away: number;
  provider?: string;
  last_updated: string;
}

export interface MatchStats {
  possession?: number;
  shots?: number;
  shots_on_target?: number;
  corners?: number;
  fouls?: number;
  yellow_cards?: number;
  red_cards?: number;
  offsides?: number;
  saves?: number;
}

export interface LiveMatchUpdate {
  matchId: string;
  type: 'goal' | 'card' | 'substitution' | 'injury' | 'analysis' | 'odds_change';
  timestamp: string;
  data: {
    homeScore?: number;
    awayScore?: number;
    minute?: number;
    player?: string;
    team?: 'home' | 'away';
    description?: string;
    odds?: Odds;
  };
}

// User and subscription types (open source interfaces)
export interface User {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  created_at: string;
  subscription_status: SubscriptionStatus;
  subscription_tier: SubscriptionTier;
  usage_limits: UsageLimits;
}

export type SubscriptionStatus = 'free' | 'active' | 'past_due' | 'cancelled' | 'trialing';
export type SubscriptionTier = 'free' | 'premium' | 'pro' | 'enterprise';

export interface UsageLimits {
  ai_analyses_per_day: number;
  ai_analyses_used_today: number;
  real_time_matches: number;
  advanced_features: boolean;
}

export interface Subscription {
  id: string;
  user_id: string;
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  trial_end?: string;
}

// AI Analysis types (open source interfaces)
export interface AnalysisRequest {
  matchId: string;
  type: 'quick_insight' | 'full_analysis' | 'betting_tips' | 'tactical_breakdown';
  userId?: string;
}

export interface AnalysisResult {
  id: string;
  match_id: string;
  type: string;
  tactical_insights: string;
  key_factors: string[];
  prediction: Prediction;
  betting_recommendation: BettingRecommendation;
  player_watch: string[];
  formation_analysis: string;
  confidence: number;
  weather_impact?: string;
  injury_impact?: string;
  created_at: string;
}

export interface Prediction {
  outcome: 'home' | 'away' | 'draw';
  confidence: number;
  reasoning: string;
  probability_home: number;
  probability_draw: number;
  probability_away: number;
}

export interface BettingRecommendation {
  bet: string;
  confidence: number;
  reasoning: string;
  risk_level: 'low' | 'medium' | 'high';
  expected_value?: number;
  recommended_stake?: number;
}

// Notification types
export interface Notification {
  id: string;
  user_id?: string;
  type: 'match_start' | 'goal' | 'analysis_ready' | 'odds_alert' | 'system';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  data?: Record<string, any>;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    has_more: boolean;
  };
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

// Feature flags and configuration
export interface FeatureFlags {
  ai_analysis_enabled: boolean;
  real_time_updates_enabled: boolean;
  payment_processing_enabled: boolean;
  advanced_analytics_enabled: boolean;
  social_features_enabled: boolean;
}

export interface AppConfig {
  app_name: string;
  version: string;
  environment: 'development' | 'staging' | 'production';
  feature_flags: FeatureFlags;
  limits: {
    free_analyses_per_day: number;
    max_real_time_connections: number;
    api_rate_limit: number;
  };
}

// Provider interfaces (contracts for proprietary implementations)
export interface AIAnalysisProvider {
  analyzeMatch(matchData: Match, options?: AnalysisOptions): Promise<AnalysisResult>;
  generateInsight(prompt: string, context?: any): Promise<string>;
  getBettingTips(matchData: Match): Promise<string[]>;
  validateAnalysisRequest(request: AnalysisRequest): Promise<boolean>;
}

export interface AnalysisOptions {
  depth: 'quick' | 'standard' | 'deep';
  include_betting: boolean;
  include_tactical: boolean;
  include_predictions: boolean;
  user_preferences?: UserPreferences;
}

export interface UserPreferences {
  favorite_teams: string[];
  preferred_leagues: string[];
  betting_style: 'conservative' | 'moderate' | 'aggressive';
  analysis_focus: 'tactical' | 'statistical' | 'betting';
}

export interface PaymentProvider {
  createSubscription(userId: string, planId: string): Promise<Subscription>;
  cancelSubscription(subscriptionId: string): Promise<void>;
  updateSubscription(subscriptionId: string, planId: string): Promise<Subscription>;
  getSubscriptionStatus(userId: string): Promise<SubscriptionStatus>;
  processPayment(amount: number, currency: string, customerId: string): Promise<PaymentResult>;
  createCustomer(user: User): Promise<string>;
  getInvoices(customerId: string): Promise<Invoice[]>;
}

export interface PaymentResult {
  success: boolean;
  transaction_id: string;
  amount: number;
  currency: string;
  status: 'succeeded' | 'failed' | 'pending';
  error?: string;
}

export interface Invoice {
  id: string;
  amount: number;
  currency: string;
  status: 'paid' | 'pending' | 'failed';
  date: string;
  pdf_url?: string;
}

export interface DataProvider {
  getMatches(date: Date, league?: string): Promise<Match[]>;
  getLiveScore(matchId: string): Promise<Match>;
  getOdds(matchId: string): Promise<Odds>;
  getMatchStats(matchId: string): Promise<{ home: MatchStats; away: MatchStats }>;
  getTeam(teamId: string): Promise<Team>;
  getLeague(leagueId: string): Promise<League>;
  searchTeams(query: string): Promise<Team[]>;
}

export interface RealtimeProvider {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  subscribeToMatch(matchId: string, callback: (update: LiveMatchUpdate) => void): () => void;
  subscribeToNotifications(userId: string, callback: (notification: Notification) => void): () => void;
  sendNotification(notification: Omit<Notification, 'id' | 'timestamp'>): Promise<void>;
  getConnectionStatus(): boolean;
}

export interface AnalyticsProvider {
  trackEvent(event: string, properties?: Record<string, any>): Promise<void>;
  trackUser(userId: string, properties?: Record<string, any>): Promise<void>;
  trackPageView(page: string, properties?: Record<string, any>): Promise<void>;
  trackConversion(event: string, value?: number): Promise<void>;
  getAnalytics(timeframe: string): Promise<AnalyticsData>;
}

export interface AnalyticsData {
  users: {
    total: number;
    active: number;
    new: number;
  };
  usage: {
    analyses_generated: number;
    matches_viewed: number;
    subscriptions_created: number;
  };
  revenue: {
    total: number;
    mrr: number;
    churn_rate: number;
  };
}

// Error types
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, 'VALIDATION_ERROR', 400, details);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 'AUTHENTICATION_ERROR', 401);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 'AUTHORIZATION_ERROR', 403);
    this.name = 'AuthorizationError';
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Rate limit exceeded') {
    super(message, 'RATE_LIMIT_ERROR', 429);
    this.name = 'RateLimitError';
  }
}

export class UsageLimitError extends AppError {
  constructor(message: string = 'Usage limit exceeded') {
    super(message, 'USAGE_LIMIT_ERROR', 402);
    this.name = 'UsageLimitError';
  }
} 