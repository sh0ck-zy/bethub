import type { 
  DataProvider, 
  Match, 
  Team, 
  League, 
  Odds, 
  MatchStats 
} from '../types';

/**
 * Real Sports Data Provider using Football-Data.org API
 * Free tier: 10 requests per minute, 10 requests per day (perfect for testing)
 * Get your free API key at: https://www.football-data.org/client/register
 */
export class FootballDataProvider implements DataProvider {
  private readonly baseUrl = 'https://api.football-data.org/v4';
  private readonly apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.FOOTBALL_DATA_API_KEY || '';
    if (!this.apiKey) {
      console.warn('⚠️  Football-Data.org API key not found. Add FOOTBALL_DATA_API_KEY to your environment variables.');
    }
  }

  private async makeRequest<T>(endpoint: string): Promise<T> {
    if (!this.apiKey) {
      throw new Error('Football-Data.org API key is required');
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      headers: {
        'X-Auth-Token': this.apiKey,
      },
    });

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Football-Data.org free tier allows 10 requests per minute.');
      }
      if (response.status === 403) {
        throw new Error('API access forbidden. Check your Football-Data.org API key and subscription.');
      }
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get matches for a specific date
   */
  async getMatches(date: Date, league?: string): Promise<Match[]> {
    try {
      const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD format
      const endpoint = `/matches?dateFrom=${dateStr}&dateTo=${dateStr}`;
      
      const response = await this.makeRequest<{
        matches: Array<{
          id: number;
          competition: { name: string; code: string };
          homeTeam: { name: string; shortName: string };
          awayTeam: { name: string; shortName: string };
          utcDate: string;
          status: 'SCHEDULED' | 'LIVE' | 'IN_PLAY' | 'PAUSED' | 'FINISHED' | 'POSTPONED' | 'CANCELLED';
          score: {
            fullTime: { home: number | null; away: number | null };
          };
          minute?: number;
          venue?: string;
          referees?: Array<{ name: string }>;
        }>;
      }>(endpoint);

      return response.matches
        .filter(match => !league || match.competition.name.toLowerCase().includes(league.toLowerCase()))
        .map(this.transformMatch);
    } catch (error) {
      console.error('Error fetching matches:', error);
      return [];
    }
  }

  /**
   * Get live score for a specific match
   */
  async getLiveScore(matchId: string): Promise<Match> {
    try {
      const response = await this.makeRequest<{
        id: number;
        competition: { name: string };
        homeTeam: { name: string; shortName: string };
        awayTeam: { name: string; shortName: string };
        utcDate: string;
        status: string;
        score: {
          fullTime: { home: number | null; away: number | null };
        };
        minute?: number;
      }>(`/matches/${matchId}`);

      return this.transformMatch(response);
    } catch (error) {
      console.error('Error fetching live score:', error);
      throw error;
    }
  }

  /**
   * Get odds for a match (Football-Data.org doesn't provide odds, so we'll use placeholder)
   */
  async getOdds(matchId: string): Promise<Odds> {
    // Football-Data.org doesn't provide odds in free tier
    // You'd need a specialized odds API like OddsAPI or similar
    return {
      home: 2.5,
      draw: 3.2,
      away: 2.8,
      provider: 'Placeholder',
      last_updated: new Date().toISOString(),
    };
  }

  /**
   * Get match statistics (limited in free tier)
   */
  async getMatchStats(matchId: string): Promise<{ home: MatchStats; away: MatchStats }> {
    // Football-Data.org free tier has limited stats
    // For full stats, you'd need the paid tier or another provider
    return {
      home: {
        possession: 50,
        shots: 0,
        shots_on_target: 0,
        corners: 0,
        fouls: 0,
        yellow_cards: 0,
        red_cards: 0,
      },
      away: {
        possession: 50,
        shots: 0,
        shots_on_target: 0,
        corners: 0,
        fouls: 0,
        yellow_cards: 0,
        red_cards: 0,
      },
    };
  }

  /**
   * Get team information
   */
  async getTeam(teamId: string): Promise<Team> {
    try {
      const response = await this.makeRequest<{
        id: number;
        name: string;
        shortName: string;
        tla: string;
        crest: string;
        area: { name: string };
        founded: number;
        venue?: string;
      }>(`/teams/${teamId}`);

      return {
        id: response.id.toString(),
        name: response.name,
        short_name: response.shortName || response.tla,
        logo_url: response.crest,
        country: response.area.name,
        founded: response.founded,
        venue: response.venue,
      };
    } catch (error) {
      console.error('Error fetching team:', error);
      throw error;
    }
  }

  /**
   * Get league information
   */
  async getLeague(leagueId: string): Promise<League> {
    try {
      const response = await this.makeRequest<{
        id: number;
        name: string;
        code: string;
        area: { name: string };
        emblem: string;
        currentSeason: { startDate: string; endDate: string };
        type: string;
      }>(`/competitions/${leagueId}`);

      return {
        id: response.id.toString(),
        name: response.name,
        country: response.area.name,
        logo_url: response.emblem,
        season: `${response.currentSeason.startDate.split('-')[0]}/${response.currentSeason.endDate.split('-')[0]}`,
        type: response.type.toLowerCase() as 'league' | 'cup' | 'international',
      };
    } catch (error) {
      console.error('Error fetching league:', error);
      throw error;
    }
  }

  /**
   * Search teams by name
   */
  async searchTeams(query: string): Promise<Team[]> {
    // Football-Data.org doesn't have a direct search endpoint
    // We'll need to get teams from competitions and filter
    try {
      // Get Premier League teams as an example
      const response = await this.makeRequest<{
        teams: Array<{
          id: number;
          name: string;
          shortName: string;
          tla: string;
          crest: string;
          area: { name: string };
        }>;
      }>('/competitions/PL/teams');

      return response.teams
        .filter(team => 
          team.name.toLowerCase().includes(query.toLowerCase()) ||
          team.shortName?.toLowerCase().includes(query.toLowerCase())
        )
        .map(team => ({
          id: team.id.toString(),
          name: team.name,
          short_name: team.shortName || team.tla,
          logo_url: team.crest,
          country: team.area.name,
        }));
    } catch (error) {
      console.error('Error searching teams:', error);
      return [];
    }
  }

  /**
   * Transform Football-Data.org match format to our internal format
   */
  private transformMatch(apiMatch: any): Match {
    const statusMap: Record<string, Match['status']> = {
      'SCHEDULED': 'PRE',
      'LIVE': 'LIVE',
      'IN_PLAY': 'LIVE',
      'PAUSED': 'LIVE',
      'FINISHED': 'FT',
      'POSTPONED': 'POSTPONED',
      'CANCELLED': 'CANCELLED',
    };

    return {
      id: apiMatch.id.toString(),
      league: apiMatch.competition.name,
      home_team: apiMatch.homeTeam.name,
      away_team: apiMatch.awayTeam.name,
      kickoff_utc: apiMatch.utcDate,
      status: statusMap[apiMatch.status] || 'PRE',
      home_score: apiMatch.score?.fullTime?.home || undefined,
      away_score: apiMatch.score?.fullTime?.away || undefined,
      current_minute: apiMatch.minute,
      venue: apiMatch.venue,
      referee: apiMatch.referees?.[0]?.name,
    };
  }

  /**
   * Get today's matches (helper method)
   */
  async getTodaysMatches(): Promise<Match[]> {
    return this.getMatches(new Date());
  }

  /**
   * Get available competitions
   */
  async getAvailableCompetitions(): Promise<League[]> {
    try {
      const response = await this.makeRequest<{
        competitions: Array<{
          id: number;
          name: string;
          code: string;
          area: { name: string };
          emblem: string;
          type: string;
          currentSeason: { startDate: string; endDate: string };
        }>;
      }>('/competitions');

      return response.competitions.map(comp => ({
        id: comp.id.toString(),
        name: comp.name,
        country: comp.area.name,
        logo_url: comp.emblem,
        season: `${comp.currentSeason.startDate.split('-')[0]}/${comp.currentSeason.endDate.split('-')[0]}`,
        type: comp.type.toLowerCase() as 'league' | 'cup' | 'international',
      }));
    } catch (error) {
      console.error('Error fetching competitions:', error);
      return [];
    }
  }
} 