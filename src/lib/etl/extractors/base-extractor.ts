import { ExtractionResult, DataSource, RateLimitConfig, RetryPolicy, CacheStrategy, PipelineError } from '../core/types';

/**
 * Base class for all data extractors
 */
export abstract class BaseExtractor<T = any> {
  protected source: DataSource;
  protected rateLimitConfig: RateLimitConfig;
  protected retryPolicy: RetryPolicy;
  protected cacheStrategy: CacheStrategy;

  constructor(
    source: DataSource,
    rateLimitConfig: RateLimitConfig,
    retryPolicy: RetryPolicy,
    cacheStrategy: CacheStrategy
  ) {
    this.source = source;
    this.rateLimitConfig = rateLimitConfig;
    this.retryPolicy = retryPolicy;
    this.cacheStrategy = cacheStrategy;
  }

  /**
   * Extract data from the source
   */
  abstract extract(params?: Record<string, any>): Promise<ExtractionResult<T>>;

  /**
   * Validate extracted data
   */
  protected abstract validateExtractedData(data: any): boolean;

  /**
   * Handle extraction errors
   */
  protected handleError(error: any): PipelineError {
    return {
      stage: 'extract',
      source: this.source.name,
      message: error.message || 'Unknown extraction error',
      code: error.code || 'EXTRACTION_ERROR',
      timestamp: new Date(),
      retryable: this.isRetryableError(error),
      details: {
        sourceId: this.source.id,
        error: error.stack || error.toString()
      }
    };
  }

  /**
   * Check if error is retryable
   */
  protected isRetryableError(error: any): boolean {
    const retryableCodes = ['ECONNRESET', 'ETIMEDOUT', 'ENOTFOUND'];
    const retryableStatuses = [429, 500, 502, 503, 504];
    
    if (error.code && retryableCodes.includes(error.code)) {
      return true;
    }
    
    if (error.status && retryableStatuses.includes(error.status)) {
      return true;
    }
    
    if (this.retryPolicy.retryableErrors?.includes(error.code || error.message)) {
      return true;
    }
    
    return false;
  }

  /**
   * Sleep for specified milliseconds
   */
  protected sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Execute with retry logic
   */
  protected async executeWithRetry<R>(
    operation: () => Promise<R>,
    attempt = 1
  ): Promise<R> {
    try {
      return await operation();
    } catch (error) {
      if (attempt >= this.retryPolicy.maxAttempts || !this.isRetryableError(error)) {
        throw error;
      }

      const delay = Math.min(
        this.retryPolicy.initialDelayMs * Math.pow(this.retryPolicy.backoffMultiplier, attempt - 1),
        this.retryPolicy.maxDelayMs
      );

      console.log(`⚠️  Retry attempt ${attempt}/${this.retryPolicy.maxAttempts} after ${delay}ms for ${this.source.name}`);
      await this.sleep(delay);

      return this.executeWithRetry(operation, attempt + 1);
    }
  }

  /**
   * Get cache key for request
   */
  protected getCacheKey(params?: Record<string, any>): string {
    const baseKey = `${this.cacheStrategy.keyPrefix}:${this.source.id}`;
    if (!params || Object.keys(params).length === 0) {
      return baseKey;
    }
    const paramStr = Object.entries(params)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}:${v}`)
      .join(':');
    return `${baseKey}:${paramStr}`;
  }
}