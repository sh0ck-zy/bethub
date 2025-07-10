// Test the FootballDataProvider directly
import { FootballDataProvider } from './src/lib/providers/football-data.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function testProvider() {
  console.log('🧪 Testing FootballDataProvider directly...');
  console.log('🔑 API Key:', process.env.FOOTBALL_DATA_API_KEY ? 'Found ✅' : 'Missing ❌');
  
  const provider = new FootballDataProvider();
  
  try {
    console.log('📅 Testing getMatches for 2024-12-15...');
    const matches = await provider.getMatches(new Date('2024-12-15'));
    
    console.log(`🎯 Result: Found ${matches.length} matches`);
    if (matches.length > 0) {
      console.log('📊 Sample match:', {
        id: matches[0].id,
        league: matches[0].league,
        home_team: matches[0].home_team,
        away_team: matches[0].away_team,
        status: matches[0].status,
        home_score: matches[0].home_score,
        away_score: matches[0].away_score,
      });
    }
    
  } catch (error) {
    console.error('❌ Provider test failed:', error.message);
  }
}

testProvider().catch(console.error); 