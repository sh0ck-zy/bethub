import { EventEmitter } from 'events';
import { PipelineMetrics, PipelineError, PipelineStage } from '../core/types';

/**
 * Pipeline monitoring and observability service
 */
export class PipelineMonitor extends EventEmitter {
  private metrics: Map<string, PipelineMetrics[]> = new Map();
  private errors: Map<string, PipelineError[]> = new Map();
  private healthChecks: Map<string, HealthCheck> = new Map();

  constructor() {
    super();
    this.initializeHealthChecks();
  }

  private initializeHealthChecks() {
    // API health checks
    this.healthChecks.set('football-data', {
      name: 'Football-Data.org API',
      endpoint: 'https://api.football-data.org/v4/competitions',
      interval: 300000, // 5 minutes
      lastCheck: null,
      status: 'unknown',
      responseTime: null
    });

    this.healthChecks.set('api-sports', {
      name: 'API-Sports',
      endpoint: 'https://v3.football.api-sports.io/status',
      interval: 300000,
      lastCheck: null,
      status: 'unknown',
      responseTime: null
    });

    this.healthChecks.set('supabase', {
      name: 'Supabase Database',
      endpoint: process.env.NEXT_PUBLIC_SUPABASE_URL + '/rest/v1/',
      interval: 60000, // 1 minute
      lastCheck: null,
      status: 'unknown',
      responseTime: null
    });
  }

  /**
   * Record pipeline metrics
   */
  recordMetrics(executionId: string, metrics: PipelineMetrics) {
    if (!this.metrics.has(executionId)) {
      this.metrics.set(executionId, []);
    }
    this.metrics.get(executionId)!.push(metrics);
    
    this.emit('metrics:recorded', { executionId, metrics });
    
    // Check for anomalies
    this.checkForAnomalies(metrics);
  }

  /**
   * Record pipeline error
   */
  recordError(executionId: string, error: PipelineError) {
    if (!this.errors.has(executionId)) {
      this.errors.set(executionId, []);
    }
    this.errors.get(executionId)!.push(error);
    
    this.emit('error:recorded', { executionId, error });
    
    // Alert if critical error
    if (this.isCriticalError(error)) {
      this.emit('alert:critical', { executionId, error });
    }
  }

  /**
   * Get aggregated metrics for a time period
   */
  getAggregatedMetrics(startTime: Date, endTime: Date): AggregatedMetrics {
    const allMetrics: PipelineMetrics[] = [];
    
    for (const metrics of this.metrics.values()) {
      allMetrics.push(...metrics.filter(m => 
        m.startTime >= startTime && m.startTime <= endTime
      ));
    }

    return this.calculateAggregates(allMetrics);
  }

  /**
   * Get error statistics
   */
  getErrorStats(timeWindow: number = 3600000): ErrorStats {
    const cutoff = new Date(Date.now() - timeWindow);
    const recentErrors: PipelineError[] = [];
    
    for (const errors of this.errors.values()) {
      recentErrors.push(...errors.filter(e => e.timestamp >= cutoff));
    }

    return {
      total: recentErrors.length,
      byStage: this.groupErrorsByStage(recentErrors),
      bySource: this.groupErrorsBySource(recentErrors),
      errorRate: this.calculateErrorRate(cutoff),
      topErrors: this.getTopErrors(recentErrors, 5)
    };
  }

  /**
   * Perform health checks on all data sources
   */
  async performHealthChecks(): Promise<HealthCheckResult[]> {
    const results: HealthCheckResult[] = [];
    
    for (const [id, check] of this.healthChecks) {
      const result = await this.checkHealth(id, check);
      results.push(result);
    }
    
    return results;
  }

  /**
   * Get pipeline performance report
   */
  generatePerformanceReport(executionId?: string): PerformanceReport {
    const metrics = executionId 
      ? this.metrics.get(executionId) || []
      : Array.from(this.metrics.values()).flat();

    const stages: Record<PipelineStage, StagePerformance> = {
      extract: this.calculateStagePerformance(metrics, 'extract'),
      transform: this.calculateStagePerformance(metrics, 'transform'),
      load: this.calculateStagePerformance(metrics, 'load')
    };

    const totalDuration = metrics.reduce((sum, m) => {
      const duration = m.endTime ? m.endTime.getTime() - m.startTime.getTime() : 0;
      return sum + duration;
    }, 0);

    const totalRecords = metrics.reduce((sum, m) => sum + m.recordsProcessed, 0);

    return {
      executionId,
      totalExecutions: executionId ? 1 : this.metrics.size,
      totalDuration,
      totalRecords,
      averageDuration: totalDuration / Math.max(metrics.length, 1),
      stages,
      recommendations: this.generateRecommendations(metrics)
    };
  }

  private checkForAnomalies(metrics: PipelineMetrics) {
    // Check for high error rate
    if (metrics.errorRate && metrics.errorRate > 0.1) {
      this.emit('anomaly:detected', {
        type: 'high_error_rate',
        stage: metrics.stage,
        value: metrics.errorRate,
        threshold: 0.1
      });
    }

    // Check for low throughput
    if (metrics.throughput && metrics.throughput < 10) {
      this.emit('anomaly:detected', {
        type: 'low_throughput',
        stage: metrics.stage,
        value: metrics.throughput,
        threshold: 10
      });
    }

    // Check for high latency
    if (metrics.averageLatency && metrics.averageLatency > 1000) {
      this.emit('anomaly:detected', {
        type: 'high_latency',
        stage: metrics.stage,
        value: metrics.averageLatency,
        threshold: 1000
      });
    }
  }

  private isCriticalError(error: PipelineError): boolean {
    const criticalCodes = ['AUTH_FAILED', 'DATABASE_DOWN', 'RATE_LIMIT_EXCEEDED'];
    return criticalCodes.includes(error.code) || error.stage === 'load';
  }

  private calculateAggregates(metrics: PipelineMetrics[]): AggregatedMetrics {
    if (metrics.length === 0) {
      return {
        totalExecutions: 0,
        totalRecords: 0,
        totalErrors: 0,
        averageDuration: 0,
        averageThroughput: 0,
        successRate: 0
      };
    }

    const totalRecords = metrics.reduce((sum, m) => sum + m.recordsProcessed, 0);
    const totalErrors = metrics.reduce((sum, m) => sum + m.recordsFailed, 0);
    const totalDuration = metrics.reduce((sum, m) => {
      const duration = m.endTime ? m.endTime.getTime() - m.startTime.getTime() : 0;
      return sum + duration;
    }, 0);

    return {
      totalExecutions: new Set(metrics.map(m => m.executionId)).size,
      totalRecords,
      totalErrors,
      averageDuration: totalDuration / metrics.length,
      averageThroughput: metrics.reduce((sum, m) => sum + (m.throughput || 0), 0) / metrics.length,
      successRate: totalRecords > 0 ? (totalRecords - totalErrors) / totalRecords : 0
    };
  }

  private groupErrorsByStage(errors: PipelineError[]): Record<PipelineStage, number> {
    const grouped: Record<PipelineStage, number> = {
      extract: 0,
      transform: 0,
      load: 0
    };

    errors.forEach(error => {
      grouped[error.stage]++;
    });

    return grouped;
  }

  private groupErrorsBySource(errors: PipelineError[]): Record<string, number> {
    const grouped: Record<string, number> = {};

    errors.forEach(error => {
      const source = error.source || 'unknown';
      grouped[source] = (grouped[source] || 0) + 1;
    });

    return grouped;
  }

  private calculateErrorRate(since: Date): number {
    let totalRecords = 0;
    let totalErrors = 0;

    for (const metrics of this.metrics.values()) {
      const recentMetrics = metrics.filter(m => m.startTime >= since);
      totalRecords += recentMetrics.reduce((sum, m) => sum + m.recordsProcessed, 0);
      totalErrors += recentMetrics.reduce((sum, m) => sum + m.recordsFailed, 0);
    }

    return totalRecords > 0 ? totalErrors / totalRecords : 0;
  }

  private getTopErrors(errors: PipelineError[], limit: number): Array<{ message: string; count: number }> {
    const errorCounts = new Map<string, number>();

    errors.forEach(error => {
      const key = `${error.code}: ${error.message}`;
      errorCounts.set(key, (errorCounts.get(key) || 0) + 1);
    });

    return Array.from(errorCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([message, count]) => ({ message, count }));
  }

  private async checkHealth(id: string, check: HealthCheck): Promise<HealthCheckResult> {
    const startTime = Date.now();

    try {
      const response = await fetch(check.endpoint, {
        method: 'HEAD',
        signal: AbortSignal.timeout(5000)
      });

      const responseTime = Date.now() - startTime;
      check.lastCheck = new Date();
      check.responseTime = responseTime;
      check.status = response.ok ? 'healthy' : 'unhealthy';

      return {
        id,
        name: check.name,
        status: check.status,
        responseTime,
        lastCheck: check.lastCheck,
        error: response.ok ? undefined : `HTTP ${response.status}`
      };
    } catch (error: any) {
      check.lastCheck = new Date();
      check.status = 'unhealthy';
      
      return {
        id,
        name: check.name,
        status: 'unhealthy',
        responseTime: Date.now() - startTime,
        lastCheck: check.lastCheck,
        error: error.message
      };
    }
  }

  private calculateStagePerformance(metrics: PipelineMetrics[], stage: PipelineStage): StagePerformance {
    const stageMetrics = metrics.filter(m => m.stage === stage);
    
    if (stageMetrics.length === 0) {
      return {
        executionCount: 0,
        totalRecords: 0,
        totalErrors: 0,
        averageDuration: 0,
        averageThroughput: 0,
        errorRate: 0
      };
    }

    const totalRecords = stageMetrics.reduce((sum, m) => sum + m.recordsProcessed, 0);
    const totalErrors = stageMetrics.reduce((sum, m) => sum + m.recordsFailed, 0);
    const totalDuration = stageMetrics.reduce((sum, m) => {
      const duration = m.endTime ? m.endTime.getTime() - m.startTime.getTime() : 0;
      return sum + duration;
    }, 0);

    return {
      executionCount: stageMetrics.length,
      totalRecords,
      totalErrors,
      averageDuration: totalDuration / stageMetrics.length,
      averageThroughput: stageMetrics.reduce((sum, m) => sum + (m.throughput || 0), 0) / stageMetrics.length,
      errorRate: totalRecords > 0 ? totalErrors / totalRecords : 0
    };
  }

  private generateRecommendations(metrics: PipelineMetrics[]): string[] {
    const recommendations: string[] = [];

    // Analyze error rates
    const errorRate = this.calculateOverallErrorRate(metrics);
    if (errorRate > 0.05) {
      recommendations.push(`High error rate detected (${(errorRate * 100).toFixed(2)}%). Review data validation rules.`);
    }

    // Analyze throughput
    const avgThroughput = metrics.reduce((sum, m) => sum + (m.throughput || 0), 0) / metrics.length;
    if (avgThroughput < 50) {
      recommendations.push(`Low throughput (${avgThroughput.toFixed(2)} records/sec). Consider increasing batch sizes.`);
    }

    // Check for bottlenecks
    const stagedurations = this.getAverageStageDurations(metrics);
    const slowestStage = Object.entries(stagedurations).sort((a, b) => b[1] - a[1])[0];
    if (slowestStage && slowestStage[1] > 10000) {
      recommendations.push(`${slowestStage[0]} stage is slow (${(slowestStage[1] / 1000).toFixed(2)}s avg). Optimize this stage.`);
    }

    return recommendations;
  }

  private calculateOverallErrorRate(metrics: PipelineMetrics[]): number {
    const totalRecords = metrics.reduce((sum, m) => sum + m.recordsProcessed, 0);
    const totalErrors = metrics.reduce((sum, m) => sum + m.recordsFailed, 0);
    return totalRecords > 0 ? totalErrors / totalRecords : 0;
  }

  private getAverageStageDurations(metrics: PipelineMetrics[]): Record<PipelineStage, number> {
    const durations: Record<PipelineStage, number[]> = {
      extract: [],
      transform: [],
      load: []
    };

    metrics.forEach(m => {
      if (m.endTime) {
        const duration = m.endTime.getTime() - m.startTime.getTime();
        durations[m.stage].push(duration);
      }
    });

    return {
      extract: durations.extract.reduce((a, b) => a + b, 0) / Math.max(durations.extract.length, 1),
      transform: durations.transform.reduce((a, b) => a + b, 0) / Math.max(durations.transform.length, 1),
      load: durations.load.reduce((a, b) => a + b, 0) / Math.max(durations.load.length, 1)
    };
  }
}

// Type definitions
interface HealthCheck {
  name: string;
  endpoint: string;
  interval: number;
  lastCheck: Date | null;
  status: 'healthy' | 'unhealthy' | 'unknown';
  responseTime: number | null;
}

interface HealthCheckResult {
  id: string;
  name: string;
  status: 'healthy' | 'unhealthy' | 'unknown';
  responseTime: number;
  lastCheck: Date;
  error?: string;
}

interface AggregatedMetrics {
  totalExecutions: number;
  totalRecords: number;
  totalErrors: number;
  averageDuration: number;
  averageThroughput: number;
  successRate: number;
}

interface ErrorStats {
  total: number;
  byStage: Record<PipelineStage, number>;
  bySource: Record<string, number>;
  errorRate: number;
  topErrors: Array<{ message: string; count: number }>;
}

interface StagePerformance {
  executionCount: number;
  totalRecords: number;
  totalErrors: number;
  averageDuration: number;
  averageThroughput: number;
  errorRate: number;
}

interface PerformanceReport {
  executionId?: string;
  totalExecutions: number;
  totalDuration: number;
  totalRecords: number;
  averageDuration: number;
  stages: Record<PipelineStage, StagePerformance>;
  recommendations: string[];
}

// Export singleton instance
export const pipelineMonitor = new PipelineMonitor();