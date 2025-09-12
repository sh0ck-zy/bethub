'use client';

import React, { useState, useEffect } from 'react';
import { HeaderClean } from '@/components/layout/HeaderClean';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, AlertCircle, Clock, Tv, Filter, ChevronDown } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useRoleSelector } from '@/components/ui/RoleSelector';
import { LeagueLogo } from '@/components/LeagueLogo';
import { LeagueSection, groupMatchesByLeague, LeagueSectionSkeleton } from '@/components/features/LeagueSection';
import { BannerCarousel } from '@/components/features/BannerCarousel';
// Removed betting offers and ads from this layout to avoid gambling references

import type { Match } from '@/lib/types';

export default function HomePage() {
  // --- STATE MANAGEMENT ---
  const [selectedLeague, setSelectedLeague] = useState<string>('all');
  const [matches, setMatches] = useState<Match[]>([]);
  const [featuredMatch, setFeaturedMatch] = useState<Match | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const { isAdmin: realIsAdmin } = useAuth();
  const { isAdmin: demoIsAdmin } = useRoleSelector();

  // Generate league list dynamically from available matches
  const getAvailableLeagues = () => {
    const leagueMap = new Map();
    
    // Add "All Leagues" option
    leagueMap.set('all', { id: 'all', name: 'All Matches', count: matches.length });
    
    // League display name mapping
    const leagueDisplayNames: { [key: string]: string } = {
      'Premier League': 'Premier League',
      'Primera División': 'La Liga',
      'Serie A': 'Serie A',
      'Bundesliga': 'Bundesliga',
      'Ligue 1': 'Ligue 1',
      'UEFA Champions League': 'Champions League',
      'Champions League': 'Champions League',
      'UEFA Europa League': 'Europa League',
      'Europa League': 'Europa League',
      'UEFA Conference League': 'Conference League',
      'Conference League': 'Conference League',
    };
    
    // Count matches per league
    matches.forEach(match => {
      const leagueId = match.league;
      const displayName = leagueDisplayNames[leagueId] || leagueId;
      
      if (!leagueMap.has(leagueId)) {
        leagueMap.set(leagueId, { 
          id: leagueId, 
          name: displayName, 
          count: 0,
          logoUrl: match.league_logo
        });
      }
      
      const league = leagueMap.get(leagueId);
      league.count++;
      if (!league.logoUrl && match.league_logo) {
        league.logoUrl = match.league_logo;
      }
    });
    
    return Array.from(leagueMap.values())
      .filter(league => league.id === 'all' || league.count > 0)
      .sort((a, b) => {
        if (a.id === 'all') return -1;
        if (b.id === 'all') return 1;
        return b.count - a.count;
      });
  };

  const availableLeagues = getAvailableLeagues();

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
      
      const isAdmin = realIsAdmin || demoIsAdmin;
      const adminParam = isAdmin ? '&admin=true' : '';
      const response = await fetch(`/api/v1/today?${adminParam}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      const matches = data.matches || data;
      const spotlightMatch = data.spotlight_match;
      
      if (Array.isArray(matches)) {
        const uniqueMatches = matches.filter((match, index, self) => 
          index === self.findIndex(m => m.id === match.id)
        );
        
        const sortedMatches = uniqueMatches.sort((a, b) => {
          const getWeight = (match: Match) => {
            if (match.status === 'LIVE') return 1;
            if (match.status === 'FT') return 3;
            return 2;
          };

          const weightA = getWeight(a);
          const weightB = getWeight(b);

          if (weightA !== weightB) {
            return weightA - weightB;
          }

          return new Date(a.kickoff_utc).getTime() - new Date(b.kickoff_utc).getTime();
        });

        setMatches(sortedMatches);
        
        if (spotlightMatch) {
          setFeaturedMatch(spotlightMatch);
        } else {
          const liveMatch = sortedMatches.find(m => m.status === 'LIVE');
          const upcomingMatch = sortedMatches.find(m => m.status === 'PRE');
          const finishedMatch = sortedMatches.find(m => m.status === 'FT');
          setFeaturedMatch(liveMatch || upcomingMatch || finishedMatch || null);
        }
      } else {
        setMatches([]);
        setFeaturedMatch(null);
      }
    } catch (error) {
      console.error('Error fetching matches:', error);
      setError('Failed to load matches. Please try again.');
      setMatches([]);
      setFeaturedMatch(null);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Filter logic
  const getLeagueMatches = (matchLeague: string, filterLeague: string): boolean => {
    if (filterLeague === 'all') return true;
    if (matchLeague === filterLeague) return true;
    
    const leagueAliases: { [key: string]: string[] } = {
      'La Liga': ['Primera División', 'Primera Division', 'La Liga'],
      'Primera División': ['Primera División', 'Primera Division', 'La Liga'],
      'Champions League': ['UEFA Champions League', 'Champions League'],
      'UEFA Champions League': ['UEFA Champions League', 'Champions League'],
      'Europa League': ['UEFA Europa League', 'Europa League'],
      'UEFA Europa League': ['UEFA Europa League', 'Europa League'],
      'Conference League': ['UEFA Conference League', 'Conference League'],
      'UEFA Conference League': ['UEFA Conference League', 'Conference League'],
    };
    
    const aliases = leagueAliases[filterLeague] || [filterLeague];
    return aliases.includes(matchLeague);
  };

  const filteredMatches = matches.filter(match => {
    return getLeagueMatches(match.league, selectedLeague);
  });

  // Group matches by league for display
  const groupedMatches = groupMatchesByLeague(filteredMatches);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* FotMob-style Header */}
      <HeaderClean 
        onLoginClick={() => setShowAuthModal(true)}
        showAuthModal={showAuthModal}
        setShowAuthModal={setShowAuthModal}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      <div className="flex">
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        {/* Left Sidebar - League Navigation */}
        <div className={`
          fixed lg:static inset-y-0 left-0 z-50 lg:z-auto
          transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} 
          lg:translate-x-0 transition-transform duration-300 ease-in-out
          w-64 lg:w-72 bg-gray-850 border-r border-gray-800
        `}>
          <div className="p-4">
            <h2 className="font-semibold text-white text-lg mb-4">Leagues</h2>
            <nav className="space-y-1">
              {availableLeagues.map(league => (
                <button
                  key={league.id}
                  onClick={() => {
                    setSelectedLeague(league.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors text-left ${
                    selectedLeague === league.id 
                      ? 'bg-gray-700 text-white' 
                      : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    {league.id === 'all' ? (
                      <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">ALL</span>
                      </div>
                    ) : (
                      <LeagueLogo league={league.id} size={24} logoUrl={league.logoUrl} />
                    )}
                    <span className="text-sm font-medium">{league.name}</span>
                  </div>
                  {league.count > 0 && league.id !== 'all' && (
                    <Badge variant="secondary" className="bg-gray-600 text-gray-300 text-xs">
                      {league.count}
                    </Badge>
                  )}
                </button>
              ))}
            </nav>
            
            {/* Intentionally left empty: no betting content */}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col lg:flex-row">
          {/* Live Scores Feed */}
          <main className="flex-1 p-4 lg:p-6">
            {/* Featured Match Banner */}
            {featuredMatch && (
              <div className="mb-6">
                <BannerCarousel match={featuredMatch} />
              </div>
            )}

            {/* Filter Bar */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <h2 className="text-lg font-semibold text-white">Today</h2>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white"
                  >
                    Live
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white"
                  >
                    <Tv className="w-3 h-3 mr-1" />
                    On TV
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white"
                  >
                    <Clock className="w-3 h-3 mr-1" />
                    By time
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                    className="bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white lg:hidden"
                  >
                    <Filter className="w-3 h-3 mr-1" />
                    Filter
                  </Button>
                </div>
              </div>
              
              <Button
                onClick={() => fetchMatches(true)}
                disabled={isRefreshing}
                variant="outline"
                size="sm"
                className="bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>

            {/* Error State */}
            {error && (
              <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-red-400 font-medium">Error loading matches</p>
                    <p className="text-red-400/80 text-sm">{error}</p>
                  </div>
                  <Button
                    onClick={() => fetchMatches(true)}
                    variant="outline"
                    size="sm"
                    className="text-red-400 border-red-800 hover:bg-red-900/20"
                  >
                    Retry
                  </Button>
                </div>
              </div>
            )}

            {/* Matches by League */}
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, index) => (
                  <LeagueSectionSkeleton key={index} />
                ))}
              </div>
            ) : groupedMatches.length > 0 ? (
              <div className="space-y-4">
                {groupedMatches.map((league) => (
                  <LeagueSection
                    key={league.id}
                    league={league}
                    showActions={true}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <Clock className="w-16 h-16 mx-auto text-gray-600 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No matches found</h3>
                <p className="text-gray-400 mb-6">
                  Try adjusting your filters or check back later for new matches.
                </p>
                <Button
                  onClick={() => {
                    setSelectedLeague('all');
                    fetchMatches(true);
                  }}
                  variant="outline"
                  className="bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reset Filters & Refresh
                </Button>
              </div>
            )}
          </main>

          {/* Right Sidebar */}
          <aside className="w-full lg:w-80 p-4 lg:p-6 space-y-6 bg-gray-900 lg:bg-transparent">
            {/* Upcoming Match Preview */}
            {featuredMatch && (
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                <h3 className="font-semibold text-white text-sm mb-2">Featured Match</h3>
                <div className="text-center">
                  <p className="text-xs text-gray-400 mb-2">{featuredMatch.league}</p>
                  <p className="text-sm font-medium text-white">
                    {featuredMatch.home_team} vs {featuredMatch.away_team}
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(featuredMatch.kickoff_utc).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )}
            
            {/* Intentionally left empty: no ad content */}
            
            {/* Match News Placeholder */}
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
              <h3 className="font-semibold text-white text-sm mb-4">Match News</h3>
              <div className="text-center py-8">
                <p className="text-gray-500 text-sm">
                  News aggregation system will appear here
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}