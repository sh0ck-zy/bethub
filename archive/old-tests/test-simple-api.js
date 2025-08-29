#!/usr/bin/env node

/**
 * Quick test for the new SimpleFootballAPI
 * Run with: node test-simple-api.js
 */

// Test API connection and data fetching
async function testAPI() {
  console.log('🧪 Testing Simple Football API...\n');
  
  try {
    // Test API endpoint directly
    const response = await fetch('http://localhost:3000/api/v1/today');
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    console.log('✅ API Response:');
    console.log(`Source: ${data.source}`);
    console.log(`Success: ${data.success}`);
    console.log(`Total matches: ${data.total}`);
    
    if (data.matches && data.matches.length > 0) {
      console.log('\n📊 Sample match:');
      const match = data.matches[0];
      console.log(`${match.home_team} vs ${match.away_team}`);
      console.log(`League: ${match.league}`);
      console.log(`Status: ${match.status}`);
      console.log(`Time: ${match.kickoff_utc}`);
      console.log(`Published: ${match.is_published}`);
      
      if (match.home_team_logo) {
        console.log(`Home logo: ${match.home_team_logo}`);
      }
      if (match.away_team_logo) {
        console.log(`Away logo: ${match.away_team_logo}`);
      }
    }
    
    if (data.spotlight_match) {
      console.log('\n🌟 Spotlight match:');
      const spotlight = data.spotlight_match;
      console.log(`${spotlight.home_team} vs ${spotlight.away_team}`);
    }
    
    console.log('\n✅ Test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 Make sure your Next.js dev server is running:');
      console.log('   npm run dev');
    }
    
    if (error.message.includes('API key')) {
      console.log('\n💡 Make sure FOOTBALL_DATA_API_KEY is set in your .env file');
    }
  }
}

// Run the test
testAPI();
