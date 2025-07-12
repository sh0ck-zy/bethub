import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with service role for admin operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
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
      homeTeam: match.home_team,
      awayTeam: match.away_team,
      kickoffUtc: match.kickoff_utc,
      status: match.status,
      isPublished: match.is_published,
      analysisStatus: match.analysis_status,
      createdAt: match.created_at
    })) || [];

    return NextResponse.json({
      success: true,
      matches: transformedMatches,
      total: transformedMatches.length,
      source: 'database-published',
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


