'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { realtimeService, type Notification } from '@/lib/realtime';
import { 
  Bell, 
  X, 
  Check, 
  AlertTriangle, 
  Target, 
  TrendingUp, 
  Brain,
  Clock,
  Settings
} from 'lucide-react';

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Check connection status
    const checkConnection = () => {
      setIsConnected(realtimeService.getConnectionStatus());
    };

    checkConnection();
    const interval = setInterval(checkConnection, 5000);

    // Listen for new notifications
    const unsubscribeNotification = realtimeService.on('notification', (notification: Notification) => {
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
      
      // Show browser notification if enabled
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(notification.title, {
          body: notification.message,
          icon: '/bethub-logo.png',
          tag: notification.id
        });
      }
    });

    // Load existing notifications
    loadNotifications();

    return () => {
      clearInterval(interval);
      unsubscribeNotification();
    };
  }, []);

  const loadNotifications = async () => {
    try {
      // In a real app, you'd fetch from the database
      // For now, we'll use mock data
      const mockNotifications: Notification[] = [
        {
          id: '1',
          type: 'analysis_ready',
          title: 'AI Analysis Ready',
          message: 'New match analysis is available for Manchester United vs Liverpool',
          timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          read: false,
          data: { matchId: 'match-1' }
        },
        {
          id: '2',
          type: 'odds_alert',
          title: 'Odds Change Alert',
          message: 'Significant odds movement detected for Arsenal vs Chelsea',
          timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
          read: false,
          data: { matchId: 'match-2' }
        },
        {
          id: '3',
          type: 'goal',
          title: 'Goal Alert',
          message: 'GOAL! Manchester United 1-0 Liverpool (Bruno Fernandes 23\')',
          timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          read: true,
          data: { matchId: 'match-1' }
        }
      ];

      setNotifications(mockNotifications);
      setUnreadCount(mockNotifications.filter(n => !n.read).length);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await realtimeService.markNotificationAsRead(notificationId);
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId ? { ...n, read: true } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.read);
      await Promise.all(
        unreadNotifications.map(n => realtimeService.markNotificationAsRead(n.id))
      );
      setNotifications(prev => 
        prev.map(n => ({ ...n, read: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const deleteNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    setUnreadCount(prev => {
      const notification = notifications.find(n => n.id === notificationId);
      return notification && !notification.read ? Math.max(0, prev - 1) : prev;
    });
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'analysis_ready':
        return <Brain className="h-4 w-4 text-blue-400" />;
      case 'odds_alert':
        return <TrendingUp className="h-4 w-4 text-yellow-400" />;
      case 'goal':
        return <Target className="h-4 w-4 text-green-400" />;
      case 'match_start':
        return <Clock className="h-4 w-4 text-purple-400" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'analysis_ready':
        return 'border-blue-500/30 bg-blue-500/10';
      case 'odds_alert':
        return 'border-yellow-500/30 bg-yellow-500/10';
      case 'goal':
        return 'border-green-500/30 bg-green-500/10';
      case 'match_start':
        return 'border-purple-500/30 bg-purple-500/10';
      default:
        return 'border-gray-500/30 bg-gray-500/10';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="relative h-10 w-10 p-0"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs">
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-md max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
              {isConnected && (
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              )}
            </DialogTitle>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllAsRead}
                  className="h-8 px-2 text-xs"
                >
                  <Check className="h-3 w-3 mr-1" />
                  Mark all read
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-2 max-h-[60vh] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No notifications yet</p>
              <p className="text-sm text-gray-400">We'll notify you about important updates</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <Card
                key={notification.id}
                className={`relative border ${getNotificationColor(notification.type)} ${
                  !notification.read ? 'ring-2 ring-blue-500/20' : ''
                }`}
              >
                <CardContent className="p-3">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-white">
                            {notification.title}
                          </h4>
                          <p className="text-xs text-gray-400 mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500 mt-2">
                            {formatTimestamp(notification.timestamp)}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          {!notification.read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => markAsRead(notification.id)}
                              className="h-6 w-6 p-0"
                            >
                              <Check className="h-3 w-3" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteNotification(notification.id)}
                            className="h-6 w-6 p-0"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {notifications.length > 0 && (
          <div className="flex items-center justify-between pt-2 border-t border-gray-700">
            <span className="text-xs text-gray-400">
              {unreadCount} unread of {notifications.length} total
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setNotifications([])}
              className="h-8 px-2 text-xs"
            >
              Clear all
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
} 