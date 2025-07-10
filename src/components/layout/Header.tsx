import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { RoleSelector, useRoleSelector } from '@/components/ui/RoleSelector';
import { Crown, User, LogOut, Settings, BarChart3 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { AuthModal } from '@/components/features/AuthModal';

interface HeaderProps {
  onLoginClick: () => void;
  showAuthModal: boolean;
  setShowAuthModal: (show: boolean) => void;
  currentPage?: 'home' | 'match' | 'dashboard' | 'admin';
}

export function Header({ onLoginClick, showAuthModal, setShowAuthModal, currentPage = 'home' }: HeaderProps) {
  const { user, isAdmin, signOut } = useAuth();
  const { role, isAuthenticated, isPremium, isAdmin: isDemoAdmin } = useRoleSelector();
  
  // Use demo role system for testing
  const finalIsAdmin = isDemoAdmin || isAdmin;
  const finalIsAuthenticated = isAuthenticated || user;
  const finalIsPremium = isPremium;

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <>
      <header className="bg-background border-b border-border sticky top-0 z-50 backdrop-blur-sm bg-background/95">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Navigation */}
            <div className="flex items-center space-x-6">
              <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">B</span>
                </div>
                <div>
                  <h1 className="text-lg font-bold text-foreground">BetHub</h1>
                  <p className="text-xs text-muted-foreground hidden sm:block">AI Sports Analysis</p>
                </div>
              </Link>

              {/* Navigation Links - Desktop */}
              <nav className="hidden md:flex items-center space-x-1">
                {finalIsAuthenticated && (
                  <Link 
                    href="/dashboard"
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      currentPage === 'dashboard' 
                        ? 'bg-accent text-accent-foreground' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                    }`}
                  >
                    <Settings className="w-4 h-4 mr-1 inline" />
                    Dashboard
                  </Link>
                )}

                {finalIsAdmin && (
                  <Link 
                    href="/admin"
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      currentPage === 'admin' 
                        ? 'bg-accent text-accent-foreground' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                    }`}
                  >
                    <BarChart3 className="w-4 h-4 mr-1 inline" />
                    Admin
                  </Link>
                )}
              </nav>
            </div>

            {/* User Actions */}
            <div className="flex items-center space-x-3">
              {/* Demo Role Selector - Development Only */}
              {process.env.NODE_ENV === 'development' && (
                <RoleSelector className="hidden sm:flex" />
              )}
              
              <ThemeToggle />
              {finalIsAuthenticated ? (
                <div className="flex items-center space-x-3">
                  {/* User Info & Status */}
                  <div className="hidden sm:flex items-center space-x-3">
                    <div className="text-right">
                      <div className="text-sm font-medium text-foreground truncate max-w-32">
                        {user?.email?.split('@')[0] || role}
                      </div>
                      {!finalIsPremium && (
                        <div className="text-xs text-muted-foreground">1 analysis remaining</div>
                      )}
                    </div>
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                  </div>

                  {/* Account Status Button */}
                  {finalIsPremium ? (
                    <Button
                      variant="outline"
                      className="border-yellow-400 text-yellow-600 hover:bg-yellow-50 dark:text-yellow-400 dark:border-yellow-500 dark:hover:bg-yellow-900/20 text-sm px-4 py-2"
                    >
                      <Crown className="w-4 h-4 mr-2" />
                      <span className="hidden sm:inline">Premium</span>
                      <span className="sm:hidden">Pro</span>
                    </Button>
                  ) : (
                    <Button
                      onClick={() => alert('Premium upgrade modal')}
                      className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white border-0 text-sm px-4 py-2"
                    >
                      <Crown className="w-4 h-4 mr-2" />
                      <span className="hidden sm:inline">Upgrade</span>
                      <span className="sm:hidden">Pro</span>
                    </Button>
                  )}

                  {/* Settings/Logout */}
                  <div className="flex items-center space-x-2">
                    {/* Dashboard Link - Mobile */}
                    <Link href="/dashboard" className="md:hidden">
                      <Button variant="outline" size="sm">
                        <Settings className="w-4 h-4" />
                      </Button>
                    </Link>

                    {/* Logout */}
                    <Button
                      onClick={handleSignOut}
                      variant="outline"
                      size="sm"
                    >
                      <LogOut className="w-4 h-4 sm:mr-2" />
                      <span className="hidden sm:inline">Logout</span>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Button
                    onClick={onLoginClick}
                    variant="outline"
                    className="text-sm px-4 py-2"
                  >
                    <User className="w-4 h-4 mr-2" />
                    Sign In
                  </Button>
                  
                  <Button
                    onClick={onLoginClick}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-sm px-4 py-2 border-0"
                  >
                    <Crown className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Get Premium</span>
                    <span className="sm:hidden">Premium</span>
                  </Button>
                </div>
              )}
            </div>
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