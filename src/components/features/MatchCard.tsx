'use client';

import React from 'react';
import Link from 'next/link';
import { TeamLogo } from '@/components/TeamLogo';
import { LeagueLogo } from '@/components/LeagueLogo';
import type { Match } from '@/lib/types';


interface MatchCardProps {
  match: Match;
  mode?: 'public' | 'admin';
  adminControls?: {
    onSendToAI: (matchId: string) => void;
    onTogglePublish: (matchId: string, isPublished: boolean) => void;
    analysisStatus: string;
    isPublished: boolean;
  };
}


// Status Badge Component
const StatusBadge = ({ status, kickoffTime }: { status: string; kickoffTime: string }) => {
  const getStatusDisplay = () => {
    switch (status) {
      case 'LIVE':
        return (
          <div className="flex items-center justify-center gap-1 text-red-400">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-xs font-medium">LIVE</span>
          </div>
        );
      case 'HT':
        return (
          <div className="flex items-center justify-center gap-1 text-orange-400">
            <div className="w-2 h-2 bg-orange-500 rounded-full" />
            <span className="text-xs font-medium">HT</span>
          </div>
        );
      case 'FT':
        return (
          <div className="flex items-center justify-center">
            <span className="text-xs font-medium text-green-400">FT</span>
          </div>
        );
      case 'PRE':
        if (kickoffTime) {
          const date = new Date(kickoffTime);
          const now = new Date();
          const tomorrow = new Date(now);
          tomorrow.setDate(tomorrow.getDate() + 1);
          
          const isToday = date.toDateString() === now.toDateString();
          const isTomorrow = date.toDateString() === tomorrow.toDateString();
          const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          
          if (isToday) {
            return (
              <div className="flex flex-col items-center text-center">
                <div className="text-xs font-semibold text-blue-400 leading-tight">Today</div>
                <div className="text-xs font-medium text-muted-foreground leading-tight">{timeString}</div>
              </div>
            );
          } else if (isTomorrow) {
            return (
              <div className="flex flex-col items-center text-center">
                <div className="text-xs font-semibold text-blue-400 leading-tight">Tomorrow</div>
                <div className="text-xs font-medium text-muted-foreground leading-tight">{timeString}</div>
              </div>
            );
          } else {
            return (
              <div className="flex flex-col items-center text-center">
                <div className="text-xs font-semibold text-blue-400 leading-tight">
                  {date.toLocaleDateString([], { month: 'short', day: 'numeric' })}
                </div>
                <div className="text-xs font-medium text-muted-foreground leading-tight">{timeString}</div>
              </div>
            );
          }
        }
        return (
          <div className="flex items-center justify-center">
            <span className="text-xs font-medium text-blue-400">PRE</span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex items-center justify-end text-right min-w-[50px]">
      {getStatusDisplay()}
    </div>
  );
};

// No manual truncation – rely on CSS clamping for readability


export function MatchCard({ match, mode = 'public', adminControls }: MatchCardProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      window.location.href = `/match/${match.id}`;
    }
  };

  const kickoff = match.kickoff_utc ? new Date(match.kickoff_utc) : null;

  const TeamRow = () => (
    <div className="grid grid-cols-5 items-center gap-5">
      {/* Home Team */}
      <div className="col-span-2 flex items-center gap-4">
        <TeamLogo team={match.home_team} size={44} logoUrl={match.home_team_logo} />
        <div className="flex flex-col min-w-0">
          <span className="text-base md:text-lg font-semibold text-foreground leading-snug line-clamp-2">
            {match.home_team}
          </span>
          <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
            Home
          </span>
        </div>
      </div>
      
      {/* VS Section */}
      <div className="flex flex-col items-center justify-center">
        <div className="w-12 h-12 bg-muted/30 rounded-2xl flex items-center justify-center border border-border/50">
          <span className="text-xs font-black text-muted-foreground tracking-widest">
            VS
          </span>
        </div>
        {(match.home_score !== undefined || match.away_score !== undefined) && (
          <div className="text-lg font-bold text-primary mt-2">
            {match.home_score || 0} - {match.away_score || 0}
          </div>
        )}
      </div>
      
      {/* Away Team */}
      <div className="col-span-2 flex items-center justify-end gap-4">
        <div className="flex flex-col items-end min-w-0">
          <span className="text-base md:text-lg font-semibold text-foreground leading-snug line-clamp-2 text-right">
            {match.away_team}
          </span>
          <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
            Away
          </span>
        </div>
        <TeamLogo team={match.away_team} size={44} logoUrl={match.away_team_logo} />
      </div>
    </div>
  );

  const cardContent = (
    <div
      role="button"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className="w-full relative rounded-2xl overflow-hidden border border-border bg-card cursor-pointer transition-all duration-300 hover:shadow-xl"
      aria-label={`Match: ${match.home_team} vs ${match.away_team}`}
    >

      {/* Header with League Logo */}
      <div className="relative z-10 flex items-center justify-between px-5 py-3 border-b border-border/60">
        <div className="flex items-center gap-3 min-w-0">
          <LeagueLogo league={match.league} size={24} logoUrl={match.league_logo} />
          <span className="text-[13px] font-semibold tracking-wide text-foreground truncate">
            {match.league}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={match.status} kickoffTime={match.kickoff_utc} />
        </div>
      </div>

      {/* Body */}
      <div className="relative z-10 p-5 space-y-5">
        <TeamRow />

        {/* Premium CTA Row */}
        <div className="flex items-center justify-between bg-muted/40 p-4 rounded-xl border border-border/60">
          <div className="text-sm font-semibold text-foreground">🤖 AI Analysis</div>
          <div className="text-xs text-blue-500 font-medium">View insights →</div>
        </div>

        {/* Enhanced Admin Controls */}
        {mode === 'admin' && adminControls && (
          <div className="mt-4 pt-4 border-t border-border/50">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div
                  className={`w-3 h-3 rounded-full shadow-lg ${
                    adminControls.analysisStatus === 'completed'
                      ? 'bg-green-500 shadow-green-500/50'
                      : adminControls.analysisStatus === 'pending'
                      ? 'bg-yellow-500 animate-pulse shadow-yellow-500/50'
                      : adminControls.analysisStatus === 'failed'
                      ? 'bg-red-500 shadow-red-500/50'
                      : 'bg-muted-foreground'
                  }`}
                />
                <span className="text-xs font-semibold text-muted-foreground capitalize tracking-wide">
                  {adminControls.analysisStatus}
                </span>
              </div>
              <div
                className={`text-xs px-3 py-1.5 rounded-xl font-semibold ${
                  adminControls.isPublished
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30 shadow-lg shadow-green-500/20'
                    : 'bg-muted/50 text-muted-foreground border border-border/50'
                }`}
              >
                {adminControls.isPublished ? '✓ Published' : '○ Hidden'}
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  adminControls.onSendToAI(match.id);
                }}
                disabled={adminControls.analysisStatus === 'pending'}
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-muted disabled:to-muted disabled:text-muted-foreground disabled:cursor-not-allowed text-white text-xs font-semibold py-3 px-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
              >
                {adminControls.analysisStatus === 'pending' ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Analyzing...</span>
                  </div>
                ) : (
                  '🤖 Send to AI'
                )}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  adminControls.onTogglePublish(match.id, !adminControls.isPublished);
                }}
                className={`flex-1 text-xs font-semibold py-3 px-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 ${
                  adminControls.isPublished
                    ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white'
                    : 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white'
                }`}
              >
                {adminControls.isPublished ? '👁️‍🗨️ Hide' : '📢 Publish'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  if (mode === 'admin') {
    return <div>{cardContent}</div>;
  }

  return (
    <Link href={`/match/${match.id}`} className="block">
      {cardContent}
    </Link>
  );
}

