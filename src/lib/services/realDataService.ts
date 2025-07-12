import { Match } from '@/lib/types';

interface OpenFootballMatch {
  date: string;
  team1: string;
  team2: string;
  score?: {
    ft?: [number, number];
    ht?: [number, number];
  };
  matchday?: number;
  group?: string;
}

interface OpenFootballData {
  name: string;
  matches: OpenFootballMatch[];
}

export class RealDataService {
  private readonly leagueUrls = [
    // Brasileirão 2025 (ATIVO AGORA!)
    'https://raw.githubusercontent.com/openfootball/football.json/master/2025/br.1.json',
    // MLS 2025 (ATIVO AGORA!)
    'https://raw.githubusercontent.com/openfootball/football.json/master/2025/mls.json',
    // Copa Libertadores 2025
    'https://raw.githubusercontent.com/openfootball/football.json/master/2025/copa.l.json',
    // Champions League 2024-25
    'https://raw.githubusercontent.com/openfootball/football.json/master/2024-25/uefa.cl.json',
    // Premier League 2024-25 (fallback)
    'https://raw.githubusercontent.com/openfootball/football.json/master/2024-25/en.1.json',
    // La Liga 2024-25 (fallback)
    'https://raw.githubusercontent.com/openfootball/football.json/master/2024-25/es.1.json'
  ];

  async getTodaysMatches(): Promise<Match[]> {
    const allMatches: Match[] = [];
    
    for (const url of this.leagueUrls) {
      try {
        console.log(`Fetching data from: ${url}`);
        const response = await fetch(url, { 
          next: { revalidate: 3600 } // Cache for 1 hour
        });
        
        if (!response.ok) {
          console.log(`Failed to fetch ${url}: ${response.status}`);
          continue;
        }
        
        const data: OpenFootballData = await response.json();
        const parsedMatches = this.parseMatches(data, url);
        allMatches.push(...parsedMatches);
        
        console.log(`Successfully parsed ${parsedMatches.length} matches from ${data.name}`);
      } catch (error) {
        console.log(`Error fetching ${url}:`, error);
      }
    }
    
    // For testing, let's also include upcoming matches (next 7 days)
    const upcomingMatches = await this.getUpcomingMatches();
    allMatches.push(...upcomingMatches);
    
    // Remove duplicates and filter for today's matches
    const uniqueMatches = this.removeDuplicateMatches(allMatches);
    console.log(`Total matches after deduplication: ${uniqueMatches.length}`);
    
    const filteredMatches = this.filterTodaysMatches(uniqueMatches);
    console.log(`Final matches for today: ${filteredMatches.length}`);
    
    return filteredMatches;
  }

  private parseMatches(data: OpenFootballData, sourceUrl: string): Match[] {
    const leagueName = this.extractLeagueName(data.name, sourceUrl);
    
    return data.matches.map((match, index) => {
      // Parse the date string properly - OpenFootball uses "YYYY-MM-DD" format
      let matchDate: Date;
      
      if (match.date.includes('T')) {
        // Full ISO date string
        matchDate = new Date(match.date);
      } else {
        // Date only string (YYYY-MM-DD), add default time (20:00 local time)
        const [year, month, day] = match.date.split('-').map(Number);
        matchDate = new Date(year, month - 1, day, 20, 0, 0); // 8 PM local time
      }
      
      const now = new Date();
      const isToday = this.isSameDay(matchDate, now);
      const isPast = matchDate < now;
      
      // Debug logging for date parsing
      if (index < 3) { // Log first 3 matches for debugging
        console.log(`Match ${index + 1}: ${match.team1} vs ${match.team2}`);
        console.log(`  Original date: ${match.date}`);
        console.log(`  Parsed date: ${matchDate.toISOString()}`);
        console.log(`  Is today: ${isToday}, Is past: ${isPast}`);
      }
      
      // Determine status based on match date and score
      let status: Match['status'] = 'PRE';
      if (isPast) {
        if (match.score?.ft) {
          status = 'FT';
        } else if (isToday) {
          status = 'LIVE';
        }
      }
      
      // Generate unique ID with index to prevent duplicates
      const id = `${leagueName}-${match.team1}-${match.team2}-${matchDate.getTime()}-${index}`;
      
      return {
        id,
        league: leagueName,
        home_team: match.team1,
        away_team: match.team2,
        kickoff_utc: matchDate.toISOString(),
        status,
        home_score: match.score?.ft?.[0],
        away_score: match.score?.ft?.[1],
        venue: undefined,
        referee: undefined
      };
    });
  }

  private extractLeagueName(name: string, sourceUrl: string): string {
    // Extract league name from URL or data name
    if (sourceUrl.includes('br.1.json')) return 'Brasileirão';
    if (sourceUrl.includes('mls.json')) return 'MLS';
    if (sourceUrl.includes('copa.l.json')) return 'Copa Libertadores';
    if (sourceUrl.includes('uefa.cl.json')) return 'Champions League';
    if (sourceUrl.includes('en.1.json')) return 'Premier League';
    if (sourceUrl.includes('es.1.json')) return 'La Liga';
    if (sourceUrl.includes('it.1.json')) return 'Serie A';
    if (sourceUrl.includes('de.1.json')) return 'Bundesliga';
    if (sourceUrl.includes('fr.1.json')) return 'Ligue 1';
    if (sourceUrl.includes('nl.1.json')) return 'Eredivisie';
    if (sourceUrl.includes('pt.1.json')) return 'Primeira Liga';
    
    return name || 'Unknown League';
  }

  private filterTodaysMatches(matches: Match[]): Match[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    console.log(`Filtering matches for today: ${today.toISOString()} to ${tomorrow.toISOString()}`);
    
    // Filter for today's matches
    const todaysMatches = matches.filter(match => {
      const matchDate = new Date(match.kickoff_utc);
      const isToday = matchDate >= today && matchDate < tomorrow;
      
      if (isToday) {
        console.log(`Today's match: ${match.home_team} vs ${match.away_team} at ${matchDate.toISOString()}`);
      }
      
      return isToday;
    });
    
    console.log(`Found ${todaysMatches.length} matches for today`);
    
    // If no matches today, include upcoming matches (next 7 days)
    if (todaysMatches.length === 0) {
      const next7Days = new Date(today);
      next7Days.setDate(next7Days.getDate() + 7);
      
      const upcomingMatches = matches.filter(match => {
        const matchDate = new Date(match.kickoff_utc);
        return matchDate >= today && matchDate <= next7Days;
      });
      
      console.log(`No matches today, showing ${upcomingMatches.length} upcoming matches`);
      
      // If still no matches, show the next available matches (up to 30 days)
      if (upcomingMatches.length === 0) {
        const next30Days = new Date(today);
        next30Days.setDate(next30Days.getDate() + 30);
        
        const nextMatches = matches.filter(match => {
          const matchDate = new Date(match.kickoff_utc);
          return matchDate >= today && matchDate <= next30Days;
        });
        
        console.log(`No upcoming matches, showing ${nextMatches.length} matches in next 30 days`);
        return nextMatches;
      }
      
      return upcomingMatches;
    }
    
    return todaysMatches;
  }

  private isSameDay(date1: Date, date2: Date): boolean {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  }

  // Get matches for a specific date range (useful for admin)
  async getMatchesForDateRange(startDate: Date, endDate: Date): Promise<Match[]> {
    const allMatches: Match[] = [];
    
    for (const url of this.leagueUrls) {
      try {
        const response = await fetch(url, { 
          next: { revalidate: 3600 }
        });
        
        if (!response.ok) continue;
        
        const data: OpenFootballData = await response.json();
        const parsedMatches = this.parseMatches(data, url);
        
        // Filter by date range
        const filteredMatches = parsedMatches.filter(match => {
          const matchDate = new Date(match.kickoff_utc);
          return matchDate >= startDate && matchDate <= endDate;
        });
        
        allMatches.push(...filteredMatches);
      } catch (error) {
        console.log(`Error fetching ${url}:`, error);
      }
    }
    
    return allMatches;
  }

  // Get upcoming matches (next 7 days)
  async getUpcomingMatches(): Promise<Match[]> {
    const startDate = new Date(); // Start from today, not past
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 7);
    
    return this.getMatchesForDateRange(startDate, endDate);
  }

  // Remove duplicate matches based on teams and kickoff time
  private removeDuplicateMatches(matches: Match[]): Match[] {
    const seen = new Set<string>();
    const uniqueMatches: Match[] = [];
    
    for (const match of matches) {
      // Create a unique key based on teams and kickoff time (hour precision)
      const key = `${match.league}-${match.home_team}-${match.away_team}-${match.kickoff_utc?.slice(0, 13)}`;
      
      if (!seen.has(key)) {
        seen.add(key);
        uniqueMatches.push(match);
      } else {
        console.log(`Duplicate match found and removed: ${match.home_team} vs ${match.away_team} (${match.league})`);
      }
    }
    
    return uniqueMatches;
  }
} 