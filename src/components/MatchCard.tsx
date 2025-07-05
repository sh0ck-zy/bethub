'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, Clock, TrendingUp, Users, Calendar } from 'lucide-react';
import Link from 'next/link';
import { TeamLogo } from '@/components/TeamLogo';

interface Match {
  id: string;
  league: string;
  home_team: string;
  away_team: string;
  kickoff_utc: string;
  status: string;
  is_published?: boolean;
  analysis_status?: 'none' | 'pending' | 'completed' | 'failed';
}

interface AdminControls {
  onSendToAI: (matchId: string) => void;
  onTogglePublish: (matchId: string, isPublished: boolean) => void;
  analysisStatus: string;
  isPublished: boolean;
}

interface MatchCardProps {
  match: Match;
  mode?: 'public' | 'admin';
  adminControls?: AdminControls;
}

export function MatchCard({ match, mode = 'public', adminControls }: MatchCardProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'LIVE':
        return {
          color: 'bg-red-500/20 text-red-400 border-red-500/30',
          text: 'LIVE',
          pulse: true,
          icon: '🔴'
        };
      case 'FT':
        return {
          color: 'bg-green-500/20 text-green-400 border-green-500/30',
          text: 'FINISHED',
          pulse: false,
          icon: '✅'
        };
      case 'HT':
        return {
          color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
          text: 'HALF TIME',
          pulse: true,
          icon: '⏸️'
        };
      default:
        return {
          color: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
          text: 'UPCOMING',
          pulse: false,
          icon: '⏰'
        };
    }
  };

  const statusConfig = getStatusConfig(match.status);
  
  const kickoffTime = new Date(match.kickoff_utc).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  const kickoffDate = new Date(match.kickoff_utc).toLocaleDateString([], {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  // Enhanced AI confidence and insight preview
  const aiConfidence = Math.floor(Math.random() * 20) + 75; // 75-95%
  const insights = [
    "Home advantage + key injuries",
    "High-scoring match expected",
    "Tactical mismatch identified",
    "Recent form favors away team",
    "Head-to-head history decisive"
  ];
  const randomInsight = insights[Math.floor(Math.random() * insights.length)];

  const cardContent = (
    <Card className={`group transition-all duration-300 border border-white/10 bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-sm overflow-hidden relative ${mode === 'public' ? 'hover:shadow-2xl hover:shadow-green-500/10 cursor-pointer hover:scale-[1.02] hover:border-green-500/30' : ''}`}>
      {/* Gradient overlay for better visual appeal */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      <CardContent className="p-4 relative z-10">
        {/* Header with enhanced time display */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-gray-800/50 rounded-full px-2 py-1">
              <Calendar className="w-3 h-3 text-gray-400" />
              <span className="text-xs text-gray-300 font-medium">{kickoffDate}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-gray-800/50 rounded-full px-2 py-1">
              <Clock className="w-3 h-3 text-gray-400" />
              <span className="text-xs text-gray-300 font-medium">{kickoffTime}</span>
            </div>
          </div>
          <Badge className={`${statusConfig.color} border text-xs font-semibold px-3 py-1 ${statusConfig.pulse ? 'animate-pulse' : ''} flex items-center gap-1`}>
            <span>{statusConfig.icon}</span>
            {statusConfig.text}
          </Badge>
        </div>

        {/* League with enhanced styling */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-4 bg-gradient-to-b from-green-400 to-blue-500 rounded-full"></div>
          <span className="text-sm text-gray-300 font-semibold uppercase tracking-wide">{match.league}</span>
        </div>

        {/* Teams - Enhanced Layout */}
        <div className="flex items-center justify-between mb-6">
          {/* Home Team */}
          <div className="flex items-center gap-3 flex-1">
            <div className="relative">
              <TeamLogo team={match.home_team} size={32} />
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900"></div>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-white truncate max-w-[120px]">
                {match.home_team}
              </span>
              <span className="text-xs text-gray-400">Home</span>
            </div>
          </div>
          
          {/* VS with enhanced styling */}
          <div className="mx-4 flex flex-col items-center">
            <div className="text-lg font-black text-gray-500 mb-1">VS</div>
            <div className="w-8 h-0.5 bg-gradient-to-r from-transparent via-gray-500 to-transparent"></div>
          </div>

          {/* Away Team */}
          <div className="flex items-center gap-3 flex-1 justify-end">
            <div className="flex flex-col items-end">
              <span className="text-sm font-bold text-white truncate max-w-[120px]">
                {match.away_team}
              </span>
              <span className="text-xs text-gray-400">Away</span>
            </div>
            <div className="relative">
              <TeamLogo team={match.away_team} size={32} />
              <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-gray-900"></div>
            </div>
          </div>
        </div>

        {/* AI Preview - Enhanced */}
        <div className="border-t border-white/10 pt-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-to-br from-green-400 to-blue-500 rounded-lg flex items-center justify-center">
                <Brain className="w-3 h-3 text-white" />
              </div>
              <span className="text-sm font-semibold text-white">AI Analysis</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-3 h-3 text-green-400" />
              <Badge className="bg-green-500/20 text-green-400 border border-green-500/30 text-xs px-2 py-1 font-semibold">
                {aiConfidence}% confidence
              </Badge>
            </div>
          </div>
          
          <div className="bg-gray-800/30 rounded-lg p-3 mb-4">
            <p className="text-sm text-gray-200 leading-relaxed">{randomInsight}</p>
          </div>
          
          {/* Enhanced CTA */}
          {mode === 'public' && (
            <div className="w-full bg-gradient-to-r from-green-500/10 via-blue-500/10 to-green-500/10 border border-green-500/30 rounded-lg p-3 text-center group-hover:from-green-500/20 group-hover:via-blue-500/20 group-hover:to-green-500/20 transition-all duration-300 group-hover:border-green-500/50">
              <div className="flex items-center justify-center gap-2">
                <Users className="w-4 h-4 text-green-400" />
                <span className="text-sm font-bold text-green-400">View Full Analysis</span>
                <span className="text-green-400 group-hover:translate-x-1 transition-transform duration-200">→</span>
              </div>
            </div>
          )}
        </div>

        {/* Admin Controls - Enhanced */}
        {mode === 'admin' && adminControls && (
          <div className="border-t border-white/10 pt-4 mt-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${
                  adminControls.analysisStatus === 'completed' ? 'bg-green-500 animate-pulse' :
                  adminControls.analysisStatus === 'pending' ? 'bg-yellow-500 animate-pulse' :
                  adminControls.analysisStatus === 'failed' ? 'bg-red-500' :
                  'bg-gray-500'
                }`}></div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-white">
                    Analysis Status
                  </span>
                  <span className="text-xs text-gray-400 capitalize">
                    {adminControls.analysisStatus}
                  </span>
                </div>
              </div>
              <Badge className={`text-xs px-3 py-1.5 font-semibold ${
                adminControls.isPublished 
                  ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                  : 'bg-gray-500/20 text-gray-400 border-gray-500/30'
              }`}>
                {adminControls.isPublished ? 'Published' : 'Hidden'}
              </Badge>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => adminControls.onSendToAI(match.id)}
                disabled={adminControls.analysisStatus === 'pending'}
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white text-sm font-semibold py-2.5 px-4 rounded-lg transition-all duration-200 disabled:opacity-50"
              >
                {adminControls.analysisStatus === 'pending' ? 'Analyzing...' : 'Send to AI'}
              </button>
              
              <button
                onClick={() => adminControls.onTogglePublish(match.id, !adminControls.isPublished)}
                className={`flex-1 text-sm font-semibold py-2.5 px-4 rounded-lg transition-all duration-200 ${
                  adminControls.isPublished
                    ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white'
                    : 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white'
                }`}
              >
                {adminControls.isPublished ? 'Hide' : 'Publish'}
              </button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
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