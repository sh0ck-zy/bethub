/**
 * Simple Football API - Direct integration with Football-Data.org
 * Replaces complex provider system with reliable direct calls
 */

interface FootballDataMatch {
  id: number;
  utcDate: string;
  status: string;
  homeTeam: {
    id: number;
    name: string;
    shortName: string;
    tla: string;
    crest: string;
  };
  awayTeam: {
    id: number;
    name: string;
    shortName: string;
    tla: string;
    crest: string;
  };
  score: {
    fullTime: {
      home: number | null;
      away: number | null;
    };
  };
  competition: {
    id: number;
    name: string;
    code: string;
    type: string;
    emblem: string;
  };
}

interface FootballDataResponse {
  matches: FootballDataMatch[];
  count: number;
}

export class SimpleFootballAPI {
  private readonly apiKey: string;
  private readonly baseUrl = 'https://api.football-data.org/v4';

  constructor() {
    this.apiKey = process.env.FOOTBALL_DATA_API_KEY || '';
    if (!this.apiKey) {
      console.warn('⚠️ FOOTBALL_DATA_API_KEY not found in environment variables');
    }
  }

  /**
   * Get today's matches from Football-Data.org
   */
  async getTodaysMatches(): Promise<any[]> {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      console.log(`🔄 Fetching matches for ${today} from Football-Data.org...`);
      
      const response = await fetch(
        `${this.baseUrl}/matches?dateFrom=${today}&dateTo=${today}`,
        {
          headers: {
            'X-Auth-Token': this.apiKey,
          },
        }
      );

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('API rate limit exceeded. Try again in a few minutes.');
        }
        if (response.status === 403) {
          throw new Error('Invalid API key. Check your FOOTBALL_DATA_API_KEY environment variable.');
        }
        throw new Error(`Football-Data API error: ${response.status} ${response.statusText}`);
      }

      const data: FootballDataResponse = await response.json();
      console.log(`✅ Successfully fetched ${data.matches.length} matches from Football-Data.org`);

      // Transform to our internal format
      return data.matches.map(this.transformMatch);

    } catch (error) {
      console.error('❌ Error fetching today\'s matches:', error);
      throw error;
    }
  }

  /**
   * Get matches for a specific date range
   */
  async getMatchesForDateRange(dateFrom: string, dateTo: string): Promise<any[]> {
    try {
      console.log(`🔄 Fetching matches from ${dateFrom} to ${dateTo}...`);
      
      const response = await fetch(
        `${this.baseUrl}/matches?dateFrom=${dateFrom}&dateTo=${dateTo}`,
        {
          headers: {
            'X-Auth-Token': this.apiKey,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Football-Data API error: ${response.status} ${response.statusText}`);
      }

      const data: FootballDataResponse = await response.json();
      console.log(`✅ Successfully fetched ${data.matches.length} matches for date range`);

      return data.matches.map(this.transformMatch);

    } catch (error) {
      console.error('❌ Error fetching matches for date range:', error);
      throw error;
    }
  }

  /**
   * Transform Football-Data.org match format to our internal format
   */
  private transformMatch(match: FootballDataMatch): any {
    // Map Football-Data status to our status
    const statusMap: Record<string, string> = {
      'SCHEDULED': 'PRE',
      'TIMED': 'PRE', 
      'IN_PLAY': 'LIVE',
      'PAUSED': 'LIVE',
      'FINISHED': 'FT',
      'POSTPONED': 'POSTPONED',
      'SUSPENDED': 'POSTPONED',
      'CANCELLED': 'CANCELLED'
    };

    return {
      id: `fd-${match.id}`, // Prefix to avoid conflicts
      external_id: match.id.toString(),
      home_team: match.homeTeam.name,
      away_team: match.awayTeam.name,
      home_team_short: match.homeTeam.shortName || match.homeTeam.tla,
      away_team_short: match.awayTeam.shortName || match.awayTeam.tla,
      home_team_logo: match.homeTeam.crest,
      away_team_logo: match.awayTeam.crest,
      home_score: match.score.fullTime.home,
      away_score: match.score.fullTime.away,
      league: match.competition.name,
      league_logo: match.competition.emblem,
      status: statusMap[match.status] || 'PRE',
      kickoff_utc: match.utcDate,
      is_published: false, // Default to unpublished for admin review
      analysis_status: 'none',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      // Store original API data for reference
      api_data: match
    };
  }

  /**
   * Test API connection
   */
  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/competitions`, {
        headers: {
          'X-Auth-Token': this.apiKey,
        },
      });

      if (response.ok) {
        return {
          success: true,
          message: 'Successfully connected to Football-Data.org API'
        };
      } else {
        return {
          success: false,
          message: `API connection failed: ${response.status} ${response.statusText}`
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

// Export singleton instance
export const footballAPI = new SimpleFootballAPI();
