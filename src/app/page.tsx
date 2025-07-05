'use client';

import { useState, useEffect } from 'react';
import { MatchCard } from '@/components/MatchCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, User, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { AuthModal } from '@/components/AuthModal';

interface Match {
  id: string;
  league: string;
  home_team: string;
  away_team: string;
  kickoff_utc: string;
  status: string;
}

export default function HomePage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedLeague, setSelectedLeague] = useState('all');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { user, isAdmin, signOut } = useAuth();

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      const response = await fetch(`/api/v1/today`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (Array.isArray(data)) {
        // Sort matches by temporal order
        const sortedMatches = data.sort((a, b) => {
          // Helper function to get sorting weight (future matches first, finished last)
          const getWeight = (match: Match) => {
            const kickoff = new Date(match.kickoff_utc);
            const now = new Date();
            
            if (match.status === 'FT') return 3; // Finished matches last
            if (match.status === 'LIVE') return 2; // Live matches in the middle
            return 1; // Future matches first
          };

          const weightA = getWeight(a);
          const weightB = getWeight(b);

          // If weights are different, sort by weight
          if (weightA !== weightB) {
            return weightA - weightB;
          }

          // If weights are the same, sort by kickoff time
          return new Date(a.kickoff_utc).getTime() - new Date(b.kickoff_utc).getTime();
        });

        setMatches(sortedMatches);
      } else {
        console.warn('API returned non-array data:', data);
        setMatches([]);
      }
    } catch (error) {
      console.error('Error fetching matches:', error);
      setMatches([]);
    }
  };

  const leagues = ['all', ...new Set(matches.map(match => match.league))];
  const filteredMatches = selectedLeague === 'all' 
    ? matches 
    : matches.filter(match => match.league === selectedLeague);


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      {/* Header */}
      <header className="border-b border-white/10 bg-gray-900/90 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center">
                <span className="text-white font-bold text-sm">B</span>
              </div>
              <h1 className="text-xl font-bold text-white">BetHub</h1>
            </div>
            
            <div className="flex items-center space-x-2">
              {user ? (
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-2 text-gray-300">
                    <User className="w-4 h-4" />
                    <span className="text-sm">{user.email}</span>
                    {isAdmin && (
                      <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs">
                        Admin
                      </Badge>
                    )}
                  </div>
                  
                  {isAdmin && (
                    <Button
                      onClick={() => window.location.href = '/admin'}
                      className="bg-purple-600 hover:bg-purple-700 text-white border-0 font-medium text-sm px-3 py-1"
                    >
                      Admin Panel
                    </Button>
                  )}
                  
                  <Button
                    onClick={() => signOut()}
                    className="bg-gray-600 hover:bg-gray-700 text-white border-0 font-medium text-sm px-3 py-1"
                  >
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => setShowAuthModal(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white border-0 font-medium text-sm px-4 py-2"
                >
                  <User className="mr-1 h-3 w-3" />
                  Login
                </Button>
              )}
              
              <Button 
                onClick={() => alert('Premium coming soon!')}
                className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white border-0 font-medium text-sm px-4 py-2"
              >
                <Crown className="mr-1 h-3 w-3" />
                Premium
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-white">
            AI-Powered Match Analysis
          </h2>
          <p className="text-sm text-gray-400">
            Deep insights for today's biggest games
          </p>
        </div>
      </div>

      {/* Matches Section */}
      <div className="container mx-auto px-4 pb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <h3 className="text-lg font-semibold text-white">Today's Matches</h3>
            <Badge className="bg-green-500/20 text-green-400 border border-green-500/30 text-xs">
              {filteredMatches.length}
            </Badge>
          </div>
          
          <select 
            value={selectedLeague}
            onChange={(e) => setSelectedLeague(e.target.value)}
            className="bg-gray-800/50 border border-white/10 rounded-lg px-3 py-1.5 text-white text-sm focus:border-green-500 focus:outline-none"
          >
            {leagues.map(league => (
              <option key={league} value={league}>
                {league === 'all' ? 'All Leagues' : league}
              </option>
            ))}
          </select>
        </div>

        {/* Matches Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMatches.map((match) => (
            <MatchCard key={match.id} match={match} />
          ))}
        </div>

        {/* Free vs Premium Info */}
        <div className="mt-8 p-4 rounded-lg bg-gray-800/50 border border-white/10">
          <div className="text-center space-y-2">
            <p className="text-sm text-gray-400">
              <span className="text-green-400 font-medium">Free:</span> 1 analysis per day 
              <span className="text-gray-500 mx-2">•</span>
              <span className="text-blue-400 font-medium">Premium:</span> Unlimited access + advanced insights
            </p>
            <Button 
              onClick={() => alert('Premium coming soon!')}
              className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white border-0 font-medium text-sm px-6 py-2"
            >
              Upgrade to Premium • €9.99/month
            </Button>
          </div>
        </div>

        {filteredMatches.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400">
              <p>No matches available for selected league.</p>
            </div>
          </div>
        )}
      </div>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />

      {/* Footer */}
      <footer className="border-t border-white/10 bg-gray-900/50 backdrop-blur-xl mt-12">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center">
            <p className="text-xs text-gray-500">
              © 2025 BetHub. AI-powered sports analysis.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}