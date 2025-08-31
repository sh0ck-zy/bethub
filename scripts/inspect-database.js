#!/usr/bin/env node

/**
 * Database Inspection Script for BetHub
 * 
 * This script inspects the database structure and provides insights about:
 * - Table schemas
 * - Data counts
 * - External API integrations
 * - Current data state
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function inspectDatabase() {
  console.log('🔍 BetHub Database Inspection Report');
  console.log('=====================================\n');

  try {
    // 1. Check database connection
    console.log('1. Database Connection Test');
    console.log('----------------------------');
    
    const { data: healthData, error: healthError } = await supabase
      .from('matches')
      .select('count', { count: 'exact', head: true });
    
    if (healthError) {
      console.error('❌ Database connection failed:', healthError.message);
      return;
    }
    console.log('✅ Database connection successful\n');

    // 2. Inspect table schemas
    console.log('2. Table Schemas');
    console.log('----------------');
    
    const tables = ['matches', 'teams', 'leagues', 'profiles', 'analysis_snapshots'];
    
    for (const table of tables) {
      try {
        const { data: schemaData, error: schemaError } = await supabase
          .from(table)
          .select('*')
          .limit(1);
        
        if (schemaError) {
          console.log(`❌ ${table}: ${schemaError.message}`);
        } else {
          console.log(`✅ ${table}: Table accessible`);
        }
      } catch (error) {
        console.log(`❌ ${table}: ${error.message}`);
      }
    }
    console.log('');

    // 3. Data counts and statistics
    console.log('3. Data Statistics');
    console.log('------------------');
    
    // Matches count by status
    const { data: matchStats, error: matchError } = await supabase
      .from('matches')
      .select('status, is_published, analysis_status, data_source');
    
    if (!matchError && matchStats) {
      const totalMatches = matchStats.length;
      const publishedMatches = matchStats.filter(m => m.is_published).length;
      const analyzedMatches = matchStats.filter(m => m.analysis_status === 'completed').length;
      const pendingAnalysis = matchStats.filter(m => m.analysis_status === 'pending').length;
      
      console.log(`📊 Total matches: ${totalMatches}`);
      console.log(`✅ Published matches: ${publishedMatches}`);
      console.log(`🤖 Analyzed matches: ${analyzedMatches}`);
      console.log(`⏳ Pending analysis: ${pendingAnalysis}`);
      
      // Status breakdown
      const statusCounts = {};
      matchStats.forEach(match => {
        statusCounts[match.status] = (statusCounts[match.status] || 0) + 1;
      });
      
      console.log('\n📈 Match Status Breakdown:');
      Object.entries(statusCounts).forEach(([status, count]) => {
        console.log(`   ${status}: ${count}`);
      });
      
      // Data source breakdown
      const sourceCounts = {};
      matchStats.forEach(match => {
        sourceCounts[match.data_source || 'unknown'] = (sourceCounts[match.data_source || 'unknown'] || 0) + 1;
      });
      
      console.log('\n🌐 Data Source Breakdown:');
      Object.entries(sourceCounts).forEach(([source, count]) => {
        console.log(`   ${source}: ${count}`);
      });
    }
    console.log('');

    // 4. Teams and Leagues data
    console.log('4. Teams and Leagues');
    console.log('----------------------');
    
    const { data: teams, error: teamsError } = await supabase
      .from('teams')
      .select('count', { count: 'exact', head: true });
    
    const { data: leagues, error: leaguesError } = await supabase
      .from('leagues')
      .select('count', { count: 'exact', head: true });
    
    if (!teamsError) {
      console.log(`🏟️  Total teams: ${teams}`);
    }
    
    if (!leaguesError) {
      console.log(`🏆 Total leagues: ${leagues}`);
    }
    console.log('');

    // 5. External API Integration Status
    console.log('5. External API Integration Status');
    console.log('-----------------------------------');
    
    const externalAPIs = [
      { name: 'Football-Data.org', env: 'FOOTBALL_DATA_API_KEY' },
      { name: 'API-Sports', env: 'API_SPORTS_KEY' },
      { name: 'TheSportsDB', env: 'THESPORTSDB_API_KEY' },
      { name: 'Unsplash', env: 'UNSPLASH_ACCESS_KEY' }
    ];
    
    externalAPIs.forEach(api => {
      const hasKey = process.env[api.env];
      console.log(`${hasKey ? '✅' : '❌'} ${api.name}: ${hasKey ? 'Configured' : 'Not configured'}`);
    });
    console.log('');

    // 6. Sample data inspection
    console.log('6. Sample Data Inspection');
    console.log('---------------------------');
    
    const { data: sampleMatches, error: sampleError } = await supabase
      .from('matches')
      .select('*')
      .limit(3);
    
    if (!sampleError && sampleMatches && sampleMatches.length > 0) {
      console.log('📋 Sample Match Data:');
      sampleMatches.forEach((match, index) => {
        console.log(`\n   Match ${index + 1}:`);
        console.log(`   - ID: ${match.id}`);
        console.log(`   - Teams: ${match.home_team} vs ${match.away_team}`);
        console.log(`   - League: ${match.league}`);
        console.log(`   - Status: ${match.status}`);
        console.log(`   - Published: ${match.is_published}`);
        console.log(`   - Analysis: ${match.analysis_status}`);
        console.log(`   - Source: ${match.data_source}`);
      });
    } else {
      console.log('❌ No sample data available');
    }
    console.log('');

    // 7. Recommendations
    console.log('7. Recommendations');
    console.log('-------------------');
    
    if (matchStats && matchStats.length === 0) {
      console.log('🚨 CRITICAL: No matches in database');
      console.log('   → Run data sync to populate matches');
      console.log('   → Check external API configurations');
    }
    
    if (matchStats && matchStats.filter(m => m.is_published).length === 0) {
      console.log('⚠️  WARNING: No published matches');
      console.log('   → Use admin panel to publish matches');
      console.log('   → Ensure analysis workflow is complete');
    }
    
    if (matchStats && matchStats.filter(m => m.analysis_status === 'pending').length > 0) {
      console.log('⏳ INFO: Matches pending analysis');
      console.log('   → Trigger AI analysis for pending matches');
    }
    
    if (!process.env.FOOTBALL_DATA_API_KEY) {
      console.log('🔑 INFO: Football-Data API key not configured');
      console.log('   → Add FOOTBALL_DATA_API_KEY to environment');
      console.log('   → System will use dummy data until configured');
    }

  } catch (error) {
    console.error('❌ Database inspection failed:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Run the inspection
inspectDatabase()
  .then(() => {
    console.log('\n✅ Database inspection completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database inspection failed:', error);
    process.exit(1);
  });
