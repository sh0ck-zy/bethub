// Verification script to check BetHub setup
// Run with: node scripts/verify-setup.js

import fs from 'fs';
import path from 'path';

console.log('🔍 Verifying BetHub Setup...\n');

// Check 1: Required files exist
const requiredFiles = [
  'src/contexts/AuthContext.tsx',
  'src/lib/auth.ts',
  'src/lib/supabase.ts',
  'src/components/AuthModal.tsx',
  'src/app/admin/page.tsx',
  'src/app/admin/layout.tsx',
  'supabase/migrations/0001_initial_schema.sql',
  'supabase/migrations/0002_add_profiles_table.sql',
  'package.json'
];

console.log('1. Checking required files...');
let allFilesExist = true;

requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`   ✅ ${file}`);
  } else {
    console.log(`   ❌ ${file} - MISSING`);
    allFilesExist = false;
  }
});

// Check 2: Package.json dependencies
console.log('\n2. Checking dependencies...');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const requiredDeps = ['@supabase/supabase-js', 'next', 'react', 'react-dom'];
  
  requiredDeps.forEach(dep => {
    if (packageJson.dependencies?.[dep] || packageJson.devDependencies?.[dep]) {
      console.log(`   ✅ ${dep}`);
    } else {
      console.log(`   ❌ ${dep} - MISSING`);
      allFilesExist = false;
    }
  });
} catch (error) {
  console.log('   ❌ Could not read package.json');
  allFilesExist = false;
}

// Check 3: Environment file
console.log('\n3. Checking environment setup...');
if (fs.existsSync('.env.local')) {
  console.log('   ✅ .env.local exists');
  
  const envContent = fs.readFileSync('.env.local', 'utf8');
  if (envContent.includes('NEXT_PUBLIC_SUPABASE_URL')) {
    console.log('   ✅ NEXT_PUBLIC_SUPABASE_URL is set');
  } else {
    console.log('   ❌ NEXT_PUBLIC_SUPABASE_URL is missing');
  }
  
  if (envContent.includes('NEXT_PUBLIC_SUPABASE_ANON_KEY')) {
    console.log('   ✅ NEXT_PUBLIC_SUPABASE_ANON_KEY is set');
  } else {
    console.log('   ❌ NEXT_PUBLIC_SUPABASE_ANON_KEY is missing');
  }
} else {
  console.log('   ❌ .env.local does not exist');
  console.log('   💡 Create .env.local with your Supabase credentials');
}

// Check 4: Database migrations
console.log('\n4. Checking database migrations...');
const migrationsDir = 'supabase/migrations';
if (fs.existsSync(migrationsDir)) {
  const migrationFiles = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql'));
  console.log(`   ✅ Found ${migrationFiles.length} migration files`);
  
  migrationFiles.forEach(file => {
    console.log(`      - ${file}`);
  });
} else {
  console.log('   ❌ supabase/migrations directory not found');
}

// Summary
console.log('\n📋 Setup Summary:');
if (allFilesExist) {
  console.log('✅ All required files are present');
} else {
  console.log('❌ Some required files are missing');
}

console.log('\n🚀 Next Steps:');
console.log('1. Set up your Supabase project and add credentials to .env.local');
console.log('2. Run database migrations in your Supabase SQL editor');
console.log('3. Run: npm run dev');
console.log('4. Test the auth system at http://localhost:3000');
console.log('5. Promote a user to admin and test the admin panel');

console.log('\n📖 For detailed instructions, see SETUP.md'); 