import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/auth';
import { dataSync } from '@/lib/api/sync';

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'No authorization token provided' }, { status: 401 });
    }

    const user = await authService.verifyToken(token);
    
    if (!user || !user.isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Parse request body
    const body = await request.json();
    const { 
      type = 'today', 
      force = false, 
      dryRun = false,
      logProgress = true 
    } = body;

    // Perform sync based on type
    let result;
    
    switch (type) {
      case 'today':
        result = await dataSync.syncTodayMatches({ 
          force, 
          dryRun, 
          logProgress 
        });
        break;
        
      case 'cleanup':
        const deletedCount = await dataSync.cleanupOldMatches();
        result = {
          success: true,
          matchesDeleted: deletedCount,
          matchesAdded: 0,
          matchesUpdated: 0
        };
        break;
        
      case 'health':
        const isHealthy = await dataSync.healthCheck();
        result = {
          success: isHealthy,
          health: isHealthy,
          status: dataSync.getSyncStatus()
        };
        break;
        
      default:
        return NextResponse.json({ 
          error: 'Invalid sync type. Use: today, cleanup, or health' 
        }, { status: 400 });
    }

    if (!result.success) {
      return NextResponse.json({ 
        error: result.error || 'Sync failed' 
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `Sync completed successfully`,
      data: result
    });

  } catch (error) {
    console.error('[Admin Sync API] Error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'No authorization token provided' }, { status: 401 });
    }

    const user = await authService.verifyToken(token);
    
    if (!user || !user.isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Get sync status
    const status = dataSync.getSyncStatus();
    const health = await dataSync.healthCheck();

    return NextResponse.json({
      success: true,
      data: {
        status,
        health,
        lastSync: status.lastSyncTime?.toISOString() || null,
        isRunning: status.isRunning
      }
    });

  } catch (error) {
    console.error('[Admin Sync API] Error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
} 