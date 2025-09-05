'use client';

import React from 'react';
import Link from 'next/link';
import { TeamLogo } from '@/components/TeamLogo';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Brain, Clock, Tv } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useRoleSelector } from '@/components/ui/RoleSelector';
import type { Match } from '@/lib/types';

interface MatchRowProps {
  match: Match;
  showActions?: boolean;
}

export function MatchRow({ match, showActions = true }: MatchRowProps) {
  const { user } = useAuth();
  const { isAdmin: demoIsAdmin } = useRoleSelector();
  const isLoggedIn = !!user || demoIsAdmin;

  // Status display logic
  const getStatusDisplay = () => {
    switch (match.status) {
      case 'LIVE':
        return (
          <div className="flex flex-col items-center">
            <Badge className="bg-green-600 hover:bg-green-600 text-white text-xs px-2 py-1 animate-pulse">
              LIVE
            </Badge>
            {match.current_minute && (
              <span className="text-xs text-green-400 mt-1">{match.current_minute}'</span>
            )}
          </div>
        );
      case 'FT':
        return (
          <Badge variant="secondary" className="bg-gray-600 text-gray-300 text-xs px-2 py-1">
            FT
          </Badge>
        );
      case 'PRE':
        const kickoffTime = new Date(match.kickoff_utc).toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        });
        return (
          <div className="flex flex-col items-center">
            <span className="text-xs text-gray-400 font-medium">{kickoffTime}</span>
            <span className="text-xs text-gray-500 mt-1">
              {new Date(match.kickoff_utc).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric' 
              })}
            </span>
          </div>
        );
      default:
        return (
          <Badge variant="outline" className="text-xs px-2 py-1">
            {match.status}
          </Badge>
        );
    }
  };

  // Score display
  const getScoreDisplay = () => {
    if (match.home_score !== null && match.away_score !== null) {
      return (
        <div className="flex items-center justify-center min-w-[40px]">
          <span className="text-lg font-bold text-white">
            {match.home_score} - {match.away_score}
          </span>
        </div>
      );
    }
    return (
      <div className="flex items-center justify-center min-w-[40px]">
        <span className="text-sm text-gray-500">vs</span>
      </div>
    );
  };

  return (
    <Link href={`/match/${match.id}`} className="block">
      <div className="flex items-center py-3 px-4 hover:bg-gray-800/50 transition-colors cursor-pointer border-b border-gray-800/50 last:border-b-0">
        {/* Status/Time - Fixed width for alignment */}
        <div className="w-16 flex justify-center flex-shrink-0">
          {getStatusDisplay()}
        </div>

        {/* Match Content */}
        <div className="flex-1 flex items-center justify-between ml-4">
          {/* Home Team */}
          <div className="flex items-center min-w-0 flex-1">
            <TeamLogo 
              team={match.home_team} 
              size={24} 
              logoUrl={match.home_team_logo}
              className="flex-shrink-0"
            />
            <span className="text-sm text-gray-300 ml-2 truncate">
              {match.home_team}
            </span>
          </div>

          {/* Score */}
          <div className="mx-4 flex-shrink-0">
            {getScoreDisplay()}
          </div>

          {/* Away Team */}
          <div className="flex items-center min-w-0 flex-1 justify-end">
            <span className="text-sm text-gray-300 mr-2 truncate text-right">
              {match.away_team}
            </span>
            <TeamLogo 
              team={match.away_team} 
              size={24} 
              logoUrl={match.away_team_logo}
              className="flex-shrink-0"
            />
          </div>
        </div>

        {/* Actions - Only show if logged in and actions enabled */}
        {showActions && isLoggedIn && (
          <div className="ml-4 flex items-center space-x-2 flex-shrink-0">
            {/* AI Analysis Indicator */}
            {match.analysis_status === 'completed' && (
              <Badge variant="secondary" className="bg-blue-600 text-white text-xs px-2 py-1">
                <Brain className="w-3 h-3 mr-1" />
                AI
              </Badge>
            )}
            
            {/* Live TV indicator (placeholder) */}
            {match.status === 'LIVE' && (
              <Badge variant="outline" className="border-red-500 text-red-500 text-xs px-2 py-1">
                <Tv className="w-3 h-3 mr-1" />
                LIVE
              </Badge>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}

// Skeleton loading component for match rows
export function MatchRowSkeleton() {
  return (
    <div className="flex items-center py-3 px-4 border-b border-gray-800/50 last:border-b-0 animate-pulse">
      {/* Status placeholder */}
      <div className="w-16 flex justify-center">
        <div className="h-6 w-12 bg-gray-700 rounded"></div>
      </div>

      {/* Match content placeholder */}
      <div className="flex-1 flex items-center justify-between ml-4">
        {/* Home team placeholder */}
        <div className="flex items-center flex-1">
          <div className="w-6 h-6 bg-gray-700 rounded-full"></div>
          <div className="h-4 bg-gray-700 rounded w-24 ml-2"></div>
        </div>

        {/* Score placeholder */}
        <div className="mx-4">
          <div className="h-4 bg-gray-700 rounded w-8"></div>
        </div>

        {/* Away team placeholder */}
        <div className="flex items-center flex-1 justify-end">
          <div className="h-4 bg-gray-700 rounded w-24 mr-2"></div>
          <div className="w-6 h-6 bg-gray-700 rounded-full"></div>
        </div>
      </div>
    </div>
  );
}