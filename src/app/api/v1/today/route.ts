import { NextResponse } from 'next/server';
import { MatchService } from '@/lib/services/match.service';
import { MatchRepository } from '@/lib/repositories/match.repository';
import { ExternalAPIService } from '@/lib/services/external-api.service';

const matchRepo = new MatchRepository();
const externalAPI = new ExternalAPIService();
const matchService = new MatchService(matchRepo, externalAPI);

// Removed getFallbackMatches - we enforce proper admin workflow

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const isAdmin = searchParams.get('admin') === 'true';
    
    console.log('🏠 Homepage requesting published matches, admin view:', isAdmin);

    // Calculate date range: today (start of day) to next 7 days
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of today
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);

    // Use our service layer to get published matches
    try {
      const { matches, total } = await matchService.getPublishedMatches({
        limit: 20,
        sort: 'kickoff_asc'
      });

      // Filter matches by date range (next 7 days)
      const upcomingMatches = matches.filter(match => {
        const kickoff = new Date(match.kickoff_utc);
        return kickoff >= today && kickoff <= nextWeek;
      });

      console.log(`📊 Fetched ${upcomingMatches.length} published matches from service layer`);

      // If no published matches found, show empty state (NO FALLBACK)
      if (upcomingMatches.length === 0) {
        const message = isAdmin 
          ? 'No published matches found. Use the admin panel to pull, analyze, and publish matches.'
          : 'No matches available at the moment. Please check back later.';
        
        console.log(`⚠️ No published matches found. Database has ${total} total matches, 0 published.`);
        
        return NextResponse.json({
          success: true,
          matches: [],
          total: 0,
          source: 'database-empty',
          message,
          debug_info: isAdmin ? {
            total_in_database: total,
            published_count: 0,
            suggestion: 'Use /api/v1/admin/matches/pull to fetch matches, then analyze and publish them'
          } : undefined
        });
      }

      // Auto-select spotlight match: first live match, then first upcoming match
      let spotlightMatch = null;
      if (upcomingMatches.length > 0) {
        const liveMatch = upcomingMatches.find(m => m.status === 'LIVE');
        const upcomingMatch = upcomingMatches.find(m => m.status === 'PRE');
        const finishedMatch = upcomingMatches.find(m => m.status === 'FT');
        spotlightMatch = liveMatch || upcomingMatch || finishedMatch;
      }

      return NextResponse.json({
        success: true,
        matches: upcomingMatches,
        total: upcomingMatches.length,
        source: 'database-published',
        spotlight_match: spotlightMatch,
        message: `Found ${upcomingMatches.length} published matches`,
        metadata: {
          last_updated: new Date().toISOString(),
          data_freshness: "Real-time",
          total_leagues: [...new Set(upcomingMatches.map(m => m.league))].length
        }
      }, {
        headers: {
          'Cache-Control': 'public, max-age=60, stale-while-revalidate=300'
        }
      });

    } catch (serviceError) {
      console.error('Service layer error:', serviceError);
      
      // NO FALLBACK - Return proper error instead of bypassing workflow
      const message = isAdmin
        ? 'Database connection failed. Check your Supabase configuration and try again.'
        : 'Service temporarily unavailable. Please try again in a few moments.';
        
      return NextResponse.json({
        success: false,
        matches: [],
        total: 0,
        source: 'service-error',
        error: message,
        debug_info: isAdmin ? {
          error_details: serviceError instanceof Error ? serviceError.message : 'Unknown service error',
          suggestion: 'Check database connection and Supabase configuration'
        } : undefined
      }, { status: 503 });
    }

  } catch (error) {
    console.error('Today API error:', error);
    
    return NextResponse.json({
      success: false,
      matches: [],
      total: 0,
      source: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}


