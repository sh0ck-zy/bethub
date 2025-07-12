import { NextResponse } from 'next/server';
import { RealDataService } from '@/lib/services/realDataService';

export async function GET() {
  try {
    console.log('🧪 Testing Real Data Service...');
    
    const realDataService = new RealDataService();
    
    // Test 1: Get today's matches
    console.log('📅 Fetching today\'s matches...');
    const todayMatches = await realDataService.getTodaysMatches();
    console.log(`✅ Found ${todayMatches.length} matches for today`);
    
    // Test 2: Get upcoming matches
    console.log('🔮 Fetching upcoming matches...');
    const upcomingMatches = await realDataService.getUpcomingMatches();
    console.log(`✅ Found ${upcomingMatches.length} upcoming matches`);
    
    // Test 3: Get matches for next 7 days
    console.log('📊 Fetching matches for next 7 days...');
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 7);
    
    const rangeMatches = await realDataService.getMatchesForDateRange(startDate, endDate);
    console.log(`✅ Found ${rangeMatches.length} matches in date range`);
    
    // Group by league
    const leagueStats: Record<string, number> = {};
    rangeMatches.forEach(match => {
      leagueStats[match.league] = (leagueStats[match.league] || 0) + 1;
    });
    
    return NextResponse.json({
      success: true,
      data: {
        today: todayMatches,
        upcoming: upcomingMatches,
        next7Days: rangeMatches,
        leagueStats,
        summary: {
          todayCount: todayMatches.length,
          upcomingCount: upcomingMatches.length,
          next7DaysCount: rangeMatches.length,
          leagues: Object.keys(leagueStats)
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Error testing real data service:', error);
    return NextResponse.json(
      { error: 'Failed to test real data service', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 