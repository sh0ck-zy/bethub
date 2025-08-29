/**
 * Comprehensive TheSportsDB Logo Fetching
 * Following the proper API methodology to fetch all team and competition logos
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

class ComprehensiveTheSportsDBFetcher {
  constructor() {
    this.baseUrl = 'https://www.thesportsdb.com/api/v1/json/3';
    this.delay = 1500; // Rate limiting delay
  }

  // Target leagues for MVP coverage
  TARGET_LEAGUES = [
    // English
    'English Premier League',
    'English League Championship', 
    'FA Cup',
    'EFL Cup',
    'Community Shield',
    
    // Spanish
    'Spanish La Liga',
    'Spanish Segunda División',
    'Copa del Rey',
    'Supercopa de España',
    
    // German
    'German Bundesliga',
    'German 2. Bundesliga',
    'DFB-Pokal',
    'DFL-Supercup',
    
    // Italian
    'Italian Serie A',
    'Italian Serie B', 
    'Coppa Italia',
    'Supercoppa Italiana',
    
    // French
    'French Ligue 1',
    'French Ligue 2',
    'Coupe de France',
    'Trophée des Champions',
    
    // Dutch
    'Dutch Eredivisie',
    'KNVB Cup',
    'Johan Cruyff Shield',
    
    // Portuguese
    'Portuguese Primeira Liga',
    'Taça de Portugal',
    'Supertaça Cândido de Oliveira',
    
    // Brazilian
    'Brazilian Serie A',
    'Copa do Brasil',
    'Supercopa do Brasil',
    
    // European
    'UEFA Champions League',
    'UEFA Europa League',
    'UEFA Conference League',
    'UEFA Champions League Qualifying',
    'UEFA Europa League Qualifying',
    'UEFA Conference League Qualifying'
  ];

  /**
   * Step 1: Fetch all leagues and find IDs for our target leagues
   */
  async fetchAllLeagues() {
    console.log('📋 Step 1: Fetching all leagues from TheSportsDB...');
    
    try {
      const response = await fetch(`${this.baseUrl}/all_leagues.php`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!data.leagues) {
        throw new Error('No leagues data in response');
      }
      
      console.log(`✅ Found ${data.leagues.length} total leagues`);
      
      // Filter for soccer leagues only
      const soccerLeagues = data.leagues.filter(league => 
        league.strSport === 'Soccer' || league.strSport === 'Football'
      );
      
      console.log(`⚽ Found ${soccerLeagues.length} soccer leagues`);
      
      return soccerLeagues;
      
    } catch (error) {
      console.error('❌ Error fetching all leagues:', error.message);
      return [];
    }
  }

  /**
   * Find league IDs for our target leagues using fuzzy matching
   */
  findTargetLeagueIds(allLeagues) {
    console.log('\n🎯 Step 2: Finding target league IDs...');
    
    const foundLeagues = [];
    
    for (const targetLeague of this.TARGET_LEAGUES) {
      const league = allLeagues.find(l => {
        const leagueName = l.strLeague.toLowerCase();
        const targetName = targetLeague.toLowerCase();
        
        // Exact match
        if (leagueName === targetName) return true;
        
        // Fuzzy matching for common variations
        const keywords = targetName.split(' ');
        return keywords.every(keyword => 
          leagueName.includes(keyword) || 
          keyword.includes(leagueName)
        );
      });
      
      if (league) {
        foundLeagues.push({
          id: league.idLeague,
          name: league.strLeague,
          target: targetLeague,
          country: league.strCountry || 'Unknown'
        });
        console.log(`  ✅ ${targetLeague} → ${league.strLeague} (ID: ${league.idLeague})`);
      } else {
        console.log(`  ❌ Not found: ${targetLeague}`);
      }
    }
    
    console.log(`\n📊 Found ${foundLeagues.length}/${this.TARGET_LEAGUES.length} target leagues`);
    return foundLeagues;
  }

  /**
   * Step 3: Fetch league logo using lookupleague endpoint
   */
  async fetchLeagueLogo(leagueId, leagueName) {
    try {
      const response = await fetch(`${this.baseUrl}/lookupleague.php?id=${leagueId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.leagues && data.leagues.length > 0) {
        const league = data.leagues[0];
        const logoUrl = league.strBadge || league.strLogo;
        
        if (logoUrl) {
          console.log(`    🖼️  League logo: ${logoUrl}`);
          return logoUrl;
        }
      }
      
      return null;
      
    } catch (error) {
      console.log(`    ❌ Error fetching league logo: ${error.message}`);
      return null;
    }
  }

  /**
   * Step 4: Fetch all teams for a league using lookup_all_teams endpoint
   */
  async fetchLeagueTeams(leagueId, leagueName) {
    try {
      const response = await fetch(`${this.baseUrl}/lookup_all_teams.php?id=${leagueId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.teams && Array.isArray(data.teams)) {
        // Filter teams with logos
        const teamsWithLogos = data.teams.filter(team => 
          team.strTeamBadge || team.strTeamLogo
        );
        
        console.log(`    👥 Found ${teamsWithLogos.length} teams with logos`);
        return teamsWithLogos;
      }
      
      return [];
      
    } catch (error) {
      console.log(`    ❌ Error fetching teams: ${error.message}`);
      return [];
    }
  }

  /**
   * Save league to database
   */
  async saveLeague(leagueData) {
    try {
      const { error } = await supabase
        .from('leagues')
        .upsert({
          external_id: parseInt(leagueData.id),
          name: leagueData.name,
          country: leagueData.country,
          logo_url: leagueData.logo_url,
          type: leagueData.name.toLowerCase().includes('cup') ? 'cup' : 'league',
          season: '2024/25',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'external_id',
          ignoreDuplicates: false
        });
      
      if (error && !error.message.includes('constraint')) {
        console.log(`      ❌ DB Error: ${error.message}`);
        return false;
      }
      
      console.log(`      💾 Saved league: ${leagueData.name}`);
      return true;
      
    } catch (error) {
      console.error(`      ❌ Save error:`, error);
      return false;
    }
  }

  /**
   * Save team to database
   */
  async saveTeam(team, leagueName) {
    try {
      const { error } = await supabase
        .from('teams')
        .upsert({
          external_id: parseInt(team.idTeam),
          name: team.strTeam,
          short_name: team.strTeamShort || team.strTeam.split(' ').slice(-1)[0],
          league: leagueName,
          country: team.strCountry || 'Unknown',
          logo_url: team.strTeamBadge || team.strTeamLogo,
          founded: team.intFormedYear ? parseInt(team.intFormedYear) : null,
          venue: team.strStadium,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'external_id',
          ignoreDuplicates: false
        });
      
      if (error && !error.message.includes('constraint')) {
        console.log(`        ❌ DB Error: ${error.message}`);
        return false;
      }
      
      return true;
      
    } catch (error) {
      console.error(`        ❌ Save error:`, error);
      return false;
    }
  }

  /**
   * Main comprehensive fetching process
   */
  async fetchComprehensiveLogos() {
    console.log('🚀 Starting comprehensive TheSportsDB logo fetching...\n');
    
    // Step 1: Get all leagues
    const allLeagues = await this.fetchAllLeagues();
    if (allLeagues.length === 0) {
      console.log('❌ Cannot proceed without league data');
      return;
    }
    
    // Step 2: Find our target leagues
    const targetLeagues = this.findTargetLeagueIds(allLeagues);
    if (targetLeagues.length === 0) {
      console.log('❌ No target leagues found');
      return;
    }
    
    // Step 3 & 4: Process each league
    let leaguesSaved = 0;
    let teamsSaved = 0;
    
    for (const league of targetLeagues) {
      console.log(`\n🔄 Processing: ${league.name}`);
      
      // Fetch league logo
      const leagueLogo = await this.fetchLeagueLogo(league.id, league.name);
      
      if (leagueLogo) {
        const leagueData = {
          id: league.id,
          name: league.name,
          country: league.country,
          logo_url: leagueLogo
        };
        
        const saved = await this.saveLeague(leagueData);
        if (saved) leaguesSaved++;
      }
      
      // Fetch teams for this league
      const teams = await this.fetchLeagueTeams(league.id, league.name);
      
      let leagueTeamsSaved = 0;
      for (const team of teams) {
        const saved = await this.saveTeam(team, league.name);
        if (saved) {
          teamsSaved++;
          leagueTeamsSaved++;
        }
      }
      
      console.log(`    📊 Saved ${leagueTeamsSaved}/${teams.length} teams`);
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, this.delay));
    }
    
    console.log(`\n🎉 Comprehensive fetching completed!`);
    console.log(`📊 Results:`);
    console.log(`   🏆 Leagues processed: ${targetLeagues.length}`);
    console.log(`   💾 Leagues saved: ${leaguesSaved}`);
    console.log(`   👥 Teams saved: ${teamsSaved}`);
    
    // Show final statistics
    await this.showFinalStats();
  }

  /**
   * Show final coverage statistics
   */
  async showFinalStats() {
    console.log('\n📈 Final Coverage Statistics:');
    
    // League stats
    const { data: leagues } = await supabase
      .from('leagues')
      .select('name, country, logo_url')
      .not('logo_url', 'is', null)
      .order('country, name');
    
    // Team stats  
    const { data: teams } = await supabase
      .from('teams')
      .select('name, country, logo_url')
      .not('logo_url', 'is', null)
      .order('country, name');
    
    console.log(`\n🏆 LEAGUES WITH LOGOS: ${leagues?.length || 0}`);
    const leaguesByCountry = {};
    leagues?.forEach(league => {
      if (!leaguesByCountry[league.country]) leaguesByCountry[league.country] = [];
      leaguesByCountry[league.country].push(league.name);
    });
    
    Object.entries(leaguesByCountry).forEach(([country, leagueList]) => {
      console.log(`   📍 ${country}: ${leagueList.length} leagues`);
      leagueList.slice(0, 3).forEach(league => console.log(`      • ${league}`));
      if (leagueList.length > 3) console.log(`      • ...and ${leagueList.length - 3} more`);
    });
    
    console.log(`\n👥 TEAMS WITH LOGOS: ${teams?.length || 0}`);
    const teamsByCountry = {};
    teams?.forEach(team => {
      if (!teamsByCountry[team.country]) teamsByCountry[team.country] = 0;
      teamsByCountry[team.country]++;
    });
    
    Object.entries(teamsByCountry)
      .sort(([,a], [,b]) => b - a)
      .forEach(([country, count]) => {
        console.log(`   📍 ${country}: ${count} teams`);
      });
    
    console.log('\n🎯 Your MVP now has comprehensive TheSportsDB logo coverage!');
  }
}

async function main() {
  const fetcher = new ComprehensiveTheSportsDBFetcher();
  
  try {
    await fetcher.fetchComprehensiveLogos();
  } catch (error) {
    console.error('❌ Script failed:', error);
  }
}

main();