// Test script to verify the spotlight match API is working
const baseUrl = 'http://localhost:3002';

async function testSpotlightAPI() {
  try {
    console.log('🧪 Testing Spotlight Match API...\n');
    
    // Test 1: Get current spotlight match
    console.log('1. Getting current spotlight match...');
    const getResponse = await fetch(`${baseUrl}/api/v1/admin/spotlight-match`);
    const getData = await getResponse.json();
    
    if (getResponse.ok) {
      console.log('✅ GET spotlight match successful:');
      console.log('   - Spotlight match:', getData.spotlight_match?.home_team, 'vs', getData.spotlight_match?.away_team);
      console.log('   - Is default:', getData.is_default);
    } else {
      console.log('❌ GET spotlight match failed:', getData.error);
    }
    
    // Test 2: Get today's matches to find available matches
    console.log('\n2. Getting today\'s matches...');
    const todayResponse = await fetch(`${baseUrl}/api/v1/today`);
    const todayData = await todayResponse.json();
    
    if (todayResponse.ok && todayData.matches && todayData.matches.length > 0) {
      console.log('✅ GET today\'s matches successful:');
      console.log('   - Total matches:', todayData.matches.length);
      console.log('   - Current spotlight:', todayData.spotlight_match?.home_team, 'vs', todayData.spotlight_match?.away_team);
      
      // Test 3: Set a new spotlight match
      const testMatch = todayData.matches[0];
      console.log('\n3. Setting new spotlight match...');
      console.log('   - Selected match:', testMatch.home_team, 'vs', testMatch.away_team);
      
      const setResponse = await fetch(`${baseUrl}/api/v1/admin/spotlight-match`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          matchId: testMatch.id
        })
      });
      
      const setData = await setResponse.json();
      
      if (setResponse.ok) {
        console.log('✅ SET spotlight match successful:');
        console.log('   - Message:', setData.message);
      } else {
        console.log('❌ SET spotlight match failed:', setData.error);
      }
      
      // Test 4: Verify the change
      console.log('\n4. Verifying spotlight match change...');
      const verifyResponse = await fetch(`${baseUrl}/api/v1/admin/spotlight-match`);
      const verifyData = await verifyResponse.json();
      
      if (verifyResponse.ok) {
        console.log('✅ Verification successful:');
        console.log('   - Current spotlight:', verifyData.spotlight_match?.home_team, 'vs', verifyData.spotlight_match?.away_team);
        console.log('   - Is default:', verifyData.is_default);
      } else {
        console.log('❌ Verification failed:', verifyData.error);
      }
    } else {
      console.log('❌ No matches found for testing');
    }
    
    console.log('\n🎯 Test completed!');
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testSpotlightAPI();