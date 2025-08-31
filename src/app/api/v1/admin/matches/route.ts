import { NextRequest, NextResponse } from 'next/server';
import { MatchService } from '@/lib/services/match.service';
import { MatchRepository } from '@/lib/repositories/match.repository';
import { ExternalAPIService } from '@/lib/services/external-api.service';
import { MatchFilters } from '@/lib/types/match.types';
import { getSupabaseServer } from '@/lib/supabase-server';

const matchRepo = new MatchRepository();
const externalAPI = new ExternalAPIService();
const matchService = new MatchService(matchRepo, externalAPI);

export async function GET(request: NextRequest) {
  try {
    // TODO: Add admin authentication check
    // const user = await getAuthenticatedUser(request);
    // if (!user || user.role !== 'admin') {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }
    
    const { searchParams } = new URL(request.url);
    
    const filters: MatchFilters = {
      status: (searchParams.get('status') as any) || 'all',
      analysis_status: (searchParams.get('analysis_status') as any) || undefined,
      league: searchParams.get('league') || undefined,
      limit: Math.min(parseInt(searchParams.get('limit') || '50'), 100), // Max 100
      offset: parseInt(searchParams.get('offset') || '0'),
      sort: (searchParams.get('sort') as any) || 'kickoff_asc'
    };
    
    console.log('📋 Admin API: Fetching matches with filters:', filters);
    
    // Validate filters
    if (filters.status && !['pulled', 'analyzed', 'published', 'all'].includes(filters.status)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid status filter. Must be one of: pulled, analyzed, published, all'
      }, { status: 400 });
    }
    
    if (filters.analysis_status && !['none', 'pending', 'completed', 'failed'].includes(filters.analysis_status)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid analysis_status filter. Must be one of: none, pending, completed, failed'
      }, { status: 400 });
    }
    
    const { matches, total } = await matchService.getMatches(filters);
    
    // Get summary statistics
    const stats = await matchService.getDashboardStats();
    
    console.log(`✅ Admin API: Returned ${matches.length}/${total} matches`);
    
    return NextResponse.json({
      success: true,
      data: {
        matches,
        pagination: {
          total,
          limit: filters.limit,
          offset: filters.offset,
          has_more: (filters.offset + filters.limit) < total,
          next_offset: (filters.offset + filters.limit) < total ? filters.offset + filters.limit : null,
          prev_offset: filters.offset > 0 ? Math.max(0, filters.offset - filters.limit) : null
        },
        summary: stats,
        filters_applied: {
          status: filters.status,
          sort: filters.sort
        }
      }
    });
    
  } catch (error) {
    console.error('Admin API error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch matches',
      data: {
        matches: [],
        pagination: { total: 0, limit: 0, offset: 0, has_more: false, next_offset: null, prev_offset: null },
        summary: { total_matches: 0, total_pulled: 0, total_analyzed: 0, total_published: 0, pending_analysis: 0, failed_analysis: 0 },
        filters_applied: { status: 'all', sort: 'kickoff_asc' }
      }
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { match } = await request.json();
    
    if (!match) {
      return NextResponse.json({
        success: false,
        error: 'Match data is required'
      }, { status: 400 });
    }
    
    console.log('📥 Admin API: Manual match insertion:', match);
    
    // Insert match directly using Supabase client
    const supabase = getSupabaseServer();
    
    const { data, error } = await supabase
      .from('matches')
      .insert({
        id: match.id,
        external_id: match.external_id,
        data_source: match.data_source,
        league: match.league,
        home_team: match.home_team,
        away_team: match.away_team,
        kickoff_utc: match.kickoff_utc,
        status: match.status,
        home_score: match.home_score,
        away_score: match.away_score,
        is_published: match.is_published || false,
        is_pulled: match.is_pulled || true,
        is_analyzed: match.is_analyzed || false,
        analysis_status: match.analysis_status || 'none',
        analysis_priority: match.analysis_priority || 'normal',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select('*');
    
    if (error) {
      console.error('Insert error:', error);
      throw error;
    }
    
    console.log('✅ Match inserted successfully:', data[0]);
    
    return NextResponse.json({
      success: true,
      data: { match: data[0] }
    });
    
  } catch (error) {
    console.error('Manual match insert error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to insert match'
    }, { status: 500 });
  }
}