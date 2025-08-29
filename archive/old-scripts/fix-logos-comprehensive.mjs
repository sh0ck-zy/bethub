/**
 * Comprehensive logo fix using TheSportsDB all teams endpoint
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

class ComprehensiveLogoFixer {
  constructor() {
    this.apiKey = '123';
    this.baseUrl = 'https://www.thesportsdb.com/api/v1/json';
  }

  // Teams that need fixing
  TEAMS_TO_FIX = [
    { db_name: 'Arsenal', search_terms: ['Arsenal', 'Arsenal FC'] },
    { db_name: 'Barcelona', search_terms: ['Barcelona', 'FC Barcelona', 'Futbol Club Barcelona'] },
    { db_name: 'Bayern Munich', search_terms: ['Bayern Munich', 'FC Bayern München', 'Bayern München'] },
    { db_name: 'Borussia Dortmund', search_terms: ['Borussia Dortmund', 'BVB', 'Dortmund'] },
    { db_name: 'Chelsea', search_terms: ['Chelsea', 'Chelsea FC'] },
    { db_name: 'Juventus', search_terms: ['Juventus', 'Juventus FC', 'Juve'] },
    { db_name: 'Liverpool', search_terms: ['Liverpool', 'Liverpool FC'] },
    { db_name: 'Manchester United', search_terms: ['Manchester United', 'Man United', 'Manchester Utd'] },
    { db_name: 'Real Madrid', search_terms: ['Real Madrid', 'Real Madrid CF'] },
    { db_name: 'AC Milan', search_terms: ['AC Milan', 'Milan', 'Associazione Calcio Milan'] }
  ];

  /**
   * Get all soccer teams from TheSportsDB
   */
  async getAllSoccerTeams() {
    console.log('📥 Fetching all soccer teams from TheSportsDB...');
    
    try {
      const response = await fetch(`${this.baseUrl}/${this.apiKey}/search_all_teams.php?s=Soccer`);
      
      if (!response.ok) {
        console.log('❌ API request failed');
        return [];
      }
      
      const data = await response.json();
      
      if (!data.teams) {
        console.log('⚠️  No teams data');
        return [];
      }
      
      console.log(`✅ Found ${data.teams.length} total soccer teams`);
      return data.teams;
      
    } catch (error) {
      console.error('❌ Error fetching teams:', error);
      return [];
    }
  }

  /**
   * Find team by fuzzy matching
   */
  findTeamByName(allTeams, searchTerms) {
    for (const searchTerm of searchTerms) {
      const team = allTeams.find(t => {
        if (!t.strTeam) return false;
        
        const teamName = t.strTeam.toLowerCase();
        const searchName = searchTerm.toLowerCase();
        
        return teamName === searchName || 
               teamName.includes(searchName) || 
               searchName.includes(teamName);
      });
      
      if (team && (team.strTeamBadge || team.strTeamLogo)) {
        return team;
      }
    }
    
    return null;
  }

  /**
   * Update team logo in database
   */
  async updateTeamLogo(teamName, logoUrl) {
    try {
      const { error } = await supabase
        .from('teams')
        .update({
          logo_url: logoUrl,
          updated_at: new Date().toISOString()
        })
        .eq('name', teamName);
      
      if (error) {
        console.log(`   ❌ DB Error: ${error.message}`);
        return false;
      }
      
      console.log(`   💾 Updated: ${teamName}`);
      return true;
      
    } catch (error) {
      console.error(`   ❌ Update error:`, error);
      return false;
    }
  }

  /**
   * Fix all team logos
   */
  async fixAllLogos() {
    console.log('🔧 Starting comprehensive logo fix...\n');
    
    // Get all teams first
    const allTeams = await this.getAllSoccerTeams();
    if (allTeams.length === 0) {
      console.log('❌ No teams data available');
      return;
    }
    
    let fixed = 0;
    
    for (const teamConfig of this.TEAMS_TO_FIX) {
      console.log(`\n🔄 Processing: ${teamConfig.db_name}`);
      
      // Find team by name matching
      const foundTeam = this.findTeamByName(allTeams, teamConfig.search_terms);
      
      if (foundTeam) {
        const logoUrl = foundTeam.strTeamBadge || foundTeam.strTeamLogo;
        console.log(`   ✅ Found: ${foundTeam.strTeam}`);
        console.log(`   🖼️  Logo: ${logoUrl}`);
        
        const updated = await this.updateTeamLogo(teamConfig.db_name, logoUrl);
        if (updated) fixed++;
      } else {
        console.log(`   ❌ Not found: ${teamConfig.db_name}`);
      }
    }
    
    console.log(`\n🎉 Fixed ${fixed}/${this.TEAMS_TO_FIX.length} team logos!`);
    
    // Show results
    await this.showResults();
  }

  /**
   * Show final results
   */
  async showResults() {
    console.log('\n📊 Final Results:');
    
    const { data: teams } = await supabase
      .from('teams')
      .select('name, logo_url, country')
      .in('name', this.TEAMS_TO_FIX.map(t => t.db_name));
    
    teams?.forEach(team => {
      const status = team.logo_url?.startsWith('https://') ? '✅ EXTERNAL' : '❌ BROKEN';
      console.log(`   ${status} ${team.name}`);
    });
    
    // Also check all teams
    console.log('\n🌍 All Teams Status:');
    const { data: allTeams } = await supabase
      .from('teams')
      .select('name, logo_url, country');
    
    const working = allTeams?.filter(t => t.logo_url?.startsWith('https://'))?.length || 0;
    const broken = allTeams?.filter(t => t.logo_url?.startsWith('/logos/'))?.length || 0;
    
    console.log(`   ✅ Working logos: ${working}`);
    console.log(`   ❌ Broken logos: ${broken}`);
    console.log(`   📊 Total teams: ${allTeams?.length || 0}`);
  }
}

async function main() {
  const fixer = new ComprehensiveLogoFixer();
  
  try {
    await fixer.fixAllLogos();
  } catch (error) {
    console.error('❌ Script failed:', error);
  }
}

main();