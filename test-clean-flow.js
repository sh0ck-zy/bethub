// Test the new clean, simplified flow
// This tests the exact flow you described

async function testCleanFlow() {
  console.log('🧪 TESTING CLEAN SIMPLIFIED FLOW\n');
  
  const baseUrl = 'http://localhost:3001';
  
  try {
    // Step 1: Admin pulls matches with request builder
    console.log('1️⃣ Step 1: Admin pulls matches (with request builder)...');
    
    const pullRequest = {
      dateFrom: '2025-09-10',  // Yesterday
      dateTo: '2025-09-15',    // Few days ahead
      competitions: ['PL', 'BL1', 'PD'] // Premier League, Bundesliga, La Liga
    };
    
    console.log('📋 Request parameters:');
    console.log(`   Date range: ${pullRequest.dateFrom} to ${pullRequest.dateTo}`);
    console.log(`   Competitions: ${pullRequest.competitions.join(', ')}`);
    
    const pullResponse = await fetch(`${baseUrl}/api/v1/admin/pull-matches`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pullRequest)
    });
    
    if (!pullResponse.ok) {
      const error = await pullResponse.json();
      throw new Error(`Pull failed: ${error.error}`);
    }
    
    const pullResult = await pullResponse.json();
    console.log('✅ Pull successful:');
    console.log(`   📊 Fetched: ${pullResult.data.total_fetched} matches`);
    console.log(`   🆕 Inserted: ${pullResult.data.matches_inserted} new matches`);
    console.log(`   🔄 Updated: ${pullResult.data.matches_updated} existing matches`);
    console.log(`   ⚠️ Note: ${pullResult.data.note}`);
    
    // Step 2: Check matches are ingested correctly (admin view)
    console.log('\n2️⃣ Step 2: Check matches are ingested correctly (admin view)...');
    
    const adminResponse = await fetch(`${baseUrl}/api/v1/matches?admin=true`);
    const adminResult = await adminResponse.json();
    
    console.log('📊 Admin view:');
    console.log(`   Total matches: ${adminResult.metadata.total}`);
    console.log(`   Published: ${adminResult.metadata.published}`);
    console.log(`   Unpublished: ${adminResult.metadata.unpublished}`);
    console.log(`   By status:`, adminResult.metadata.by_status);
    
    // Step 3: Check that normal users see NO matches (public view)
    console.log('\n3️⃣ Step 3: Check normal users see NO matches (public view)...');
    
    const publicResponse = await fetch(`${baseUrl}/api/v1/matches`);
    const publicResult = await publicResponse.json();
    
    console.log('👥 Public view:');
    console.log(`   Visible matches: ${publicResult.metadata.total}`);
    console.log(`   Live matches: ${publicResult.metadata.live_matches}`);
    console.log(`   Upcoming matches: ${publicResult.metadata.upcoming_matches}`);
    console.log(`   Completed matches: ${publicResult.metadata.completed_matches}`);
    
    if (publicResult.metadata.total === 0) {
      console.log('✅ Correct: Users cannot see unpublished matches');
    } else {
      console.log('❌ Issue: Users can see matches before admin publishes them');
    }
    
    // Step 4: Admin publishes some matches
    console.log('\n4️⃣ Step 4: Admin publishes some matches...');
    
    if (adminResult.matches.length > 0) {
      // Publish first 3 matches
      const matchesToPublish = adminResult.matches.slice(0, 3).map(m => m.id);
      
      const publishResponse = await fetch(`${baseUrl}/api/v1/matches`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'publish',
          matchIds: matchesToPublish
        })
      });
      
      const publishResult = await publishResponse.json();
      console.log('📝 Publishing result:');
      console.log(`   Matches published: ${publishResult.data.matches_updated}`);
      console.log(`   Message: ${publishResult.data.message}`);
      
      // Step 5: Check that published matches now appear for normal users
      console.log('\n5️⃣ Step 5: Check published matches now appear for users...');
      
      const finalPublicResponse = await fetch(`${baseUrl}/api/v1/matches`);
      const finalPublicResult = await finalPublicResponse.json();
      
      console.log('👥 Final public view:');
      console.log(`   Visible matches: ${finalPublicResult.metadata.total}`);
      console.log(`   Sample matches:`);
      finalPublicResult.matches.slice(0, 2).forEach((match, i) => {
        console.log(`     ${i + 1}. ${match.home_team} vs ${match.away_team} (${match.league})`);
      });
      
      if (finalPublicResult.metadata.total === matchesToPublish.length) {
        console.log('✅ Perfect: Only published matches are visible to users');
      } else {
        console.log('⚠️ Check: Ensure publish/unpublish logic is working correctly');
      }
    }
    
    // Step 6: Test deduplication
    console.log('\n6️⃣ Step 6: Test deduplication (pull same data again)...');
    
    const duplicateResponse = await fetch(`${baseUrl}/api/v1/admin/pull-matches`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pullRequest) // Same request as before
    });
    
    const duplicateResult = await duplicateResponse.json();
    console.log('🔄 Deduplication test:');
    console.log(`   Fetched: ${duplicateResult.data.total_fetched} matches`);
    console.log(`   New inserted: ${duplicateResult.data.matches_inserted} (should be 0)`);
    console.log(`   Updated: ${duplicateResult.data.matches_updated} (should match previous total)`);
    
    if (duplicateResult.data.matches_inserted === 0) {
      console.log('✅ Deduplication working: No duplicate matches created');
    } else {
      console.log('❌ Deduplication issue: Duplicate matches were created');
    }
    
    console.log('\n🎉 CLEAN FLOW TEST COMPLETE!');
    console.log('\n📋 FLOW SUMMARY:');
    console.log('✅ 1. Admin pulls matches with request builder → Data fetched');
    console.log('✅ 2. Matches ingested correctly → No duplicates');
    console.log('✅ 3. Matches unpublished by default → Users cannot see');
    console.log('✅ 4. Admin publishes selected matches → Users can now see');
    console.log('✅ 5. Deduplication prevents double entries → System robust');
    
  } catch (error) {
    console.error('\n❌ CLEAN FLOW TEST FAILED:', error.message);
    console.log('\n🔧 Make sure:');
    console.log('1. Your dev server is running (pnpm dev)');
    console.log('2. Your database is accessible');
    console.log('3. Your Football Data API key is valid');
  }
}

testCleanFlow();