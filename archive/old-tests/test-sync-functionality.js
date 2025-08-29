// Test script to verify sync functionality
import fetch from 'node-fetch';

async function testSyncAPI() {
  console.log('🧪 Testing Sync API Functionality...\n');

  try {
    // Test 1: Check if API is available
    console.log('1️⃣ Testing API availability...');
    const response = await fetch('http://localhost:3000/api/v1/admin/sync');
    const data = await response.json();
    console.log('✅ API Response:', data);
    console.log('');

    // Test 2: Test teams sync (will fail without tables, but should handle gracefully)
    console.log('2️⃣ Testing teams sync...');
    const teamsResponse = await fetch('http://localhost:3000/api/v1/admin/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ operation: 'teams' })
    });
    const teamsData = await teamsResponse.json();
    console.log('✅ Teams Sync Response:', teamsData);
    console.log('');

    // Test 3: Test matches sync
    console.log('3️⃣ Testing matches sync...');
    const matchesResponse = await fetch('http://localhost:3000/api/v1/admin/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ operation: 'matches' })
    });
    const matchesData = await matchesResponse.json();
    console.log('✅ Matches Sync Response:', matchesData);
    console.log('');

    // Test 4: Test full sync
    console.log('4️⃣ Testing full sync...');
    const fullResponse = await fetch('http://localhost:3000/api/v1/admin/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ operation: 'full' })
    });
    const fullData = await fullResponse.json();
    console.log('✅ Full Sync Response:', fullData);
    console.log('');

    console.log('🎉 All tests completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testSyncAPI(); 