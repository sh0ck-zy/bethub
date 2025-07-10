#!/usr/bin/env node

/**
 * BetHub Sample Data Population Script
 * This script populates your database with sample matches and analysis data
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

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
          content: 'Liverpool is showing strong attacking momentum with 65% possession in the last 15 minutes. Their high press is forcing Manchester United into defensive errors.',
          confidence: 0.85
        },
        {
          id: 'insight_002',
          content: 'Manchester United\'s counter-attacking strategy could be effective given Liverpool\'s high defensive line. Watch for quick transitions through the wings.',
          confidence: 0.72
        }
      ],
      stats: {
        possession: { Liverpool: 58, 'Manchester United': 42 },
        shots: { Liverpool: 7, 'Manchester United': 4 },
        corners: { Liverpool: 3, 'Manchester United': 1 }
      }
    }
  }
];

async function main() {
  console.log('🏈 BetHub Sample Data Population\n');

  if (!supabaseUrl || !supabaseAnonKey) {
    console.log('❌ Missing Supabase environment variables!');
    console.log('Please create a .env.local file first.');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  try {
    console.log('📊 Populating matches...');
    
    // Insert sample matches
    const { data: matchData, error: matchError } = await supabase
      .from('matches')
      .upsert(sampleMatches, { onConflict: 'id' });

    if (matchError) {
      console.log('❌ Error inserting matches:', matchError.message);
      return;
    }

    console.log(`✅ Successfully inserted ${sampleMatches.length} matches`);

    // Insert sample analysis
    console.log('🧠 Populating analysis data...');
    
    const { data: analysisData, error: analysisError } = await supabase
      .from('analysis_snapshots')
      .insert(sampleAnalysis);

    if (analysisError) {
      console.log('⚠️  Warning: Could not insert analysis data:', analysisError.message);
    } else {
      console.log('✅ Successfully inserted analysis data');
    }

    console.log('\n🎉 Sample data population complete!');
    console.log('\nYour database now has:');
    sampleMatches.forEach(match => {
      console.log(`  • ${match.home_team} vs ${match.away_team} (${match.league}) - ${match.status}`);
    });

    console.log('\n🚀 You can now start your app: npm run dev');

  } catch (err) {
    console.log('❌ Error:', err.message);
  }
}

main(); 