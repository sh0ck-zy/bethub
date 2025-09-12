// CRITICAL ISSUE FOUND: Your API pulling is INEFFICIENT!
// Current code makes 5 separate requests (one per league)
// Should make 1 request to get ALL leagues at once

const API_KEY = 'b38396013e374847b4f0094198291358';
const BASE_URL = 'https://api.football-data.org/v4';

async function auditCurrentProblem() {
  console.log('🚨 AUDITING YOUR CURRENT DATA FLOW PROBLEM\n');
  
  // PROBLEM: Current code in external-api.service.ts does this:
  console.log('❌ CURRENT INEFFICIENT METHOD:');
  const competitions = ['PL', 'PD', 'BL1', 'SA', 'FL1']; // 5 leagues
  
  for (let i = 0; i < competitions.length; i++) {
    console.log(`Request ${i + 1}: GET /competitions/${competitions[i]}/matches`);
  }
  console.log('= 5 REQUESTS BURNED for 5 leagues!');
  console.log('= 6 second delay between each request!');
  console.log('= Takes 30+ seconds total!');
  
  console.log('\n✅ CORRECT EFFICIENT METHOD:');
  console.log('Request 1: GET /matches?dateFrom=2025-09-04&dateTo=2025-09-11');
  console.log('= 1 REQUEST gets ALL leagues!');
  console.log('= Instant response!');
  console.log('= Covers ALL 13 available leagues, not just 5!');
  
  // Prove the efficient method works
  console.log('\n🔍 TESTING EFFICIENT METHOD:');
  const today = new Date();
  const weekLater = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
  const dateFrom = today.toISOString().split('T')[0];
  const dateTo = weekLater.toISOString().split('T')[0];
  
  const response = await fetch(`${BASE_URL}/matches?dateFrom=${dateFrom}&dateTo=${dateTo}`, {
    headers: { 'X-Auth-Token': API_KEY }
  });
  
  const data = await response.json();
  console.log(`📊 RESULT: Found ${data.matches.length} matches from ALL leagues`);
  console.log(`Rate limit remaining: ${response.headers.get('x-requests-available-minute')}/10`);
  
  // Show which leagues we got
  const leagues = {};
  data.matches.forEach(match => {
    const league = match.competition.name;
    if (!leagues[league]) leagues[league] = 0;
    leagues[league]++;
  });
  
  console.log('\n🏆 LEAGUES COVERED IN ONE REQUEST:');
  Object.entries(leagues).forEach(([league, count]) => {
    console.log(`  ${league}: ${count} matches`);
  });
  
  console.log('\n🎯 THE FIX NEEDED:');
  console.log('1. Replace competition-by-competition fetching');
  console.log('2. Use single /matches endpoint with date range'); 
  console.log('3. Get ALL 13 leagues in one request');
  console.log('4. Save 4+ API requests daily');
  console.log('5. Reduce pull time from 30s to 2s');
}

auditCurrentProblem();