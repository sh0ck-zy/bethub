// Emergency fix - unpublish ALL matches directly via Supabase client

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://igqnndxochvxaaqvosvq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlncW5uZHhvY2h2eGFhcXZvc3ZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxMTY0MTYsImV4cCI6MjA2NTY5MjQxNn0.TBH1fQNM1smo60ph9mlbnH24sQAR0VnEhH1a_vZVoW8';

async function emergencyUnpublishAll() {
  console.log('🚨 EMERGENCY: UNPUBLISHING ALL MATCHES DIRECTLY\n');
  
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Direct database update - unpublish ALL matches
    console.log('🔧 Updating database directly...');
    
    const { data, error, count } = await supabase
      .from('matches')
      .update({ 
        is_published: false,
        updated_at: new Date().toISOString()
      })
      .not('id', 'is', null) // Matches all records
      .select('id', { count: 'exact' });
    
    if (error) {
      throw new Error(`Database update failed: ${error.message}`);
    }
    
    console.log(`✅ Updated ${count} matches to unpublished`);
    
    // Verify with direct count query
    const { count: publishedCount, error: countError } = await supabase
      .from('matches')
      .select('id', { count: 'exact' })
      .eq('is_published', true);
    
    if (countError) {
      console.log('⚠️ Could not verify count:', countError.message);
    } else {
      console.log(`📊 Remaining published matches: ${publishedCount}`);
    }
    
    // Test the main page endpoint
    console.log('\n🧪 Testing main page endpoint...');
    
    const response = await fetch('http://localhost:3001/api/v1/today');
    const result = await response.json();
    
    console.log(`📋 Main page now shows: ${result.matches?.length || 0} matches`);
    console.log(`💬 Message: ${result.message}`);
    
    if (result.matches?.length === 0) {
      console.log('\n🎉 SUCCESS: Main page shows NO matches!');
      console.log('✅ Users cannot see any matches until admin publishes them');
      console.log('🎯 The flow is now working correctly');
    } else {
      console.log('\n❌ STILL BROKEN: Main page still shows matches');
      console.log('🔧 Need to investigate further');
    }
    
  } catch (error) {
    console.error('❌ Emergency fix failed:', error.message);
  }
}

emergencyUnpublishAll();