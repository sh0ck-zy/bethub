'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LeagueLogo } from '@/components/LeagueLogo';
import { TeamLogo } from '@/components/TeamLogo';
import { Search, ArrowLeft, Grid3X3, List, Filter } from 'lucide-react';

interface Team {
  id: string;
  name: string;
  short_name: string;
  logo_url?: string;
  country: string;
  founded?: number;
}

interface League {
  id: string;
  name: string;
  country: string;
  logo_url?: string;
  teams: Team[];
}

interface CatalogData {
  leagues: League[];
  totalTeams: number;
  totalLeagues: number;
}

export default function CatalogPage() {
  const [data, setData] = useState<CatalogData | null>(null);
  const [selectedLeague, setSelectedLeague] = useState<League | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch catalog data from API
  useEffect(() => {
    const fetchCatalogData = async () => {
      try {
        setIsLoading(true);
        
        const response = await fetch('/api/catalog');
        if (!response.ok) {
          throw new Error('Failed to fetch catalog data');
        }
        
        const catalogData = await response.json();
        setData(catalogData);
      } catch (error) {
        console.error('Error fetching catalog data:', error);
        setError('Failed to load catalog data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCatalogData();
  }, []);

  const filteredLeagues = data?.leagues.filter(league =>
    league.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    league.country.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const filteredTeams = selectedLeague?.teams.filter(team =>
    team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    team.short_name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg p-6">
                  <div className="h-16 w-16 bg-gray-300 rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Error Loading Catalog</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          
          {error.includes('table') && error.includes('not found') && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6 text-left">
              <p className="text-sm text-red-800 dark:text-red-200">
                <strong>Database Setup Required:</strong><br />
                The leagues and teams tables don't exist yet.<br />
                Please run the setup script in your Supabase dashboard.
              </p>
            </div>
          )}
          
          <div className="flex gap-2 justify-center">
            <Button onClick={() => window.location.reload()}>Retry</Button>
            <Button variant="outline" onClick={() => window.open('/catalog', '_blank')}>Open in New Tab</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          {selectedLeague ? (
            <div className="flex items-center gap-4 mb-6">
              <Button
                variant="outline"
                onClick={() => setSelectedLeague(null)}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Leagues
              </Button>
              <div className="flex items-center gap-4">
                <LeagueLogo league={selectedLeague.name} size={48} logoUrl={selectedLeague.logo_url} />
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{selectedLeague.name}</h1>
                  <p className="text-gray-600 dark:text-gray-400">{selectedLeague.country} • {selectedLeague.teams.length} teams</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="mb-6">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Football Catalog</h1>
              <p className="text-gray-600 dark:text-gray-400">
                Browse {data?.totalLeagues} leagues and {data?.totalTeams} teams from around the world
              </p>
            </div>
          )}
        </div>

        {/* Search and Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder={selectedLeague ? "Search teams..." : "Search leagues..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {!selectedLeague && (
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Content */}
        {selectedLeague ? (
          /* Teams View */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredTeams.map((team) => (
              <Card key={team.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6 text-center">
                  <div className="flex justify-center mb-4">
                    <TeamLogo team={team.name} size={64} logoUrl={team.logo_url} />
                  </div>
                  <h3 className="font-semibold text-lg mb-1">{team.name}</h3>
                  <Badge variant="secondary" className="mb-2">{team.short_name}</Badge>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {team.country} {team.founded && `• Founded ${team.founded}`}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          /* Leagues View */
          <div className={
            viewMode === 'grid' 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              : "space-y-4"
          }>
            {filteredLeagues.map((league) => (
              <Card 
                key={league.id} 
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setSelectedLeague(league)}
              >
                {viewMode === 'grid' ? (
                  <CardContent className="p-6 text-center">
                    <div className="flex justify-center mb-4">
                      <LeagueLogo league={league.name} size={80} logoUrl={league.logo_url} />
                    </div>
                    <h3 className="font-semibold text-xl mb-2">{league.name}</h3>
                    <Badge variant="secondary" className="mb-3">{league.country}</Badge>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {league.teams.length} teams
                    </p>
                  </CardContent>
                ) : (
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <LeagueLogo league={league.name} size={60} logoUrl={league.logo_url} />
                      <div className="flex-1">
                        <h3 className="font-semibold text-xl mb-1">{league.name}</h3>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">{league.country}</Badge>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {league.teams.length} teams
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {(selectedLeague ? filteredTeams.length === 0 : filteredLeagues.length === 0) && (
          <div className="text-center py-12">
            {searchTerm ? (
              <p className="text-gray-600 dark:text-gray-400">
                No results found for your search.
              </p>
            ) : (
              <div className="max-w-md mx-auto">
                <div className="text-6xl mb-4">🏗️</div>
                <h3 className="text-xl font-semibold mb-2">Database Setup Required</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  The leagues and teams tables need to be created in your database.
                </p>
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-left">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>Quick Setup:</strong><br />
                    1. Go to your Supabase Dashboard → SQL Editor<br />
                    2. Run the script from <code>scripts/create-leagues-teams.sql</code><br />
                    3. Refresh this page
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
