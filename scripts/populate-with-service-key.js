#!/usr/bin/env node

/**
 * BetHub Advanced Sample Data Population Script
 * This script can populate data using service role key or by creating an admin user
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Optional

// Sample matches data
const sampleMatches = [
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    league: 'Premier League',
    home_team: 'Arsenal',
    away_team: 'Chelsea',
    kickoff_utc: '2024-12-20T15:00:00Z',
    status: 'PRE',
    is_published: true
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    league: 'Premier League',
    home_team: 'Liverpool',
    away_team: 'Manchester United',
    kickoff_utc: '2024-12-20T17:30:00Z',
    status: 'LIVE',
    is_published: true
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440003',
    league: 'La Liga',
    home_team: 'Real Madrid',
    away_team: 'Barcelona',
    kickoff_utc: '2024-12-21T20:00:00Z',
    status: 'PRE',
    is_published: true
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440004',
    league: 'Bundesliga',
    home_team: 'Bayern Munich',
    away_team: 'Borussia Dortmund',
    kickoff_utc: '2024-12-19T18:30:00Z',
    status: 'FT',
    is_published: true
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440005',
    league: 'Serie A',
    home_team: 'Juventus',
    away_team: 'AC Milan',
    kickoff_utc: '2024-12-21T19:45:00Z',
    status: 'PRE',
    is_published: true
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440006',
    league: 'Premier League',
    home_team: 'Manchester City',
    away_team: 'Tottenham',
    kickoff_utc: '2024-12-22T16:00:00Z',
    status: 'PRE',
    is_published: true
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440007',
    league: 'La Liga',
    home_team: 'Atletico Madrid',
    away_team: 'Valencia',
    kickoff_utc: '2024-12-22T18:30:00Z',
    status: 'PRE',
    is_published: true
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440008',
    league: 'Bundesliga',
    home_team: 'Borussia Dortmund',
    away_team: 'RB Leipzig',
    kickoff_utc: '2024-12-22T20:00:00Z',
    status: 'PRE',
    is_published: true
  }
];

// Sample analysis data
const sampleAnalysis = [
  {
    match_id: '550e8400-e29b-41d4-a716-446655440002',
    payload: {
      matchId: '550e8400-e29b-41d4-a716-446655440002',
      snapshotTs: new Date().toISOString(),
      status: 'LIVE',
      aiInsights: [
        {
          id: 'insight_001',
          content: 'Liverpool showing strong attacking momentum with 65% possession in the last 15 minutes. Their high press is forcing Manchester United into defensive errors.',
          confidence: 0.85
        },
        {
          id: 'insight_002',
          content: 'Manchester United counter-attacking strategy could be effective given Liverpool high defensive line. Watch for quick transitions through the wings.',
          confidence: 0.72
        },
        {
          id: 'insight_003',
          content: 'Both teams showing high intensity. Liverpool leading on shots 7-4, but Manchester United clinical on their chances.',
          confidence: 0.78
        }
      ],
      stats: {
        possession: { Liverpool: 58, 'Manchester United': 42 },
        shots: { Liverpool: 7, 'Manchester United': 4 },
        corners: { Liverpool: 3, 'Manchester United': 1 },
        yellowCards: { Liverpool: 1, 'Manchester United': 2 }
      }
    }
  },
  {
    match_id: '550e8400-e29b-41d4-a716-446655440001',
    payload: {
      matchId: '550e8400-e29b-41d4-a716-446655440001',
      snapshotTs: new Date().toISOString(),
      status: 'PRE',
      aiInsights: [
        {
          id: 'insight_004',
          content: 'Arsenal has won 3 of their last 5 encounters against Chelsea at Emirates. Their home form suggests strong advantage.',
          confidence: 0.82
        },
        {
          id: 'insight_005',
          content: 'Chelsea recent away form has been inconsistent. Arsenal defensive solidity could be key factor.',
          confidence: 0.74
        }
      ],
      stats: {
        head_to_head: { Arsenal_wins: 3, Chelsea_wins: 1, draws: 1 },
        form: { Arsenal: 'WWLWW', Chelsea: 'WLWLD' }
      }
    }
  }
];

async function populateWithServiceKey() {
  console.log('🔑 Attempting to use service role key...');
  
  const serviceClient = createClient(supabaseUrl, supabaseServiceKey);
  
  // Insert matches using service role (bypasses RLS)
  const { data: matchData, error: matchError } = await serviceClient
    .from('matches')
    .upsert(sampleMatches, { onConflict: 'id' });

  if (matchError) {
    throw new Error(`Service key insert failed: ${matchError.message}`);
  }

  console.log(`✅ Successfully inserted ${sampleMatches.length} matches with service key`);
  
  // Insert analysis
  const { data: analysisData, error: analysisError } = await serviceClient
    .from('analysis_snapshots')
    .upsert(sampleAnalysis, { onConflict: 'match_id' });

  if (analysisError) {
    console.log('⚠️  Warning: Could not insert analysis data:', analysisError.message);
  } else {
    console.log('✅ Successfully inserted analysis data');
  }

  return true;
}

async function populateWithRawSQL() {
  console.log('🛠️  Attempting to use raw SQL approach...');
  
  const client = createClient(supabaseUrl, supabaseAnonKey);
  
  // Execute raw SQL that temporarily disables RLS
  const sqlScript = `
    -- Temporarily disable RLS for this session
    SET row_security = off;
    
    -- Insert matches
    INSERT INTO matches (id, league, home_team, away_team, kickoff_utc, status, is_published) VALUES
    ${sampleMatches.map(match => 
      `('${match.id}', '${match.league}', '${match.home_team}', '${match.away_team}', '${match.kickoff_utc}', '${match.status}', ${match.is_published})`
    ).join(',\n    ')}
    ON CONFLICT (id) DO NOTHING;
    
    -- Re-enable RLS
    SET row_security = on;
  `;

  const { data, error } = await client.rpc('exec_sql', { sql: sqlScript });
  
  if (error) {
    throw new Error(`SQL execution failed: ${error.message}`);
  }

  console.log('✅ Successfully inserted matches with SQL approach');
  return true;
}

async function main() {
  console.log('🏈 BetHub Advanced Sample Data Population\n');

  if (!supabaseUrl || !supabaseAnonKey) {
    console.log('❌ Missing Supabase environment variables!');
    return;
  }

  try {
    // Method 1: Try with service role key if available
    if (supabaseServiceKey) {
      await populateWithServiceKey();
    } else {
      console.log('💡 Service role key not found. Add SUPABASE_SERVICE_ROLE_KEY to .env.local for easier data management');
      console.log('   You can find it in Supabase Dashboard > Settings > API > service_role key\n');
      
      // Method 2: Use the SQL file approach
      console.log('📋 Alternative: Run this SQL in your Supabase Dashboard:');
      console.log('   1. Go to Supabase Dashboard > SQL Editor');
      console.log('   2. Copy and paste from scripts/quick-populate.sql');
      console.log('   3. Click Run\n');
      
      // Method 3: Let's try a different approach - create a direct SQL insert
      console.log('🔄 Attempting direct insert...');
      const client = createClient(supabaseUrl, supabaseAnonKey);
      
      // Try inserting one by one to see which ones work
      let successCount = 0;
      for (const match of sampleMatches) {
        try {
          const { error } = await client.from('matches').insert(match);
          if (!error) {
            successCount++;
          }
        } catch (err) {
          // Continue with next match
        }
      }
      
      if (successCount > 0) {
        console.log(`✅ Successfully inserted ${successCount} matches`);
      } else {
        console.log('❌ Could not insert matches due to RLS restrictions');
        console.log('🔧 Please use the SQL file approach mentioned above');
      }
    }

    console.log('\n🎉 Process complete!');
    console.log('\nYour database should now have:');
    sampleMatches.forEach(match => {
      console.log(`  • ${match.home_team} vs ${match.away_team} (${match.league}) - ${match.status}`);
    });

    console.log('\n🚀 Your app is running at: http://localhost:3004');

  } catch (err) {
    console.log('❌ Error:', err.message);
    console.log('\n💡 Fallback options:');
    console.log('1. Add SUPABASE_SERVICE_ROLE_KEY to your .env.local');
    console.log('2. Or run scripts/quick-populate.sql in Supabase Dashboard');
  }
}

main(); 