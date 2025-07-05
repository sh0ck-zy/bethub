'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, Clock } from 'lucide-react';
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
          pulse: true
        };
      case 'FT':
        return {
          color: 'bg-green-500/20 text-green-400 border-green-500/30',
          text: 'FT',
          pulse: false
        };
      default:
        return {
          color: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
          text: 'UPCOMING',
          pulse: false
        };
    }
  };

  const statusConfig = getStatusConfig(match.status);
  
  const kickoffTime = new Date(match.kickoff_utc).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  // AI confidence and insight preview
  const aiConfidence = Math.floor(Math.random() * 20) + 75; // 75-95%
  const insights = [
    "Home advantage + key injuries",
    "High-scoring match expected",
    "Tactical mismatch identified"
  ];
  const randomInsight = insights[Math.floor(Math.random() * insights.length)];

  const CardWrapper = mode === 'admin' ? 'div' : Link;
  const cardProps = mode === 'admin' 
    ? {} 
    : { href: `/match/${match.id}`, className: "block" };

  return (
    <CardWrapper {...cardProps}>
      <Card className={`group transition-all duration-200 border border-white/10 bg-gray-900/90 backdrop-blur-sm overflow-hidden ${mode === 'public' ? 'hover:shadow-xl cursor-pointer hover:bg-gray-900/95' : ''}`}>
        <CardContent className="p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-3 h-3 text-gray-400" />
              <span className="text-xs text-gray-400">{kickoffTime}</span>
            </div>
            <Badge className={`${statusConfig.color} border text-xs font-medium px-2 py-0.5 ${statusConfig.pulse ? 'animate-pulse' : ''}`}>
              {statusConfig.text}
            </Badge>
          </div>

          {/* League */}
          <div className="text-xs text-gray-400 mb-3 font-medium">{match.league}</div>

          {/* Teams - Horizontal Layout */}
          <div className="flex items-center justify-between mb-4">
            {/* Home Team */}
            <div className="flex items-center gap-2 flex-1">
              <TeamLogo team={match.home_team} size={24} />
              <span className="text-sm font-semibold text-white truncate">
                {match.home_team}
              </span>
            </div>
            
            {/* VS */}
            <div className="mx-3 text-xs font-bold text-gray-500">VS</div>

            {/* Away Team */}
            <div className="flex items-center gap-2 flex-1 justify-end">
              <span className="text-sm font-semibold text-white truncate">
                {match.away_team}
              </span>
              <TeamLogo team={match.away_team} size={24} />
            </div>
          </div>

          {/* AI Preview */}
          <div className="border-t border-white/10 pt-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1">
                <Brain className="w-3 h-3 text-green-400" />
                <span className="text-xs font-medium text-green-400">AI Analysis</span>
              </div>
              <Badge className="bg-green-500/20 text-green-400 border border-green-500/30 text-xs px-1.5 py-0.5">
                {aiConfidence}% confidence
              </Badge>
            </div>
            <p className="text-xs text-gray-300 mb-3">{randomInsight}</p>
            
            {/* CTA */}
            {mode === 'public' && (
              <div className="w-full bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/30 rounded-lg p-2 text-center group-hover:from-green-500/20 group-hover:to-blue-500/20 transition-all duration-200">
                <span className="text-xs font-semibold text-green-400">View Full Analysis →</span>
              </div>
            )}
          </div>

          {/* Admin Controls */}
          {mode === 'admin' && adminControls && (
            <div className="border-t border-white/10 pt-3 mt-3">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    adminControls.analysisStatus === 'completed' ? 'bg-green-500' :
                    adminControls.analysisStatus === 'pending' ? 'bg-yellow-500' :
                    adminControls.analysisStatus === 'failed' ? 'bg-red-500' :
                    'bg-gray-500'
                  }`}></div>
                  <span className="text-xs text-gray-400">
                    Analysis: {adminControls.analysisStatus}
                  </span>
                </div>
                <Badge className={`text-xs px-2 py-1 ${
                  adminControls.isPublished 
                    ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                    : 'bg-gray-500/20 text-gray-400 border-gray-500/30'
                }`}>
                  {adminControls.isPublished ? 'Published' : 'Hidden'}
                </Badge>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => adminControls.onSendToAI(match.id)}
                  disabled={adminControls.analysisStatus === 'pending'}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white text-xs font-medium py-2 px-3 rounded-lg transition-colors"
                >
                  {adminControls.analysisStatus === 'pending' ? 'Analyzing...' : 'Send to AI'}
                </button>
                
                <button
                  onClick={() => adminControls.onTogglePublish(match.id, !adminControls.isPublished)}
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
        </CardContent>
      </Card>
    </CardWrapper>
  );
}