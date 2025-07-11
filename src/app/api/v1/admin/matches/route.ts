import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAdmin } from '@/lib/admin-protection';

// Use anon key as fallback if service role key is not available
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// GET - Get all matches for admin
export async function GET(request: NextRequest) {
  // Check admin access
  const adminCheck = await requireAdmin(request);
  if (adminCheck) {
    return adminCheck;
  }

  try {
    const { data: matches, error } = await supabase
      .from('matches')
      .select('*')
      .order('kickoff_utc', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      // Return empty array instead of throwing
      return NextResponse.json({
        success: true,
        data: [],
        message: 'Database not accessible, returning empty list'
      });
    }

    return NextResponse.json({
      success: true,
      data: matches || [],
      message: `Found ${matches?.length || 0} matches`
    });
  } catch (error) {
    console.error('Error fetching admin matches:', error);
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to fetch matches'
    }, { status: 500 });
  }
}