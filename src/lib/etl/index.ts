/**
 * BetHub ETL Pipeline - Main Entry Point
 * 
 * This module exports the main components of the ETL pipeline
 */

export { PipelineOrchestrator } from './orchestrator/pipeline-orchestrator';
export { MultiSourceExtractor } from './extractors/multi-source-extractor';
export { MatchTransformer } from './transformers/match-transformer';
export { SupabaseLoader } from './loaders/supabase-loader';

// Export types
export * from './core/types';

// Export utilities
export { createDefaultETLConfig, runETLPipeline } from './utils';

/**
 * Quick start example:
 * 
 * ```typescript
 * import { runETLPipeline } from '@/lib/etl';
 * 
 * // Run pipeline for today's matches
 * const results = await runETLPipeline({
 *   date: new Date(),
 *   league: 'Premier League'
 * });
 * ```
 */