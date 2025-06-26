'use client';

import { useState, useEffect } from 'react';
import { MatchCard } from '@/components/MatchCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LogIn, TrendingUp, Filter, Mail, Github } from 'lucide-react';
import Link from 'next/link';

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
  const [selectedLeague, setSelectedLeague] = useState('all');

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

  const liveMatches = matches.filter(match => match.status === 'LIVE').length;
  const upcomingMatches = matches.filter(match => match.status === 'PRE').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      {/* Enhanced Header */}
      <header className="border-b border-white/10 bg-gray-900/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-400 via-green-500 to-blue-500 flex items-center justify-center shadow-lg shadow-green-500/25">
                  <span className="text-white font-bold text-lg">B</span>
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold gradient-text">
                  BetHub
                </h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {!isAuthenticated && (
                <Button 
                  onClick={() => alert('Premium membership coming soon!')}
                  className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white shadow-lg shadow-green-500/25 border-0 font-semibold"
                >
                  <LogIn className="mr-2 h-4 w-4" />
                  Join Premium
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 via-transparent to-blue-500/10"></div>
        <div className="container mx-auto px-4 py-6 relative">
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight">
              <span className="gradient-text">FREE</span> Professional Sports Analysis
              <span className="block gradient-text">Powered by AI</span>
            </h2>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Get advanced stats, deep insights, and AI-powered pre-match analysis for today's biggest games <span className="text-green-400 font-medium">100% free</span>.
            </p>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0 mb-8">
          <div className="flex items-center space-x-3">
            <div className="w-1 h-8 bg-gradient-to-b from-green-400 to-blue-500 rounded-full"></div>
            <h2 className="text-2xl font-bold text-white">Featured Matches</h2>
            <Badge className="bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
              {filteredMatches.length} Available
            </Badge>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select 
                value={selectedLeague}
                onChange={(e) => setSelectedLeague(e.target.value)}
                className="bg-gray-800 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:border-green-500 focus:outline-none"
              >
                {leagues.map(league => (
                  <option key={league} value={league}>
                    {league === 'all' ? 'All Leagues' : league}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Matches Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredMatches.map((match) => (
            <MatchCard key={match.id} match={match} />
          ))}
        </div>

        {filteredMatches.length === 0 && (
          <div className="text-center py-16">
            <Card className="premium-card max-w-md mx-auto">
              <CardContent className="p-8 text-center space-y-4">
                <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-blue-500 rounded-full mx-auto flex items-center justify-center animate-pulse">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white">Loading Premium Analysis</h3>
                <p className="text-gray-400">
                  Our AI is preparing the latest match insights and predictions...
                </p>
                <div className="flex justify-center space-x-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Enhanced Footer */}
      <footer className="border-t border-white/10 bg-gray-900/80 backdrop-blur-xl mt-16">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-start">
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">B</span>
                </div>
                <span className="font-bold text-white text-xl">BetHub</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
                Professional sports analysis and AI-powered insights for smart betting decisions.
              </p>
              <div className="flex items-center space-x-3">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-xs text-green-400 font-medium">Live Platform</span>
                </div>
                <div className="w-px h-4 bg-white/20"></div>
                <Badge className="bg-blue-500/20 text-blue-400 text-xs border border-blue-500/30">
                  AI-Powered
                </Badge>
              </div>
            </div>
            
            <div className="mt-6 md:mt-0 space-y-2">
              <h3 className="font-semibold text-white text-sm">Contact</h3>
              <div className="space-y-2 text-sm">
                <a 
                  href="mailto:sh0ck.zy.25@gmail.com" 
                  className="text-gray-400 hover:text-green-400 transition-colors flex items-center gap-2"
                >
                  <Mail className="w-4 h-4" />
                  sh0ck.zy.25@gmail.com
                </a>
                <a 
                  href="https://github.com/sh0ck-zy/bethub" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-gray-400 hover:text-green-400 transition-colors flex items-center gap-2"
                >
                  <Github className="w-4 h-4" />
                  GitHub Repository
                </a>
              </div>
            </div>
          </div>
          
          <div className="border-t border-white/10 mt-6 pt-6 text-center md:text-left">
            <p className="text-gray-400 text-xs">
              © 2025 BetHub. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}