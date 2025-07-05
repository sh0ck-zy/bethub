import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Fallback data for development when Supabase is not configured
const fallbackMatches = [
  {
    id: '1',
    league: 'Premier League',
    home_team: 'Manchester United',
    away_team: 'Liverpool',
    kickoff_utc: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    status: 'PRE'
  },
  {
    id: '2',
    league: 'La Liga',
    home_team: 'Real Madrid',
    away_team: 'Barcelona',
    kickoff_utc: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
    status: 'LIVE'
  },
  {
    id: '3',
    league: 'Serie A',
    home_team: 'Juventus',
    away_team: 'AC Milan',
    kickoff_utc: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
    status: 'PRE'
  }
];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const region = searchParams.get('sb_region');
    const sport = searchParams.get('sport');
    const league = searchParams.get('league');

    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.warn('Supabase not configured, using fallback data');
      return NextResponse.json(fallbackMatches);
    }

    let query = supabase
      .from('matches')
      .select('*')
      .eq('is_published', true); // Only show published matches on public homepage

    if (sport) {
      query = query.eq('sport', sport);
    }
    if (league) {
      query = query.eq('league', league);
    }
    // TODO (backend): Implement region filtering for matches

    const { data, error } = await query;

    if (error) {
      console.error('Supabase error:', error);
      // Return fallback data instead of failing
      return NextResponse.json(fallbackMatches);
    }

    return NextResponse.json(data || fallbackMatches);
  } catch (error) {
    console.error('API error:', error);
    // Return fallback data on any error
    return NextResponse.json(fallbackMatches);
  }
}


