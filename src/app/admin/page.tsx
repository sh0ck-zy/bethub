'use client';

import { useState, useEffect } from 'react';
import { MatchCard } from '@/components/features/MatchCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Plus, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useRoleSelector } from '@/components/ui/RoleSelector';
import { authService } from '@/lib/auth';
import { Loading, LoadingCard } from '@/components/ui/loading';

import type { Match } from '@/lib/types';

interface AdminMatch extends Match {
  is_published?: boolean;
  analysis_status?: 'none' | 'pending' | 'completed' | 'failed';
}

export default function AdminPage() {
  const [matches, setMatches] = useState<AdminMatch[]>([]);
  const [selectedLeague, setSelectedLeague] = useState('all');
  const [showFilter, setShowFilter] = useState('all'); // all, published, unpublished
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { user, isAdmin } = useAuth();
  const { isAdmin: isDemoAdmin, isAuthenticated: isDemoAuthenticated } = useRoleSelector();

  // Use demo role system for testing
  const finalIsAdmin = isDemoAdmin || isAdmin;
  const finalIsAuthenticated = isDemoAuthenticated || !!user;

  useEffect(() => {
    if (finalIsAdmin) {
      fetchMatches();
    } else {
      // If not admin, stop loading immediately
      setIsLoading(false);
    }
  }, [finalIsAdmin]);

  const fetchMatches = async (isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);
    
    try {
      // For demo admin, use fallback data
      if (isDemoAdmin && !user) {
        // Simulate API delay for realistic demo
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Demo admin matches data
        const demoMatches: AdminMatch[] = [
          {
            id: '550e8400-e29b-41d4-a716-446655440001',
            league: 'Premier League',
            home_team: 'Manchester United',
            away_team: 'Liverpool',
            kickoff_utc: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            status: 'PRE',
            is_published: true,
            analysis_status: 'completed'
          },
          {
            id: '550e8400-e29b-41d4-a716-446655440002',
            league: 'La Liga',
            home_team: 'Real Madrid',
            away_team: 'Barcelona',
            kickoff_utc: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
            status: 'PRE',
            is_published: false,
            analysis_status: 'pending'
          },
          {
            id: '550e8400-e29b-41d4-a716-446655440003',
            league: 'Serie A',
            home_team: 'Juventus',
            away_team: 'AC Milan',
            kickoff_utc: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
            status: 'FT',
            is_published: true,
            analysis_status: 'completed'
          }
        ];
        
        setMatches(demoMatches);
        return;
      }
      
      const token = await authService.getAuthToken();
      
      if (!token) {
        throw new Error('No auth token available');
      }

      const response = await fetch('/api/v1/admin/matches', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setMatches(data);
    } catch (error) {
      console.error('Error fetching matches:', error);
      setError('Failed to load matches. Please try again.');
      setMatches([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleSendToAI = async (matchId: string) => {
    try {
      // Update UI immediately
      setMatches(prev => prev.map(match => 
        match.id === matchId 
          ? { ...match, analysis_status: 'pending' }
          : match
      ));

      // For demo admin, just simulate the action
      if (isDemoAdmin && !user) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Simulate successful analysis
        setMatches(prev => prev.map(match => 
          match.id === matchId 
            ? { ...match, analysis_status: 'completed' }
            : match
        ));
        return;
      }

      const token = await authService.getAuthToken();
      
      if (!token) {
        throw new Error('No auth token available');
      }

      const response = await fetch('/api/v1/admin/send-to-ai', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ matchId })
      });

      if (!response.ok) {
        throw new Error('Failed to send to AI');
      }

    } catch (error) {
      console.error('Error sending to AI:', error);
      // Revert on error
      setMatches(prev => prev.map(match => 
        match.id === matchId 
          ? { ...match, analysis_status: 'none' }
          : match
      ));
    }
  };

  const handleTogglePublish = async (matchId: string, shouldPublish: boolean) => {
    try {
      // Update UI immediately
      setMatches(prev => prev.map(match => 
        match.id === matchId 
          ? { ...match, is_published: shouldPublish }
          : match
      ));

      // For demo admin, just simulate the action
      if (isDemoAdmin && !user) {
        await new Promise(resolve => setTimeout(resolve, 300));
        return;
      }

      const token = await authService.getAuthToken();
      
      if (!token) {
        throw new Error('No auth token available');
      }

      const response = await fetch('/api/v1/admin/toggle-publish', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ matchId, isPublished: shouldPublish })
      });

      if (!response.ok) {
        throw new Error('Failed to toggle publish status');
      }

    } catch (error) {
      console.error('Error toggling publish:', error);
      // Revert on error
      setMatches(prev => prev.map(match => 
        match.id === matchId 
          ? { ...match, is_published: !shouldPublish }
          : match
      ));
    }
  };

  const leagues = ['all', ...new Set(matches.map(match => match.league))];
  
  const filteredMatches = matches.filter(match => {
    const leagueMatch = selectedLeague === 'all' || match.league === selectedLeague;
    const publishFilter = showFilter === 'all' || 
                         (showFilter === 'published' && match.is_published) ||
                         (showFilter === 'unpublished' && !match.is_published);
    return leagueMatch && publishFilter;
  });

  const stats = {
    total: matches.length,
    published: matches.filter(m => m.is_published).length,
    analyzing: matches.filter(m => m.analysis_status === 'pending').length,
    completed: matches.filter(m => m.analysis_status === 'completed').length
  };

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gray-800/50 border border-white/10 rounded-lg p-4">
          <div className="text-2xl font-bold text-white">{stats.total}</div>
          <div className="text-sm text-gray-400">Total Matches</div>
        </div>
        <div className="bg-gray-800/50 border border-white/10 rounded-lg p-4">
          <div className="text-2xl font-bold text-green-400">{stats.published}</div>
          <div className="text-sm text-gray-400">Published</div>
        </div>
        <div className="bg-gray-800/50 border border-white/10 rounded-lg p-4">
          <div className="text-2xl font-bold text-yellow-400">{stats.analyzing}</div>
          <div className="text-sm text-gray-400">Analyzing</div>
        </div>
        <div className="bg-gray-800/50 border border-white/10 rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-400">{stats.completed}</div>
          <div className="text-sm text-gray-400">Completed</div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <h2 className="text-xl font-bold text-white">Match Management</h2>
          <Badge className="bg-blue-500/20 text-blue-400 border border-blue-500/30 text-xs">
            {filteredMatches.length} matches
          </Badge>
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={() => fetchMatches(true)}
            disabled={isRefreshing}
            className="bg-gray-700 hover:bg-gray-600 text-white border-0 text-sm"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <Button
            onClick={() => alert('Add match functionality coming soon!')}
            className="bg-green-600 hover:bg-green-700 text-white border-0 text-sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Match
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <select 
          value={selectedLeague}
          onChange={(e) => setSelectedLeague(e.target.value)}
          className="bg-gray-800/50 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-green-500 focus:outline-none"
        >
          {leagues.map(league => (
            <option key={league} value={league}>
              {league === 'all' ? 'All Leagues' : league}
            </option>
          ))}
        </select>
        
        <select 
          value={showFilter}
          onChange={(e) => setShowFilter(e.target.value)}
          className="bg-gray-800/50 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-green-500 focus:outline-none"
        >
          <option value="all">All Matches</option>
          <option value="published">Published Only</option>
          <option value="unpublished">Unpublished Only</option>
        </select>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <div className="flex-1">
              <p className="text-red-400 font-medium">Error loading matches</p>
              <p className="text-red-300 text-sm">{error}</p>
            </div>
            <Button
              onClick={() => fetchMatches(true)}
              className="bg-red-600 hover:bg-red-700 text-white border-0 text-sm px-3 py-1"
            >
              Retry
            </Button>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && !isRefreshing && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <LoadingCard key={i} showSkeleton={true} />
          ))}
        </div>
      )}

      {/* Matches Grid */}
      {!isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMatches.map((match) => (
            <MatchCard 
              key={match.id} 
              match={match} 
              mode="admin"
              adminControls={{
                onSendToAI: handleSendToAI,
                onTogglePublish: handleTogglePublish,
                analysisStatus: match.analysis_status || 'none',
                isPublished: match.is_published || false
              }}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredMatches.length === 0 && !error && (
        <div className="text-center py-12">
          <div className="text-gray-400 space-y-2">
            <p className="text-lg">No matches found</p>
            <p className="text-sm">Try adjusting your filters or add some matches.</p>
            <Button
              onClick={() => fetchMatches(true)}
              className="bg-gray-700 hover:bg-gray-600 text-white border-0 text-sm px-4 py-2 mt-3"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}