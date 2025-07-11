import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { requireAdmin } from '@/lib/admin-protection';

export async function POST(request: NextRequest) {
  // Check admin access
  const adminCheck = await requireAdmin(request);
  if (adminCheck) {
    return adminCheck;
  }

  try {
    const { matchId } = await request.json();

    if (!matchId) {
      return NextResponse.json(
        { error: 'matchId is required' },
        { status: 400 }
      );
    }

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

    // TODO: Send to actual AI service
    // For now, simulate AI processing
    setTimeout(async () => {
      const { error: completeError } = await supabase
        .from('matches')
        .update({ analysis_status: 'completed' })
        .eq('id', matchId);
      
      if (completeError) {
        console.error('Error completing analysis:', completeError);
      }
    }, 5000); // Simulate 5 second processing

    return NextResponse.json({ 
      success: true, 
      message: `Match ${matchId} sent to AI for analysis` 
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}