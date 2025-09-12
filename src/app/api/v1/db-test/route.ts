import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer, isSupabaseConfigured } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Testing database connection...');
    
    if (!isSupabaseConfigured()) {
      return NextResponse.json({
        success: false,
        error: 'Supabase not configured',
        details: 'Environment variables missing'
      });
    }

    const supabase = getSupabaseServer();
    
    // Test 1: Simple count query
    console.log('Testing simple count...');
    const { data: countResult, error: countError } = await supabase
      .from('matches')
      .select('id', { count: 'exact', head: true });
    
    if (countError) {
      console.error('Count error:', countError);
      return NextResponse.json({
        success: false,
        error: 'Database query failed',
        details: countError.message,
        test: 'count'
      });
    }

    // Test 2: Simple select
    console.log('Testing simple select...');
    const { data: selectResult, error: selectError } = await supabase
      .from('matches')
      .select('id, league, home_team, away_team')
      .limit(3);
    
    if (selectError) {
      console.error('Select error:', selectError);
      return NextResponse.json({
        success: false,
        error: 'Select query failed',
        details: selectError.message,
        test: 'select'
      });
    }

    console.log('✅ Database tests passed');
    
    return NextResponse.json({
      success: true,
      message: 'Database connection working',
      results: {
        matches_count: countResult?.length || 0,
        sample_matches: selectResult || [],
        environment: process.env.NODE_ENV
      }
    });

  } catch (error) {
    console.error('Database test error:', error);
    return NextResponse.json({
      success: false,
      error: 'Test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}