import { NextRequest, NextResponse } from 'next/server';
import { getDataProvider } from '@/lib/providers/registry';
import type { ApiResponse, Match } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get('date');
    const league = searchParams.get('league');
    const status = searchParams.get('status');
    
    // Parse date parameter or default to today
    const date = dateParam ? new Date(dateParam) : new Date();
    
    // Validate date
    if (isNaN(date.getTime())) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid date format. Use ISO 8601 format (YYYY-MM-DD)',
        } as ApiResponse<never>,
        { status: 400 }
      );
    }

    // Get data provider
    const dataProvider = getDataProvider();
    
    if (!dataProvider) {
      return NextResponse.json(
        {
          success: false,
          error: 'Data service unavailable',
          message: 'Match data service is not available at the moment',
        } as ApiResponse<never>,
        { status: 503 }
      );
    }

    // Fetch matches
    const matches = await dataProvider.getMatches(date, league || undefined);
    
    if (!matches) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to fetch matches',
          message: 'Unable to retrieve match data',
        } as ApiResponse<never>,
        { status: 500 }
      );
    }

    // Filter by status if provided
    let filteredMatches = matches;
    if (status) {
      const validStatuses = ['PRE', 'LIVE', 'FT', 'POSTPONED', 'CANCELLED'];
      if (validStatuses.includes(status.toUpperCase())) {
        filteredMatches = matches.filter(match => 
          match.status === status.toUpperCase()
        );
      }
    }

    // Return successful response
    const response: ApiResponse<Match[]> = {
      success: true,
      data: filteredMatches,
      message: `Found ${filteredMatches.length} matches`,
      pagination: {
        page: 1,
        limit: filteredMatches.length,
        total: filteredMatches.length,
        has_more: false,
      },
    };

    return NextResponse.json(response, { 
      status: 200,
      headers: {
        'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
        'X-Total-Count': filteredMatches.length.toString(),
      }
    });

  } catch (error) {
    console.error('Matches API error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: 'An unexpected error occurred while fetching matches',
      } as ApiResponse<never>,
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
} 