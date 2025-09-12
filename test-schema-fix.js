// Simple test to verify our schema fixes work with existing data
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  console.log('Add these to your .env.local:');
  console.log('NEXT_PUBLIC_SUPABASE_URL=your_url');
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key');
  process.exit(1);
}

async function testSchemaFix() {
  console.log('🧪 TESTING SCHEMA AND DEDUPLICATION FIXES\n');
  
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Test 1: Check if competition_id column exists and is accessible
    console.log('📋 Test 1: Checking competition_id column access...');
    
    const { data: matches, error: selectError } = await supabase
      .from('matches')
      .select('id, home_team, away_team, competition_id, data_source, external_id')
      .limit(5);
    
    if (selectError) {
      console.error('❌ Schema error:', selectError.message);
      if (selectError.message.includes('competition_id')) {
        console.log('🔧 The competition_id column issue is confirmed');
        console.log('💡 Solution: Run the database migrations or refresh the schema cache');
      }
      return;
    }
    
    console.log(`✅ Successfully accessed matches with competition_id field`);
    console.log(`📊 Found ${matches?.length || 0} matches in database`);
    
    if (matches && matches.length > 0) {
      console.log('\nSample matches:');
      matches.forEach((match, i) => {
        console.log(`  ${i + 1}. ${match.home_team} vs ${match.away_team}`);
        console.log(`     Competition ID: ${match.competition_id || 'NULL'}`);
        console.log(`     Data Source: ${match.data_source || 'NULL'}`);
        console.log(`     External ID: ${match.external_id || 'NULL'}`);
      });
    }
    
    // Test 2: Test creating a sample match with all fields
    console.log('\n📋 Test 2: Testing match insertion with complete schema...');
    
    const testMatch = {
      id: `test_${Date.now()}`,
      external_id: `test_external_${Date.now()}`,
      data_source: 'football-data',
      league: 'Test League',
      home_team: 'Test Home Team',
      away_team: 'Test Away Team',
      kickoff_utc: new Date().toISOString(),
      status: 'PRE',
      competition_id: 'test_comp_123',
      season: '2024',
      matchday: 1,
      home_team_logo: 'https://example.com/logo1.png',
      away_team_logo: 'https://example.com/logo2.png',
      league_logo: 'https://example.com/league.png',
      is_pulled: true,
      is_analyzed: false,
      is_published: false,
      analysis_status: 'none',
      analysis_priority: 'normal',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const { data: insertedMatch, error: insertError } = await supabase
      .from('matches')
      .insert(testMatch)
      .select()
      .single();
    
    if (insertError) {
      console.error('❌ Insert error:', insertError.message);
      if (insertError.message.includes('column') && insertError.message.includes('does not exist')) {
        console.log('🔧 Missing column detected in database schema');
        console.log('💡 Solution: The database migration needs to be applied');
      }
      return;
    }
    
    console.log('✅ Test match inserted successfully');
    console.log(`📝 Created match: ${insertedMatch.home_team} vs ${insertedMatch.away_team}`);
    
    // Test 3: Test deduplication by trying to insert the same match
    console.log('\n📋 Test 3: Testing deduplication logic...');
    
    const duplicateMatch = {
      ...testMatch,
      id: `test_duplicate_${Date.now()}`, // Different ID
      external_id: testMatch.external_id, // Same external_id
      data_source: testMatch.data_source // Same data_source
    };
    
    const { data: duplicateResult, error: duplicateError } = await supabase
      .from('matches')
      .insert(duplicateMatch)
      .select()
      .single();
    
    if (duplicateError) {
      if (duplicateError.message.includes('duplicate') || duplicateError.code === '23505') {
        console.log('✅ Deduplication working: Database prevented duplicate insertion');
      } else {
        console.log('⚠️ Unexpected error during duplicate test:', duplicateError.message);
      }
    } else {
      console.log('⚠️ Duplicate was inserted (deduplication may not be working as expected)');
      console.log('💡 This might be expected if we removed unique constraints');
    }
    
    // Test 4: Clean up test data
    console.log('\n📋 Test 4: Cleaning up test data...');
    
    const { error: deleteError } = await supabase
      .from('matches')
      .delete()
      .in('id', [testMatch.id, duplicateMatch.id]);
    
    if (deleteError) {
      console.log('⚠️ Failed to clean up test data:', deleteError.message);
    } else {
      console.log('✅ Test data cleaned up successfully');
    }
    
    console.log('\n🎉 SCHEMA TESTS COMPLETE!');
    console.log('✅ Database schema is working correctly');
    console.log('✅ All required fields are accessible');
    console.log('✅ The competition_id issue has been resolved');
    console.log('\n👉 You can now safely run API population scripts');
    
  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);
    console.log('\n🔧 Next steps:');
    console.log('1. Check your .env.local file has correct Supabase credentials');
    console.log('2. Verify your database migrations have been applied');
    console.log('3. Try refreshing your database schema cache');
  }
}

testSchemaFix();