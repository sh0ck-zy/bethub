// Test The Sports DB for today's matches
async function testSportsDB() {
  console.log('🧪 Testing The Sports DB (Free API)...');
  
  try {
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0]; // YYYY-MM-DD
    console.log(`📅 Checking matches for TODAY (${dateStr})...`);
    
    const response = await fetch(`https://www.thesportsdb.com/api/v1/json/3/eventsday.php?d=${dateStr}&s=Soccer`);
    
    if (!response.ok) {
      console.error(`❌ API Error: ${response.status} ${response.statusText}`);
      return;
    }

    const data = await response.json();
    console.log(`🎯 Found ${data.events?.length || 0} soccer matches for today`);
    
    if (data.events && data.events.length > 0) {
      console.log('⚽ Today\'s matches from Sports DB:');
      data.events.slice(0, 10).forEach((match, i) => {
        console.log(`  ${i + 1}. ${match.strHomeTeam} vs ${match.strAwayTeam}`);
        console.log(`     🏆 ${match.strLeague}`);
        console.log(`     ⏰ ${match.strTime || 'TBD'}`);
        console.log(`     📊 Status: ${match.strStatus}`);
        if (match.intHomeScore !== null && match.intAwayScore !== null) {
          console.log(`     ⚽ Score: ${match.intHomeScore}-${match.intAwayScore}`);
        }
        console.log('');
      });
    } else {
      console.log('📅 No matches found for today in Sports DB');
    }

    // Also test a few days ahead
    console.log('\n🔄 Checking next few days...');
    for (let i = 1; i <= 3; i++) {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + i);
      const futureDateStr = futureDate.toISOString().split('T')[0];
      
      try {
        const futureResponse = await fetch(`https://www.thesportsdb.com/api/v1/json/3/eventsday.php?d=${futureDateStr}&s=Soccer`);
        const futureData = await futureResponse.json();
        console.log(`📅 ${futureDateStr}: ${futureData.events?.length || 0} matches`);
      } catch (error) {
        console.log(`📅 ${futureDateStr}: Error checking`);
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testSportsDB().catch(console.error); 