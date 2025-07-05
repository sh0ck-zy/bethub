import axios from 'axios';

// Football API configuration
const FOOTBALL_API_CONFIG = {
  // API-Football (recommended for production)
  apiFootball: {
    baseURL: 'https://v3.football.api-sports.io',
    apiKey: process.env.FOOTBALL_API_KEY || '',
    headers: {
      'x-rapidapi-host': 'v3.football.api-sports.io',
      'x-rapidapi-key': process.env.FOOTBALL_API_KEY || '',
    }
  },
  
  // Football-Data.org (free tier, good for testing)
  footballData: {
    baseURL: 'https://api.football-data.org/v4',
    apiKey: process.env.FOOTBALL_DATA_API_KEY || '',
    headers: {
      'X-Auth-Token': process.env.FOOTBALL_DATA_API_KEY || '',
    }
  }
};

// API Provider selection
const API_PROVIDER = process.env.FOOTBALL_API_PROVIDER || 'apiFootball';

interface FootballMatch {
  id: string;
  date: string;
  status: string;
  homeTeam: {
    id: number;
    name: string;
    shortName?: string;
    tla?: string;
  };
  awayTeam: {
    id: number;
    name: string;
    shortName?: string;
    tla?: string;
  };
  competition: {
    id: number;
    name: string;
    country?: string;
  };
  score?: {
    fullTime: {
      home?: number;
      away?: number;
    };
    halfTime?: {
      home?: number;
      away?: number;
    };
  };
}

interface FootballAPIResponse {
  success: boolean;
  data?: any;
  error?: string;
}

class FootballAPIService {
  private config: any;
  private axiosInstance: any;

  constructor() {
    this.config = FOOTBALL_API_CONFIG[API_PROVIDER as keyof typeof FOOTBALL_API_CONFIG];
    this.axiosInstance = axios.create({
      baseURL: this.config.baseURL,
      headers: this.config.headers,
      timeout: 10000,
    });

    // Add request interceptor for logging
    this.axiosInstance.interceptors.request.use(
      (config: any) => {
        console.log(`[Football API] ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error: any) => {
        console.error('[Football API] Request error:', error);
        return Promise.reject(error);
      }
    );

    // Add response interceptor for error handling
    this.axiosInstance.interceptors.response.use(
      (response: any) => {
        return response;
      },
      (error: any) => {
        console.error('[Football API] Response error:', error.response?.status, error.response?.data);
        return Promise.reject(error);
      }
    );
  }

  // Get today's matches
  async getTodayMatches(): Promise<FootballAPIResponse> {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      if (API_PROVIDER === 'apiFootball') {
        return await this.getTodayMatchesAPIFootball(today);
      } else {
        return await this.getTodayMatchesFootballData(today);
      }
    } catch (error) {
      console.error('[Football API] Error fetching today matches:', error);
      return {
        success: false,
        error: 'Failed to fetch today matches'
      };
    }
  }

  // API-Football implementation
  private async getTodayMatchesAPIFootball(date: string): Promise<FootballAPIResponse> {
    try {
      const response = await this.axiosInstance.get('/fixtures', {
        params: {
          date: date,
          status: 'NS-LIVE-FT-HT', // Not Started, Live, Finished, Half Time
        }
      });

      const matches = response.data.response?.map((fixture: any) => ({
        id: fixture.fixture.id.toString(),
        date: fixture.fixture.date,
        status: this.mapStatus(fixture.fixture.status.short),
        homeTeam: {
          id: fixture.teams.home.id,
          name: fixture.teams.home.name,
          shortName: fixture.teams.home.name,
          tla: fixture.teams.home.name.substring(0, 3).toUpperCase(),
        },
        awayTeam: {
          id: fixture.teams.away.id,
          name: fixture.teams.away.name,
          shortName: fixture.teams.away.name,
          tla: fixture.teams.away.name.substring(0, 3).toUpperCase(),
        },
        competition: {
          id: fixture.league.id,
          name: fixture.league.name,
          country: fixture.league.country,
        },
        score: fixture.goals ? {
          fullTime: {
            home: fixture.goals.home,
            away: fixture.goals.away,
          }
        } : undefined,
      }));

      return {
        success: true,
        data: matches
      };
    } catch (error) {
      console.error('[Football API] API-Football error:', error);
      return {
        success: false,
        error: 'API-Football service unavailable'
      };
    }
  }

  // Football-Data.org implementation
  private async getTodayMatchesFootballData(date: string): Promise<FootballAPIResponse> {
    try {
      const response = await this.axiosInstance.get('/matches', {
        params: {
          dateFrom: date,
          dateTo: date,
        }
      });

      const matches = response.data.matches?.map((match: any) => ({
        id: match.id.toString(),
        date: match.utcDate,
        status: this.mapStatus(match.status),
        homeTeam: {
          id: match.homeTeam.id,
          name: match.homeTeam.name,
          shortName: match.homeTeam.shortName,
          tla: match.homeTeam.tla,
        },
        awayTeam: {
          id: match.awayTeam.id,
          name: match.awayTeam.name,
          shortName: match.awayTeam.shortName,
          tla: match.awayTeam.tla,
        },
        competition: {
          id: match.competition.id,
          name: match.competition.name,
          country: match.area.name,
        },
        score: match.score ? {
          fullTime: {
            home: match.score.fullTime.home,
            away: match.score.fullTime.away,
          },
          halfTime: {
            home: match.score.halfTime.home,
            away: match.score.halfTime.away,
          }
        } : undefined,
      }));

      return {
        success: true,
        data: matches
      };
    } catch (error) {
      console.error('[Football API] Football-Data.org error:', error);
      return {
        success: false,
        error: 'Football-Data.org service unavailable'
      };
    }
  }

  // Map status from different APIs to our standard format
  private mapStatus(status: string): string {
    const statusMap: { [key: string]: string } = {
      // API-Football statuses
      'NS': 'UPCOMING',
      'LIVE': 'LIVE',
      'FT': 'FT',
      'HT': 'HT',
      'PST': 'POSTPONED',
      'CANC': 'CANCELLED',
      
      // Football-Data.org statuses
      'SCHEDULED': 'UPCOMING',
      'LIVE': 'LIVE',
      'FINISHED': 'FT',
      'POSTPONED': 'POSTPONED',
      'CANCELLED': 'CANCELLED',
      'SUSPENDED': 'SUSPENDED',
      'PAUSED': 'HT',
    };

    return statusMap[status] || 'UPCOMING';
  }

  // Get match details by ID
  async getMatchDetails(matchId: string): Promise<FootballAPIResponse> {
    try {
      if (API_PROVIDER === 'apiFootball') {
        const response = await this.axiosInstance.get(`/fixtures`, {
          params: { id: matchId }
        });
        
        const fixture = response.data.response?.[0];
        if (!fixture) {
          return {
            success: false,
            error: 'Match not found'
          };
        }

        const matchData = {
          id: fixture.fixture.id.toString(),
          date: fixture.fixture.date,
          status: this.mapStatus(fixture.fixture.status.short),
          homeTeam: {
            id: fixture.teams.home.id,
            name: fixture.teams.home.name,
          },
          awayTeam: {
            id: fixture.teams.away.id,
            name: fixture.teams.away.name,
          },
          competition: {
            id: fixture.league.id,
            name: fixture.league.name,
          },
          score: fixture.goals ? {
            fullTime: {
              home: fixture.goals.home,
              away: fixture.goals.away,
            }
          } : undefined,
        };

        // Add additional data for analysis
        const extendedData = {
          ...matchData,
          events: fixture.events || [],
          statistics: fixture.statistics || [],
        };

        return {
          success: true,
          data: extendedData
        };
      } else {
        const response = await this.axiosInstance.get(`/matches/${matchId}`);
        
        return {
          success: true,
          data: response.data
        };
      }
    } catch (error) {
      console.error('[Football API] Error fetching match details:', error);
      return {
        success: false,
        error: 'Failed to fetch match details'
      };
    }
  }

  // Get team information
  async getTeamInfo(teamId: number): Promise<FootballAPIResponse> {
    try {
      if (API_PROVIDER === 'apiFootball') {
        const response = await this.axiosInstance.get(`/teams`, {
          params: { id: teamId }
        });
        
        const team = response.data.response?.[0];
        return {
          success: true,
          data: team
        };
      } else {
        const response = await this.axiosInstance.get(`/teams/${teamId}`);
        return {
          success: true,
          data: response.data
        };
      }
    } catch (error) {
      console.error('[Football API] Error fetching team info:', error);
      return {
        success: false,
        error: 'Failed to fetch team information'
      };
    }
  }

  // Check API health
  async checkHealth(): Promise<boolean> {
    try {
      if (API_PROVIDER === 'apiFootball') {
        const response = await this.axiosInstance.get('/status');
        return response.status === 200;
      } else {
        const response = await this.axiosInstance.get('/competitions');
        return response.status === 200;
      }
    } catch (error) {
      console.error('[Football API] Health check failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const footballAPI = new FootballAPIService();
export type { FootballMatch, FootballAPIResponse }; 