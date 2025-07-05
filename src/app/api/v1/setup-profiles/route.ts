import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    // This endpoint helps create the profiles table structure
    // In a real app, you'd run this SQL in your Supabase dashboard
    
    const profiles_table_sql = `
      -- Create profiles table if it doesn't exist
      CREATE TABLE IF NOT EXISTS public.profiles (
        id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
        email TEXT,
        role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
      );

      -- Enable Row Level Security (RLS)
      ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

      -- Create policies
      CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles
        FOR SELECT USING (true);

      CREATE POLICY "Users can insert their own profile." ON public.profiles
        FOR INSERT WITH CHECK (auth.uid() = id);

      CREATE POLICY "Users can update own profile." ON public.profiles
        FOR UPDATE USING (auth.uid() = id);

      -- Create function to handle new user signup
      CREATE OR REPLACE FUNCTION public.handle_new_user()
      RETURNS TRIGGER AS $$
      BEGIN
        INSERT INTO public.profiles (id, email, role)
        VALUES (NEW.id, NEW.email, 'user');
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;

      -- Create trigger for new user signup
      DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
      CREATE TRIGGER on_auth_user_created
        AFTER INSERT ON auth.users
        FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
    `;

    return NextResponse.json({
      message: 'Database setup instructions',
      sql: profiles_table_sql,
      instructions: [
        '1. Go to your Supabase Dashboard',
        '2. Navigate to the SQL Editor',
        '3. Run the provided SQL to create profiles table',
        '4. Set up admin user by updating a profile role to "admin"',
        '5. Test authentication flow'
      ]
    });

  } catch (error) {
    console.error('Setup error:', error);
    return NextResponse.json({ error: 'Setup failed' }, { status: 500 });
  }
}