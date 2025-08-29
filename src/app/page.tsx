'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RefreshCw, AlertCircle, Brain } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useRoleSelector } from '@/components/ui/RoleSelector';
import { TeamLogo } from '@/components/TeamLogo';
import { LeagueLogo } from '@/components/LeagueLogo';
import Link from 'next/link';
import { BettingOffers } from '@/components/features/BettingOffers';
import { AdComponent } from '@/components/features/AdComponent';
import { BannerCarousel } from '@/components/features/BannerCarousel';
import { MatchCard } from '@/components/features/MatchCard';

import type { Match } from '@/lib/types';

const FireIcon = ({ size = 16, className = '' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1.5-2.5S8 8.5 8 9c0 1.38.5 2 1.5 2.5S11 12.5 11 13c0 1.38-.5 2-1.5 2.5S8 16.5 8 17c0 1.38.5 2 1.5 2.5S11 20.5 11 21c0 1.38-.5 2-1.5 2.5S8 24.5 8 25"></path><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg>
);

export default function HomePage() {
  // --- STATE MANAGEMENT ---
  const [selectedSport] = useState('football');
  const [selectedLeague, setSelectedLeague] = useState<string>('all');
  const [matches, setMatches] = useState<Match[]>([]);
  const [featuredMatch, setFeaturedMatch] = useState<Match | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { isAdmin: realIsAdmin } = useAuth();
  const { isAdmin: demoIsAdmin } = useRoleSelector();


  // Generate league list dynamically from available matches
  const getAvailableLeagues = () => {
    const leagueMap = new Map();
    
    // Add "All Leagues" option
    leagueMap.set('all', { id: 'all', name: 'All Leagues', count: matches.length });
    
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
          logoUrl: match.league_logo // Add league logo URL from API
        });
      }
      
      const league = leagueMap.get(leagueId);
      league.count++;
      // Update logo URL if we don't have one yet
      if (!league.logoUrl && match.league_logo) {
        league.logoUrl = match.league_logo;
      }
    });
    
    // Convert to array and sort by count (most matches first)
    return Array.from(leagueMap.values())
      .filter(league => league.id === 'all' || league.count > 0)
      .sort((a, b) => {
        if (a.id === 'all') return -1;
        if (b.id === 'all') return 1;
        return b.count - a.count;
      });
  };

  const leaguesBySport = {
    football: getAvailableLeagues(),
    basketball: [],
    tennis: [],
    cricket: [],
    rugby: [],
  };


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
      
      // Include admin flag if user is admin (real or demo)
      const isAdmin = realIsAdmin || demoIsAdmin;
      const adminParam = isAdmin ? '&admin=true' : '';
      const response = await fetch(`/api/v1/today?${adminParam}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Handle new API response format
      const matches = data.matches || data;
      const spotlightMatch = data.spotlight_match;
      
      if (Array.isArray(matches)) {
        // Remove any duplicates before processing
        const uniqueMatches = matches.filter((match, index, self) => 
          index === self.findIndex(m => m.id === match.id)
        );
        
        // Smart sorting: Live → Upcoming → Finished
        const sortedMatches = uniqueMatches.sort((a, b) => {
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
        
        // Use spotlight match from API if available, otherwise fallback to auto-selection
        if (spotlightMatch) {
          setFeaturedMatch(spotlightMatch);
        } else {
          // Fallback to auto-selection: first live match, first upcoming match, or first finished match
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


  // Filter logic with smart league matching
  const getLeagueMatches = (matchLeague: string, filterLeague: string): boolean => {
    if (filterLeague === 'all') return true;
    
    // Direct match
    if (matchLeague === filterLeague) return true;
    
    // Handle league name variations
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

  



  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      {/* Consistent Header */}
      <Header 
        onLoginClick={() => setShowAuthModal(true)}
        showAuthModal={showAuthModal}
        setShowAuthModal={setShowAuthModal}
      />

      <div className="flex flex-col lg:flex-row gap-8 p-4 lg:p-8">

        {/* --- LEFT SIDEBAR --- */}
        <aside className="w-full lg:w-72 flex-shrink-0 space-y-8 hidden lg:flex lg:flex-col">
          <div className="bg-card p-6 rounded-2xl border border-border shadow-lg">
            <h2 className="font-bold text-card-foreground text-xl mb-6">Leagues</h2>
            <nav className="space-y-2">
              {leaguesBySport[selectedSport as keyof typeof leaguesBySport]?.map(league => (
                <a key={league.id} href="#" onClick={(e) => { e.preventDefault(); setSelectedLeague(league.id); }}
                  className={`flex items-center justify-between p-3 rounded-lg transition-colors relative group ${selectedLeague === league.id ? 'bg-accent shadow-inner' : 'hover:bg-accent/50'}`}>
                  <div className={`absolute left-0 top-0 bottom-0 w-1.5 rounded-l-lg transition-all duration-300 ${selectedLeague === league.id ? 'bg-primary' : 'bg-transparent group-hover:bg-primary/50'}`}></div>
                  <div className="flex items-center space-x-4 ml-2">
                    {league.id === 'all' ? (
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">ALL</span>
                      </div>
                    ) : (
                      <LeagueLogo league={league.id} size={32} logoUrl={league.logoUrl} />
                    )}
                    <div className="flex flex-col">
                      <span className="text-base font-medium text-card-foreground">{league.name}</span>
                      {league.count > 0 && league.id !== 'all' && (
                        <span className="text-xs text-muted-foreground">{league.count} matches</span>
                      )}
                    </div>
                  </div>
                  {league.count > 0 && league.id !== 'all' && (
                    <span className="text-sm font-bold text-primary">{league.count}</span>
                  )}
                </a>
              ))}
            </nav>
          </div>
          {/* Betting Offers replaces Buletin Story */}
          <BettingOffers />
          <div className="relative h-48 hidden lg:block mt-auto">
            <img src="https://placehold.co/200x200/191924/FFFFFF/png?text=Player+Graphic" alt="Soccer player graphic" className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-auto max-w-[150px]" />
          </div>
        </aside>

        {/* --- MAIN CONTENT --- */}
        <main className="flex-1 space-y-8">
          {/* --- MATCH IN SPOTLIGHT HERO PANEL --- */}
          {featuredMatch && <BannerCarousel match={featuredMatch} />}

          <div className="bg-card p-6 rounded-2xl border border-border shadow-lg">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-card-foreground text-xl">
                {selectedLeague !== 'all' ? `Fixtures: ${selectedLeague}` : 'Upcoming Fixtures'}
              </h3>
              <div className="flex items-center gap-3">
                {isRefreshing && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Updating...</span>
                  </div>
                )}
                <Button
                  onClick={() => fetchMatches(true)}
                  disabled={isRefreshing}
                  variant="outline"
                  size="sm"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                <Button onClick={() => setSelectedLeague('all')} className="text-base text-primary hover:text-primary/80 font-semibold">View All →</Button>
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
                {filteredMatches.map(match => (
                  <MatchCard
                    key={match.id}
                    match={match}
                    mode="public"
                  />
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
          </div>
        </main>

        {/* --- RIGHT SIDEBAR --- */}
        <aside className="w-full lg:w-80 flex-shrink-0 space-y-8 hidden xl:flex xl:flex-col">
          <div className="bg-card p-6 rounded-2xl border border-border shadow-lg">
            <h3 className="font-bold text-card-foreground text-lg mb-2">Upcoming Match</h3>
            <p className="text-xs text-muted-foreground mb-4">Description about this match</p>
            {featuredMatch && (
              <div className="bg-muted/50 p-4 rounded-lg flex items-center justify-around mb-4 shadow-inner border border-border">
                <TeamLogo team={featuredMatch.home_team} size={48} logoUrl={featuredMatch.home_team_logo} />
                <span className="text-card-foreground font-bold text-xl">VS</span>
                <TeamLogo team={featuredMatch.away_team} size={48} logoUrl={featuredMatch.away_team_logo} />
              </div>
            )}
            <Link href={featuredMatch ? `/match/${featuredMatch.id}` : '#'}>
              <Button className="w-full bg-secondary hover:bg-secondary/80 text-secondary-foreground font-semibold py-3 rounded-lg transition-colors">
                Match Details
              </Button>
            </Link>
          </div>
          {/* Ad replaces Total Watch Time */}
          <AdComponent />
          <div className="bg-card p-6 rounded-2xl border border-border shadow-lg">
            <h3 className="font-bold text-card-foreground text-xl mb-6 flex items-center gap-3"><FireIcon className="text-red-500 w-6 h-6" /> Match News</h3>
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                News aggregation system will appear here when autonomous pipeline is active
              </p>
            </div>
          </div>
        </aside>

      </div>

      {/* Consistent Footer */}
      <Footer />
    </div>
  );
}