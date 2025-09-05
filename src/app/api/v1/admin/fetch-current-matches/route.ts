import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseServer();
    const apiKey = process.env.FOOTBALL_DATA_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({
        success: false,
        error: 'Football Data API key not configured'
      }, { status: 500 });
    }
    
    console.log('⚽ Fetching current season matches...');
    
    // Get current date and next 14 days
    const today = new Date();
    const twoWeeksLater = new Date(today);
    twoWeeksLater.setDate(today.getDate() + 14);
    
    const dateFrom = today.toISOString().split('T')[0];
    const dateTo = twoWeeksLater.toISOString().split('T')[0];
    
    console.log(`📅 Searching for matches from ${dateFrom} to ${dateTo}`);
    
    // Major European competitions
    const competitions = ['PL', 'PD', 'BL1', 'SA', 'FL1', 'CL', 'EL'];
    let allMatches: any[] = [];
    
    for (const comp of competitions) {
      try {
        const url = `https://api.football-data.org/v4/competitions/${comp}/matches?dateFrom=${dateFrom}&dateTo=${dateTo}`;
        
        console.log(`🔍 Fetching ${comp}...`);
        
        const response = await fetch(url, {
          headers: {
            'X-Auth-Token': apiKey
          },
          signal: AbortSignal.timeout(15000) // 15 second timeout
        });
        
        if (!response.ok) {
          console.warn(`⚠️  ${comp}: ${response.status} ${response.statusText}`);
          continue;
        }
        
        const data = await response.json();
        
        if (data.matches && data.matches.length > 0) {
          console.log(`✅ ${comp}: Found ${data.matches.length} matches`);
          allMatches.push(...data.matches.slice(0, 10)); // Limit to 10 per competition
        } else {
          console.log(`📭 ${comp}: No matches found`);
        }
        
        // Rate limiting - Football-data.org allows 10 requests per minute
        await new Promise(resolve => setTimeout(resolve, 6500));
        
      } catch (error) {
        console.warn(`❌ Error fetching ${comp}:`, error instanceof Error ? error.message : error);
      }
    }
    
    if (allMatches.length === 0) {
      // If no upcoming matches, get recent finished matches for demo
      console.log('📝 No upcoming matches found, fetching recent finished matches for demo...');
      
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 7);
      const lastWeek = yesterday.toISOString().split('T')[0];
      
      try {
        const response = await fetch(
          `https://api.football-data.org/v4/competitions/PL/matches?dateFrom=${lastWeek}&dateTo=${dateFrom}`,
          {
            headers: { 'X-Auth-Token': apiKey },
            signal: AbortSignal.timeout(15000)
          }
        );
        
        if (response.ok) {
          const data = await response.json();
          if (data.matches && data.matches.length > 0) {
            allMatches = data.matches.slice(-8); // Get last 8 matches
            console.log(`✅ Found ${allMatches.length} recent matches for demo`);
          }
        }
      } catch (error) {
        console.warn('Error fetching recent matches:', error);
      }
    }
    
    if (allMatches.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'No matches found in the current timeframe',
        data: { matches_found: 0 }
      });
    }
    
    // Transform matches for database (include ALL fields - no data loss!)
    const transformedMatches = allMatches.map(match => ({
      external_id: match.id?.toString(),
      data_source: 'football-data',
      league: match.competition?.name || 'Unknown League',
      home_team: match.homeTeam?.name || 'TBD',
      away_team: match.awayTeam?.name || 'TBD',
      home_team_id: match.homeTeam?.id?.toString(),
      away_team_id: match.awayTeam?.id?.toString(),
      league_id: match.competition?.id?.toString(),
      kickoff_utc: match.utcDate,
      venue: match.venue,
      status: mapStatus(match.status),
      home_score: match.score?.fullTime?.home || null,
      away_score: match.score?.fullTime?.away || null,
      current_minute: match.minute || null,
      
      // CRITICAL: Include logo fields that were missing!
      home_team_logo: match.homeTeam?.crest,
      away_team_logo: match.awayTeam?.crest,
      league_logo: match.competition?.emblem,
      
      // Workflow states
      is_published: false, // KEEP HIDDEN until admin manually publishes
      is_pulled: true,
      is_analyzed: false,
      analysis_status: 'none',
      analysis_priority: 'normal',
      
      // Metadata
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: 'current-season-api'
    }));
    
    console.log(`💾 Upserting ${transformedMatches.length} matches to database...`);
    
    // Upsert to database
    const { data: upserted, error } = await supabase
      .from('matches')
      .upsert(transformedMatches, {
        onConflict: 'external_id,data_source',
        ignoreDuplicates: false
      })
      .select('id, home_team, away_team, league, kickoff_utc, status');
    
    if (error) {
      console.error('Upsert error:', error);
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 500 });
    }
    
    console.log(`✅ Successfully upserted ${upserted?.length || 0} matches`);
    
    // Show sample of what was added
    if (upserted && upserted.length > 0) {
      console.log('Sample matches:');
      upserted.slice(0, 3).forEach((match, i) => {
        console.log(`  ${i + 1}. ${match.home_team} vs ${match.away_team} (${match.league}) - ${match.status}`);
      });
      if (upserted.length > 3) {
        console.log(`  ... and ${upserted.length - 3} more`);
      }
    }
    
    return NextResponse.json({
      success: true,
      message: `Successfully fetched ${upserted?.length || 0} current matches`,
      data: {
        matches_fetched: allMatches.length,
        matches_upserted: upserted?.length || 0,
        date_range: { from: dateFrom, to: dateTo },
        sample_matches: upserted?.slice(0, 5) || []
      }
    });
    
  } catch (error) {
    console.error('Fetch current matches error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch matches'
    }, { status: 500 });
  }
}

function mapStatus(status: string): string {
  const statusMap: { [key: string]: string } = {
    'SCHEDULED': 'PRE',
    'TIMED': 'PRE',
    'IN_PLAY': 'LIVE',
    'PAUSED': 'LIVE',
    'FINISHED': 'FT',
    'AWARDED': 'FT',
    'POSTPONED': 'POSTPONED',
    'CANCELLED': 'POSTPONED',
    'SUSPENDED': 'POSTPONED'
  };
  
  return statusMap[status] || 'PRE';
}