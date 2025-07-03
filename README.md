# BetHub - AI Football Analysis Platform

## 🎯 **Value Proposition**

BetHub provides **professional-grade football match analysis** powered by AI, delivering three core values to users:

### **What We Provide:**

1. **🧠 AI Tactical Analysis**
   - Team formation analysis and playing styles
   - Strengths & weaknesses breakdown
   - Key player impact assessments
   - Head-to-head historical patterns
   - Match dynamics predictions (non-betting focused)

2. **📊 Historical Statistical Profiles**
   - Team performance averages (last 10 games)
   - Possession, shots, discipline metrics
   - Goals scored/conceded patterns
   - Recent form visualization with detailed match data
   - Pass accuracy and attacking statistics

3. **💰 Betting Odds Information** *(Informational Only)*
   - Real-time odds from licensed bookmakers
   - Responsible gambling disclaimers
   - Multiple betting houses comparison
   - No betting encouragement - pure data transparency

### **Target User Experience:**
Users get a **sophisticated analysis laboratory** that helps them understand match dynamics through AI insights and historical data, without being pushed toward betting decisions.

---

## 🏗️ **Data Architecture & AI Agent Framework**

### **What We Need for Each Match:**

#### **Minimal Required Input:**
```json
{
  "match_id": "string",
  "home_team": "string", 
  "away_team": "string",
  "league": "string",
  "kickoff_utc": "ISO 8601 datetime",
  "status": "PRE | LIVE | FT | POSTPONED | CANCELLED"
}
```

#### **Assets We Manage:**
- **Team Logos**: Static SVG files in `/public/logos/` (manually curated)
- **UI Components**: All frontend rendering handled internally
- **Fallback Data**: Default/skeleton content for failed AI responses

### **AI Agent Responsibilities:**

Our AI agent is responsible for **fetching and generating ALL analytical content**:

#### **✅ Agent Fetches:**
- Team tactical analysis (formations, styles, strengths/weaknesses)
- Historical statistics from sports databases
- Recent match results and form data
- Key player information and injury status
- Head-to-head historical data
- Betting odds from bookmaker APIs
- Match prediction summaries

#### **✅ Agent Generates:**
- Tactical insights and playing style descriptions
- Statistical pattern analysis
- Key factor identification for match dynamics
- Confidence scores for all generated content

#### **❌ We Don't Provide to Agent:**
- Team logos (handled locally)
- UI rendering logic
- User authentication data
- Betting recommendations

---

## 🔄 **API Integration Flow**

### **1. Match Request**
```
GET /api/v1/match/{match_id}
```

### **2. AI Agent Processing**
- Agent receives minimal match info
- Fetches tactical & statistical data from sports APIs
- Generates AI analysis using LLM
- Validates and structures response

### **3. Response Format**
Returns structured JSON following our [TypeScript schema](src/types/match-analysis.ts):

```json
{
  "success": true,
  "version": "1.0",
  "generated_at": "2024-06-17T16:00:00Z",
  "match_id": "match_123",
  "data": {
    "match_info": {...},
    "tactical_analysis": {...},
    "team_statistics": {...},
    "head_to_head": {...},
    "betting_odds": {...},
    "confidence_score": 0.87,
    "data_completeness": 0.93
  }
}
```

### **4. Error Handling**
- **Graceful Degradation**: Show available data, hide failed sections
- **Fallback Content**: Default messages for missing AI analysis  
- **User Communication**: Clear error states with retry options

---

## 🛡️ **Quality Assurance**

### **Data Validation:**
- Confidence scores for all AI-generated content
- Data completeness metrics
- Automatic fallbacks for low-confidence data

### **User Experience:**
- Loading states for all AI-generated sections
- Clear distinction between AI analysis and factual data
- Professional error handling without technical jargon

### **Responsible Features:**
- No direct betting encouragement
- Transparent AI confidence indicators
- Educational focus on tactical understanding

---

## 🚀 **MVP Scope (v1.0)**

**What's Included:**
- ✅ Basic match layout with team confrontation
- ✅ Three analysis tabs (AI Analysis, Statistics, Betting Odds)  
- ✅ Mobile-optimized responsive design
- ✅ Error handling framework
- ✅ AI agent integration schema

**Next Versions:**
- 🔄 Real AI agent integration
- 🔄 Live match updates
- 🔄 User authentication & premium features
- 🔄 Multi-language support based on user location

---

## 📁 **Project Structure**

```
src/
├── types/match-analysis.ts          # AI Agent response schema
├── components/AnalysisTabs.tsx      # Main analysis interface
├── app/match/[id]/page.tsx          # Match page layout
├── lib/teams.ts                     # Team data utilities
└── public/logos/                    # Team logo assets (manual)
```

This architecture ensures **clear separation of concerns**: we handle the user experience and visual presentation, while the AI agent focuses purely on data fetching and analysis generation.

# SPORTSBET INSIGHT v1.0

A worldwide sports-betting insights platform built with Next.js 14, TypeScript, Tailwind CSS, and Supabase. This platform provides a foundation for displaying AI-generated sports analysis and insights with a professional sportsbook aesthetic.

## 🚀 Features

- **Global Localization**: Auto-detects browser language and stores region preferences
- **Dark Sportsbook Theme**: Professional dark theme with neon accents
- **Authentication**: Email magic-link and social login support via Supabase Auth
- **Real-time Updates**: Server-Sent Events (SSE) for live match analysis
- **AI Insights**: Dedicated section for AI-generated match analysis (authentication required)
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Ad-Ready**: Placeholder ad slots with GDPR compliance preparation

## 🏗️ Architecture

### Tech Stack
- **Frontend**: Next.js 14 (App Router) + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **Icons**: Lucide React
- **Internationalization**: i18next with browser language detection
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Real-time**: Supabase Realtime (SSE implementation)
- **Deployment**: Vercel (frontend) + Supabase (backend)

### Project Structure
```
sportsbet-insight/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── api/v1/            # API routes
│   │   ├── match/[id]/        # Match detail pages
│   │   └── globals.css        # Global styles with sportsbook theme
│   ├── components/            # React components
│   │   ├── ui/               # shadcn/ui components
│   │   ├── AuthModal.tsx     # Authentication modal
│   │   ├── MatchCard.tsx     # Match display component
│   │   └── AnalysisTabs.tsx  # Match analysis tabs
│   ├── lib/                  # Utility libraries
│   │   ├── supabase.ts       # Supabase client
│   │   ├── ads.ts            # Ad serving utilities
│   │   └── cmp.ts            # GDPR consent management
│   └── types/                # TypeScript type definitions
├── schemas/                  # JSON schemas for data contracts
├── supabase/                # Database migrations
├── scripts/                 # Utility scripts
└── public/locales/          # Translation files
```

## 🛠️ Setup & Installation

### Prerequisites
- Node.js 18+ and pnpm
- Supabase account and project
- Git

### 1. Clone and Install
```bash
git clone <repository-url>
cd sportsbet-insight
pnpm install
```

### 2. Environment Configuration
Copy the example environment file and configure your variables:
```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
INTERNAL_API_KEY=your_secret_api_key_for_agent_ingestion
```

### 3. Database Setup
Run the database migrations in your Supabase project:
```sql
-- Copy and execute the contents of supabase/migrations/0001_initial_schema.sql
-- in your Supabase SQL editor
```

### 4. Seed Development Data
Populate your database with sample data:
```sql
-- Copy and execute the contents of scripts/seed.sql
-- in your Supabase SQL editor
```

### 5. Generate TypeScript Types
```bash
pnpm run generate:schema
```

## 🚀 Development

### Start Development Server
```bash
pnpm dev
```

The application will be available at `http://localhost:3000`.

### Available Scripts
- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm generate:schema` - Generate TypeScript types from JSON schemas

## 📡 API Endpoints

### Public Endpoints
- `GET /api/v1/today` - Get today's matches with optional filters
  - Query params: `sport`, `league`, `status`, `sb_region`
- `GET /api/v1/match/[id]` - Get match details and latest analysis

### Protected Endpoints
- `GET /api/v1/match/[id]/stream` - SSE stream for real-time analysis updates
- `POST /api/v1/ingest/analysis` - Ingest analysis data from AI agent
  - Requires `x-api-key` header

### Data Contract
AI agents should send analysis data matching the schema in `schemas/matchAnalysis.v1.json`:
```json
{
  "matchId": "uuid",
  "snapshotTs": "2025-06-17T14:30:00Z",
  "status": "PRE|LIVE|HT|FT",
  "aiInsights": [
    {
      "id": "string",
      "content": "markdown content",
      "confidence": 0.85
    }
  ],
  "stats": {}
}
```

## 🎨 UI Components

### Key Components
- **MatchCard**: Displays match information with live status indicators
- **AnalysisTabs**: Tabbed interface for Live Feed, Stats, Odds, and AI Insights
- **AuthModal**: Authentication modal with magic-link support
- **InsightBlock**: Displays AI insights with confidence indicators
- **AdSlot**: Placeholder ad slots that collapse when empty
- **RegionProvider**: Manages user region detection and preferences

### Design System
- **Dark Theme**: Professional sportsbook aesthetic
- **Neon Accents**: Green and purple highlights for interactive elements
- **Live Indicators**: Pulsing animations for live matches
- **Responsive**: Mobile-first design with touch-friendly interactions

## 🌍 Internationalization

The platform supports multiple languages with automatic detection:
- English (default)
- Portuguese
- Spanish
- French
- German

Add new languages by:
1. Creating translation files in `public/locales/[lang]/common.json`
2. Adding language options to `LanguageSwitch.tsx`

## 🔐 Authentication

Authentication is handled by Supabase Auth with support for:
- Email magic-link authentication
- Social providers (Google, Apple) - TODO: Configure in Supabase
- Persistent sessions across browser refreshes

Unauthenticated users can browse matches but cannot access AI insights.

## 📊 Analytics & Ads

### Ad Integration
- Ad slots are implemented but return `null` by default (collapsed)
- Ready for integration with Google AdSense, Amazon Publisher Services, etc.
- GDPR consent management placeholder included

### Analytics
- TODO: Integrate with Google Analytics 4
- TODO: Track user interactions and match views
- TODO: Monitor AI insight engagement

## 🚀 Deployment

### Vercel Deployment
1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Supabase Configuration
1. Enable Row Level Security (RLS) on tables
2. Configure authentication providers
3. Set up Realtime subscriptions for live updates

## ✅ Acceptance Criteria Status

- ✅ **Auth works**: Email magic-link authentication implemented
- ✅ **Home shows fixtures**: Match grid with filters and auto-translation
- ✅ **Region cookie set**: Automatic region detection and storage
- ✅ **Odds pill shows "coming soon"**: Placeholder odds component
- ✅ **Match page streams dummy snapshots**: SSE implementation with 15s intervals
- ✅ **AI Insights render**: Markdown content with confidence bars
- ✅ **AdSlot empty but layout intact**: Collapsible ad slots
- ⏳ **Lighthouse mobile ≥ 90**: TODO - Performance optimization needed
- ✅ **README explains seeding & deploy**: This documentation

## 🔧 TODO Items

### Backend Integration
- [ ] Implement actual IP geolocation service (ipapi.co integration)
- [ ] Set up Supabase Realtime subscriptions for live updates
- [ ] Configure social authentication providers
- [ ] Implement proper API key validation for agent ingestion
- [ ] Add Row Level Security policies

### Agent Integration
- [ ] External AI agent implementation (separate service)
- [ ] Webhook endpoints for real-time analysis ingestion
- [ ] Data validation against JSON schema

### Production Readiness
- [ ] Performance optimization for Lighthouse score
- [ ] Error handling and logging
- [ ] Rate limiting on API endpoints
- [ ] Monitoring and alerting setup
- [ ] GDPR compliance implementation

### Features
- [ ] User profile management
- [ ] Betting odds integration
- [ ] Push notifications for live matches
- [ ] Advanced filtering and search
- [ ] Match statistics visualization

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Check the GitHub Issues
- Review the Supabase documentation
- Consult the Next.js documentation

---

**SPORTSBET INSIGHT v1.0** - Ready to display AI-powered sports insights to the world! 🏆

