// Test script to check catalog data in database
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testCatalogData() {
  console.log('🔍 Testing catalog data...\n');

  try {
    // Test leagues
    console.log('📊 Checking leagues...');
    const { data: leagues, error: leaguesError } = await supabase
      .from('leagues')
      .select('*')
      .limit(5);

    if (leaguesError) {
      console.error('❌ Error fetching leagues:', leaguesError);
    } else {
      console.log(`✅ Found ${leagues?.length || 0} leagues:`);
      leagues?.forEach(league => {
        console.log(`   - ${league.name} (${league.country})`);
      });
    }

    // Test teams
    console.log('\n⚽ Checking teams...');
    const { data: teams, error: teamsError } = await supabase
      .from('teams')
      .select('*')
      .limit(10);

    if (teamsError) {
      console.error('❌ Error fetching teams:', teamsError);
    } else {
      console.log(`✅ Found ${teams?.length || 0} teams:`);
      teams?.forEach(team => {
        console.log(`   - ${team.name} (${team.league || 'No league'})`);
      });
    }

    // Test unique leagues from teams
    console.log('\n🏆 Unique leagues from teams...');
    const { data: uniqueLeagues, error: uniqueLeaguesError } = await supabase
      .from('teams')
      .select('league')
      .not('league', 'is', null);

    if (uniqueLeaguesError) {
      console.error('❌ Error fetching unique leagues:', uniqueLeaguesError);
    } else {
      const leagues = [...new Set(uniqueLeagues?.map(t => t.league).filter(Boolean))];
      console.log(`✅ Found ${leagues.length} unique leagues in teams table:`);
      leagues.forEach(league => {
        console.log(`   - ${league}`);
      });
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

testCatalogData();
