#!/usr/bin/env node

/**
 * Comprehensive Logo Population Script
 * Populates all team and league logos using available services
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

class LogoPopulator {
  constructor() {
    this.apiKey = '123'; // TheSportsDB free key
    this.baseUrl = 'https://www.thesportsdb.com/api/v1/json';
    this.delay = 2000; // 2 seconds between requests
  }

  /**
   * Get team logo from TheSportsDB
   */
  async fetchTeamLogo(teamName) {
    const searchTerms = this.generateTeamSearchTerms(teamName);
    
    for (const searchTerm of searchTerms) {
      try {
        console.log(`   🔍 Searching: ${searchTerm}`);
        
        const response = await fetch(
          `${this.baseUrl}/${this.apiKey}/searchteams.php?t=${encodeURIComponent(searchTerm)}`
        );
        
        if (!response.ok) continue;
        
        const data = await response.json();
        
        if (data.teams && data.teams.length > 0) {
          const team = data.teams[0];
          const logoUrl = team.strTeamBadge || team.strTeamLogo;
          
          if (logoUrl && logoUrl.includes('http')) {
            console.log(`   ✅ Found logo: ${logoUrl}`);
            return logoUrl;
          }
        }
        
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error) {
        console.error(`   ❌ Error searching ${searchTerm}:`, error.message);
      }
    }
    
    return null;
  }

  /**
   * Get league logo from TheSportsDB
   */
  async fetchLeagueLogo(leagueName) {
    try {
      console.log(`   🔍 Searching league: ${leagueName}`);
      
      const response = await fetch(
        `${this.baseUrl}/${this.apiKey}/search_all_leagues.php?s=Soccer`
      );
      
      if (!response.ok) return null;
      
      const data = await response.json();
      
      if (data.leagues) {
        const league = data.leagues.find(l => 
          l.strLeague.toLowerCase().includes(leagueName.toLowerCase()) ||
          leagueName.toLowerCase().includes(l.strLeague.toLowerCase()) ||
          this.isLeagueMatch(l.strLeague, leagueName)
        );
        
        if (league && (league.strBadge || league.strLogo)) {
          const logoUrl = league.strBadge || league.strLogo;
          if (logoUrl && logoUrl.includes('http')) {
            console.log(`   ✅ Found league logo: ${logoUrl}`);
            return logoUrl;
          }
        }
      }
      
    } catch (error) {
      console.error(`   ❌ Error searching league ${leagueName}:`, error.message);
    }
    
    return null;
  }

  /**
   * Generate search terms for teams
   */
  generateTeamSearchTerms(teamName) {
    const terms = [teamName];
    
    // Remove common prefixes/suffixes
    const cleaned = teamName
      .replace(/^(FC|CF|SC|AC|EC|CR|SE)\s+/i, '')
      .replace(/\s+(FC|CF|SC|AC|EC|CR|SE)$/i, '')
      .replace(/\s+(FR|RJ|SP|MG|RS|BA|PE|CE)$/i, '');
    
    if (cleaned !== teamName) {
      terms.push(cleaned);
    }
    
    // Add with FC prefix
    if (!teamName.match(/^(FC|CF|SC|AC)/i)) {
      terms.push(`FC ${teamName}`);
      terms.push(`${teamName} FC`);
    }
    
    // Common team name mappings
    const mappings = {
      'Manchester United': ['Manchester United', 'Man United', 'Man Utd'],
      'Bayern Munich': ['Bayern Munich', 'FC Bayern Munich', 'Bayern München'],
      'Real Madrid': ['Real Madrid', 'Real Madrid CF'],
      'Barcelona': ['Barcelona', 'FC Barcelona', 'Barca'],
      'AC Milan': ['AC Milan', 'Milan'],
      'Borussia Dortmund': ['Borussia Dortmund', 'BVB', 'Dortmund'],
      'CR Flamengo': ['Flamengo', 'Clube de Regatas do Flamengo'],
      'SE Palmeiras': ['Palmeiras', 'Sociedade Esportiva Palmeiras'],
      'Santos FC': ['Santos', 'Santos Futebol Clube'],
      'Botafogo FR': ['Botafogo', 'Botafogo de Futebol e Regatas'],
      'CR Vasco da Gama': ['Vasco da Gama', 'Vasco'],
      'SC Internacional': ['Internacional', 'Inter Porto Alegre'],
      'EC Vitória': ['Vitoria', 'Esporte Clube Vitoria'],
    };
    
    if (mappings[teamName]) {
      terms.push(...mappings[teamName]);
    }
    
    return [...new Set(terms)];
  }

  /**
   * Check if league names match
   */
  isLeagueMatch(dbLeague, searchLeague) {
    const mappings = {
      'Premier League': ['English Premier League', 'Premier League'],
      'La Liga': ['Spanish La Liga', 'Primera División'],
      'Bundesliga': ['German Bundesliga', 'Bundesliga'],
      'Serie A': ['Italian Serie A', 'Serie A'],
      'Ligue 1': ['French Ligue 1', 'Ligue 1'],
      'Brasileirão Série A': ['Brazilian League', 'Serie A Brazil', 'Campeonato Brasileiro'],
      'Champions League': ['UEFA Champions League', 'Champions League'],
      'Europa League': ['UEFA Europa League', 'Europa League'],
    };
    
    for (const [key, variations] of Object.entries(mappings)) {
      if ((key === searchLeague || variations.includes(searchLeague)) &&
          (key === dbLeague || variations.includes(dbLeague))) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Populate all team logos
   */
  async populateTeamLogos() {
    console.log('🚀 Starting team logo population...\n');
    
    // Get all teams from database
    const { data: teams, error } = await supabase
      .from('teams')
      .select('id, name, logo_url')
      .order('name');
    
    if (error) {
      console.error('❌ Database error:', error);
      return { updated: 0, total: 0 };
    }
    
    console.log(`📋 Found ${teams.length} teams in database\n`);
    
    let updated = 0;
    let skipped = 0;
    
    for (const team of teams) {
      console.log(`🔄 Processing: ${team.name}`);
      
      // Skip if already has a logo
      if (team.logo_url && team.logo_url.includes('http')) {
        console.log(`   ⏩ Already has logo`);
        skipped++;
        continue;
      }
      
      // Fetch logo
      const logoUrl = await this.fetchTeamLogo(team.name);
      
      if (logoUrl) {
        // Update database
        const { error: updateError } = await supabase
          .from('teams')
          .update({ logo_url: logoUrl })
          .eq('id', team.id);
        
        if (updateError) {
          console.error(`   ❌ Failed to update database:`, updateError.message);
        } else {
          console.log(`   💾 Updated database`);
          updated++;
        }
      } else {
        console.log(`   ⚠️  No logo found`);
      }
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, this.delay));
    }
    
    console.log(`\n✅ Team logos completed!`);
    console.log(`   📊 Total teams: ${teams.length}`);
    console.log(`   ⏩ Skipped: ${skipped}`);
    console.log(`   💾 Updated: ${updated}`);
    
    return { updated, total: teams.length };
  }

  /**
   * Populate all league logos
   */
  async populateLeagueLogos() {
    console.log('\n🚀 Starting league logo population...\n');
    
    // Get all leagues from database
    const { data: leagues, error } = await supabase
      .from('leagues')
      .select('id, name, logo_url')
      .order('name');
    
    if (error) {
      console.error('❌ Database error:', error);
      return { updated: 0, total: 0 };
    }
    
    console.log(`📋 Found ${leagues.length} leagues in database\n`);
    
    let updated = 0;
    let skipped = 0;
    
    for (const league of leagues) {
      console.log(`🔄 Processing: ${league.name}`);
      
      // Skip if already has a logo
      if (league.logo_url && league.logo_url.includes('http')) {
        console.log(`   ⏩ Already has logo`);
        skipped++;
        continue;
      }
      
      // Fetch logo
      const logoUrl = await this.fetchLeagueLogo(league.name);
      
      if (logoUrl) {
        // Update database
        const { error: updateError } = await supabase
          .from('leagues')
          .update({ logo_url: logoUrl })
          .eq('id', league.id);
        
        if (updateError) {
          console.error(`   ❌ Failed to update database:`, updateError.message);
        } else {
          console.log(`   💾 Updated database`);
          updated++;
        }
      } else {
        console.log(`   ⚠️  No logo found`);
      }
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, this.delay));
    }
    
    console.log(`\n✅ League logos completed!`);
    console.log(`   📊 Total leagues: ${leagues.length}`);
    console.log(`   ⏩ Skipped: ${skipped}`);
    console.log(`   💾 Updated: ${updated}`);
    
    return { updated, total: leagues.length };
  }

  /**
   * Create sample data if tables are empty
   */
  async createSampleData() {
    console.log('🔍 Checking if sample data is needed...\n');
    
    // Check if we have teams
    const { data: existingTeams, error: teamsError } = await supabase
      .from('teams')
      .select('id')
      .limit(1);
    
    if (teamsError || !existingTeams || existingTeams.length === 0) {
      console.log('📝 Creating sample teams...');
      
      const sampleTeams = [
        // Brazilian teams
        { name: 'CR Flamengo', country: 'Brazil', league: 'Brasileirão Série A' },
        { name: 'SE Palmeiras', country: 'Brazil', league: 'Brasileirão Série A' },
        { name: 'Santos FC', country: 'Brazil', league: 'Brasileirão Série A' },
        { name: 'Botafogo FR', country: 'Brazil', league: 'Brasileirão Série A' },
        { name: 'CR Vasco da Gama', country: 'Brazil', league: 'Brasileirão Série A' },
        { name: 'SC Internacional', country: 'Brazil', league: 'Brasileirão Série A' },
        
        // English teams
        { name: 'Manchester United', country: 'England', league: 'Premier League' },
        { name: 'Liverpool', country: 'England', league: 'Premier League' },
        { name: 'Arsenal', country: 'England', league: 'Premier League' },
        { name: 'Chelsea', country: 'England', league: 'Premier League' },
        { name: 'Manchester City', country: 'England', league: 'Premier League' },
        { name: 'Tottenham', country: 'England', league: 'Premier League' },
        
        // Spanish teams
        { name: 'Real Madrid', country: 'Spain', league: 'La Liga' },
        { name: 'Barcelona', country: 'Spain', league: 'La Liga' },
        { name: 'Atlético Madrid', country: 'Spain', league: 'La Liga' },
        
        // German teams
        { name: 'Bayern Munich', country: 'Germany', league: 'Bundesliga' },
        { name: 'Borussia Dortmund', country: 'Germany', league: 'Bundesliga' },
      ];
      
      const { error: insertError } = await supabase
        .from('teams')
        .insert(sampleTeams);
      
      if (insertError) {
        console.error('❌ Error creating sample teams:', insertError);
      } else {
        console.log(`✅ Created ${sampleTeams.length} sample teams`);
      }
    }
    
    // Check if we have leagues
    const { data: existingLeagues, error: leaguesError } = await supabase
      .from('leagues')
      .select('id')
      .limit(1);
    
    if (leaguesError || !existingLeagues || existingLeagues.length === 0) {
      console.log('📝 Creating sample leagues...');
      
      const sampleLeagues = [
        { name: 'Premier League', country: 'England', type: 'league' },
        { name: 'La Liga', country: 'Spain', type: 'league' },
        { name: 'Bundesliga', country: 'Germany', type: 'league' },
        { name: 'Serie A', country: 'Italy', type: 'league' },
        { name: 'Ligue 1', country: 'France', type: 'league' },
        { name: 'Brasileirão Série A', country: 'Brazil', type: 'league' },
        { name: 'UEFA Champions League', country: 'Europe', type: 'european' },
        { name: 'UEFA Europa League', country: 'Europe', type: 'european' },
        { name: 'FA Cup', country: 'England', type: 'cup' },
        { name: 'Copa del Rey', country: 'Spain', type: 'cup' },
        { name: 'Copa do Brasil', country: 'Brazil', type: 'cup' },
      ];
      
      const { error: insertError } = await supabase
        .from('leagues')
        .insert(sampleLeagues);
      
      if (insertError) {
        console.error('❌ Error creating sample leagues:', insertError);
      } else {
        console.log(`✅ Created ${sampleLeagues.length} sample leagues`);
      }
    }
  }

  /**
   * Run complete logo population process
   */
  async run() {
    console.log('🎯 BetHub Logo Population System');
    console.log('================================\n');
    
    try {
      // Create sample data if needed
      await this.createSampleData();
      
      // Populate team logos
      const teamResults = await this.populateTeamLogos();
      
      // Populate league logos
      const leagueResults = await this.populateLeagueLogos();
      
      // Final summary
      console.log('\n🎉 Logo population completed!');
      console.log('=============================');
      console.log(`📊 Teams updated: ${teamResults.updated}/${teamResults.total}`);
      console.log(`🏆 Leagues updated: ${leagueResults.updated}/${leagueResults.total}`);
      
      // Show current status
      await this.showFinalStatus();
      
    } catch (error) {
      console.error('❌ Fatal error:', error);
      process.exit(1);
    }
  }

  /**
   * Show final logo status
   */
  async showFinalStatus() {
    console.log('\n📋 Final Logo Status:');
    console.log('=====================');
    
    // Team status
    const { data: teams } = await supabase
      .from('teams')
      .select('name, logo_url')
      .order('name');
    
    if (teams) {
      console.log('\n🏃 Teams:');
      teams.slice(0, 10).forEach(team => {
        const status = team.logo_url ? '✅' : '🔤';
        console.log(`   ${status} ${team.name}`);
      });
      
      if (teams.length > 10) {
        console.log(`   ... and ${teams.length - 10} more teams`);
      }
    }
    
    // League status
    const { data: leagues } = await supabase
      .from('leagues')
      .select('name, logo_url')
      .order('name');
    
    if (leagues) {
      console.log('\n🏆 Leagues:');
      leagues.forEach(league => {
        const status = league.logo_url ? '✅' : '🔤';
        console.log(`   ${status} ${league.name}`);
      });
    }
    
    console.log('\n✅ = Has logo, 🔤 = Using initials fallback');
  }
}

// Run the script
const populator = new LogoPopulator();
populator.run().catch(console.error);
