import { NextResponse } from 'next/server';

// Football Data API Service
async function fetchFootballDataMatches() {
  const apiKey = process.env.FOOTBALL_DATA_API_KEY;
  if (!apiKey) {
    throw new Error('Football Data API key not configured');
  }

  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 7); // Get matches for next 7 days

  const dateFrom = today.toISOString().split('T')[0];
  const dateTo = tomorrow.toISOString().split('T')[0];

  // Fetch matches from multiple top leagues
  const competitions = [
    'PL', // Premier League
    'PD', // La Liga  
    'BL1', // Bundesliga
    'SA', // Serie A
    'FL1', // Ligue 1
    'CL', // Champions League
    'EL' // Europa League
  ];

  const allMatches = [];

  for (const competition of competitions) {
    try {
      const response = await fetch(
        `https://api.football-data.org/v4/competitions/${competition}/matches?dateFrom=${dateFrom}&dateTo=${dateTo}`,
        {
          headers: {
            'X-Auth-Token': apiKey,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.matches) {
          allMatches.push(...data.matches);
        }
      }
    } catch (error) {
      console.error(`Error fetching ${competition} matches:`, error);
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
    'TIMED': 'PRE', 
    'IN_PLAY': 'LIVE',
    'PAUSED': 'LIVE',
    'FINISHED': 'FT',
    'POSTPONED': 'POSTPONED',
    'CANCELLED': 'CANCELLED'
  };
  return statusMap[fdStatus] || 'PRE';
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const isAdmin = searchParams.get('admin') === 'true';
    
    console.log('🏠 Homepage requesting matches, admin:', isAdmin);

    let matches = [];

    // Try to fetch real matches first
    try {
      const apiMatches = await fetchFootballDataMatches();
      matches = apiMatches.map(transformMatch);
      console.log(`📡 Fetched ${matches.length} real matches from Football Data API`);
    } catch (error) {
      console.error('Failed to fetch real matches, using fallback:', error);
      
      // Fallback to minimal mock data if API fails
      matches = [
        {
          id: 'mock-1',
          league: 'Premier League',
          home_team: 'Arsenal',
          away_team: 'Chelsea',
          kickoff_utc: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
          status: 'PRE',
          venue: 'Emirates Stadium',
          referee: null,
          odds: null,
          home_score: null,
          away_score: null,
          current_minute: null,
          is_published: true,
          analysis_status: 'none',
          created_at: new Date().toISOString(),
        }
      ];
    }

    // Filter to max 20 matches for performance
    const limitedMatches = matches.slice(0, 20);

    // Auto-select spotlight match: first live match, then first upcoming match
    let spotlightMatch = null;
    if (limitedMatches.length > 0) {
      const liveMatch = limitedMatches.find(m => m.status === 'LIVE');
      const upcomingMatch = limitedMatches.find(m => m.status === 'PRE');
      const finishedMatch = limitedMatches.find(m => m.status === 'FT');
      spotlightMatch = liveMatch || upcomingMatch || finishedMatch;
    }

    return NextResponse.json({
      success: true,
      matches: limitedMatches,
      total: limitedMatches.length,
      source: matches.length > 1 ? 'football-data-api' : 'fallback',
      spotlight_match: spotlightMatch,
    }, {
      headers: {
        'Cache-Control': 'public, max-age=60, stale-while-revalidate=300'
      }
    });

  } catch (error) {
    console.error('API error:', error);
    
    // Fallback to empty array if something goes wrong
    return NextResponse.json({
      success: false,
      matches: [],
      total: 0,
      source: 'error-fallback',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}


