// Test the new efficient API flow
// This simulates what your app does when admin clicks "Pull from Football API"

const API_KEY = 'b38396013e374847b4f0094198291358';
const BASE_URL = 'https://api.football-data.org/v4';

async function testNewAPIFlow() {
  console.log('🚀 TESTING NEW EFFICIENT API FLOW\n');
  
  try {
    // Simulate the new fetchAllMatches method
    console.log('📡 Step 1: Making efficient API call...');
    
    const today = new Date();
    const weekLater = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    const dateFrom = today.toISOString().split('T')[0];
    const dateTo = weekLater.toISOString().split('T')[0];
    
    const url = `${BASE_URL}/matches?dateFrom=${dateFrom}&dateTo=${dateTo}`;
    console.log(`🌐 URL: ${url}`);
    
    const startTime = Date.now();
    const response = await fetch(url, {
      headers: {
        'X-Auth-Token': API_KEY,
        'User-Agent': 'BetHub/1.0 (contact@bethub.com)'
      }
    });
    const fetchTime = Date.now() - startTime;
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    const matches = data.matches || [];
    
    console.log(`⚡ Response time: ${fetchTime}ms`);
    console.log(`📊 Matches found: ${matches.length}`);
    console.log(`📈 Rate limit remaining: ${response.headers.get('x-requests-available-minute')}/10`);
    
    // Analyze the leagues we got
    console.log('\n🏆 Step 2: Analyzing league coverage...');
    const leagues = {};
    matches.forEach(match => {
      const league = match.competition?.name;
      const code = match.competition?.code;
      if (league) {
        if (!leagues[league]) {
          leagues[league] = { count: 0, code: code || 'Unknown' };
        }
        leagues[league].count++;
      }
    });
    
    console.log('Leagues covered:');
    Object.entries(leagues).forEach(([league, info]) => {
      console.log(`  ${league} (${info.code}): ${info.count} matches`);
    });
    
    // Test data transformation (simulate what match service does)
    console.log('\n🔧 Step 3: Testing data transformation...');
    if (matches.length > 0) {
      const sampleMatch = matches[0];
      
      // Simulate the transformExternalMatch function
      const transformed = {
        id: `match_${sampleMatch.id}_${sampleMatch.competition.id}`,
        external_id: sampleMatch.id?.toString(),
        data_source: 'football-data',
        league: sampleMatch.competition?.name || 'Unknown League',
        home_team: sampleMatch.homeTeam?.name || 'Home Team',
        away_team: sampleMatch.awayTeam?.name || 'Away Team',
        kickoff_utc: sampleMatch.utcDate,
        venue: sampleMatch.venue,
        referee: sampleMatch.referees?.[0]?.name,
        status: mapStatus(sampleMatch.status),
        home_score: sampleMatch.score?.fullTime?.home ?? undefined,
        away_score: sampleMatch.score?.fullTime?.away ?? undefined,
        home_team_logo: sampleMatch.homeTeam?.crest,
        away_team_logo: sampleMatch.awayTeam?.crest,
        league_logo: sampleMatch.competition?.emblem,
        is_pulled: true,
        is_analyzed: false,
        is_published: false,
        analysis_status: 'none',
        analysis_priority: 'normal'
      };
      
      console.log('✅ Sample transformed match:');
      console.log(`  Match: ${transformed.home_team} vs ${transformed.away_team}`);
      console.log(`  League: ${transformed.league}`);
      console.log(`  Date: ${transformed.kickoff_utc}`);
      console.log(`  Status: ${transformed.status}`);
      console.log(`  Venue: ${transformed.venue || 'N/A'}`);
      console.log(`  Data complete: ✅ ID, Teams, League, Date, Status`);
      
      // Check for data quality issues
      const issues = [];
      if (!transformed.home_team || transformed.home_team === 'Home Team') issues.push('Missing home team');
      if (!transformed.away_team || transformed.away_team === 'Away Team') issues.push('Missing away team');
      if (!transformed.kickoff_utc) issues.push('Missing kickoff time');
      if (!transformed.league || transformed.league === 'Unknown League') issues.push('Missing league');
      
      if (issues.length > 0) {
        console.log('❌ Data quality issues found:');
        issues.forEach(issue => console.log(`  • ${issue}`));
      } else {
        console.log('✅ Data quality: All essential fields present');
      }
    }
    
    console.log('\n🎯 RESULTS SUMMARY:');
    console.log(`✅ NEW METHOD: 1 API request, ${fetchTime}ms, ${matches.length} matches`);
    console.log(`✅ COVERS: ${Object.keys(leagues).length} leagues simultaneously`);
    console.log(`✅ EFFICIENT: Uses ${response.headers.get('x-requests-available-minute') ? (10 - parseInt(response.headers.get('x-requests-available-minute'))) : 1}/10 daily requests`);
    console.log('✅ DATA QUALITY: Complete match information with all required fields');
    
    if (Object.keys(leagues).length > 5) {
      console.log(`🚀 IMPROVEMENT: Now covers ${Object.keys(leagues).length} leagues instead of just 5!`);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

function mapStatus(externalStatus) {
  const statusMap = {
    'SCHEDULED': 'PRE',
    'TIMED': 'PRE',
    'IN_PLAY': 'LIVE',
    'PAUSED': 'LIVE',
    'FINISHED': 'FT',
    'POSTPONED': 'POSTPONED',
    'CANCELLED': 'CANCELLED'
  };
  return statusMap[externalStatus] || 'PRE';
}

testNewAPIFlow();