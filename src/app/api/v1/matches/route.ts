import { NextRequest, NextResponse } from 'next/server';
import { MatchService } from '@/lib/services/match.service';
import { MatchRepository } from '@/lib/repositories/match.repository';
import { ExternalAPIService } from '@/lib/services/external-api.service';
import { MatchFilters } from '@/lib/types/match.types';

const matchRepo = new MatchRepository();
const externalAPI = new ExternalAPIService();
const matchService = new MatchService(matchRepo, externalAPI);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    console.log('🏈 Public API: Fetching published matches');
    
    // Public API filters (more restrictive than admin)
    const filters: MatchFilters = {
      status: 'published', // Always filter to published matches
      league: searchParams.get('league') || undefined,
      limit: Math.min(parseInt(searchParams.get('limit') || '20'), 50), // Max 50
      offset: parseInt(searchParams.get('offset') || '0'),
      sort: (searchParams.get('sort') as any) || 'kickoff_asc'
    };
    
    // Add match status filter if provided (live, upcoming, finished)
    const matchStatusFilter = searchParams.get('status');
    let statusCondition: any = undefined;
    
    if (matchStatusFilter) {
      switch (matchStatusFilter) {
        case 'live':
          statusCondition = 'LIVE';
          break;
        case 'upcoming':
          statusCondition = 'PRE';
          break;
        case 'finished':
          statusCondition = 'FT';
          break;
        default:
          // Invalid status filter, ignore
          break;
      }
    }
    
    console.log('🔍 Public API filters:', {
      league: filters.league,
      limit: filters.limit,
      offset: filters.offset,
      match_status: matchStatusFilter,
      sort: filters.sort
    });
    
    // Get published matches using service layer
    const { matches, total } = await matchService.getPublishedMatches(filters);
    
    // Apply additional status filter if needed
    let filteredMatches = matches;
    if (statusCondition) {
      filteredMatches = matches.filter(match => match.status === statusCondition);
    }
    
    // Select spotlight match (first live, then first upcoming, then first finished)
    let spotlightMatch = null;
    if (filteredMatches.length > 0) {
      spotlightMatch = filteredMatches.find(m => m.status === 'LIVE') || 
                      filteredMatches.find(m => m.status === 'PRE') ||
                      filteredMatches[0];
    }
    
    const response = {
      success: true,
      matches: filteredMatches,
      total: filteredMatches.length,
      spotlight_match: spotlightMatch,
      pagination: {
        limit: filters.limit!,
        offset: filters.offset!,
        has_more: (filters.offset! + filteredMatches.length) < total,
        next_offset: (filters.offset! + filteredMatches.length) < total ? filters.offset! + filters.limit! : null
      },
      metadata: {
        last_updated: new Date().toISOString(),
        data_freshness: "Real-time",
        total_leagues: [...new Set(filteredMatches.map(m => m.league))].length,
        filters_applied: {
          league: filters.league,
          match_status: matchStatusFilter,
          published_only: true
        }
      }
    };
    
    console.log(`✅ Public API: Returned ${filteredMatches.length}/${total} matches`);
    
    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
        'X-Total-Count': total.toString(),
        'X-Filtered-Count': filteredMatches.length.toString()
      }
    });
    
  } catch (error) {
    console.error('❌ Public matches API error:', error);
    
    return NextResponse.json({
      success: false,
      matches: [],
      total: 0,
      spotlight_match: null,
      error: error instanceof Error ? error.message : 'Failed to fetch matches'
    }, { status: 500 });
  }
}