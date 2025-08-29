/**
 * Fix European team logos by fetching TheSportsDB URLs
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

class EuropeanTeamLogoFixer {
  constructor() {
    this.apiKey = '123';
    this.baseUrl = 'https://www.thesportsdb.com/api/v1/json';
  }

  // European teams that need fixing
  EUROPEAN_TEAMS = [
    'Arsenal',
    'Barcelona', 
    'Bayern Munich',
    'Borussia Dortmund',
    'Chelsea',
    'Juventus',
    'Liverpool',
    'Manchester United',
    'Real Madrid',
    'AC Milan'
  ];

  /**
   * Search for team logo on TheSportsDB
   */
  async searchTeamLogo(teamName) {
    console.log(`🔍 Searching for: ${teamName}`);
    
    try {
      // Try different search variations
      const searchTerms = [
        teamName,
        teamName.replace('AC ', ''),
        teamName.replace('FC ', ''),
        teamName.split(' ')[0] // First word only
      ];
      
      for (const searchTerm of searchTerms) {
        console.log(`   Trying: "${searchTerm}"`);
        
        const response = await fetch(`${this.baseUrl}/${this.apiKey}/searchteams.php?t=${encodeURIComponent(searchTerm)}`);
        
        if (response.ok) {
          const data = await response.json();
          
          if (data.teams && data.teams.length > 0) {
            // Find the best match
            const team = data.teams.find(t => 
              t.strTeam.toLowerCase().includes(searchTerm.toLowerCase()) ||
              searchTerm.toLowerCase().includes(t.strTeam.toLowerCase())
            ) || data.teams[0];
            
            if (team && (team.strTeamBadge || team.strTeamLogo)) {
              console.log(`   ✅ Found: ${team.strTeam}`);
              console.log(`   🖼️  Logo: ${team.strTeamBadge || team.strTeamLogo}`);
              return {
                name: team.strTeam,
                logo_url: team.strTeamBadge || team.strTeamLogo,
                country: team.strCountry
              };
            }
          }
        }
        
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      console.log(`   ❌ Not found: ${teamName}`);
      return null;
      
    } catch (error) {
      console.error(`   ❌ Error: ${error.message}`);
      return null;
    }
  }

  /**
   * Update team logo in database
   */
  async updateTeamLogo(originalName, logoData) {
    if (!logoData) return false;
    
    try {
      const { error } = await supabase
        .from('teams')
        .update({
          logo_url: logoData.logo_url,
          updated_at: new Date().toISOString()
        })
        .eq('name', originalName);
      
      if (error) {
        console.log(`   ❌ DB Error: ${error.message}`);
        return false;
      }
      
      console.log(`   💾 Updated: ${originalName} → ${logoData.logo_url}`);
      return true;
      
    } catch (error) {
      console.error(`   ❌ Update error:`, error);
      return false;
    }
  }

  /**
   * Fix all European team logos
   */
  async fixAllLogos() {
    console.log('🔧 Fixing European team logos...\n');
    
    let fixed = 0;
    
    for (const teamName of this.EUROPEAN_TEAMS) {
      console.log(`\n🔄 Processing: ${teamName}`);
      
      // Search for logo
      const logoData = await this.searchTeamLogo(teamName);
      
      if (logoData) {
        const updated = await this.updateTeamLogo(teamName, logoData);
        if (updated) fixed++;
      }
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    console.log(`\n🎉 Fixed ${fixed}/${this.EUROPEAN_TEAMS.length} team logos!`);
    
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
      .in('name', this.EUROPEAN_TEAMS);
    
    teams?.forEach(team => {
      const status = team.logo_url?.startsWith('https://') ? '✅' : '❌';
      console.log(`   ${status} ${team.name} - ${team.logo_url}`);
    });
  }
}

async function main() {
  const fixer = new EuropeanTeamLogoFixer();
  
  try {
    await fixer.fixAllLogos();
  } catch (error) {
    console.error('❌ Script failed:', error);
  }
}

main();