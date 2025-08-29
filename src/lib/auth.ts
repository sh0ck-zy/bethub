import { supabase } from './supabase';

export interface UserProfile {
  id: string;
  email: string;
  role: 'user' | 'premium' | 'admin';
  created_at: string;
}

export interface AuthState {
  user: UserProfile | null;
  isLoading: boolean;
  isAdmin: boolean;
  isPremium: boolean;
}

export const authService = {
  // Sign up new user
  async signUp(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    
    if (error) throw error;
    
    // Profile will be created automatically by the database trigger
    return data;
  },

  // Sign in existing user
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    return data;
  },

  // Sign out
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  // Get current user profile
  async getCurrentUser(): Promise<UserProfile | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return null;
      
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }
      
      return profile;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  },

  // Check if user is admin
  async isAdmin(): Promise<boolean> {
    try {
      const profile = await this.getCurrentUser();
      return profile?.role === 'admin';
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  },

  // Promote user to admin (for development/testing)
  async promoteToAdmin(userId: string): Promise<void> {
    const { error } = await supabase
      .from('profiles')
      .update({ role: 'admin' })
      .eq('id', userId);
    
    if (error) throw error;
  },

  // Server-side admin check for API routes
  async checkAdminFromRequest(request: Request): Promise<{ isAdmin: boolean; user: any; error?: string }> {
    try {
      // Get the authorization header
      const authHeader = request.headers.get('authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return { isAdmin: false, user: null, error: 'No authorization header' };
      }

      const token = authHeader.substring(7); // Remove 'Bearer ' prefix

      // Verify the JWT token with Supabase
      const { data: { user }, error } = await supabase.auth.getUser(token);
      
      if (error || !user) {
        return { isAdmin: false, user: null, error: 'Invalid token' };
      }

      // Check if user has admin role
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profileError || !profile) {
        return { isAdmin: false, user, error: 'Profile not found' };
      }

      return { isAdmin: profile.role === 'admin', user };
    } catch (error) {
      console.error('Error checking admin status:', error);
      return { isAdmin: false, user: null, error: 'Server error' };
    }
  },

  // Get auth token for API calls
  async getAuthToken(): Promise<string | null> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return session?.access_token || null;
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  },

  // Listen to auth changes
  onAuthStateChange(callback: (user: UserProfile | null) => void) {
    return supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const profile = await this.getCurrentUser();
        callback(profile);
      } else {
        callback(null);
      }
    });
  }
};