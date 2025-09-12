#!/usr/bin/env node
/**
 * BetHub API Debug Script
 * Comprehensive testing of all API endpoints
 * Run with: node api_debug_script.js
 */

const BASE_URL = 'http://localhost:3000';
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✅${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}❌${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}⚠️${colors.reset} ${msg}`),
  header: (msg) => console.log(`\n${colors.bright}${colors.cyan}🚀 ${msg}${colors.reset}\n`),
};

class APITester {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      warnings: 0,
      tests: []
    };
  }

  async testEndpoint(name, url, options = {}) {
    const startTime = Date.now();
    
    try {
      log.info(`Testing ${name}...`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), options.timeout || 10000);
      
      const response = await fetch(`${BASE_URL}${url}`, {
        method: options.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        body: options.body ? JSON.stringify(options.body) : undefined,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      const responseTime = Date.now() - startTime;
      
      let data;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = { text: await response.text() };
      }
      
      const result = {
        name,
        url,
        status: response.status,
        ok: response.ok,
        responseTime,
        data,
        contentType
      };
      
      if (response.ok) {
        log.success(`${name} - ${response.status} (${responseTime}ms)`);
        this.results.passed++;
        
        // Additional validation
        if (options.validate) {
          const validation = options.validate(data, response);
          if (!validation.valid) {
            log.warn(`${name} - Validation warning: ${validation.message}`);
            this.results.warnings++;
          }
        }
      } else {
        log.error(`${name} - ${response.status} ${response.statusText} (${responseTime}ms)`);
        if (data.error) log.error(`  Error: ${data.error}`);
        this.results.failed++;
      }
      
      this.results.tests.push(result);
      return result;
      
    } catch (error) {
      const responseTime = Date.now() - startTime;
      log.error(`${name} - ${error.message} (${responseTime}ms)`);
      
      const result = {
        name,
        url,
        status: 0,
        ok: false,
        responseTime,
        error: error.message
      };
      
      this.results.failed++;
      this.results.tests.push(result);
      return result;
    }
  }

  async runTests() {
    log.header('BetHub API Debug Script');
    
    // Test 1: Health Check
    await this.testEndpoint(
      'Health Check',
      '/api/v1/health',
      {
        validate: (data) => ({
          valid: data.status === 'ok',
          message: data.status !== 'ok' ? `Expected status 'ok', got '${data.status}'` : ''
        })
      }
    );
    
    // Test 2: Database Connection
    await this.testEndpoint(
      'Database Test',
      '/api/v1/db-test',
      {
        validate: (data) => ({
          valid: data.success === true,
          message: !data.success ? data.error || 'Database test failed' : ''
        })
      }
    );
    
    // Test 3: Admin Matches
    await this.testEndpoint(
      'Admin Matches',
      '/api/v1/admin/matches',
      {
        validate: (data) => ({
          valid: Array.isArray(data.matches),
          message: !Array.isArray(data.matches) ? 'Expected matches to be an array' : ''
        })
      }
    );
    
    // Test 4: Today Matches
    await this.testEndpoint(
      'Today Matches',
      '/api/v1/today',
      {
        validate: (data) => ({
          valid: data.hasOwnProperty('matches'),
          message: !data.hasOwnProperty('matches') ? 'Expected matches property' : ''
        })
      }
    );
    
    // Test 5: Sync Matches (POST)
    await this.testEndpoint(
      'Sync Matches',
      '/api/v1/sync-matches',
      {
        method: 'POST',
        timeout: 15000,
        validate: (data) => ({
          valid: data.hasOwnProperty('success'),
          message: !data.hasOwnProperty('success') ? 'Expected success property' : ''
        })
      }
    );
    
    // Test 6: Test Real Data
    await this.testEndpoint(
      'Test Real Data',
      '/api/v1/test-real-data',
      {
        timeout: 15000,
        validate: (data) => ({
          valid: data.hasOwnProperty('success') || data.hasOwnProperty('status'),
          message: 'Expected success or status property'
        })
      }
    );
    
    // Test 7: Health with detailed info
    await this.testEndpoint(
      'Health Detailed',
      '/api/v1/health?detailed=true'
    );
    
    // Test 8: Admin Matches with filters
    await this.testEndpoint(
      'Admin Matches (Filtered)',
      '/api/v1/admin/matches?status=published&limit=10'
    );
    
    // Test 9: Admin Matches with pagination
    await this.testEndpoint(
      'Admin Matches (Paginated)',
      '/api/v1/admin/matches?page=1&limit=5'
    );
    
    this.printResults();
  }
  
  printResults() {
    log.header('Test Results Summary');
    
    const total = this.results.passed + this.results.failed;
    const successRate = total > 0 ? ((this.results.passed / total) * 100).toFixed(1) : 0;
    
    console.log(`${colors.green}✅ Passed: ${this.results.passed}${colors.reset}`);
    console.log(`${colors.red}❌ Failed: ${this.results.failed}${colors.reset}`);
    console.log(`${colors.yellow}⚠️  Warnings: ${this.results.warnings}${colors.reset}`);
    console.log(`${colors.cyan}📊 Success Rate: ${successRate}%${colors.reset}`);
    
    if (this.results.failed > 0) {
      log.header('Failed Tests Details');
      this.results.tests
        .filter(test => !test.ok)
        .forEach(test => {
          console.log(`${colors.red}❌ ${test.name}${colors.reset}`);
          console.log(`   URL: ${test.url}`);
          console.log(`   Status: ${test.status}`);
          if (test.error) console.log(`   Error: ${test.error}`);
          if (test.data && test.data.error) console.log(`   Response Error: ${test.data.error}`);
        });
    }
    
    if (this.results.warnings > 0) {
      log.header('Warnings');
      // Warnings are logged during validation
    }
    
    // Environment Check
    log.header('Environment Check');
    
    const envVars = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'FOOTBALL_DATA_API_KEY',
      'INTERNAL_API_KEY'
    ];
    
    envVars.forEach(varName => {
      const value = process.env[varName];
      if (value) {
        log.success(`${varName}: Set (${value.substring(0, 20)}...)`);
      } else {
        log.error(`${varName}: Not set`);
      }
    });
    
    // Database info from tests
    const dbTest = this.results.tests.find(t => t.name === 'Database Test');
    if (dbTest && dbTest.ok && dbTest.data.results) {
      log.header('Database Status');
      const { results } = dbTest.data;
      log.info(`Sample matches in DB: ${results.sample_matches?.length || 0}`);
      log.info(`Environment: ${results.environment}`);
      
      if (results.sample_matches && results.sample_matches.length > 0) {
        log.info('Sample matches:');
        results.sample_matches.forEach((match, i) => {
          console.log(`  ${i + 1}. ${match.home_team} vs ${match.away_team} (${match.league})`);
        });
      }
    }
    
    // Admin matches info
    const adminTest = this.results.tests.find(t => t.name === 'Admin Matches');
    if (adminTest && adminTest.ok && adminTest.data) {
      log.header('Admin API Status');
      log.info(`Total matches: ${adminTest.data.total || adminTest.data.matches?.length || 0}`);
      log.info(`Available leagues: ${adminTest.data.leagues?.length || 0}`);
      if (adminTest.data.leagues) {
        console.log(`  Leagues: ${adminTest.data.leagues.join(', ')}`);
      }
    }
    
    log.header('Recommendations');
    
    if (this.results.failed === 0) {
      log.success('All APIs are working correctly! 🎉');
      log.info('Your BetHub instance is ready for use.');
    } else {
      log.warn('Some APIs are not working. Check the failed tests above.');
      
      if (this.results.tests.some(t => t.name.includes('Admin') && !t.ok)) {
        log.info('💡 Admin panel may not work properly');
      }
      
      if (this.results.tests.some(t => t.name.includes('Sync') && !t.ok)) {
        log.info('💡 Match synchronization may not work');
      }
      
      if (this.results.tests.some(t => t.name.includes('Database') && !t.ok)) {
        log.info('💡 Database connection issues detected');
      }
    }
    
    console.log('\n');
  }
}

// Run the tests
const tester = new APITester();
tester.runTests().catch(console.error);