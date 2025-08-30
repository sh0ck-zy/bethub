# Core Types and Errors

Types from `src/lib/types/index.ts` (selected):

## Domain
- `Match` { id, league, home_team, away_team, kickoff_utc, status, ... }
- `Team` { id, name, short_name, country, ... }
- `League` { id, name, country, season, type }
- `Odds` { home, draw, away, provider?, last_updated }
- `MatchStats` {...}
- `LiveMatchUpdate` { matchId, type, timestamp, data }

## Users and Subscriptions
- `User` { id, email, name?, avatar_url?, created_at, subscription_status, subscription_tier, usage_limits }
- `SubscriptionStatus` = `free | active | past_due | cancelled | trialing`
- `SubscriptionTier` = `free | premium | pro | enterprise`
- `UsageLimits` {...}
- `Subscription` {...}

## AI Analysis
- `AnalysisRequest` { matchId, type, userId? }
- `AnalysisResult` { id, match_id, type, tactical_insights, key_factors, prediction, betting_recommendation, ... }
- `Prediction` { outcome, confidence, reasoning, probability_home, probability_draw, probability_away }
- `BettingRecommendation` { bet, confidence, reasoning, risk_level, ... }

## Provider Interfaces
- `AIAnalysisProvider`, `PaymentProvider`, `DataProvider`, `RealtimeProvider`, `AnalyticsProvider`

## API
- `ApiResponse<T>` { success, data?, error?, message?, pagination? }
- `ApiError` { code, message, details? }

## Feature Flags & Config
- `FeatureFlags` { ai_analysis_enabled, real_time_updates_enabled, payment_processing_enabled, advanced_analytics_enabled, social_features_enabled }
- `AppConfig` { app_name, version, environment, feature_flags, limits }

## Errors
- `AppError extends Error` (code, statusCode, details)
- `ValidationError extends AppError` (400)
- `AuthenticationError extends AppError` (401)
- `AuthorizationError extends AppError` (403)
- `RateLimitError extends AppError` (429)
- `UsageLimitError extends AppError` (402)