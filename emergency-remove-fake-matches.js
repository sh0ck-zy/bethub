// Emergency script to remove all fake/sample match data from database

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://igqnndxochvxaaqvosvq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlncW5uZHhvY2h2eGFhcXZvc3ZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxMTY0MTYsImV4cCI6MjA2NTY5MjQxNn0.TBH1fQNM1smo60ph9mlbnH24sQAR0VnEhH1a_vZVoW8';

async function removeFakeMatches() {
  console.log('🚨 EMERGENCY: REMOVING FAKE MATCH DATA\n');
  
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // List of fake team names that appear in the sample data
    const fakeTeamNames = [
      'CR Flamengo',
      'Grêmio FBPA', 
      'Santos FC',
      'Fluminense FC',
      'Mirassol FC',
      'EC Bahia',
      'CA Mineiro',
      'Fortaleza EC',
      'Botafogo FR',
      'EC Juventude',
      'São Paulo FC',
      'CR Vasco da Gama',
      'Ceará SC',
      'SE Palmeiras',
      'SC Internacional',
      'SC Corinthians Paulista',
      'RB Bragantino',
      'SC Recife'
    ];
    
    console.log('🔍 Identifying fake matches...');
    
    // First, let's see what matches contain these fake teams
    const { data: suspiciousMatches, error: queryError } = await supabase
      .from('matches')
      .select('id, home_team, away_team, league, kickoff_utc, status, data_source, external_id')
      .or(fakeTeamNames.map(team => `home_team.eq.${team},away_team.eq.${team}`).join(','));
    
    if (queryError) {
      throw new Error(`Query failed: ${queryError.message}`);
    }
    
    console.log(`📊 Found ${suspiciousMatches?.length || 0} potentially fake matches`);
    
    if (suspiciousMatches && suspiciousMatches.length > 0) {
      console.log('\nFake matches identified:');
      suspiciousMatches.forEach((match, index) => {
        console.log(`${index + 1}. ${match.home_team} vs ${match.away_team} (${match.league}) - Status: ${match.status}`);
      });
      
      // Delete these fake matches completely
      console.log('\n🗑️  Deleting fake matches...');
      
      const matchIds = suspiciousMatches.map(m => m.id);
      const { error: deleteError } = await supabase
        .from('matches')
        .delete()
        .in('id', matchIds);
      
      if (deleteError) {
        throw new Error(`Delete failed: ${deleteError.message}`);
      }
      
      console.log(`✅ Successfully deleted ${suspiciousMatches.length} fake matches`);
    } else {
      console.log('✅ No fake matches found');
    }
    
    // Also remove any matches that have clearly fake external IDs
    console.log('\n🔍 Checking for matches with fake external IDs...');
    
    const { data: fakeIdMatches, error: fakeIdError } = await supabase
      .from('matches')
      .select('id, home_team, away_team, external_id')
      .or('external_id.eq.1001,external_id.eq.1002,external_id.eq.1003,external_id.eq.1004,external_id.eq.1005,external_id.eq.real-match-1,external_id.eq.real-match-2,external_id.eq.real-match-3');
    
    if (fakeIdMatches && fakeIdMatches.length > 0) {
      console.log(`📊 Found ${fakeIdMatches.length} matches with fake external IDs`);
      
      const fakeIdMatchIds = fakeIdMatches.map(m => m.id);
      const { error: deleteFakeIdError } = await supabase
        .from('matches')
        .delete()
        .in('id', fakeIdMatchIds);
      
      if (deleteFakeIdError) {
        throw new Error(`Delete fake ID matches failed: ${deleteFakeIdError.message}`);
      }
      
      console.log(`✅ Successfully deleted ${fakeIdMatches.length} matches with fake external IDs`);
    }
    
    // Verify the cleanup
    console.log('\n🧪 Verifying cleanup...');
    
    const { count: remainingPublishedCount, error: countError } = await supabase
      .from('matches')
      .select('id', { count: 'exact' })
      .eq('is_published', true);
    
    if (countError) {
      console.log('⚠️ Could not verify count:', countError.message);
    } else {
      console.log(`📊 Remaining published matches: ${remainingPublishedCount}`);
    }
    
    // Test the main page endpoint
    console.log('\n🧪 Testing main page endpoint...');
    
    const response = await fetch('http://localhost:3001/api/v1/matches');
    const result = await response.json();
    
    console.log(`📋 Main page now shows: ${result.matches?.length || 0} matches`);
    console.log(`💬 Message: ${result.message || 'No message'}`);
    
    if (result.matches?.length === 0) {
      console.log('\n🎉 SUCCESS: Main page shows NO matches (as expected after cleanup)!');
      console.log('✅ Only real matches will appear when admin pulls fresh data');
    } else {
      console.log(`\n📋 Main page shows ${result.matches?.length} matches. Checking if they\'re real...`);
      if (result.matches && result.matches.length > 0) {
        result.matches.slice(0, 3).forEach((match, index) => {
          console.log(`${index + 1}. ${match.home_team} vs ${match.away_team} (${match.league})`);
        });
      }
    }
    
  } catch (error) {
    console.error('❌ Emergency cleanup failed:', error.message);
  }
}

removeFakeMatches();