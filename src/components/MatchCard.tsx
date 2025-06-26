'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, TrendingUp, BarChart3, Star, Users, Target } from 'lucide-react';
import Link from 'next/link';
import { TeamLogo, getTeamColor } from '@/components/TeamLogo';

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
  const kickoffTime = new Date(match.kickoff_utc).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  const kickoffDate = new Date(match.kickoff_utc).toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
  });

  const getStatusConfig = (status: string) => {
    const now = new Date();
    const kickoff = new Date(match.kickoff_utc);
    
    // Determine if match should be LIVE based on current time
    if (status === 'LIVE' && kickoff > now) {
      status = 'PRE';
    }

    // Normalize status to one of three states
    if (!['LIVE', 'PRE', 'FT'].includes(status)) {
      status = 'PRE';
    }

    switch (status) {
      case 'LIVE':
        return {
          color: 'border-red-500 text-red-500',
          text: '🔴 Live',
          glow: 'shadow-[0_0_2px_rgba(239,68,68,0.2)]'
        };
      case 'PRE':
        return {
          color: 'border-blue-500 text-blue-500',
          text: '⏰ Coming Up',
          glow: 'shadow-[0_0_2px_rgba(59,130,246,0.2)]'
        };
      case 'FT':
        return {
          color: 'border-green-500 text-green-500',
          text: '✅ Finished',
          glow: 'shadow-[0_0_2px_rgba(34,197,94,0.2)]'
        };
      default:
        return {
          color: 'border-blue-500 text-blue-500',
          text: '⏰ Coming Up',
          glow: 'shadow-[0_0_2px_rgba(59,130,246,0.2)]'
        };
    }
  };

  const statusConfig = getStatusConfig(match.status);

  // Mock confidence score for demo
  const confidenceScore = Math.floor(Math.random() * 30) + 70;

  return (
    <Link href={`/match/${match.id}`}>
      <Card className="premium-card group hover:scale-[1.02] transition-all duration-500 cursor-pointer overflow-hidden relative w-full h-[600px] flex flex-col">
        {/* Background gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        
        {/* League Header */}
        <CardHeader className="pb-4 relative z-10 flex-shrink-0">
          <div className="flex justify-between items-start">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-green-400 to-blue-500 animate-pulse"></div>
              <span className="text-xs font-semibold text-green-400 uppercase tracking-wider">
                {match.league}
              </span>
              <Star className="w-3 h-3 text-yellow-400 fill-current" />
            </div>
            <Badge className={`bg-transparent ${statusConfig.color} border px-3 py-1.5 ${statusConfig.glow}`}>
              {statusConfig.text}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 relative z-10 flex-1 flex flex-col">
          {/* Teams Section */}
          <div className="space-y-4 flex-1">
            {/* Home Team */}
            <div 
              className="flex items-center justify-between p-5 rounded-xl bg-gradient-to-r from-white/5 to-white/10 hover:from-green-500/10 hover:to-blue-500/10 transition-all duration-300 border h-[80px]"
              style={{ borderColor: `${getTeamColor(match.home_team)}20` }}
            >
              <div className="flex items-center space-x-4 flex-1 min-w-0">
                <div className="flex-shrink-0">
                  <TeamLogo team={match.home_team} size={56} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-white group-hover:text-green-400 transition-colors text-lg truncate">
                    {match.home_team}
                  </div>
                  <div className="text-xs text-green-400 font-medium uppercase tracking-wide">
                    Home Advantage
                  </div>
                </div>
              </div>
              <div className="text-right space-y-1 flex-shrink-0 w-16">
                <div className="text-xl font-bold text-green-400">
                  {Math.floor(Math.random() * 3) + 1}.{Math.floor(Math.random() * 9)}
                </div>
                <div className="text-xs text-gray-400">Odds</div>
              </div>
            </div>

            {/* VS Divider with enhanced styling */}
            <div className="relative flex items-center justify-center py-2 h-[40px]">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full h-px bg-gradient-to-r from-transparent via-green-400/50 to-transparent"></div>
              </div>
              <div className="relative bg-gray-900 px-4 py-2 rounded-full border border-green-400/30">
                <span className="text-sm font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                  VS
                </span>
              </div>
            </div>

            {/* Away Team */}
            <div 
              className="flex items-center justify-between p-5 rounded-xl bg-gradient-to-r from-white/5 to-white/10 hover:from-blue-500/10 hover:to-purple-500/10 transition-all duration-300 border h-[80px]"
              style={{ borderColor: `${getTeamColor(match.away_team)}20` }}
            >
              <div className="flex items-center space-x-4 flex-1 min-w-0">
                <div className="flex-shrink-0">
                  <TeamLogo team={match.away_team} size={56} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-white group-hover:text-blue-400 transition-colors text-lg truncate">
                    {match.away_team}
                  </div>
                  <div className="text-xs text-blue-400 font-medium uppercase tracking-wide">
                    Away Challenge
                  </div>
                </div>
              </div>
              <div className="text-right space-y-1 flex-shrink-0 w-16">
                <div className="text-xl font-bold text-blue-400">
                  {Math.floor(Math.random() * 3) + 2}.{Math.floor(Math.random() * 9)}
                </div>
                <div className="text-xs text-gray-400">Odds</div>
              </div>
            </div>
          </div>

          {/* Match Stats Preview */}
          <div className="grid grid-cols-3 gap-3 p-4 rounded-xl bg-gradient-to-r from-gray-800/50 to-gray-700/50 border border-white/10 flex-shrink-0">
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <Target className="w-4 h-4 text-green-400" />
              </div>
              <div className="text-lg font-bold text-white">{confidenceScore}%</div>
              <div className="text-xs text-gray-400">AI Confidence</div>
            </div>
            <div className="text-center border-x border-white/10">
              <div className="flex items-center justify-center mb-1">
                <Users className="w-4 h-4 text-blue-400" />
              </div>
              <div className="text-lg font-bold text-white">{Math.floor(Math.random() * 50) + 20}K</div>
              <div className="text-xs text-gray-400">Watching</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <BarChart3 className="w-4 h-4 text-purple-400" />
              </div>
              <div className="text-lg font-bold text-white">{Math.floor(Math.random() * 10) + 5}</div>
              <div className="text-xs text-gray-400">Key Stats</div>
            </div>
          </div>

          {/* Match Info Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-white/10 flex-shrink-0">
            <div className="flex items-center space-x-3">
              <Clock className="w-4 h-4 text-gray-400" />
              <div>
                <div className="text-sm font-medium text-white">{kickoffTime}</div>
                <div className="text-xs text-gray-400">{kickoffDate}</div>
              </div>
            </div>
            <div className="flex items-center space-x-2 px-4 py-2 rounded-full bg-gradient-to-r from-green-500/20 to-blue-500/20 border border-green-500/30 group-hover:from-green-500/30 group-hover:to-blue-500/30 transition-all duration-300 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-2000 ease-in-out"></div>
              <TrendingUp className="w-4 h-4 text-green-400 relative z-10" />
              <span className="text-sm font-semibold text-green-400 relative z-10">Deep AI Analysis</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}