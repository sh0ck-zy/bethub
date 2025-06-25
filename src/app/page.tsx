'use client';

import { useState, useEffect } from 'react';
import { MatchCard } from '@/components/MatchCard';
import { Button } from '@/components/ui/button';
import { LogIn } from 'lucide-react';

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
  const [isAuthenticated, setIsAuthenticated] = useState(false);

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
        setMatches(data);
      } else {
        console.warn('API returned non-array data:', data);
        setMatches([]);
      }
    } catch (error) {
      console.error('Error fetching matches:', error);
      setMatches([]);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-white/10 bg-gray-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center">
                <span className="text-white font-bold text-sm">BH</span>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                BETHUB
              </h1>
              <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full border border-green-500/30">
                PREMIUM
              </span>
            </div>
            <div className="flex items-center space-x-4">
              {!isAuthenticated && (
                <Button 
                  onClick={() => alert('Premium membership coming soon!')}
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg shadow-green-500/25 border-0"
                >
                  <LogIn className="mr-2 h-4 w-4" />
                  Join BetHub
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-b border-white/10">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold text-white">
              Professional Sports Analysis & Insights
            </h2>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Get AI-powered match analysis, real-time insights, and professional betting intelligence 
              for today's biggest football matches.
            </p>
            <div className="flex items-center justify-center space-x-6 pt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">{matches.length}</div>
                <div className="text-xs text-gray-400 uppercase tracking-wide">Live Matches</div>
              </div>
              <div className="w-px h-8 bg-white/20"></div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">AI</div>
                <div className="text-xs text-gray-400 uppercase tracking-wide">Powered</div>
              </div>
              <div className="w-px h-8 bg-white/20"></div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">24/7</div>
                <div className="text-xs text-gray-400 uppercase tracking-wide">Analysis</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-1 h-8 bg-gradient-to-b from-green-400 to-blue-500 rounded-full"></div>
            <h2 className="text-2xl font-bold text-white">Today's Featured Matches</h2>
            <div className="flex-1 h-px bg-gradient-to-r from-white/20 to-transparent"></div>
          </div>
        </div>

        {/* Matches Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {matches.map((match) => (
            <MatchCard key={match.id} match={match} />
          ))}
        </div>

        {matches.length === 0 && (
          <div className="text-center py-16">
            <div className="animate-pulse space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-blue-500 rounded-full mx-auto opacity-50"></div>
              <p className="text-gray-400 text-lg">Loading premium match analysis...</p>
              <div className="flex justify-center space-x-1">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
            </div>
          </div>
                  )}
        </main>

        {/* Footer */}
        <footer className="border-t border-white/10 bg-gray-900/50 backdrop-blur-sm mt-16">
          <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 rounded bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center">
                    <span className="text-white font-bold text-xs">BH</span>
                  </div>
                  <span className="font-bold text-white">BetHub</span>
                </div>
                <p className="text-gray-400 text-sm">
                  Professional sports analysis and AI-powered insights for smart betting decisions.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-white mb-4">Platform</h3>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li>Live Analysis</li>
                  <li>AI Insights</li>
                  <li>Match Predictions</li>
                  <li>Premium Features</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-white mb-4">Sports</h3>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li>Football</li>
                  <li>Basketball</li>
                  <li>Tennis</li>
                  <li>More Coming Soon</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-white mb-4">Support</h3>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li>Help Center</li>
                  <li>Contact Us</li>
                  <li>Terms of Service</li>
                  <li>Privacy Policy</li>
                </ul>
              </div>
            </div>
            
            <div className="border-t border-white/10 mt-8 pt-8 flex justify-between items-center">
              <p className="text-gray-400 text-sm">
                © 2024 BetHub. All rights reserved.
              </p>
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-xs text-green-400">Live Platform</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    );
  }

