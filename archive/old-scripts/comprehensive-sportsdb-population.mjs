/**
 * Comprehensive TheSportsDB Logo Population
 * Uses TheSportsDB documented endpoints to fetch all logos for MVP coverage
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

class ComprehensiveSportsDBPopulator {
  constructor() {
    this.apiKey = '123'; // Your free key
    this.baseUrl = 'https://www.thesportsdb.com/api/v1/json';
  }

  // MVP Leagues to fetch from TheSportsDB
  MVP_LEAGUES = [
    // English
    { id: '4328', name: 'English Premier League', country: 'England' },
    { id: '4329', name: 'English League Championship', country: 'England' },
    { id: '4482', name: 'FA Cup', country: 'England' },
    { id: '4570', name: 'EFL Cup', country: 'England' },
    
    // Spanish  
    { id: '4335', name: 'Spanish La Liga', country: 'Spain' },
    { id: '4336', name: 'Spanish Segunda División', country: 'Spain' },
    { id: '4480', name: 'Copa del Rey', country: 'Spain' },
    
    // German
    { id: '4331', name: 'German Bundesliga', country: 'Germany' },
    { id: '4332', name: 'German 2. Bundesliga', country: 'Germany' },
    { id: '4484', name: 'DFB-Pokal', country: 'Germany' },
    
    // Italian
    { id: '4332', name: 'Italian Serie A', country: 'Italy' },
    { id: '4333', name: 'Italian Serie B', country: 'Italy' },
    { id: '4485', name: 'Coppa Italia', country: 'Italy' },
    
    // French
    { id: '4334', name: 'French Ligue 1', country: 'France' },
    { id: '4335', name: 'French Ligue 2', country: 'France' },
    { id: '4481', name: 'Coupe de France', country: 'France' },
    
    // Dutch
    { id: '4337', name: 'Dutch Eredivisie', country: 'Netherlands' },
    { id: '4488', name: 'KNVB Cup', country: 'Netherlands' },
    
    // Portuguese
    { id: '4344', name: 'Portuguese Primeira Liga', country: 'Portugal' },
    { id: '4486', name: 'Taça de Portugal', country: 'Portugal' },
    
    // Brazilian
    { id: '4351', name: 'Brazilian Serie A', country: 'Brazil' },
    { id: '4487', name: 'Copa do Brasil', country: 'Brazil' },
    
    // European
    { id: '4480', name: 'UEFA Champions League', country: 'Europe' },
    { id: '4481', name: 'UEFA Europa League', country: 'Europe' },
    { id: '4482', name: 'UEFA Conference League', country: 'Europe' },
  ];

  /**
   * Fetch all leagues and their logos from TheSportsDB
   */
  async fetchAllLeaguesWithLogos() {
    console.log('🏆 Fetching all leagues from TheSportsDB...');
    
    try {
      const response = await fetch(`${this.baseUrl}/${this.apiKey}/all_leagues.php`);
      const data = await response.json();
      
      if (!data.leagues) {
        console.log('❌ No leagues found');
        return [];
      }
      
      console.log(`📋 Found ${data.leagues.length} leagues total`);
      
      // Filter for soccer leagues with logos
      const soccerLeagues = data.leagues.filter(league => 
        league.strSport === 'Soccer' && 
        (league.strBadge || league.strLogo)
      );
      
      console.log(`⚽ Found ${soccerLeagues.length} soccer leagues with logos`);
      
      return soccerLeagues;
      
    } catch (error) {
      console.error('❌ Error fetching leagues:', error);
      return [];
    }
  }

  /**
   * Fetch teams for a specific league
   */
  async fetchTeamsInLeague(leagueId, leagueName) {
    console.log(`👥 Fetching teams for: ${leagueName}`);
    
    try {
      const response = await fetch(`${this.baseUrl}/${this.apiKey}/lookup_all_teams.php?id=${leagueId}`);
      const data = await response.json();
      
      if (!data.teams) {
        console.log(`   ⚠️  No teams found for ${leagueName}`);
        return [];
      }
      
      // Filter teams with logos
      const teamsWithLogos = data.teams.filter(team => 
        team.strTeamBadge || team.strTeamLogo
      );
      
      console.log(`   ✅ Found ${teamsWithLogos.length} teams with logos`);
      return teamsWithLogos;
      
    } catch (error) {
      console.error(`   ❌ Error fetching teams for ${leagueName}:`, error);
      return [];
    }
  }

  /**
   * Save league to database
   */
  async saveLeague(league) {
    try {
      const { error } = await supabase
        .from('leagues')
        .upsert({
          external_id: parseInt(league.idLeague),
          name: league.strLeague,
          country: league.strCountry || 'Unknown',
          logo_url: league.strBadge || league.strLogo,
          type: league.strLeague.toLowerCase().includes('cup') ? 'cup' : 'league',
          season: '2024/25',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'external_id',
          ignoreDuplicates: false
        });
      
      if (error) {
        console.log(`   ❌ DB Error: ${error.message}`);
        return false;
      }
      
      console.log(`   💾 Saved: ${league.strLeague}`);
      return true;
      
    } catch (error) {
      console.error(`   ❌ Save error:`, error);
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
      
      if (error) {
        console.log(`     ❌ DB Error: ${error.message}`);
        return false;
      }
      
      return true;
      
    } catch (error) {
      console.error(`     ❌ Save error:`, error);
      return false;
    }
  }

  /**
   * Main population process
   */
  async populateAll() {
    console.log('🚀 Starting comprehensive TheSportsDB population...');
    console.log('📊 This will fetch ALL soccer leagues and teams with logos\\n');
    
    let leaguesSaved = 0;
    let teamsSaved = 0;
    let totalTeamsFound = 0;
    
    // Step 1: Fetch all leagues
    const allLeagues = await this.fetchAllLeaguesWithLogos();
    
    if (allLeagues.length === 0) {
      console.log('❌ No leagues found, stopping');
      return;
    }
    
    // Step 2: Process each league
    for (const league of allLeagues.slice(0, 50)) { // Limit to first 50 leagues for MVP
      console.log(`\\n🔄 Processing: ${league.strLeague} (${league.strCountry})`);
      
      // Save league
      const leagueSaved = await this.saveLeague(league);
      if (leagueSaved) leaguesSaved++;
      
      // Fetch and save teams
      const teams = await this.fetchTeamsInLeague(league.idLeague, league.strLeague);
      totalTeamsFound += teams.length;
      
      let leagueTeamsSaved = 0;
      for (const team of teams) {
        const teamSaved = await this.saveTeam(team, league.strLeague);
        if (teamSaved) {
          teamsSaved++;
          leagueTeamsSaved++;
        }
      }
      
      console.log(`   📊 Saved ${leagueTeamsSaved}/${teams.length} teams`);
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    // Step 3: Results
    console.log('\\n🎉 Population completed!');
    console.log(`📊 Results:`);
    console.log(`   🏆 Leagues saved: ${leaguesSaved}`);
    console.log(`   👥 Teams found: ${totalTeamsFound}`);
    console.log(`   💾 Teams saved: ${teamsSaved}`);
    
    // Step 4: Show coverage stats
    await this.showCoverageStats();
  }

  /**
   * Show final coverage statistics
   */
  async showCoverageStats() {
    console.log('\\n📋 Final Coverage Statistics:');
    
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
    
    console.log(`\\n🏆 LEAGUES WITH LOGOS: ${leagues?.length || 0}`);
    const leaguesByCountry = {};
    leagues?.forEach(league => {
      if (!leaguesByCountry[league.country]) leaguesByCountry[league.country] = [];
      leaguesByCountry[league.country].push(league.name);
    });
    
    Object.entries(leaguesByCountry).forEach(([country, leagueList]) => {
      console.log(`   ${country}: ${leagueList.length} leagues`);
      leagueList.slice(0, 3).forEach(league => console.log(`     • ${league}`));
      if (leagueList.length > 3) console.log(`     • ...and ${leagueList.length - 3} more`);
    });
    
    console.log(`\\n👥 TEAMS WITH LOGOS: ${teams?.length || 0}`);
    const teamsByCountry = {};
    teams?.forEach(team => {
      if (!teamsByCountry[team.country]) teamsByCountry[team.country] = 0;
      teamsByCountry[team.country]++;
    });
    
    Object.entries(teamsByCountry)
      .sort(([,a], [,b]) => b - a) // Sort by count
      .forEach(([country, count]) => {
        console.log(`   ${country}: ${count} teams`);
      });
    
    console.log('\\n🎯 Your MVP now has comprehensive logo coverage from TheSportsDB!');
  }

  /**
   * Quick test of a few popular teams
   */
  async testPopularTeams() {
    console.log('\\n🧪 Testing popular team logos...');
    
    const popularTeams = [
      'Arsenal', 'Manchester United', 'Liverpool', 'Chelsea',
      'Real Madrid', 'Barcelona', 'Bayern Munich', 'Juventus',
      'Flamengo', 'Palmeiras', 'Santos', 'Botafogo'
    ];
    
    for (const teamName of popularTeams) {
      const { data } = await supabase
        .from('teams')
        .select('name, logo_url')
        .ilike('name', `%${teamName}%`)
        .limit(1);
      
      if (data && data.length > 0) {
        const status = data[0].logo_url ? '✅' : '❌';
        console.log(`   ${status} ${data[0].name}`);
      } else {
        console.log(`   ❓ ${teamName} - Not found`);
      }
    }
  }
}

async function main() {
  const populator = new ComprehensiveSportsDBPopulator();
  
  try {
    await populator.populateAll();
    await populator.testPopularTeams();
  } catch (error) {
    console.error('❌ Script failed:', error);
  }
}

main();