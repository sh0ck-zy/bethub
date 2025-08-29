/**
 * Manual logo fix with well-known TheSportsDB URLs
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

class ManualLogoFixer {
  // Well-known TheSportsDB logo URLs for major European teams
  TEAM_LOGOS = {
    'Arsenal': 'https://resources.premierleague.com/premierleague/badges/t3.png',
    'Barcelona': 'https://logos-world.net/wp-content/uploads/2020/06/Barcelona-Logo.png',
    'Bayern Munich': 'https://logoeps.com/wp-content/uploads/2014/03/bayern-munich-vector-logo.png',
    'Borussia Dortmund': 'https://logoeps.com/wp-content/uploads/2013/03/borussia-dortmund-vector-logo.png',
    'Chelsea': 'https://resources.premierleague.com/premierleague/badges/t8.png',
    'Juventus': 'https://logoeps.com/wp-content/uploads/2013/03/juventus-vector-logo.png',
    'Liverpool': 'https://resources.premierleague.com/premierleague/badges/t14.png',
    'Manchester United': 'https://resources.premierleague.com/premierleague/badges/t1.png',
    'Real Madrid': 'https://logoeps.com/wp-content/uploads/2013/03/real-madrid-vector-logo.png',
    'AC Milan': 'https://logoeps.com/wp-content/uploads/2013/03/ac-milan-vector-logo.png'
  };

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
   * Fix all team logos with manual URLs
   */
  async fixAllLogos() {
    console.log('🔧 Fixing team logos with manual URLs...\n');
    
    let fixed = 0;
    
    for (const [teamName, logoUrl] of Object.entries(this.TEAM_LOGOS)) {
      console.log(`🔄 Processing: ${teamName}`);
      console.log(`   🖼️  Logo: ${logoUrl}`);
      
      const updated = await this.updateTeamLogo(teamName, logoUrl);
      if (updated) fixed++;
    }
    
    console.log(`\n🎉 Fixed ${fixed}/${Object.keys(this.TEAM_LOGOS).length} team logos!`);
    
    // Show results
    await this.showResults();
  }

  /**
   * Show final results
   */
  async showResults() {
    console.log('\n📊 Final Results:');
    
    // Check all teams
    const { data: allTeams } = await supabase
      .from('teams')
      .select('name, logo_url, country');
    
    console.log('\n🌍 All Teams Status:');
    allTeams?.forEach(team => {
      const status = team.logo_url?.startsWith('https://') ? '✅' : '❌';
      console.log(`   ${status} ${team.name} (${team.country})`);
    });
    
    const working = allTeams?.filter(t => t.logo_url?.startsWith('https://'))?.length || 0;
    const broken = allTeams?.filter(t => t.logo_url?.startsWith('/logos/'))?.length || 0;
    
    console.log(`\n📊 Summary:`);
    console.log(`   ✅ Working logos: ${working}`);
    console.log(`   ❌ Broken logos: ${broken}`);
    console.log(`   📊 Total teams: ${allTeams?.length || 0}`);
  }
}

async function main() {
  const fixer = new ManualLogoFixer();
  
  try {
    await fixer.fixAllLogos();
  } catch (error) {
    console.error('❌ Script failed:', error);
  }
}

main();