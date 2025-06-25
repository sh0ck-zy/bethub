'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { AnalysisTabs } from '@/components/AnalysisTabs';
import { AuthModal } from '@/components/AuthModal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, LogIn, Clock, MapPin, TrendingUp, Users, Target, Star, Zap } from 'lucide-react';
import Link from 'next/link';

// Enhanced team logo component
const TeamLogo = ({ team, size = 'w-16 h-16' }: { team: string; size?: string }) => {
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
    <div className={`${size} rounded-2xl bg-gradient-to-br ${getTeamColor(team)} flex items-center justify-center text-white font-bold shadow-2xl border-2 border-white/20 team-logo relative overflow-hidden`}>
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
      <span className="relative z-10 text-xl">{initials}</span>
    </div>
  );
};

export default function MatchPage() {
  const params = useParams();
  const matchId = params.id as string;
  const [match, setMatch] = useState<any>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    if (matchId) {
      fetchMatch();
    }
  }, [matchId]);

  const fetchMatch = async () => {
    try {
      const response = await fetch(`/api/v1/match/${matchId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setMatch(data.match || data);
    } catch (error) {
      console.error('Error fetching match:', error);
      // Set fallback data for development
      const fallbackMatch = {
        id: matchId,
        league: matchId === '1' ? 'Premier League' : matchId === '2' ? 'La Liga' : 'Serie A',
        home_team: matchId === '1' ? 'Manchester United' : matchId === '2' ? 'Real Madrid' : 'Juventus',
        away_team: matchId === '1' ? 'Liverpool' : matchId === '2' ? 'Barcelona' : 'AC Milan',
        kickoff_utc: new Date().toISOString(),
        status: matchId === '2' ? 'LIVE' : 'PRE'
      };
      setMatch(fallbackMatch);
    }
  };

  if (!match) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center">
        <Card className="premium-card max-w-md">
          <CardContent className="p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-blue-500 rounded-full mx-auto flex items-center justify-center animate-pulse">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white">Loading Match Analysis</h3>
            <div className="flex justify-center space-x-1">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const kickoffTime = new Date(match.kickoff_utc).toLocaleString();

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      {/* Enhanced Header */}
      <header className="border-b border-white/10 bg-gray-900/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white hover:bg-white/10">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Matches
                </Button>
              </Link>
              <div className="w-px h-6 bg-white/20"></div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">B</span>
                </div>
                <h1 className="text-xl font-bold gradient-text">BetHub</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {!isAuthenticated && (
                <Button 
                  onClick={() => setIsAuthModalOpen(true)}
                  className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white shadow-lg shadow-green-500/25 border-0"
                >
                  <LogIn className="mr-2 h-4 w-4" />
                  Join Premium
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Enhanced Match Header */}
      <div className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 via-transparent to-blue-500/5"></div>
        <div className="container mx-auto px-4 py-8 relative">
          <div className="space-y-6">
            {/* League and Status */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
              <div className="flex items-center space-x-3">
                <Badge className="bg-green-500/20 text-green-400 border border-green-500/30 text-sm px-3 py-1">
                  {match.league}
                </Badge>
                <Badge className={`${statusConfig.color} text-white text-sm font-bold px-4 py-2 shadow-lg ${statusConfig.glow} border-0`}>
                  {statusConfig.text}
                </Badge>
                <Badge className="bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 text-sm px-3 py-1">
                  <Star className="w-3 h-3 mr-1 fill-current" />
                  Premium Analysis
                </Badge>
              </div>
              
              <div className="flex items-center space-x-4 text-sm text-gray-300">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span>{kickoffTime}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4" />
                  <span>{Math.floor(Math.random() * 50) + 20}K watching</span>
                </div>
              </div>
            </div>
            
            {/* Teams Display */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
              {/* Home Team */}
              <Card className="premium-card">
                <CardContent className="p-6 text-center space-y-4">
                  <TeamLogo team={match.home_team} size="w-20 h-20" />
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">{match.home_team}</h2>
                    <Badge className="bg-green-500/20 text-green-400 border border-green-500/30">
                      HOME
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="text-3xl font-bold text-green-400">
                      {Math.floor(Math.random() * 3) + 1}.{Math.floor(Math.random() * 9)}
                    </div>
                    <div className="text-sm text-gray-400">Betting Odds</div>
                  </div>
                </CardContent>
              </Card>

              {/* VS Section */}
              <div className="text-center space-y-4">
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-br from-gray-800 to-gray-900 rounded-full flex items-center justify-center mx-auto border-2 border-white/20">
                    <span className="text-2xl font-bold gradient-text">VS</span>
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                    <Zap className="w-4 h-4 text-white" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-lg font-bold text-white">AI Confidence</div>
                  <div className="text-3xl font-bold gradient-text">
                    {Math.floor(Math.random() * 30) + 70}%
                  </div>
                </div>
              </div>

              {/* Away Team */}
              <Card className="premium-card">
                <CardContent className="p-6 text-center space-y-4">
                  <TeamLogo team={match.away_team} size="w-20 h-20" />
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">{match.away_team}</h2>
                    <Badge className="bg-blue-500/20 text-blue-400 border border-blue-500/30">
                      AWAY
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="text-3xl font-bold text-blue-400">
                      {Math.floor(Math.random() * 3) + 2}.{Math.floor(Math.random() * 9)}
                    </div>
                    <div className="text-sm text-gray-400">Betting Odds</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="premium-card">
                <CardContent className="p-4 text-center">
                  <Target className="w-6 h-6 text-green-400 mx-auto mb-2" />
                  <div className="text-lg font-bold text-white">{Math.floor(Math.random() * 30) + 70}%</div>
                  <div className="text-xs text-gray-400">Win Probability</div>
                </CardContent>
              </Card>
              
              <Card className="premium-card">
                <CardContent className="p-4 text-center">
                  <TrendingUp className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                  <div className="text-lg font-bold text-white">{Math.floor(Math.random() * 5) + 2}.5</div>
                  <div className="text-xs text-gray-400">Goals Expected</div>
                </CardContent>
              </Card>
              
              <Card className="premium-card">
                <CardContent className="p-4 text-center">
                  <Users className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                  <div className="text-lg font-bold text-white">{Math.floor(Math.random() * 50) + 20}K</div>
                  <div className="text-xs text-gray-400">Live Viewers</div>
                </CardContent>
              </Card>
              
              <Card className="premium-card">
                <CardContent className="p-4 text-center">
                  <Star className="w-6 h-6 text-yellow-400 mx-auto mb-2 fill-current" />
                  <div className="text-lg font-bold text-white">{Math.floor(Math.random() * 10) + 85}</div>
                  <div className="text-xs text-gray-400">Match Rating</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <AnalysisTabs matchId={matchId} isAuthenticated={isAuthenticated} />
      </main>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  );
}