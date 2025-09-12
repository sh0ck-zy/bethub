import { NextRequest, NextResponse } from 'next/server';
import { matchService } from '@/lib/match-service';

export async function GET(request: NextRequest) {
  try {
    console.log('🔧 Admin: Fetching all matches for admin panel');
    
    // Get all matches and statistics using the robust service
    const [allMatches, stats] = await Promise.all([
      matchService.getMatches(),
      matchService.getMatchStats()
    ]);
    
    console.log(`📊 Admin: Fetched ${allMatches.length} matches from database`);
    
    return NextResponse.json({
      success: true,
      matches: allMatches,
      total: allMatches.length,
      metadata: {
        published: stats.published,
        unpublished: stats.unpublished,
        analyzed: stats.analyzed,
        pending_analysis: stats.total - stats.analyzed,
        by_data_source: stats.byDataSource,
        by_status: stats.byStatus,
        by_league: stats.byLeague
      }
    });
    
  } catch (error) {
    console.error('❌ Admin matches API error:', error);
    
    return NextResponse.json({
      success: false,
      matches: [],
      total: 0,
      error: error instanceof Error ? error.message : 'Failed to fetch matches'
    }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;
    
    console.log(`🔧 Admin: Bulk action - ${action}`);
    
    if (action === 'unpublish_all') {
      // Get all published matches and unpublish them
      const publishedMatches = await matchService.getMatches({ published: true });
      
      // Update each match (in a real app, you'd want a bulk update method)
      let updated = 0;
      const errors: string[] = [];
      
      for (const match of publishedMatches) {
        try {
          // Here we'd need to add an update method to the service
          // For now, fall back to direct Supabase call
          const { createClient } = await import('@supabase/supabase-js');
          const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
          );
          
          const { error } = await supabase
            .from('matches')
            .update({ is_published: false, updated_at: new Date().toISOString() })
            .eq('id', match.id);
          
          if (error) {
            errors.push(`Failed to unpublish match ${match.id}: ${error.message}`);
          } else {
            updated++;
          }
        } catch (err) {
          errors.push(`Error processing match ${match.id}: ${err}`);
        }
      }
      
      if (errors.length > 0) {
        console.error('Bulk unpublish errors:', errors);
        return NextResponse.json({
          success: false,
          error: `Unpublished ${updated} matches, but encountered ${errors.length} errors`,
          details: { updated, errors }
        }, { status: 207 });
      }
      
      return NextResponse.json({
        success: true,
        message: `Successfully unpublished ${updated} matches`
      });
    }
    
    return NextResponse.json({
      success: false,
      error: 'Unknown action'
    }, { status: 400 });
    
  } catch (error) {
    console.error('❌ Admin bulk action error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to perform bulk action'
    }, { status: 500 });
  }
}