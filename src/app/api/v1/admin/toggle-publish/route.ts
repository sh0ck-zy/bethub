import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-protection';
import { getSupabaseServer, isSupabaseConfigured } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
  try {
    // Verify admin access
    const adminCheck = await requireAdmin(request);
    if (adminCheck) {
      return adminCheck;
    }

    if (!isSupabaseConfigured()) {
      return NextResponse.json({
        success: false,
        error: 'Database is not configured'
      }, { status: 503 });
    }

    const body = await request.json();
    const { matchId, matchIds, isPublished, action } = body;

    // Support both single match and batch operations
    if (action === 'batch') {
      if (!matchIds || !Array.isArray(matchIds) || matchIds.length === 0) {
        return NextResponse.json(
          { error: 'Match IDs array is required for batch operations' },
          { status: 400 }
        );
      }

      if (typeof isPublished !== 'boolean') {
        return NextResponse.json(
          { error: 'isPublished boolean is required' },
          { status: 400 }
        );
      }

      return handleBatchPublish(matchIds, isPublished);
    }

    // Single match operation (backward compatibility)
    if (!matchId || typeof isPublished !== 'boolean') {
      return NextResponse.json(
        { error: 'Match ID and isPublished boolean are required' },
        { status: 400 }
      );
    }

    return handleSinglePublish(matchId, isPublished);

  } catch (error) {
    console.error('Error in publish toggle:', error);
    return NextResponse.json(
      { error: 'Failed to toggle publish status' },
      { status: 500 }
    );
  }
}

// Handle single match publish/unpublish
async function handleSinglePublish(matchId: string, isPublished: boolean) {
  try {
    const supabase = getSupabaseServer();
    
    const { data, error } = await supabase
      .from('matches')
      .update({ 
        is_published: isPublished,
        updated_at: new Date().toISOString()
      })
      .eq('id', matchId)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to update match in database' },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Match not found' },
        { status: 404 }
      );
    }

    console.log(`📝 Match ${matchId} ${isPublished ? 'published' : 'unpublished'}`);

    return NextResponse.json({
      success: true,
      message: `Match ${isPublished ? 'published' : 'unpublished'} successfully`,
      data: {
        matchId,
        isPublished,
        match: data
      }
    });
  } catch (error) {
    console.error('Error in single publish:', error);
    throw error;
  }
}

// Handle batch publish/unpublish
async function handleBatchPublish(matchIds: string[], isPublished: boolean) {
  try {
    const supabase = getSupabaseServer();
    
    console.log(`📝 Batch ${isPublished ? 'publishing' : 'unpublishing'} ${matchIds.length} matches`);
    
    const { data, error } = await supabase
      .from('matches')
      .update({ 
        is_published: isPublished,
        updated_at: new Date().toISOString()
      })
      .in('id', matchIds)
      .select();

    if (error) {
      console.error('Batch database error:', error);
      return NextResponse.json(
        { error: 'Failed to update matches in database' },
        { status: 500 }
      );
    }

    const updatedCount = data?.length || 0;
    const action = isPublished ? 'published' : 'unpublished';
    
    console.log(`✅ Successfully ${action} ${updatedCount} matches`);

    return NextResponse.json({
      success: true,
      message: `Batch operation completed: ${updatedCount} matches ${action}`,
      data: {
        matchIds,
        isPublished,
        updatedCount,
        matches: data
      }
    });
  } catch (error) {
    console.error('Error in batch publish:', error);
    throw error;
  }
}