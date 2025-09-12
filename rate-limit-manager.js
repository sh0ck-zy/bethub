// Rate Limit Manager for Football API
// Shows how to avoid hitting the 10 requests/day limit

class FootballAPIManager {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://api.football-data.org/v4';
    this.requestCount = 0;
    this.lastRequestTime = null;
    this.cache = new Map(); // Simple in-memory cache
  }

  // Check if we have cached data that's still fresh
  getCached(key, maxAgeMinutes = 60) {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    const age = (Date.now() - cached.timestamp) / (1000 * 60);
    if (age > maxAgeMinutes) {
      this.cache.delete(key);
      return null;
    }
    
    console.log(`✅ Using cached data (${Math.round(age)} minutes old)`);
    return cached.data;
  }

  // Store data in cache
  setCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  // Make a request with rate limit protection
  async makeRequest(endpoint, useCache = true) {
    const cacheKey = endpoint;
    
    // Try cache first
    if (useCache) {
      const cached = this.getCached(cacheKey);
      if (cached) return cached;
    }

    // Check daily limit
    if (this.requestCount >= 10) {
      throw new Error('🚫 Daily limit reached (10 requests). Try again tomorrow.');
    }

    // Check minute limit (wait if needed)
    if (this.lastRequestTime) {
      const timeSince = Date.now() - this.lastRequestTime;
      const waitTime = 6000 - timeSince; // 6 seconds between requests = 10/minute max
      
      if (waitTime > 0) {
        console.log(`⏳ Waiting ${Math.round(waitTime/1000)}s to avoid rate limit...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }

    console.log(`📤 Making API request #${this.requestCount + 1}/10: ${endpoint}`);
    
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      headers: { 'X-Auth-Token': this.apiKey }
    });

    this.requestCount++;
    this.lastRequestTime = Date.now();

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Cache the response
    if (useCache) {
      this.setCache(cacheKey, data);
    }
    
    console.log(`📥 Response received. Remaining today: ${10 - this.requestCount}`);
    return data;
  }

  // EFFICIENT: Get all matches for a week in ONE request
  async getWeekMatches() {
    const today = new Date();
    const weekLater = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    const dateFrom = today.toISOString().split('T')[0];
    const dateTo = weekLater.toISOString().split('T')[0];
    
    const endpoint = `/matches?dateFrom=${dateFrom}&dateTo=${dateTo}`;
    return await this.makeRequest(endpoint);
  }

  // EFFICIENT: Get all major competitions in ONE request
  async getAllCompetitions() {
    return await this.makeRequest('/competitions');
  }

  // EFFICIENT: Get all teams from Premier League in ONE request
  async getPremierLeagueTeams() {
    return await this.makeRequest('/competitions/PL/teams');
  }

  // Show current status
  getStatus() {
    return {
      requestsUsed: this.requestCount,
      requestsRemaining: 10 - this.requestCount,
      cacheSize: this.cache.size,
      canMakeRequest: this.requestCount < 10
    };
  }
}

// DEMO: Smart request strategy
async function demonstrateSmartStrategy() {
  const manager = new FootballAPIManager('b38396013e374847b4f0094198291358');
  
  console.log('🎯 SMART STRATEGY DEMO\n');
  
  try {
    // Strategy 1: Get a week's worth of data in ONE request
    console.log('📊 Strategy 1: Batch requests');
    const weekMatches = await manager.getWeekMatches();
    console.log(`Got ${weekMatches.matches.length} matches for 7 days\n`);
    
    // Strategy 2: Cache works - try getting same data again
    console.log('📊 Strategy 2: Use cache');
    const cachedMatches = await manager.getWeekMatches(); // This will use cache
    console.log('Same data retrieved from cache\n');
    
    // Strategy 3: Get team data efficiently
    console.log('📊 Strategy 3: Get team data efficiently');
    const teams = await manager.getPremierLeagueTeams();
    console.log(`Got ${teams.teams.length} team details in one request\n`);
    
    // Show final status
    const status = manager.getStatus();
    console.log('📊 FINAL STATUS:');
    console.log(`Requests used: ${status.requestsUsed}/10`);
    console.log(`Requests remaining: ${status.requestsRemaining}`);
    console.log(`Cache entries: ${status.cacheSize}`);
    
    console.log('\n✅ RESULT: Got massive amounts of data using only 2 API requests!');
    console.log('💡 Without batching, this would have taken 10+ requests');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// DEMO: What happens when you hit limits
async function demonstrateLimits() {
  console.log('\n🚫 LIMIT DEMO\n');
  
  const manager = new FootballAPIManager('b38396013e374847b4f0094198291358');
  // Simulate having used 9 requests already
  manager.requestCount = 9;
  
  try {
    console.log('Simulating: Already used 9/10 requests today');
    
    // This should work (last request)
    console.log('Making request #10 (should work)...');
    const data = await manager.makeRequest('/competitions', false);
    console.log('✅ Request #10 succeeded');
    
    // This should fail (over limit)
    console.log('Making request #11 (should fail)...');
    await manager.makeRequest('/matches', false);
    
  } catch (error) {
    console.log('✅ Correctly blocked:', error.message);
  }
}

// Run the demonstrations
async function runDemo() {
  await demonstrateSmartStrategy();
  await demonstrateLimits();
  
  console.log('\n🎯 KEY TAKEAWAYS:');
  console.log('1. ONE request = ONE count against your daily 10');
  console.log('2. Batch requests: Get 7 days of matches instead of 1 day');
  console.log('3. Cache responses: Don\'t request same data twice');
  console.log('4. With smart batching, 10 requests can get you WEEKS of data');
  console.log('5. Rate limiting prevents you from burning through requests too fast');
}

runDemo();