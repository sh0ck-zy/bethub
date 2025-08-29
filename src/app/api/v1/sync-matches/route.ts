import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const footballDataKey = process.env.FOOTBALL_DATA_API_KEY || 'b38396013e374847b4f0094198291358';

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    console.log('🔄 Starting match sync...');
    
    // Get matches for next 7 days
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    const dateFrom = today.toISOString().split('T')[0];
    const dateTo = nextWeek.toISOString().split('T')[0];
    
    // Fetch from Football-Data.org
    const response = await fetch(
      `https://api.football-data.org/v4/matches?dateFrom=${dateFrom}&dateTo=${dateTo}`,
      {
        headers: {
          'X-Auth-Token': footballDataKey
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`Football-Data API error: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`📊 Found ${data.matches?.length || 0} matches`);
    
    if (!data.matches || data.matches.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No matches found',
        synced: 0
      });
    }
    
    // Transform matches for database
    const matchesToInsert = data.matches.map((match: any) => ({
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
    
    console.log(`💾 Inserting ${matchesToInsert.length} matches...`);
    
    // Insert into database with upsert to avoid duplicates
    const { data: inserted, error } = await supabase
      .from('matches')
      .upsert(matchesToInsert, { 
        onConflict: 'external_id,data_source',
        ignoreDuplicates: false 
      })
      .select();
    
    if (error) {
      console.error('❌ Database error:', error);
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 500 });
    }
    
    console.log(`✅ Successfully synced ${matchesToInsert.length} matches`);
    
    return NextResponse.json({
      success: true,
      message: `Successfully synced ${matchesToInsert.length} matches`,
      synced: matchesToInsert.length,
      matches: matchesToInsert.slice(0, 5).map(m => ({
        league: m.league,
        homeTeam: m.home_team,
        awayTeam: m.away_team,
        kickoff: m.kickoff_utc
      }))
    });
    
  } catch (error) {
    console.error('❌ Sync error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

function mapStatus(status: string): string {
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