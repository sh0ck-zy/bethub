# BetHub Setup Guide

This guide will help you set up the BetHub authentication and admin system for testing.

## 🚀 Quick Start

### 1. Supabase Setup

1. **Create a Supabase project:**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Note your project URL and anon key

2. **Set up environment variables:**
   Create a `.env.local` file in your project root:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. **Run database migrations:**
   ```bash
   # Install Supabase CLI if you haven't
   npm install -g supabase
   
   # Link your project (replace with your project ref)
   supabase link --project-ref your_project_ref
   
   # Run migrations
   supabase db push
   ```

   **Alternative: Manual SQL execution**
   If you don't have the CLI, run these SQL commands in your Supabase SQL editor:

   ```sql
   -- Run the initial schema
   -- Copy and paste the contents of supabase/migrations/0001_initial_schema.sql
   
   -- Run the profiles table migration
   -- Copy and paste the contents of supabase/migrations/0002_add_profiles_table.sql
   ```

4. **Seed the database (optional):**
   ```bash
   # Run the seed script in your Supabase SQL editor
   -- Copy and paste the contents of scripts/seed.sql
   ```

### 2. Test the Auth System

1. **Run the auth test script:**
   ```bash
   node scripts/test-auth.js
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

3. **Test the application:**
   - Visit `http://localhost:3000`
   - Click "Login" to open the auth modal
   - Sign up with a new account
   - Check your email for confirmation (if required)
   - Sign in with your credentials

### 3. Test Admin Panel

1. **Promote a user to admin:**
   ```bash
   # Run this in your Supabase SQL editor
   UPDATE profiles 
   SET role = 'admin' 
   WHERE email = 'your_email@example.com';
   ```

2. **Access admin panel:**
   - Sign in with your admin account
   - Click "Admin Panel" button on the homepage
   - Or visit `http://localhost:3000/admin` directly

## 🔧 Troubleshooting

### Common Issues

1. **"Profiles table doesn't exist"**
   - Make sure you've run the database migrations
   - Check that `0002_add_profiles_table.sql` was executed

2. **"Authorization required" errors**
   - Verify your Supabase environment variables are correct
   - Check that the user is properly authenticated

3. **Admin panel access denied**
   - Ensure the user has `role = 'admin'` in the profiles table
   - Check the browser console for any errors

4. **Auth modal not working**
   - Check that the AuthProvider is wrapping your app in `layout.tsx`
   - Verify Supabase client configuration in `lib/supabase.ts`

### Database Schema Verification

Run this query in your Supabase SQL editor to verify the setup:

```sql
-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('profiles', 'matches', 'analysis_snapshots');

-- Check profiles table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'profiles';

-- Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename IN ('profiles', 'matches');
```

## 🧪 Testing Checklist

- [ ] User registration works
- [ ] User login works
- [ ] User logout works
- [ ] Profile is created automatically on signup
- [ ] Admin promotion works
- [ ] Admin panel is accessible
- [ ] Admin can view all matches
- [ ] Admin can toggle match publish status
- [ ] Admin can send matches to AI analysis
- [ ] Public homepage shows only published matches

## 🚀 Deployment

### Vercel Deployment

1. **Connect to Vercel:**
   ```bash
   npm install -g vercel
   vercel login
   vercel
   ```

2. **Set environment variables in Vercel:**
   - Go to your Vercel project dashboard
   - Navigate to Settings > Environment Variables
   - Add your Supabase environment variables

3. **Deploy:**
   ```bash
   vercel --prod
   ```

### Supabase Production Setup

1. **Enable Row Level Security (RLS):**
   - RLS is already enabled in the migrations
   - Verify policies are working correctly

2. **Set up authentication providers:**
   - Go to Authentication > Settings in Supabase dashboard
   - Configure email templates if needed
   - Set up any additional providers (Google, GitHub, etc.)

3. **Monitor usage:**
   - Check the Supabase dashboard for any errors
   - Monitor database performance

## 📝 Next Steps

Once the auth and admin system is working:

1. **Add real match data integration**
2. **Implement AI analysis service**
3. **Add payment system for premium features**
4. **Set up analytics and monitoring**
5. **Add email notifications**
6. **Implement real-time updates**

## 🆘 Support

If you encounter issues:

1. Check the browser console for errors
2. Check the Supabase dashboard for database errors
3. Run the test script to verify connectivity
4. Verify all environment variables are set correctly
5. Check that all migrations have been applied

The auth and admin system should now be fully functional for testing! 