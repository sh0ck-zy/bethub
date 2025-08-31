// Test Football-Data.org API
// This script tests if our API key works and shows available data

const API_KEY = 'b38396013e374847b4f0094198291358';
const BASE_URL = 'https://api.football-data.org/v4';

async function testAPI() {
  console.log('🏈 Testing Football-Data.org API...');
  console.log('API Key:', API_KEY.substring(0, 8) + '...');
  
  try {
    // Test 1: Get today's matches
    console.log('\n📅 Testing today\'s matches...');
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    const matchesResponse = await fetch(`${BASE_URL}/matches?dateFrom=${today}&dateTo=${tomorrow}`, {
      headers: { 'X-Auth-Token': API_KEY }
    });
    
    if (!matchesResponse.ok) {
      throw new Error(`Matches API failed: ${matchesResponse.status} ${matchesResponse.statusText}`);
    }
    
    const matchesData = await matchesResponse.json();
    console.log(`✅ Found ${matchesData.matches.length} matches for ${today}`);
    
    if (matchesData.matches.length > 0) {
      console.log('📋 Sample matches:');
      matchesData.matches.slice(0, 3).forEach(match => {
        console.log(`  ${match.homeTeam.name} vs ${match.awayTeam.name} (${match.competition.name})`);
      });
    } else {
      console.log('❌ No matches found for today. This might be normal if it\'s off-season.');
    }
    
    // Test 2: Get available competitions
    console.log('\n🏆 Testing competitions...');
    const competitionsResponse = await fetch(`${BASE_URL}/competitions`, {
      headers: { 'X-Auth-Token': API_KEY }
    });
    
    if (!competitionsResponse.ok) {
      throw new Error(`Competitions API failed: ${competitionsResponse.status}`);
    }
    
    const competitionsData = await competitionsResponse.json();
    console.log(`✅ Found ${competitionsData.competitions.length} competitions`);
    
    console.log('📋 Available competitions:');
    competitionsData.competitions.slice(0, 10).forEach(comp => {
      console.log(`  ${comp.name} (${comp.code}) - ${comp.area.name}`);
    });
    
    // Test 3: Check rate limits
    console.log('\n⏱️ Rate limit info:');
    console.log('Headers:', matchesResponse.headers.get('x-requestcounter-reset'));
    console.log('Remaining requests:', matchesResponse.headers.get('x-requests-available-minute'));
    
    console.log('\n🎉 Football-Data API is working correctly!');
    console.log('💡 Free tier limits: 10 requests per minute, 10 per day');
    
  } catch (error) {
    console.error('❌ API test failed:', error.message);
    
    if (error.message.includes('429')) {
      console.log('🚫 Rate limit exceeded. Wait a few minutes and try again.');
    } else if (error.message.includes('403')) {
      console.log('🔑 API key issue. Check if key is valid at https://www.football-data.org');
    }
  }
}

// Run the test
testAPI();