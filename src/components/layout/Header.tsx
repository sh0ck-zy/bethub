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
  currentPage?: 'home' | 'match' | 'admin';
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
              <RoleSelector className="hidden sm:flex" />
              
              <ThemeToggle />
              {finalIsAuthenticated ? (
                <div className="flex items-center space-x-3">
                  {/* User Info & Account Type */}
                  <div className="hidden sm:flex items-center space-x-3">
                    <div className="text-right">
                      <div className="flex items-center justify-end">
                        {finalIsPremium ? (
                          <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 text-xs font-semibold shadow-md">
                            <Crown className="w-3 h-3 mr-1" />
                            Premium
                          </Badge>
                        ) : finalIsAdmin ? (
                          <Badge className="bg-red-500 text-white border-0 text-xs font-medium">
                            <Settings className="w-3 h-3 mr-1" />
                            Admin
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs border-border">
                            <User className="w-3 h-3 mr-1" />
                            Free
                          </Badge>
                        )}
                      </div>
                      {!finalIsPremium && !finalIsAdmin && (
                        <p className="text-xs text-muted-foreground text-right">1 analysis remaining</p>
                      )}
                    </div>
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-sm">
                      <User className="w-4 h-4 text-white" />
                    </div>
                  </div>

                  {/* Upgrade Button - Only for Free Users */}
                  {!finalIsPremium && !finalIsAdmin && (
                    <Button
                      onClick={() => alert('Premium upgrade modal')}
                      className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white border-0 text-sm px-4 py-2 font-medium shadow-sm"
                    >
                      <Crown className="w-4 h-4 mr-2" />
                      <span className="hidden sm:inline">Upgrade</span>
                      <span className="sm:hidden">Pro</span>
                    </Button>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center space-x-2">
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