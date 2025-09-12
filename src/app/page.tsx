'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AlertCircle, ChevronLeft, ChevronRight, RefreshCw, Star, StarOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useRoleSelector } from '@/components/ui/RoleSelector';
import { useTheme } from '@/contexts/ThemeContext';
import { LeagueLogo } from '@/components/LeagueLogo';
import { TeamLogo } from '@/components/TeamLogo';
import { BannerCarousel } from '@/components/features/BannerCarousel';

import type { Match } from '@/lib/types';

// Working Date Navigation Component (copied from admin page)
function DayNavigationBar({ selectedDate, onDateChange }: {
  selectedDate: Date,
  onDateChange: (date: Date) => void
}) {
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Generate exactly 7 days (±3 days from today, not selected date)
  const generateVisibleDays = () => {
    const days = [];
    const today = new Date();
    for (let i = -3; i <= 3; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      days.push(date);
    }
    return days;
  };

  const visibleDays = generateVisibleDays();
  const today = new Date();

  const formatDayLabel = (date: Date) => {
    const today = new Date();
    if (date.toDateString() === today.toDateString()) return 'Today';
    
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === -1) return 'Yesterday';
    if (diffDays === 1) return 'Tomorrow';
    
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const goToPreviousDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() - 1);
    onDateChange(newDate);
  };

  const goToNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + 1);
    onDateChange(newDate);
  };

  return (
    <div className="flex items-center justify-center gap-2 p-4 bg-muted/20 rounded-lg mb-6">
      {/* Previous Day Button */}
      <button
        onClick={goToPreviousDay}
        className="flex items-center justify-center rounded-full p-2 text-gray-500 dark:text-gray-400 transition-colors hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      {/* Day Navigation Pills */}
      <div className="flex items-center gap-1">
        {visibleDays.map((day, index) => {
          const isSelected = day.toDateString() === selectedDate.toDateString();
          const isToday = day.toDateString() === today.toDateString();
          
          return (
            <button
              key={day.toISOString()}
              className={`h-8 px-3 text-xs rounded-md transition-colors whitespace-nowrap border-b-2 ${
                isSelected 
                  ? 'border-green-600 bg-green-600/10 text-green-600 font-semibold' 
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
              } ${isToday && !isSelected ? 'font-semibold text-green-500' : ''}`}
              onClick={() => {
                if (isSelected) {
                  setShowDatePicker(true);
                } else {
                  onDateChange(day);
                }
              }}
            >
              {formatDayLabel(day)}
            </button>
          );
        })}
      </div>

      {/* Next Day Button */}
      <button
        onClick={goToNextDay}
        className="flex items-center justify-center rounded-full p-2 text-gray-500 dark:text-gray-400 transition-colors hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Date Picker Modal */}
      {showDatePicker && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold mb-4">Select Date</h3>
            <input
              type="date"
              value={selectedDate.toISOString().split('T')[0]}
              onChange={(e) => {
                const newDate = new Date(e.target.value + 'T12:00:00');
                onDateChange(newDate);
                setShowDatePicker(false);
              }}
              className="mb-4 px-3 py-2 border rounded-md"
            />
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDatePicker(false)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  onDateChange(new Date());
                  setShowDatePicker(false);
                }}
              >
                Today
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function HomePage() {
  const router = useRouter();
  const [selectedLeague, setSelectedLeague] = useState<string>('all');
  const [matches, setMatches] = useState<Match[]>([]);
  const [featuredMatch, setFeaturedMatch] = useState<Match | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [favoriteMatches, setFavoriteMatches] = useState<Set<string>>(new Set());
  const [hiddenLeagues, setHiddenLeagues] = useState<Set<string>>(new Set());

  const { isAdmin: realIsAdmin } = useAuth();
  const { isAdmin: demoIsAdmin } = useRoleSelector();
  const { theme, toggleTheme } = useTheme();

  // Date navigation now handled by DayNavigationBar component

  const dateFilteredMatches = useMemo(() => {
    const selectedDayKey = selectedDate.toISOString().split('T')[0];
    return matches.filter(match => {
      const matchDate = new Date(match.kickoff_utc).toISOString().split('T')[0];
      return matchDate === selectedDayKey;
    });
  }, [matches, selectedDate]);

  // Build available leagues from date-filtered matches only
  const availableLeagues = useMemo(() => {
    const leagueMap = new Map<string, { id: string; name: string; count: number; logoUrl?: string }>();
    leagueMap.set('all', { id: 'all', name: 'All Matches', count: dateFilteredMatches.length });
    dateFilteredMatches.forEach(match => {
      const leagueId = match.league;
      if (!leagueMap.has(leagueId)) {
        leagueMap.set(leagueId, { id: leagueId, name: leagueId, count: 0, logoUrl: match.league_logo });
      }
      const league = leagueMap.get(leagueId)!;
      league.count++;
      if (!league.logoUrl && match.league_logo) league.logoUrl = match.league_logo;
    });
    return Array.from(leagueMap.values())
      .filter(league => league.id === 'all' || league.count > 0)
      .sort((a, b) => (a.id === 'all' ? -1 : b.count - a.count));
  }, [dateFilteredMatches]);

  // Toggle favorite match
  const toggleFavorite = (matchId: string) => {
    setFavoriteMatches(prev => {
      const newSet = new Set(prev);
      if (newSet.has(matchId)) {
        newSet.delete(matchId);
      } else {
        newSet.add(matchId);
      }
      return newSet;
    });
  };

  const handleMatchClick = (matchId: string) => {
    router.push(`/match/${matchId}`);
  };

  const handleLogoClick = () => {
    // Reset to today's date when logo is clicked
    setSelectedDate(new Date());
    setSelectedLeague('all'); // Reset league filter too
  };

  const toggleLeagueVisibility = (leagueName: string) => {
    setHiddenLeagues(prev => {
      const newSet = new Set(prev);
      if (newSet.has(leagueName)) {
        newSet.delete(leagueName);
      } else {
        newSet.add(leagueName);
      }
      return newSet;
    });
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  // Reset league filter if current league has no matches for selected date
  useEffect(() => {
    if (selectedLeague !== 'all') {
      const hasMatchesForLeague = dateFilteredMatches.some(match => match.league === selectedLeague);
      if (!hasMatchesForLeague) {
        setSelectedLeague('all');
      }
    }
  }, [dateFilteredMatches, selectedLeague]);

  const fetchMatches = async (isRefresh = false) => {
    try {
      if (isRefresh) setIsRefreshing(true); else setIsLoading(true);
      setError(null);
      const isAdmin = realIsAdmin || demoIsAdmin;
      const adminParam = isAdmin ? 'admin=true' : '';
      const response = await fetch(`/api/v1/matches?${adminParam}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      const apiMatches: Match[] = data.matches || data;
      const spotlightMatch: Match | null = data.spotlight_match || null;
      if (Array.isArray(apiMatches)) {
        const uniqueMatches = apiMatches.filter((match, index, self) => index === self.findIndex(m => m.id === match.id));
        const sortedMatches = uniqueMatches.sort((a, b) => {
          const weight = (m: Match) => (m.status === 'LIVE' ? 1 : m.status === 'FT' ? 3 : 2);
          const wa = weight(a); const wb = weight(b);
          if (wa !== wb) return wa - wb;
          return new Date(a.kickoff_utc).getTime() - new Date(b.kickoff_utc).getTime();
        });
        setMatches(sortedMatches);
        // Default selected date = first match's date or today  
        const firstDate = sortedMatches[0]?.kickoff_utc ? new Date(sortedMatches[0].kickoff_utc) : new Date();
        setSelectedDate(firstDate);
        if (spotlightMatch) setFeaturedMatch(spotlightMatch);
        else {
          const live = sortedMatches.find(m => m.status === 'LIVE');
          const pre = sortedMatches.find(m => m.status === 'PRE');
          const ft = sortedMatches.find(m => m.status === 'FT');
          setFeaturedMatch(live || pre || ft || null);
        }
      } else {
        setMatches([]);
        setFeaturedMatch(null);
      }
    } catch (err) {
      console.error('Error fetching matches:', err);
      setError('Failed to load matches. Please try again.');
      setMatches([]);
      setFeaturedMatch(null);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Date navigation functions removed - now handled by DayNavigationBar

  // League filter
  const filteredMatches = useMemo(() => {
    if (selectedLeague === 'all') return dateFilteredMatches;
    return dateFilteredMatches.filter(m => m.league === selectedLeague);
  }, [dateFilteredMatches, selectedLeague]);

  // Group matches by league for display
  const groupedMatches = useMemo(() => {
    const groups: { [key: string]: Match[] } = {};
    filteredMatches.forEach(match => {
      const league = match.league;
      if (!groups[league]) groups[league] = [];
      groups[league].push(match);
    });
    return Object.entries(groups).map(([league, matches]) => ({ 
      league, 
      matches,
      isCollapsed: hiddenLeagues.has(league)
    }));
  }, [filteredMatches, hiddenLeagues]);

  // Get status display for match
  const getMatchStatus = (match: Match) => {
    if (match.status === 'LIVE') {
      return (
        <div className="text-center">
          <p className="text-xs font-bold text-red-500">LIVE</p>
          <p className="font-bold text-xl text-gray-900 dark:text-white">{match.home_score} - {match.away_score}</p>
          <p className="text-xs font-medium text-gray-500">{match.current_minute || '0'}'</p>
        </div>
      );
    } else if (match.status === 'FT') {
      return (
        <div className="text-center">
          <p className="font-bold text-xl text-gray-900 dark:text-white">{match.home_score} - {match.away_score}</p>
          <p className="text-xs font-medium text-gray-500 mt-1">FT</p>
        </div>
      );
    } else {
      const time = new Date(match.kickoff_utc).toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      });
      return (
        <div className="text-center">
          <p className="font-bold text-xl text-gray-900 dark:text-white">{time}</p>
          <p className="text-xs font-medium text-gray-500 mt-1">Today</p>
        </div>
      );
    }
  };

  return (
    <div className="relative flex size-full min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-20 flex h-16 items-center justify-between whitespace-nowrap border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 sm:px-6 lg:px-8">
        <Link href="/" onClick={handleLogoClick} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="h-8 w-8 text-green-600">
            <div className="w-8 h-8 rounded bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">B</span>
            </div>
          </div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">BetHub</h1>
        </Link>
        <div className="flex items-center gap-4">
          <button 
            onClick={toggleTheme}
            className="flex items-center justify-center rounded-full p-2 text-gray-500 dark:text-gray-400 transition-colors hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
          >
            {theme === 'dark' ? '🌙' : '☀️'}
          </button>
          <div className="flex items-center gap-2">
            <a className="px-4 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white" href="#">Log In</a>
            <a className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700" href="#">Sign Up</a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 bg-gray-50 dark:bg-gray-900 overflow-y-auto">
        <div className="p-4 sm:p-6 lg:p-8">
          {/* Featured Match Banner */}
          {featuredMatch && (
            <div className="relative mb-6">
              <div className="overflow-hidden rounded-xl bg-white dark:bg-gray-800 shadow-lg">
                <BannerCarousel match={featuredMatch} design="diagonal-v2" accentColor="green" ctaLabel="View Full Analysis ✨" homeTeamStats="UNBEATEN IN 5" awayTeamStats="TOP SCORER HAS 7 GOALS" />
              </div>
            </div>
          )}

          {/* Main Layout - Centered */}
          <div className="flex flex-col items-center justify-center my-6 max-w-7xl mx-auto">
            {/* Working Date Navigation */}
            <DayNavigationBar 
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
            />

            {/* League Dock - Horizontal, Centered */}
            <div className="flex justify-center mb-4">
              <nav className="flex space-x-3 items-center">
                <button 
                  onClick={() => setSelectedLeague('all')}
                  className={`league-dock-item ${selectedLeague === 'all' ? 'active' : ''} flex items-center justify-center`}
                >
                  <div className="w-14 h-14 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-4xl text-gray-500 dark:text-gray-400 hover:text-green-600 transition-colors">
                    ⚽
                  </div>
                </button>
                {availableLeagues.filter(l => l.id !== 'all').map(league => (
                  <button
                    key={league.id}
                    onClick={() => setSelectedLeague(league.id)}
                    className={`league-dock-item ${selectedLeague === league.id ? 'active' : ''} flex items-center justify-center`}
                  >
                    <LeagueLogo league={league.id} size={56} logoUrl={league.logoUrl} />
                  </button>
                ))}
              </nav>
            </div>

            {/* Matches - Centered */}
            <div className="max-w-4xl mx-auto space-y-4 w-full">
                {isLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <div key={index} className="animate-pulse">
                        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-32 mb-2"></div>
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 h-20"></div>
                      </div>
                    ))}
                  </div>
                ) : groupedMatches.length > 0 ? (
                  groupedMatches.map(({ league, matches, isCollapsed }) => (
                    <div key={league} className="space-y-3">
                      {/* League Header */}
                      <div 
                        onClick={() => toggleLeagueVisibility(league)}
                        className="flex cursor-pointer items-center justify-between py-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg px-2 -mx-2 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <LeagueLogo league={league} size={24} logoUrl={matches[0]?.league_logo} />
                          <h2 className="text-lg font-bold text-gray-900 dark:text-white">{league}</h2>
                          <span className="text-sm text-gray-500 dark:text-gray-400">({matches.length})</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${isCollapsed ? 'rotate-90' : ''}`} />
                        </div>
                      </div>

                      {/* Matches - Collapsible */}
                      {!isCollapsed && (
                        <div className="space-y-3 pt-2">
                          {matches.map((match) => (
                          <div 
                            key={match.id}
                            onClick={() => handleMatchClick(match.id)}
                            className="relative flex items-center rounded-xl bg-white dark:bg-gray-800 py-3 px-4 shadow-sm transition-all hover:shadow-md cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                          >
                            {/* Star Button */}
                            <div className="absolute top-2 right-2 flex items-center gap-2">
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  toggleFavorite(match.id);
                                }}
                                className="text-gray-400 hover:text-yellow-500 cursor-pointer"
                              >
                                {favoriteMatches.has(match.id) ? (
                                  <Star className="w-5 h-5 fill-yellow-500 text-yellow-500" />
                                ) : (
                                  <StarOff className="w-5 h-5" />
                                )}
                              </button>
                            </div>

                            {/* Match Content */}
                            <div className="flex-1 grid grid-cols-[1fr_auto_1fr] items-center text-center">
                              {/* Home Team */}
                              <div className="flex items-center gap-3 justify-end">
                                <p className="font-semibold text-sm text-gray-900 dark:text-white text-right hidden sm:block">{match.home_team}</p>
                                <TeamLogo team={match.home_team} size={40} logoUrl={match.home_team_logo} />
                              </div>

                              {/* Score/Status */}
                              <div className="text-center mx-4 flex flex-col items-center justify-center">
                                {getMatchStatus(match)}
                              </div>

                              {/* Away Team */}
                              <div className="flex items-center gap-3 justify-start">
                                <TeamLogo team={match.away_team} size={40} logoUrl={match.away_team_logo} />
                                <p className="font-semibold text-sm text-gray-900 dark:text-white text-left hidden sm:block">{match.away_team}</p>
                              </div>
                            </div>
                          </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-16 text-gray-500 dark:text-gray-400">No matches found for the selected date.</div>
                )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}