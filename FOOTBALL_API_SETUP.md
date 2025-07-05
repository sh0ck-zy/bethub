# Football API Integration Setup

This guide will help you set up the football API integration for BetHub.

## 🚀 Quick Start

### 1. Choose Your Football Data Provider

#### Option A: API-Football (Recommended for Production)
- **Cost**: $50-200/month
- **Coverage**: 1000+ leagues worldwide
- **Real-time data**: Yes
- **Documentation**: Excellent
- **Sign up**: [api-football.com](https://www.api-football.com/)

#### Option B: Football-Data.org (Free Tier Available)
- **Cost**: Free tier with limits, paid plans available
- **Coverage**: Major European leagues
- **Real-time data**: Limited
- **Documentation**: Good
- **Sign up**: [football-data.org](https://www.football-data.org/)

### 2. Environment Variables Setup

Create or update your `.env.local` file:

```env
# Football API Configuration
FOOTBALL_API_PROVIDER=apiFootball  # or 'footballData'
FOOTBALL_API_KEY=your_api_football_key_here
FOOTBALL_DATA_API_KEY=your_football_data_key_here

# Supabase Configuration (if not already set)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Database Migration

Run the database migration to add the required fields:

```bash
# If using Supabase CLI
supabase db push

# Or manually execute the SQL in supabase/migrations/0003_add_football_api_fields.sql
```

### 4. Test the Integration

```bash
# Test the football API integration
node scripts/test-football-api.js
```

## 🔧 Configuration Details

### API-Football Setup

1. **Sign up** at [api-football.com](https://www.api-football.com/)
2. **Choose a plan** (Basic plan is sufficient for testing)
3. **Get your API key** from the dashboard
4. **Set environment variables**:
   ```env
   FOOTBALL_API_PROVIDER=apiFootball
   FOOTBALL_API_KEY=your_api_key_here
   ```

### Football-Data.org Setup

1. **Sign up** at [football-data.org](https://www.football-data.org/)
2. **Get your API key** (free tier available)
3. **Set environment variables**:
   ```env
   FOOTBALL_API_PROVIDER=footballData
   FOOTBALL_DATA_API_KEY=your_api_key_here
   ```

## 🧪 Testing

### Manual Testing

1. **Start the development server**:
   ```bash
   npm run dev
   ```

2. **Go to admin panel** (`/admin`)

3. **Use the sync panel** to:
   - Check API health
   - Sync today's matches
   - Test force sync
   - Clean up old matches

### Automated Testing

```bash
# Run the test script
node scripts/test-football-api.js
```

Expected output:
```
🧪 Testing BetHub Football API Integration...

1. Testing API health...
   ✅ API Health: Connected

2. Testing today matches fetch...
   ✅ Successfully fetched 15 matches
   📊 Sample match: Arsenal vs Chelsea
   🏆 League: Premier League
   ⏰ Status: UPCOMING

3. Testing data sync health...
   ✅ Sync Health: Healthy

4. Testing sync status...
   📊 Sync Status: { isRunning: false, lastSyncTime: '2024-01-15T10:30:00.000Z' }

5. Testing dry run sync...
   ✅ Dry run completed: 15 matches would be added

🎉 Football API Integration Test Complete!

📋 Summary:
   API Health: ✅
   Matches Available: ✅
   Sync Health: ✅
   Dry Run: ✅
```

## 🔄 Data Synchronization

### Automatic Sync

The system supports automatic data synchronization:

- **Today's matches**: Fetches and syncs matches for the current day
- **Match updates**: Updates scores and status for live matches
- **Cleanup**: Removes matches older than 7 days

### Manual Sync

Use the admin panel to manually trigger sync operations:

1. **Sync Today's Matches**: Fetches and adds today's matches
2. **Force Sync**: Forces a complete sync (overwrites existing data)
3. **Cleanup**: Removes old matches from the database
4. **Health Check**: Verifies API and database connectivity

### API Endpoints

- `POST /api/v1/admin/sync` - Trigger sync operations
- `GET /api/v1/admin/sync` - Get sync status

## 📊 Data Structure

### Matches Table

The matches table now includes additional fields:

```sql
-- New fields added
home_team_id INTEGER,
away_team_id INTEGER,
competition_id INTEGER,
country TEXT,
score_home INTEGER,
score_away INTEGER,
events JSONB,
statistics JSONB
```

### Teams Table

```sql
CREATE TABLE teams (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  short_name TEXT,
  tla TEXT,
  country TEXT,
  founded INTEGER,
  venue TEXT,
  website TEXT,
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Competitions Table

```sql
CREATE TABLE competitions (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  country TEXT,
  type TEXT,
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🚨 Troubleshooting

### Common Issues

1. **API Key Invalid**
   ```
   Error: API-Football service unavailable
   ```
   **Solution**: Check your API key and ensure it's valid

2. **Rate Limit Exceeded**
   ```
   Error: Rate limit exceeded
   ```
   **Solution**: Upgrade your API plan or implement rate limiting

3. **Database Connection Failed**
   ```
   Error: Database fetch error
   ```
   **Solution**: Check your Supabase configuration

4. **Migration Failed**
   ```
   Error: Column already exists
   ```
   **Solution**: The migration is idempotent, this is normal

### Debug Mode

Enable debug logging by setting:

```env
NODE_ENV=development
DEBUG=true
```

### Health Check

Use the health check endpoint to verify all systems:

```bash
curl -X POST http://localhost:3000/api/v1/admin/sync \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"type": "health"}'
```

## 🔒 Security

### API Key Security

- **Never commit API keys** to version control
- **Use environment variables** for all sensitive data
- **Rotate API keys** regularly
- **Monitor API usage** to prevent abuse

### Database Security

- **Row Level Security (RLS)** is enabled on all tables
- **Admin-only access** for sync operations
- **JWT authentication** required for all admin endpoints

## 📈 Monitoring

### Sync Status

Monitor sync operations through:

1. **Admin Panel**: Real-time sync status
2. **API Endpoints**: Programmatic status checks
3. **Database Logs**: Detailed operation logs

### Performance Metrics

- **Sync duration**: Time taken for each sync operation
- **Match count**: Number of matches processed
- **Error rate**: Percentage of failed operations
- **API response time**: Football API performance

## 🚀 Production Deployment

### Vercel Deployment

1. **Set environment variables** in Vercel dashboard
2. **Deploy the application**
3. **Run database migrations**
4. **Test the integration**

### Environment Variables for Production

```env
# Production environment variables
FOOTBALL_API_PROVIDER=apiFootball
FOOTBALL_API_KEY=your_production_api_key
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_supabase_anon_key
```

### Monitoring Production

- **Set up alerts** for sync failures
- **Monitor API usage** and costs
- **Track performance metrics**
- **Regular health checks**

## 📚 API Documentation

### Football API Methods

- `getTodayMatches()` - Fetch today's matches
- `getMatchDetails(matchId)` - Get detailed match information
- `getTeamInfo(teamId)` - Get team information
- `checkHealth()` - Verify API connectivity

### Data Sync Methods

- `syncTodayMatches(options)` - Sync today's matches
- `syncMatchDetails(matchId)` - Sync specific match details
- `cleanupOldMatches()` - Remove old matches
- `healthCheck()` - Check system health

## 🎯 Next Steps

After setting up the football API integration:

1. **Test with real data** using the admin panel
2. **Implement AI analysis** for match insights
3. **Add real-time updates** for live matches
4. **Enhance user experience** with better match displays
5. **Implement caching** for better performance

## 📞 Support

If you encounter issues:

1. **Check the troubleshooting section** above
2. **Review the API documentation** for your chosen provider
3. **Test with the provided scripts**
4. **Check the logs** for detailed error messages

The football API integration is now ready to provide real match data to BetHub! 🚀 