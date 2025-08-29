'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  Eye, 
  EyeOff, 
  Trash2,
  AlertTriangle,
  RefreshCw,
  Play,
  Pause,
  Activity,
  Brain,
  Database,
  Clock
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useRoleSelector } from '@/components/ui/RoleSelector';
import { TeamLogo } from '@/components/TeamLogo';
import Link from 'next/link';

interface PublishedMatch {
  id: string;
  league: string;
  home_team: string;
  away_team: string;
  kickoff_utc: string;
  status: string;
  is_published: boolean;
  analysis_status: 'none' | 'pending' | 'completed' | 'failed';
  created_at: string;
}

export default function AdminPage() {
  const { user, isAdmin: realIsAdmin } = useAuth();
  const { isAdmin: demoIsAdmin } = useRoleSelector();
  const [publishedMatches, setPublishedMatches] = useState<PublishedMatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pipelineStats, setPipelineStats] = useState<any>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  // Combined admin check (real auth OR demo role)
  const isAdmin = realIsAdmin || demoIsAdmin;

  // Redirect non-admin users (only if we have a real user but they're not admin)
  useEffect(() => {
    if (user && !realIsAdmin && !demoIsAdmin) {
      window.location.href = '/';
    }
  }, [realIsAdmin, demoIsAdmin, user]);

  const fetchPublishedMatches = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/v1/admin/matches');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      const matches = data.matches || data;
      
      if (Array.isArray(matches)) {
        // Show all matches in admin with status indicators
        setPublishedMatches(matches);
      }
    } catch (error) {
      console.error('Error fetching matches:', error);
      setError('Failed to load matches');
    } finally {
      setIsLoading(false);
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
        fetchPublishedMatches(); // Refresh the list
      }
    } catch (error) {
      console.error('Error toggling publish status:', error);
    }
  };

  const deleteMatch = async (matchId: string) => {
    if (!confirm('Are you sure you want to permanently delete this match and its analysis?')) {
      return;
    }

    try {
      const response = await fetch(`/api/v1/admin/matches/${matchId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchPublishedMatches(); // Refresh the list
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
        // Refresh the list after a short delay to show updated status
        setTimeout(() => {
          fetchPublishedMatches();
        }, 1000);
      }
    } catch (error) {
      console.error('Error sending match to AI:', error);
    }
  };

  const viewAnalysis = async (matchId: string) => {
    try {
      const response = await fetch(`/api/v1/admin/analysis/${matchId}`);
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          alert(`Analysis Summary: ${result.data.analysis.summary}`);
        }
      }
    } catch (error) {
      console.error('Error viewing analysis:', error);
    }
  };

  const fetchPipelineStats = async () => {
    try {
      const response = await fetch('/api/v1/admin/autonomous-sync');
      if (response.ok) {
        const data = await response.json();
        setPipelineStats(data);
      }
    } catch (error) {
      console.error('Error fetching pipeline stats:', error);
    }
  };

  const triggerManualSync = async () => {
    setIsSyncing(true);
    setSyncError(null);
    
    try {
      const response = await fetch('/api/v1/admin/autonomous-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const result = await response.json();
      
      if (response.ok) {
        setPipelineStats(prev => ({
          ...prev,
          stats: {
            ...prev?.stats,
            total_matches: (prev?.stats?.total_matches || 0) + (result.stats?.new || 0)
          },
          last_sync: new Date().toISOString()
        }));
        fetchPublishedMatches(); // Refresh matches list
      } else {
        setSyncError(result.error || 'Sync failed');
      }
    } catch (error) {
      setSyncError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchPublishedMatches();
      fetchPipelineStats();
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

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor and manage autonomous pipeline content
          </p>
        </div>

        {/* Autonomous Pipeline Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Pipeline Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {pipelineStats ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-muted/30 rounded-lg">
                      <Database className="w-8 h-8 mx-auto text-blue-500 mb-2" />
                      <div className="text-2xl font-bold">{pipelineStats.stats?.total_matches || 0}</div>
                      <div className="text-xs text-muted-foreground">Total Matches</div>
                    </div>
                    <div className="text-center p-3 bg-muted/30 rounded-lg">
                      <Brain className="w-8 h-8 mx-auto text-purple-500 mb-2" />
                      <div className="text-2xl font-bold">{pipelineStats.stats?.pending_analysis || 0}</div>
                      <div className="text-xs text-muted-foreground">Pending Analysis</div>
                    </div>
                  </div>
                  <div className="text-center p-3 bg-muted/30 rounded-lg">
                    <Shield className="w-8 h-8 mx-auto text-green-500 mb-2" />
                    <div className="text-2xl font-bold">{pipelineStats.stats?.published_matches || 0}</div>
                    <div className="text-xs text-muted-foreground">Published Matches</div>
                  </div>
                  {pipelineStats.last_sync && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      Last sync: {new Date(pipelineStats.last_sync).toLocaleString()}
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-4">
                  <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
                  <div className="text-sm text-muted-foreground">Loading stats...</div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5" />
                Pipeline Controls
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {syncError && (
                <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <AlertTriangle className="w-4 h-4 text-destructive" />
                  <span className="text-destructive text-sm">{syncError}</span>
                </div>
              )}
              
              <Button
                onClick={triggerManualSync}
                disabled={isSyncing}
                className="w-full"
                size="lg"
              >
                {isSyncing ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Syncing...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Run Manual Sync
                  </>
                )}
              </Button>
              
              <div className="text-xs text-muted-foreground space-y-1">
                <p>• Fetches latest matches from external APIs</p>
                <p>• Auto-triggers AI analysis for high-profile matches</p>
                <p>• Updates match status and scores</p>
              </div>
              
              <Button
                onClick={fetchPipelineStats}
                variant="outline"
                size="sm"
                className="w-full"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh Stats
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Content Management
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {publishedMatches.filter(m => m.is_published).length} published, {publishedMatches.filter(m => !m.is_published).length} hidden
              </p>
            </div>
            <Button 
              onClick={fetchPublishedMatches}
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
            ) : publishedMatches.length === 0 ? (
              <div className="text-center py-12">
                <Shield className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Content</h3>
                <p className="text-muted-foreground">
                  The autonomous pipeline hasn&apos;t created any matches yet.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {publishedMatches.map((match) => (
                  <div 
                    key={match.id} 
                    className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-4">
                        <TeamLogo team={match.home_team} size={32} logoUrl={match.home_team_logo} />
                        <div className="min-w-0">
                          <div className="font-medium truncate">
                            {match.home_team} vs {match.away_team}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {match.league} • {new Date(match.kickoff_utc).toLocaleDateString()}
                          </div>
                        </div>
                        <TeamLogo team={match.away_team} size={32} logoUrl={match.away_team_logo} />
                        
                        <div className="flex gap-2">
                          <Badge 
                            variant={match.is_published ? 'default' : 'secondary'}
                          >
                            {match.is_published ? 'Published' : 'Hidden'}
                          </Badge>
                          <Badge 
                            variant={match.analysis_status === 'completed' ? 'default' : 'secondary'}
                          >
                            {match.analysis_status}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Link href={`/match/${match.id}`}>
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                        </Link>
                        
                        <Button
                          variant="outline" 
                          size="sm"
                          onClick={() => sendToAI(match.id)}
                          disabled={match.analysis_status === 'pending'}
                        >
                          <Brain className="w-4 h-4 mr-1" />
                          {match.analysis_status === 'pending' ? 'Analyzing...' : 'Send to AI'}
                        </Button>
                        
                        <Button
                          variant="outline" 
                          size="sm"
                          onClick={() => togglePublish(match.id, match.is_published)}
                        >
                          {match.is_published ? (
                            <>
                              <EyeOff className="w-4 h-4 mr-1" />
                              Hide
                            </>
                          ) : (
                            <>
                              <Eye className="w-4 h-4 mr-1" />
                              Show
                            </>
                          )}
                        </Button>
                        
                        <Button
                          variant="destructive" 
                          size="sm"
                          onClick={() => deleteMatch(match.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}