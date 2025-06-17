'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { AnalysisTabs } from '@/components/AnalysisTabs';
import { OddsPill } from '@/components/OddsPill';
import { AuthModal } from '@/components/AuthModal';
import { LanguageSwitch } from '@/components/LanguageSwitch';
import { RegionProvider } from '@/components/RegionProvider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, LogIn, Clock, MapPin } from 'lucide-react';
import Link from 'next/link';

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
      const data = await response.json();
      setMatch(data.match);
    } catch (error) {
      console.error('Error fetching match:', error);
      // Set dummy data for development
      setMatch({
        id: matchId,
        league: 'Premier League',
        home_team: 'Manchester United',
        away_team: 'Liverpool',
        kickoff_utc: new Date().toISOString(),
        status: 'LIVE'
      });
    }
  };

  if (!match) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse">Loading match...</div>
      </div>
    );
  }

  const kickoffTime = new Date(match.kickoff_utc).toLocaleString();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'LIVE':
        return 'bg-red-500';
      case 'PRE':
        return 'bg-blue-500';
      case 'FT':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <RegionProvider>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <Link href="/">
                  <Button variant="ghost" size="sm">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                </Link>
                <h1 className="text-2xl font-bold">SPORTSBET INSIGHT</h1>
              </div>
              <div className="flex items-center space-x-4">
                <LanguageSwitch />
                {!isAuthenticated && (
                  <Button onClick={() => setIsAuthModalOpen(true)}>
                    <LogIn className="mr-2 h-4 w-4" />
                    Sign In
                  </Button>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Match Header */}
        <div className="border-b bg-muted/50">
          <div className="container mx-auto px-4 py-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">{match.league}</div>
                  <h1 className="text-3xl font-bold">
                    {match.home_team} vs {match.away_team}
                  </h1>
                </div>
                <Badge className={`${getStatusColor(match.status)} text-white text-lg px-3 py-1`}>
                  {match.status}
                </Badge>
              </div>
              
              <div className="flex items-center space-x-6">
                <div className="flex items-center text-muted-foreground">
                  <Clock className="mr-2 h-4 w-4" />
                  {kickoffTime}
                </div>
                <OddsPill matchId={matchId} />
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
    </RegionProvider>
  );
}

