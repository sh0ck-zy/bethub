'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Search, Bell, User, Settings, Menu, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { useRoleSelector } from '@/components/ui/RoleSelector';
import { AuthModal } from '@/components/features/AuthModal';
import { useTheme } from '@/contexts/ThemeContext';

interface HeaderCleanProps {
  onLoginClick: () => void;
  showAuthModal: boolean;
  setShowAuthModal: (show: boolean) => void;
  sidebarOpen?: boolean;
  setSidebarOpen?: (open: boolean) => void;
}

export function HeaderClean({ 
  onLoginClick, 
  showAuthModal, 
  setShowAuthModal, 
  sidebarOpen = false, 
  setSidebarOpen 
}: HeaderCleanProps) {
  const { user, isAdmin, signOut } = useAuth();
  const { isAuthenticated, isAdmin: isDemoAdmin } = useRoleSelector();
  const { theme, toggleTheme } = useTheme();
  
  const finalIsAdmin = isDemoAdmin || isAdmin;
  const finalIsAuthenticated = isAuthenticated || user;

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <>
      <header className="bg-gray-800 border-b border-gray-700 px-4 py-3 sticky top-0 z-30">
        <div className="flex items-center justify-between">
          {/* Left Section */}
          <div className="flex items-center space-x-4">
            {/* Mobile Menu Button */}
            {setSidebarOpen && (
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden text-gray-300 hover:text-white hover:bg-gray-700"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            )}

            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">B</span>
              </div>
              <h1 className="text-xl font-bold text-white">BetHub</h1>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              <Button variant="ghost" className="text-gray-300 hover:text-white hover:bg-gray-700">
                Live Scores
              </Button>
              <Button variant="ghost" className="text-gray-300 hover:text-white hover:bg-gray-700">
                News
              </Button>
              {finalIsAdmin && (
                <Link href="/admin">
                  <Button variant="ghost" className="text-gray-300 hover:text-white hover:bg-gray-700">
                    Admin
                  </Button>
                </Link>
              )}
            </nav>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-2 md:space-x-4">
            {/* Desktop Search Bar */}
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="search"
                placeholder="Search matches..."
                className="pl-10 w-48 lg:w-64 bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-green-500"
              />
            </div>

            {/* Mobile Search Button */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden text-gray-300 hover:text-white hover:bg-gray-700"
            >
              <Search className="w-5 h-5" />
            </Button>

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="text-gray-300 hover:text-white hover:bg-gray-700"
            >
              {theme === 'dark' ? (
                <span className="w-5 h-5">🌙</span>
              ) : (
                <span className="w-5 h-5">☀️</span>
              )}
            </Button>

            {/* User Actions */}
            {finalIsAuthenticated ? (
              <div className="flex items-center space-x-2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-gray-300 hover:text-white hover:bg-gray-700"
                >
                  <Bell className="w-5 h-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleSignOut}
                  className="text-gray-300 hover:text-white hover:bg-gray-700"
                >
                  <User className="w-5 h-5" />
                </Button>
                {finalIsAdmin && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-gray-300 hover:text-white hover:bg-gray-700"
                  >
                    <Settings className="w-5 h-5" />
                  </Button>
                )}
              </div>
            ) : (
              <Button
                onClick={onLoginClick}
                variant="outline"
                className="bg-green-600 border-green-500 text-white hover:bg-green-700 hover:border-green-600"
              >
                Sign In
              </Button>
            )}
          </div>
        </div>
      </header>

      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </>
  );
}