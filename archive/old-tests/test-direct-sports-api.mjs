// Direct test of SportsAPIProvider
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function testDirectSportsAPI() {
  console.log('🧪 Testing SportsAPIProvider directly...');
  
  try {
    // Simulate the SportsAPIProvider logic directly
    const today = new Date().toISOString().split('T')[0];
    console.log(`📅 Testing for date: ${today}`);
    
    // Test Sports DB directly (free API)
    console.log('\n📡 Testing The Sports DB...');
    const sportsDBResponse = await fetch(`https://www.thesportsdb.com/api/v1/json/3/eventsday.php?d=${today}&s=Soccer`);
    
    if (!sportsDBResponse.ok) {
      throw new Error(`Sports DB failed: ${sportsDBResponse.status}`);
    }
    
    const sportsDBData = await sportsDBResponse.json();
    console.log(`✅ Sports DB: Found ${sportsDBData.events?.length || 0} matches`);
    
    if (sportsDBData.events && sportsDBData.events.length > 0) {
      console.log('⚽ Matches from Sports DB:');
      sportsDBData.events.slice(0, 3).forEach((match, i) => {
        console.log(`  ${i + 1}. ${match.strHomeTeam} vs ${match.strAwayTeam}`);
        console.log(`     🏆 ${match.strLeague}`);
        console.log(`     📊 Status: ${match.strStatus}`);
        console.log(`     ⚽ Score: ${match.intHomeScore || '?'}-${match.intAwayScore || '?'}`);
        console.log('');
      });
      
      // Transform one match to our format
      const sampleMatch = sportsDBData.events[0];
      const transformedMatch = {
        id: `sdb_${sampleMatch.idEvent}`,
        league: sampleMatch.strLeague,
        home_team: sampleMatch.strHomeTeam,
        away_team: sampleMatch.strAwayTeam,
        kickoff_utc: `${sampleMatch.dateEvent}T${sampleMatch.strTime || '00:00:00'}Z`,
        status: sampleMatch.strStatus === 'Match Finished' ? 'FT' : 'PRE',
        home_score: sampleMatch.intHomeScore ? parseInt(sampleMatch.intHomeScore) : undefined,
        away_score: sampleMatch.intAwayScore ? parseInt(sampleMatch.intAwayScore) : undefined,
        venue: sampleMatch.strVenue,
      };
      
      console.log('🔄 Transformed match format:');
      console.log(JSON.stringify(transformedMatch, null, 2));
    }
    
    // Test API-Sports if key is available
    if (process.env.RAPIDAPI_KEY || process.env.API_SPORTS_KEY) {
      console.log('\n📡 Testing API-Sports...');
      const apiKey = process.env.RAPIDAPI_KEY || process.env.API_SPORTS_KEY;
      
      const apiSportsResponse = await fetch(`https://api-football-v1.p.rapidapi.com/v3/fixtures?date=${today}`, {
        headers: {
          'X-RapidAPI-Key': apiKey,
          'X-RapidAPI-Host': 'api-football-v1.p.rapidapi.com',
        },
      });
      
      if (apiSportsResponse.ok) {
        const apiSportsData = await apiSportsResponse.json();
        console.log(`✅ API-Sports: Found ${apiSportsData.response?.length || 0} matches`);
      } else {
        console.log(`⚠️ API-Sports: ${apiSportsResponse.status} ${apiSportsResponse.statusText}`);
      }
    } else {
      console.log('⚠️ API-Sports: No RapidAPI key found (optional)');
    }

  } catch (error) {
    console.error('❌ Direct test failed:', error.message);
  }
}

testDirectSportsAPI().catch(console.error); 