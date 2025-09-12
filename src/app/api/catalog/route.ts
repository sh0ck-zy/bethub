import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

interface Team {
  id: string;
  name: string;
  short_name: string;
  logo_url?: string;
  country: string;
  founded?: number;
}

interface League {
  id: string;
  name: string;
  country: string;
  logo_url?: string;
  teams: Team[];
}

interface CatalogData {
  leagues: League[];
  totalTeams: number;
  totalLeagues: number;
}

export async function GET() {
  try {
    console.log('Fetching catalog data from matches table...');
    
    // Fetch matches from database to extract leagues and teams
    const { data: matchesData, error: matchesError } = await supabase
      .from('matches')
      .select(`
        id,
        league,
        home_team,
        away_team,
        home_team_logo,
        away_team_logo,
        league_logo
      `)
      .order('league');

    if (matchesError) {
      console.error('Error fetching matches:', matchesError);
      return NextResponse.json({ error: `Failed to fetch matches: ${matchesError.message}` }, { status: 500 });
    }

    console.log(`Found ${matchesData?.length || 0} matches`);

    // Extract unique leagues and teams from matches
    const leaguesMap = new Map<string, League>();
    const teamsSet = new Set<string>();

    matchesData?.forEach(match => {
      const leagueName = match.league;
      
      // Create league if it doesn't exist
      if (!leaguesMap.has(leagueName)) {
        leaguesMap.set(leagueName, {
          id: leagueName.toLowerCase().replace(/\s+/g, '-'),
          name: leagueName,
          country: 'Unknown', // Will be determined from league name
          logo_url: match.league_logo,
          teams: []
        });
      }

      // Add teams to the league
      const league = leaguesMap.get(leagueName)!;
      
      // Add home team
      const homeTeamKey = `${leagueName}-${match.home_team}`;
      if (!teamsSet.has(homeTeamKey)) {
        teamsSet.add(homeTeamKey);
        league.teams.push({
          id: `${match.id}-home`,
          name: match.home_team,
          short_name: match.home_team.split(' ').map(word => word[0]).join('').toUpperCase(),
          logo_url: match.home_team_logo,
          country: 'Unknown',
          founded: undefined
        });
      }

      // Add away team
      const awayTeamKey = `${leagueName}-${match.away_team}`;
      if (!teamsSet.has(awayTeamKey)) {
        teamsSet.add(awayTeamKey);
        league.teams.push({
          id: `${match.id}-away`,
          name: match.away_team,
          short_name: match.away_team.split(' ').map(word => word[0]).join('').toUpperCase(),
          logo_url: match.away_team_logo,
          country: 'Unknown',
          founded: undefined
        });
      }
    });

    // Convert map to array and sort teams within each league
    const leagues: League[] = Array.from(leaguesMap.values()).map(league => ({
      ...league,
      teams: league.teams.sort((a, b) => a.name.localeCompare(b.name))
    }));

    // Calculate totals
    const totalTeams = Array.from(teamsSet).length;
    const totalLeagues = leagues.length;

    console.log(`Returning ${totalLeagues} leagues with ${totalTeams} total teams`);

    const catalogData: CatalogData = {
      leagues,
      totalTeams,
      totalLeagues
    };

    return NextResponse.json(catalogData);

  } catch (error) {
    console.error('Error in catalog API:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}
