import { MultiSourceExtractor } from '../extractors/multi-source-extractor';
import { MatchTransformer } from '../transformers/match-transformer';
import { SupabaseLoader } from '../loaders/supabase-loader';
import { 
  ETLConfig, 
  PipelineContext, 
  PipelineStatus, 
  PipelineMetrics,
  DataSource,
  RateLimitConfig,
  RetryPolicy,
  CacheStrategy
} from '../core/types';
import { EventEmitter } from 'events';

/**
 * Main ETL Pipeline Orchestrator
 * Coordinates the extraction, transformation, and loading processes
 */
export class PipelineOrchestrator extends EventEmitter {
  private config: ETLConfig;
  private extractor: MultiSourceExtractor;
  private transformer: MatchTransformer;
  private loader: SupabaseLoader;
  private status: PipelineStatus = 'idle';
  private currentContext?: PipelineContext;

  constructor(config: ETLConfig) {
    super();
    this.config = config;
    this.initializeComponents();
  }

  private initializeComponents() {
    // Initialize extractor
    const extractorSource: DataSource = {
      id: 'multi-source',
      name: 'Multi-Source Sports Data',
      type: 'api',
      config: {},
      priority: 1,
      enabled: true
    };

    const rateLimitConfig: RateLimitConfig = {
      maxRequests: 100,
      windowMs: 60000,
      strategy: 'sliding-window'
    };

    const retryPolicy: RetryPolicy = {
      maxAttempts: 3,
      initialDelayMs: 1000,
      maxDelayMs: 10000,
      backoffMultiplier: 2,
      retryableErrors: ['ECONNRESET', 'ETIMEDOUT', '429']
    };

    const cacheStrategy: CacheStrategy = {
      enabled: true,
      ttlSeconds: 300, // 5 minutes
      keyPrefix: 'etl:extract',
      storage: 'memory'
    };

    this.extractor = new MultiSourceExtractor(
      extractorSource,
      rateLimitConfig,
      retryPolicy,
      cacheStrategy
    );

    // Initialize transformer
    this.transformer = new MatchTransformer();

    // Initialize loader
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    
    this.loader = new SupabaseLoader(
      supabaseUrl,
      supabaseKey,
      100, // batch size
      'merge' // conflict strategy
    );
  }

  /**
   * Run the complete ETL pipeline
   */
  async run(params?: { date?: Date; league?: string }): Promise<PipelineMetrics[]> {
    if (this.status === 'running') {
      throw new Error('Pipeline is already running');
    }

    const executionId = this.generateExecutionId();
    const startTime = new Date();
    const metrics: PipelineMetrics[] = [];

    this.currentContext = {
      executionId,
      startTime,
      stage: 'extract',
      metadata: params || {},
      errors: []
    };

    this.status = 'running';
    this.emit('pipeline:start', { executionId, params });

    try {
      // Stage 1: Extract
      console.log(`\n🚀 Starting ETL Pipeline - Execution ID: ${executionId}`);
      console.log(`📅 Parameters: ${JSON.stringify(params)}`);
      
      const extractionResult = await this.runExtraction(params);
      metrics.push(this.createMetric('extract', startTime, new Date(), extractionResult.metadata.totalRecords, 0));

      // Stage 2: Transform
      this.currentContext.stage = 'transform';
      const transformStart = new Date();
      
      const transformationResult = await this.runTransformation(extractionResult.data);
      metrics.push(this.createMetric(
        'transform', 
        transformStart, 
        new Date(), 
        transformationResult.metadata.outputRecords,
        transformationResult.metadata.validationErrors
      ));

      // Stage 3: Load
      this.currentContext.stage = 'load';
      const loadStart = new Date();
      
      const loadingResult = await this.runLoading(transformationResult.data);
      metrics.push(this.createMetric(
        'load',
        loadStart,
        new Date(),
        loadingResult.metadata.recordsLoaded + loadingResult.metadata.recordsUpdated,
        loadingResult.metadata.recordsFailed
      ));

      // Success
      this.status = 'completed';
      this.emit('pipeline:complete', {
        executionId,
        duration: Date.now() - startTime.getTime(),
        metrics
      });

      console.log(`\n✅ Pipeline completed successfully!`);
      console.log(`📊 Total records processed: ${loadingResult.metadata.recordsLoaded + loadingResult.metadata.recordsUpdated}`);
      console.log(`⏱️  Total duration: ${Date.now() - startTime.getTime()}ms`);

      return metrics;

    } catch (error: any) {
      this.status = 'failed';
      this.currentContext.errors.push({
        stage: this.currentContext.stage,
        message: error.message,
        code: error.code || 'PIPELINE_ERROR',
        timestamp: new Date(),
        retryable: false
      });

      this.emit('pipeline:error', {
        executionId,
        stage: this.currentContext.stage,
        error
      });

      console.error(`\n❌ Pipeline failed at stage: ${this.currentContext.stage}`);
      console.error(error);

      throw error;
    } finally {
      this.status = 'idle';
    }
  }

  private async runExtraction(params?: { date?: Date; league?: string }) {
    this.emit('stage:start', { stage: 'extract' });
    
    try {
      const result = await this.extractor.extract(params);
      
      this.emit('stage:complete', {
        stage: 'extract',
        recordsProcessed: result.metadata.totalRecords
      });

      return result;
    } catch (error) {
      this.emit('stage:error', { stage: 'extract', error });
      throw error;
    }
  }

  private async runTransformation(rawData: any[]) {
    this.emit('stage:start', { stage: 'transform' });
    
    try {
      const result = await this.transformer.transform(rawData);
      
      this.emit('stage:complete', {
        stage: 'transform',
        recordsProcessed: result.metadata.outputRecords,
        validationErrors: result.metadata.validationErrors
      });

      return result;
    } catch (error) {
      this.emit('stage:error', { stage: 'transform', error });
      throw error;
    }
  }

  private async runLoading(enrichedData: any[]) {
    this.emit('stage:start', { stage: 'load' });
    
    try {
      const result = await this.loader.load(enrichedData);
      
      // Also load related entities (teams, leagues)
      await this.loader.loadRelatedEntities(enrichedData);
      
      this.emit('stage:complete', {
        stage: 'load',
        recordsLoaded: result.metadata.recordsLoaded,
        recordsUpdated: result.metadata.recordsUpdated,
        recordsFailed: result.metadata.recordsFailed
      });

      return result;
    } catch (error) {
      this.emit('stage:error', { stage: 'load', error });
      throw error;
    }
  }

  private generateExecutionId(): string {
    return `etl_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private createMetric(
    stage: 'extract' | 'transform' | 'load',
    startTime: Date,
    endTime: Date,
    recordsProcessed: number,
    recordsFailed: number
  ): PipelineMetrics {
    const duration = endTime.getTime() - startTime.getTime();
    
    return {
      executionId: this.currentContext!.executionId,
      stage,
      startTime,
      endTime,
      recordsProcessed,
      recordsFailed,
      averageLatency: duration / Math.max(recordsProcessed, 1),
      throughput: (recordsProcessed / duration) * 1000, // records per second
      errorRate: recordsProcessed > 0 ? recordsFailed / recordsProcessed : 0
    };
  }

  /**
   * Get current pipeline status
   */
  getStatus(): PipelineStatus {
    return this.status;
  }

  /**
   * Get current execution context
   */
  getContext(): PipelineContext | undefined {
    return this.currentContext;
  }

  /**
   * Schedule pipeline runs
   */
  schedule(cronExpression: string) {
    // TODO: Implement cron-based scheduling
    console.log(`📅 Pipeline scheduled with expression: ${cronExpression}`);
  }
}