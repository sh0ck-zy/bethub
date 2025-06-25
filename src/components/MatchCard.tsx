'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, TrendingUp, BarChart3, Star, Users, Target } from 'lucide-react';
import Link from 'next/link';

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

// Enhanced team logo component with better styling
const TeamLogo = ({ team, size = 'w-10 h-10' }: { team: string; size?: string }) => {
  const getTeamColor = (teamName: string) => {
    const colors: { [key: string]: string } = {
      'Manchester United': 'from-red-600 via-red-700 to-red-800',
      'Liverpool': 'from-red-700 via-red-800 to-red-900',
      'Arsenal': 'from-red-600 via-red-700 to-yellow-500',
      'Chelsea': 'from-blue-600 via-blue-700 to-blue-800',
      'Real Madrid': 'from-purple-600 via-white to-yellow-400',
      'Barcelona': 'from-blue-700 via-blue-800 to-red-600',
      'Bayern Munich': 'from-red-600 via-red-700 to-blue-800',
      'Borussia Dortmund': 'from-yellow-400 via-yellow-500 to-black',
      'Juventus': 'from-black via-gray-800 to-white',
      'AC Milan': 'from-red-600 via-red-700 to-black',
    };
    return colors[teamName] || 'from-slate-600 via-slate-700 to-slate-800';
  };

  const initials = team.split(' ').map(word => word[0]).join('').substring(0, 2);
  
  return (
    <div className={`${size} rounded-xl bg-gradient-to-br ${getTeamColor(team)} flex items-center justify-center text-white font-bold text-sm shadow-xl border border-white/20 team-logo relative overflow-hidden`}>
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
      <span className="relative z-10">{initials}</span>
    </div>
  );
};

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
    switch (status) {
      case 'LIVE':
        return {
          color: 'status-live',
          text: '🔴 LIVE',
          glow: 'shadow-red-500/50'
        };
      case 'PRE':
        return {
          color: 'status-upcoming',
          text: '⏰ Upcoming',
          glow: 'shadow-blue-500/50'
        };
      case 'FT':
        return {
          color: 'status-finished',
          text: '✅ Finished',
          glow: 'shadow-green-500/50'
        };
      case 'HT':
        return {
          color: 'bg-gradient-to-r from-orange-500 to-orange-600',
          text: '⏸️ Half Time',
          glow: 'shadow-orange-500/50'
        };
      default:
        return {
          color: 'bg-gradient-to-r from-gray-500 to-gray-600',
          text: status,
          glow: 'shadow-gray-500/50'
        };
    }
  };

  const statusConfig = getStatusConfig(match.status);

  // Mock confidence score for demo
  const confidenceScore = Math.floor(Math.random() * 30) + 70;

  return (
    <Link href={`/match/${match.id}`}>
      <Card className="premium-card group hover:scale-[1.02] transition-all duration-500 cursor-pointer overflow-hidden relative">
        {/* Background gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        
        {/* League Header */}
        <CardHeader className="pb-4 relative z-10">
          <div className="flex justify-between items-start">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-green-400 to-blue-500 animate-pulse"></div>
              <span className="text-xs font-semibold text-green-400 uppercase tracking-wider">
                {match.league}
              </span>
              <Star className="w-3 h-3 text-yellow-400 fill-current" />
            </div>
            <Badge className={`${statusConfig.color} text-white text-xs font-bold px-3 py-1.5 shadow-lg ${statusConfig.glow} border-0`}>
              {statusConfig.text}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 relative z-10">
          {/* Teams Section */}
          <div className="space-y-4">
            {/* Home Team */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-white/5 to-white/10 hover:from-green-500/10 hover:to-blue-500/10 transition-all duration-300 border border-white/10">
              <div className="flex items-center space-x-4">
                <TeamLogo team={match.home_team} size="w-12 h-12" />
                <div>
                  <div className="font-bold text-white group-hover:text-green-400 transition-colors text-lg">
                    {match.home_team}
                  </div>
                  <div className="text-xs text-green-400 font-medium uppercase tracking-wide">
                    Home Advantage
                  </div>
                </div>
              </div>
              <div className="text-right space-y-1">
                <div className="text-2xl font-bold text-green-400">
                  {Math.floor(Math.random() * 3) + 1}.{Math.floor(Math.random() * 9)}
                </div>
                <div className="text-xs text-gray-400">Odds</div>
              </div>
            </div>

            {/* VS Divider with enhanced styling */}
            <div className="relative flex items-center justify-center py-2">
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
            <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-white/5 to-white/10 hover:from-blue-500/10 hover:to-purple-500/10 transition-all duration-300 border border-white/10">
              <div className="flex items-center space-x-4">
                <TeamLogo team={match.away_team} size="w-12 h-12" />
                <div>
                  <div className="font-bold text-white group-hover:text-blue-400 transition-colors text-lg">
                    {match.away_team}
                  </div>
                  <div className="text-xs text-blue-400 font-medium uppercase tracking-wide">
                    Away Challenge
                  </div>
                </div>
              </div>
              <div className="text-right space-y-1">
                <div className="text-2xl font-bold text-blue-400">
                  {Math.floor(Math.random() * 3) + 2}.{Math.floor(Math.random() * 9)}
                </div>
                <div className="text-xs text-gray-400">Odds</div>
              </div>
            </div>
          </div>

          {/* Match Stats Preview */}
          <div className="grid grid-cols-3 gap-3 p-4 rounded-xl bg-gradient-to-r from-gray-800/50 to-gray-700/50 border border-white/10">
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
          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            <div className="flex items-center space-x-3">
              <Clock className="w-4 h-4 text-gray-400" />
              <div>
                <div className="text-sm font-medium text-white">{kickoffTime}</div>
                <div className="text-xs text-gray-400">{kickoffDate}</div>
              </div>
            </div>
            <div className="flex items-center space-x-2 px-4 py-2 rounded-full bg-gradient-to-r from-green-500/20 to-blue-500/20 border border-green-500/30 group-hover:from-green-500/30 group-hover:to-blue-500/30 transition-all duration-300">
              <TrendingUp className="w-4 h-4 text-green-400" />
              <span className="text-sm font-semibold text-green-400">Premium Analysis</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}