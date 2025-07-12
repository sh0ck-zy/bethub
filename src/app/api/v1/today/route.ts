import { NextResponse } from 'next/server';

interface PublishedMatch {
  id: string;
  league: string;
  homeTeam: string;
  awayTeam: string;
  kickoffUtc: string;
  isPublished: boolean;
}

// Mock DB for published matches
const mockPublishedMatches: PublishedMatch[] = [
  // Only include matches that have been published by the admin
  // Example: { id: '2', league: 'Brasileirão', homeTeam: 'Vasco', awayTeam: 'Botafogo', kickoffUtc: '2025-07-12T20:00:00Z', isPublished: true }
];

export async function GET() {
  // Only return published matches
  return NextResponse.json({
    success: true,
    matches: mockPublishedMatches,
    total: mockPublishedMatches.length,
    source: 'mock-published',
  });
}


