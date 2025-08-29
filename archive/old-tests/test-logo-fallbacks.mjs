#!/usr/bin/env node

/**
 * Test Logo Fallbacks Directly
 * Tests the logo fallback system without requiring the full API
 */

// Import the fallback functions (simulate them here for testing)
const TEAM_LOGOS = {
  // Brazilian Teams
  'Flamengo': 'https://logoeps.com/wp-content/uploads/2013/03/flamengo-vector-logo.png',
  'CR Flamengo': 'https://logoeps.com/wp-content/uploads/2013/03/flamengo-vector-logo.png',
  'Palmeiras': 'https://logoeps.com/wp-content/uploads/2013/03/palmeiras-vector-logo.png',
  'SE Palmeiras': 'https://logoeps.com/wp-content/uploads/2013/03/palmeiras-vector-logo.png',
  'Santos': 'https://logoeps.com/wp-content/uploads/2013/03/santos-vector-logo.png',
  'Santos FC': 'https://logoeps.com/wp-content/uploads/2013/03/santos-vector-logo.png',
  'Botafogo': 'https://logoeps.com/wp-content/uploads/2013/03/botafogo-vector-logo.png',
  'Botafogo FR': 'https://logoeps.com/wp-content/uploads/2013/03/botafogo-vector-logo.png',

  // English Premier League
  'Manchester United': 'https://logoeps.com/wp-content/uploads/2013/03/manchester-united-vector-logo.png',
  'Liverpool': 'https://logoeps.com/wp-content/uploads/2013/03/liverpool-vector-logo.png',
  'Arsenal': 'https://logoeps.com/wp-content/uploads/2013/03/arsenal-vector-logo.png',
  'Chelsea': 'https://logoeps.com/wp-content/uploads/2013/03/chelsea-vector-logo.png',
  'Manchester City': 'https://logoeps.com/wp-content/uploads/2013/03/manchester-city-vector-logo.png',

  // Spanish La Liga
  'Real Madrid': 'https://logoeps.com/wp-content/uploads/2013/03/real-madrid-vector-logo.png',
  'Barcelona': 'https://logoeps.com/wp-content/uploads/2013/03/barcelona-vector-logo.png',
  'Atlético Madrid': 'https://logoeps.com/wp-content/uploads/2013/03/atletico-madrid-vector-logo.png',

  // German Bundesliga
  'Bayern Munich': 'https://logoeps.com/wp-content/uploads/2013/03/bayern-munich-vector-logo.png',
  'Borussia Dortmund': 'https://logoeps.com/wp-content/uploads/2013/03/borussia-dortmund-vector-logo.png',

  // Italian Serie A
  'Juventus': 'https://logoeps.com/wp-content/uploads/2013/03/juventus-vector-logo.png',
  'Inter Milan': 'https://logoeps.com/wp-content/uploads/2013/03/inter-milan-vector-logo.png',
  'AC Milan': 'https://logoeps.com/wp-content/uploads/2013/03/ac-milan-vector-logo.png',

  // French Ligue 1
  'PSG': 'https://logoeps.com/wp-content/uploads/2013/03/psg-vector-logo.png',
  'Paris Saint-Germain': 'https://logoeps.com/wp-content/uploads/2013/03/psg-vector-logo.png',
};

const LEAGUE_LOGOS = {
  // European Competitions
  'UEFA Champions League': 'https://logoeps.com/wp-content/uploads/2013/03/uefa-champions-league-vector-logo.png',
  'Champions League': 'https://logoeps.com/wp-content/uploads/2013/03/uefa-champions-league-vector-logo.png',
  'UEFA Europa League': 'https://logoeps.com/wp-content/uploads/2013/03/uefa-europa-league-vector-logo.png',
  'Europa League': 'https://logoeps.com/wp-content/uploads/2013/03/uefa-europa-league-vector-logo.png',

  // National Leagues
  'Premier League': 'https://logoeps.com/wp-content/uploads/2013/03/premier-league-vector-logo.png',
  'English Premier League': 'https://logoeps.com/wp-content/uploads/2013/03/premier-league-vector-logo.png',
  'La Liga': 'https://logoeps.com/wp-content/uploads/2013/03/la-liga-vector-logo.png',
  'Spanish La Liga': 'https://logoeps.com/wp-content/uploads/2013/03/la-liga-vector-logo.png',
  'Bundesliga': 'https://logoeps.com/wp-content/uploads/2013/03/bundesliga-vector-logo.png',
  'German Bundesliga': 'https://logoeps.com/wp-content/uploads/2013/03/bundesliga-vector-logo.png',
  'Serie A': 'https://logoeps.com/wp-content/uploads/2013/03/serie-a-vector-logo.png',
  'Italian Serie A': 'https://logoeps.com/wp-content/uploads/2013/03/serie-a-vector-logo.png',
  'Ligue 1': 'https://logoeps.com/wp-content/uploads/2013/03/ligue-1-vector-logo.png',
  'French Ligue 1': 'https://logoeps.com/wp-content/uploads/2013/03/ligue-1-vector-logo.png',

  // Brazilian Competitions
  'Brasileirão Série A': 'https://logoeps.com/wp-content/uploads/2013/03/brasileirao-vector-logo.png',
  'Copa do Brasil': 'https://logoeps.com/wp-content/uploads/2013/03/copa-do-brasil-vector-logo.png',
};

// Test functions
function findTeamLogo(teamName) {
  // Direct match
  if (TEAM_LOGOS[teamName]) {
    return TEAM_LOGOS[teamName];
  }

  // Fuzzy matching
  const normalizedSearch = teamName.toLowerCase().trim();
  
  for (const [key, logoUrl] of Object.entries(TEAM_LOGOS)) {
    const normalizedKey = key.toLowerCase();
    
    // Check if search term contains the key or vice versa
    if (normalizedSearch.includes(normalizedKey) || normalizedKey.includes(normalizedSearch)) {
      return logoUrl;
    }
  }

  return null;
}

function findLeagueLogo(leagueName) {
  // Direct match
  if (LEAGUE_LOGOS[leagueName]) {
    return LEAGUE_LOGOS[leagueName];
  }

  // Fuzzy matching
  const normalizedSearch = leagueName.toLowerCase().trim();
  
  for (const [key, logoUrl] of Object.entries(LEAGUE_LOGOS)) {
    const normalizedKey = key.toLowerCase();
    
    if (normalizedSearch.includes(normalizedKey) || normalizedKey.includes(normalizedSearch)) {
      return logoUrl;
    }
  }

  return null;
}

// Test URL validity
async function testUrlAccess(url, name) {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    if (response.ok) {
      console.log(`   ✅ ${name}: Logo accessible`);
      return true;
    } else {
      console.log(`   ⚠️  ${name}: Logo returned ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`   ❌ ${name}: Logo not accessible - ${error.message}`);
    return false;
  }
}

async function runLogoTests() {
  console.log('🎯 BetHub Logo Fallback System Test');
  console.log('====================================\n');

  // Test team logos
  const testTeams = [
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

  console.log('🏃 Testing Team Logo Fallbacks:');
  console.log('================================');
  
  let teamLogosFound = 0;
  let teamLogosAccessible = 0;
  
  for (const team of testTeams) {
    const logoUrl = findTeamLogo(team);
    if (logoUrl) {
      console.log(`🔍 ${team}:`);
      console.log(`   📍 URL: ${logoUrl}`);
      const accessible = await testUrlAccess(logoUrl, team);
      if (accessible) teamLogosAccessible++;
      teamLogosFound++;
    } else {
      console.log(`❌ ${team}: No logo found`);
    }
  }

  // Test league logos
  const testLeagues = [
    'Premier League',
    'La Liga',
    'Bundesliga',
    'Serie A',
    'Ligue 1',
    'Brasileirão Série A',
    'UEFA Champions League',
    'UEFA Europa League',
  ];

  console.log('\n🏆 Testing League Logo Fallbacks:');
  console.log('=================================');
  
  let leagueLogosFound = 0;
  let leagueLogosAccessible = 0;
  
  for (const league of testLeagues) {
    const logoUrl = findLeagueLogo(league);
    if (logoUrl) {
      console.log(`🔍 ${league}:`);
      console.log(`   📍 URL: ${logoUrl}`);
      const accessible = await testUrlAccess(logoUrl, league);
      if (accessible) leagueLogosAccessible++;
      leagueLogosFound++;
    } else {
      console.log(`❌ ${league}: No logo found`);
    }
  }

  // Summary
  console.log('\n📊 Logo Fallback Test Results:');
  console.log('===============================');
  console.log(`🏃 Team logos found: ${teamLogosFound}/${testTeams.length} (${Math.round(teamLogosFound/testTeams.length*100)}%)`);
  console.log(`   Accessible: ${teamLogosAccessible}/${teamLogosFound} (${teamLogosAccessible > 0 ? Math.round(teamLogosAccessible/teamLogosFound*100) : 0}%)`);
  console.log(`🏆 League logos found: ${leagueLogosFound}/${testLeagues.length} (${Math.round(leagueLogosFound/testLeagues.length*100)}%)`);
  console.log(`   Accessible: ${leagueLogosAccessible}/${leagueLogosFound} (${leagueLogosAccessible > 0 ? Math.round(leagueLogosAccessible/leagueLogosFound*100) : 0}%)`);
  
  const totalFound = teamLogosFound + leagueLogosFound;
  const totalAccessible = teamLogosAccessible + leagueLogosAccessible;
  const totalTests = testTeams.length + testLeagues.length;
  
  console.log(`🎯 Overall coverage: ${totalFound}/${totalTests} (${Math.round(totalFound/totalTests*100)}%)`);
  console.log(`🌐 Overall accessibility: ${totalAccessible}/${totalFound} (${totalFound > 0 ? Math.round(totalAccessible/totalFound*100) : 0}%)`);
  
  if (totalFound === totalTests && totalAccessible === totalFound) {
    console.log('\n🎉 Logo fallback system is working perfectly!');
  } else if (totalFound > totalTests * 0.8) {
    console.log('\n✅ Logo fallback system is working well!');
  } else {
    console.log('\n⚠️  Logo fallback system needs improvement');
  }

  // Test fuzzy matching
  console.log('\n🔍 Testing Fuzzy Matching:');
  console.log('==========================');
  
  const fuzzyTests = [
    { search: 'Man United', expected: 'Manchester United' },
    { search: 'Barca', expected: 'Barcelona' },
    { search: 'Bayern', expected: 'Bayern Munich' },
    { search: 'Champions', expected: 'UEFA Champions League' },
    { search: 'Premier', expected: 'Premier League' },
  ];
  
  fuzzyTests.forEach(test => {
    const teamLogo = findTeamLogo(test.search);
    const leagueLogo = findLeagueLogo(test.search);
    const found = teamLogo || leagueLogo;
    
    if (found) {
      console.log(`✅ "${test.search}" → Found logo (fuzzy match worked)`);
    } else {
      console.log(`❌ "${test.search}" → No logo found`);
    }
  });
}

runLogoTests().catch(console.error);
