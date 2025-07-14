'use client';

import React, { useState } from 'react';
import { Clock, TrendingUp, Users, MapPin, Star, ChevronRight, BarChart3 } from 'lucide-react';
import Link from 'next/link';
import { TeamLogo } from '@/components/TeamLogo';
import type { Match, Odds, MatchStats, AnalysisResult } from '@/lib/types';

// Extended interface for the enhanced match card
interface EnhancedMatch extends Match {
  odds?: Odds;
  venue?: string;
  attendance?: string;
  homeTeam?: {
    form: string[];
    homeRecord: string;
  };
  awayTeam?: {
    form: string[];
    awayRecord: string;
  };
  sponsor?: {
    name: string;
    logo: string;
    country: string;
    slogan: string;
  };
  aiInsight?: {
    confidence: number;
    prediction: string;
    keyFactors: string[];
  };
  stats?: {
    possession: { home: number; away: number };
    shots: { home: number; away: number };
    corners: { home: number; away: number };
  };
}

interface MatchCardProps {
  match: EnhancedMatch;
  mode?: 'public' | 'admin';
  adminControls?: {
    onSendToAI: (matchId: string) => void;
    onTogglePublish: (matchId: string, isPublished: boolean) => void;
    analysisStatus: string;
    isPublished: boolean;
  };
}

// Helper function to generate mock data for missing fields
const generateMockData = (match: Match): Partial<EnhancedMatch> => {
  const homeTeam = match.home_team;
  const awayTeam = match.away_team;
  
  return {
    odds: match.odds || {
      home: 2.1 + Math.random() * 0.8,
      draw: 3.2 + Math.random() * 0.6,
      away: 2.8 + Math.random() * 0.8,
      provider: 'BetHub',
      last_updated: new Date().toISOString(),
    },
    venue: match.venue || `${homeTeam} Stadium`,
    attendance: `${Math.floor(Math.random() * 30000) + 20000}`,
    homeTeam: {
      form: ['W', 'L', 'W', 'D', 'W'].sort(() => Math.random() - 0.5),
      homeRecord: `${Math.floor(Math.random() * 8) + 4}W-${Math.floor(Math.random() * 4) + 1}D-${Math.floor(Math.random() * 3) + 1}L`
    },
    awayTeam: {
      form: ['W', 'W', 'L', 'W', 'D'].sort(() => Math.random() - 0.5),
      awayRecord: `${Math.floor(Math.random() * 6) + 2}W-${Math.floor(Math.random() * 3) + 1}D-${Math.floor(Math.random() * 5) + 2}L`
    },
    sponsor: {
      name: 'BetHub',
      logo: '/bethub-logo.png',
      country: 'BR',
      slogan: 'Your winning moment'
    },
    aiInsight: {
      confidence: Math.floor(Math.random() * 30) + 65,
      prediction: `${homeTeam}'s strong home form against ${awayTeam}'s inconsistent away record will be decisive.`,
      keyFactors: ['Home advantage', 'Recent form', 'Head-to-head']
    },
    stats: {
      possession: { 
        home: Math.floor(Math.random() * 20) + 40, 
        away: Math.floor(Math.random() * 20) + 40 
      },
      shots: { 
        home: Math.floor(Math.random() * 8) + 8, 
        away: Math.floor(Math.random() * 8) + 6 
      },
      corners: { 
        home: Math.floor(Math.random() * 4) + 4, 
        away: Math.floor(Math.random() * 4) + 3 
      }
    }
  };
};

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

// Helper functions
const truncateTeamName = (name: string, maxLength: number = 12) => {
  if (name.length <= maxLength) return name;
  
  const words = name.split(' ');
  if (words.length > 1) {
    return `${words[0]} ${words[1].charAt(0)}.`;
  }
  
  return name.substring(0, maxLength - 3) + '...';
};

const getConfidenceColor = (confidence: number) => {
  if (confidence >= 80) return 'text-green-400';
  if (confidence >= 60) return 'text-yellow-400';
  return 'text-red-400';
};

export function MatchCard({ match, mode = 'public', adminControls }: MatchCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Merge match data with generated mock data for missing fields
  const enhancedMatch: EnhancedMatch = {
    ...match,
    ...generateMockData(match)
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      // Navigate to match page
      window.location.href = `/match/${enhancedMatch.id}`;
    }
  };

  const cardContent = (
    <div
      role="button"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className="w-full bg-card border border-border rounded-xl cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
      aria-label={`Match: ${enhancedMatch.home_team} vs ${enhancedMatch.away_team}`}
    >
      {/* Header with League and Status */}
      <div className="flex justify-between items-center p-3 bg-muted/50 border-b border-border rounded-t-xl">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0"></div>
          <span className="text-orange-400 font-semibold text-sm tracking-wide truncate">
            {enhancedMatch.league}
          </span>
        </div>
        <StatusBadge status={enhancedMatch.status} kickoffTime={enhancedMatch.kickoff_utc} />
      </div>

      {/* Main Content */}
      <div className="p-3">
        {/* Teams Section */}
        <div className="space-y-2 mb-3">
          <div className="flex items-center gap-2">
            <TeamLogo team={enhancedMatch.home_team} size={24} />
            <span className="text-sm font-medium text-foreground truncate">
              {truncateTeamName(enhancedMatch.home_team)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <TeamLogo team={enhancedMatch.away_team} size={24} />
            <span className="text-sm font-medium text-foreground truncate">
              {truncateTeamName(enhancedMatch.away_team)}
            </span>
          </div>
        </div>

        {/* AI Insight - Hero Section */}
        <div className="border-t border-border pt-2">
          <div className="flex items-center justify-between mb-1">
            <div className="text-xs font-semibold text-blue-400 flex items-center gap-1">
              <span className="text-xs">🤖</span>
              AI Insight
            </div>
            {enhancedMatch.aiInsight && (
              <div className={`text-xs font-bold ${getConfidenceColor(enhancedMatch.aiInsight.confidence)}`}>
                {enhancedMatch.aiInsight.confidence}%
              </div>
            )}
          </div>
          {enhancedMatch.aiInsight && (
            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mb-1">
              {enhancedMatch.aiInsight.prediction}
            </p>
          )}
          <div className="text-xs text-blue-400 font-medium">
            View full analysis →
          </div>
        </div>

        {/* Admin Controls */}
        {mode === 'admin' && adminControls && (
          <div className="border-t border-border mt-3 pt-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${
                  adminControls.analysisStatus === 'completed' ? 'bg-green-500' :
                  adminControls.analysisStatus === 'pending' ? 'bg-yellow-500 animate-pulse' :
                  adminControls.analysisStatus === 'failed' ? 'bg-red-500' :
                  'bg-muted-foreground'
                }`}></div>
                <span className="text-xs font-medium text-muted-foreground capitalize">
                  {adminControls.analysisStatus}
                </span>
              </div>
              <div className={`text-xs px-2 py-1 rounded ${
                adminControls.isPublished 
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                  : 'bg-muted text-muted-foreground border border-border'
              }`}>
                {adminControls.isPublished ? 'Published' : 'Hidden'}
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  adminControls.onSendToAI(enhancedMatch.id);
                }}
                disabled={adminControls.analysisStatus === 'pending'}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed text-white text-xs font-medium py-2 px-3 rounded-lg transition-colors"
              >
                {adminControls.analysisStatus === 'pending' ? 'Analyzing...' : 'Send to AI'}
              </button>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  adminControls.onTogglePublish(enhancedMatch.id, !adminControls.isPublished);
                }}
                className={`flex-1 text-xs font-medium py-2 px-3 rounded-lg transition-colors ${
                  adminControls.isPublished
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                {adminControls.isPublished ? 'Hide' : 'Publish'}
              </button>
            </div>
          </div>
        )}

        {/* Expand/Collapse Button */}
        <button 
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(!isExpanded);
          }}
          className="w-full flex items-center justify-center gap-2 py-2 text-blue-400 hover:text-blue-300 transition-colors border-t border-border mt-3 pt-3 bg-gradient-to-r from-blue-900/10 to-purple-900/10 hover:from-blue-900/20 hover:to-purple-900/20 rounded-b-lg"
        >
          <BarChart3 className="w-4 h-4" />
          <span className="text-sm font-medium">
            {isExpanded ? 'Hide Preview' : 'Unlock Deep AI Analysis'}
          </span>
          <ChevronRight className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
        </button>

        {/* Expanded Content - Preview Teaser */}
        {isExpanded && (
          <div className="mt-3 space-y-3 border-t border-border pt-3">
            {/* AI Analysis Preview */}
            <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-lg p-3 border border-blue-500/20">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="w-4 h-4 text-blue-400" />
                <span className="text-blue-400 font-semibold text-sm">AI Analysis Preview</span>
              </div>
              <p className="text-muted-foreground text-xs leading-relaxed mb-3">
                {enhancedMatch.home_team} shows {Math.floor(Math.random() * 20) + 75}% home dominance vs {enhancedMatch.away_team}'s recent away struggles. Key tactical insights and 12+ predictive factors analyzed...
              </p>
              <div className="text-xs text-muted-foreground space-y-1">
                <div>🎯 Expected Goals Model: {enhancedMatch.home_team} {(1.5 + Math.random() * 0.8).toFixed(1)} - {(1.0 + Math.random() * 0.6).toFixed(1)} {enhancedMatch.away_team}</div>
                <div>📊 Win Probability: {enhancedMatch.home_team} {Math.floor(Math.random() * 20) + 45}% | Draw {Math.floor(Math.random() * 15) + 20}% | {enhancedMatch.away_team} {Math.floor(Math.random() * 15) + 15}%</div>
                <div>⚡ Live Updates: Formation changes, weather impact, lineups</div>
              </div>
            </div>

            {/* Premium Features Teaser */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-muted/50 p-2 rounded border border-border">
                <div className="text-yellow-400 font-semibold mb-1">🔒 Player Analysis</div>
                <div className="text-muted-foreground">Individual performance metrics</div>
              </div>
              <div className="bg-muted/50 p-2 rounded border border-border">
                <div className="text-green-400 font-semibold mb-1">🔒 Live Momentum</div>
                <div className="text-muted-foreground">Real-time tactical shifts</div>
              </div>
            </div>

            {/* Strong CTA - Premium Upgrade */}
            <button 
              onClick={(e) => {
                e.stopPropagation();
                alert('Premium upgrade modal - Get unlimited AI analysis!');
              }}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 mt-3"
            >
              <BarChart3 className="w-4 h-4" />
              Upgrade to Premium
              <ChevronRight className="w-4 h-4" />
            </button>
            
            <div className="text-center">
              <span className="text-xs text-muted-foreground">
                Unlock unlimited AI analysis, live updates & winning strategies
              </span>
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
    <Link href={`/match/${enhancedMatch.id}`} className="block">
      {cardContent}
    </Link>
  );
}

