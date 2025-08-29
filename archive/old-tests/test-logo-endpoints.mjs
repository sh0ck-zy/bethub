#!/usr/bin/env node

/**
 * Test Logo Endpoints
 * Tests the teams and leagues API endpoints to verify logos are working
 */

const API_BASE = 'http://localhost:3000/api/v1';

async function testEndpoint(url, description) {
  try {
    console.log(`\n🧪 Testing: ${description}`);
    console.log(`   URL: ${url}`);
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (response.ok && data.success) {
      console.log(`   ✅ Success: ${data.data.name}`);
      console.log(`   🖼️  Logo: ${data.data.logo_url ? '✅ ' + data.data.logo_url : '❌ No logo'}`);
      console.log(`   🎨 Primary: ${data.data.primary || 'N/A'}`);
      return data.data;
    } else {
      console.log(`   ❌ Failed: ${data.message || 'Unknown error'}`);
      return null;
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return null;
  }
}

async function runTests() {
  console.log('🎯 BetHub Logo System Test');
  console.log('==========================');
  
  // Test popular teams
  const teams = [
    'Flamengo',
    'Manchester United',
    'Real Madrid',
    'Barcelona',
    'Bayern Munich',
    'Liverpool',
    'Juventus',
    'PSG',
    'Palmeiras',
    'Botafogo'
  ];
  
  console.log('\n🏃 Testing Team Logos:');
  console.log('======================');
  
  let teamLogosFound = 0;
  for (const team of teams) {
    const result = await testEndpoint(
      `${API_BASE}/teams?name=${encodeURIComponent(team)}`,
      `Team: ${team}`
    );
    if (result?.logo_url) teamLogosFound++;
    await new Promise(resolve => setTimeout(resolve, 100)); // Small delay
  }
  
  // Test popular leagues
  const leagues = [
    'Premier League',
    'La Liga',
    'Bundesliga',
    'Serie A',
    'Ligue 1',
    'Brasileirão Série A',
    'UEFA Champions League',
    'UEFA Europa League',
    'FA Cup',
    'Copa del Rey'
  ];
  
  console.log('\n🏆 Testing League Logos:');
  console.log('========================');
  
  let leagueLogosFound = 0;
  for (const league of leagues) {
    const result = await testEndpoint(
      `${API_BASE}/leagues?name=${encodeURIComponent(league)}`,
      `League: ${league}`
    );
    if (result?.logo_url) leagueLogosFound++;
    await new Promise(resolve => setTimeout(resolve, 100)); // Small delay
  }
  
  // Summary
  console.log('\n📊 Test Results Summary:');
  console.log('========================');
  console.log(`🏃 Team logos found: ${teamLogosFound}/${teams.length} (${Math.round(teamLogosFound/teams.length*100)}%)`);
  console.log(`🏆 League logos found: ${leagueLogosFound}/${leagues.length} (${Math.round(leagueLogosFound/leagues.length*100)}%)`);
  
  const totalLogos = teamLogosFound + leagueLogosFound;
  const totalTests = teams.length + leagues.length;
  console.log(`🎯 Overall success rate: ${totalLogos}/${totalTests} (${Math.round(totalLogos/totalTests*100)}%)`);
  
  if (totalLogos === totalTests) {
    console.log('\n🎉 All logos are working perfectly!');
  } else if (totalLogos > totalTests * 0.8) {
    console.log('\n✅ Logo system is working well (80%+ success rate)');
  } else if (totalLogos > totalTests * 0.5) {
    console.log('\n⚠️  Logo system needs improvement (50-80% success rate)');
  } else {
    console.log('\n❌ Logo system needs major fixes (<50% success rate)');
  }
}

// Check if server is running
async function checkServer() {
  try {
    const response = await fetch(`${API_BASE}/health`);
    if (response.ok) {
      console.log('✅ Server is running');
      return true;
    }
  } catch (error) {
    console.log('❌ Server is not running. Please start it with: npm run dev');
    console.log('   Waiting for server to start...');
    return false;
  }
}

// Main execution with server check
async function main() {
  let serverReady = false;
  let attempts = 0;
  const maxAttempts = 30; // Wait up to 30 seconds
  
  while (!serverReady && attempts < maxAttempts) {
    serverReady = await checkServer();
    if (!serverReady) {
      attempts++;
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  if (serverReady) {
    await runTests();
  } else {
    console.log('❌ Could not connect to server after 30 seconds');
    process.exit(1);
  }
}

main().catch(console.error);
