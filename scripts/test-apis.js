#!/usr/bin/env node

/**
 * API Testing Script for BetHub
 * 
 * This script tests all available API endpoints to verify:
 * - API availability and responses
 * - Data consistency
 * - External API integrations
 * - Authentication requirements
 */

import fetch from 'node-fetch';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const BASE_URL = 'http://localhost:3000';
const NEWS_API_URL = 'http://localhost:8000';

// Test configuration
const TEST_CONFIG = {
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'User-Agent': 'BetHub-API-Tester/1.0'
  }
};

// Test results storage
const testResults = {
  passed: 0,
  failed: 0,
  skipped: 0,
  details: []
};

function logResult(endpoint, status, message, response = null) {
  const result = {
    endpoint,
    status,
    message,
    response: response ? {
      status: response.status,
      statusText: response.statusText,
      data: response.data || null
    } : null,
    timestamp: new Date().toISOString()
  };
  
  testResults.details.push(result);
  
  if (status === 'PASS') {
    testResults.passed++;
    console.log(`✅ ${endpoint}: ${message}`);
  } else if (status === 'FAIL') {
    testResults.failed++;
    console.log(`❌ ${endpoint}: ${message}`);
  } else {
    testResults.skipped++;
    console.log(`⏭️  ${endpoint}: ${message}`);
  }
}

async function testEndpoint(url, options = {}) {
  try {
    const response = await fetch(url, {
      ...TEST_CONFIG,
      ...options
    });
    
    let data = null;
    try {
      data = await response.json();
    } catch (e) {
      // Response might not be JSON
    }
    
    return {
      ok: response.ok,
      status: response.status,
      statusText: response.statusText,
      data,
      headers: Object.fromEntries(response.headers.entries())
    };
  } catch (error) {
    return {
      ok: false,
      status: 0,
      statusText: error.message,
      data: null,
      error: error.message
    };
  }
}

async function testHealthEndpoints() {
  console.log('\n🏥 Testing Health Endpoints');
  console.log('============================');
  
  // Test Next.js health endpoint
  const healthResponse = await testEndpoint(`${BASE_URL}/api/v1/health`);
  if (healthResponse.ok && healthResponse.data?.status === 'ok') {
    logResult('/api/v1/health', 'PASS', 'Health check successful', healthResponse);
    
    // Log system information
    if (healthResponse.data) {
      console.log(`   📊 System: ${healthResponse.data.version}`);
      console.log(`   🌍 Environment: ${healthResponse.data.environment}`);
      console.log(`   ⏱️  Uptime: ${Math.round(healthResponse.data.uptime / 60)} minutes`);
      console.log(`   💾 Memory: ${healthResponse.data.memory?.used || 'N/A'}MB / ${healthResponse.data.memory?.total || 'N/A'}MB`);
    }
  } else {
    logResult('/api/v1/health', 'FAIL', `Health check failed: ${healthResponse.status} ${healthResponse.statusText}`, healthResponse);
  }
  
  // Test test endpoint
  const testResponse = await testEndpoint(`${BASE_URL}/api/v1/test`);
  if (testResponse.ok && testResponse.data?.success) {
    logResult('/api/v1/test', 'PASS', 'Test endpoint working', testResponse);
  } else {
    logResult('/api/v1/test', 'FAIL', `Test endpoint failed: ${testResponse.status} ${testResponse.statusText}`, testResponse);
  }
}

async function testMatchEndpoints() {
  console.log('\n⚽ Testing Match Endpoints');
  console.log('===========================');
  
  // Test today's matches endpoint
  const todayResponse = await testEndpoint(`${BASE_URL}/api/v1/today`);
  if (todayResponse.ok) {
    logResult('/api/v1/today', 'PASS', 'Today endpoint working', todayResponse);
    
    if (todayResponse.data?.matches) {
      console.log(`   📅 Found ${todayResponse.data.matches.length} matches`);
      console.log(`   📊 Total: ${todayResponse.data.total}`);
      console.log(`   🏷️  Source: ${todayResponse.data.source}`);
      
      if (todayResponse.data.spotlight_match) {
        console.log(`   ⭐ Spotlight: ${todayResponse.data.spotlight_match.home_team} vs ${todayResponse.data.spotlight_match.away_team}`);
      }
    }
  } else {
    logResult('/api/v1/today', 'FAIL', `Today endpoint failed: ${todayResponse.status} ${todayResponse.statusText}`, todayResponse);
  }
  
  // Test admin matches endpoint (without auth - should fail)
  const adminResponse = await testEndpoint(`${BASE_URL}/api/v1/admin/matches`);
  if (adminResponse.status === 401 || adminResponse.status === 403) {
    logResult('/api/v1/admin/matches', 'PASS', 'Admin endpoint properly protected', adminResponse);
  } else {
    logResult('/api/v1/admin/matches', 'FAIL', `Admin endpoint not properly protected: ${adminResponse.status}`, adminResponse);
  }
}

async function testExternalAPIEndpoints() {
  console.log('\n🌐 Testing External API Endpoints');
  console.log('===================================');
  
  // Test external APIs status endpoint
  const externalStatusResponse = await testEndpoint(`${BASE_URL}/api/v1/external-apis/status`);
  if (externalStatusResponse.ok) {
    logResult('/api/v1/external-apis/status', 'PASS', 'External APIs status endpoint working', externalStatusResponse);
    
    if (externalStatusResponse.data?.apis) {
      const apis = externalStatusResponse.data.apis;
      console.log('   🔌 External APIs Status:');
      
      Object.entries(apis).forEach(([name, api]) => {
        const status = api.configured ? '✅' : '❌';
        console.log(`      ${status} ${name}: ${api.status} - ${api.message}`);
      });
    }
  } else {
    logResult('/api/v1/external-apis/status', 'FAIL', `External APIs status failed: ${externalStatusResponse.status}`, externalStatusResponse);
  }
  
  // Test sync endpoint (without auth - should fail)
  const syncResponse = await testEndpoint(`${BASE_URL}/api/v1/sync/pull-matches`, {
    method: 'POST',
    body: JSON.stringify({
      competitions: ['PL', 'PD'],
      date_range: {
        from: '2024-12-19',
        to: '2024-12-26'
      }
    })
  });
  
  if (syncResponse.status === 401 || syncResponse.status === 403) {
    logResult('/api/v1/sync/pull-matches', 'PASS', 'Sync endpoint properly protected', syncResponse);
  } else {
    logResult('/api/v1/sync/pull-matches', 'FAIL', `Sync endpoint not properly protected: ${syncResponse.status}`, syncResponse);
  }
}

async function testTeamsAndLeaguesEndpoints() {
  console.log('\n🏟️  Testing Teams & Leagues Endpoints');
  console.log('=======================================');
  
  // Test teams endpoint
  const teamsResponse = await testEndpoint(`${BASE_URL}/api/v1/teams`);
  if (teamsResponse.ok) {
    logResult('/api/v1/teams', 'PASS', 'Teams endpoint working', teamsResponse);
    
    if (teamsResponse.data?.teams) {
      console.log(`   🏟️  Found ${teamsResponse.data.teams.length} teams`);
      console.log(`   📊 Total: ${teamsResponse.data.total}`);
    } else {
      console.log(`   ⚠️  No teams data returned`);
    }
  } else {
    logResult('/api/v1/teams', 'FAIL', `Teams endpoint failed: ${teamsResponse.status}`, teamsResponse);
  }
  
  // Test leagues endpoint
  const leaguesResponse = await testEndpoint(`${BASE_URL}/api/v1/leagues`);
  if (leaguesResponse.ok) {
    logResult('/api/v1/leagues', 'PASS', 'Leagues endpoint working', leaguesResponse);
    
    if (leaguesResponse.data?.leagues) {
      console.log(`   🏆 Found ${leaguesResponse.data.leagues.length} leagues`);
      console.log(`   📊 Total: ${leaguesResponse.data.total}`);
    } else {
      console.log(`   ⚠️  No leagues data returned`);
    }
  } else {
    logResult('/api/v1/leagues', 'FAIL', `Leagues endpoint failed: ${leaguesResponse.status}`, leaguesResponse);
  }
}

async function testNewsAggregatorEndpoints() {
  console.log('\n📰 Testing News Aggregator Endpoints');
  console.log('=====================================');
  
  // Test news aggregator status
  const newsStatusResponse = await testEndpoint(`${NEWS_API_URL}/api/v1/status`);
  if (newsStatusResponse.ok) {
    logResult('News Aggregator Status', 'PASS', 'News API working', newsStatusResponse);
  } else {
    logResult('News Aggregator Status', 'SKIP', `News API not available: ${newsStatusResponse.status}`, newsStatusResponse);
  }
  
  // Test news aggregator health
  const newsHealthResponse = await testEndpoint(`${NEWS_API_URL}/api/v1/health/aggregator`);
  if (newsHealthResponse.ok) {
    logResult('News Aggregator Health', 'PASS', 'News API health check working', newsHealthResponse);
  } else {
    logResult('News Aggregator Health', 'SKIP', `News API health check not available: ${newsHealthResponse.status}`, newsHealthResponse);
  }
}

async function testPaymentEndpoints() {
  console.log('\n💳 Testing Payment Endpoints');
  console.log('==============================');
  
  // Test payment checkout endpoint (without auth - should fail)
  const checkoutResponse = await testEndpoint(`${BASE_URL}/api/payments/checkout`, {
    method: 'POST',
    body: JSON.stringify({
      priceId: 'price_test_123',
      successUrl: 'http://localhost:3000/success',
      cancelUrl: 'http://localhost:3000/cancel'
    })
  });
  
  if (checkoutResponse.status === 401 || checkoutResponse.status === 403) {
    logResult('/api/payments/checkout', 'PASS', 'Payment endpoint properly protected', checkoutResponse);
  } else {
    logResult('/api/payments/checkout', 'FAIL', `Payment endpoint not properly protected: ${checkoutResponse.status}`, checkoutResponse);
  }
}

async function runAllTests() {
  console.log('🧪 BetHub API Testing Suite');
  console.log('============================');
  console.log(`🔗 Base URL: ${BASE_URL}`);
  console.log(`📰 News API URL: ${NEWS_API_URL}`);
  console.log(`⏰ Started at: ${new Date().toISOString()}\n`);
  
  try {
    await testHealthEndpoints();
    await testMatchEndpoints();
    await testExternalAPIEndpoints();
    await testTeamsAndLeaguesEndpoints();
    await testNewsAggregatorEndpoints();
    await testPaymentEndpoints();
    
  } catch (error) {
    console.error('❌ Test suite failed:', error.message);
  }
  
  // Print summary
  console.log('\n📊 Test Results Summary');
  console.log('========================');
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`⏭️  Skipped: ${testResults.skipped}`);
  console.log(`📈 Success Rate: ${Math.round((testResults.passed / (testResults.passed + testResults.failed)) * 100)}%`);
  
  // Print failed tests details
  if (testResults.failed > 0) {
    console.log('\n❌ Failed Tests Details:');
    testResults.details
      .filter(r => r.status === 'FAIL')
      .forEach(result => {
        console.log(`   ${result.endpoint}: ${result.message}`);
      });
  }
  
  // Print recommendations
  console.log('\n💡 Recommendations:');
  if (testResults.failed === 0) {
    console.log('   🎉 All critical endpoints are working!');
  } else {
    console.log('   🔧 Fix failed endpoints before proceeding');
  }
  
  if (testResults.skipped > 0) {
    console.log('   ⚠️  Some services are not available (check if they are running)');
  }
  
  console.log(`\n⏰ Completed at: ${new Date().toISOString()}`);
  
  return testResults.failed === 0;
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllTests()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('❌ Test suite crashed:', error);
      process.exit(1);
    });
}

export { runAllTests, testResults };



