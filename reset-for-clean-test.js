// Reset matches to unpublished state for clean flow testing

async function resetMatches() {
  console.log('🔄 RESETTING MATCHES FOR CLEAN FLOW TEST\n');
  
  const baseUrl = 'http://localhost:3001';
  
  try {
    // Get all matches in admin view
    const adminResponse = await fetch(`${baseUrl}/api/v1/matches?admin=true`);
    const adminResult = await adminResponse.json();
    
    const publishedMatches = adminResult.matches.filter(m => m.is_published);
    
    if (publishedMatches.length === 0) {
      console.log('✅ All matches already unpublished');
      return;
    }
    
    console.log(`📊 Found ${publishedMatches.length} published matches to unpublish`);
    
    // Unpublish all published matches
    const matchIds = publishedMatches.map(m => m.id);
    
    const unpublishResponse = await fetch(`${baseUrl}/api/v1/matches`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'unpublish',
        matchIds: matchIds
      })
    });
    
    const unpublishResult = await unpublishResponse.json();
    
    console.log('📝 Unpublish result:');
    console.log(`   Matches unpublished: ${unpublishResult.data.matches_updated}`);
    
    // Verify public view shows no matches
    const publicResponse = await fetch(`${baseUrl}/api/v1/matches`);
    const publicResult = await publicResponse.json();
    
    console.log(`👥 Public view now shows: ${publicResult.metadata.total} matches`);
    
    if (publicResult.metadata.total === 0) {
      console.log('✅ Reset successful: Users cannot see any matches');
      console.log('🎯 Ready for clean flow testing!');
    } else {
      console.log('⚠️ Some matches still visible to users');
    }
    
  } catch (error) {
    console.error('❌ Reset failed:', error.message);
  }
}

resetMatches();