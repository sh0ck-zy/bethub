/**
 * Core types for the BetHub ETL Pipeline
 */

// Pipeline stages
export type PipelineStage = 'extract' | 'transform' | 'load';

// Pipeline status
export type PipelineStatus = 'idle' | 'running' | 'completed' | 'failed' | 'cancelled';

// Data source types
export interface DataSource {
  id: string;
  name: string;
  type: 'api' | 'webhook' | 'stream' | 'file';
  config: Record<string, any>;
  priority: number;
  enabled: boolean;
}

// Rate limiting
export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  strategy: 'fixed-window' | 'sliding-window' | 'token-bucket';
}

// Retry policy
export interface RetryPolicy {
  maxAttempts: number;
  initialDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
  retryableErrors?: string[];
}

// Cache strategy
export interface CacheStrategy {
  enabled: boolean;
  ttlSeconds: number;
  keyPrefix: string;
  storage: 'memory' | 'redis' | 'database';
}

// ETL Configuration
export interface ETLConfig {
  sources: DataSource[];
  rateLimits: Map<string, RateLimitConfig>;
  retryPolicy: RetryPolicy;
  cacheStrategy: CacheStrategy;
  monitoring: MonitoringConfig;
}

// Monitoring
export interface MonitoringConfig {
  enableMetrics: boolean;
  enableTracing: boolean;
  enableLogging: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
}

// Pipeline execution context
export interface PipelineContext {
  executionId: string;
  startTime: Date;
  stage: PipelineStage;
  metadata: Record<string, any>;
  errors: PipelineError[];
}

// Pipeline errors
export interface PipelineError {
  stage: PipelineStage;
  source?: string;
  message: string;
  code: string;
  timestamp: Date;
  retryable: boolean;
  details?: Record<string, any>;
}

// Extraction types
export interface ExtractionResult<T = any> {
  source: string;
  data: T[];
  extractedAt: Date;
  metadata: {
    totalRecords: number;
    duration: number;
    rateLimitRemaining?: number;
  };
}

// Transformation types
export interface TransformationResult<T = any> {
  data: T[];
  transformedAt: Date;
  metadata: {
    inputRecords: number;
    outputRecords: number;
    validationErrors: number;
    duplicatesRemoved: number;
    enrichmentStats?: Record<string, number>;
  };
}

// Loading types
export interface LoadingResult {
  loadedAt: Date;
  metadata: {
    recordsLoaded: number;
    recordsUpdated: number;
    recordsFailed: number;
    conflicts: number;
    duration: number;
  };
}

// Data validation
export interface ValidationRule {
  field: string;
  type: 'required' | 'type' | 'format' | 'range' | 'custom';
  config: Record<string, any>;
  severity: 'error' | 'warning';
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

export interface ValidationError {
  field: string;
  rule: string;
  message: string;
  value?: any;
}

// Data enrichment
export interface EnrichmentConfig {
  type: 'logo' | 'stats' | 'odds' | 'venue' | 'weather';
  source: string;
  required: boolean;
  fallbackStrategy?: 'skip' | 'default' | 'previous';
}

// Conflict resolution
export type ConflictStrategy = 'latest' | 'merge' | 'custom';

export interface ConflictResolution {
  strategy: ConflictStrategy;
  customResolver?: (existing: any, incoming: any) => any;
}

// Audit trail
export interface AuditEntry {
  id: string;
  timestamp: Date;
  stage: PipelineStage;
  action: string;
  userId?: string;
  recordId?: string;
  changes?: Record<string, any>;
  metadata?: Record<string, any>;
}

// Pipeline metrics
export interface PipelineMetrics {
  executionId: string;
  stage: PipelineStage;
  startTime: Date;
  endTime?: Date;
  recordsProcessed: number;
  recordsFailed: number;
  averageLatency?: number;
  throughput?: number;
  errorRate?: number;
}

// Match-specific types for BetHub
export interface RawMatchData {
  externalId: string;
  source: string;
  league: string;
  homeTeam: string;
  awayTeam: string;
  kickoffTime: string;
  status: string;
  homeScore?: number;
  awayScore?: number;
  venue?: string;
  referee?: string;
  rawData: Record<string, any>;
}

export interface EnrichedMatch extends RawMatchData {
  id: string;
  leagueId?: string;
  homeTeamId?: string;
  awayTeamId?: string;
  homeTeamLogo?: string;
  awayTeamLogo?: string;
  leagueLogo?: string;
  odds?: {
    home: number;
    draw: number;
    away: number;
    provider: string;
  };
  confidenceScore: number;
  dataQuality: 'high' | 'medium' | 'low';
}