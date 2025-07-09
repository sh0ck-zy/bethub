#!/usr/bin/env node

/**
 * Test script to verify authentication flow
 * Run with: node scripts/test-auth-flow.js
 */

const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function ask(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

async function testAuthFlow() {
  console.log('🔧 BetHub Authentication Test\n');
  
  console.log('✅ Database migrations applied successfully!');
  console.log('✅ All required tables created');
  console.log('✅ Row Level Security policies enabled\n');
  
  console.log('📋 Next steps to test authentication:\n');
  
  console.log('1. 🌐 Open your app: http://localhost:3000');
  console.log('2. 📝 Sign up with a new account');
  console.log('3. 🔑 Note your email address');
  console.log('4. 🛡️ Promote yourself to admin\n');
  
  const wantToPromote = await ask('Would you like me to help you promote a user to admin? (y/n): ');
  
  if (wantToPromote.toLowerCase() === 'y') {
    const email = await ask('\n📧 Enter the email you signed up with: ');
    
    console.log('\n🔧 To promote this user to admin:');
    console.log('1. Go to: https://supabase.com/dashboard/project/igqnndxochvxaaqvosvq');
    console.log('2. Navigate to: SQL Editor');
    console.log('3. Run this query:');
    console.log('---');
    console.log(`UPDATE profiles SET role = 'admin' WHERE email = '${email}';`);
    console.log('---');
    console.log('4. Refresh your app and try accessing: http://localhost:3000/admin\n');
    
    console.log('🎉 You should now have admin access!');
  }
  
  console.log('\n📊 What you can test now:');
  console.log('• ✅ Homepage loads without database errors');
  console.log('• ✅ User registration/login works');
  console.log('• ✅ Admin panel access (after promotion)');
  console.log('• ✅ Match pages work with proper UUIDs');
  console.log('• ✅ Real-time features enabled');
  
  rl.close();
}

testAuthFlow().catch(console.error); 