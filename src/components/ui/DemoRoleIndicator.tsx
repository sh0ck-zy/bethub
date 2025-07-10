"use client";

import React, { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { useRoleSelector } from './RoleSelector';
import { Eye, User, Crown, Settings } from 'lucide-react';

export function DemoRoleIndicator() {
  const { role, isAuthenticated, isPremium, isAdmin } = useRoleSelector();
  const [isVisible, setIsVisible] = useState(true);

  // Auto-hide after 10 seconds, but show again when role changes
  useEffect(() => {
    setIsVisible(true);
    const timer = setTimeout(() => setIsVisible(false), 10000);
    return () => clearTimeout(timer);
  }, [role]);

  if (!isVisible) return null;

  const getRoleIcon = () => {
    switch (role) {
      case 'guest': return <Eye className="w-3 h-3" />;
      case 'free': return <User className="w-3 h-3" />;
      case 'premium': return <Crown className="w-3 h-3" />;
      case 'admin': return <Settings className="w-3 h-3" />;
      default: return <Eye className="w-3 h-3" />;
    }
  };

  const getRoleColor = () => {
    switch (role) {
      case 'guest': return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
      case 'free': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'premium': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'admin': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-card border border-border rounded-lg p-3 shadow-lg backdrop-blur-sm">
        <div className="text-xs text-muted-foreground mb-1">Demo Role:</div>
        <div className="flex items-center space-x-2">
          <Badge className={`text-xs ${getRoleColor()}`}>
            {getRoleIcon()}
            <span className="ml-1 capitalize">{role}</span>
          </Badge>
          <div className="text-xs text-muted-foreground">
            {isAuthenticated && <span className="text-green-600">✓ Auth</span>}
            {isPremium && <span className="text-yellow-600 ml-1">✓ Premium</span>}
            {isAdmin && <span className="text-red-600 ml-1">✓ Admin</span>}
          </div>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="absolute -top-1 -right-1 w-4 h-4 bg-gray-300 dark:bg-gray-600 rounded-full text-xs flex items-center justify-center hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
        >
          ×
        </button>
      </div>
    </div>
  );
} 