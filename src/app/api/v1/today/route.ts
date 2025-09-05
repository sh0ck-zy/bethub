import { NextResponse } from 'next/server';
import { getSupabaseServer, isSupabaseConfigured } from '@/lib/supabase-server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const isAdmin = searchParams.get('admin') === 'true';
    
    console.log('🏠 Homepage requesting upcoming matches, admin view:', isAdmin);

    if (!isSupabaseConfigured()) {
      return NextResponse.json({
        success: false,
        error: 'Database is not configured'
      }, { status: 503 });
    }

    const supabase = getSupabaseServer();

    // Get upcoming published matches (next 14 days)
    const today = new Date();
    const twoWeeksLater = new Date(today);
    twoWeeksLater.setDate(today.getDate() + 14);

    const { data: matches, error } = await supabase
      .from('matches')
      .select('*')
      .eq('is_published', true)
      .gte('kickoff_utc', today.toISOString())
      .lte('kickoff_utc', twoWeeksLater.toISOString())
      .order('kickoff_utc', { ascending: true })
      .limit(20);

    if (error) {
      console.error('Today matches query error:', error);
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 500 });
    }

    const upcomingMatches = matches || [];
    console.log(`📊 Fetched ${upcomingMatches.length} published matches from database`);

      // If no published matches found, show empty state
    if (upcomingMatches.length === 0) {
      const message = isAdmin 
        ? 'No published matches found. Use the admin panel to pull, analyze, and publish matches.'
        : 'No matches available at the moment. Please check back later.';
      
      console.log('⚠️ No published matches found in upcoming date range.');
      
      return NextResponse.json({
        success: true,
        matches: [],
        total: 0,
        source: 'database-empty',
        message
      });
    }

    // Auto-select spotlight match: first live match, then first upcoming match
    let spotlightMatch = null;
    if (upcomingMatches.length > 0) {
      const liveMatch = upcomingMatches.find(m => m.status === 'LIVE');
      const upcomingMatch = upcomingMatches.find(m => m.status === 'PRE');
      const finishedMatch = upcomingMatches.find(m => m.status === 'FT');
      spotlightMatch = liveMatch || upcomingMatch || finishedMatch;
    }

    return NextResponse.json({
      success: true,
      matches: upcomingMatches,
      total: upcomingMatches.length,
      source: 'database-published',
      spotlight_match: spotlightMatch,
      message: `Found ${upcomingMatches.length} published matches`,
      metadata: {
        last_updated: new Date().toISOString(),
        data_freshness: "Real-time",
        total_leagues: [...new Set(upcomingMatches.map(m => m.league))].length
      }
    }, {
      headers: {
        'Cache-Control': 'public, max-age=60, stale-while-revalidate=300'
      }
    });

  } catch (error) {
    console.error('Today API error:', error);
    
    return NextResponse.json({
      success: false,
      matches: [],
      total: 0,
      source: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}


