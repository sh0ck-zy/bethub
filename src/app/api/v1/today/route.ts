import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const region = searchParams.get('sb_region');
  const sport = searchParams.get('sport');
  const league = searchParams.get('league');

  let query = supabase.from('matches').select('*');

  if (sport) {
    query = query.eq('sport', sport);
  }
  if (league) {
    query = query.eq('league', league);
  }
  // TODO (backend): Implement region filtering for matches

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}


