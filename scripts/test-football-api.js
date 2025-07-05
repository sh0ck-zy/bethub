// Test script for football API integration
// Run with: node scripts/test-football-api.js

import { footballAPI } from '../src/lib/api/football.js';
import { dataSync } from '../src/lib/api/sync.js';

console.log('🧪 Testing BetHub Football API Integration...\n');

async function testFootballAPI() {
  try {
    // Test 1: Health check
    console.log('1. Testing API health...');
    const health = await footballAPI.checkHealth();
    console.log(`   ${health ? '✅' : '❌'} API Health: ${health ? 'Connected' : 'Disconnected'}`);

    // Test 2: Get today's matches (dry run)
    console.log('\n2. Testing today matches fetch...');
    const todayResponse = await footballAPI.getTodayMatches();
    
    if (todayResponse.success) {
      console.log(`   ✅ Successfully fetched ${todayResponse.data?.length || 0} matches`);
      
      if (todayResponse.data && todayResponse.data.length > 0) {
        const sampleMatch = todayResponse.data[0];
        console.log(`   📊 Sample match: ${sampleMatch.homeTeam.name} vs ${sampleMatch.awayTeam.name}`);
        console.log(`   🏆 League: ${sampleMatch.competition.name}`);
        console.log(`   ⏰ Status: ${sampleMatch.status}`);
      }
    } else {
      console.log(`   ❌ Failed to fetch matches: ${todayResponse.error}`);
    }

    // Test 3: Data sync health check
    console.log('\n3. Testing data sync health...');
    const syncHealth = await dataSync.healthCheck();
    console.log(`   ${syncHealth ? '✅' : '❌'} Sync Health: ${syncHealth ? 'Healthy' : 'Unhealthy'}`);

    // Test 4: Sync status
    console.log('\n4. Testing sync status...');
    const syncStatus = dataSync.getSyncStatus();
    console.log(`   📊 Sync Status:`, {
      isRunning: syncStatus.isRunning,
      lastSyncTime: syncStatus.lastSyncTime?.toISOString() || 'Never'
    });

    // Test 5: Dry run sync
    console.log('\n5. Testing dry run sync...');
    const dryRunResult = await dataSync.syncTodayMatches({ 
      dryRun: true, 
      logProgress: true 
    });
    
    if (dryRunResult.success) {
      console.log(`   ✅ Dry run completed: ${dryRunResult.matchesAdded} matches would be added`);
    } else {
      console.log(`   ❌ Dry run failed: ${dryRunResult.error}`);
    }

    console.log('\n🎉 Football API Integration Test Complete!');
    
    // Summary
    console.log('\n📋 Summary:');
    console.log(`   API Health: ${health ? '✅' : '❌'}`);
    console.log(`   Matches Available: ${todayResponse.success ? '✅' : '❌'}`);
    console.log(`   Sync Health: ${syncHealth ? '✅' : '❌'}`);
    console.log(`   Dry Run: ${dryRunResult.success ? '✅' : '❌'}`);

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testFootballAPI(); 