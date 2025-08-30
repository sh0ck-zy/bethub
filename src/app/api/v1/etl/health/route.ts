import { NextRequest, NextResponse } from 'next/server';
import { pipelineMonitor } from '@/lib/etl/monitoring/pipeline-monitor';

/**
 * ETL Pipeline health check endpoint
 * GET /api/v1/etl/health
 */
export async function GET(request: NextRequest) {
  try {
    // Perform health checks on all data sources
    const healthChecks = await pipelineMonitor.performHealthChecks();
    
    // Get error statistics for last hour
    const errorStats = pipelineMonitor.getErrorStats(3600000);
    
    // Get aggregated metrics for last 24 hours
    const last24h = new Date(Date.now() - 86400000);
    const aggregatedMetrics = pipelineMonitor.getAggregatedMetrics(last24h, new Date());
    
    // Determine overall health status
    const unhealthyChecks = healthChecks.filter(check => check.status === 'unhealthy');
    const overallStatus = unhealthyChecks.length === 0 ? 'healthy' : 
                         unhealthyChecks.length < healthChecks.length / 2 ? 'degraded' : 'unhealthy';
    
    const response = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      checks: healthChecks.map(check => ({
        name: check.name,
        status: check.status,
        responseTime: check.responseTime,
        lastCheck: check.lastCheck,
        error: check.error
      })),
      metrics: {
        last24Hours: {
          totalExecutions: aggregatedMetrics.totalExecutions,
          totalRecords: aggregatedMetrics.totalRecords,
          totalErrors: aggregatedMetrics.totalErrors,
          successRate: (aggregatedMetrics.successRate * 100).toFixed(2) + '%',
          averageThroughput: aggregatedMetrics.averageThroughput.toFixed(2) + ' records/sec'
        },
        lastHour: {
          totalErrors: errorStats.total,
          errorRate: (errorStats.errorRate * 100).toFixed(2) + '%',
          errorsByStage: errorStats.byStage,
          topErrors: errorStats.topErrors.slice(0, 3)
        }
      },
      recommendations: [
        unhealthyChecks.length > 0 && `${unhealthyChecks.length} data source(s) are unhealthy`,
        errorStats.errorRate > 0.05 && `High error rate detected (${(errorStats.errorRate * 100).toFixed(2)}%)`,
        aggregatedMetrics.averageThroughput < 50 && `Low throughput detected (${aggregatedMetrics.averageThroughput.toFixed(2)} records/sec)`
      ].filter(Boolean)
    };
    
    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Health check error:', error);
    return NextResponse.json(
      { 
        status: 'error',
        message: 'Failed to perform health check',
        error: error.message 
      },
      { status: 500 }
    );
  }
}