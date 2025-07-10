#!/usr/bin/env node

/**
 * Test Real Sports Data Integration
 * This script tests the Football-Data.org API integration and data sync
 */

import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const baseUrl = 'http://localhost:3004'; // Adjust if your dev server runs on different port

async function testRealDataIntegration() {
  console.log('🏈 Testing Real Sports Data Integration\n');

  // Check if API key is configured
  if (!process.env.FOOTBALL_DATA_API_KEY) {
    console.log('❌ Football-Data.org API key not found!');
    console.log('\n📋 Setup Instructions:');
    console.log('1. Go to https://www.football-data.org/client/register');
    console.log('2. Create a free account');
    console.log('3. Get your API key from the dashboard');
    console.log('4. Add to your .env.local file:');
    console.log('   FOOTBALL_DATA_API_KEY=your_api_key_here');
    console.log('\n💡 Free tier includes 10 requests per minute, perfect for testing!');
    return;
  }

  console.log('✅ Football-Data.org API key found');
  console.log(`🔗 Testing API at: ${baseUrl}\n`);

  try {
    // Test 1: Get current sync status
    console.log('📊 Test 1: Getting current sync status...');
    const statusResponse = await fetch(`${baseUrl}/api/v1/admin/sync-data`);
    const statusData = await statusResponse.json();
    
    if (statusData.success) {
      console.log('✅ Sync status retrieved successfully');
      console.log(`   Total matches: ${statusData.data.totalMatches}`);
      console.log(`   Live matches: ${statusData.data.liveMatches}`);
      console.log(`   Today's matches: ${statusData.data.todaysMatches}`);
      console.log(`   API configured: ${statusData.data.api_configured}`);
    } else {
      console.log('❌ Failed to get sync status:', statusData.message);
    }

    console.log('\n🔄 Test 2: Syncing today\'s matches from Football-Data.org...');
    
    // Test 2: Sync today's matches
    const syncResponse = await fetch(`${baseUrl}/api/v1/admin/sync-data`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'sync_today'
      }),
    });

    const syncData = await syncResponse.json();
    
    if (syncData.success) {
      console.log('✅ Real data sync successful!');
      console.log(`   ${syncData.message}`);
      console.log(`   Matches added: ${syncData.data.matchesAdded}`);
      
      if (syncData.data.matchesAdded > 0) {
        console.log('\n🎉 Success! Your app now has real sports data!');
        console.log('   Visit your app to see live matches from Football-Data.org');
      } else {
        console.log('\n📅 No matches today, but the integration is working!');
        console.log('   Try syncing a different date range to see more matches.');
      }
    } else {
      console.log('❌ Sync failed:', syncData.message);
      
      if (syncData.error?.includes('Rate limit')) {
        console.log('💡 Football-Data.org free tier allows 10 requests per minute');
        console.log('   Wait a minute and try again, or upgrade for higher limits');
      }
      
      if (syncData.error?.includes('API access forbidden')) {
        console.log('💡 Check your API key is correct and active');
      }
    }

    // Test 3: Check if we have real matches now
    console.log('\n📺 Test 3: Checking for real matches in your app...');
    const todayResponse = await fetch(`${baseUrl}/api/v1/today`);
    const todayMatches = await todayResponse.json();
    
    if (Array.isArray(todayMatches) && todayMatches.length > 0) {
      const realMatches = todayMatches.filter(match => match.id.startsWith('fd_'));
      console.log(`✅ Found ${realMatches.length} real matches from Football-Data.org`);
      
      if (realMatches.length > 0) {
        console.log('   Sample real matches:');
        realMatches.slice(0, 3).forEach(match => {
          console.log(`   • ${match.home_team} vs ${match.away_team} (${match.league}) - ${match.status}`);
        });
      }
      
      const sampleMatches = todayMatches.filter(match => match.id.startsWith('550e8400'));
      if (sampleMatches.length > 0) {
        console.log(`📝 Also found ${sampleMatches.length} sample matches (these can be removed if desired)`);
      }
    } else {
      console.log('📭 No matches found in your app');
    }

    // Test 4: Show next steps
    console.log('\n🚀 Next Steps:');
    console.log('1. Visit your app: http://localhost:3004');
    console.log('2. Check the admin panel for more sync options');
    console.log('3. Set up scheduled syncing for automatic updates');
    console.log('4. Consider upgrading Football-Data.org for more requests');
    
    console.log('\n💡 Available sync actions:');
    console.log('- sync_today: Get today\'s matches');
    console.log('- sync_live: Update live scores');
    console.log('- sync_range: Get matches for date range');
    console.log('- status: Check sync status');
    console.log('- cleanup: Remove old matches');

  } catch (error) {
    console.log('\n❌ Test failed:', error.message);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('💡 Make sure your development server is running: npm run dev');
    }
    
    if (error.message.includes('fetch')) {
      console.log('💡 Check that your app is running on the correct port');
    }
  }
}

// Example: Manual API test (without going through our server)
async function testDirectAPI() {
  console.log('\n🔧 Testing direct API access...');
  
  try {
    const response = await fetch('https://api.football-data.org/v4/competitions', {
      headers: {
        'X-Auth-Token': process.env.FOOTBALL_DATA_API_KEY,
      },
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Direct API access successful');
      console.log(`   Found ${data.competitions?.length || 0} competitions`);
      
      if (data.competitions?.length > 0) {
        console.log('   Sample competitions:');
        data.competitions.slice(0, 3).forEach(comp => {
          console.log(`   • ${comp.name} (${comp.area.name})`);
        });
      }
    } else {
      console.log('❌ Direct API access failed:', response.status, response.statusText);
    }
  } catch (error) {
    console.log('❌ Direct API test failed:', error.message);
  }
}

// Run tests
async function main() {
  await testRealDataIntegration();
  
  // Only test direct API if we have the key
  if (process.env.FOOTBALL_DATA_API_KEY) {
    await testDirectAPI();
  }
}

main().catch(console.error); 