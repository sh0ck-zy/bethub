import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-protection';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    // Verify admin access
    const adminCheck = await requireAdmin(request);
    if (adminCheck) {
      return adminCheck;
    }

    const body = await request.json();
    const { matchId, isPublished } = body;

    if (!matchId || typeof isPublished !== 'boolean') {
      return NextResponse.json(
        { error: 'Match ID and isPublished boolean are required' },
        { status: 400 }
      );
    }

    // Use the admin function to update match publish status (bypasses RLS)
    const { data, error } = await supabase.rpc('admin_update_match', {
      p_id: matchId,
      p_is_published: isPublished
    });

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to update match in database' },
        { status: 500 }
      );
    }

    if (!data.success) {
      return NextResponse.json(
        { error: data.error || 'Failed to update match' },
        { status: 400 }
      );
    }

    console.log(`Match ${matchId} ${isPublished ? 'published' : 'unpublished'}`);

    return NextResponse.json({
      success: true,
      message: `Match ${isPublished ? 'published' : 'unpublished'} successfully`,
      data: {
        matchId,
        isPublished
      }
    });

  } catch (error) {
    console.error('Error toggling publish:', error);
    return NextResponse.json(
      { error: 'Failed to toggle publish status' },
      { status: 500 }
    );
  }
}