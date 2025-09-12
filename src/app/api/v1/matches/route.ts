import { NextRequest, NextResponse } from 'next/server';
import { fallbackMatchService } from '@/lib/fallback-match-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const isAdmin = searchParams.get('admin') === 'true';
    const status = searchParams.get('status'); // live, upcoming, finished
    const league = searchParams.get('league');
    const limit = parseInt(searchParams.get('limit') || (isAdmin ? '50' : '200'));
    
    console.log(`📋 Fetching matches (${isAdmin ? 'admin' : 'public'} view)...`);
    
    // Get all matches from our clean service
    const allMatches = await fallbackMatchService.getMatchesSafely();
    
    let matches;
    let metadata;
    
    if (isAdmin) {
      // Admin view: Show ALL matches with full metadata
      matches = allMatches;
      
      metadata = {
        total: allMatches.length,
        published: allMatches.filter(m => m.is_published).length,
        unpublished: allMatches.filter(m => !m.is_published).length,
        by_status: allMatches.reduce((acc, match) => {
          acc[match.status] = (acc[match.status] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      };
      
      console.log(`📊 Admin view: ${metadata.total} total matches (${metadata.published} published, ${metadata.unpublished} unpublished)`);
      
    } else {
      // Public view: Show ONLY published matches
      matches = allMatches.filter(match => match.is_published === true);
      
      metadata = {
        total: matches.length,
        live_matches: matches.filter(m => m.status === 'LIVE').length,
        upcoming_matches: matches.filter(m => m.status === 'PRE').length,
        completed_matches: matches.filter(m => m.status === 'FT').length
      };
      
      console.log(`👥 Public view: ${metadata.total} published matches`);
    }
    
    // Apply filters
    if (status) {
      const statusMap: Record<string, string> = {
        'live': 'LIVE',
        'upcoming': 'PRE', 
        'finished': 'FT'
      };
      if (statusMap[status]) {
        matches = matches.filter(m => m.status === statusMap[status]);
      }
    }
    
    if (league) {
      matches = matches.filter(m => m.league.toLowerCase().includes(league.toLowerCase()));
    }
    
    // Sort by kickoff time and apply limit
    matches.sort((a, b) => new Date(a.kickoff_utc).getTime() - new Date(b.kickoff_utc).getTime());
    matches = matches.slice(0, limit);
    
    return NextResponse.json({
      success: true,
      matches,
      metadata,
      view: isAdmin ? 'admin' : 'public'
    });
    
  } catch (error) {
    console.error('❌ Get matches error:', error);
    
    return NextResponse.json({
      success: false,
      matches: [],
      error: error instanceof Error ? error.message : 'Failed to fetch matches'
    }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, matchIds } = body;
    
    if (!action || !matchIds || !Array.isArray(matchIds)) {
      return NextResponse.json({
        success: false,
        error: 'Action and matchIds array are required'
      }, { status: 400 });
    }
    
    console.log(`🔧 Admin: Bulk action '${action}' on ${matchIds.length} matches...`);
    
    // Import Supabase here to avoid circular dependencies
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    let updateData: any = {};
    
    switch (action) {
      case 'publish':
        updateData = { is_published: true, updated_at: new Date().toISOString() };
        break;
      case 'unpublish':
        updateData = { is_published: false, updated_at: new Date().toISOString() };
        break;
      default:
        return NextResponse.json({
          success: false,
          error: `Unknown action: ${action}. Supported actions: publish, unpublish`
        }, { status: 400 });
    }
    
    // Update matches in batches to avoid overwhelming the database
    let updated = 0;
    const errors: string[] = [];
    
    for (const matchId of matchIds) {
      try {
        const { error } = await supabase
          .from('matches')
          .update(updateData)
          .eq('id', matchId);
        
        if (error) {
          errors.push(`Failed to ${action} match ${matchId}: ${error.message}`);
        } else {
          updated++;
        }
      } catch (err) {
        errors.push(`Error processing match ${matchId}: ${err}`);
      }
    }
    
    console.log(`✅ Bulk ${action}: ${updated} matches updated, ${errors.length} errors`);
    
    return NextResponse.json({
      success: errors.length === 0,
      data: {
        action,
        total_requested: matchIds.length,
        matches_updated: updated,
        errors: errors.slice(0, 5), // Limit error display
        message: `${action} completed: ${updated} matches updated${errors.length > 0 ? ` (${errors.length} errors)` : ''}`
      }
    });
    
  } catch (error) {
    console.error('❌ Bulk action error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to perform bulk action'
    }, { status: 500 });
  }
}