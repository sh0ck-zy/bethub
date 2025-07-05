import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { matchId } = await request.json();

    if (!matchId) {
      return NextResponse.json(
        { error: 'matchId is required' },
        { status: 400 }
      );
    }

    // TODO: Add admin authentication check
    // const adminAuth = request.headers.get('x-admin-auth');
    // if (!adminAuth) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.warn('Supabase not configured, simulating AI trigger');
      return NextResponse.json({ 
        success: true, 
        message: `Match ${matchId} sent to AI for analysis` 
      });
    }

    // First, get the match data
    const { data: matchData, error: matchError } = await supabase
      .from('matches')
      .select('*')
      .eq('id', matchId)
      .single();

    if (matchError || !matchData) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 });
    }

    // Update match analysis status to pending
    const { error: updateError } = await supabase
      .from('matches')
      .update({ analysis_status: 'pending' })
      .eq('id', matchId);

    if (updateError) {
      console.error('Error updating match status:', updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // TODO: Send match data to AI agent
    // This would be where you trigger your AI agent to analyze the match
    // For now, we'll just simulate it
    
    /*
    Example AI agent trigger:
    
    const aiAgentPayload = {
      matchId: matchData.id,
      homeTeam: matchData.home_team,
      awayTeam: matchData.away_team,
      league: matchData.league,
      kickoffTime: matchData.kickoff_utc,
      status: matchData.status
    };

    const aiResponse = await fetch(process.env.AI_AGENT_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.AI_AGENT_API_KEY}`
      },
      body: JSON.stringify(aiAgentPayload)
    });

    if (!aiResponse.ok) {
      // Revert status on failure
      await supabase
        .from('matches')
        .update({ analysis_status: 'failed' })
        .eq('id', matchId);
      
      return NextResponse.json({ error: 'Failed to trigger AI analysis' }, { status: 500 });
    }
    */

    return NextResponse.json({ 
      success: true, 
      message: `Match ${matchId} sent to AI for analysis`,
      match: matchData
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}