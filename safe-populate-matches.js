// Safe match population that works with current database schema
// This script uses the fallback service that adapts to available columns

const API_KEY = 'b38396013e374847b4f0094198291358';
const BASE_URL = 'https://api.football-data.org/v4';

async function safePopulateMatches() {
  console.log('🛡️ SAFE MATCH POPULATION (SCHEMA-ADAPTIVE)\n');
  
  try {
    // Step 1: Verify what we're working with
    console.log('🔍 Step 1: Checking current database schema...');
    
    const schemaResponse = await fetch('http://localhost:3001/api/v1/admin/verify-schema');
    const schemaResult = await schemaResponse.json();
    
    if (schemaResult.success) {
      console.log('✅ Database schema is complete and ready');
      console.log('📊 Using full robust ingestion service');
      var useFullService = true;
    } else {
      console.log('⚠️ Database schema incomplete:', schemaResult.error);
      console.log('📊 Using fallback safe ingestion service');
      var useFullService = false;
    }
    
    // Step 2: Fetch matches from Football Data API
    console.log('\n📡 Step 2: Fetching matches from Football Data API...');
    
    const today = new Date();
    const futureDate = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    const pastDate = new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000);
    
    const dateFrom = pastDate.toISOString().split('T')[0];
    const dateTo = futureDate.toISOString().split('T')[0];
    
    console.log(`📅 Date range: ${dateFrom} to ${dateTo}`);
    
    const url = `${BASE_URL}/matches?dateFrom=${dateFrom}&dateTo=${dateTo}`;
    console.log(`🌐 API URL: ${url}`);
    
    const response = await fetch(url, {
      headers: {
        'X-Auth-Token': API_KEY,
        'User-Agent': 'BetHub/1.0 (contact@bethub.com)'
      }
    });
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    const matches = data.matches || [];
    
    console.log(`✅ Fetched ${matches.length} matches from API`);
    
    if (matches.length === 0) {
      console.log('⚠️ No matches found in the specified date range');
      return;
    }
    
    // Step 3: Show sample matches
    console.log('\n📋 Step 3: Sample matches to be processed:');
    matches.slice(0, 3).forEach((match, i) => {
      console.log(`  ${i + 1}. ${match.homeTeam.name} vs ${match.awayTeam.name}`);
      console.log(`     Competition: ${match.competition.name}`);
      console.log(`     Date: ${new Date(match.utcDate).toLocaleString()}`);
      console.log(`     Status: ${match.status}`);
    });
    
    // Step 4: Send to appropriate ingestion service
    const endpoint = useFullService 
      ? '/api/v1/admin/ingest-matches'
      : '/api/v1/admin/ingest-matches-safe';
    
    console.log(`\n💾 Step 4: Sending to ${useFullService ? 'robust' : 'safe fallback'} ingestion service...`);
    
    const ingestResponse = await fetch(`http://localhost:3001${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ matches })
    });
    
    if (!ingestResponse.ok) {
      const errorData = await ingestResponse.json();
      throw new Error(`Ingestion failed: ${ingestResponse.status} - ${errorData.error}`);
    }
    
    const ingestResult = await ingestResponse.json();
    
    console.log('\n📊 INGESTION RESULTS:');
    console.log(`✅ Total processed: ${ingestResult.data.total_processed}`);
    console.log(`🆕 Matches inserted: ${ingestResult.data.matches_inserted}`);
    console.log(`🔄 Matches updated: ${ingestResult.data.matches_updated}`);
    console.log(`⏭️ Matches skipped: ${ingestResult.data.matches_skipped}`);
    
    if (ingestResult.data.errors && ingestResult.data.errors.length > 0) {
      console.log(`❌ Errors encountered: ${ingestResult.data.errors.length}`);
      ingestResult.data.errors.slice(0, 3).forEach(error => {
        console.log(`   • ${error.substring(0, 100)}...`);
      });
    }
    
    if (ingestResult.note) {
      console.log(`💡 Note: ${ingestResult.note}`);
    }
    
    console.log(`\n💬 ${ingestResult.data.message}`);
    
    if (!useFullService) {
      console.log('\n🔧 TO ENABLE FULL FEATURES:');
      console.log('1. Run fix-matches-schema.sql in your Supabase SQL Editor');
      console.log('2. Verify with: curl http://localhost:3001/api/v1/admin/verify-schema');
      console.log('3. Re-run this script for full robust features');
    }
    
    console.log('\n🎉 SAFE POPULATION COMPLETE!');
    console.log('✅ Matches processed with available schema columns');
    console.log('✅ Basic deduplication applied (same teams + date)');
    console.log('✅ System is working with current database structure');
    
  } catch (error) {
    console.error('\n❌ SAFE POPULATION FAILED:', error.message);
    
    if (error.message.includes('400')) {
      console.log('\n🔧 Possible solutions:');
      console.log('1. Check if the date range has available matches');
      console.log('2. Verify your API key is valid');
      console.log('3. Try a different date range');
    } else {
      console.log('\n🔧 Troubleshooting tips:');
      console.log('1. Make sure your development server is running (pnpm dev)');
      console.log('2. Check your Supabase connection');
      console.log('3. Verify the server is accessible at localhost:3001');
    }
  }
}

// Run the script
safePopulateMatches();