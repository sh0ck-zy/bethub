'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { AnalysisTabs } from '@/components/features/AnalysisTabs';
import { AuthModal } from '@/components/features/AuthModal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Crown, Brain, Clock, Activity } from 'lucide-react';
import Link from 'next/link';
import { TeamLogo } from '@/components/TeamLogo';

export default function MatchPage() {
  const params = useParams();
  const matchId = params.id as string;
  const [match, setMatch] = useState<any>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAuthenticated] = useState(false);

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
      {/* Header */}
      <header className="border-b border-white/10 bg-gray-900/90 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white hover:bg-gray-800">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center">
                  <span className="text-white font-bold text-xs">B</span>
                </div>
                <span className="font-bold text-white">BetHub</span>
              </div>
            </div>
            
            <Button 
              onClick={() => setIsAuthModalOpen(true)}
              className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white border-0 font-medium text-sm px-4 py-2"
            >
              <Crown className="mr-1 h-3 w-3" />
              Premium
            </Button>
          </div>
        </div>
      </header>

      {/* Match Header */}
      <div className="border-b border-white/10 bg-gray-900/50">
        <div className="container mx-auto px-4 py-6">
          {/* League & Time */}
          <div className="text-center mb-6">
            <Badge className="bg-blue-500/20 text-blue-400 border border-blue-500/30 text-xs mb-2">
              {match.league}
            </Badge>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
              <Clock className="w-3 h-3" />
              {new Date(match.kickoff_utc).toLocaleDateString()} • {new Date(match.kickoff_utc).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}
            </div>
          </div>
          
          {/* Teams */}
          <div className="flex items-center justify-between max-w-md mx-auto mb-6">
            {/* Home Team */}
            <div className="text-center">
              <TeamLogo team={match.home_team} size={48} />
              <h2 className="text-sm font-semibold text-white mt-2">{match.home_team}</h2>
            </div>
            
            {/* VS + Status */}
            <div className="text-center mx-6">
              <div className="text-lg font-bold text-gray-500 mb-1">VS</div>
              <Badge className={`${statusConfig.color} border text-xs`}>
                {statusConfig.text}
              </Badge>
            </div>

            {/* Away Team */}
            <div className="text-center">
              <TeamLogo team={match.away_team} size={48} />
              <h2 className="text-sm font-semibold text-white mt-2">{match.away_team}</h2>
            </div>
          </div>

          {/* AI Preview */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Brain className="w-4 h-4 text-green-400" />
              <span className="text-sm font-medium text-green-400">AI Analysis Preview</span>
              <Badge className="bg-green-500/20 text-green-400 border border-green-500/30 text-xs">
                87% confidence
              </Badge>
            </div>
            <p className="text-sm text-gray-300 max-w-lg mx-auto">
              Tactical battle expected in midfield. Home advantage vs away team's defensive setup suggests a tight match with few clear chances.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <AnalysisTabs matchId={matchId} isAuthenticated={isAuthenticated} />
      </main>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  );
}