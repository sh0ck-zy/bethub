import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Test what competitions are available in Football-Data.org
async function testAvailableCompetitions() {
  console.log('🧪 Testing Football-Data.org competitions...');
  console.log('🔑 API Key:', process.env.FOOTBALL_DATA_API_KEY ? 'Found ✅' : 'Missing ❌');
  
  if (!process.env.FOOTBALL_DATA_API_KEY) {
    console.error('❌ No API key found!');
    return;
  }

  try {
    // Get all available competitions
    console.log('🏆 Fetching all available competitions...');
    
    const response = await fetch('https://api.football-data.org/v4/competitions', {
      headers: {
        'X-Auth-Token': process.env.FOOTBALL_DATA_API_KEY,
      },
    });

    if (!response.ok) {
      console.error(`❌ API Error: ${response.status} ${response.statusText}`);
      return;
    }

    const data = await response.json();
    console.log(`🎯 Found ${data.competitions?.length || 0} competitions`);
    
    if (data.competitions && data.competitions.length > 0) {
      console.log('🏆 Available competitions:');
      data.competitions.forEach((comp, i) => {
        console.log(`  ${i + 1}. ${comp.name} (${comp.area.name})`);
        console.log(`     Code: ${comp.code}`);
        console.log(`     Type: ${comp.type}`);
        if (comp.currentSeason) {
          console.log(`     Season: ${comp.currentSeason.startDate} to ${comp.currentSeason.endDate}`);
        }
        console.log('');
      });
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Test matches for today's date
async function testTodaysMatches() {
  console.log('\n🔄 Testing matches for TODAY...');
  
  try {
    const today = new Date().toISOString().split('T')[0];
    console.log(`📅 Checking matches for ${today}...`);
    
    const response = await fetch(`https://api.football-data.org/v4/matches?dateFrom=${today}&dateTo=${today}`, {
      headers: {
        'X-Auth-Token': process.env.FOOTBALL_DATA_API_KEY,
      },
    });

    if (!response.ok) {
      console.error(`❌ API Error: ${response.status} ${response.statusText}`);
      return;
    }

    const data = await response.json();
    console.log(`🎯 Found ${data.matches?.length || 0} matches for today`);
    
    if (data.matches && data.matches.length > 0) {
      console.log('⚽ Today\'s matches:');
      data.matches.forEach((match, i) => {
        console.log(`  ${i + 1}. ${match.homeTeam.name} vs ${match.awayTeam.name}`);
        console.log(`     🏆 ${match.competition.name}`);
        console.log(`     ⏰ ${new Date(match.utcDate).toLocaleTimeString()}`);
        console.log(`     📊 Status: ${match.status}`);
        console.log('');
      });
    }

  } catch (error) {
    console.error('❌ Today\'s matches test failed:', error.message);
  }
}

async function runTests() {
  await testAvailableCompetitions();
  await testTodaysMatches();
}

runTests().catch(console.error); 