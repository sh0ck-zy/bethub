import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with service role for admin operations, fallback to anon key
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET() {
  try {
    // Fetch only published matches from the database
    const { data: matches, error } = await supabase
      .from('matches')
      .select(`
        id,
        league,
        home_team,
        away_team,
        kickoff_utc,
        status,
        is_published,
        analysis_status,
        created_at
      `)
      .eq('is_published', true)
      .order('kickoff_utc', { ascending: true });

    if (error) {
      console.error('Database error:', error);
      // Fallback to mock data if database fails
      return NextResponse.json({
        success: true,
        matches: [],
        total: 0,
        source: 'fallback-empty',
        error: 'Database connection failed'
      });
    }

    // Transform database format to match frontend expectations
    const transformedMatches = matches?.map(match => ({
      id: match.id,
      league: match.league,
      home_team: match.home_team,
      away_team: match.away_team,
      kickoff_utc: match.kickoff_utc,
      status: match.status,
      is_published: match.is_published,
      analysis_status: match.analysis_status,
      created_at: match.created_at
    })) || [];

    // Get spotlight match from settings
    let spotlightMatch = null;
    try {
      const { data: settings } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'spotlight_match_id')
        .single();

      if (settings?.value) {
        spotlightMatch = transformedMatches.find(match => match.id === settings.value);
      }
    } catch (settingsError) {
      console.log('No spotlight match set, will use auto-selection');
    }

    // If no spotlight match is set, use the first live match, then first upcoming match
    if (!spotlightMatch && transformedMatches.length > 0) {
      const liveMatch = transformedMatches.find(m => m.status === 'LIVE');
      const upcomingMatch = transformedMatches.find(m => m.status === 'PRE');
      const finishedMatch = transformedMatches.find(m => m.status === 'FT');
      spotlightMatch = liveMatch || upcomingMatch || finishedMatch;
    }

    return NextResponse.json({
      success: true,
      matches: transformedMatches,
      total: transformedMatches.length,
      source: 'database-published',
      spotlight_match: spotlightMatch,
    });

  } catch (error) {
    console.error('API error:', error);
    
    // Fallback to empty array if something goes wrong
    return NextResponse.json({
      success: true,
      matches: [],
      total: 0,
      source: 'error-fallback',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}


