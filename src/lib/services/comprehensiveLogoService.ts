/**
 * Comprehensive Logo Service
 * Fetches competition logos from TheSportsDB with MVP competition list
 */

interface Country {
  name: string;
  code: string;
  flagUrl: string;
}

interface Competition {
  name: string;
  country: string;
  type: 'european' | 'national' | 'cup' | 'supercup' | 'qualification';
  tier: number;
  searchTerms: string[];
}

class ComprehensiveLogoService {
  private readonly apiKey = '123'; // Free key
  private readonly baseUrl = 'https://www.thesportsdb.com/api/v1/json';

  // MVP Competition List - Focus on major competitions
  private readonly MVP_COMPETITIONS: Competition[] = [
    // Major European Competitions
    { name: 'UEFA Champions League', country: 'Europe', type: 'european', tier: 1, searchTerms: ['UEFA Champions League', 'Champions League'] },
    { name: 'UEFA Europa League', country: 'Europe', type: 'european', tier: 2, searchTerms: ['UEFA Europa League', 'Europa League'] },
    { name: 'UEFA Conference League', country: 'Europe', type: 'european', tier: 3, searchTerms: ['UEFA Conference League', 'Conference League'] },
    
    // Top 5 European Leagues
    { name: 'Premier League', country: 'England', type: 'national', tier: 1, searchTerms: ['Premier League', 'English Premier League'] },
    { name: 'La Liga', country: 'Spain', type: 'national', tier: 1, searchTerms: ['La Liga', 'Primera División', 'Spanish La Liga'] },
    { name: 'Bundesliga', country: 'Germany', type: 'national', tier: 1, searchTerms: ['Bundesliga', 'German Bundesliga'] },
    { name: 'Serie A', country: 'Italy', type: 'national', tier: 1, searchTerms: ['Serie A', 'Italian Serie A'] },
    { name: 'Ligue 1', country: 'France', type: 'national', tier: 1, searchTerms: ['Ligue 1', 'French Ligue 1'] },
    
    // Portuguese Liga
    { name: 'Primeira Liga', country: 'Portugal', type: 'national', tier: 1, searchTerms: ['Primeira Liga', 'Portuguese Liga'] },
    
    // Dutch Eredivisie
    { name: 'Eredivisie', country: 'Netherlands', type: 'national', tier: 1, searchTerms: ['Eredivisie', 'Dutch Eredivisie'] },
    
    // Brazilian Competitions
    { name: 'Brasileirão Série A', country: 'Brazil', type: 'national', tier: 1, searchTerms: ['Brasileirão', 'Campeonato Brasileiro', 'Brazilian Championship'] },
    { name: 'Copa do Brasil', country: 'Brazil', type: 'cup', tier: 1, searchTerms: ['Copa do Brasil', 'Brazil Cup'] },
    { name: 'Copa Libertadores', country: 'South America', type: 'qualification', tier: 1, searchTerms: ['Copa Libertadores', 'CONMEBOL Libertadores'] },
    
    // Major National Cups
    { name: 'FA Cup', country: 'England', type: 'cup', tier: 1, searchTerms: ['FA Cup', 'English FA Cup'] },
    { name: 'Copa del Rey', country: 'Spain', type: 'cup', tier: 1, searchTerms: ['Copa del Rey', 'Spanish Cup'] },
    { name: 'DFB-Pokal', country: 'Germany', type: 'cup', tier: 1, searchTerms: ['DFB-Pokal', 'German Cup'] },
    { name: 'Coppa Italia', country: 'Italy', type: 'cup', tier: 1, searchTerms: ['Coppa Italia', 'Italian Cup'] },
    { name: 'Coupe de France', country: 'France', type: 'cup', tier: 1, searchTerms: ['Coupe de France', 'French Cup'] },
    
    // Qualification rounds
    { name: 'Champions League Qualifying', country: 'Europe', type: 'qualification', tier: 1, searchTerms: ['Champions League Qualifying'] },
    { name: 'Europa League Qualifying', country: 'Europe', type: 'qualification', tier: 2, searchTerms: ['Europa League Qualifying'] },
    { name: 'Conference League Qualifying', country: 'Europe', type: 'qualification', tier: 3, searchTerms: ['Conference League Qualifying'] },
  ];
  
  // Country flag mapping
  private readonly COUNTRIES: Record<string, Country> = {
    'Brazil': { name: 'Brazil', code: 'BR', flagUrl: 'https://flagcdn.com/w80/br.png' },
    'England': { name: 'England', code: 'GB-ENG', flagUrl: 'https://flagcdn.com/w80/gb-eng.png' },
    'Spain': { name: 'Spain', code: 'ES', flagUrl: 'https://flagcdn.com/w80/es.png' },
    'Germany': { name: 'Germany', code: 'DE', flagUrl: 'https://flagcdn.com/w80/de.png' },
    'France': { name: 'France', code: 'FR', flagUrl: 'https://flagcdn.com/w80/fr.png' },
    'Italy': { name: 'Italy', code: 'IT', flagUrl: 'https://flagcdn.com/w80/it.png' },
    'Europe': { name: 'Europe', code: 'EU', flagUrl: 'https://flagcdn.com/w80/eu.png' },
  };

  /**
   * Fetch competition logo from TheSportsDB
   */
  async getCompetitionLogo(competitionName: string): Promise<string | null> {
    const competition = this.MVP_COMPETITIONS.find(comp => 
      comp.name === competitionName ||
      comp.searchTerms.some(term => 
        term.toLowerCase().includes(competitionName.toLowerCase()) ||
        competitionName.toLowerCase().includes(term.toLowerCase())
      )
    );

    if (!competition) {
      console.log(`⚠️ Competition not in MVP list: ${competitionName}`);
      return null;
    }

    // Try each search term
    for (const searchTerm of competition.searchTerms) {
      try {
        const response = await fetch(
          `${this.baseUrl}/${this.apiKey}/search_all_leagues.php?s=Soccer`
        );
        
        if (!response.ok) continue;
        
        const data = await response.json();
        
        if (data.leagues) {
          const league = data.leagues.find((l: any) => 
            l.strLeague.toLowerCase().includes(searchTerm.toLowerCase()) ||
            searchTerm.toLowerCase().includes(l.strLeague.toLowerCase())
          );
          
          if (league && (league.strBadge || league.strLogo)) {
            const logoUrl = league.strBadge || league.strLogo;
            console.log(`✅ Found competition logo for ${competitionName}: ${logoUrl}`);
            return logoUrl;
          }
        }
        
        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error) {
        console.error(`Error searching for ${searchTerm}:`, error);
        continue;
      }
    }
    
    // Fallback to country flag for cups/supercups
    if (competition.type === 'cup' || competition.type === 'supercup') {
      const country = this.COUNTRIES[competition.country];
      if (country?.flagUrl) {
        console.log(`🏁 Using country flag for ${competitionName}: ${country.flagUrl}`);
        return country.flagUrl;
      }
    }
    
    console.log(`❌ No logo found for competition: ${competitionName}`);
    return null;
  }
}

export const comprehensiveLogoService = new ComprehensiveLogoService();