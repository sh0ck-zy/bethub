import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { matchId, isPublished } = await request.json();

    if (!matchId || typeof isPublished !== 'boolean') {
      return NextResponse.json(
        { error: 'matchId and isPublished are required' },
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
      console.warn('Supabase not configured, simulating success');
      return NextResponse.json({ 
        success: true, 
        message: `Match ${matchId} ${isPublished ? 'published' : 'unpublished'} successfully` 
      });
    }

    // Update match publish status
    const { error } = await supabase
      .from('matches')
      .update({ is_published: isPublished })
      .eq('id', matchId);

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: `Match ${matchId} ${isPublished ? 'published' : 'unpublished'} successfully` 
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}