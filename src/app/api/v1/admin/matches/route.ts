import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAdmin } from '@/lib/admin-protection';

// Use service role for admin operations, fallback to anon key
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: NextRequest) {
  try {
    // Verify admin access
    const adminCheck = await requireAdmin(request);
    if (adminCheck) {
      return adminCheck;
    }

    // Fetch all matches from the database
    const { data: matches, error } = await supabase
      .from('matches')
      .select(`
        id,
        league,
        home_team,
        away_team,
        kickoff_utc,
        status,
        is_published,
        analysis_status,
        created_at,
        updated_at
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch matches' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: matches || [],
      total: matches?.length || 0
    });

  } catch (error) {
    console.error('Error fetching matches:', error);
    return NextResponse.json(
      { success: false, error: 'An internal server error occurred.' },
      { status: 500 }
    );
  }
}