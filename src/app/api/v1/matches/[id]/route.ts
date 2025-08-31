import { NextRequest, NextResponse } from 'next/server';
import { MatchService } from '@/lib/services/match.service';
import { AnalysisService } from '@/lib/services/analysis.service';
import { MatchRepository } from '@/lib/repositories/match.repository';
import { AnalysisRepository } from '@/lib/repositories/analysis.repository';
import { ExternalAPIService } from '@/lib/services/external-api.service';
import { DummyAIService } from '@/lib/services/dummy-ai.service';

const matchRepo = new MatchRepository();
const analysisRepo = new AnalysisRepository();
const externalAPI = new ExternalAPIService();
const aiService = new DummyAIService();
const matchService = new MatchService(matchRepo, externalAPI);
const analysisService = new AnalysisService(analysisRepo, matchRepo, aiService);

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const matchId = params.id;
    
    if (!matchId) {
      return NextResponse.json({
        success: false,
        error: 'Match ID is required'
      }, { status: 400 });
    }

    console.log(`🏈 Public API: Fetching match details for ${matchId}`);

    // Get match details
    const match = await matchService.getMatchById(matchId);
    
    if (!match) {
      return NextResponse.json({
        success: false,
        error: 'Match not found'
      }, { status: 404 });
    }

    // Only return published matches to public
    if (!match.is_published) {
      return NextResponse.json({
        success: false,
        error: 'Match not available'
      }, { status: 404 });
    }

    // Get analysis if available
    let analysis = null;
    if (match.is_analyzed && match.analysis_status === 'completed') {
      try {
        analysis = await analysisService.getPublicAnalysis(matchId);
      } catch (error) {
        console.warn(`Failed to get analysis for match ${matchId}:`, error);
        // Continue without analysis - not critical
      }
    }

    // Transform match to public format
    const publicMatch = {
      id: match.id,
      league: match.league,
      home_team: match.home_team,
      away_team: match.away_team,
      kickoff_utc: match.kickoff_utc,
      venue: match.venue,
      referee: match.referee,
      status: match.status,
      home_score: match.home_score,
      away_score: match.away_score,
      current_minute: match.current_minute,
      home_team_logo: match.home_team_logo,
      away_team_logo: match.away_team_logo,
      league_logo: match.league_logo,
      has_analysis: !!analysis
    };

    const response = {
      success: true,
      data: {
        match: publicMatch,
        analysis: analysis,
        metadata: {
          last_updated: match.updated_at,
          analysis_updated: match.analyzed_at,
          published_at: match.published_at
        }
      }
    };

    console.log(`✅ Public API: Returning match ${matchId} with analysis: ${!!analysis}`);

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, max-age=30, stale-while-revalidate=300',
        'X-Has-Analysis': (!!analysis).toString(),
        'X-Match-Status': match.status
      }
    });

  } catch (error) {
    console.error(`❌ Match detail API error for ${params.id}:`, error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch match details'
    }, { status: 500 });
  }
}

// PUT method for admin updates (behind authentication)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // TODO: Add admin authentication check
    // const user = await getAuthenticatedUser(request);
    // if (!user || user.role !== 'admin') {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const matchId = params.id;
    const body = await request.json();
    
    if (!matchId) {
      return NextResponse.json({
        success: false,
        error: 'Match ID is required'
      }, { status: 400 });
    }

    console.log(`🔄 Admin API: Updating match ${matchId}`);

    // Validate allowed update fields
    const allowedFields = ['status', 'home_score', 'away_score', 'current_minute', 'is_published'];
    const updates: any = {};
    
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates[field] = body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No valid update fields provided'
      }, { status: 400 });
    }

    const updatedMatch = await matchService.updateMatch(matchId, updates);

    console.log(`✅ Admin API: Updated match ${matchId}`);

    return NextResponse.json({
      success: true,
      data: {
        match: updatedMatch,
        updated_fields: Object.keys(updates)
      }
    });

  } catch (error) {
    console.error(`❌ Update match API error for ${params.id}:`, error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update match'
    }, { status: 500 });
  }
}