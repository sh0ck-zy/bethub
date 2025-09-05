'use client';

import React from 'react';
import { MatchRow, MatchRowSkeleton } from './MatchRow';
import { LeagueLogo } from '@/components/LeagueLogo';
import { Badge } from '@/components/ui/badge';
import type { Match } from '@/lib/types';

interface LeagueData {
  id: string;
  name: string;
  logoUrl?: string;
  matches: Match[];
  color?: string;
}

interface LeagueSectionProps {
  league: LeagueData;
  isLoading?: boolean;
  showActions?: boolean;
}

// League color mapping for visual indicators
const LEAGUE_COLORS: Record<string, string> = {
  'Premier League': 'bg-purple-600',
  'Primera División': 'bg-red-600',
  'La Liga': 'bg-red-600',
  'Serie A': 'bg-green-600',
  'Bundesliga': 'bg-black',
  'Ligue 1': 'bg-blue-600',
  'UEFA Champions League': 'bg-blue-800',
  'Champions League': 'bg-blue-800',
  'UEFA Europa League': 'bg-orange-600',
  'Europa League': 'bg-orange-600',
  'UEFA Conference League': 'bg-green-500',
  'Conference League': 'bg-green-500',
};

export function LeagueSection({ league, isLoading = false, showActions = true }: LeagueSectionProps) {
  const leagueColor = league.color || LEAGUE_COLORS[league.name] || 'bg-gray-600';
  
  // Sort matches by status priority and time
  const sortedMatches = [...league.matches].sort((a, b) => {
    // Priority: LIVE > PRE > FT
    const getStatusWeight = (status: string) => {
      switch (status) {
        case 'LIVE': return 1;
        case 'PRE': return 2;
        case 'FT': return 3;
        default: return 4;
      }
    };

    const weightA = getStatusWeight(a.status);
    const weightB = getStatusWeight(b.status);

    if (weightA !== weightB) {
      return weightA - weightB;
    }

    // Within same status, sort by kickoff time
    return new Date(a.kickoff_utc).getTime() - new Date(b.kickoff_utc).getTime();
  });

  return (
    <div className="bg-gray-900 border border-gray-800 overflow-hidden mb-4">
      {/* League Header */}
      <div className="px-4 py-3 bg-gray-850 border-b border-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {/* League Color Indicator */}
            <div className={`w-1 h-6 ${leagueColor} mr-3 rounded-sm`}></div>
            
            {/* League Logo */}
            <LeagueLogo 
              league={league.id} 
              size={20} 
              logoUrl={league.logoUrl}
              className="mr-2"
            />
            
            {/* League Name */}
            <h3 className="font-semibold text-white text-sm">
              {league.name}
            </h3>
            
            {/* Match Count */}
            <Badge 
              variant="secondary" 
              className="ml-2 bg-gray-700 text-gray-300 text-xs px-2 py-1"
            >
              {league.matches.length}
            </Badge>
          </div>

          {/* Live indicator if there are live matches */}
          {league.matches.some(m => m.status === 'LIVE') && (
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
              <span className="text-xs text-green-400 font-medium">LIVE</span>
            </div>
          )}
        </div>
      </div>

      {/* Matches List */}
      <div className="divide-y divide-gray-800">
        {isLoading ? (
          // Loading skeleton
          Array.from({ length: 3 }).map((_, index) => (
            <MatchRowSkeleton key={index} />
          ))
        ) : sortedMatches.length > 0 ? (
          // Actual matches
          sortedMatches.map((match) => (
            <MatchRow
              key={match.id}
              match={match}
              showActions={showActions}
            />
          ))
        ) : (
          // Empty state
          <div className="px-4 py-8 text-center">
            <p className="text-gray-500 text-sm">No matches available</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Group matches by league helper function
export function groupMatchesByLeague(matches: Match[]): LeagueData[] {
  const leagueMap = new Map<string, LeagueData>();

  matches.forEach(match => {
    const leagueId = match.league;
    
    if (!leagueMap.has(leagueId)) {
      leagueMap.set(leagueId, {
        id: leagueId,
        name: leagueId,
        logoUrl: match.league_logo,
        matches: [],
        color: LEAGUE_COLORS[leagueId]
      });
    }

    const league = leagueMap.get(leagueId)!;
    league.matches.push(match);
    
    // Update logo URL if we don't have one yet
    if (!league.logoUrl && match.league_logo) {
      league.logoUrl = match.league_logo;
    }
  });

  // Sort leagues by priority (live matches first, then by match count)
  return Array.from(leagueMap.values()).sort((a, b) => {
    const aHasLive = a.matches.some(m => m.status === 'LIVE');
    const bHasLive = b.matches.some(m => m.status === 'LIVE');
    
    if (aHasLive && !bHasLive) return -1;
    if (!aHasLive && bHasLive) return 1;
    
    // If both have live or both don't have live, sort by match count
    return b.matches.length - a.matches.length;
  });
}

// Loading skeleton for entire league section
export function LeagueSectionSkeleton() {
  return (
    <div className="bg-gray-900 border border-gray-800 overflow-hidden mb-4 animate-pulse">
      {/* League Header Skeleton */}
      <div className="px-4 py-3 bg-gray-850 border-b border-gray-800">
        <div className="flex items-center">
          <div className="w-1 h-6 bg-gray-700 mr-3 rounded-sm"></div>
          <div className="w-5 h-5 bg-gray-700 rounded mr-2"></div>
          <div className="h-4 bg-gray-700 rounded w-32"></div>
          <div className="h-5 bg-gray-700 rounded w-8 ml-2"></div>
        </div>
      </div>

      {/* Matches Skeleton */}
      <div className="divide-y divide-gray-800">
        {Array.from({ length: 3 }).map((_, index) => (
          <MatchRowSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}