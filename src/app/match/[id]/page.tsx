'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { AnalysisTabs } from '@/components/features/AnalysisTabs';
import { AuthModal } from '@/components/features/AuthModal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  ArrowLeft, 
  Crown, 
  Brain, 
  Clock, 
  Calendar,
  MapPin,
  Users,
  TrendingUp,
  Share2,
  Bookmark,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { TeamLogo } from '@/components/TeamLogo';
import { useAuth } from '@/contexts/AuthContext';

interface Match {
  id: string;
  league: string;
  home_team: string;
  away_team: string;
  kickoff_utc: string;
  status: string;
  venue?: string;
  home_score?: number;
  away_score?: number;
}

interface MatchAnalysis {
  headline: string;
  confidence: number;
  insights: string[];
  prediction: string;
}

// Generate match-specific analysis
const generateMatchAnalysis = (match: Match): MatchAnalysis => {
  const analysisData = {
    '1': { // Man United vs Liverpool
      headline: "Van Dijk absence could decide Old Trafford clash",
      confidence: 87,
      insights: [
        "Without Van Dijk, Liverpool concede 40% more goals (1.8 vs 1.1 per game)",
        "United's pace on the counter: Rashford has 5 goals in 3 games vs Liverpool",
        "Old Trafford factor: United won 4 of last 6 home games vs top-6 opponents",
        "Set-piece vulnerability: Liverpool conceded 3 corner goals this month"
      ],
      prediction: "United's counter-attacking pace vs Liverpool's high line without their defensive leader creates clear path to victory"
    },
    '2': { // Real Madrid vs Barcelona
      headline: "Clasico history favors Real Madrid at the Bernabeu",
      confidence: 82,
      insights: [
        "Real Madrid have 65% win rate vs Barcelona at home in last 10 years",
        "Vinicius Jr's pace vs Barcelona's high defensive line: 7 goals in 4 Clasicos",
        "El Clasico averages 3.2 goals per game with both teams scoring 89% of time",
        "Barcelona's away form: only 2 wins in last 8 away games vs Real Madrid"
      ],
      prediction: "Real's counter-attacking threat and home advantage make them favorites in typically high-scoring encounter"
    },
    '3': { // Juventus vs AC Milan
      headline: "Milan's attacking form meets Juventus defensive solidity",
      confidence: 79,
      insights: [
        "AC Milan have scored in 12 consecutive Serie A matches",
        "Juventus home defensive record: only 0.8 goals conceded per game",
        "Head-to-head: 6 of last 8 meetings had under 2.5 goals",
        "Key battle: Leao's pace vs Juventus' experienced defense"
      ],
      prediction: "Tactical chess match with Milan's attack facing Juventus' resolute home defense"
    }
  };

  return analysisData[match.id as keyof typeof analysisData] || {
    headline: "Tactical battle expected between evenly matched sides",
    confidence: 75,
    insights: [
      `${match.home_team} at home average 2.1 goals vs ${match.away_team}'s 1.3 away defense`,
      "Recent head-to-head meetings suggest tight encounter with few clear chances",
      "Home advantage could prove decisive in crucial tactical battle",
      "Both teams' recent form indicates competitive match with multiple goal threats"
    ],
    prediction: `${match.home_team}'s home form vs ${match.away_team}'s away record will be key factor`
  };
};

export default function MatchDetailPage() {
  const params = useParams();
  const matchId = params.id as string;
  const [match, setMatch] = useState<Match | null>(null);
  const [analysis, setAnalysis] = useState<MatchAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const { user } = useAuth();
  
  const isPremium = false; // Placeholder - will be implemented with proper subscription system

  useEffect(() => {
    if (matchId) {
      fetchMatch();
    }
  }, [matchId]);

  const fetchMatch = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`/api/v1/match/${matchId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      const matchData = data.match || data;
      
      setMatch(matchData);
      setAnalysis(generateMatchAnalysis(matchData));
    } catch (error) {
      console.error('Error fetching match:', error);
      setError('Failed to load match data');
      
      // Fallback data for development
      const fallbackMatch = {
        id: matchId,
        league: matchId === '1' ? 'Premier League' : matchId === '2' ? 'La Liga' : 'Serie A',
        home_team: matchId === '1' ? 'Manchester United' : matchId === '2' ? 'Real Madrid' : 'Juventus',
        away_team: matchId === '1' ? 'Liverpool' : matchId === '2' ? 'Barcelona' : 'AC Milan',
        kickoff_utc: new Date().toISOString(),
        status: matchId === '2' ? 'LIVE' : 'PRE',
        venue: matchId === '1' ? 'Old Trafford' : matchId === '2' ? 'Santiago Bernabeu' : 'Allianz Stadium'
      };
      
      setMatch(fallbackMatch);
      setAnalysis(generateMatchAnalysis(fallbackMatch));
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'LIVE':
        return {
          color: 'bg-red-50 text-red-600 border-red-200',
          text: 'Live',
          icon: '🔴',
          pulse: true
        };
      case 'FT':
        return {
          color: 'bg-green-50 text-green-600 border-green-200',
          text: 'Full Time',
          icon: '✅',
          pulse: false
        };
      case 'HT':
        return {
          color: 'bg-yellow-50 text-yellow-600 border-yellow-200',
          text: 'Half Time',
          icon: '⏸️',
          pulse: true
        };
      default:
        return {
          color: 'bg-blue-50 text-blue-600 border-blue-200',
          text: 'Upcoming',
          icon: '⏰',
          pulse: false
        };
    }
  };

  const handleShare = () => {
    if (navigator.share && match) {
      navigator.share({
        title: `${match.home_team} vs ${match.away_team} - BetHub Analysis`,
        text: analysis?.headline || 'AI-powered match analysis',
        url: window.location.href,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const handleBookmark = () => {
    // Add to local bookmarks (you can implement proper bookmark system later)
    alert('Match bookmarked! (Feature coming soon)');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header 
          onLoginClick={() => setShowAuthModal(true)}
          showAuthModal={showAuthModal}
          setShowAuthModal={setShowAuthModal}
          currentPage="match"
        />
        <main className="flex-1 flex items-center justify-center">
          <Card className="max-w-md mx-4">
            <CardContent className="p-8 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading Analysis</h3>
              <p className="text-gray-600">Preparing AI insights...</p>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !match || !analysis) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header 
          onLoginClick={() => setShowAuthModal(true)}
          showAuthModal={showAuthModal}
          setShowAuthModal={setShowAuthModal}
          currentPage="match"
        />
        <main className="flex-1 flex items-center justify-center">
          <Card className="max-w-md mx-4 border-red-200">
            <CardContent className="p-8 text-center">
              <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to Load Match</h3>
              <p className="text-gray-600 mb-4">{error || 'Match not found'}</p>
              <Button onClick={() => window.history.back()} variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Back
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  const statusConfig = getStatusConfig(match.status);
  const kickoffDate = new Date(match.kickoff_utc);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Consistent Header */}
      <Header 
        onLoginClick={() => setShowAuthModal(true)}
        showAuthModal={showAuthModal}
        setShowAuthModal={setShowAuthModal}
        currentPage="match"
      />

      {/* Match Header - Mobile Optimized */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          {/* Navigation & Actions */}
          <div className="flex items-center justify-between mb-6">
            <Button 
              onClick={() => window.history.back()}
              variant="outline"
              size="sm"
              className="flex items-center"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Back to Matches</span>
              <span className="sm:hidden">Back</span>
            </Button>

            <div className="flex items-center space-x-2">
              <Button
                onClick={handleShare}
                variant="outline"
                size="sm"
              >
                <Share2 className="w-4 h-4" />
              </Button>
              <Button
                onClick={handleBookmark}
                variant="outline"
                size="sm"
              >
                <Bookmark className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* League & Time Info */}
          <div className="text-center mb-6">
            <Badge className="bg-blue-50 text-blue-600 border-blue-200 mb-3">
              {match.league}
            </Badge>
            
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>{kickoffDate.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>{kickoffDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              {match.venue && (
                <div className="flex items-center space-x-1">
                  <MapPin className="w-4 h-4" />
                  <span>{match.venue}</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Teams Display */}
          <div className="flex items-center justify-center mb-6">
            <div className="flex items-center space-x-8 max-w-lg w-full">
              {/* Home Team */}
              <div className="text-center flex-1">
                <TeamLogo team={match.home_team} size={64} />
                <h2 className="text-lg font-bold text-gray-900 mt-3 mb-1">{match.home_team}</h2>
                <span className="text-sm text-gray-500">Home</span>
                {match.home_score !== undefined && (
                  <div className="text-3xl font-bold text-blue-600 mt-2">{match.home_score}</div>
                )}
              </div>
              
              {/* VS + Status */}
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-400 mb-2">VS</div>
                <Badge className={`${statusConfig.color} border font-semibold ${statusConfig.pulse ? 'animate-pulse' : ''}`}>
                  <span className="mr-1">{statusConfig.icon}</span>
                  {statusConfig.text}
                </Badge>
              </div>

              {/* Away Team */}
              <div className="text-center flex-1">
                <TeamLogo team={match.away_team} size={64} />
                <h2 className="text-lg font-bold text-gray-900 mt-3 mb-1">{match.away_team}</h2>
                <span className="text-sm text-gray-500">Away</span>
                {match.away_score !== undefined && (
                  <div className="text-3xl font-bold text-blue-600 mt-2">{match.away_score}</div>
                )}
              </div>
            </div>
          </div>

          {/* AI Headline - Hero Section */}
          <Card className="bg-gradient-to-r from-blue-50 via-purple-50 to-blue-50 border-0 shadow-sm">
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Brain className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">AI Analysis</h3>
                <div className="flex items-center space-x-1">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <Badge className="bg-green-100 text-green-700 text-xs">
                    {analysis.confidence}% confidence
                  </Badge>
                </div>
              </div>
              
              <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 leading-tight">
                {analysis.headline}
              </h1>
              
              <p className="text-gray-700 text-lg leading-relaxed max-w-2xl mx-auto">
                {analysis.prediction}
              </p>

              {/* Premium Upgrade CTA for non-premium users */}
              {!isPremium && (
                <div className="mt-6 p-4 bg-white/50 rounded-lg border border-white/20">
                  <div className="flex items-center justify-center space-x-2 mb-3">
                    <Crown className="w-5 h-5 text-yellow-600" />
                    <span className="text-sm font-semibold text-gray-800">Get the full tactical breakdown</span>
                  </div>
                  <Button 
                    onClick={() => setShowAuthModal(true)}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-6 py-2"
                  >
                    Unlock Premium Analysis
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl mx-auto px-4 py-8 w-full">
        <AnalysisTabs 
          matchId={matchId} 
          isAuthenticated={!!user}
        />
      </main>

      {/* Consistent Footer */}
      <Footer />

      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </div>
  );
}