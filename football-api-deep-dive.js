// DEEP DIVE: Football-Data.org API Analysis
// Shows exactly what data you get and how comprehensive it is

const API_KEY = 'b38396013e374847b4f0094198291358';
const BASE_URL = 'https://api.football-data.org/v4';

async function analyzeAPIDepth() {
  console.log('🏈 FOOTBALL-DATA.ORG API DEEP DIVE\n');
  
  try {
    // 1. TEST: Can we get ALL leagues in ONE request?
    console.log('🌍 TEST #1: Getting ALL available competitions...');
    const competitionsResponse = await fetch(`${BASE_URL}/competitions`, {
      headers: { 'X-Auth-Token': API_KEY }
    });
    
    const competitionsData = await competitionsResponse.json();
    console.log(`📊 RESULT: ${competitionsData.competitions.length} competitions available`);
    console.log(`Rate limit remaining: ${competitionsResponse.headers.get('x-requests-available-minute')}/10`);
    
    // Show what competitions are available
    console.log('\n🏆 Available Leagues:');
    competitionsData.competitions.forEach(comp => {
      console.log(`  ${comp.name} (${comp.code}) - ${comp.area.name} [${comp.type}]`);
    });
    
    // 2. TEST: Get matches for ALL major leagues in ONE request
    console.log('\n\n⚡ TEST #2: Getting matches for ALL leagues in ONE request...');
    const today = new Date();
    const weekLater = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    const dateFrom = today.toISOString().split('T')[0];
    const dateTo = weekLater.toISOString().split('T')[0];
    
    const matchesResponse = await fetch(`${BASE_URL}/matches?dateFrom=${dateFrom}&dateTo=${dateTo}`, {
      headers: { 'X-Auth-Token': API_KEY }
    });
    
    const matchesData = await matchesResponse.json();
    console.log(`📊 RESULT: ${matchesData.matches.length} matches found for 7 days`);
    console.log(`Rate limit remaining: ${matchesResponse.headers.get('x-requests-available-minute')}/10`);
    
    // Analyze the data depth
    if (matchesData.matches.length > 0) {
      const sampleMatch = matchesData.matches[0];
      
      console.log('\n📋 DATA DEPTH ANALYSIS - What you get in each match:');
      console.log('✅ BASIC INFO:');
      console.log(`  • Match ID: ${sampleMatch.id}`);
      console.log(`  • Teams: ${sampleMatch.homeTeam.name} vs ${sampleMatch.awayTeam.name}`);
      console.log(`  • League: ${sampleMatch.competition.name} (${sampleMatch.competition.code})`);
      console.log(`  • Date/Time: ${sampleMatch.utcDate}`);
      console.log(`  • Status: ${sampleMatch.status}`);
      console.log(`  • Venue: ${sampleMatch.venue || 'N/A'}`);
      
      console.log('\n✅ TEAM DETAILS:');
      console.log(`  • Home Team Short: ${sampleMatch.homeTeam.shortName || 'N/A'}`);
      console.log(`  • Away Team Short: ${sampleMatch.awayTeam.shortName || 'N/A'}`);
      console.log(`  • Home Team TLA: ${sampleMatch.homeTeam.tla || 'N/A'}`);
      console.log(`  • Away Team TLA: ${sampleMatch.awayTeam.tla || 'N/A'}`);
      
      console.log('\n✅ SCORE INFO:');
      console.log(`  • Full Time: ${sampleMatch.score?.fullTime?.home || 'N/A'} - ${sampleMatch.score?.fullTime?.away || 'N/A'}`);
      console.log(`  • Half Time: ${sampleMatch.score?.halfTime?.home || 'N/A'} - ${sampleMatch.score?.halfTime?.away || 'N/A'}`);
      console.log(`  • Current Minute: ${sampleMatch.minute || 'N/A'}`);
      
      console.log('\n✅ COMPETITION DETAILS:');
      console.log(`  • Competition Type: ${sampleMatch.competition.type}`);
      console.log(`  • Competition Emblem: ${sampleMatch.competition.emblem || 'N/A'}`);
      
      console.log('\n✅ OFFICIALS:');
      if (sampleMatch.referees && sampleMatch.referees.length > 0) {
        sampleMatch.referees.forEach(ref => {
          console.log(`  • ${ref.name} (${ref.type || 'Referee'})`);
        });
      } else {
        console.log('  • No referee info available');
      }
      
      console.log('\n❌ WHAT YOU DON\'T GET (Free Tier Limitations):');
      console.log('  • Team logos (need separate team request)');
      console.log('  • Betting odds (not available at all)');
      console.log('  • Player lineups (premium feature)');
      console.log('  • Detailed match statistics (premium feature)');
      console.log('  • Live commentary (not available)');
    }
    
    // 3. Analyze league coverage
    console.log('\n\n🌍 LEAGUE COVERAGE ANALYSIS:');
    const leagueStats = {};
    matchesData.matches.forEach(match => {
      const league = match.competition.name;
      if (!leagueStats[league]) {
        leagueStats[league] = { count: 0, code: match.competition.code };
      }
      leagueStats[league].count++;
    });
    
    console.log('Matches per league in your 7-day window:');
    Object.entries(leagueStats).forEach(([league, stats]) => {
      console.log(`  ${league} (${stats.code}): ${stats.count} matches`);
    });
    
    // 4. Test getting detailed team info
    if (matchesData.matches.length > 0) {
      console.log('\n\n🔍 TEST #3: Getting detailed team info...');
      const firstMatch = matchesData.matches[0];
      
      // Get Premier League teams (this gives us team logos and details)
      const teamsResponse = await fetch(`${BASE_URL}/competitions/PL/teams`, {
        headers: { 'X-Auth-Token': API_KEY }
      });
      
      const teamsData = await teamsResponse.json();
      console.log(`📊 RESULT: ${teamsData.teams.length} Premier League teams with full details`);
      console.log(`Rate limit remaining: ${teamsResponse.headers.get('x-requests-available-minute')}/10`);
      
      const sampleTeam = teamsData.teams[0];
      console.log('\n📋 TEAM DATA DEPTH:');
      console.log(`✅ Team: ${sampleTeam.name}`);
      console.log(`✅ Short Name: ${sampleTeam.shortName}`);
      console.log(`✅ TLA: ${sampleTeam.tla}`);
      console.log(`✅ Logo/Crest: ${sampleTeam.crest}`);
      console.log(`✅ Founded: ${sampleTeam.founded}`);
      console.log(`✅ Venue: ${sampleTeam.venue}`);
      console.log(`✅ Country: ${sampleTeam.area.name}`);
      console.log(`✅ Website: ${sampleTeam.website || 'N/A'}`);
      console.log(`✅ Colors: ${sampleTeam.clubColors || 'N/A'}`);
    }
    
    console.log('\n\n🎯 SUMMARY - Your Data Strategy:');
    console.log('1. ONE request gets you 7 days of matches across ALL leagues');
    console.log('2. ONE request per league gets you full team details + logos');
    console.log('3. With 10 daily requests, you can cover:');
    console.log('   • 7 days of matches (1 request)');
    console.log('   • 9 major leagues team data (9 requests)');
    console.log('   • Total: Rich data for entire week + team details');
    
  } catch (error) {
    console.error('❌ Analysis failed:', error.message);
  }
}

// Run the analysis
analyzeAPIDepth();