import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  const apiKey = request.headers.get('x-api-key');

  // TODO (backend): Implement actual API key validation
  if (!apiKey || apiKey !== process.env.INTERNAL_API_KEY) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const payload = await request.json();

    // Validate payload against schema (TODO: Implement actual schema validation)
    // For now, we'll just assume the payload is valid based on the data contract.

    const { matchId, snapshotTs, status, aiInsights, stats } = payload;

    // Upsert match data (assuming matchId exists or needs to be created/updated)
    // TODO (backend): Handle match upsert logic more robustly if matchId doesn't exist in 'matches' table
    const { error: matchError } = await supabase
      .from('matches')
      .upsert({ id: matchId, status: status }, { onConflict: 'id' });

    if (matchError) {
      console.error('Error upserting match:', matchError);
      return NextResponse.json({ error: matchError.message }, { status: 500 });
    }

    const { error: snapshotError } = await supabase
      .from('analysis_snapshots')
      .insert({
        match_id: matchId,
        snapshot_ts: snapshotTs,
        payload: payload,
      });

    if (snapshotError) {
      console.error('Error inserting snapshot:', snapshotError);
      return NextResponse.json({ error: snapshotError.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Snapshot ingested successfully' }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}


