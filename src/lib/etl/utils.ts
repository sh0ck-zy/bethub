import { ETLConfig, DataSource, RateLimitConfig, MonitoringConfig } from './core/types';
import { PipelineOrchestrator } from './orchestrator/pipeline-orchestrator';

/**
 * Create default ETL configuration
 */
export function createDefaultETLConfig(): ETLConfig {
  const sources: DataSource[] = [
    {
      id: 'football-data',
      name: 'Football-Data.org',
      type: 'api',
      config: {
        baseUrl: 'https://api.football-data.org/v4',
        apiKey: process.env.FOOTBALL_DATA_API_KEY
      },
      priority: 1,
      enabled: !!process.env.FOOTBALL_DATA_API_KEY
    },
    {
      id: 'api-sports',
      name: 'API-Sports',
      type: 'api',
      config: {
        baseUrl: 'https://v3.football.api-sports.io',
        apiKey: process.env.API_SPORTS_KEY
      },
      priority: 2,
      enabled: !!process.env.API_SPORTS_KEY
    },
    {
      id: 'sports-db',
      name: 'TheSportsDB',
      type: 'api',
      config: {
        baseUrl: 'https://www.thesportsdb.com/api/v1/json',
        apiKey: '123' // Free tier key
      },
      priority: 3,
      enabled: true
    }
  ];

  const rateLimits = new Map<string, RateLimitConfig>([
    ['football-data', {
      maxRequests: 10,
      windowMs: 60000,
      strategy: 'fixed-window'
    }],
    ['api-sports', {
      maxRequests: 30,
      windowMs: 60000,
      strategy: 'sliding-window'
    }],
    ['sports-db', {
      maxRequests: 100,
      windowMs: 60000,
      strategy: 'fixed-window'
    }]
  ]);

  const monitoring: MonitoringConfig = {
    enableMetrics: true,
    enableTracing: true,
    enableLogging: true,
    logLevel: process.env.NODE_ENV === 'production' ? 'info' : 'debug'
  };

  return {
    sources,
    rateLimits,
    retryPolicy: {
      maxAttempts: 3,
      initialDelayMs: 1000,
      maxDelayMs: 10000,
      backoffMultiplier: 2,
      retryableErrors: ['ECONNRESET', 'ETIMEDOUT', '429', '503']
    },
    cacheStrategy: {
      enabled: true,
      ttlSeconds: 300,
      keyPrefix: 'bethub:etl',
      storage: 'memory'
    },
    monitoring
  };
}

/**
 * Convenience function to run ETL pipeline with default config
 */
export async function runETLPipeline(params?: { date?: Date; league?: string }) {
  const config = createDefaultETLConfig();
  const orchestrator = new PipelineOrchestrator(config);

  // Add event listeners for monitoring
  orchestrator.on('pipeline:start', (data) => {
    console.log('🚀 Pipeline started:', data);
  });

  orchestrator.on('stage:start', (data) => {
    console.log(`📍 Stage ${data.stage} started`);
  });

  orchestrator.on('stage:complete', (data) => {
    console.log(`✅ Stage ${data.stage} completed:`, data);
  });

  orchestrator.on('stage:error', (data) => {
    console.error(`❌ Stage ${data.stage} error:`, data.error);
  });

  orchestrator.on('pipeline:complete', (data) => {
    console.log('🎉 Pipeline completed:', data);
  });

  // Run the pipeline
  return orchestrator.run(params);
}

/**
 * Format pipeline metrics for display
 */
export function formatPipelineMetrics(metrics: any[]): string {
  let output = '\n📊 Pipeline Metrics:\n';
  output += '─'.repeat(50) + '\n';

  for (const metric of metrics) {
    const duration = metric.endTime.getTime() - metric.startTime.getTime();
    output += `\n${metric.stage.toUpperCase()}:\n`;
    output += `  • Records: ${metric.recordsProcessed} processed, ${metric.recordsFailed} failed\n`;
    output += `  • Duration: ${duration}ms\n`;
    output += `  • Throughput: ${metric.throughput.toFixed(2)} records/sec\n`;
    output += `  • Error Rate: ${(metric.errorRate * 100).toFixed(2)}%\n`;
  }

  output += '\n' + '─'.repeat(50);
  return output;
}

/**
 * Create a scheduled ETL job
 */
export function scheduleETLJob(cronExpression: string, params?: { league?: string }) {
  const config = createDefaultETLConfig();
  const orchestrator = new PipelineOrchestrator(config);

  // TODO: Integrate with a cron library like node-cron
  console.log(`📅 ETL job scheduled: ${cronExpression}`);
  
  return orchestrator;
}