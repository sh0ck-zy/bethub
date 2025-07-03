'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Brain, Target } from 'lucide-react';
import Link from 'next/link';
import { TeamLogo } from '@/components/TeamLogo';

interface Match {
  id: string;
  league: string;
  home_team: string;
  away_team: string;
  kickoff_utc: string;
  status: string;
}

interface MatchCardProps {
  match: Match;
}

export function MatchCard({ match }: MatchCardProps) {
  const getStatusConfig = (status: string) => {
    const now = new Date();
    const kickoff = new Date(match.kickoff_utc);
    
    if (status === 'LIVE' && kickoff > now) {
      status = 'PRE';
    }

    if (!['LIVE', 'PRE', 'FT'].includes(status)) {
      status = 'PRE';
    }

    switch (status) {
      case 'LIVE':
        return {
          color: 'bg-red-500/10 text-red-400 border-red-500/20',
          text: 'Live',
          icon: '🔴',
          pulse: true
        };
      case 'PRE':
        return {
          color: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
          text: 'Coming Up',
          icon: '⏰',
          pulse: false
        };
      case 'FT':
        return {
          color: 'bg-green-500/10 text-green-400 border-green-500/20',
          text: 'Finished',
          icon: '✅',
          pulse: false
        };
      default:
        return {
          color: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
          text: 'Coming Up',
          icon: '⏰',
          pulse: false
        };
    }
  };

  const statusConfig = getStatusConfig(match.status);
  
  const kickoffTime = new Date(match.kickoff_utc).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  // Mock AI insights - keep them short and impactful
  const insights = [
    `${Math.floor(Math.random() * 30) + 70}% win probability`,
    `Over 2.5 goals likely`
  ];

      return (
      <Link href={`/match/${match.id}`} className="block">
        <Card className="group hover:scale-[1.02] hover:shadow-lg transition-all duration-300 cursor-pointer border border-white/10 bg-gray-900/80 backdrop-blur-sm hover:bg-gray-900/90">
          <CardContent className="p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-base">⚽</span>
                <span className="text-sm font-medium text-gray-300">{match.league}</span>
              </div>
              <Badge className={`${statusConfig.color} border text-xs font-medium px-2 py-1 ${statusConfig.pulse ? 'animate-pulse' : ''}`}>
                <span className="mr-1">{statusConfig.icon}</span>
                {statusConfig.text}
              </Badge>
            </div>

            {/* Teams Section */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <TeamLogo team={match.home_team} size={40} />
                  <span className="text-base font-semibold text-white">
                    {match.home_team}
                  </span>
                </div>
                <div className="text-sm font-medium text-gray-400">
                  vs
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-base font-semibold text-white">
                    {match.away_team}
                  </span>
                  <TeamLogo team={match.away_team} size={40} />
                </div>
              </div>
              
              {/* Match time */}
              <div className="text-center text-sm text-gray-400">
                {kickoffTime}
              </div>
            </div>

            {/* AI Insights */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="w-4 h-4 text-purple-400" />
                <span className="text-sm font-medium text-purple-400">AI Insights</span>
              </div>
              <div className="space-y-1">
                {insights.map((insight, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Target className="w-3 h-3 text-green-400" />
                    <span className="text-sm text-gray-300">{insight}</span>
                  </div>
                ))}
              </div>
            </div>

                      {/* CTA Button */}
            <div className="flex justify-center">
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-green-500/20 to-blue-500/20 border border-green-500/30 group-hover:from-green-500/30 group-hover:to-blue-500/30 transition-all duration-300">
                <TrendingUp className="w-4 h-4 text-green-400" />
                <span className="text-sm font-semibold text-green-400">View Analysis</span>
              </div>
            </div>
        </CardContent>
      </Card>
    </Link>
  );
}