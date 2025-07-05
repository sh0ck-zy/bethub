# BetHub - Immediate Action Plan

## 🎯 **This Week's Focus: Data Integration**

### **Day 1-2: Football API Setup**

#### **Step 1: Choose Football Data Provider**
**Options:**
1. **API-Football** (Recommended)
   - Cost: $50-200/month
   - Coverage: 1000+ leagues
   - Real-time data
   - Good documentation

2. **Football-Data.org**
   - Cost: Free tier available
   - Coverage: Major European leagues
   - Limited real-time data
   - Good for testing

**Decision:** Start with API-Football for comprehensive coverage

#### **Step 2: Set Up API Integration**
```bash
# Install required packages
npm install axios node-cron

# Create API service
mkdir src/lib/api
touch src/lib/api/football.ts
touch src/lib/api/sync.ts
```

#### **Step 3: Create Database Migrations**
```sql
-- Create teams table
CREATE TABLE teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id integer UNIQUE,
  name text NOT NULL,
  short_name text,
  league text,
  logo_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create leagues table
CREATE TABLE leagues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id integer UNIQUE,
  name text NOT NULL,
  country text,
  logo_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enhance matches table
ALTER TABLE matches ADD COLUMN external_id integer UNIQUE;
ALTER TABLE matches ADD COLUMN home_team_id uuid REFERENCES teams(id);
ALTER TABLE matches ADD COLUMN away_team_id uuid REFERENCES teams(id);
ALTER TABLE matches ADD COLUMN league_id uuid REFERENCES leagues(id);
ALTER TABLE matches ADD COLUMN home_score integer;
ALTER TABLE matches ADD COLUMN away_score integer;
ALTER TABLE matches ADD COLUMN match_data jsonb;
```

### **Day 3-4: Data Synchronization**

#### **Step 1: Create Football API Service**
```typescript
// src/lib/api/football.ts
export class FootballAPI {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.FOOTBALL_API_KEY!;
    this.baseUrl = 'https://api-football-v1.p.rapidapi.com/v3';
  }

  async getLeagues() {
    // Fetch leagues from API
  }

  async getTeams(leagueId: number) {
    // Fetch teams for a league
  }

  async getMatches(leagueId: number, season: number) {
    // Fetch matches for a league/season
  }

  async getMatchDetails(matchId: number) {
    // Fetch detailed match information
  }
}
```

#### **Step 2: Create Data Sync Service**
```typescript
// src/lib/api/sync.ts
export class DataSyncService {
  private footballAPI: FootballAPI;
  private supabase: SupabaseClient;

  constructor() {
    this.footballAPI = new FootballAPI();
    this.supabase = createClient(/* config */);
  }

  async syncLeagues() {
    // Sync leagues from API to database
  }

  async syncTeams(leagueId: number) {
    // Sync teams for a league
  }

  async syncMatches(leagueId: number, season: number) {
    // Sync matches for a league/season
  }

  async updateMatchScores() {
    // Update live match scores
  }
}
```

#### **Step 3: Create Sync API Endpoints**
```typescript
// src/app/api/v1/admin/sync/leagues/route.ts
export async function POST(request: Request) {
  // Admin endpoint to trigger league sync
}

// src/app/api/v1/admin/sync/matches/route.ts
export async function POST(request: Request) {
  // Admin endpoint to trigger match sync
}
```

### **Day 5-7: Enhanced Match Management**

#### **Step 1: Update Admin Panel**
- [ ] Add "Sync Data" buttons to admin panel
- [ ] Create league selection dropdown
- [ ] Add match import functionality
- [ ] Display sync status and progress

#### **Step 2: Enhanced Match Cards**
- [ ] Display real team logos
- [ ] Show live scores
- [ ] Add league badges
- [ ] Improve match status indicators

#### **Step 3: Match Detail Pages**
- [ ] Complete match information display
- [ ] Team lineups (when available)
- [ ] Match statistics
- [ ] Historical head-to-head data

## 🛠️ **Technical Implementation**

### **Environment Variables**
Add to `.env.local`:
```env
# Football API
FOOTBALL_API_KEY=your_api_football_key
FOOTBALL_API_URL=https://api-football-v1.p.rapidapi.com

# Sync Settings
SYNC_ENABLED=true
SYNC_INTERVAL=300000  # 5 minutes
```

### **Database Schema Updates**
Create migration file: `supabase/migrations/0003_add_football_data.sql`

### **API Service Structure**
```
src/lib/api/
├── football.ts      # Football API client
├── sync.ts          # Data synchronization service
├── types.ts         # API response types
└── utils.ts         # API utility functions
```

## 📋 **This Week's Deliverables**

### **By End of Day 2**
- [ ] Football API integration set up
- [ ] Database schema updated
- [ ] Basic API client working

### **By End of Day 4**
- [ ] Data synchronization service working
- [ ] Admin sync endpoints created
- [ ] Test with real data

### **By End of Day 7**
- [ ] Enhanced admin panel with sync features
- [ ] Improved match cards with real data
- [ ] Basic match detail pages
- [ ] End-to-end testing with real matches

## 🎯 **Success Criteria**

### **Technical**
- [ ] Can fetch data from football API
- [ ] Data syncs to database correctly
- [ ] Admin can trigger syncs manually
- [ ] Match cards display real team data

### **User Experience**
- [ ] Admin panel shows sync status
- [ ] Match cards look professional with real data
- [ ] Match detail pages load quickly
- [ ] No broken images or missing data

## 🚀 **Next Week Preview**

**Week 2 Focus: AI Analysis Framework**
- Set up AI analysis service
- Create analysis data structures
- Build analysis display components
- Implement real-time updates

## 💡 **Tips for Success**

1. **Start Small**: Begin with one league (Premier League)
2. **Test Thoroughly**: Validate API responses before syncing
3. **Handle Errors**: Graceful fallbacks for API failures
4. **Monitor Usage**: Track API calls to stay within limits
5. **Backup Data**: Keep local copies of important data

## 🔧 **Troubleshooting**

### **Common Issues**
- **API Rate Limits**: Implement request throttling
- **Data Inconsistencies**: Validate data before saving
- **Sync Failures**: Add retry logic and error logging
- **Performance**: Use database indexes for queries

### **Debug Commands**
```bash
# Test API connection
curl -H "X-RapidAPI-Key: YOUR_KEY" \
     -H "X-RapidAPI-Host: api-football-v1.p.rapidapi.com" \
     "https://api-football-v1.p.rapidapi.com/v3/leagues"

# Check database
psql -d your_database -c "SELECT COUNT(*) FROM matches;"

# Monitor sync logs
tail -f logs/sync.log
```

This focused plan will get you from mock data to real football data in one week, setting up the foundation for the AI analysis features in week 2. 