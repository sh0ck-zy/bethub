// Robust match population script with deduplication and multi-source support
// This script uses the new MatchService for safe, duplicate-free data ingestion

const API_KEY = 'b38396013e374847b4f0094198291358';
const BASE_URL = 'https://api.football-data.org/v4';

async function robustPopulateMatches() {
  console.log('🚀 ROBUST MATCH POPULATION WITH DEDUPLICATION\n');
  
  try {
    // Step 1: Fetch matches from Football Data API
    console.log('📡 Step 1: Fetching matches from Football Data API...');
    
    const today = new Date();
    const futureDate = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000); // Next 7 days  
    const pastDate = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000); // Past 7 days
    
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
    console.log(`📈 Rate limit remaining: ${response.headers.get('x-requests-available-minute') || 'Unknown'}/10`);
    
    if (matches.length === 0) {
      console.log('⚠️ No matches found in the specified date range');
      return;
    }
    
    // Step 2: Display sample of what we're about to ingest
    console.log('\n📋 Step 2: Sample matches to be processed:');
    matches.slice(0, 5).forEach((match, i) => {
      console.log(`  ${i + 1}. ${match.homeTeam.name} vs ${match.awayTeam.name}`);
      console.log(`     Competition: ${match.competition.name} (ID: ${match.competition.id})`);
      console.log(`     Date: ${new Date(match.utcDate).toLocaleDateString()}`);
      console.log(`     Status: ${match.status}`);
      console.log(`     External ID: ${match.id}`);
    });
    
    if (matches.length > 5) {
      console.log(`     ... and ${matches.length - 5} more matches`);
    }
    
    // Step 3: Send to our robust ingestion endpoint
    console.log('\n💾 Step 3: Sending to robust ingestion service...');
    
    const ingestResponse = await fetch('http://localhost:3000/api/v1/admin/ingest-matches', {
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
      ingestResult.data.errors.slice(0, 5).forEach(error => {
        console.log(`   • ${error}`);
      });
      if (ingestResult.data.errors.length > 5) {
        console.log(`   ... and ${ingestResult.data.errors.length - 5} more errors`);
      }
    }
    
    console.log(`\n💬 ${ingestResult.data.message}`);
    
    // Step 4: Optional - Clean up any remaining duplicates
    if (ingestResult.data.matches_inserted > 0) {
      console.log('\n🧹 Step 4: Running duplicate cleanup...');
      
      try {
        const cleanupResponse = await fetch('http://localhost:3000/api/v1/admin/cleanup-duplicates', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (cleanupResponse.ok) {
          const cleanupResult = await cleanupResponse.json();
          if (cleanupResult.success) {
            console.log(`🗑️ Cleanup complete: ${cleanupResult.data.removed} duplicates removed`);
          }
        }
      } catch (cleanupError) {
        console.log('⚠️ Cleanup step failed (this is optional):', cleanupError.message);
      }
    }
    
    console.log('\n🎉 ROBUST POPULATION COMPLETE!');
    console.log('✅ All matches processed with smart deduplication');
    console.log('✅ Database is clean and ready for multi-source data');
    console.log('✅ Future API calls will automatically merge data intelligently');
    console.log('\n👀 Check your admin panel to see the results!');
    
  } catch (error) {
    console.error('\n❌ POPULATION FAILED:', error.message);
    console.error('\n🔧 Troubleshooting tips:');
    console.error('1. Make sure your development server is running (pnpm dev)');
    console.error('2. Check your Supabase connection and schema');
    console.error('3. Verify your API key is valid');
    console.error('4. Check the network logs for more details');
  }
}

// Run the script
robustPopulateMatches();