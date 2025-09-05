'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Shield, 
  Eye, 
  EyeOff, 
  Trash2,
  AlertTriangle,
  RefreshCw,
  Download,
  Brain,
  Database,
  Clock,
  Calendar,
  CheckCircle2,
  TrendingUp,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useRoleSelector } from '@/components/ui/RoleSelector';
import { TeamLogo } from '@/components/TeamLogo';
import { AdvancedAPIRequestBuilder } from '@/components/admin/AdvancedAPIRequestBuilder';
import Link from 'next/link';

// Day Navigation Bar Component
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
      <Button
        variant="ghost"
        size="sm"
        onClick={goToPreviousDay}
        className="h-8 w-8 p-0"
      >
        <ChevronLeft className="w-4 h-4" />
      </Button>

      {/* Day Navigation Pills */}
      <div className="flex items-center gap-1">
        {visibleDays.map((day, index) => {
          const isSelected = day.toDateString() === selectedDate.toDateString();
          const isToday = day.toDateString() === today.toDateString();
          
          return (
            <Button
              key={day.toISOString()}
              variant={isSelected ? "default" : "ghost"}
              size="sm"
              className={`h-8 px-3 text-xs ${
                isSelected ? 'bg-primary text-primary-foreground' :
                'hover:bg-muted'
              } ${isToday && !isSelected ? 'font-semibold text-blue-600' : ''}`}
              onClick={() => {
                if (isSelected) {
                  setShowDatePicker(true);
                } else {
                  onDateChange(day);
                }
              }}
            >
              {formatDayLabel(day)}
            </Button>
          );
        })}
      </div>

      {/* Next Day Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={goToNextDay}
        className="h-8 w-8 p-0"
      >
        <ChevronRight className="w-4 h-4" />
      </Button>

      {/* Date Picker Modal */}
      {showDatePicker && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold mb-4">Select Date</h3>
            <Input
              type="date"
              value={selectedDate.toISOString().split('T')[0]}
              onChange={(e) => {
                const newDate = new Date(e.target.value + 'T12:00:00');
                onDateChange(newDate);
                setShowDatePicker(false);
              }}
              className="mb-4"
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

// Hierarchical Match View Component
function HierarchicalMatchView({ matches, selectedMatches, toggleMatchSelection, sendToAI, togglePublish, deleteMatch, selectedDate }: {
  matches: AdminMatch[],
  selectedMatches: Set<string>,
  toggleMatchSelection: (id: string) => void,
  sendToAI: (id: string) => void,
  togglePublish: (id: string, currentlyPublished: boolean) => void,
  deleteMatch: (id: string) => void,
  selectedDate: Date
}) {
  // State for collapsed leagues
  const [collapsedLeagues, setCollapsedLeagues] = useState<Set<string>>(new Set());

  const toggleLeague = (league: string) => {
    const newCollapsed = new Set(collapsedLeagues);
    if (newCollapsed.has(league)) {
      newCollapsed.delete(league);
    } else {
      newCollapsed.add(league);
    }
    setCollapsedLeagues(newCollapsed);
  };
  // Filter matches for the selected day only
  const selectedDayKey = selectedDate.toISOString().split('T')[0];
  const dayMatches = matches.filter(match => {
    const matchDate = new Date(match.kickoff_utc).toISOString().split('T')[0];
    return matchDate === selectedDayKey;
  });

  // Group matches by sport and league
  const groupMatchesBySportLeague = (dayMatches: AdminMatch[]) => {
    const sports: { [sport: string]: { [league: string]: AdminMatch[] } } = {};
    dayMatches.forEach(match => {
      const sport = 'Football'; // For now all matches are football
      const league = match.league;
      
      if (!sports[sport]) sports[sport] = {};
      if (!sports[sport][league]) sports[sport][league] = [];
      
      sports[sport][league].push(match);
    });
    return sports;
  };

  if (dayMatches.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Matches Found</h3>
        <p className="text-muted-foreground mb-4">
          No matches scheduled for this date.
        </p>
      </div>
    );
  }

  const sportLeagueGroups = groupMatchesBySportLeague(dayMatches);

  return (
    <div className="space-y-6">
      {/* Sport and League Hierarchy */}
      {Object.entries(sportLeagueGroups).map(([sport, leagues]) => (
        <div key={sport} className="space-y-4">
          {/* Sport Header */}
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            ⚽ {sport}
          </div>

          {/* Leagues within Sport */}
          {Object.entries(leagues).map(([league, leagueMatches]) => {
            const isCollapsed = collapsedLeagues.has(league);
            
            return (
              <div key={league} className="ml-4 space-y-3">
                {/* Clickable League Header */}
                <div 
                  className="flex items-center gap-2 text-sm font-medium cursor-pointer hover:bg-muted/50 p-2 rounded-lg transition-colors"
                  onClick={() => toggleLeague(league)}
                >
                  <ChevronDown className={`w-3 h-3 transition-transform ${isCollapsed ? '-rotate-90' : ''}`} />
                  🏆 {league}
                  <Badge variant="outline" className="text-xs">
                    {leagueMatches.length} matches
                  </Badge>
                </div>

                {/* Collapsible Matches in League */}
                {!isCollapsed && (
                  <div className="ml-4 space-y-2">
                    {leagueMatches.map((match) => (
                  <div
                    key={match.id}
                    className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                      selectedMatches.has(match.id) 
                        ? 'bg-primary/5 border-primary' 
                        : 'hover:bg-muted/50'
                    }`}
                  >
                    {/* Match Info */}
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={selectedMatches.has(match.id)}
                        onCheckedChange={() => toggleMatchSelection(match.id)}
                      />
                      
                      <div className="flex items-center gap-3">
                        <TeamLogo team={match.home_team} size={24} />
                        <div className="min-w-0">
                          <div className="font-medium text-sm truncate">
                            {match.home_team} vs {match.away_team}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(match.kickoff_utc).toLocaleTimeString('en-US', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                            {match.home_score !== null && match.away_score !== null && (
                              <span className="ml-2 font-semibold">
                                {match.home_score}-{match.away_score}
                              </span>
                            )}
                          </div>
                        </div>
                        <TeamLogo team={match.away_team} size={24} />
                      </div>
                    </div>

                    {/* Status and Actions */}
                    <div className="flex items-center gap-2">
                      {/* Analysis Status */}
                      <div className="flex items-center gap-1">
                        {match.analysis_status === 'completed' ? (
                          <Badge variant="default" className="text-xs">Analyzed</Badge>
                        ) : match.analysis_status === 'pending' ? (
                          <Badge variant="secondary" className="text-xs">Analyzing...</Badge>
                        ) : (
                          <Button
                            onClick={() => sendToAI(match.id)}
                            variant="outline"
                            size="sm"
                            className="text-xs h-6"
                          >
                            <Brain className="w-3 h-3 mr-1" />
                            Analyze
                          </Button>
                        )}
                      </div>

                      {/* Publish Status */}
                      <Button
                        onClick={() => togglePublish(match.id, match.is_published)}
                        variant={match.is_published ? "default" : "outline"}
                        size="sm"
                        className="text-xs h-6"
                      >
                        {match.is_published ? (
                          <>
                            <EyeOff className="w-3 h-3 mr-1" />
                            Hide
                          </>
                        ) : (
                          <>
                            <Eye className="w-3 h-3 mr-1" />
                            Publish
                          </>
                        )}
                      </Button>

                      {/* Delete */}
                      <Button
                        onClick={() => deleteMatch(match.id)}
                        variant="ghost"
                        size="sm"
                        className="text-xs h-6 hover:bg-destructive/10"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

interface AdminMatch {
  id: string;
  league: string;
  home_team: string;
  away_team: string;
  kickoff_utc: string;
  status: string;
  is_published: boolean;
  is_pulled: boolean;
  is_analyzed: boolean;
  analysis_status: 'none' | 'pending' | 'completed' | 'failed';
  analysis_priority: string;
  data_source: string;
  external_id: string | null;
  home_score: number | null;
  away_score: number | null;
  created_at: string;
}

export default function AdminPage() {
  const { user, isAdmin: realIsAdmin } = useAuth();
  const { isAdmin: demoIsAdmin } = useRoleSelector();
  const [matches, setMatches] = useState<AdminMatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // API pull state
  const [isPulling, setIsPulling] = useState(false);
  const [pullMessage, setPullMessage] = useState<string>('');
  
  // Day navigation state
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  // Bulk operations state
  const [selectedMatches, setSelectedMatches] = useState<Set<string>>(new Set());
  const [bulkAnalyzing, setBulkAnalyzing] = useState(false);
  const [bulkPublishing, setBulkPublishing] = useState(false);
  
  // Auth modal state
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Combined admin check (real auth OR demo role)
  const isAdmin = realIsAdmin || demoIsAdmin;

  // Redirect non-admin users
  useEffect(() => {
    if (user && !realIsAdmin && !demoIsAdmin) {
      window.location.href = '/';
    }
  }, [realIsAdmin, demoIsAdmin, user]);

  const fetchMatches = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/v1/admin/matches');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Admin API response:', data);
      
      const matchesData = data.matches || [];
      
      if (Array.isArray(matchesData)) {
        setMatches(matchesData);
        console.log(`Admin: Loaded ${matchesData.length} matches`);
      } else {
        setError('Invalid data format received');
      }
    } catch (error) {
      console.error('Error fetching matches:', error);
      setError('Failed to load matches');
    } finally {
      setIsLoading(false);
    }
  };

  const pullTodaysMatches = async () => {
    setIsPulling(true);
    setPullMessage('');
    
    try {
      const response = await fetch('/api/v1/admin/fetch-current-matches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        const data = await response.json();
        setPullMessage(`✅ Successfully pulled ${data.data?.matches_upserted || 0} matches from Football API`);
        fetchMatches(); // Refresh matches list
      } else {
        const errorData = await response.json();
        setPullMessage(`❌ API Error: ${errorData.error || 'Failed to pull matches'}`);
      }
    } catch (error) {
      console.error('Error pulling matches:', error);
      setPullMessage(`❌ Error: ${error instanceof Error ? error.message : 'Network error'}`);
    } finally {
      setIsPulling(false);
    }
  };

  const toggleMatchSelection = (matchId: string) => {
    const newSelection = new Set(selectedMatches);
    if (newSelection.has(matchId)) {
      newSelection.delete(matchId);
    } else {
      newSelection.add(matchId);
    }
    setSelectedMatches(newSelection);
  };

  const selectAllMatches = () => {
    if (selectedMatches.size === matches.length) {
      setSelectedMatches(new Set()); // Deselect all
    } else {
      setSelectedMatches(new Set(matches.map(m => m.id))); // Select all
    }
  };

  const bulkAnalyze = async () => {
    if (selectedMatches.size === 0) return;
    setBulkAnalyzing(true);
    
    try {
      // For each selected match, trigger analysis
      for (const matchId of selectedMatches) {
        await fetch(`/api/v1/admin/matches/${matchId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'send_to_ai' })
        });
      }
      
      setSelectedMatches(new Set()); // Clear selection
      fetchMatches(); // Refresh
    } catch (error) {
      console.error('Error analyzing matches:', error);
    } finally {
      setBulkAnalyzing(false);
    }
  };

  const bulkPublish = async (shouldPublish: boolean) => {
    if (selectedMatches.size === 0) return;
    setBulkPublishing(true);
    
    try {
      // For each selected match, toggle publish status
      for (const matchId of selectedMatches) {
        await fetch(`/api/v1/admin/matches/${matchId}/toggle-publish`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isPublished: shouldPublish })
        });
      }
      
      setSelectedMatches(new Set()); // Clear selection
      fetchMatches(); // Refresh
    } catch (error) {
      console.error('Error publishing matches:', error);
    } finally {
      setBulkPublishing(false);
    }
  };

  const deleteMatch = async (matchId: string) => {
    if (!confirm('Are you sure you want to permanently delete this match?')) {
      return;
    }

    try {
      const response = await fetch(`/api/v1/admin/matches/${matchId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchMatches(); // Refresh the list
      }
    } catch (error) {
      console.error('Error deleting match:', error);
    }
  };

  const sendToAI = async (matchId: string) => {
    try {
      const response = await fetch(`/api/v1/admin/matches/${matchId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send_to_ai' })
      });

      if (response.ok) {
        setTimeout(() => {
          fetchMatches();
        }, 1000);
      }
    } catch (error) {
      console.error('Error sending match to AI:', error);
    }
  };

  const togglePublish = async (matchId: string, currentlyPublished: boolean) => {
    try {
      const response = await fetch(`/api/v1/admin/matches/${matchId}/toggle-publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublished: !currentlyPublished })
      });

      if (response.ok) {
        fetchMatches(); // Refresh the list
      }
    } catch (error) {
      console.error('Error toggling publish status:', error);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchMatches();
    }
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="p-6 text-center">
            <Shield className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p className="text-muted-foreground mb-4">Admin privileges required</p>
            <Link href="/">
              <Button>Return Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const publishedCount = matches.filter(m => m.is_published).length;
  const analyzedCount = matches.filter(m => m.analysis_status === 'completed').length;
  const pendingCount = matches.filter(m => m.analysis_status === 'pending').length;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header 
        onLoginClick={() => setShowAuthModal(true)}
        showAuthModal={showAuthModal}
        setShowAuthModal={setShowAuthModal}
        currentPage="admin"
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">BetHub Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Pull real matches → Analyze with AI → Publish to homepage
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Database className="h-8 w-8 text-blue-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Total Matches</p>
                  <p className="text-2xl font-bold">{matches.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Brain className="h-8 w-8 text-purple-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Analyzed</p>
                  <p className="text-2xl font-bold">{analyzedCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-orange-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold">{pendingCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Eye className="h-8 w-8 text-green-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Published</p>
                  <p className="text-2xl font-bold">{publishedCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Advanced API Request Builder */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="w-5 h-5" />
              Advanced API Explorer
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Developer-focused Football-Data.org API explorer with full request visibility and multi-endpoint support
            </p>
          </CardHeader>
          <CardContent>
            <AdvancedAPIRequestBuilder />
          </CardContent>
        </Card>

        {/* Legacy Quick Pull (keeping for now) */}
        <Card className="mb-8 border-orange-200 bg-orange-50/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-orange-600" />
              Quick Pull (Legacy)
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Simple one-click pull for current matches - use Advanced API Explorer above for full control
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={pullTodaysMatches}
              disabled={isPulling}
              className="w-full flex items-center justify-center gap-2"
              variant="outline"
            >
              {isPulling ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Fetching Current Season Matches...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Quick Pull: Current Season Matches
                </>
              )}
            </Button>
            
            {pullMessage && (
              <div className={`p-3 rounded-lg text-sm ${
                pullMessage.startsWith('✅') 
                  ? 'bg-green-50 border border-green-200 text-green-800' 
                  : 'bg-red-50 border border-red-200 text-red-800'
              }`}>
                {pullMessage}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div></div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Quick Actions
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Common administrative tasks
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <Button
                  onClick={async () => {
                    try {
                      const response = await fetch('/api/v1/admin/publish-all', { method: 'POST' });
                      const result = await response.json();
                      fetchMatches();
                    } catch (error) {
                      console.error('Error publishing all:', error);
                    }
                  }}
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Publish All Matches
                </Button>
                
                <Button
                  onClick={async () => {
                    if (confirm('Clear all fake demo data?')) {
                      try {
                        const response = await fetch('/api/v1/admin/clear-fake-data', { method: 'POST' });
                        const result = await response.json();
                        fetchMatches();
                      } catch (error) {
                        console.error('Error clearing fake data:', error);
                      }
                    }
                  }}
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear Demo Data
                </Button>

                <Button
                  onClick={async () => {
                    if (confirm('Unpublish ALL matches from homepage? (keeps matches in database)')) {
                      try {
                        // Unpublish all matches
                        const response = await fetch('/api/v1/admin/matches', { 
                          method: 'PATCH',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ action: 'unpublish_all' })
                        });
                        if (response.ok) {
                          fetchMatches();
                        }
                      } catch (error) {
                        console.error('Error unpublishing all matches:', error);
                      }
                    }
                  }}
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                >
                  <EyeOff className="w-4 h-4 mr-2" />
                  Unpublish All Matches
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Bulk Operations */}
        {selectedMatches.size > 0 && (
          <Card className="mb-6 border-primary bg-primary/5">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  Bulk Actions ({selectedMatches.size} of {matches.length} selected)
                </CardTitle>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    Quick select:
                  </span>
                  <Button
                    onClick={() => {
                      const unpublished = matches.filter(m => !m.is_published);
                      setSelectedMatches(new Set(unpublished.map(m => m.id)));
                    }}
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs"
                  >
                    Draft matches
                  </Button>
                  <Button
                    onClick={() => {
                      const unanalyzed = matches.filter(m => m.analysis_status === 'none');
                      setSelectedMatches(new Set(unanalyzed.map(m => m.id)));
                    }}
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs"
                  >
                    Unanalyzed
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Primary Actions */}
                <div className="flex items-center gap-3">
                  <Button
                    onClick={bulkAnalyze}
                    disabled={bulkAnalyzing}
                    className="flex items-center gap-2"
                    size="sm"
                  >
                    {bulkAnalyzing ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Analyzing {selectedMatches.size} matches...
                      </>
                    ) : (
                      <>
                        <Brain className="w-4 h-4" />
                        Send to AI ({selectedMatches.size})
                      </>
                    )}
                  </Button>
                  
                  <Button
                    onClick={() => bulkPublish(true)}
                    disabled={bulkPublishing}
                    className="flex items-center gap-2"
                    size="sm"
                  >
                    {bulkPublishing ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Publishing...
                      </>
                    ) : (
                      <>
                        <Eye className="w-4 h-4" />
                        Publish ({selectedMatches.size})
                      </>
                    )}
                  </Button>
                  
                  <Button
                    onClick={() => bulkPublish(false)}
                    disabled={bulkPublishing}
                    variant="outline"
                    className="flex items-center gap-2"
                    size="sm"
                  >
                    <EyeOff className="w-4 h-4" />
                    Hide ({selectedMatches.size})
                  </Button>
                </div>

                {/* Secondary Actions */}
                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => setSelectedMatches(new Set())}
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="w-3 h-3 mr-1" />
                      Clear Selection
                    </Button>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Selected: {Array.from(selectedMatches).map(id => 
                      matches.find(m => m.id === id)?.home_team + ' vs ' + matches.find(m => m.id === id)?.away_team
                    ).slice(0, 2).join(', ')}{selectedMatches.size > 2 ? ` +${selectedMatches.size - 2} more` : ''}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Day-based Hierarchical Match Management */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Match Schedule
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {publishedCount} published, {matches.length - publishedCount} draft
              </p>
            </div>
            <Button 
              onClick={fetchMatches}
              variant="outline"
              size="sm"
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </CardHeader>
          
          <CardContent>
            {error && (
              <div className="flex items-center gap-2 p-4 mb-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                <AlertTriangle className="w-4 h-4 text-destructive" />
                <span className="text-destructive">{error}</span>
              </div>
            )}

            {isLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="p-4 border rounded-lg animate-pulse">
                    <div className="h-4 bg-muted rounded w-48 mb-4"></div>
                    <div className="space-y-2">
                      <div className="h-3 bg-muted rounded w-32"></div>
                      <div className="h-3 bg-muted rounded w-full"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : matches.length === 0 ? (
              <div className="text-center py-12">
                <Database className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Matches Found</h3>
                <p className="text-muted-foreground mb-4">
                  Pull some matches from the section above to get started.
                </p>
                <Button onClick={pullTodaysMatches} disabled={isPulling}>
                  <Download className="w-4 h-4 mr-2" />
                  Pull Today&apos;s Matches
                </Button>
              </div>
            ) : (
              <>
                {/* Day Navigation Bar */}
                <DayNavigationBar 
                  selectedDate={selectedDate}
                  onDateChange={setSelectedDate}
                />
                
                {/* Hierarchical Match View */}
                <HierarchicalMatchView 
                  matches={matches}
                  selectedMatches={selectedMatches}
                  toggleMatchSelection={toggleMatchSelection}
                  sendToAI={sendToAI}
                  togglePublish={togglePublish}
                  deleteMatch={deleteMatch}
                  selectedDate={selectedDate}
                />
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}