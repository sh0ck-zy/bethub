# Setup Catalog Tables Instructions

## 🚨 Database Setup Required

The catalog feature requires `leagues` and `teams` tables that don't exist in your database yet.

## 📋 Quick Setup (Recommended)

### Option 1: Manual Setup in Supabase Dashboard

1. **Go to your Supabase Dashboard**
   - Visit [supabase.com](https://supabase.com)
   - Open your BetHub project
   - Go to **SQL Editor**

2. **Run the Setup Script**
   - Copy the contents of `scripts/create-leagues-teams.sql`
   - Paste it into the SQL Editor
   - Click **Run**

3. **Verify Setup**
   - Check that `leagues` and `teams` tables are created
   - Verify sample data is inserted

### Option 2: Using Supabase CLI

```bash
# If you have Supabase CLI installed
supabase db push

# Or run the migration directly
supabase db reset
```

## 🔍 Verify Setup

After running the setup, test your catalog:

1. **Start your development server**
   ```bash
   npm run dev
   ```

2. **Test the API endpoint**
   ```bash
   curl http://localhost:3000/api/catalog
   ```

3. **Visit the catalog page**
   - Go to `http://localhost:3000/catalog`
   - You should see leagues and teams

## 📊 What Gets Created

### Tables Created:
- **`leagues`** - Football leagues/competitions
- **`teams`** - Football teams with league associations

### Sample Data:
- **5 Major Leagues**: Premier League, La Liga, Bundesliga, Serie A, Ligue 1
- **20+ Teams**: Major teams from each league with logos
- **Proper Relationships**: Teams linked to leagues

## 🎯 Next Steps

Once setup is complete:
1. The catalog will show your actual database data
2. You can add more leagues/teams through the admin interface
3. The catalog will automatically update as you add data

## 🆘 Troubleshooting

If you encounter issues:

1. **Check Supabase Connection**
   - Verify your environment variables
   - Test database connectivity

2. **Check Table Permissions**
   - Ensure RLS policies allow reading
   - Check if tables are accessible

3. **Check Console Logs**
   - Look for API error messages
   - Verify data is being fetched correctly

## 📞 Support

If you need help:
1. Check the browser console for errors
2. Check the server logs for API errors
3. Verify your Supabase project settings
