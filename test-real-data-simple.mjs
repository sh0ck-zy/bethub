async function testOpenFootballData() {
  console.log('🧪 Testing OpenFootball JSON Data...\n');
  
  const leagueUrls = [
    'https://raw.githubusercontent.com/openfootball/football.json/master/2024-25/en.1.json',
    'https://raw.githubusercontent.com/openfootball/football.json/master/2024-25/es.1.json',
    'https://raw.githubusercontent.com/openfootball/football.json/master/2024-25/it.1.json',
    'https://raw.githubusercontent.com/openfootball/football.json/master/2024-25/de.1.json',
    'https://raw.githubusercontent.com/openfootball/football.json/master/2024-25/europe-champions-league.json',
    'https://raw.githubusercontent.com/openfootball/football.json/master/2024-25/europe-europa-league.json'
  ];
  
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  let totalMatches = 0;
  let todayMatches = 0;
  
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
      
      if (data.matches) {
        totalMatches += data.matches.length;
        
        // Check for today's matches
        const todaysInLeague = data.matches.filter(match => {
          const matchDate = new Date(match.date);
          return matchDate >= today && matchDate < tomorrow;
        });
        
        if (todaysInLeague.length > 0) {
          todayMatches += todaysInLeague.length;
          console.log(`   📅 Today's matches: ${todaysInLeague.length}`);
          todaysInLeague.slice(0, 2).forEach(match => {
            console.log(`      • ${match.team1} vs ${match.team2} (${match.date})`);
          });
        }
      }
      
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }
    
    console.log('');
  }
  
  console.log('📊 Summary:');
  console.log(`   Total matches across all leagues: ${totalMatches}`);
  console.log(`   Matches today: ${todayMatches}`);
  console.log(`   Date: ${today.toDateString()}`);
}

testOpenFootballData(); 