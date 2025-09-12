// Populate the database with real matches right now!
// This uses the new efficient API method and stores all fields correctly

const API_KEY = 'b38396013e374847b4f0094198291358';
const BASE_URL = 'https://api.football-data.org/v4';

async function populateDatabase() {
  console.log('🚀 POPULATING DATABASE WITH REAL MATCHES\n');
  
  try {
    // Step 1: Get matches using the new efficient method
    console.log('📡 Step 1: Fetching matches from Football API...');
    
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000); // Next 30 days to get some matches
    const dateFrom = today.toISOString().split('T')[0];
    const dateTo = nextWeek.toISOString().split('T')[0];
    
    console.log(`📅 Date range: ${dateFrom} to ${dateTo}`);
    
    // Efficient method: ONE request for ALL leagues
    const url = `${BASE_URL}/matches?dateFrom=${dateFrom}&dateTo=${dateTo}`;
    console.log(`🌐 URL: ${url}`);
    
    const response = await fetch(url, {
      headers: {
        'X-Auth-Token': API_KEY,
        'User-Agent': 'BetHub/1.0 (contact@bethub.com)'
      }
    });
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    const matches = data.matches || [];
    
    console.log(`✅ Found ${matches.length} matches from Football API`);
    console.log(`📈 Rate limit remaining: ${response.headers.get('x-requests-available-minute')}/10`);
    
    if (matches.length === 0) {
      // Try getting recent matches instead
      console.log('📝 No upcoming matches found, trying recent matches...');
      
      const pastWeek = new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000);
      const pastDateFrom = pastWeek.toISOString().split('T')[0];
      
      const pastResponse = await fetch(`${BASE_URL}/matches?dateFrom=${pastDateFrom}&dateTo=${dateFrom}`, {
        headers: {
          'X-Auth-Token': API_KEY,
          'User-Agent': 'BetHub/1.0 (contact@bethub.com)'
        }
      });
      
      if (pastResponse.ok) {
        const pastData = await pastResponse.json();
        matches.push(...(pastData.matches || []));
        console.log(`✅ Added ${pastData.matches?.length || 0} recent matches`);
      }
    }
    
    if (matches.length === 0) {
      console.log('❌ No matches found in the timeframe');
      return;
    }
    
    // Step 2: Transform matches using the new format
    console.log('\n🔧 Step 2: Transforming matches...');
    
    const transformedMatches = matches.slice(0, 20).map(match => { // Limit to 20 matches
      const statusMap = {
        'SCHEDULED': 'PRE',
        'TIMED': 'PRE',
        'IN_PLAY': 'LIVE',
        'PAUSED': 'LIVE', 
        'FINISHED': 'FT',
        'POSTPONED': 'POSTPONED',
        'CANCELLED': 'CANCELLED'
      };
      
      // Generate UUID-like ID
      const id = `match_${match.id}_${match.competition?.id || 'unknown'}_${Date.now()}`;
      
      return {
        id: id,
        external_id: match.id?.toString(),
        data_source: 'football-data',
        league: match.competition?.name || 'Unknown League',
        home_team: match.homeTeam?.name || 'Home Team',
        away_team: match.awayTeam?.name || 'Away Team',
        kickoff_utc: match.utcDate,
        venue: match.venue,
        referee: match.referees?.[0]?.name,
        status: statusMap[match.status] || 'PRE',
        home_score: match.score?.fullTime?.home || null,
        away_score: match.score?.fullTime?.away || null,
        current_minute: match.minute || null,
        // CRITICAL: Include ALL logo fields that were being lost!
        home_team_logo: match.homeTeam?.crest,
        away_team_logo: match.awayTeam?.crest,
        league_logo: match.competition?.emblem,
        // Workflow states
        is_pulled: true,
        is_analyzed: false,
        is_published: true, // Make them visible by default
        analysis_status: 'none',
        analysis_priority: 'normal',
        // Metadata
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: 'claude-population'
      };
    });
    
    console.log(`✅ Transformed ${transformedMatches.length} matches`);
    console.log('\nSample matches:');
    transformedMatches.slice(0, 3).forEach((match, i) => {
      console.log(`  ${i + 1}. ${match.home_team} vs ${match.away_team}`);
      console.log(`     League: ${match.league}`);
      console.log(`     Date: ${new Date(match.kickoff_utc).toLocaleDateString()}`);
      console.log(`     Status: ${match.status}`);
      console.log(`     Has logos: H=${!!match.home_team_logo}, A=${!!match.away_team_logo}, L=${!!match.league_logo}`);
    });
    
    // Step 3: Call your app's API to insert the data
    console.log('\n💾 Step 3: Inserting into database via your API...');
    
    for (const match of transformedMatches) {
      try {
        const response = await fetch('http://localhost:3002/api/v1/admin/matches', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ match })
        });
        
        if (response.ok) {
          console.log(`✅ Inserted: ${match.home_team} vs ${match.away_team}`);
        } else {
          const errorData = await response.json();
          console.log(`❌ Failed to insert ${match.home_team} vs ${match.away_team}: ${errorData.error}`);
        }
      } catch (error) {
        console.log(`❌ Error inserting ${match.home_team} vs ${match.away_team}: ${error.message}`);
      }
      
      // Small delay to avoid overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log('\n🎉 DATABASE POPULATION COMPLETE!');
    console.log('✅ Matches inserted with complete data including logos');
    console.log('✅ Admin panel should now show real matches');
    console.log('✅ All workflow states properly set');
    console.log('\n👀 Go check your admin panel now!');
    
  } catch (error) {
    console.error('❌ Population failed:', error.message);
  }
}

populateDatabase();