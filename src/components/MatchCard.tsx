'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, TrendingUp, BarChart3 } from 'lucide-react';
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

// Simple team logo component with fallback
const TeamLogo = ({ team, size = 'w-8 h-8' }: { team: string; size?: string }) => {
  const getTeamColor = (teamName: string) => {
    const colors: { [key: string]: string } = {
      'Manchester United': 'from-red-600 to-red-800',
      'Liverpool': 'from-red-700 to-red-900',
      'Arsenal': 'from-red-600 to-yellow-500',
      'Chelsea': 'from-blue-600 to-blue-800',
      'Real Madrid': 'from-white to-gray-300',
      'Barcelona': 'from-blue-700 to-red-600',
      'Bayern Munich': 'from-red-600 to-blue-800',
      'Borussia Dortmund': 'from-yellow-400 to-black',
      'Juventus': 'from-black to-white',
      'AC Milan': 'from-red-600 to-black',
    };
    return colors[teamName] || 'from-gray-500 to-gray-700';
  };

  const initials = team.split(' ').map(word => word[0]).join('').substring(0, 2);
  
  return (
    <div className={`${size} rounded-full bg-gradient-to-br ${getTeamColor(team)} flex items-center justify-center text-white font-bold text-xs shadow-lg border-2 border-white/20`}>
      {initials}
    </div>
  );
};

export function MatchCard({ match }: MatchCardProps) {
  const kickoffTime = new Date(match.kickoff_utc).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'LIVE':
        return 'bg-gradient-to-r from-green-500 to-green-600 animate-pulse';
      case 'PRE':
        return 'bg-gradient-to-r from-blue-500 to-blue-600';
      case 'FT':
        return 'bg-gradient-to-r from-gray-500 to-gray-600';
      case 'HT':
        return 'bg-gradient-to-r from-orange-500 to-orange-600';
      default:
        return 'bg-gradient-to-r from-gray-500 to-gray-600';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'LIVE': return '🔴 LIVE';
      case 'PRE': return '⏰ Upcoming';
      case 'FT': return '✅ Finished';
      case 'HT': return '⏸️ Half Time';
      default: return status;
    }
  };

  return (
    <Link href={`/match/${match.id}`}>
      <Card className="group hover:shadow-2xl hover:shadow-green-500/20 transition-all duration-300 cursor-pointer border border-white/10 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 hover:border-green-500/50 hover:scale-[1.02] overflow-hidden">
        {/* League Header */}
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4 text-green-400" />
              <span className="text-xs font-medium text-green-400 uppercase tracking-wider">
                {match.league}
              </span>
            </div>
            <Badge className={`${getStatusColor(match.status)} text-white text-xs font-semibold px-3 py-1 shadow-lg`}>
              {getStatusText(match.status)}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Teams */}
          <div className="space-y-3">
            {/* Home Team */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
              <div className="flex items-center space-x-3">
                <TeamLogo team={match.home_team} />
                <span className="font-semibold text-white group-hover:text-green-400 transition-colors">
                  {match.home_team}
                </span>
              </div>
              <div className="text-right">
                <div className="text-sm text-green-400 font-medium">HOME</div>
              </div>
            </div>

            {/* VS Divider */}
            <div className="flex items-center justify-center">
              <div className="w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
              <span className="px-3 text-xs font-bold text-white/60 bg-gray-800 rounded-full">VS</span>
              <div className="w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
            </div>

            {/* Away Team */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
              <div className="flex items-center space-x-3">
                <TeamLogo team={match.away_team} />
                <span className="font-semibold text-white group-hover:text-green-400 transition-colors">
                  {match.away_team}
                </span>
              </div>
              <div className="text-right">
                <div className="text-sm text-blue-400 font-medium">AWAY</div>
              </div>
            </div>
          </div>

          {/* Match Info */}
          <div className="flex items-center justify-between pt-3 border-t border-white/10">
            <div className="flex items-center space-x-2 text-sm text-gray-300">
              <Clock className="w-4 h-4" />
              <span>{kickoffTime}</span>
            </div>
            <div className="flex items-center space-x-1 text-sm text-green-400 font-medium">
              <TrendingUp className="w-4 h-4" />
              <span>View Analysis</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

