'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, MapPin } from 'lucide-react';
import Link from 'next/link';

interface Match {
  id: string;
  league: string;
  home_team: string;
  away_team: string;
  kickoff_utc: string;
  status: string;
}

interface MatchCardProps {
  match: Match;
}

export function MatchCard({ match }: MatchCardProps) {
  const kickoffTime = new Date(match.kickoff_utc).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'LIVE':
        return 'bg-red-500';
      case 'PRE':
        return 'bg-blue-500';
      case 'FT':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <Link href={`/match/${match.id}`}>
      <Card className="hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 cursor-pointer border-border/50 hover:border-primary/50">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {match.league}
            </CardTitle>
            <Badge className={`${getStatusColor(match.status)} text-white ${match.status === 'LIVE' ? 'live-pulse' : ''}`}>
              {match.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="text-lg font-semibold">
              {match.home_team} vs {match.away_team}
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <Clock className="mr-1 h-4 w-4" />
              {kickoffTime}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

