import { FootballDataMatch } from '../types/match.types';

export class ExternalAPIService {
  private readonly footballDataApiUrl = 'https://api.football-data.org/v4';
  private readonly apiKey: string;

  constructor() {
    this.apiKey = process.env.FOOTBALL_DATA_API_KEY || '';
    
    if (!this.apiKey) {
      console.warn('⚠️  FOOTBALL_DATA_API_KEY not set. Using fallback dummy data.');
    }
  }

  async fetchMatches(
    competitions?: string[], // Now optional, we get all leagues by default
    dateRange?: { from: string; to: string }
  ): Promise<FootballDataMatch[]> {
    
    if (!this.apiKey) {
      console.log('🔄 Using dummy data for match fetching (no API key)');
      return this.getDummyMatches();
    }

    try {
      console.log('🚀 EFFICIENT FETCH: Getting matches from ALL leagues in ONE request');
      
      // Use the efficient method: get all matches in one request
      const allMatches = await this.fetchAllMatches(dateRange);
      
      // Filter by competitions if specified (but we get all by default)
      let filteredMatches = allMatches;
      if (competitions && competitions.length > 0) {
        const competitionCodes = competitions.map(c => c.toUpperCase());
        filteredMatches = allMatches.filter(match => 
          competitionCodes.includes(match.competition?.code?.toUpperCase() || '')
        );
        console.log(`🔍 Filtered to ${competitions.join(', ')}: ${filteredMatches.length}/${allMatches.length} matches`);
      }

      console.log(`✅ Fetched ${filteredMatches.length} matches from Football-Data API in ONE request`);
      return filteredMatches;
      
    } catch (error) {
      console.error('❌ External API error:', error);
      
      // Fallback to dummy data on API failure
      console.log('🔄 Falling back to dummy data due to API error');
      return this.getDummyMatches();
    }
  }

  // EFFICIENT: Get ALL matches from ALL leagues in ONE request
  private async fetchAllMatches(
    dateRange?: { from: string; to: string }
  ): Promise<FootballDataMatch[]> {
    
    let url = `${this.footballDataApiUrl}/matches`;
    
    // Add date range parameters
    const params = new URLSearchParams();
    if (dateRange) {
      params.set('dateFrom', dateRange.from);
      params.set('dateTo', dateRange.to);
    } else {
      // Default to next 7 days for comprehensive coverage
      const today = new Date();
      const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
      params.set('dateFrom', today.toISOString().split('T')[0]);
      params.set('dateTo', nextWeek.toISOString().split('T')[0]);
    }
    
    url += `?${params.toString()}`;
    console.log(`📡 API Request: ${url}`);

    const response = await fetch(url, {
      headers: {
        'X-Auth-Token': this.apiKey,
        'User-Agent': 'BetHub/1.0 (contact@bethub.com)'
      }
    });

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Wait and try again.');
      }
      if (response.status === 403) {
        throw new Error('API access forbidden. Check your subscription and API key.');
      }
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const matches = data.matches || [];
    
    // Log which leagues we got
    const leagues = new Set(matches.map((m: any) => m.competition?.name).filter(Boolean));
    console.log(`🏆 Leagues covered: ${Array.from(leagues).join(', ')}`);
    
    return matches;
  }

  // Keep this for backward compatibility but mark as deprecated
  private async fetchCompetitionMatches(
    competitionCode: string,
    dateRange?: { from: string; to: string }
  ): Promise<FootballDataMatch[]> {
    console.warn('⚠️  DEPRECATED: Using inefficient per-competition fetching');
    
    let url = `${this.footballDataApiUrl}/competitions/${competitionCode}/matches`;
    
    // Add date range if provided
    if (dateRange) {
      const params = new URLSearchParams({
        dateFrom: dateRange.from,
        dateTo: dateRange.to
      });
      url += `?${params.toString()}`;
    } else {
      // Default to next 7 days
      const today = new Date();
      const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
      const params = new URLSearchParams({
        dateFrom: today.toISOString().split('T')[0],
        dateTo: nextWeek.toISOString().split('T')[0]
      });
      url += `?${params.toString()}`;
    }

    const response = await fetch(url, {
      headers: {
        'X-Auth-Token': this.apiKey,
        'User-Agent': 'BetHub/1.0 (contact@bethub.com)'
      }
    });

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error(`Rate limit exceeded for ${competitionCode}`);
      }
      if (response.status === 403) {
        throw new Error(`API access forbidden for ${competitionCode}. Check subscription.`);
      }
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.matches || [];
  }

  private getDummyMatches(): FootballDataMatch[] {
    const now = new Date();
    const today = new Date(now.getTime());
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const dayAfter = new Date(now.getTime() + 48 * 60 * 60 * 1000);

    return [
      {
        id: 1001,
        utcDate: this.formatMatchTime(today, 15, 0), // Today 3 PM
        status: 'TIMED',
        matchday: 10,
        homeTeam: {
          id: 57,
          name: 'Arsenal',
          crest: 'https://crests.football-data.org/57.png'
        },
        awayTeam: {
          id: 65,
          name: 'Manchester City',
          crest: 'https://crests.football-data.org/65.png'
        },
        competition: {
          id: 2021,
          name: 'Premier League',
          emblem: 'https://crests.football-data.org/PL.png'
        },
        venue: 'Emirates Stadium',
        referees: [{ name: 'Michael Oliver' }]
      },
      {
        id: 1002,
        utcDate: this.formatMatchTime(today, 17, 30), // Today 5:30 PM
        status: 'TIMED',
        matchday: 10,
        homeTeam: {
          id: 73,
          name: 'Tottenham Hotspur',
          crest: 'https://crests.football-data.org/73.png'
        },
        awayTeam: {
          id: 61,
          name: 'Chelsea',
          crest: 'https://crests.football-data.org/61.png'
        },
        competition: {
          id: 2021,
          name: 'Premier League',
          emblem: 'https://crests.football-data.org/PL.png'
        },
        venue: 'Tottenham Hotspur Stadium',
        referees: [{ name: 'Anthony Taylor' }]
      },
      {
        id: 1003,
        utcDate: this.formatMatchTime(tomorrow, 14, 0), // Tomorrow 2 PM
        status: 'TIMED',
        matchday: 11,
        homeTeam: {
          id: 64,
          name: 'Liverpool',
          crest: 'https://crests.football-data.org/64.png'
        },
        awayTeam: {
          id: 66,
          name: 'Manchester United',
          crest: 'https://crests.football-data.org/66.png'
        },
        competition: {
          id: 2021,
          name: 'Premier League',
          emblem: 'https://crests.football-data.org/PL.png'
        },
        venue: 'Anfield',
        referees: [{ name: 'Paul Tierney' }]
      },
      {
        id: 1004,
        utcDate: this.formatMatchTime(dayAfter, 20, 0), // Day after 8 PM
        status: 'TIMED',
        matchday: 8,
        homeTeam: {
          id: 81,
          name: 'Barcelona',
          crest: 'https://crests.football-data.org/81.png'
        },
        awayTeam: {
          id: 86,
          name: 'Real Madrid',
          crest: 'https://crests.football-data.org/86.png'
        },
        competition: {
          id: 2014,
          name: 'La Liga',
          emblem: 'https://crests.football-data.org/PD.png'
        },
        venue: 'Camp Nou',
        referees: [{ name: 'Antonio Mateu Lahoz' }]
      },
      {
        id: 1005,
        utcDate: this.formatMatchTime(dayAfter, 16, 30), // Day after 4:30 PM
        status: 'TIMED',
        matchday: 9,
        homeTeam: {
          id: 5,
          name: 'Bayern Munich',
          crest: 'https://crests.football-data.org/5.png'
        },
        awayTeam: {
          id: 4,
          name: 'Borussia Dortmund',
          crest: 'https://crests.football-data.org/4.png'
        },
        competition: {
          id: 2002,
          name: 'Bundesliga',
          emblem: 'https://crests.football-data.org/BL1.png'
        },
        venue: 'Allianz Arena',
        referees: [{ name: 'Felix Brych' }]
      }
    ];
  }

  private formatMatchTime(date: Date, hours: number, minutes: number): string {
    const matchDate = new Date(date);
    matchDate.setHours(hours, minutes, 0, 0);
    return matchDate.toISOString();
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async testApiConnection(): Promise<{ connected: boolean; message: string }> {
    if (!this.apiKey) {
      return {
        connected: false,
        message: 'No API key configured. Using dummy data.'
      };
    }

    try {
      const response = await fetch(`${this.footballDataApiUrl}/competitions`, {
        headers: {
          'X-Auth-Token': this.apiKey,
          'User-Agent': 'BetHub/1.0 (contact@bethub.com)'
        }
      });

      if (response.ok) {
        return {
          connected: true,
          message: 'Football-Data API connected successfully'
        };
      } else {
        return {
          connected: false,
          message: `API connection failed: ${response.status} ${response.statusText}`
        };
      }
    } catch (error) {
      return {
        connected: false,
        message: `API connection error: ${error.message}`
      };
    }
  }
}