import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const footballDataKey = process.env.FOOTBALL_DATA_API_KEY || 'b38396013e374847b4f0094198291358';

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    console.log('🔄 Admin: Starting match fetch and ingestion...');
    
    // Get matches for next 14 days (wider range for admin)
    const today = new Date();
    const twoWeeksLater = new Date(today);
    twoWeeksLater.setDate(today.getDate() + 14);
    
    const dateFrom = today.toISOString().split('T')[0];
    const dateTo = twoWeeksLater.toISOString().split('T')[0];
    
    console.log(`📅 Fetching matches from ${dateFrom} to ${dateTo}`);
    
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
    console.log(`📊 Found ${data.matches?.length || 0} matches from API`);
    
    if (!data.matches || data.matches.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          matches_upserted: 0,
          matches_found: 0,
          message: 'No matches found in the date range'
        }
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
      home_team_logo: match.homeTeam.crest,
      away_team_logo: match.awayTeam.crest,
      league_logo: match.competition.emblem,
      kickoff_utc: match.utcDate,
      status: mapStatus(match.status),
      venue: match.venue || null,
      referee: match.referees?.[0]?.name || null, // First referee name
      home_score: match.score?.fullTime?.home || null,
      away_score: match.score?.fullTime?.away || null,
      is_published: false, // Admin can review before publishing
      is_pulled: true,
      is_analyzed: false,
      analysis_status: 'none',
      competition_id: match.competition.id.toString(),
      season: new Date(match.utcDate).getFullYear().toString(), // Extract year from match date
      matchday: match.matchday || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));
    
    console.log(`💾 Upserting ${matchesToInsert.length} matches to database...`);
    
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
    
    console.log(`✅ Successfully ingested ${matchesToInsert.length} matches`);
    
    return NextResponse.json({
      success: true,
      data: {
        matches_upserted: matchesToInsert.length,
        matches_found: data.matches.length,
        message: `Successfully ingested ${matchesToInsert.length} matches from Football-Data.org`
      }
    });
    
  } catch (error) {
    console.error('❌ Admin fetch error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

function mapStatus(status: string): string {
  switch (status) {
    case 'SCHEDULED':
    case 'TIMED':
      return 'PRE';
    case 'IN_PLAY':
    case 'PAUSED':
      return 'LIVE';
    case 'FINISHED':
      return 'FT';
    case 'POSTPONED':
    case 'SUSPENDED':
      return 'POSTPONED';
    case 'CANCELLED':
      return 'CANCELLED';
    default:
      return 'PRE';
  }
}