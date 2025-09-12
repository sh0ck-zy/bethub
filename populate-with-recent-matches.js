// Get recent finished matches to populate the database
// This will ensure we have data to show in the admin panel

const API_KEY = 'b38396013e374847b4f0094198291358';
const BASE_URL = 'https://api.football-data.org/v4';

async function populateWithRecentMatches() {
  console.log('🚀 POPULATING DATABASE WITH RECENT MATCHES\n');
  
  try {
    // Get last week's matches which should exist
    const today = new Date();
    const lastWeek = new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000);
    const dateFrom = lastWeek.toISOString().split('T')[0];
    const dateTo = today.toISOString().split('T')[0];
    
    console.log(`📅 Getting recent matches: ${dateFrom} to ${dateTo}`);
    
    // Start with Premier League which definitely has matches
    const competitions = ['PL', 'PD', 'BL1', 'SA', 'FL1'];
    let allMatches = [];
    
    for (const comp of competitions) {
      try {
        console.log(`🔍 Fetching ${comp}...`);
        
        const url = `${BASE_URL}/competitions/${comp}/matches?dateFrom=${dateFrom}&dateTo=${dateTo}`;
        const response = await fetch(url, {
          headers: {
            'X-Auth-Token': API_KEY,
            'User-Agent': 'BetHub/1.0 (contact@bethub.com)'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.matches && data.matches.length > 0) {
            console.log(`✅ ${comp}: Found ${data.matches.length} matches`);
            allMatches.push(...data.matches.slice(0, 5)); // Take 5 from each league
          } else {
            console.log(`📭 ${comp}: No matches found`);
          }
        } else {
          console.log(`⚠️ ${comp}: ${response.status} ${response.statusText}`);
        }
        
        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 7000));
        
        // Stop after we have enough matches
        if (allMatches.length >= 15) break;
        
      } catch (error) {
        console.log(`❌ Error with ${comp}: ${error.message}`);
      }
    }
    
    console.log(`\n📊 Total matches found: ${allMatches.length}`);
    
    if (allMatches.length === 0) {
      console.log('❌ No matches found. Football season might be off or API issues.');
      return;
    }
    
    // Show what we found
    console.log('\n📋 Found matches:');
    allMatches.slice(0, 5).forEach((match, i) => {
      console.log(`  ${i + 1}. ${match.homeTeam.name} vs ${match.awayTeam.name} (${match.competition.name})`);
      console.log(`     Date: ${new Date(match.utcDate).toLocaleDateString()}`);
      console.log(`     Status: ${match.status}`);
    });
    
    if (allMatches.length > 5) {
      console.log(`  ... and ${allMatches.length - 5} more matches`);
    }
    
    // Now insert them using your app's API endpoint
    console.log('\n💾 Inserting matches into database...');
    
    const transformAndInsert = async (match) => {
      const statusMap = {
        'SCHEDULED': 'PRE',
        'TIMED': 'PRE',
        'IN_PLAY': 'LIVE',
        'PAUSED': 'LIVE', 
        'FINISHED': 'FT',
        'POSTPONED': 'POSTPONED',
        'CANCELLED': 'CANCELLED'
      };
      
      const transformedMatch = {
        id: `match_${match.id}_${match.competition.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        external_id: match.id.toString(),
        data_source: 'football-data',
        league: match.competition.name,
        home_team: match.homeTeam.name,
        away_team: match.awayTeam.name,
        kickoff_utc: match.utcDate,
        venue: match.venue,
        referee: match.referees?.[0]?.name,
        status: statusMap[match.status] || 'PRE',
        home_score: match.score?.fullTime?.home,
        away_score: match.score?.fullTime?.away,
        current_minute: match.minute,
        // Include logo URLs
        home_team_logo: match.homeTeam.crest,
        away_team_logo: match.awayTeam.crest,
        league_logo: match.competition.emblem,
        // Workflow
        is_pulled: true,
        is_analyzed: false,
        is_published: true,
        analysis_status: 'none',
        analysis_priority: 'normal',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      try {
        const response = await fetch('http://localhost:3002/api/v1/admin/matches', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ match: transformedMatch })
        });
        
        if (response.ok) {
          const result = await response.json();
          console.log(`✅ ${transformedMatch.home_team} vs ${transformedMatch.away_team} - inserted successfully`);
          return true;
        } else {
          const errorData = await response.json();
          console.log(`❌ ${transformedMatch.home_team} vs ${transformedMatch.away_team} - ${errorData.error || 'failed'}`);
          return false;
        }
      } catch (error) {
        console.log(`❌ ${transformedMatch.home_team} vs ${transformedMatch.away_team} - ${error.message}`);
        return false;
      }
    };
    
    let successCount = 0;
    for (const match of allMatches) {
      const success = await transformAndInsert(match);
      if (success) successCount++;
      await new Promise(resolve => setTimeout(resolve, 200)); // Small delay
    }
    
    console.log(`\n🎉 POPULATION COMPLETE!`);
    console.log(`✅ Successfully inserted ${successCount}/${allMatches.length} matches`);
    console.log('✅ Database now has real match data with logos');
    console.log('✅ Admin panel should show matches organized by day');
    console.log('\n👀 Check your admin panel at http://localhost:3002/admin');
    
  } catch (error) {
    console.error('❌ Population error:', error.message);
  }
}

populateWithRecentMatches();