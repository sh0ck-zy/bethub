import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer, isSupabaseConfigured } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  try {
    // Skip complex authentication for now - development mode
    if (!isSupabaseConfigured()) {
      return NextResponse.json({
        success: false,
        error: 'Database is not configured'
      }, { status: 503 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const status = searchParams.get('status'); // 'published', 'unpublished', 'all'
    const league = searchParams.get('league');
    
    const supabase = getSupabaseServer();
    
    // Simple query to get matches
    let query = supabase
      .from('matches')
      .select('*', { count: 'exact' })
      .order('kickoff_utc', { ascending: true })
      .range((page - 1) * limit, page * limit - 1);

    // Apply basic filters
    if (status === 'published') {
      query = query.eq('is_published', true);
    } else if (status === 'unpublished') {
      query = query.eq('is_published', false);
    }

    if (league) {
      query = query.eq('league', league);
    }

    console.log('📋 Admin API: Fetching matches with simple query');

    const { data: matches, error, count } = await query;

    if (error) {
      console.error('Admin matches query error:', error);
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 500 });
    }

    // Get unique leagues for filtering
    const { data: leagues } = await supabase
      .from('matches')
      .select('league')
      .neq('league', null);

    const uniqueLeagues = [...new Set(leagues?.map(l => l.league) || [])];

    console.log(`📊 Admin fetched ${matches?.length || 0} matches (page ${page})`);

    return NextResponse.json({
      success: true,
      matches: matches || [],
      total: count || 0,
      page,
      limit,
      leagues: uniqueLeagues,
      filters: { status, league },
      source: 'database-simple'
    });
    
  } catch (error) {
    console.error('Admin API error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch matches',
      matches: [],
      total: 0
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { match } = await request.json();
    
    if (!match) {
      return NextResponse.json({
        success: false,
        error: 'Match data is required'
      }, { status: 400 });
    }
    
    console.log('📥 Admin API: Manual match insertion:', match);
    
    // Insert match directly using Supabase client
    const supabase = getSupabaseServer();
    
    const { data, error } = await supabase
      .from('matches')
      .upsert({
        id: match.id,
        external_id: match.external_id,
        data_source: match.data_source,
        league: match.league,
        home_team: match.home_team,
        away_team: match.away_team,
        kickoff_utc: match.kickoff_utc,
        status: match.status,
        home_score: match.home_score,
        away_score: match.away_score,
        is_published: match.is_published || false,
        is_pulled: match.is_pulled || true,
        is_analyzed: match.is_analyzed || false,
        analysis_status: match.analysis_status || 'none',
        analysis_priority: match.analysis_priority || 'normal',
        created_at: match.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'external_id,data_source',
        ignoreDuplicates: false
      })
      .select('*');
    
    if (error) {
      console.error('Upsert error:', error);
      throw error;
    }
    
    console.log('✅ Match upserted successfully:', data[0]);
    
    return NextResponse.json({
      success: true,
      data: { match: data[0] }
    });
    
  } catch (error) {
    console.error('Manual match insert error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to insert match'
    }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { action } = await request.json();
    const supabase = getSupabaseServer();
    
    if (action === 'unpublish_all') {
      console.log('👁️‍🗨️ Unpublishing ALL matches from homepage...');
      
      const { error } = await supabase
        .from('matches')
        .update({ 
          is_published: false,
          updated_at: new Date().toISOString()
        })
        .eq('is_published', true); // Only update currently published matches
      
      if (error) {
        console.error('Unpublish all matches error:', error);
        return NextResponse.json({
          success: false,
          error: error.message
        }, { status: 500 });
      }
      
      console.log('✅ All matches unpublished from homepage');
      
      return NextResponse.json({
        success: true,
        message: 'All matches unpublished from homepage'
      });
    }
    
    return NextResponse.json({
      success: false,
      error: 'Invalid action'
    }, { status: 400 });
    
  } catch (error) {
    console.error('PATCH matches error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update matches'
    }, { status: 500 });
  }
}