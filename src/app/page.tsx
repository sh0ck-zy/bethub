'use client';

import { useState, useEffect } from 'react';
import { MatchCard } from '@/components/MatchCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LogIn, TrendingUp, Zap, Shield, Star, Filter, Search, Bell } from 'lucide-react';

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
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                  <Star className="w-2 h-2 text-white fill-current" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold gradient-text">
                  BetHub
                </h1>
                <div className="flex items-center space-x-2">
                  <Badge className="bg-green-500/20 text-green-400 text-xs border border-green-500/30">
                    PREMIUM
                  </Badge>
                  <Badge className="bg-blue-500/20 text-blue-400 text-xs border border-blue-500/30">
                    AI-POWERED
                  </Badge>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white">
                <Bell className="w-4 h-4 mr-2" />
                Alerts
              </Button>
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
        <div className="container mx-auto px-4 py-12 relative">
          <div className="text-center space-y-6 max-w-4xl mx-auto">
            <div className="space-y-4">
              <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight">
                Professional Sports Analysis
                <span className="block gradient-text">Powered by AI</span>
              </h2>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
                Get real-time insights, advanced statistics, and AI-powered predictions 
                for today's biggest football matches.
              </p>
            </div>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
              <Card className="premium-card">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-red-400">{liveMatches}</div>
                  <div className="text-sm text-gray-400 uppercase tracking-wide">Live Now</div>
                </CardContent>
              </Card>
              
              <Card className="premium-card">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-blue-400">{upcomingMatches}</div>
                  <div className="text-sm text-gray-400 uppercase tracking-wide">Upcoming</div>
                </CardContent>
              </Card>
              
              <Card className="premium-card">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-green-400">AI</div>
                  <div className="text-sm text-gray-400 uppercase tracking-wide">Powered</div>
                </CardContent>
              </Card>
              
              <Card className="premium-card">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Star className="w-6 h-6 text-white fill-current" />
                  </div>
                  <div className="text-2xl font-bold text-purple-400">24/7</div>
                  <div className="text-sm text-gray-400 uppercase tracking-wide">Analysis</div>
                </CardContent>
              </Card>
            </div>
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
            
            <Button variant="outline" size="sm" className="border-white/20 text-gray-300 hover:text-white hover:border-green-500">
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
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
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">B</span>
                </div>
                <span className="font-bold text-white text-xl">BetHub</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Professional sports analysis and AI-powered insights for smart betting decisions. 
                Join thousands of successful bettors.
              </p>
              <div className="flex space-x-2">
                <Badge className="bg-green-500/20 text-green-400 text-xs border border-green-500/30">
                  Trusted Platform
                </Badge>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-white mb-4 text-lg">Platform</h3>
              <ul className="space-y-3 text-sm text-gray-400">
                <li className="hover:text-green-400 cursor-pointer transition-colors">Live Analysis</li>
                <li className="hover:text-green-400 cursor-pointer transition-colors">AI Insights</li>
                <li className="hover:text-green-400 cursor-pointer transition-colors">Match Predictions</li>
                <li className="hover:text-green-400 cursor-pointer transition-colors">Premium Features</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-white mb-4 text-lg">Sports</h3>
              <ul className="space-y-3 text-sm text-gray-400">
                <li className="hover:text-blue-400 cursor-pointer transition-colors">Football</li>
                <li className="hover:text-blue-400 cursor-pointer transition-colors">Basketball</li>
                <li className="hover:text-blue-400 cursor-pointer transition-colors">Tennis</li>
                <li className="hover:text-blue-400 cursor-pointer transition-colors">More Sports</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-white mb-4 text-lg">Support</h3>
              <ul className="space-y-3 text-sm text-gray-400">
                <li className="hover:text-purple-400 cursor-pointer transition-colors">Help Center</li>
                <li className="hover:text-purple-400 cursor-pointer transition-colors">Contact Us</li>
                <li className="hover:text-purple-400 cursor-pointer transition-colors">Terms of Service</li>
                <li className="hover:text-purple-400 cursor-pointer transition-colors">Privacy Policy</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-white/10 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-400 text-sm">
              © 2024 BetHub. All rights reserved. Professional sports analysis platform.
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
        </div>
      </footer>
    </div>
  );
}