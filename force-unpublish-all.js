// Force unpublish ALL matches for clean testing

async function forceUnpublishAll() {
  console.log('🔧 FORCE UNPUBLISHING ALL MATCHES\n');
  
  const baseUrl = 'http://localhost:3001';
  
  try {
    // Get ALL matches (admin view)
    const adminResponse = await fetch(`${baseUrl}/api/v1/matches?admin=true`);
    const adminResult = await adminResponse.json();
    
    console.log(`📊 Total matches found: ${adminResult.matches.length}`);
    
    const allMatchIds = adminResult.matches.map(m => m.id);
    
    // Unpublish ALL matches
    const unpublishResponse = await fetch(`${baseUrl}/api/v1/matches`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'unpublish',
        matchIds: allMatchIds
      })
    });
    
    const unpublishResult = await unpublishResponse.json();
    
    console.log('📝 Force unpublish result:');
    console.log(`   Total requested: ${allMatchIds.length}`);
    console.log(`   Matches updated: ${unpublishResult.data.matches_updated}`);
    
    if (unpublishResult.data.errors && unpublishResult.data.errors.length > 0) {
      console.log(`   Errors: ${unpublishResult.data.errors.length}`);
    }
    
    // Verify public view shows no matches
    const publicResponse = await fetch(`${baseUrl}/api/v1/matches`);
    const publicResult = await publicResponse.json();
    
    console.log(`\n👥 Public view now shows: ${publicResult.metadata.total} matches`);
    
    if (publicResult.metadata.total === 0) {
      console.log('✅ SUCCESS: Clean slate achieved!');
      console.log('🎯 Ready for proper clean flow testing!');
      console.log('\nNow run: node test-clean-flow.js');
    } else {
      console.log('⚠️ Still some visible matches, checking what went wrong...');
      
      // Show first few visible matches for debugging
      if (publicResult.matches.length > 0) {
        console.log('\nStill visible matches:');
        publicResult.matches.slice(0, 3).forEach((match, i) => {
          console.log(`   ${i + 1}. ${match.home_team} vs ${match.away_team} (published: ${match.is_published})`);
        });
      }
    }
    
  } catch (error) {
    console.error('❌ Force unpublish failed:', error.message);
  }
}

forceUnpublishAll();