'use client';

import { useState, useEffect } from 'react';
import { MatchCard } from '@/components/MatchCard';
import { AdSlot } from '@/components/AdSlot';
import { AuthModal } from '@/components/AuthModal';
import { LanguageSwitch } from '@/components/LanguageSwitch';
import { RegionProvider } from '@/components/RegionProvider';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Calendar, Filter, LogIn } from 'lucide-react';

export default function HomePage() {
  const [matches, setMatches] = useState([]);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedSport, setSelectedSport] = useState('all');
  const [selectedLeague, setSelectedLeague] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  useEffect(() => {
    // Fetch today's matches
    fetchMatches();
  }, [selectedDate, selectedSport, selectedLeague, selectedStatus]);

  const fetchMatches = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedSport !== 'all') params.append('sport', selectedSport);
      if (selectedLeague !== 'all') params.append('league', selectedLeague);
      if (selectedStatus !== 'all') params.append('status', selectedStatus);

      const response = await fetch(`/api/v1/today?${params}`);
      const data = await response.json();
      setMatches(data || []);
    } catch (error) {
      console.error('Error fetching matches:', error);
      // Set dummy data for development
      setMatches([
        {
          id: '1',
          league: 'Premier League',
          home_team: 'Manchester United',
          away_team: 'Liverpool',
          kickoff_utc: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
          status: 'PRE'
        },
        {
          id: '2',
          league: 'La Liga',
          home_team: 'Real Madrid',
          away_team: 'Barcelona',
          kickoff_utc: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
          status: 'LIVE'
        }
      ]);
    }
  };

  return (
    <RegionProvider>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold">SPORTSBET INSIGHT</h1>
              <div className="flex items-center space-x-4">
                <LanguageSwitch />
                {!isAuthenticated && (
                  <Button onClick={() => setIsAuthModalOpen(true)}>
                    <LogIn className="mr-2 h-4 w-4" />
                    Sign In
                  </Button>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          {/* Filters */}
          <div className="mb-8 space-y-4">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-auto"
                />
              </div>
              
              <Select value={selectedSport} onValueChange={setSelectedSport}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Sport" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sports</SelectItem>
                  <SelectItem value="football">Football</SelectItem>
                  <SelectItem value="basketball">Basketball</SelectItem>
                  <SelectItem value="tennis">Tennis</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedLeague} onValueChange={setSelectedLeague}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="League" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Leagues</SelectItem>
                  <SelectItem value="premier-league">Premier League</SelectItem>
                  <SelectItem value="la-liga">La Liga</SelectItem>
                  <SelectItem value="bundesliga">Bundesliga</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="live">Live</SelectItem>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="finished">Finished</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Matches Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {matches.map((match, index) => (
              <div key={match.id}>
                <MatchCard match={match} />
                {index === 2 && (
                  <div className="mt-6 mb-6">
                    <AdSlot id="home_mpu" sizes={[300, 250]} className="mx-auto" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {matches.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No matches found for the selected filters.</p>
            </div>
          )}
        </main>

        <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      </div>
    </RegionProvider>
  );
}

