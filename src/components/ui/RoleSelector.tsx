"use client";

import React, { useState, useEffect } from 'react';
import { User, Crown, Settings, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export type UserRole = 'guest' | 'free' | 'premium' | 'admin';

interface RoleSelectorProps {
  onRoleChange?: (role: UserRole) => void;
  currentRole?: UserRole;
  className?: string;
}

const ROLES = {
  guest: {
    label: 'Guest',
    icon: Eye,
    color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    description: 'Not logged in'
  },
  free: {
    label: 'Free User',
    icon: User,
    color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    description: '1 analysis per day'
  },
  premium: {
    label: 'Premium',
    icon: Crown,
    color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    description: 'Unlimited access'
  },
  admin: {
    label: 'Admin',
    icon: Settings,
    color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    description: 'Full access'
  }
};

export function RoleSelector({ onRoleChange, currentRole = 'guest', className }: RoleSelectorProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole>(currentRole);

  useEffect(() => {
    // Load role from localStorage
    const savedRole = localStorage.getItem('demo-role') as UserRole;
    if (savedRole && ROLES[savedRole]) {
      setSelectedRole(savedRole);
      onRoleChange?.(savedRole);
    }
  }, [onRoleChange]);

  const handleRoleChange = (role: UserRole) => {
    setSelectedRole(role);
    localStorage.setItem('demo-role', role);
    onRoleChange?.(role);
  };

  const currentRoleData = ROLES[selectedRole];
  const Icon = currentRoleData.icon;

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <Select value={selectedRole} onValueChange={handleRoleChange}>
        <SelectTrigger className="w-40">
          <SelectValue>
            <div className="flex items-center space-x-2">
              <Icon className="w-4 h-4" />
              <span className="text-sm">{currentRoleData.label}</span>
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {Object.entries(ROLES).map(([role, config]) => {
            const RoleIcon = config.icon;
            return (
              <SelectItem key={role} value={role}>
                <div className="flex items-center space-x-2 py-1">
                  <RoleIcon className="w-4 h-4" />
                  <div className="flex-1">
                    <div className="font-medium">{config.label}</div>
                    <div className="text-xs text-muted-foreground">{config.description}</div>
                  </div>
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
      
      <Badge className={`text-xs ${currentRoleData.color}`}>
        {currentRoleData.label}
      </Badge>
    </div>
  );
}

// Hook to use the role selector
export function useRoleSelector() {
  const [role, setRole] = useState<UserRole>('guest');
  
  useEffect(() => {
    const savedRole = localStorage.getItem('demo-role') as UserRole;
    if (savedRole && ROLES[savedRole]) {
      setRole(savedRole);
    }
  }, []);

  const isGuest = role === 'guest';
  const isFree = role === 'free';
  const isPremium = role === 'premium';
  const isAdmin = role === 'admin';
  const isAuthenticated = role !== 'guest';

  return {
    role,
    setRole,
    isGuest,
    isFree,
    isPremium,
    isAdmin,
    isAuthenticated
  };
} 