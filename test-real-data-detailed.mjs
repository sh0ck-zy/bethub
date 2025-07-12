async function testRealDataDetailed() {
  console.log('🧪 Testing Real Data Service - Detailed Analysis...\n');
  
  const leagueUrls = [
    'https://raw.githubusercontent.com/openfootball/football.json/master/2024-25/en.1.json',
    'https://raw.githubusercontent.com/openfootball/football.json/master/2024-25/es.1.json'
  ];
  
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  console.log(`📅 Current date: ${today.toISOString()}`);
  console.log(`📅 Tomorrow: ${tomorrow.toISOString()}`);
  console.log('');
  
  for (const url of leagueUrls) {
    try {
      console.log(`📡 Fetching: ${url.split('/').pop()}`);
      const response = await fetch(url);
      
      if (!response.ok) {
        console.log(`❌ Failed: ${response.status} ${response.statusText}`);
        continue;
      }
      
      const data = await response.json();
      console.log(`✅ Success: ${data.name} - ${data.matches?.length || 0} matches`);
      
      if (data.matches && data.matches.length > 0) {
        // Show first few matches with dates
        console.log('\n📋 Sample matches:');
        data.matches.slice(0, 5).forEach((match, index) => {
          const matchDate = new Date(match.date);
          const isToday = matchDate >= today && matchDate < tomorrow;
          const isPast = matchDate < today;
          const isFuture = matchDate > tomorrow;
          
          console.log(`${index + 1}. ${match.team1} vs ${match.team2}`);
          console.log(`   Date: ${match.date} (${matchDate.toISOString()})`);
          console.log(`   Status: ${isPast ? 'PAST' : isToday ? 'TODAY' : isFuture ? 'FUTURE' : 'UNKNOWN'}`);
          console.log('');
        });
        
        // Check date range
        const allDates = data.matches.map(m => new Date(m.date)).sort((a, b) => a - b);
        console.log(`📊 Date range: ${allDates[0].toISOString()} to ${allDates[allDates.length - 1].toISOString()}`);
        
        // Check for matches in our target range
        const targetMatches = data.matches.filter(match => {
          const matchDate = new Date(match.date);
          return matchDate >= today && matchDate < tomorrow;
        });
        
        console.log(`🎯 Matches for today: ${targetMatches.length}`);
        
        // Check for future matches
        const futureMatches = data.matches.filter(match => {
          const matchDate = new Date(match.date);
          return matchDate > today;
        });
        
        console.log(`🔮 Future matches: ${futureMatches.length}`);
        
        if (futureMatches.length > 0) {
          console.log('\n📅 Next 5 future matches:');
          futureMatches.slice(0, 5).forEach((match, index) => {
            const matchDate = new Date(match.date);
            console.log(`${index + 1}. ${match.team1} vs ${match.team2} - ${matchDate.toISOString()}`);
          });
        }
      }
      
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }
    
    console.log('\n' + '='.repeat(50) + '\n');
  }
}

testRealDataDetailed(); 