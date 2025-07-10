#!/usr/bin/env node

/**
 * BetHub Database Setup Verification Script
 * This script checks your database connection and can populate it with sample data
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function main() {
  console.log('🔍 BetHub Database Setup Verification\n');

  // Check environment variables
  if (!supabaseUrl || !supabaseAnonKey) {
    console.log('❌ Missing Supabase environment variables!');
    console.log('Please create a .env.local file with:');
    console.log('NEXT_PUBLIC_SUPABASE_URL=your_supabase_url');
    console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key');
    return;
  }

  console.log('✅ Environment variables found');
  console.log(`📡 Connecting to: ${supabaseUrl}`);

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  try {
    // Test connection
    const { data, error } = await supabase.from('matches').select('count', { count: 'exact' });
    
    if (error) {
      console.log('❌ Database connection failed:', error.message);
      console.log('\n🔧 You need to run the database setup first:');
      console.log('1. Go to your Supabase project dashboard');
      console.log('2. Open the SQL Editor');
      console.log('3. Copy and paste the contents of scripts/setup-database.sql');
      console.log('4. Run the SQL script');
      return;
    }

    console.log('✅ Database connection successful');
    console.log(`📊 Current matches in database: ${data?.length || 0}`);

    // Check if database is empty
    const { data: matches } = await supabase.from('matches').select('*');
    
    if (!matches || matches.length === 0) {
      console.log('\n📝 Database is empty. Would you like to add sample data?');
      console.log('Run: node scripts/populate-sample-data.js');
    } else {
      console.log('\n✅ Database has data!');
      console.log('Sample matches:');
      matches.slice(0, 3).forEach(match => {
        console.log(`  • ${match.home_team} vs ${match.away_team} (${match.league})`);
      });
    }

    // Check for profiles table
    const { data: profiles, error: profilesError } = await supabase.from('profiles').select('count', { count: 'exact' });
    
    if (profilesError) {
      console.log('\n⚠️  Profiles table not found. Make sure to run the full setup script.');
    } else {
      console.log(`👥 Profiles in database: ${profiles?.length || 0}`);
    }

  } catch (err) {
    console.log('❌ Error:', err.message);
  }
}

main(); 