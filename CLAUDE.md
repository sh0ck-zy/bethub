# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
- `pnpm dev` - Start development server with Turbopack
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint

### Schema Generation
- `pnpm run generate:schema` - Generate TypeScript types from JSON schemas (uses json2ts)

## Architecture Overview

### Tech Stack
- **Framework**: Next.js 15.3.3 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4.0 with custom components
- **UI Components**: Radix UI primitives with shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth with magic links
- **Internationalization**: i18next with browser detection

### Project Structure
```
src/
├── app/                    # Next.js App Router
│   ├── api/v1/            # API routes
│   │   ├── today/         # Today's matches endpoint
│   │   ├── match/[id]/    # Match details and streaming
│   │   └── ingest/        # AI agent data ingestion
│   ├── match/[id]/        # Match detail pages
│   └── globals.css        # Global styles with dark theme
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── MatchCard.tsx     # Match display component
│   ├── AnalysisTabs.tsx  # Analysis interface (AI, Stats, Odds)
│   └── AuthModal.tsx     # Authentication modal
├── lib/                  # Utilities
│   ├── supabase.ts       # Supabase client
│   └── teams.ts          # Team data utilities
└── types/                # TypeScript definitions
    └── match-analysis.ts # AI agent response schema
```

### Key Components

#### Match System
- **MatchCard**: Displays match info with team logos, status, and AI insights
- **AnalysisTabs**: Tabbed interface for AI analysis, statistics, and betting odds
- **Match Page**: Full match detail with real-time streaming capability

#### AI Integration
- **Data Schema**: Structured TypeScript interfaces in `src/types/match-analysis.ts`
- **API Endpoints**: `/api/v1/match/[id]` for match data, `/api/v1/ingest/analysis` for AI agent data
- **Streaming**: Server-Sent Events for real-time analysis updates

#### Authentication
- **Supabase Auth**: Magic link authentication with persistent sessions
- **Protected Content**: AI insights require authentication
- **Fallback**: Graceful degradation for unauthenticated users

### Data Flow
1. **Match Data**: Fetched from `/api/v1/today` (with fallback data)
2. **AI Analysis**: External AI agent posts to `/api/v1/ingest/analysis`
3. **Real-time Updates**: SSE stream at `/api/v1/match/[id]/stream`
4. **Client Rendering**: React components consume API data with loading states

### Environment Variables
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `INTERNAL_API_KEY` - Secret key for AI agent ingestion

### Database Schema
- **matches**: Basic match information
- **analysis_snapshots**: AI-generated analysis data with timestamps
- **users**: User authentication and preferences

### Styling System
- **Dark Theme**: Professional sportsbook aesthetic with neon accents
- **Responsive Design**: Mobile-first approach
- **Component Library**: Consistent UI components with Radix UI primitives
- **Animations**: Tailwind CSS animations for live indicators and interactions

### Development Notes
- Uses pnpm as package manager
- Turbopack for fast development builds
- TypeScript strict mode enabled
- ESLint configured for Next.js
- Internationalization ready with i18next
- Fallback systems for missing data or failed API calls