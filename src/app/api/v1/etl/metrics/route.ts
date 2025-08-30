import { NextRequest, NextResponse } from 'next/server';
import { pipelineMonitor } from '@/lib/etl/monitoring/pipeline-monitor';

/**
 * ETL Pipeline metrics endpoint
 * GET /api/v1/etl/metrics?executionId=xxx&timeRange=1h
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const executionId = searchParams.get('executionId');
    const timeRange = searchParams.get('timeRange') || '1h';
    
    // Parse time range
    const timeRangeMs = parseTimeRange(timeRange);
    const startTime = new Date(Date.now() - timeRangeMs);
    const endTime = new Date();
    
    // Generate performance report
    const performanceReport = pipelineMonitor.generatePerformanceReport(executionId || undefined);
    
    // Get aggregated metrics for time range
    const aggregatedMetrics = pipelineMonitor.getAggregatedMetrics(startTime, endTime);
    
    // Get error statistics
    const errorStats = pipelineMonitor.getErrorStats(timeRangeMs);
    
    const response = {
      timeRange: {
        start: startTime.toISOString(),
        end: endTime.toISOString(),
        duration: timeRange
      },
      performance: {
        totalExecutions: performanceReport.totalExecutions,
        totalRecords: performanceReport.totalRecords,
        totalDuration: formatDuration(performanceReport.totalDuration),
        averageDuration: formatDuration(performanceReport.averageDuration),
        stages: Object.entries(performanceReport.stages).map(([stage, perf]) => ({
          stage,
          executionCount: perf.executionCount,
          totalRecords: perf.totalRecords,
          totalErrors: perf.totalErrors,
          averageDuration: formatDuration(perf.averageDuration),
          averageThroughput: `${perf.averageThroughput.toFixed(2)} records/sec`,
          errorRate: `${(perf.errorRate * 100).toFixed(2)}%`
        }))
      },
      aggregated: {
        totalExecutions: aggregatedMetrics.totalExecutions,
        totalRecords: aggregatedMetrics.totalRecords,
        totalErrors: aggregatedMetrics.totalErrors,
        successRate: `${(aggregatedMetrics.successRate * 100).toFixed(2)}%`,
        averageThroughput: `${aggregatedMetrics.averageThroughput.toFixed(2)} records/sec`
      },
      errors: {
        total: errorStats.total,
        errorRate: `${(errorStats.errorRate * 100).toFixed(2)}%`,
        byStage: errorStats.byStage,
        bySource: errorStats.bySource,
        topErrors: errorStats.topErrors
      },
      recommendations: performanceReport.recommendations
    };
    
    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Metrics error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to retrieve metrics',
        message: error.message 
      },
      { status: 500 }
    );
  }
}

/**
 * Parse time range string to milliseconds
 */
function parseTimeRange(timeRange: string): number {
  const units: Record<string, number> = {
    's': 1000,
    'm': 60000,
    'h': 3600000,
    'd': 86400000,
    'w': 604800000
  };
  
  const match = timeRange.match(/^(\d+)([smhdw])$/);
  if (!match) {
    return 3600000; // Default to 1 hour
  }
  
  const [, value, unit] = match;
  return parseInt(value) * (units[unit] || 3600000);
}

/**
 * Format duration in milliseconds to human-readable string
 */
function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(2)}s`;
  if (ms < 3600000) return `${(ms / 60000).toFixed(2)}m`;
  return `${(ms / 3600000).toFixed(2)}h`;
}