import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Verify cron authorization (optional)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET || 'dev-secret';
    
    if (authHeader !== `Bearer ${cronSecret}`) {
      console.log('⚠️ Unauthorized cron request');
      // Allow in development, block in production without proper auth
      if (process.env.NODE_ENV === 'production') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    console.log('⏰ Cron job triggered: Autonomous sync');

    // Call the autonomous sync endpoint
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const syncResponse = await fetch(`${baseUrl}/api/v1/admin/autonomous-sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const syncResult = await syncResponse.json();

    if (!syncResponse.ok) {
      console.error('❌ Cron sync failed:', syncResult);
      return NextResponse.json({
        success: false,
        error: 'Sync failed',
        details: syncResult
      }, { status: 500 });
    }

    console.log('✅ Cron sync completed:', syncResult.stats);

    return NextResponse.json({
      success: true,
      message: 'Cron autonomous sync completed',
      timestamp: new Date().toISOString(),
      stats: syncResult.stats
    });

  } catch (error) {
    console.error('❌ Cron job error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
