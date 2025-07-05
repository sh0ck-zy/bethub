import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Extended fallback data for admin with additional fields
const fallbackMatches = [
  {
    id: '1',
    league: 'Premier League',
    home_team: 'Manchester United',
    away_team: 'Liverpool',
    kickoff_utc: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    status: 'PRE',
    is_published: true,
    analysis_status: 'completed'
  },
  {
    id: '2',
    league: 'La Liga',
    home_team: 'Real Madrid',
    away_team: 'Barcelona',
    kickoff_utc: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
    status: 'LIVE',
    is_published: true,
    analysis_status: 'pending'
  },
  {
    id: '3',
    league: 'Serie A',
    home_team: 'Juventus',
    away_team: 'AC Milan',
    kickoff_utc: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
    status: 'PRE',
    is_published: false,
    analysis_status: 'none'
  },
  {
    id: '4',
    league: 'Bundesliga',
    home_team: 'Bayern Munich',
    away_team: 'Borussia Dortmund',
    kickoff_utc: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
    status: 'PRE',
    is_published: false,
    analysis_status: 'failed'
  },
  {
    id: '5',
    league: 'Ligue 1',
    home_team: 'PSG',
    away_team: 'Monaco',
    kickoff_utc: new Date(Date.now() + 10 * 60 * 60 * 1000).toISOString(),
    status: 'PRE',
    is_published: true,
    analysis_status: 'completed'
  }
];

export async function GET(request: Request) {
  try {
    // Check admin authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Authorization required' }, { status: 401 });
    }

    // TODO: Verify the auth token and check admin role
    // For now, we'll rely on client-side auth checks
    
    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.warn('Supabase not configured, using fallback data');
      return NextResponse.json(fallbackMatches);
    }

    // Query matches with admin fields
    const { data, error } = await supabase
      .from('matches')
      .select(`
        *,
        is_published,
        analysis_status
      `)
      .order('kickoff_utc', { ascending: true });

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(fallbackMatches);
    }

    return NextResponse.json(data || fallbackMatches);
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(fallbackMatches);
  }
}