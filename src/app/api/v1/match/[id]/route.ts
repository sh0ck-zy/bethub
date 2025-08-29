import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';

// Football Data API Service (same as in today endpoint)
async function fetchFootballDataMatches() {
  const apiKey = process.env.FOOTBALL_DATA_API_KEY;
  if (!apiKey) {
    throw new Error('Football Data API key not configured');
  }

  const today = new Date();
  const endDate = new Date(today);
  endDate.setDate(today.getDate() + 7);

  const competitions = ['PL', 'CL', 'EL']; // Premier League, Champions League, Europa League
  let allMatches: any[] = [];

  for (const competition of competitions) {
    try {
      const response = await fetch(
        `https://api.football-data.org/v4/competitions/${competition}/matches?dateFrom=${today.toISOString().split('T')[0]}&dateTo=${endDate.toISOString().split('T')[0]}`,
        {
          headers: {
            'X-Auth-Token': apiKey,
          },
        }
      );

      if (!response.ok) {
        console.warn(`Football Data API error for ${competition}:`, response.status);
        continue;
      }

      const data = await response.json();
      allMatches = allMatches.concat(data.matches || []);
    } catch (error) {
      console.warn(`Error fetching ${competition} matches:`, error);
    }
  }

  return allMatches;
}

// Transform Football Data API response to our format
function transformMatch(apiMatch: any) {
  return {
    id: `fd-${apiMatch.id}`,
    league: apiMatch.competition?.name || 'Unknown League',
    home_team: apiMatch.homeTeam?.name || 'Home Team',
    away_team: apiMatch.awayTeam?.name || 'Away Team',
    kickoff_utc: apiMatch.utcDate,
    status: mapStatus(apiMatch.status),
    venue: apiMatch.venue || 'TBD',
    referee: apiMatch.referees?.[0]?.name || null,
    odds: null,
    home_score: apiMatch.score?.fullTime?.home,
    away_score: apiMatch.score?.fullTime?.away,
    current_minute: apiMatch.minute || null,
    is_published: true,
    analysis_status: 'none',
    created_at: new Date().toISOString(),
    // Include logos from Football-Data API
    home_team_logo: apiMatch.homeTeam?.crest,
    away_team_logo: apiMatch.awayTeam?.crest,
    league_logo: apiMatch.competition?.emblem,
  };
}

// Map Football Data status to our status format
function mapStatus(fdStatus: string) {
  const statusMap: { [key: string]: string } = {
    'SCHEDULED': 'PRE',
    'LIVE': 'LIVE',
    'IN_PLAY': 'LIVE',
    'PAUSED': 'LIVE',
    'FINISHED': 'FT',
    'POSTPONED': 'POSTPONED',
    'CANCELLED': 'CANCELLED',
  };
  return statusMap[fdStatus] || 'PRE';
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const matchId = params.id;
    
    if (!matchId) {
      return NextResponse.json({ error: 'Match ID is required' }, { status: 400 });
    }

    // First, try to get match data from database
    const supabase = getSupabaseServer();
    const { data: dbMatch, error: matchError } = await supabase
      .from('matches')
      .select('*')
      .eq('id', matchId)
      .eq('is_published', true) // Only return published matches for public endpoint
      .single();

    // If found in database, get analysis and return
    if (dbMatch && !matchError) {
      // Get analysis data if available
      const { data: analysis } = await supabase
        .from('analysis_snapshots')
        .select('*')
        .eq('match_id', matchId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      return NextResponse.json({
        success: true,
        match: {
          ...dbMatch,
          analysis: analysis || null
        }
      });
    }

    // If not found in database, try to fetch from external APIs
    console.log(`Match ${matchId} not found in database, trying external APIs...`);

    // Check if this is a Football-Data API ID (starts with 'fd-')
    if (matchId.startsWith('fd-')) {
      try {
        const apiMatches = await fetchFootballDataMatches();
        const foundMatch = apiMatches.find(m => `fd-${m.id}` === matchId);
        
        if (foundMatch) {
          const transformedMatch = transformMatch(foundMatch);
          
          return NextResponse.json({
            success: true,
            match: {
              ...transformedMatch,
              analysis: null // External API matches don't have analysis yet
            }
          });
        }
      } catch (error) {
        console.warn('Error fetching from Football Data API:', error);
      }
    }

    // Match not found anywhere
    return NextResponse.json({ error: 'Match not found' }, { status: 404 });

  } catch (error) {
    console.error('Error fetching match:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}