// src/app/admin/page.tsx - Enhanced Admin Panel with Real Match Sync
'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  RefreshCw, 
  Send, 
  Eye, 
  EyeOff, 
  Clock,
  Trophy,
  Download,
  Calendar,
  CheckCircle,
  AlertCircle,
  Loader2,
  Edit,
  Trash2,
  Save,
  X,
  Play,
  Pause,
  Brain,
  Plus,
  Filter,
  Search
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useRoleSelector } from '@/components/ui/RoleSelector';
import { adminApiGet, adminApiPost, adminApiPut, adminApiDelete } from '@/lib/admin-api';
import { useRouter } from 'next/navigation';
import AdminDashboardTabs from '@/components/admin/AdminDashboardTabs';

// Admin interface types
interface AdminMatch {
  id: string;
  league: string;
  home_team: string;
  away_team: string;
  kickoff_utc: string;
  status: string;
  is_published: boolean;
  analysis_status: 'none' | 'pending' | 'completed';
  created_at: string;
  updated_at?: string;
}

// Future Match interface (from real data)
interface FutureMatch {
  id: string;
  league: string;
  home_team: string;
  away_team: string;
  kickoff_utc: string;
  status: 'PRE';
  submitted_for_analysis?: boolean;
}

// Real Match Sync Panel Component
function RealMatchSyncPanel() {
  const [isLoading, setIsLoading] = useState(false);
  const [syncStats, setSyncStats] = useState<any>(null);
  const [syncResults, setSyncResults] = useState<string | null>(null);

  // Quick sync options for getting real matches immediately
  const quickSyncOptions = [
    {
      label: 'Euro 2024 Final',
      date: '2024-07-14',
      description: 'Spain vs England - Epic final!'
    },
    {
      label: 'Premier League Final Day', 
      date: '2024-05-19',
      description: 'Title deciding matches'
    },
    {
      label: 'Champions League Final',
      date: '2024-06-01',
      description: 'Real Madrid vs Dortmund'
    },
    {
      label: 'La Liga Finale',
      date: '2024-05-25',
      description: 'Season finale drama'
    }
  ];

  // Fetch current sync status
  const fetchSyncStatus = async () => {
    try {
      const response = await adminApiGet('/api/v1/admin/sync-data');
      
      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Non-JSON response received:', await response.text());
        return;
      }
      
      const data = await response.json();
      if (data.success) {
        setSyncStats(data.data);
      } else {
        console.error('Sync status error:', data.message);
      }
    } catch (error) {
      console.error('Error fetching sync status:', error);
    }
  };

  // Sync matches for a specific date
  const syncMatchesForDate = async (date: string, description: string) => {
    setIsLoading(true);
    setSyncResults(null);
    
    try {
      const response = await adminApiPost('/api/v1/admin/sync-data', {
        action: 'sync_date',
        date: date
      });

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const errorText = await response.text();
        console.error('Non-JSON response received:', errorText);
        setSyncResults(`❌ Error: Server returned invalid response format`);
        return;
      }
      
      const data = await response.json();
      
      if (data.success) {
        setSyncResults(`✅ Success: ${data.data.matchesAdded} matches added from ${description}`);
        await fetchSyncStatus(); // Refresh stats
      } else {
        setSyncResults(`❌ Error: ${data.message || 'Sync failed'}`);
      }
    } catch (error) {
      console.error('Sync error:', error);
      setSyncResults(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Load sync status on component mount
  useEffect(() => {
    // Add a small delay to ensure component is fully mounted
    const timer = setTimeout(() => {
      fetchSyncStatus();
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-6">
      {/* Sync Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Trophy className="w-5 h-5" />
            <span>Real Match Data Status</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{syncStats?.totalMatches || 0}</p>
              <p className="text-sm text-blue-700">Total Matches</p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{syncStats?.completedMatches || 0}</p>
              <p className="text-sm text-green-700">Completed</p>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <p className="text-2xl font-bold text-orange-600">{syncStats?.liveMatches || 0}</p>
              <p className="text-sm text-orange-700">Live</p>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">{syncStats?.upcomingMatches || 0}</p>
              <p className="text-sm text-purple-700">Upcoming</p>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${syncStats?.api_configured ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm">
                Football-Data.org API: {syncStats?.api_configured ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            <Button variant="outline" size="sm" onClick={fetchSyncStatus}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Sync for Exciting Matches */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Download className="w-5 h-5" />
            <span>🏆 Get Exciting Real Matches</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {quickSyncOptions.map((option) => (
              <div key={option.label} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">{option.label}</h4>
                  <Badge variant="outline">{option.date}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{option.description}</p>
                <Button
                  size="sm"
                  onClick={() => syncMatchesForDate(option.date, option.label)}
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Trophy className="w-4 h-4 mr-2" />
                  )}
                  Sync These Matches
                </Button>
              </div>
            ))}
          </div>

          {/* Sync Results */}
          {syncResults && (
            <div className={`p-4 rounded-lg flex items-center space-x-2 ${
              syncResults.startsWith('✅') 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              {syncResults.startsWith('✅') ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600" />
              )}
              <span className={syncResults.startsWith('✅') ? 'text-green-700' : 'text-red-700'}>
                {syncResults}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Usage Tips */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <h4 className="font-semibold text-blue-900 mb-2">💡 Quick Tips</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• <strong>Start with Euro 2024 Final</strong> - guaranteed exciting match data</li>
            <li>• <strong>Premier League Final Day</strong> - multiple thrilling matches</li>
            <li>• <strong>Check your homepage</strong> after syncing to see real matches</li>
            <li>• <strong>Your AI analysis</strong> will work with these real team names and data</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

// Future Matches Panel Component - NEW!
function FutureMatchesPanel() {
  const [futureMatches, setFutureMatches] = useState<FutureMatch[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLeague, setSelectedLeague] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [submittingMatches, setSubmittingMatches] = useState<Set<string>>(new Set());

  // Fetch future matches from real data
  const fetchFutureMatches = async () => {
    setIsLoading(true);
    try {
      const response = await adminApiGet('/api/v1/admin/real-matches?days=30');
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setFutureMatches(data.data || []);
        }
      }
    } catch (error) {
      console.error('Error fetching future matches:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Submit match for analysis
  const submitForAnalysis = async (match: FutureMatch) => {
    setSubmittingMatches(prev => new Set(prev).add(match.id));
    
    try {
      const response = await adminApiPost('/api/v1/admin/submit-for-analysis', {
        matchId: match.id,
        league: match.league,
        homeTeam: match.home_team,
        awayTeam: match.away_team,
        kickoffUtc: match.kickoff_utc
      });

      if (response.ok) {
        // Update local state to show as submitted
        setFutureMatches(prev => 
          prev.map(m => 
            m.id === match.id 
              ? { ...m, submitted_for_analysis: true }
              : m
          )
        );
      }
    } catch (error) {
      console.error('Error submitting for analysis:', error);
    } finally {
      setSubmittingMatches(prev => {
        const newSet = new Set(prev);
        newSet.delete(match.id);
        return newSet;
      });
    }
  };

  // Filter matches
  const filteredMatches = futureMatches.filter(match => {
    const matchesLeague = selectedLeague === 'all' || match.league === selectedLeague;
    const matchesSearch = searchTerm === '' || 
      match.home_team.toLowerCase().includes(searchTerm.toLowerCase()) ||
      match.away_team.toLowerCase().includes(searchTerm.toLowerCase()) ||
      match.league.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesLeague && matchesSearch;
  });

  // Get unique leagues
  const leagues = ['all', ...Array.from(new Set(futureMatches.map(m => m.league)))];

  // Load future matches on component mount
  useEffect(() => {
    fetchFutureMatches();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header with stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center space-x-2">
              <Calendar className="w-5 h-5" />
              <span>Future Matches</span>
            </span>
            <div className="flex items-center space-x-4">
              <Badge variant="outline">
                {futureMatches.length} Total
              </Badge>
              <Badge variant="outline">
                {futureMatches.filter(m => m.submitted_for_analysis).length} Submitted
              </Badge>
              <Button onClick={fetchFutureMatches} variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search teams or leagues..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg"
                />
              </div>
            </div>
            <div className="sm:w-48">
              <select
                value={selectedLeague}
                onChange={(e) => setSelectedLeague(e.target.value)}
                className="w-full p-2 border rounded-lg"
              >
                {leagues.map(league => (
                  <option key={league} value={league}>
                    {league === 'all' ? 'All Leagues' : league}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Matches List */}
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              <span>Loading future matches...</span>
            </div>
          ) : filteredMatches.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">
                {searchTerm || selectedLeague !== 'all' 
                  ? 'No matches found with current filters'
                  : 'No future matches available'
                }
              </p>
              {(searchTerm || selectedLeague !== 'all') && (
                <Button onClick={() => { setSearchTerm(''); setSelectedLeague('all'); }}>
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {filteredMatches.length} matches found
              </p>
              
              <div className="grid gap-4">
                {filteredMatches.map((match) => (
                  <Card key={match.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge variant="outline">{match.league}</Badge>
                          <Badge variant="secondary">Future</Badge>
                          {match.submitted_for_analysis && (
                            <Badge variant="default" className="bg-blue-500">
                              Submitted
                            </Badge>
                          )}
                        </div>
                        <p className="font-semibold text-lg">
                          {match.home_team} vs {match.away_team}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(match.kickoff_utc).toLocaleString()}
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {!match.submitted_for_analysis ? (
                          <Button
                            onClick={() => submitForAnalysis(match)}
                            disabled={submittingMatches.has(match.id)}
                            size="sm"
                          >
                            {submittingMatches.has(match.id) ? (
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                              <Brain className="w-4 h-4 mr-2" />
                            )}
                            Submit for Analysis
                          </Button>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            <span className="text-sm text-green-600">Submitted</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Workflow Info */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-800">📋 Workflow Guide</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-blue-700">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                1
              </div>
              <div>
                <strong>Browse Future Matches:</strong> View upcoming matches from real data sources
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                2
              </div>
              <div>
                <strong>Submit for Analysis:</strong> Click "Submit for Analysis" to send to AI agent
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                3
              </div>
              <div>
                <strong>Wait for Analysis:</strong> AI agent will analyze the match (coming soon)
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                4
              </div>
              <div>
                <strong>Publish Match:</strong> Once analysis is complete, publish for users to see
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Match Edit Card Component
function MatchEditCard({ match, onUpdate }: { match: AdminMatch; onUpdate: () => void }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editedMatch, setEditedMatch] = useState(match);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await adminApiPut(`/api/v1/admin/matches/${match.id}`, editedMatch);

      if (response.ok) {
        setIsEditing(false);
        onUpdate();
      } else {
        console.error('Failed to update match');
      }
    } catch (error) {
      console.error('Error updating match:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTogglePublish = async () => {
    try {
      const response = await adminApiPost(`/api/v1/admin/matches/${match.id}/toggle-publish`, { isPublished: !match.is_published });

      if (response.ok) {
        onUpdate();
      }
    } catch (error) {
      console.error('Error toggling publish:', error);
    }
  };

  const handleSendToAI = async () => {
    try {
      const response = await adminApiPost(`/api/v1/admin/matches/${match.id}/analyze`);

      if (response.ok) {
        onUpdate();
      }
    } catch (error) {
      console.error('Error sending to AI:', error);
    }
  };

  const handleCompleteAnalysis = async () => {
    try {
      const response = await adminApiPost('/api/v1/admin/complete-analysis', {
        matchId: match.id
      });

      if (response.ok) {
        onUpdate();
      }
    } catch (error) {
      console.error('Error completing analysis:', error);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this match?')) return;
    
    try {
      const response = await adminApiDelete(`/api/v1/admin/matches/${match.id}`);

      if (response.ok) {
        onUpdate();
      }
    } catch (error) {
      console.error('Error deleting match:', error);
    }
  };

  return (
    <Card className="p-4">
      {isEditing ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">League</label>
              <input
                type="text"
                value={editedMatch.league}
                onChange={(e) => setEditedMatch({...editedMatch, league: e.target.value})}
                className="w-full p-2 border rounded mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Status</label>
              <select
                value={editedMatch.status}
                onChange={(e) => setEditedMatch({...editedMatch, status: e.target.value})}
                className="w-full p-2 border rounded mt-1"
              >
                <option value="PRE">Pre-match</option>
                <option value="LIVE">Live</option>
                <option value="FT">Full Time</option>
                <option value="POSTPONED">Postponed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
        </div>
        </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Home Team</label>
              <input
                type="text"
                value={editedMatch.home_team}
                onChange={(e) => setEditedMatch({...editedMatch, home_team: e.target.value})}
                className="w-full p-2 border rounded mt-1"
              />
        </div>
            <div>
              <label className="text-sm font-medium">Away Team</label>
              <input
                type="text"
                value={editedMatch.away_team}
                onChange={(e) => setEditedMatch({...editedMatch, away_team: e.target.value})}
                className="w-full p-2 border rounded mt-1"
              />
        </div>
      </div>

          <div>
            <label className="text-sm font-medium">Kickoff Time</label>
            <input
              type="datetime-local"
              value={editedMatch.kickoff_utc.slice(0, 16)}
              onChange={(e) => setEditedMatch({...editedMatch, kickoff_utc: e.target.value + ':00.000Z'})}
              className="w-full p-2 border rounded mt-1"
            />
        </div>
        
          <div className="flex items-center justify-end space-x-2">
          <Button
              variant="outline"
              onClick={() => {
                setIsEditing(false);
                setEditedMatch(match);
              }}
              disabled={isSaving}
          >
              <X className="w-4 h-4 mr-2" />
              Cancel
          </Button>
          <Button
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save
          </Button>
        </div>
      </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <Badge variant="outline">{match.league}</Badge>
                <Badge variant={match.status === 'FT' ? 'default' : 'secondary'}>
                  {match.status}
                </Badge>
                <Badge variant={match.is_published ? 'default' : 'secondary'}>
                  {match.is_published ? 'Published' : 'Draft'}
                </Badge>
                <Badge variant="outline">
                  {match.analysis_status}
                </Badge>
              </div>
              <p className="font-semibold text-lg">
                {match.home_team} vs {match.away_team}
              </p>
              <p className="text-sm text-muted-foreground">
                {new Date(match.kickoff_utc).toLocaleString()}
              </p>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleTogglePublish}
              >
                {match.is_published ? (
                  <>
                    <Pause className="w-4 h-4 mr-2" />
                    Unpublish
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Publish
                  </>
                )}
              </Button>
              
              {match.analysis_status === 'none' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSendToAI}
                >
                  <Brain className="w-4 h-4 mr-2" />
                  Submit for Analysis
                </Button>
              )}
              
              {match.analysis_status === 'pending' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCompleteAnalysis}
                  className="bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100"
                >
                  <Brain className="w-4 h-4 mr-2" />
                  Complete Analysis (Mock)
                </Button>
              )}
              
              {match.analysis_status === 'completed' && (
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-green-600">Analyzed</span>
                </div>
              )}
              
            <Button
                variant="outline"
                size="sm"
                onClick={handleDelete}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
            </Button>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <span>ID: {match.id}</span>
            <span>Created: {new Date(match.created_at).toLocaleDateString()}</span>
            {match.updated_at && (
              <span>Updated: {new Date(match.updated_at).toLocaleDateString()}</span>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}

// Main admin page component
export default function AdminPage() {
  const { user } = useAuth();
  const { isAdmin, isAuthenticated: isDemoAuthenticated } = useRoleSelector();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('future'); // Start with future matches tab
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  // Admin state
  const [matches, setMatches] = useState<AdminMatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const finalIsAdmin = isAdmin || (user?.email && ['admin@bethub.com'].includes(user.email));
  const finalIsAuthenticated = isDemoAuthenticated || !!user;

  // Redirect non-admin users
  useEffect(() => {
    if (!finalIsAdmin && finalIsAuthenticated) {
      router.push('/');
    }
  }, [finalIsAdmin, finalIsAuthenticated, router]);

  // Fetch matches from database
  const fetchMatches = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await adminApiGet('/api/v1/admin/matches');
      
      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Non-JSON response received:', await response.text());
        setError('Server returned invalid response format');
        return;
      }
      
      const data = await response.json();
      
      if (data.success) {
        setMatches(data.data || []);
      } else {
        setError(data.message || 'Failed to fetch matches');
      }
    } catch (error) {
      console.error('Error fetching matches:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch matches');
    } finally {
      setIsLoading(false);
    }
  };

  // Load matches on component mount
  useEffect(() => {
    if (finalIsAdmin) {
      // Add timeout to prevent infinite loading
      const timeoutId = setTimeout(() => {
        if (isLoading) {
          setError('Request timed out. Please refresh the page.');
          setIsLoading(false);
        }
      }, 10000); // 10 second timeout
      
      fetchMatches();
      
      return () => clearTimeout(timeoutId);
    }
  }, [finalIsAdmin]);

  // Show access denied for non-admin users
  if (!finalIsAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <Header 
          onLoginClick={() => setShowAuthModal(true)}
          showAuthModal={showAuthModal}
          setShowAuthModal={setShowAuthModal}
          currentPage="admin"
        />
        <main className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <Shield className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Admin Access Required</h2>
              <p className="text-muted-foreground">You need admin privileges to access this page.</p>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto py-8">
        <AdminDashboardTabs />
      </main>
      <Footer />
    </div>
  );
}