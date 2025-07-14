'use client';

import React, { useState, useEffect } from 'react';
import { MatchCard } from '@/components/features/MatchCard';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { RefreshCw, AlertCircle, Brain, TrendingUp, Filter, Crown, Search, Calendar, MapPin, BarChart3 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useRoleSelector } from '@/components/ui/RoleSelector';
import { TeamLogo } from '@/components/TeamLogo';
import Link from 'next/link';
import { BettingOffers } from '@/components/features/BettingOffers';
import { AdComponent } from '@/components/features/AdComponent';

import type { Match } from '@/lib/types';

// --- SVG ICON COMPONENTS ---
const SearchIcon = ({ size = 20, className = '' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
);

const PinIcon = ({ size = 16, className = '' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
);

const FireIcon = ({ size = 16, className = '' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M14.5 9.5c0 .9-.4 1.7-.9 2.3-.5.6-1.2 1-2.1 1.1v1.1c0 .8-.7 1.5-1.5 1.5s-1.5-.7-1.5-1.5v-1.1c-.9-.1-1.6-.5-2.1-1.1-.5-.6-.9-1.4-.9-2.3 0-1.3 1.1-2.5 2.5-2.5h.5c.8 0 1.5-.7 1.5-1.5s-.7-1.5-1.5-1.5h-.5c-1.4 0-2.5 1.1-2.5 2.5 0 .9.4 1.7.9 2.3.5.6 1.2 1 2.1 1.1v1.1c0 .8.7 1.5 1.5 1.5s1.5-.7 1.5-1.5v-1.1c.9-.1 1.6-.5 2.1-1.1-.5-.6.9-1.4-.9-2.3.1-1.3-1-2.5-2.4-2.5h-1.6c-.8 0-1.5-.7-1.5-1.5s.7-1.5 1.5-1.5h1.6c1.4 0 2.5 1.1 2.5 2.5z"></path><path d="M12 22a7 7 0 0 0 7-7h-4a3 3 0 0 1-3 3v4z"></path><path d="M12 2a7 7 0 0 0-7 7h4a3 3 0 0 1 3-3V2z"></path></svg>
);

const BarChartIcon = ({ size = 20, className = '' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="12" x2="12" y1="20" y2="10" /><line x1="18" x2="18" y1="20" y2="4" /><line x1="6" x2="6" y1="20" y2="16" /></svg>
);

export default function HomePage() {
  // --- STATE MANAGEMENT ---
  const [selectedSport, setSelectedSport] = useState('football');
  const [expandedSport, setExpandedSport] = useState('football');
  const [selectedLeague, setSelectedLeague] = useState('all');
  const [activeTopNav, setActiveTopNav] = useState('NBA');
  const [matches, setMatches] = useState<Match[]>([]);
  const [featuredMatch, setFeaturedMatch] = useState<Match | null>(null);
  const [news, setNews] = useState<any[]>([]);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { user, isAdmin } = useAuth();

  // Premium user check (placeholder - implement subscription logic later)
  const isPremium = false; // TODO: Implement subscription system

  // --- MOCK DATA ---
  const topNavLinks = ['NBA', 'NFL', 'MLB', 'NHL'];

  const leaguesBySport = {
    football: [
      { id: 'all', name: 'All Leagues', logo: 'https://ssl.gstatic.com/onebox/media/sports/logos/udQ6Q2hQx_PEwHIMASGkCg_96x96.png' },
      { id: 'Premier League', name: 'Premier League', logo: 'https://ssl.gstatic.com/onebox/media/sports/logos/udQ6Q2hQx_PEwHIMASGkCg_96x96.png' },
      { id: 'La Liga', name: 'La Liga', logo: 'https://ssl.gstatic.com/onebox/media/sports/logos/7spCx_to_z6CHmEkpDE2pA_96x96.png' },
      { id: 'Bundesliga', name: 'Bundesliga', logo: 'https://ssl.gstatic.com/onebox/media/sports/logos/C3J4TlgD-A-3guT_bY7V4g_96x96.png' },
      { id: 'Europa League', name: 'Europa League', logo: 'https://ssl.gstatic.com/onebox/media/sports/logos/1pcFFy6J2bV1A-ImA5O2sg_96x96.png', isHot: true },
    ],
    basketball: [{ id: 'NBA', name: 'NBA', logo: 'https://ssl.gstatic.com/onebox/media/sports/logos/pLEm-s-s25oZc-O2gm_B4g_96x96.png' }],
    tennis: [{ id: 'ATP', name: 'ATP Tour', logo: 'https://placehold.co/32x32/F59E0B/FFFFFF/png?text=ATP' }],
    cricket: [],
    rugby: [],
  };
  
  const bulletinLogos = [
    { name: 'IDN', logo: 'https://placehold.co/40x40/FFFFFF/000000/png?text=IDN' },
    { name: 'bb', logo: 'https://placehold.co/40x40/FFFFFF/000000/png?text=bb' },
    { name: 'fox', logo: 'https://placehold.co/40x40/FFFFFF/000000/png?text=FOX' },
    { name: 'sony', logo: 'https://placehold.co/40x40/FFFFFF/000000/png?text=SONY' },
    { name: 'sky', logo: 'https://placehold.co/40x40/FFFFFF/000000/png?text=sky' },
  ];

  const dummyNews = [
    { id: 1, title: 'Haaland injury update ahead of Arsenal clash', date: '2 hours ago', source: 'Sky Sports', image: 'https://images.unsplash.com/photo-1554143928-a4003023d344?q=80&w=1974&auto=format&fit=crop' },
    { id: 2, title: 'Tactical Analysis: How Arsenal can exploit City\'s high line', date: '5 hours ago', source: 'The Athletic', image: 'https://images.unsplash.com/photo-1519791883288-dc8bd696e667?q=80&w=2070&auto=format&fit=crop' },
    { id: 3, title: 'Head-to-head: Recent meetings favor City', date: '1 day ago', source: 'ESPN', image: 'https://images.unsplash.com/photo-1543351368-35d315a9b189?q=80&w=2070&auto=format&fit=crop' }
  ];
  
  const watchTimeData = [
    { day: 'Mon', time: 1.5 }, { day: 'Tue', time: 2 }, { day: 'Wed', time: 3 },
    { day: 'Thu', time: 2.5 }, { day: 'Fri', time: 4 }, { day: 'Sat', time: 5 }, { day: 'Sun', time: 1 }
  ];

  useEffect(() => {
    fetchMatches();
    setNews(dummyNews);
  }, []);

  const fetchMatches = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);
      
      // Include admin flag if user is admin
      const adminParam = isAdmin ? '&admin=true' : '';
      const response = await fetch(`/api/v1/today?${adminParam}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Handle new API response format
      const matches = data.matches || data;
      
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
        
        // Set featured match (first live match or first upcoming match)
        const liveMatch = sortedMatches.find(m => m.status === 'LIVE');
        const upcomingMatch = sortedMatches.find(m => m.status === 'PRE');
        setFeaturedMatch(liveMatch || upcomingMatch || null);
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

  const handleSportClick = (sportId: string) => {
    setExpandedSport(sportId === expandedSport ? '' : sportId);
    setSelectedSport(sportId);
    setSelectedLeague('all');
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
    return leagueMatch;
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

  const FormIndicator = ({ result }: { result: string }) => (
    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-inner ${result === 'W' ? 'bg-green-500' : result === 'L' ? 'bg-red-500' : 'bg-gray-500'}`}>
      {result}
    </span>
  );

  return (
    <div className="bg-[#191924] min-h-screen text-gray-300 font-sans" style={{fontFamily: "'Inter', sans-serif"}}>
      {/* Consistent Header */}
      <Header 
        onLoginClick={() => setShowAuthModal(true)}
        showAuthModal={showAuthModal}
        setShowAuthModal={setShowAuthModal}
      />

      <div className="flex flex-col lg:flex-row gap-8 p-4 lg:p-8">

        {/* --- LEFT SIDEBAR --- */}
        <aside className="w-full lg:w-72 flex-shrink-0 space-y-8 hidden lg:flex lg:flex-col">
          <div className="bg-gradient-to-br from-[#27293D] to-[#1E1E2D] p-6 rounded-2xl border border-gray-700/50 shadow-2xl">
            <h2 className="font-bold text-white text-xl mb-6">Leagues</h2>
            <nav className="space-y-2">
              {leaguesBySport[selectedSport as keyof typeof leaguesBySport]?.map(league => (
                <a key={league.id} href="#" onClick={(e) => { e.preventDefault(); setSelectedLeague(league.id); }}
                  className={`flex items-center justify-between p-3 rounded-lg transition-colors relative group ${selectedLeague === league.id ? 'bg-[#191924] shadow-inner' : 'hover:bg-[#32354e]'}`}>
                  <div className={`absolute left-0 top-0 bottom-0 w-1.5 rounded-l-lg transition-all duration-300 ${selectedLeague === league.id ? 'bg-red-500' : 'bg-transparent group-hover:bg-red-500/50'}`}></div>
                  <div className="flex items-center space-x-4 ml-2">
                    <img src={league.logo} alt={league.name} className="w-8 h-8 rounded-full bg-white p-1" />
                    <span className="text-base font-medium">{league.name}</span>
                  </div>
                  {(league as any).isHot && <FireIcon className="text-red-500" />}
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
          {featuredMatch && (
            <div className="bg-cover bg-center rounded-2xl p-8 flex flex-col justify-between h-72 relative border border-gray-700/50 shadow-2xl" style={{ backgroundImage: `url(https://images.unsplash.com/photo-1628852654354-13931612419c?q=80&w=2832&auto=format&fit=crop)` }}>
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-transparent rounded-2xl"></div>
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div>
                  <h2 className="text-white text-4xl font-bold tracking-tight">{featuredMatch.home_team} VS {featuredMatch.away_team}</h2>
                  <div className="flex items-center space-x-6 mt-3 text-base text-gray-300">
                    <span className="flex items-center gap-2"><Calendar className="w-4 h-4" /> {new Date(featuredMatch.kickoff_utc).toLocaleDateString()}</span>
                    <span className="flex items-center gap-2"><PinIcon /> {featuredMatch.venue || 'TBD'}</span>
                  </div>
                </div>
                <div>
                  <Link href={`/match/${featuredMatch.id}`}>
                    <Button className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-lg transition-colors flex items-center gap-3 text-lg shadow-lg shadow-red-600/40 transform hover:scale-105">
                      <BarChartIcon /> AI Detailed Analysis
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}

          <div className="bg-gradient-to-br from-[#27293D] to-[#1E1E2D] p-6 rounded-2xl border border-gray-700/50 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-white text-xl">
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
                <Button onClick={() => setSelectedLeague('all')} className="text-base text-blue-400 hover:text-blue-300 font-semibold">View All →</Button>
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
              <div className="space-y-4">
                {filteredMatches.map(fixture => (
                  <div key={fixture.id} className="bg-[#191924] p-4 rounded-lg flex flex-col md:flex-row items-center justify-between gap-4 shadow-inner">
                    <div className="flex items-center justify-between w-full md:w-auto md:gap-6">
                      <div className="flex flex-col items-center w-28 text-center">
                        <TeamLogo team={fixture.home_team} size={64} />
                        <span className="font-bold text-white text-base mt-2">{fixture.home_team}</span>
                        <div className="flex space-x-2 mt-2">
                          {['W', 'L', 'W', 'D', 'W'].map((r, i) => <FormIndicator key={i} result={r} />)}
                        </div>
                      </div>
                      <div className="text-center mx-4">
                        <span className="text-3xl font-bold text-gray-400">VS</span>
                        <div className="text-sm text-gray-500 mt-1">{new Date(fixture.kickoff_utc).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                      </div>
                      <div className="flex flex-col items-center w-28 text-center">
                        <TeamLogo team={fixture.away_team} size={64} />
                        <span className="font-bold text-white text-base mt-2">{fixture.away_team}</span>
                        <div className="flex space-x-2 mt-2">
                          {['W', 'W', 'L', 'W', 'D'].map((r, i) => <FormIndicator key={i} result={r} />)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mt-4 md:mt-0">
                      <div className="flex flex-col gap-2 text-sm font-mono text-center">
                        <div className="flex gap-2">
                          <span className="bg-[#32354e] px-3 py-1 rounded w-20">1: {(2.1 + Math.random() * 0.8).toFixed(2)}</span>
                          <span className="bg-[#32354e] px-3 py-1 rounded w-20">X: {(3.2 + Math.random() * 0.6).toFixed(2)}</span>
                          <span className="bg-[#32354e] px-3 py-1 rounded w-20">2: {(2.8 + Math.random() * 0.8).toFixed(2)}</span>
                        </div>
                        <Link href={`/match/${fixture.id}`}>
                          <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-3 rounded-lg text-base transition-colors w-full mt-2">Analyze</Button>
                        </Link>
                      </div>
                    </div>
                  </div>
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
          <div className="bg-gradient-to-br from-[#27293D] to-[#1E1E2D] p-6 rounded-2xl border border-gray-700/50 shadow-2xl">
            <h3 className="font-bold text-white text-lg mb-2">Upcoming Match</h3>
            <p className="text-xs text-gray-400 mb-4">Description about this match</p>
            {featuredMatch && (
              <div className="bg-[#191924] p-4 rounded-lg flex items-center justify-around mb-4 shadow-inner">
                <TeamLogo team={featuredMatch.home_team} size={48} />
                <span className="text-white font-bold text-xl">VS</span>
                <TeamLogo team={featuredMatch.away_team} size={48} />
              </div>
            )}
            <Link href={featuredMatch ? `/match/${featuredMatch.id}` : '#'}>
              <Button className="w-full bg-[#32354e] hover:bg-blue-600 text-white font-semibold py-3 rounded-lg transition-colors">
                Match Details
              </Button>
            </Link>
          </div>
          {/* Ad replaces Total Watch Time */}
          <AdComponent />
          <div className="bg-gradient-to-br from-[#27293D] to-[#1E1E2D] p-6 rounded-2xl border border-gray-700/50 shadow-2xl">
            <h3 className="font-bold text-white text-xl mb-6 flex items-center gap-3"><FireIcon className="text-red-500 w-6 h-6" /> Hot News</h3>
            <div className="space-y-5">
              {news.map((article: any) => (
                <a href="#" key={article.id} className="flex items-center space-x-4 group">
                  <img src={article.image} alt={article.title} className="w-20 h-20 rounded-lg flex-shrink-0 object-cover transition-transform duration-300 group-hover:scale-105" />
                  <div>
                    <h4 className="text-base font-semibold text-white leading-tight transition-colors group-hover:text-blue-400">{article.title}</h4>
                    <p className="text-sm text-gray-400 mt-2">{article.source} - {article.date}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </aside>

      </div>

      {/* Consistent Footer */}
      <Footer />
    </div>
  );
}