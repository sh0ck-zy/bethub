'use client';

import React, { useState, useEffect } from 'react';
import { MatchCard } from '@/components/features/MatchCard';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { RefreshCw, AlertCircle, Brain, TrendingUp, Filter, Crown } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useRoleSelector } from '@/components/ui/RoleSelector';

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
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { user, isAdmin } = useAuth();

  // Premium user check (placeholder - implement subscription logic later)
  const isPremium = false; // TODO: Implement subscription system

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);
      
      const response = await fetch(`/api/v1/today`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (Array.isArray(data)) {
        // Smart sorting: Live → Upcoming → Finished
        const sortedMatches = data.sort((a, b) => {
          const getWeight = (match: Match) => {
            if (match.status === 'LIVE') return 1;
            if (match.status === 'FT') return 3;
            return 2; // PRE/upcoming
          };

          const weightA = getWeight(a);
          const weightB = getWeight(b);

          if (weightA !== weightB) {
            return weightA - weightB;
          }

          return new Date(a.kickoff_utc).getTime() - new Date(b.kickoff_utc).getTime();
        });

        setMatches(sortedMatches);
      } else {
        setMatches([]);
      }
    } catch (error) {
      console.error('Error fetching matches:', error);
      setError('Failed to load matches. Please try again.');
      setMatches([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Filter logic
  const leagues = ['all', ...new Set(matches.map(match => match.league))];
  const statuses = [
    { value: 'all', label: 'All Matches' },
    { value: 'LIVE', label: 'Live Now' },
    { value: 'PRE', label: 'Upcoming' },
    { value: 'FT', label: 'Finished' }
  ];

  const filteredMatches = matches.filter(match => {
    const leagueMatch = selectedLeague === 'all' || match.league === selectedLeague;
    const statusMatch = selectedStatus === 'all' || match.status === selectedStatus;
    return leagueMatch && statusMatch;
  });

  // User state content - integrate with demo role system
  const { isAuthenticated: isDemoAuthenticated, isPremium: isDemoPremium } = useRoleSelector();
  const finalIsAuthenticated = isDemoAuthenticated || !!user;
  const finalIsPremium = isDemoPremium || isPremium;
  
  const getUserStateMessage = () => {
    if (!finalIsAuthenticated) {
      return {
        title: "AI-Powered Match Analysis",
        subtitle: "Get intelligent insights for today's biggest matches",
        cta: "Sign up for free analysis"
      };
    }
    
    if (!finalIsPremium) {
      return {
        title: `Welcome back, ${user?.email?.split('@')[0] || 'User'}`,
        subtitle: "You have 1 free analysis remaining today",
        cta: null // No CTA for authenticated users
      };
    }
    
    return {
      title: `Premium Access Active`,
      subtitle: "Unlimited AI analysis and advanced insights",
      cta: null
    };
  };

  const userState = getUserStateMessage();

  return (
    <div className="min-h-screen bg-background app-background dark:app-background flex flex-col">
      {/* Consistent Header */}
      <Header 
        onLoginClick={() => setShowAuthModal(true)}
        showAuthModal={showAuthModal}
        setShowAuthModal={setShowAuthModal}
      />

      {/* Hero Section - User State Aware */}
      <div className="bg-accent/30 border-b border-border texture-overlay dark:texture-overlay">
        <div className="max-w-7xl mx-auto px-4 py-8 text-center">
          <div className="flex items-center justify-center space-x-2 mb-3">
            <Brain className="w-6 h-6 text-primary" />
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              {userState.title}
            </h1>
            {finalIsPremium && (
              <Crown className="w-6 h-6 text-yellow-500" />
            )}
          </div>
          
          <p className="text-muted-foreground text-lg mb-6 max-w-2xl mx-auto">
            {userState.subtitle}
          </p>

          {/* User State CTA */}
          {userState.cta && (
            <Button 
              onClick={() => finalIsAuthenticated ? alert('Upgrade modal') : setShowAuthModal(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-8 py-3 text-lg border-0"
            >
              {finalIsAuthenticated ? (
                <>
                  <Crown className="w-5 h-5 mr-2" />
                  {userState.cta}
                </>
              ) : (
                <>
                  <Brain className="w-5 h-5 mr-2" />
                  {userState.cta}
                </>
              )}
            </Button>
          )}

          {/* Usage indicator for free users */}
          {finalIsAuthenticated && !finalIsPremium && (
            <div className="mt-4 flex items-center justify-center space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>1 analysis remaining today</span>
              </div>
              <span>•</span>
              <button 
                onClick={() => alert('Upgrade modal')}
                className="text-primary hover:text-primary/80 font-medium"
              >
                Upgrade for unlimited
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
        {/* Filters & Controls */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-8">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-bold text-foreground">Today's Matches</h2>
            <Badge className="bg-primary/10 text-primary border-primary/20">
              {filteredMatches.length} matches
            </Badge>
            {isRefreshing && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span className="text-sm">Updating...</span>
              </div>
            )}
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            {/* Refresh Button */}
            <Button
              onClick={() => fetchMatches(true)}
              disabled={isRefreshing}
              variant="outline"
              size="sm"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>

            {/* League Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <select 
                value={selectedLeague}
                onChange={(e) => setSelectedLeague(e.target.value)}
                className="bg-card border border-border rounded-lg px-3 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none min-w-[140px] text-foreground"
              >
                {leagues.map(league => (
                  <option key={league} value={league}>
                    {league === 'all' ? 'All Leagues' : league}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <select 
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-card border border-border rounded-lg px-3 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none min-w-[120px] text-foreground"
            >
              {statuses.map(status => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <Card className="border-destructive/20 bg-destructive/10 mb-8">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-destructive font-medium">Error loading matches</p>
                  <p className="text-destructive/80 text-sm">{error}</p>
                </div>
                <Button
                  onClick={() => fetchMatches(true)}
                  variant="outline"
                  size="sm"
                  className="text-destructive border-destructive/30 hover:bg-destructive/10"
                >
                  Retry
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {isLoading && !isRefreshing && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <div className="h-4 bg-muted rounded w-24"></div>
                    <div className="h-6 bg-muted rounded w-16"></div>
                  </div>
                  <div className="h-4 bg-muted rounded w-32 mb-6"></div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-muted rounded-full"></div>
                      <div className="h-4 bg-muted rounded w-20"></div>
                    </div>
                    <div className="h-4 bg-muted rounded w-8"></div>
                    <div className="flex items-center space-x-3">
                      <div className="h-4 bg-muted rounded w-20"></div>
                      <div className="w-8 h-8 bg-muted rounded-full"></div>
                    </div>
                  </div>
                  <div className="h-16 bg-muted rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Matches Grid */}
        {!isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMatches.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredMatches.length === 0 && !error && (
          <Card className="text-center py-16">
            <CardContent>
              <Brain className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No matches found</h3>
              <p className="text-muted-foreground mb-6">
                Try adjusting your filters or check back later for new matches.
              </p>
              <Button
                onClick={() => {
                  setSelectedLeague('all');
                  setSelectedStatus('all');
                  fetchMatches(true);
                }}
                variant="outline"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Reset Filters & Refresh
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Premium CTA for non-premium users */}
        {!isLoading && filteredMatches.length > 0 && finalIsAuthenticated && !finalIsPremium && (
          <Card className="mt-12 bg-gradient-to-r from-primary/90 to-primary/70 text-primary-foreground border-0">
            <CardContent className="p-8 text-center">
              <Crown className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-3">Unlock Unlimited Analysis</h3>
              <p className="text-primary-foreground/90 mb-6 max-w-2xl mx-auto">
                Get unlimited AI analysis, live tactical updates, and advanced insights for every match
              </p>
              <div className="flex flex-wrap justify-center gap-4 text-sm text-primary-foreground/90 mb-6">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4" />
                  <span>Unlimited match analysis</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Brain className="w-4 h-4" />
                  <span>Real-time tactical updates</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Crown className="w-4 h-4" />
                  <span>Advanced statistics</span>
                </div>
              </div>
              <Button 
                onClick={() => alert('Premium upgrade modal')}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold px-8 py-3 text-lg border-0"
              >
                Upgrade to Premium • $9.99/month
              </Button>
              <p className="text-xs text-primary-foreground/70 mt-3">7-day free trial • Cancel anytime</p>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Consistent Footer */}
      <Footer />
    </div>
  );
}