import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;

  const { data: match, error: matchError } = await supabase
    .from('matches')
    .select('*')
    .eq('id', id)
    .single();

  if (matchError) {
    return NextResponse.json({ error: matchError.message }, { status: 500 });
  }

  const { data: latestSnapshot, error: snapshotError } = await supabase
    .from('analysis_snapshots')
    .select('*')
    .eq('match_id', id)
    .order('snapshot_ts', { ascending: false })
    .limit(1)
    .single();

  if (snapshotError) {
    // It's possible there are no snapshots yet, so don't return an error for that.
    console.error('Error fetching latest snapshot:', snapshotError.message);
  }

  return NextResponse.json({ match, latestSnapshot });
}


