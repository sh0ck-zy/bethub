import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { authService } from '@/lib/auth';

// Fallback data for development when Supabase is not configured
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
    is_published: false,
    analysis_status: 'pending'
  },
  {
    id: '3',
    league: 'Serie A',
    home_team: 'Juventus',
    away_team: 'AC Milan',
    kickoff_utc: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
    status: 'PRE',
    is_published: true,
    analysis_status: 'none'
  }
];

export async function GET(request: Request) {
  try {
    // Check admin authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authorization required' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Verify the auth token and check admin role
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }
    
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
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}