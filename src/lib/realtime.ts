import { io, Socket } from 'socket.io-client';
import { createClient } from '@supabase/supabase-js';

// Supabase client for real-time subscriptions
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export interface LiveMatchUpdate {
  matchId: string;
  type: 'goal' | 'card' | 'substitution' | 'injury' | 'analysis' | 'odds_change';
  timestamp: string;
  data: {
    homeScore?: number;
    awayScore?: number;
    minute?: number;
    player?: string;
    team?: string;
    description?: string;
    odds?: {
      home: number;
      draw: number;
      away: number;
    };
  };
}

export interface Notification {
  id: string;
  type: 'match_start' | 'goal' | 'analysis_ready' | 'odds_alert' | 'system';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  data?: any;
}

export class RealtimeService {
  private socket: Socket | null = null;
  private supabaseSubscription: any = null;
  private listeners: Map<string, Set<Function>> = new Map();
  private isConnected = false;

  constructor() {
    this.initializeSocket();
    this.initializeSupabaseRealtime();
  }

  private initializeSocket() {
    // For production, use your actual WebSocket server
    // For development, we'll use a mock implementation
    if (typeof window !== 'undefined') {
      this.socket = io(process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'http://localhost:3001', {
        transports: ['websocket', 'polling'],
        autoConnect: false,
      });

      this.socket.on('connect', () => {
        console.log('WebSocket connected');
        this.isConnected = true;
        this.emit('user_connected', { userId: this.getUserId() });
      });

      this.socket.on('disconnect', () => {
        console.log('WebSocket disconnected');
        this.isConnected = false;
      });

      this.socket.on('match_update', (data: LiveMatchUpdate) => {
        this.notifyListeners('match_update', data);
      });

      this.socket.on('notification', (data: Notification) => {
        this.notifyListeners('notification', data);
      });

      this.socket.on('odds_change', (data: any) => {
        this.notifyListeners('odds_change', data);
      });

      this.socket.on('analysis_ready', (data: any) => {
        this.notifyListeners('analysis_ready', data);
      });

      // Connect automatically
      this.socket.connect();
    }
  }

  private initializeSupabaseRealtime() {
    // Subscribe to real-time changes in the database
    this.supabaseSubscription = supabase
      .channel('public:matches')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'matches'
        },
        (payload) => {
          this.handleDatabaseChange(payload);
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'match_analyses'
        },
        (payload) => {
          this.handleAnalysisChange(payload);
        }
      )
      .subscribe();
  }

  private handleDatabaseChange(payload: any) {
    const { eventType, new: newRecord, old: oldRecord } = payload;
    
    if (eventType === 'UPDATE' && newRecord && oldRecord) {
      // Check if it's a score update
      if (newRecord.home_score !== oldRecord.home_score || 
          newRecord.away_score !== oldRecord.away_score) {
        
        const update: LiveMatchUpdate = {
          matchId: newRecord.id,
          type: 'goal',
          timestamp: new Date().toISOString(),
          data: {
            homeScore: newRecord.home_score,
            awayScore: newRecord.away_score,
            minute: newRecord.current_minute,
            description: `${newRecord.home_team} ${newRecord.home_score} - ${newRecord.away_score} ${newRecord.away_team}`
          }
        };

        this.notifyListeners('match_update', update);
      }

      // Check if it's an odds update
      if (newRecord.odds && JSON.stringify(newRecord.odds) !== JSON.stringify(oldRecord.odds)) {
        const update: LiveMatchUpdate = {
          matchId: newRecord.id,
          type: 'odds_change',
          timestamp: new Date().toISOString(),
          data: {
            odds: newRecord.odds
          }
        };

        this.notifyListeners('odds_change', update);
      }
    }
  }

  private handleAnalysisChange(payload: any) {
    const { eventType, new: newRecord } = payload;
    
    if (eventType === 'INSERT' && newRecord) {
      const notification: Notification = {
        id: `analysis-${newRecord.id}`,
        type: 'analysis_ready',
        title: 'AI Analysis Ready',
        message: 'New match analysis is available',
        timestamp: new Date().toISOString(),
        read: false,
        data: { matchId: newRecord.match_id }
      };

      this.notifyListeners('notification', notification);
    }
  }

  private getUserId(): string | null {
    // Get user ID from localStorage or auth context
    if (typeof window !== 'undefined') {
      return localStorage.getItem('bethub_user_id');
    }
    return null;
  }

  // Public methods
  public connect() {
    if (this.socket && !this.isConnected) {
      this.socket.connect();
    }
  }

  public disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
    if (this.supabaseSubscription) {
      supabase.removeChannel(this.supabaseSubscription);
    }
  }

  public emit(event: string, data: any) {
    if (this.socket && this.isConnected) {
      this.socket.emit(event, data);
    }
  }

  public on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    // Return unsubscribe function
    return () => {
      const eventListeners = this.listeners.get(event);
      if (eventListeners) {
        eventListeners.delete(callback);
      }
    };
  }

  private notifyListeners(event: string, data: any) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in event listener:', error);
        }
      });
    }
  }

  // Match-specific subscriptions
  public subscribeToMatch(matchId: string) {
    this.emit('subscribe_match', { matchId });
  }

  public unsubscribeFromMatch(matchId: string) {
    this.emit('unsubscribe_match', { matchId });
  }

  // Notification methods
  public async sendNotification(notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) {
    const fullNotification: Notification = {
      ...notification,
      id: `notification-${Date.now()}`,
      timestamp: new Date().toISOString(),
      read: false
    };

    // Store in database
    await supabase
      .from('notifications')
      .insert(fullNotification);

    // Emit via WebSocket
    this.emit('notification', fullNotification);
  }

  public async markNotificationAsRead(notificationId: string) {
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId);
  }

  // Live match data methods
  public async getLiveMatches(): Promise<any[]> {
    const { data, error } = await supabase
      .from('matches')
      .select('*')
      .eq('status', 'LIVE')
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching live matches:', error);
      return [];
    }

    return data || [];
  }

  public async getMatchUpdates(matchId: string, limit: number = 10): Promise<LiveMatchUpdate[]> {
    const { data, error } = await supabase
      .from('match_updates')
      .select('*')
      .eq('match_id', matchId)
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching match updates:', error);
      return [];
    }

    return data || [];
  }

  // Mock data for development
  public startMockUpdates(matchId: string) {
    if (process.env.NODE_ENV === 'development') {
      const mockUpdates = [
        {
          matchId,
          type: 'goal' as const,
          timestamp: new Date().toISOString(),
          data: {
            homeScore: 1,
            awayScore: 0,
            minute: 23,
            player: 'Bruno Fernandes',
            team: 'home',
            description: 'GOAL! Bruno Fernandes scores from the penalty spot!'
          }
        },
        {
          matchId,
          type: 'card' as const,
          timestamp: new Date().toISOString(),
          data: {
            minute: 28,
            player: 'Virgil van Dijk',
            team: 'away',
            description: 'Yellow card for Virgil van Dijk'
          }
        },
        {
          matchId,
          type: 'odds_change' as const,
          timestamp: new Date().toISOString(),
          data: {
            odds: {
              home: 1.85,
              draw: 3.60,
              away: 4.20
            }
          }
        }
      ];

      // Simulate real-time updates
      mockUpdates.forEach((update, index) => {
        setTimeout(() => {
          this.notifyListeners('match_update', update);
        }, (index + 1) * 5000); // 5 seconds apart
      });
    }
  }

  // Connection status
  public getConnectionStatus(): boolean {
    return this.isConnected;
  }

  // Cleanup
  public destroy() {
    this.disconnect();
    this.listeners.clear();
  }
}

// Singleton instance
export const realtimeService = new RealtimeService();

// Cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    realtimeService.destroy();
  });
} 