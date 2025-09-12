// DEMO: What is a Football API Request?
// This shows exactly what happens when you make a request

const API_KEY = 'b38396013e374847b4f0094198291358';
const BASE_URL = 'https://api.football-data.org/v4';

async function demoSingleRequest() {
  console.log('🔍 DEMO: What is a single API request?\n');
  
  // 1. THIS IS ONE REQUEST - Getting today's matches
  console.log('📤 Making REQUEST #1: Get today\'s matches');
  console.log('URL:', `${BASE_URL}/matches?dateFrom=2025-09-04&dateTo=2025-09-04`);
  console.log('Headers:', { 'X-Auth-Token': API_KEY.substring(0, 8) + '...' });
  
  const response = await fetch(`${BASE_URL}/matches?dateFrom=2025-09-04&dateTo=2025-09-04`, {
    headers: { 'X-Auth-Token': API_KEY }
  });
  
  console.log('\n📥 RESPONSE received:');
  console.log('Status:', response.status, response.statusText);
  console.log('Rate limit remaining:', response.headers.get('x-requests-available-minute'));
  
  const data = await response.json();
  console.log('Matches found:', data.matches.length);
  
  if (data.matches.length > 0) {
    console.log('\n📋 What we get in ONE request:');
    const match = data.matches[0];
    console.log('✅ Match ID:', match.id);
    console.log('✅ Teams:', match.homeTeam.name, 'vs', match.awayTeam.name);
    console.log('✅ League:', match.competition.name);
    console.log('✅ Date:', match.utcDate);
    console.log('✅ Status:', match.status);
    console.log('✅ Venue:', match.venue || 'N/A');
    console.log('✅ Score:', match.score?.fullTime?.home || 'N/A', '-', match.score?.fullTime?.away || 'N/A');
    
    console.log('\n❌ What we DON\'T get:');
    console.log('❌ Betting odds (not available in free tier)');
    console.log('❌ Detailed player stats (not available in free tier)');
    console.log('❌ Team logos (need separate team request)');
  }
  
  return data.matches.length;
}

async function demoMultipleRequests() {
  console.log('\n\n🔄 DEMO: When do we need MULTIPLE requests?');
  
  // REQUEST #2 - Get team details (if we had matches)
  console.log('\n📤 Making REQUEST #2: Get Premier League teams');
  const teamsResponse = await fetch(`${BASE_URL}/competitions/PL/teams`, {
    headers: { 'X-Auth-Token': API_KEY }
  });
  
  const teamsData = await teamsResponse.json();
  console.log('📥 Teams found:', teamsData.teams.length);
  console.log('Rate limit remaining:', teamsResponse.headers.get('x-requests-available-minute'));
  
  if (teamsData.teams.length > 0) {
    const team = teamsData.teams[0];
    console.log('\n📋 Additional data from REQUEST #2:');
    console.log('✅ Team logo:', team.crest);
    console.log('✅ Founded:', team.founded);
    console.log('✅ Venue:', team.venue);
    console.log('✅ Short name:', team.shortName);
  }
  
  // REQUEST #3 - Get competition details
  console.log('\n📤 Making REQUEST #3: Get Premier League info');
  const compResponse = await fetch(`${BASE_URL}/competitions/PL`, {
    headers: { 'X-Auth-Token': API_KEY }
  });
  
  const compData = await compResponse.json();
  console.log('📥 Competition data received');
  console.log('Rate limit remaining:', compResponse.headers.get('x-requests-available-minute'));
  
  console.log('\n📋 Additional data from REQUEST #3:');
  console.log('✅ League logo:', compData.emblem);
  console.log('✅ Season:', compData.currentSeason?.startDate, 'to', compData.currentSeason?.endDate);
  console.log('✅ Country:', compData.area.name);
}

async function demoRateLimitStrategy() {
  console.log('\n\n⚡ DEMO: Rate Limit Management Strategy');
  
  console.log('\n🚦 Current situation:');
  console.log('• Free tier: 10 requests per minute, 10 per day');
  console.log('• We\'ve made 3 requests in this demo');
  
  console.log('\n💡 Smart strategies:');
  console.log('1. BATCH requests - Get multiple days of matches in one call');
  console.log('2. CACHE responses - Store results in database');
  console.log('3. PRIORITIZE - Get essential data first');
  console.log('4. SCHEDULE - Spread requests throughout the day');
  
  console.log('\n📊 Example batching strategy:');
  console.log('Instead of:');
  console.log('  • Request 1: Get today matches (1 request)');
  console.log('  • Request 2: Get tomorrow matches (1 request)');
  console.log('  • Request 3: Get day after matches (1 request)');
  console.log('Do this:');
  console.log('  • Request 1: Get 7 days of matches (1 request saves 6!)');
  
  // Show the efficient way
  console.log('\n📤 Making EFFICIENT REQUEST: Get 7 days of matches');
  const today = new Date();
  const weekLater = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
  
  const dateFrom = today.toISOString().split('T')[0];
  const dateTo = weekLater.toISOString().split('T')[0];
  
  const weekResponse = await fetch(`${BASE_URL}/matches?dateFrom=${dateFrom}&dateTo=${dateTo}`, {
    headers: { 'X-Auth-Token': API_KEY }
  });
  
  const weekData = await weekResponse.json();
  console.log('📥 Got', weekData.matches.length, 'matches for entire week in ONE request!');
  console.log('Rate limit remaining:', weekResponse.headers.get('x-requests-available-minute'));
}

// Run the demo
async function runDemo() {
  try {
    const matchCount = await demoSingleRequest();
    
    if (matchCount === 0) {
      console.log('\n🏈 No matches today, but let me show you what the data looks like...');
    }
    
    await demoMultipleRequests();
    await demoRateLimitStrategy();
    
    console.log('\n🎯 SUMMARY:');
    console.log('• ONE request = ONE API call that counts against your limit');
    console.log('• You can get a lot of data in one request if you plan well');
    console.log('• Multiple requests are needed for different data types');
    console.log('• Always batch requests to save your daily limit');
    
  } catch (error) {
    console.error('Demo failed:', error.message);
  }
}

runDemo();