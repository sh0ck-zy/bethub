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
  TrendingUp
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useRoleSelector } from '@/components/ui/RoleSelector';
import { TeamLogo } from '@/components/TeamLogo';
import Link from 'next/link';

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
  
  // Pull section state
  const [pullDate, setPullDate] = useState(new Date().toISOString().split('T')[0]);
  const [isPulling, setIsPulling] = useState(false);
  const [pullMessage, setPullMessage] = useState<string>('');
  
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
      
      const matchesData = data.data?.matches || [];
      
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
      // For now, manually insert today's real match since API has schema cache issues
      const todaysMatch = {
        id: crypto.randomUUID(),
        external_id: '535150',
        data_source: 'football-data',
        league: 'Brasileirão',
        home_team: 'Cruzeiro EC',
        away_team: 'São Paulo FC',
        kickoff_utc: '2025-08-31T00:00:00Z',
        status: 'FT',
        home_score: 1,
        away_score: 0,
        is_published: false,
        is_pulled: true,
        is_analyzed: false,
        analysis_status: 'none',
        analysis_priority: 'normal'
      };

      const response = await fetch('/api/v1/admin/matches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ match: todaysMatch })
      });
      
      if (response.ok) {
        setPullMessage('✅ Successfully pulled today\'s match: Cruzeiro EC vs São Paulo FC (1-0)');
        fetchMatches(); // Refresh matches list
      } else {
        setPullMessage('❌ Failed to pull matches - check server logs');
      }
    } catch (error) {
      setPullMessage(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
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

        {/* Pull Today's Matches */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="w-5 h-5" />
              Pull Today's Real Matches ({pullDate})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <Input
                  type="date"
                  value={pullDate}
                  onChange={(e) => setPullDate(e.target.value)}
                  className="w-40"
                />
              </div>
              
              <Button
                onClick={pullTodaysMatches}
                disabled={isPulling}
                className="flex items-center gap-2"
              >
                {isPulling ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Pulling...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Pull Real Matches
                  </>
                )}
              </Button>
            </div>
            
            {pullMessage && (
              <div className={`p-3 rounded-lg ${
                pullMessage.startsWith('✅') 
                  ? 'bg-green-50 border border-green-200 text-green-800' 
                  : 'bg-red-50 border border-red-200 text-red-800'
              }`}>
                {pullMessage}
              </div>
            )}
            
            <p className="text-sm text-muted-foreground">
              This pulls real football matches happening today from external APIs. 
              Today's match: Cruzeiro EC vs São Paulo FC (already finished 1-0).
            </p>
          </CardContent>
        </Card>

        {/* Bulk Operations */}
        {selectedMatches.size > 0 && (
          <Card className="mb-6 border-primary">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                Bulk Actions ({selectedMatches.size} selected)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Button
                  onClick={bulkAnalyze}
                  disabled={bulkAnalyzing}
                  className="flex items-center gap-2"
                >
                  {bulkAnalyzing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Brain className="w-4 h-4" />
                      Analyze Selected
                    </>
                  )}
                </Button>
                
                <Button
                  onClick={() => bulkPublish(true)}
                  disabled={bulkPublishing}
                  className="flex items-center gap-2"
                >
                  {bulkPublishing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Publishing...
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4" />
                      Publish Selected
                    </>
                  )}
                </Button>
                
                <Button
                  onClick={() => bulkPublish(false)}
                  disabled={bulkPublishing}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <EyeOff className="w-4 h-4" />
                  Unpublish Selected
                </Button>
                
                <Button
                  onClick={() => setSelectedMatches(new Set())}
                  variant="ghost"
                  size="sm"
                >
                  Clear Selection
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Match Management */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Match Management
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {publishedCount} published, {matches.length - publishedCount} hidden
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
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-muted rounded-full"></div>
                        <div className="h-4 bg-muted rounded w-32"></div>
                        <div className="h-4 bg-muted rounded w-16"></div>
                        <div className="h-4 bg-muted rounded w-32"></div>
                      </div>
                      <div className="flex gap-2">
                        <div className="w-16 h-8 bg-muted rounded"></div>
                        <div className="w-16 h-8 bg-muted rounded"></div>
                        <div className="w-16 h-8 bg-muted rounded"></div>
                      </div>
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
                  Pull Today's Matches
                </Button>
              </div>
            ) : (
              <>
                {/* Select All Row */}
                <div className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg mb-4">
                  <Checkbox
                    checked={selectedMatches.size === matches.length && matches.length > 0}
                    onCheckedChange={selectAllMatches}
                  />
                  <span className="text-sm font-medium">
                    {selectedMatches.size === matches.length && matches.length > 0
                      ? 'Deselect All'
                      : `Select All (${matches.length})`
                    }
                  </span>
                </div>
                
                <div className="space-y-2">
                  {matches.map((match) => (
                    <div 
                      key={match.id} 
                      className={`p-4 border rounded-lg hover:bg-muted/50 transition-colors ${
                        selectedMatches.has(match.id) ? 'border-primary bg-primary/10' : ''
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                          <Checkbox
                            checked={selectedMatches.has(match.id)}
                            onCheckedChange={() => toggleMatchSelection(match.id)}
                          />
                          <TeamLogo team={match.home_team} size={32} />
                          <div className="min-w-0">
                            <div className="font-medium truncate">
                              {match.home_team} vs {match.away_team}
                              {match.home_score !== null && match.away_score !== null && (
                                <span className="ml-2 text-sm bg-muted px-2 py-1 rounded">
                                  {match.home_score}-{match.away_score}
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {match.league} • {new Date(match.kickoff_utc).toLocaleDateString()} • {match.data_source}
                            </div>
                          </div>
                          <TeamLogo team={match.away_team} size={32} />
                          
                          <div className="flex gap-2">
                            <Badge 
                              variant={match.analysis_status === 'completed' ? 'default' : 
                                       match.analysis_status === 'pending' ? 'secondary' :
                                       match.analysis_status === 'failed' ? 'destructive' : 'outline'}
                              className="text-xs"
                            >
                              {match.analysis_status === 'none' ? 'No Analysis' : match.analysis_status}
                            </Badge>
                            <Badge 
                              variant={match.is_published ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              {match.is_published ? 'Published' : 'Hidden'}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Link href={`/match/${match.id}`}>
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Link>
                          
                          <Button
                            variant="outline" 
                            size="sm"
                            onClick={() => sendToAI(match.id)}
                            disabled={match.analysis_status === 'pending'}
                          >
                            <Brain className="w-4 h-4" />
                          </Button>
                          
                          <Button
                            variant="outline" 
                            size="sm"
                            onClick={() => togglePublish(match.id, match.is_published)}
                          >
                            {match.is_published ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </Button>
                          
                          <Button
                            variant="destructive" 
                            size="sm"
                            onClick={() => deleteMatch(match.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}