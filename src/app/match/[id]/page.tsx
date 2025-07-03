'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { AnalysisTabs } from '@/components/AnalysisTabs';
import { AuthModal } from '@/components/AuthModal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, LogIn, Share2, Zap, Activity, Users } from 'lucide-react';
import Link from 'next/link';
import { TeamLogo } from '@/components/TeamLogo';

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
              <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 flex items-center justify-center">
          <Card className="max-w-md border-slate-800 bg-slate-900/80 backdrop-blur-xl">
            <CardContent className="p-8 text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl mx-auto flex items-center justify-center">
                <Activity className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white">Loading Analysis</h3>
              <p className="text-slate-400">Preparing match insights...</p>
            </CardContent>
          </Card>
        </div>
    );
  }

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'LIVE':
        return {
          color: 'bg-red-500/20 text-red-400 border-red-500/30',
          text: 'Live',
          icon: '🔴'
        };
      case 'PRE':
        return {
          color: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
          text: 'Upcoming',
          icon: '⏱️'
        };
      case 'FT':
        return {
          color: 'bg-green-500/20 text-green-400 border-green-500/30',
          text: 'Finished',
          icon: '✅'
        };
      default:
        return {
          color: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
          text: 'Upcoming',
          icon: '⏱️'
        };
    }
  };

  const statusConfig = getStatusConfig(match.status);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950">
      {/* Enhanced Header - Always Visible */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 lg:py-4">
          <div className="flex justify-between items-center">
            {/* Left Corner: Navigation & Logo */}
            <div className="flex items-center space-x-6">
              <Link href="/">
                <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white hover:bg-slate-800 group">
                  <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                  Back to Matches
                </Button>
              </Link>
              <div className="w-px h-6 bg-slate-700"></div>
              <div className="flex items-center space-x-3">
                <img 
                  src="/bethub-logo.png" 
                  alt="BetHub Logo" 
                  className="w-8 h-8"
                />
                <h1 className="text-xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                  BetHub
                </h1>
              </div>
            </div>

            {/* Right Corner: Actions */}
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" className="border-slate-700 text-slate-300 hover:bg-slate-800">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              
              {!isAuthenticated && (
                <Button 
                  onClick={() => setIsAuthModalOpen(true)}
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white"
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  <span className="hidden md:inline">Join </span>Premium
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Match Confrontation Section - Heart of the Page */}
      <div className="border-b border-slate-800">
        <div className="container mx-auto px-4 py-4 lg:py-8">
          <div className="space-y-4 lg:space-y-8">
            {/* League Badge */}
            <div className="text-center">
              <Badge className="bg-blue-500/20 text-blue-400 border border-blue-500/30 text-xs lg:text-sm px-3 lg:px-4 py-1 lg:py-2">
                {match.league}
              </Badge>
            </div>
            
            {/* Main Team Confrontation */}
            <div className="relative">
              {/* Background Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-cyan-500/10 to-blue-500/5 rounded-2xl blur-xl"></div>
              
              <div className="relative grid grid-cols-3 lg:grid-cols-5 gap-2 lg:gap-4 items-center">
                {/* Home Team */}
                <div className="lg:col-span-2 text-center space-y-2 lg:space-y-4">
                  <div className="flex justify-center">
                    <TeamLogo team={match.home_team} size={60} />
                  </div>
                  <div>
                    <h2 className="text-sm lg:text-xl font-bold text-white mb-1 lg:mb-2">{match.home_team}</h2>
                    <Badge className="bg-green-500/20 text-green-400 border border-green-500/30 text-xs lg:text-sm">
                      HOME
                    </Badge>
                  </div>
                </div>

                {/* VS Section with Date/Time */}
                <div className="lg:col-span-1 text-center space-y-2 lg:space-y-4">
                  <div className="w-12 h-12 lg:w-20 lg:h-20 bg-gradient-to-br from-slate-800 to-slate-900 rounded-full flex items-center justify-center mx-auto border-2 border-slate-700 group-hover:border-blue-500/50 transition-all duration-300">
                    <span className="text-lg lg:text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">VS</span>
                  </div>
                  
                  {/* Match Date & Time */}
                  <div className="space-y-1 lg:space-y-2">
                    <div className="text-xs lg:text-sm text-slate-400">
                      {new Date(match.kickoff_utc).toLocaleDateString('en', { 
                        weekday: 'short',
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </div>
                    <div className="text-sm lg:text-lg font-semibold text-white">
                      {new Date(match.kickoff_utc).toLocaleTimeString('en', { 
                        hour: '2-digit', 
                        minute: '2-digit',
                        hour12: true
                      })}
                    </div>
                    <Badge className={`${statusConfig.color} border font-medium text-xs lg:text-sm`}>
                      <span className="mr-1">{statusConfig.icon}</span>
                      {statusConfig.text}
                    </Badge>
                  </div>
                </div>

                {/* Away Team */}
                <div className="lg:col-span-2 text-center space-y-2 lg:space-y-4">
                  <div className="flex justify-center">
                    <TeamLogo team={match.away_team} size={60} />
                  </div>
                  <div>
                    <h2 className="text-sm lg:text-xl font-bold text-white mb-1 lg:mb-2">{match.away_team}</h2>
                    <Badge className="bg-blue-500/20 text-blue-400 border border-blue-500/30 text-xs lg:text-sm">
                      AWAY
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Initial Insight */}
            <div className="max-w-4xl mx-auto">
              <div className="text-center space-y-2 lg:space-y-3 p-3 lg:p-6">
                <div className="flex items-center justify-center space-x-2 mb-2 lg:mb-4">
                  <div className="w-5 h-5 lg:w-6 lg:h-6 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                    <Zap className="w-2.5 h-2.5 lg:w-3 lg:h-3 text-white" />
                  </div>
                  <h3 className="text-base lg:text-lg font-semibold text-white">AI Match Dynamics Prediction</h3>
                </div>
                <p className="text-sm lg:text-base text-slate-300 leading-relaxed max-w-3xl mx-auto">
                  AI analysis suggests a balanced tactical confrontation in midfield, with both teams prioritizing 
                  defensive solidity before offensive transitions. Individual duels in wide areas and high-pressing 
                  capabilities will be decisive factors in the match dynamics.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - AI Analysis Tabs */}
      <main className="container mx-auto px-4 py-4 lg:py-8">
        <AnalysisTabs matchId={matchId} isAuthenticated={isAuthenticated} />
      </main>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  );
}