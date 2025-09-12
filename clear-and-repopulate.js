// Clear database and populate with fresh matches that include logo data
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://igqnndxochvxaaqvosvq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlncW5uZHhvY2h2eGFhcXZvc3ZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjQzNzMxNDEsImV4cCI6MjAzOTk0OTE0MX0.CdBdyEfPhU2b1dqBe_ILGU3QdQdIbCEgJHYYkubxnNI';

async function clearAndRepopulate() {
  console.log('🗑️  Clearing existing matches...');
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    // Delete all matches
    const { error: deleteError } = await supabase
      .from('matches')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all (this condition will always be true)
    
    if (deleteError) {
      console.error('Error deleting matches:', deleteError);
      return;
    }
    
    console.log('✅ All matches cleared');
    
    // Now trigger the API pull which has the logo fixes
    console.log('📡 Pulling fresh matches with logo data...');
    
    const response = await fetch('http://localhost:3002/api/v1/admin/fetch-current-matches', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log(`✅ ${result.message}`);
      console.log(`📊 Matches inserted: ${result.data?.matches_upserted || 0}`);
      
      // Check if logos are now included
      const matchesResponse = await fetch('http://localhost:3002/api/v1/admin/matches');
      const matchesData = await matchesResponse.json();
      
      if (matchesData.success && matchesData.matches.length > 0) {
        const sampleMatch = matchesData.matches[0];
        
        console.log('\n📋 Sample match data:');
        console.log(`Match: ${sampleMatch.home_team} vs ${sampleMatch.away_team}`);
        console.log(`League: ${sampleMatch.league}`);
        console.log(`Logos included:`);
        console.log(`  Home: ${sampleMatch.home_team_logo ? '✅ ' + sampleMatch.home_team_logo.substring(0, 50) + '...' : '❌ Missing'}`);
        console.log(`  Away: ${sampleMatch.away_team_logo ? '✅ ' + sampleMatch.away_team_logo.substring(0, 50) + '...' : '❌ Missing'}`);
        console.log(`  League: ${sampleMatch.league_logo ? '✅ ' + sampleMatch.league_logo.substring(0, 50) + '...' : '❌ Missing'}`);
        
        // Count matches with logos
        let withHomeLogos = 0;
        let withAwayLogos = 0; 
        let withLeagueLogos = 0;
        
        matchesData.matches.forEach(match => {
          if (match.home_team_logo) withHomeLogos++;
          if (match.away_team_logo) withAwayLogos++;
          if (match.league_logo) withLeagueLogos++;
        });
        
        console.log(`\n📊 Logo statistics:`);
        console.log(`  Home team logos: ${withHomeLogos}/${matchesData.matches.length}`);
        console.log(`  Away team logos: ${withAwayLogos}/${matchesData.matches.length}`);
        console.log(`  League logos: ${withLeagueLogos}/${matchesData.matches.length}`);
        
        if (withHomeLogos > 0 && withAwayLogos > 0 && withLeagueLogos > 0) {
          console.log('\n🎉 SUCCESS: Logo data is now properly included!');
          console.log('✅ Admin panel should now show matches with team and league logos');
          console.log('👀 Go check http://localhost:3002/admin');
        } else {
          console.log('\n❌ Logo data is still missing - need to investigate further');
        }
      }
      
    } else {
      console.error('❌ Failed to pull matches:', result.error);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

clearAndRepopulate();