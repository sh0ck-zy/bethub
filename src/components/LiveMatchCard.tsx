'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TeamLogo } from '@/components/TeamLogo';
import { realtimeService, LiveMatchUpdate } from '@/lib/realtime';
import { 
  Wifi, 
  WifiOff, 
  Clock, 
  Target, 
  TrendingUp, 
  Bell,
  BellOff,
  Play,
  Pause,
  Square
} from 'lucide-react';

interface LiveMatchCardProps {
  matchId: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  currentMinute?: number;
  status: string;
  league: string;
  date: string;
  odds?: {
    home: number;
    draw: number;
    away: number;
  };
}

export default function LiveMatchCard({
  matchId,
  homeTeam,
  awayTeam,
  homeScore,
  awayScore,
  currentMinute = 0,
  status,
  league,
  date,
  odds
}: LiveMatchCardProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [liveUpdates, setLiveUpdates] = useState<LiveMatchUpdate[]>([]);
  const [currentScore, setCurrentScore] = useState({ home: homeScore, away: awayScore });
  const [currentOdds, setCurrentOdds] = useState(odds);
  const [matchMinute, setMatchMinute] = useState(currentMinute);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    // Check connection status
    const checkConnection = () => {
      setIsConnected(realtimeService.getConnectionStatus());
    };

    checkConnection();
    const interval = setInterval(checkConnection, 5000);

    // Subscribe to real-time updates
    const unsubscribeMatch = realtimeService.on('match_update', (update: LiveMatchUpdate) => {
      if (update.matchId === matchId) {
        setLiveUpdates(prev => [update, ...prev.slice(0, 9)]); // Keep last 10 updates
        
        // Update score if it's a goal
        if (update.type === 'goal' && update.data.homeScore !== undefined && update.data.awayScore !== undefined) {
          setCurrentScore({
            home: update.data.homeScore,
            away: update.data.awayScore
          });
        }

        // Update minute
        if (update.data.minute !== undefined) {
          setMatchMinute(update.data.minute);
        }
      }
    });

    const unsubscribeOdds = realtimeService.on('odds_change', (update: any) => {
      if (update.matchId === matchId && update.data.odds) {
        setCurrentOdds(update.data.odds);
      }
    });

    // Subscribe to this match
    realtimeService.subscribeToMatch(matchId);
    setIsSubscribed(true);

    // Start mock updates in development
    if (process.env.NODE_ENV === 'development' && status === 'LIVE') {
      realtimeService.startMockUpdates(matchId);
    }

    return () => {
      clearInterval(interval);
      unsubscribeMatch();
      unsubscribeOdds();
      realtimeService.unsubscribeFromMatch(matchId);
    };
  }, [matchId, status]);

  // Auto-update match minute for live matches
  useEffect(() => {
    if (status === 'LIVE' && !isPaused) {
      const interval = setInterval(() => {
        setMatchMinute(prev => {
          const newMinute = prev + 1;
          // End match at 90 minutes (simplified)
          if (newMinute >= 90) {
            setIsPaused(true);
            return 90;
          }
          return newMinute;
        });
      }, 60000); // Update every minute

      return () => clearInterval(interval);
    }
  }, [status, isPaused]);

  const toggleNotifications = () => {
    setNotificationsEnabled(!notificationsEnabled);
    if (!notificationsEnabled) {
      // Request notification permission
      if ('Notification' in window) {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            setNotificationsEnabled(true);
          }
        });
      }
    }
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'LIVE':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'PRE':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'FT':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getUpdateIcon = (type: string) => {
    switch (type) {
      case 'goal':
        return '⚽';
      case 'card':
        return '🟨';
      case 'substitution':
        return '🔄';
      case 'injury':
        return '🏥';
      case 'odds_change':
        return '📊';
      default:
        return '📢';
    }
  };

  return (
    <Card className="relative overflow-hidden border-2 border-blue-500/20 bg-gradient-to-br from-slate-900 to-slate-800">
      {/* Connection Status */}
      <div className="absolute top-2 right-2 flex items-center gap-2">
        {isConnected ? (
          <Wifi className="h-4 w-4 text-green-400" />
        ) : (
          <WifiOff className="h-4 w-4 text-red-400" />
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleNotifications}
          className="h-6 w-6 p-0"
        >
          {notificationsEnabled ? (
            <Bell className="h-4 w-4 text-blue-400" />
          ) : (
            <BellOff className="h-4 w-4 text-gray-400" />
          )}
        </Button>
      </div>

      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <Badge className="bg-blue-500/20 text-blue-400 border border-blue-500/30 text-xs">
            {league}
          </Badge>
          <div className="flex items-center gap-2">
            <Badge className={`${getStatusColor(status)} border text-xs`}>
              {status === 'LIVE' ? (
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                  LIVE
                </div>
              ) : status}
            </Badge>
            {status === 'LIVE' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={togglePause}
                className="h-6 w-6 p-0"
              >
                {isPaused ? (
                  <Play className="h-4 w-4" />
                ) : (
                  <Pause className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Teams and Score */}
        <div className="flex items-center justify-between">
          <div className="text-center flex-1">
            <TeamLogo team={homeTeam} size={32} />
            <h3 className="text-sm font-semibold text-white mt-1">{homeTeam}</h3>
          </div>
          
          <div className="text-center mx-4">
            <div className="text-2xl font-bold text-white mb-1">
              {currentScore.home} - {currentScore.away}
            </div>
            {status === 'LIVE' && (
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <Clock className="h-3 w-3" />
                {matchMinute}'
              </div>
            )}
          </div>

          <div className="text-center flex-1">
            <TeamLogo team={awayTeam} size={32} />
            <h3 className="text-sm font-semibold text-white mt-1">{awayTeam}</h3>
          </div>
        </div>

        {/* Live Updates */}
        {liveUpdates.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-gray-400 flex items-center gap-1">
              <Target className="h-3 w-3" />
              Live Updates
            </h4>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {liveUpdates.slice(0, 3).map((update, index) => (
                <div key={index} className="flex items-start gap-2 p-2 bg-gray-800/50 rounded text-xs">
                  <span className="text-lg">{getUpdateIcon(update.type)}</span>
                  <div className="flex-1">
                    <p className="text-white">{update.data.description}</p>
                    <p className="text-gray-400">
                      {new Date(update.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Odds */}
        {currentOdds && (
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-gray-400 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              Live Odds
            </h4>
            <div className="grid grid-cols-3 gap-2">
              <div className="text-center p-2 bg-gray-800/50 rounded">
                <div className="text-xs text-gray-400">Home</div>
                <div className="text-sm font-semibold text-white">{currentOdds.home}</div>
              </div>
              <div className="text-center p-2 bg-gray-800/50 rounded">
                <div className="text-xs text-gray-400">Draw</div>
                <div className="text-sm font-semibold text-white">{currentOdds.draw}</div>
              </div>
              <div className="text-center p-2 bg-gray-800/50 rounded">
                <div className="text-xs text-gray-400">Away</div>
                <div className="text-sm font-semibold text-white">{currentOdds.away}</div>
              </div>
            </div>
          </div>
        )}

        {/* Connection Info */}
        <div className="text-xs text-gray-500 text-center">
          {isSubscribed ? (
            <span className="text-green-400">● Live updates enabled</span>
          ) : (
            <span className="text-red-400">● Live updates disabled</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 