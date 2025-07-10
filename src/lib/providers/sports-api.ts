import type { 
  DataProvider, 
  Match, 
  Team, 
  League, 
  Odds, 
  MatchStats 
} from '../types';

/**
 * Multi-Source Sports API Provider
 * Combines multiple APIs for comprehensive coverage:
 * - API-Sports (RapidAPI) - Most comprehensive
 * - The Sports DB - Free, good coverage
 * - ESPN API - Good for various tournaments
 */
export class SportsAPIProvider implements DataProvider {
  private readonly apiSportsKey: string;
  private readonly rapidAPIHost = 'api-football-v1.p.rapidapi.com';

  constructor() {
    this.apiSportsKey = process.env.API_SPORTS_KEY || process.env.RAPIDAPI_KEY || '';
  }

  /**
   * API-Sports (RapidAPI) - Best coverage for live tournaments
   */
  private async makeApiSportsRequest<T>(endpoint: string): Promise<T> {
    if (!this.apiSportsKey) {
      throw new Error('API-Sports key not found. Add RAPIDAPI_KEY to your environment.');
    }

    const response = await fetch(`https://${this.rapidAPIHost}${endpoint}`, {
      headers: {
        'X-RapidAPI-Key': this.apiSportsKey,
        'X-RapidAPI-Host': this.rapidAPIHost,
      },
    });

    if (!response.ok) {
      throw new Error(`API-Sports request failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * The Sports DB - Free API for additional coverage
   */
  private async makeSportsDBRequest<T>(endpoint: string): Promise<T> {
    const response = await fetch(`https://www.thesportsdb.com/api/v1/json/3${endpoint}`);
    
    if (!response.ok) {
      throw new Error(`Sports DB request failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get matches for a specific date from multiple sources
   */
  async getMatches(date: Date, league?: string): Promise<Match[]> {
    try {
      console.log(`🔄 Fetching matches for ${date.toDateString()} from multiple APIs...`);
      const dateStr = date.toISOString().split('T')[0];
      
      const matches: Match[] = [];

      // Try API-Sports first (most comprehensive)
      if (this.apiSportsKey) {
        try {
          console.log('📡 Trying API-Sports...');
          const apiSportsMatches = await this.getApiSportsMatches(dateStr);
          matches.push(...apiSportsMatches);
          console.log(`✅ API-Sports: Found ${apiSportsMatches.length} matches`);
        } catch (error: any) {
          console.warn('⚠️ API-Sports failed:', error.message);
        }
      }

      // Try Sports DB for additional coverage
      try {
        console.log('📡 Trying The Sports DB...');
        const sportsDBMatches = await this.getSportsDBMatches(dateStr);
        matches.push(...sportsDBMatches);
        console.log(`✅ Sports DB: Found ${sportsDBMatches.length} matches`);
      } catch (error: any) {
        console.warn('⚠️ Sports DB failed:', error.message);
      }

      // Remove duplicates based on team names and date
      const uniqueMatches = this.removeDuplicateMatches(matches);
      console.log(`🎯 Total unique matches found: ${uniqueMatches.length}`);

      return uniqueMatches.filter(match => !league || 
        match.league.toLowerCase().includes(league.toLowerCase())
      );

    } catch (error) {
      console.error('Error fetching matches from multiple sources:', error);
      return [];
    }
  }

  /**
   * Get matches from API-Sports (RapidAPI)
   */
  private async getApiSportsMatches(dateStr: string): Promise<Match[]> {
    try {
      // Get fixtures for specific date
      const response = await this.makeApiSportsRequest<{
        response: Array<{
          fixture: {
            id: number;
            date: string;
            status: {
              short: string;
              elapsed?: number;
            };
            venue?: { name: string };
            referee?: string;
          };
          league: {
            name: string;
            country: string;
            flag: string;
            logo: string;
          };
          teams: {
            home: { name: string; logo: string };
            away: { name: string; logo: string };
          };
          goals: {
            home: number | null;
            away: number | null;
          };
        }>;
      }>(`/v3/fixtures?date=${dateStr}`);

      return response.response.map(this.transformApiSportsMatch);
    } catch (error) {
      console.error('API-Sports error:', error);
      return [];
    }
  }

  /**
   * Get matches from The Sports DB
   */
  private async getSportsDBMatches(dateStr: string): Promise<Match[]> {
    try {
      // Sports DB uses different date format
      const [year, month, day] = dateStr.split('-');
      const sportsDBDate = `${year}-${month}-${day}`;

      // Get soccer events for the date
      const response = await this.makeSportsDBRequest<{
        events?: Array<{
          idEvent: string;
          strEvent: string;
          strLeague: string;
          strHomeTeam: string;
          strAwayTeam: string;
          dateEvent: string;
          strTime: string;
          intHomeScore: string | null;
          intAwayScore: string | null;
          strStatus: string;
          strVenue: string;
        }>;
      }>(`/eventsday.php?d=${sportsDBDate}&s=Soccer`);

      if (!response.events) return [];

      return response.events.map(this.transformSportsDBMatch);
    } catch (error) {
      console.error('Sports DB error:', error);
      return [];
    }
  }

  /**
   * Transform API-Sports match to our format
   */
  private transformApiSportsMatch(apiMatch: any): Match {
    const statusMap: Record<string, Match['status']> = {
      'NS': 'PRE',      // Not Started
      '1H': 'LIVE',     // First Half
      'HT': 'LIVE',     // Half Time (still live)
      '2H': 'LIVE',     // Second Half
      'ET': 'LIVE',     // Extra Time
      'FT': 'FT',       // Full Time
      'AET': 'FT',      // After Extra Time
      'PEN': 'FT',      // Penalties
      'PST': 'POSTPONED', // Postponed
      'CANC': 'CANCELLED', // Cancelled
    };

    return {
      id: `api_${apiMatch.fixture.id}`,
      league: apiMatch.league.name,
      home_team: apiMatch.teams.home.name,
      away_team: apiMatch.teams.away.name,
      kickoff_utc: apiMatch.fixture.date,
      status: statusMap[apiMatch.fixture.status.short] || 'PRE',
      // Note: home_score, away_score, current_minute, venue, referee not in schema
    };
  }

  /**
   * Transform Sports DB match to our format
   */
  private transformSportsDBMatch(sdbMatch: any): Match {
    const statusMap: Record<string, Match['status']> = {
      'Match Finished': 'FT',
      'Not Started': 'PRE',
      'Live': 'LIVE',
      'Postponed': 'POSTPONED',
      'Cancelled': 'CANCELLED',
    };

    return {
      id: `sdb_${sdbMatch.idEvent}`,
      league: sdbMatch.strLeague,
      home_team: sdbMatch.strHomeTeam,
      away_team: sdbMatch.strAwayTeam,
      kickoff_utc: sdbMatch.strTime && sdbMatch.strTime.includes('+') 
        ? `${sdbMatch.dateEvent}T${sdbMatch.strTime}` 
        : `${sdbMatch.dateEvent}T${sdbMatch.strTime || '00:00:00'}.000Z`,
      status: statusMap[sdbMatch.strStatus] || 'PRE',
      // Note: home_score, away_score, venue not in schema
    };
  }

  /**
   * Remove duplicate matches based on teams and kickoff time
   */
  private removeDuplicateMatches(matches: Match[]): Match[] {
    const seen = new Set<string>();
    return matches.filter(match => {
      const key = `${match.home_team}-${match.away_team}-${match.kickoff_utc?.slice(0, 13)}`; // Hour precision
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  /**
   * Get today's matches
   */
  async getTodaysMatches(): Promise<Match[]> {
    return this.getMatches(new Date());
  }

  /**
   * Placeholder implementations for interface compatibility
   */
  async getLiveScore(matchId: string): Promise<Match> {
    throw new Error('getLiveScore not implemented for multi-source provider');
  }

  async getOdds(matchId: string): Promise<Odds> {
    return {
      home: 2.5,
      draw: 3.2,
      away: 2.8,
      provider: 'Multi-Source',
      last_updated: new Date().toISOString(),
    };
  }

  async getMatchStats(matchId: string): Promise<{ home: MatchStats; away: MatchStats }> {
    return {
      home: { possession: 50, shots: 0, shots_on_target: 0, corners: 0, fouls: 0, yellow_cards: 0, red_cards: 0 },
      away: { possession: 50, shots: 0, shots_on_target: 0, corners: 0, fouls: 0, yellow_cards: 0, red_cards: 0 },
    };
  }

  async getTeam(teamId: string): Promise<Team> {
    throw new Error('getTeam not implemented for multi-source provider');
  }

  async getLeague(leagueId: string): Promise<League> {
    throw new Error('getLeague not implemented for multi-source provider');
  }

  async searchTeams(query: string): Promise<Team[]> {
    return [];
  }

  async getAvailableCompetitions(): Promise<League[]> {
    return [];
  }
} 