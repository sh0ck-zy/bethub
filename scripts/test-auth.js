// Simple test script to verify auth system
// Run with: node scripts/test-auth.js

import { createClient } from '@supabase/supabase-js';

// You'll need to set these environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables');
  console.log('Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testAuth() {
  console.log('🧪 Testing BetHub Auth System...\n');

  try {
    // Test 1: Check if profiles table exists
    console.log('1. Checking profiles table...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (profilesError) {
      console.error('❌ Profiles table error:', profilesError.message);
      console.log('💡 Make sure you\'ve run the database migrations');
      return;
    }
    console.log('✅ Profiles table exists');

    // Test 2: Check if matches table exists
    console.log('\n2. Checking matches table...');
    const { data: matches, error: matchesError } = await supabase
      .from('matches')
      .select('count')
      .limit(1);
    
    if (matchesError) {
      console.error('❌ Matches table error:', matchesError.message);
      console.log('💡 Make sure you\'ve run the database migrations');
      return;
    }
    console.log('✅ Matches table exists');

    // Test 3: Try to sign up a test user
    console.log('\n3. Testing user signup...');
    const testEmail = `test-${Date.now()}@example.com`;
    const testPassword = 'testpassword123';
    
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
    });

    if (signUpError) {
      console.error('❌ Signup error:', signUpError.message);
      return;
    }

    if (signUpData.user) {
      console.log('✅ User signup successful');
      console.log(`   User ID: ${signUpData.user.id}`);
      console.log(`   Email: ${signUpData.user.email}`);
      
      // Test 4: Check if profile was created
      console.log('\n4. Checking if profile was created...');
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', signUpData.user.id)
        .single();

      if (profileError) {
        console.error('❌ Profile fetch error:', profileError.message);
      } else {
        console.log('✅ Profile created automatically');
        console.log(`   Role: ${profile.role}`);
        console.log(`   Created: ${profile.created_at}`);
      }

      // Test 5: Try to sign in
      console.log('\n5. Testing user signin...');
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword,
      });

      if (signInError) {
        console.error('❌ Signin error:', signInError.message);
      } else {
        console.log('✅ User signin successful');
        console.log(`   Session token: ${signInData.session ? 'Present' : 'Missing'}`);
      }

      // Test 6: Promote to admin (for testing)
      console.log('\n6. Testing admin promotion...');
      const { error: promoteError } = await supabase
        .from('profiles')
        .update({ role: 'admin' })
        .eq('id', signUpData.user.id);

      if (promoteError) {
        console.error('❌ Admin promotion error:', promoteError.message);
      } else {
        console.log('✅ User promoted to admin');
        
        // Verify admin status
        const { data: adminProfile, error: adminError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', signUpData.user.id)
          .single();

        if (!adminError && adminProfile.role === 'admin') {
          console.log('✅ Admin role verified');
        }
      }

      // Test 7: Sign out
      console.log('\n7. Testing signout...');
      const { error: signOutError } = await supabase.auth.signOut();
      
      if (signOutError) {
        console.error('❌ Signout error:', signOutError.message);
      } else {
        console.log('✅ User signout successful');
      }

    } else {
      console.log('⚠️  Signup successful but no user returned (email confirmation required)');
    }

    console.log('\n🎉 Auth system test completed!');
    console.log('\n📝 Next steps:');
    console.log('1. Check your email for confirmation (if required)');
    console.log('2. Run the app with: npm run dev');
    console.log('3. Try logging in with the test credentials');
    console.log('4. Visit /admin to test admin panel');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAuth(); 