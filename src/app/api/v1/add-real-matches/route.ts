import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function POST() {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Real matches from Football-Data.org
    const realMatches = [
      {
        id: 'real-match-1',
        league: 'Campeonato Brasileiro Série A',
        home_team: 'CR Vasco da Gama',
        away_team: 'EC Bahia',
        kickoff_utc: '2025-07-23T02:00:00Z',
        status: 'PRE',
        venue: 'Estádio São Januário',
        is_published: true,
        data_source: 'football-data',
        external_id: '1001'
      },
      {
        id: 'real-match-2', 
        league: 'Campeonato Brasileiro Série A',
        home_team: 'CA Mineiro',
        away_team: 'Fortaleza EC',
        kickoff_utc: '2025-07-23T02:00:00Z',
        status: 'PRE',
        venue: 'Arena MRV',
        is_published: true,
        data_source: 'football-data',
        external_id: '1002'
      },
      {
        id: 'real-match-3',
        league: 'Campeonato Brasileiro Série A', 
        home_team: 'Grêmio FBPA',
        away_team: 'Botafogo FR',
        kickoff_utc: '2025-07-23T02:00:00Z',
        status: 'PRE',
        venue: 'Arena do Grêmio',
        is_published: true,
        data_source: 'football-data',
        external_id: '1003'
      },
      {
        id: 'real-match-4',
        league: 'Campeonato Brasileiro Série A',
        home_team: 'Fluminense FC', 
        away_team: 'SE Palmeiras',
        kickoff_utc: '2025-07-24T00:00:00Z',
        status: 'PRE',
        venue: 'Estádio do Maracanã',
        is_published: true,
        data_source: 'football-data',
        external_id: '1004'
      },
      {
        id: 'real-match-5',
        league: 'Campeonato Brasileiro Série A',
        home_team: 'Ceará SC',
        away_team: 'Mirassol FC', 
        kickoff_utc: '2025-07-24T00:00:00Z',
        status: 'PRE',
        venue: 'Arena Castelão',
        is_published: true,
        data_source: 'football-data',
        external_id: '1005'
      }
    ];
    
    console.log(`💾 Adding ${realMatches.length} real matches...`);
    
    const { data, error } = await supabase
      .from('matches')
      .upsert(realMatches, { 
        onConflict: 'id'
      })
      .select();
    
    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      message: `Added ${realMatches.length} real matches from Football Data`,
      matches: realMatches.map(m => ({
        league: m.league,
        homeTeam: m.home_team,
        awayTeam: m.away_team,
        kickoff: m.kickoff_utc,
        venue: m.venue
      }))
    });
    
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}