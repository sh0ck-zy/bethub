// Direct sync script - bypasses provider registry issues
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function directSyncToday() {
  console.log('🚀 Direct sync of today\'s matches...');
  
  try {
    const today = new Date().toISOString().split('T')[0];
    console.log(`📅 Syncing matches for ${today}`);
    
    // Fetch from Sports DB
    console.log('📡 Fetching from The Sports DB...');
    const response = await fetch(`https://www.thesportsdb.com/api/v1/json/3/eventsday.php?d=${today}&s=Soccer`);
    
    if (!response.ok) {
      throw new Error(`Sports DB failed: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`✅ Found ${data.events?.length || 0} matches`);
    
    if (!data.events || data.events.length === 0) {
      console.log('📅 No matches found for today');
      return;
    }
    
    // Transform matches to our format
    const matchesToInsert = data.events.map(match => {
      const statusMap = {
        'Match Finished': 'FT',
        'Not Started': 'PRE',
        'Live': 'LIVE',
        'Postponed': 'POSTPONED',
        'Cancelled': 'CANCELLED',
      };
      
      return {
        id: randomUUID(), // Generate proper UUID
        league: match.strLeague || 'Unknown League',
        home_team: match.strHomeTeam,
        away_team: match.strAwayTeam,
        kickoff_utc: match.strTime && match.strTime.includes('+') 
          ? `${match.dateEvent}T${match.strTime.replace('+00:00', '')}.000Z`
          : `${match.dateEvent}T${match.strTime || '00:00:00'}.000Z`,
        status: statusMap[match.strStatus] || 'PRE',
        home_score: match.intHomeScore ? parseInt(match.intHomeScore) : null,
        away_score: match.intAwayScore ? parseInt(match.intAwayScore) : null,
        // venue: match.strVenue || null, // Skip venue field
        is_published: true,
        analysis_status: 'none',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    });
    
    console.log('🔄 Inserting matches into database...');
    console.log('📊 Matches to insert:');
    matchesToInsert.forEach((match, i) => {
      console.log(`  ${i + 1}. ${match.home_team} vs ${match.away_team}`);
      console.log(`     🏆 ${match.league}`);
      console.log(`     📊 Status: ${match.status}`);
      console.log(`     ⚽ Score: ${match.home_score || '?'}-${match.away_score || '?'}`);
      console.log('');
    });
    
    // Insert into database with upsert to handle duplicates
    const { data: insertResult, error } = await supabase
      .from('matches')
      .upsert(matchesToInsert, { 
        onConflict: 'id',
        ignoreDuplicates: false 
      })
      .select();
    
    if (error) {
      console.error('❌ Database error:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      return;
    }
    
    console.log(`✅ Successfully synced ${matchesToInsert.length} matches to database!`);
    console.log('🎉 Real live matches are now in your database!');
    
    // Verify by fetching from database
    console.log('\n🔍 Verifying data in database...');
    const { data: dbMatches, error: fetchError } = await supabase
      .from('matches')
      .select('id, league, home_team, away_team, status, home_score, away_score')
      .eq('is_published', true)
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (fetchError) {
      console.error('❌ Fetch error:', fetchError);
    } else {
      console.log(`📊 Latest ${dbMatches.length} matches in database:`);
      dbMatches.forEach((match, i) => {
        console.log(`  ${i + 1}. ${match.home_team} vs ${match.away_team}`);
        console.log(`     🏆 ${match.league}`);
        console.log(`     📊 ${match.status} | ⚽ ${match.home_score || '?'}-${match.away_score || '?'}`);
        console.log('');
      });
    }
    
  } catch (error) {
    console.error('❌ Direct sync failed:', error.message);
  }
}

directSyncToday().catch(console.error); 