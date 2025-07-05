'use client';

import { useState, useEffect } from 'react';
import { MatchCard } from '@/components/MatchCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, Plus } from 'lucide-react';

interface Match {
  id: string;
  league: string;
  home_team: string;
  away_team: string;
  kickoff_utc: string;
  status: string;
  is_published?: boolean;
  analysis_status?: 'none' | 'pending' | 'completed' | 'failed';
}

export default function AdminPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedLeague, setSelectedLeague] = useState('all');
  const [showFilter, setShowFilter] = useState('all'); // all, published, unpublished
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    setIsLoading(true);
    try {
      // Try admin API first with auth
      const response = await fetch('/api/v1/admin/matches', {
        headers: {
          'Authorization': 'Bearer admin-token' // TODO: Use real auth token
        }
      });
      
      if (!response.ok) {
        // Fallback to public API with dummy admin data
        const publicResponse = await fetch('/api/v1/today');
        const publicData = await publicResponse.json();
        
        // Add admin-specific fields to public data
        const adminData = publicData.map((match: Match) => ({
          ...match,
          is_published: Math.random() > 0.5, // Random for demo
          analysis_status: ['none', 'pending', 'completed', 'failed'][Math.floor(Math.random() * 4)]
        }));
        
        setMatches(adminData);
        return;
      }
      
      const data = await response.json();
      setMatches(data);
    } catch (error) {
      console.error('Error fetching matches:', error);
      setMatches([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendToAI = async (matchId: string) => {
    try {
      // Update UI immediately
      setMatches(prev => prev.map(match => 
        match.id === matchId 
          ? { ...match, analysis_status: 'pending' as const }
          : match
      ));

      // TODO: Implement actual API call
      const response = await fetch('/api/v1/admin/send-to-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchId })
      });

      if (!response.ok) {
        throw new Error('Failed to send to AI');
      }

      // Simulate AI processing time
      setTimeout(() => {
        setMatches(prev => prev.map(match => 
          match.id === matchId 
            ? { ...match, analysis_status: 'completed' as const }
            : match
        ));
      }, 3000);

    } catch (error) {
      console.error('Error sending to AI:', error);
      // Revert on error
      setMatches(prev => prev.map(match => 
        match.id === matchId 
          ? { ...match, analysis_status: 'failed' as const }
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

      // TODO: Implement actual API call
      const response = await fetch('/api/v1/admin/toggle-publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
            onClick={fetchMatches}
            disabled={isLoading}
            className="bg-gray-700 hover:bg-gray-600 text-white border-0 text-sm"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
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

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
          <p className="text-gray-400 mt-4">Loading matches...</p>
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
      {!isLoading && filteredMatches.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400">
            <p className="text-lg mb-2">No matches found</p>
            <p className="text-sm">Try adjusting your filters or add some matches</p>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="mt-8 p-4 rounded-lg bg-gray-800/50 border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => {
              const unpublished = matches.filter(m => !m.is_published);
              unpublished.forEach(match => handleTogglePublish(match.id, true));
            }}
            className="bg-green-600 hover:bg-green-700 text-white border-0 text-sm"
          >
            Publish All
          </Button>
          
          <Button
            onClick={() => {
              const published = matches.filter(m => m.is_published);
              published.forEach(match => handleTogglePublish(match.id, false));
            }}
            className="bg-red-600 hover:bg-red-700 text-white border-0 text-sm"
          >
            Hide All
          </Button>
          
          <Button
            onClick={() => {
              const unanalyzed = matches.filter(m => m.analysis_status === 'none');
              unanalyzed.forEach(match => handleSendToAI(match.id));
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white border-0 text-sm"
          >
            Analyze All
          </Button>
        </div>
      </div>
    </div>
  );
}