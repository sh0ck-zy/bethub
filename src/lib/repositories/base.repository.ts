import { createClient } from '@supabase/supabase-js';

export abstract class BaseRepository {
  protected supabase;
  
  constructor() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase configuration. Check NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.');
    }
    
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  protected handleError(error: any, operation: string): never {
    console.error(`Database ${operation} error:`, error);
    
    if (error.code === 'PGRST116') {
      throw new Error(`${operation}: Record not found`);
    }
    
    if (error.code === '23505') {
      throw new Error(`${operation}: Duplicate record`);
    }
    
    if (error.code === '23503') {
      throw new Error(`${operation}: Foreign key constraint violation`);
    }
    
    throw new Error(`${operation} failed: ${error.message || 'Unknown database error'}`);
  }

  protected now(): string {
    return new Date().toISOString();
  }
}