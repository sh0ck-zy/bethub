import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // For MVP: Use the same real match data from today endpoint
    const baseUrl = request.url.replace('/api/v1/admin/matches', '');
    
    const todayResponse = await fetch(`${baseUrl}/api/v1/today?admin=true`, {
      headers: {
        'Cache-Control': 'no-cache'
      }
    });
    
    if (!todayResponse.ok) {
      throw new Error('Failed to fetch matches');
    }
    
    const data = await todayResponse.json();
    
    // Add admin-specific fields to each match
    const adminMatches = (data.matches || []).map((match: any) => ({
      ...match,
      analysis_status: 'none', // AI analysis not implemented yet
      is_published: true, // All matches visible for MVP
      created_at: match.created_at || new Date().toISOString()
    }));
    
    return NextResponse.json({
      success: true,
      matches: adminMatches,
      total: adminMatches.length,
      source: 'real-api-for-admin'
    });
    
  } catch (error) {
    console.error('Admin matches API error:', error);
    
    // Fallback to minimal data
    return NextResponse.json({
      success: true,
      matches: [],
      total: 0,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}