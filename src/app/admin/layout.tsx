'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useRoleSelector } from '@/components/ui/RoleSelector';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAdmin, isLoading, signOut } = useAuth();
  const { isAdmin: isDemoAdmin, role } = useRoleSelector();
  const router = useRouter();

  // Use demo role system for testing
  const finalIsAdmin = isDemoAdmin || isAdmin;
  const finalUser = user || (role !== 'guest' ? { email: role } : null);

  useEffect(() => {
    // Redirect non-admin users
    if (!isLoading && !finalIsAdmin) {
      router.push('/');
    }
  }, [finalIsAdmin, isLoading, router]);

  const handleLogout = async () => {
    await signOut();
    router.push('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  // If not admin, don't render anything (will redirect)
  if (!finalIsAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center">
        <div className="bg-gray-800/50 border border-white/10 rounded-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-lg">!</span>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
            <p className="text-gray-400 text-sm mb-6">You need admin privileges to access this area</p>
            <p className="text-gray-500 text-xs mb-4">
              Current role: {role} | Required: admin
            </p>
            <button
              onClick={() => router.push('/')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-all"
            >
              Back to Homepage
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      {/* Admin Header */}
      <header className="border-b border-white/10 bg-gray-900/90 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center">
                <span className="text-white font-bold text-sm">B</span>
              </div>
              <h1 className="text-xl font-bold text-white">BetHub Admin</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-gray-300 text-sm">
                Welcome, {finalUser?.email || role}
              </div>
              <button
                onClick={() => router.push('/')}
                className="text-gray-400 hover:text-white text-sm transition-colors"
              >
                View Public Site
              </button>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {children}
    </div>
  );
}