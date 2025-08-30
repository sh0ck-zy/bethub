import { NextRequest, NextResponse } from 'next/server';
import { runETLPipeline, formatPipelineMetrics } from '@/lib/etl';

/**
 * API endpoint to trigger ETL pipeline manually
 * 
 * POST /api/v1/etl/run
 * Body: { date?: string, league?: string }
 */
export async function POST(request: NextRequest) {
  try {
    // Check for admin authorization (simplified for MVP)
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.includes('Bearer')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json().catch(() => ({}));
    const { date, league } = body;

    // Prepare parameters
    const params: { date?: Date; league?: string } = {};
    if (date) {
      params.date = new Date(date);
      if (isNaN(params.date.getTime())) {
        return NextResponse.json(
          { error: 'Invalid date format' },
          { status: 400 }
        );
      }
    }
    if (league) {
      params.league = league;
    }

    console.log(`\n🔧 Manual ETL pipeline triggered via API`);
    console.log(`Parameters:`, params);

    // Run the ETL pipeline
    const metrics = await runETLPipeline(params);

    // Format response
    const response = {
      success: true,
      executionId: metrics[0]?.executionId,
      summary: {
        totalRecords: metrics.reduce((sum, m) => sum + m.recordsProcessed, 0),
        totalErrors: metrics.reduce((sum, m) => sum + m.recordsFailed, 0),
        totalDuration: metrics.reduce((sum, m) => {
          const duration = m.endTime!.getTime() - m.startTime.getTime();
          return sum + duration;
        }, 0)
      },
      stages: metrics.map(m => ({
        stage: m.stage,
        recordsProcessed: m.recordsProcessed,
        recordsFailed: m.recordsFailed,
        duration: m.endTime!.getTime() - m.startTime.getTime(),
        throughput: m.throughput,
        errorRate: m.errorRate
      })),
      formattedMetrics: formatPipelineMetrics(metrics)
    };

    return NextResponse.json(response);

  } catch (error: any) {
    console.error('ETL pipeline error:', error);
    return NextResponse.json(
      { 
        error: 'ETL pipeline failed',
        message: error.message,
        stage: error.stage || 'unknown'
      },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint to check ETL pipeline status
 */
export async function GET(request: NextRequest) {
  // For now, return basic info
  // In production, this would check the actual pipeline status
  return NextResponse.json({
    status: 'ready',
    lastRun: null,
    scheduledJobs: [],
    availableSources: [
      'football-data',
      'api-sports',
      'sports-db'
    ]
  });
}