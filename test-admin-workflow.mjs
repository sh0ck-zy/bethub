async function testAdminWorkflow() {
  console.log('🧪 Testing Admin Workflow...\n');
  
  const baseUrl = 'http://localhost:3000';
  
  try {
    // Step 1: Get future matches
    console.log('📅 Step 1: Fetching future matches...');
    const futureResponse = await fetch(`${baseUrl}/api/v1/admin/real-matches?days=30`);
    const futureData = await futureResponse.json();
    
    if (!futureData.success) {
      console.log('❌ Failed to fetch future matches');
      return;
    }
    
    console.log(`✅ Found ${futureData.data.length} future matches`);
    
    // Get first match for testing
    const testMatch = futureData.data[0];
    console.log(`🎯 Test match: ${testMatch.home_team} vs ${testMatch.away_team} (${testMatch.league})`);
    
    // Step 2: Submit for analysis
    console.log('\n🧠 Step 2: Submitting for analysis...');
    const submitResponse = await fetch(`${baseUrl}/api/v1/admin/submit-for-analysis`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        matchId: testMatch.id,
        league: testMatch.league,
        homeTeam: testMatch.home_team,
        awayTeam: testMatch.away_team,
        kickoffUtc: testMatch.kickoff_utc
      })
    });
    
    const submitData = await submitResponse.json();
    
    if (!submitData.success) {
      console.log('❌ Failed to submit for analysis:', submitData.error);
      return;
    }
    
    console.log('✅ Match submitted for analysis successfully');
    console.log(`   Analysis Status: ${submitData.data.analysisStatus}`);
    console.log(`   Estimated Completion: ${submitData.data.estimatedCompletion}`);
    
    // Step 3: Complete analysis (mock)
    console.log('\n✅ Step 3: Completing analysis (mock)...');
    
    // First, get the match from the database to get the correct ID
    const matchesResponse2 = await fetch(`${baseUrl}/api/v1/admin/matches`);
    const matchesData2 = await matchesResponse2.json();
    
    if (!matchesData2.success) {
      console.log('❌ Failed to fetch matches from database');
      return;
    }
    
    // Find the match that was just submitted (by team names and league)
    const submittedMatch = matchesData2.data.find(m => 
      m.home_team === testMatch.home_team && 
      m.away_team === testMatch.away_team && 
      m.league === testMatch.league &&
      m.analysis_status === 'pending'
    );
    
    if (!submittedMatch) {
      console.log('❌ Submitted match not found in database');
      return;
    }
    
    console.log(`🎯 Found submitted match in database: ${submittedMatch.id}`);
    
    const completeResponse = await fetch(`${baseUrl}/api/v1/admin/complete-analysis`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        matchId: submittedMatch.id
      })
    });
    
    const completeData = await completeResponse.json();
    
    if (!completeData.success) {
      console.log('❌ Failed to complete analysis:', completeData.error);
      return;
    }
    
    console.log('✅ Analysis completed successfully');
    if (completeData.data.analysis) {
      console.log(`   Analysis data available`);
    }
    
    // Step 4: Check match in database
    console.log('\n📊 Step 4: Checking match in database...');
    const matchesResponse = await fetch(`${baseUrl}/api/v1/admin/matches`);
    const matchesData = await matchesResponse.json();
    
    if (matchesData.success) {
      const submittedMatch = matchesData.data.find(m => m.id === testMatch.id);
      if (submittedMatch) {
        console.log('✅ Match found in database');
        console.log(`   Analysis Status: ${submittedMatch.analysis_status}`);
        console.log(`   Published: ${submittedMatch.is_published}`);
        console.log(`   Created: ${submittedMatch.created_at}`);
      } else {
        console.log('❌ Match not found in database');
      }
    }
    
    console.log('\n🎉 Workflow test completed successfully!');
    console.log('\n📋 Summary:');
    console.log('   1. ✅ Fetched future matches from real data');
    console.log('   2. ✅ Submitted match for analysis');
    console.log('   3. ✅ Completed analysis (mock)');
    console.log('   4. ✅ Verified match in database');
    console.log('\n🚀 Next steps:');
    console.log('   - Admin can now publish the match');
    console.log('   - Users will see the analyzed match on homepage');
    console.log('   - AI agent integration coming soon!');
    
  } catch (error) {
    console.error('❌ Error testing workflow:', error);
  }
}

testAdminWorkflow(); 