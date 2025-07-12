import { RealDataService } from './src/lib/services/realDataService.ts';

async function testRealData() {
  console.log('🧪 Testing Real Data Service...\n');
  
  const realDataService = new RealDataService();
  
  try {
    // Test 1: Get today's matches
    console.log('📅 Fetching today\'s matches...');
    const todayMatches = await realDataService.getTodaysMatches();
    console.log(`✅ Found ${todayMatches.length} matches for today`);
    
    if (todayMatches.length > 0) {
      console.log('\n📋 Sample matches:');
      todayMatches.slice(0, 3).forEach((match, index) => {
        console.log(`${index + 1}. ${match.home_team} vs ${match.away_team} (${match.league})`);
        console.log(`   Time: ${new Date(match.kickoff_utc).toLocaleString()}`);
        console.log(`   Status: ${match.status}`);
        console.log('');
      });
    }
    
    // Test 2: Get upcoming matches
    console.log('🔮 Fetching upcoming matches (next 7 days)...');
    const upcomingMatches = await realDataService.getUpcomingMatches();
    console.log(`✅ Found ${upcomingMatches.length} upcoming matches`);
    
    // Test 3: Get matches for specific date range
    console.log('\n📊 Fetching matches for next 3 days...');
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 3);
    
    const rangeMatches = await realDataService.getMatchesForDateRange(startDate, endDate);
    console.log(`✅ Found ${rangeMatches.length} matches in date range`);
    
    // Group by league
    const leagueStats = {};
    rangeMatches.forEach(match => {
      leagueStats[match.league] = (leagueStats[match.league] || 0) + 1;
    });
    
    console.log('\n🏆 Matches by league:');
    Object.entries(leagueStats).forEach(([league, count]) => {
      console.log(`   ${league}: ${count} matches`);
    });
    
  } catch (error) {
    console.error('❌ Error testing real data service:', error);
  }
}

testRealData(); 