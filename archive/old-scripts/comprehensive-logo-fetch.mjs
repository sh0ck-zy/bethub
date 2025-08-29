import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Better team name mapping for SportsDB
const TEAM_SEARCH_NAMES = {
  'Manchester United': ['Manchester United'],
  'Liverpool': ['Liverpool'],
  'Arsenal': ['Arsenal'],
  'Chelsea': ['Chelsea'],
  'Real Madrid': ['Real Madrid'],
  'Barcelona': ['Barcelona'],
  'Bayern Munich': ['Bayern Munich'],
  'Borussia Dortmund': ['Borussia Dortmund'],
  'Juventus': ['Juventus'],
  'AC Milan': ['AC Milan'],
  'Botafogo FR': ['Botafogo'],
  'CR Flamengo': ['Flamengo'],
  'SE Palmeiras': ['Palmeiras'],
  'Santos FC': ['Santos'],
  'EC Vitória': ['Vitoria'],
  'Mirassol FC': ['Mirassol'],
  'CR Vasco da Gama': ['Vasco da Gama'],
  'EC Bahia': ['Bahia'],
  'EC Juventude': ['Juventude'],
  'SC Internacional': ['Internacional']
};

async function fetchTeamLogo(dbTeamName, searchNames) {
  console.log(`🔍 Fetching logo for: ${dbTeamName}`);
  
  for (const searchName of searchNames) {
    try {
      console.log(`   Trying: ${searchName}`);
      const response = await fetch(
        `https://www.thesportsdb.com/api/v1/json/123/searchteams.php?t=${encodeURIComponent(searchName)}`
      );
      
      const data = await response.json();
      
      if (data.teams && data.teams.length > 0) {
        const team = data.teams[0];
        const logoUrl = team.strBadge || team.strLogo;
        
        if (logoUrl) {
          console.log(`   ✅ Found logo: ${logoUrl}`);
          return logoUrl;
        }
      }
      
      // Small delay between searches
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error(`   ❌ Error searching ${searchName}:`, error.message);
    }
  }
  
  console.log(`   ⚠️  No logo found for ${dbTeamName}`);
  return null;
}

async function updateAllLogos() {
  console.log('🚀 Comprehensive logo update from TheSportsDB...');
  
  let updated = 0;
  let found = 0;
  let skipped = 0;
  
  for (const [dbTeamName, searchNames] of Object.entries(TEAM_SEARCH_NAMES)) {
    // Check if team already has local logo
    const { data: existingTeam } = await supabase
      .from('teams')
      .select('logo_url')
      .eq('name', dbTeamName)
      .single();
    
    if (existingTeam?.logo_url?.startsWith('/logos/')) {
      console.log(`⏩ ${dbTeamName} already has local logo`);
      skipped++;
      continue;
    }
    
    // Fetch logo from SportsDB
    const logoUrl = await fetchTeamLogo(dbTeamName, searchNames);
    
    if (logoUrl) {
      // Update database
      const { error } = await supabase
        .from('teams')
        .update({ logo_url: logoUrl })
        .eq('name', dbTeamName);
      
      if (error) {
        console.error(`   ❌ Failed to update ${dbTeamName}:`, error.message);
      } else {
        console.log(`   💾 Updated database for ${dbTeamName}`);
        updated++;
      }
      found++;
    }
    
    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log('');
  console.log('🎉 Update completed!');
  console.log(`   📊 Teams processed: ${Object.keys(TEAM_SEARCH_NAMES).length}`);
  console.log(`   ⏩ Skipped (local logos): ${skipped}`);
  console.log(`   🖼️  Logos found: ${found}`);
  console.log(`   💾 Database updated: ${updated}`);
  
  // Show final results
  console.log('');
  console.log('📋 Final team logo status:');
  const { data: teams } = await supabase
    .from('teams')
    .select('name, logo_url')
    .order('name');
  
  teams?.forEach(team => {
    const hasLogo = team.logo_url ? '✅' : '🔤';
    const source = team.logo_url?.startsWith('/logos/') ? 'LOCAL' : 
                  team.logo_url?.includes('thesportsdb') ? 'SPORTSDB' : 'INITIALS';
    console.log(`   ${hasLogo} ${team.name} (${source})`);
  });
}

updateAllLogos();