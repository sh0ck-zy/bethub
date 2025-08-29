import { createClient } from '@supabase/supabase-js';

// Minimal test to sync matches
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const footballDataKey = 'b38396013e374847b4f0094198291358';

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fetchAndSyncMatches() {
  console.log('Fetching matches from Football-Data.org...');
  
  // Get matches for next 7 days
  const today = new Date();
  const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
  
  const dateFrom = today.toISOString().split('T')[0];
  const dateTo = nextWeek.toISOString().split('T')[0];
  
  try {
    const response = await fetch(
      `https://api.football-data.org/v4/matches?dateFrom=${dateFrom}&dateTo=${dateTo}`,
      {
        headers: {
          'X-Auth-Token': footballDataKey
        }
      }
    );
    
    const data = await response.json();
    console.log(`Found ${data.matches?.length || 0} matches`);
    
    if (!data.matches || data.matches.length === 0) {
      console.log('No matches found in the next 7 days');
      return;
    }
    
    // Insert first few matches into database
    const matchesToInsert = data.matches.slice(0, 10).map(match => ({
      id: crypto.randomUUID(),
      external_id: match.id.toString(),
      data_source: 'football-data',
      league: match.competition.name,
      home_team: match.homeTeam.name,
      away_team: match.awayTeam.name,
      kickoff_utc: match.utcDate,
      status: mapStatus(match.status),
      venue: match.venue || null,
      home_score: match.score?.fullTime?.home || null,
      away_score: match.score?.fullTime?.away || null,
      is_published: true,
      competition_id: match.competition.id.toString(),
      season: match.season.currentMatchday?.toString() || null
    }));
    
    console.log('Inserting matches into database...');
    const { data: inserted, error } = await supabase
      .from('matches')
      .upsert(matchesToInsert, { 
        onConflict: 'external_id,data_source',
        ignoreDuplicates: false 
      })
      .select();
    
    if (error) {
      console.error('Database error:', error);
    } else {
      console.log(`Successfully synced ${matchesToInsert.length} matches`);
    }
    
  } catch (error) {
    console.error('Sync error:', error);
  }
}

function mapStatus(status) {
  switch (status) {
    case 'SCHEDULED': return 'PRE';
    case 'LIVE': 
    case 'IN_PLAY': 
    case 'PAUSED': return 'LIVE';
    case 'FINISHED': return 'FT';
    case 'POSTPONED': return 'POSTPONED';
    case 'CANCELLED': return 'CANCELLED';
    default: return 'PRE';
  }
}

fetchAndSyncMatches();