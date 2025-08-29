import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Create a safe server client that doesn't throw during build time
export const supabaseServer = (supabaseUrl && serviceRoleKey) 
  ? createClient(supabaseUrl, serviceRoleKey)
  : null;

// Helper function to check if Supabase is configured
export const isSupabaseConfigured = () => {
  return !!(supabaseUrl && serviceRoleKey);
};

// Helper function to get Supabase server client safely
export const getSupabaseServer = () => {
  if (!supabaseServer) {
    throw new Error('Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.');
  }
  return supabaseServer;
};


