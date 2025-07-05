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

    // Check admin authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authorization required' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Verify the auth token and check admin role
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
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