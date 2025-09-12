const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkLeagues() {
  try {
    const { data: matches } = await supabase.from('matches').select('league').not('league', 'is', null);
    const { data: leagues } = await supabase.from('leagues').select('name, logo_url');
    
    console.log('Leagues in matches:', [...new Set(matches?.map(m => m.league) || [])]);
    console.log('Leagues in database:', leagues?.map(l => ({ name: l.name, hasLogo: !!l.logo_url })) || []);
    
    // Check which leagues from matches don't have logos
    const leaguesInMatches = [...new Set(matches?.map(m => m.league) || [])];
    const leaguesWithLogos = leagues?.filter(l => l.logo_url) || [];
    const leaguesWithoutLogos = leaguesInMatches.filter(leagueName => 
      !leaguesWithLogos.some(l => l.name === leagueName)
    );
    
    console.log('Leagues missing logos:', leaguesWithoutLogos);
  } catch (error) {
    console.error('Error:', error);
  }
}

checkLeagues();
