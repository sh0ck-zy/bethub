import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Only teams that actually have SVG files in /public/logos/
const ACTUAL_LOGOS = {
  'Manchester United': '/logos/manchester-united.svg',
  'Liverpool': '/logos/liverpool.svg',
  'Arsenal': '/logos/arsenal.svg',
  'Chelsea': '/logos/chelsea.svg',
  'Real Madrid': '/logos/real-madrid.svg',
  'Barcelona': '/logos/barcelona.svg',
  'Bayern Munich': '/logos/bayern-munich.svg',
  'Borussia Dortmund': '/logos/borussia-dortmund.svg',
  'Juventus': '/logos/juventus.svg',
  'AC Milan': '/logos/ac-milan.svg'
};

async function fixLogos() {
  console.log('🔧 Fixing team logos to match actual files...');
  
  try {
    // Update teams that have actual logo files
    for (const [teamName, logoPath] of Object.entries(ACTUAL_LOGOS)) {
      const { error } = await supabase
        .from('teams')
        .update({ logo_url: logoPath })
        .eq('name', teamName);
      
      if (error) {
        console.error(`❌ Failed to update ${teamName}:`, error);
      } else {
        console.log(`✅ Updated ${teamName}: ${logoPath}`);
      }
    }
    
    // Set other teams to null so they show colored initials
    const { error: nullError } = await supabase
      .from('teams')
      .update({ logo_url: null })
      .not('name', 'in', `(${Object.keys(ACTUAL_LOGOS).map(name => `'${name}'`).join(',')})`);
    
    if (nullError) {
      console.error('❌ Failed to null other teams:', nullError);
    } else {
      console.log('✅ Set other teams to use colored initials');
    }
    
    // Clear leagues since external URLs may not work
    const { error: leagueError } = await supabase
      .from('leagues')
      .update({ logo_url: null });
    
    if (leagueError) {
      console.error('❌ Failed to clear league logos:', leagueError);
    } else {
      console.log('✅ Cleared league logos (will use colored initials)');
    }
    
    console.log('\n🧪 Testing fixed logos:');
    const { data: teams } = await supabase
      .from('teams')
      .select('name, logo_url')
      .limit(5);
    
    teams?.forEach(team => {
      const status = team.logo_url ? '🖼️ ' : '🔤';
      console.log(`   ${status} ${team.name}: ${team.logo_url || 'Colored initials'}`);
    });
    
  } catch (error) {
    console.error('❌ Failed to fix logos:', error);
  }
}

fixLogos();