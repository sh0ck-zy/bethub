import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Fallback match data
const getFallbackMatch = (id: string) => ({
  id,
  league: id === '1' ? 'Premier League' : id === '2' ? 'La Liga' : 'Serie A',
  home_team: id === '1' ? 'Manchester United' : id === '2' ? 'Real Madrid' : 'Juventus',
  away_team: id === '1' ? 'Liverpool' : id === '2' ? 'Barcelona' : 'AC Milan',
  kickoff_utc: new Date().toISOString(),
  status: id === '2' ? 'LIVE' : 'PRE'
});

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Await params in Next.js 15+
    const { id } = await params;

    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.warn('Supabase not configured, using fallback data');
      return NextResponse.json({ 
        match: getFallbackMatch(id),
        latestSnapshot: null 
      });
    }

    const { data: match, error: matchError } = await supabase
      .from('matches')
      .select('*')
      .eq('id', id)
      .single();

    if (matchError) {
      console.error('Supabase match error:', matchError);
      return NextResponse.json({ 
        match: getFallbackMatch(id),
        latestSnapshot: null 
      });
    }

    const { data: latestSnapshot, error: snapshotError } = await supabase
      .from('analysis_snapshots')
      .select('*')
      .eq('match_id', id)
      .order('snapshot_ts', { ascending: false })
      .limit(1)
      .single();

    if (snapshotError) {
      // It's possible there are no snapshots yet, so don't return an error for that.
      console.warn('No analysis snapshot found for match:', id);
    }

    return NextResponse.json({ match, latestSnapshot });
  } catch (error) {
    console.error('API error:', error);
    const { id } = await params;
    return NextResponse.json({ 
      match: getFallbackMatch(id),
      latestSnapshot: null 
    });
  }
}


