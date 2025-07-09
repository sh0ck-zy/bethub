# BetHub Repository Structure

## Overview

This repository is structured to separate open-source components from proprietary business logic, following clean architecture principles and enabling AI-native development.

## Directory Structure

```
bethub/
├── README.md                          # Public project overview
├── LICENSE                           # Open source license
├── .gitignore                        # Comprehensive ignore rules
├── package.json                      # Public dependencies only
├── tsconfig.json                     # TypeScript configuration
├── next.config.js                    # Next.js configuration
├── tailwind.config.js               # Tailwind configuration
├── components.json                   # shadcn/ui configuration
│
├── public/                           # Static assets (open source)
│   ├── logos/                        # Team logos and public assets
│   └── locales/                      # Internationalization files
│
├── src/                              # Open source application code
│   ├── app/                          # Next.js app router (public routes)
│   │   ├── layout.tsx               # Root layout
│   │   ├── page.tsx                 # Homepage
│   │   ├── match/                   # Match pages
│   │   └── api/                     # Public API routes only
│   │       └── v1/
│   │           ├── health/          # Health check endpoints
│   │           └── public/          # Public data endpoints
│   │
│   ├── components/                   # Reusable UI components (open source)
│   │   ├── ui/                      # Base UI components (shadcn/ui)
│   │   ├── MatchCard.tsx            # Public match display
│   │   ├── TeamLogo.tsx             # Team logo component
│   │   └── layout/                  # Layout components
│   │
│   ├── lib/                         # Open source utilities
│   │   ├── utils.ts                 # General utilities
│   │   ├── teams.ts                 # Team data and mappings
│   │   ├── supabase.ts              # Supabase client (public)
│   │   └── types/                   # TypeScript type definitions
│   │
│   ├── hooks/                       # Custom React hooks (open source)
│   │   ├── useLocalStorage.ts       # Local storage hook
│   │   └── useDebounce.ts           # Debounce hook
│   │
│   └── styles/                      # Styling (open source)
│       └── globals.css              # Global styles
│
├── supabase/                        # Database schema (open source)
│   ├── migrations/                  # Public schema migrations
│   │   ├── 0001_initial_schema.sql  # Basic tables (teams, leagues, matches)
│   │   └── 0002_auth_schema.sql     # Authentication tables
│   └── config.toml                  # Supabase configuration
│
├── docs/                            # Documentation (open source)
│   ├── CONTRIBUTING.md              # Contribution guidelines
│   ├── DEPLOYMENT.md                # Deployment instructions
│   └── API.md                       # Public API documentation
│
├── scripts/                         # Build and utility scripts (open source)
│   ├── build.js                     # Build script
│   └── test-public.js               # Public functionality tests
│
└── .env.example                     # Environment variables template
```

## Proprietary Code Structure (Not in Git)

```
bethub-core/                         # Proprietary business logic
├── src/
│   ├── ai/                          # AI analysis engine (proprietary)
│   │   ├── providers/               # AI provider integrations
│   │   ├── analysis/                # Analysis algorithms
│   │   ├── prompts/                 # Proprietary prompts
│   │   └── models/                  # Custom AI models
│   │
│   ├── business/                    # Business logic (proprietary)
│   │   ├── payments/                # Stripe integration
│   │   ├── subscriptions/           # Subscription management
│   │   ├── analytics/               # User analytics
│   │   └── fraud/                   # Fraud detection
│   │
│   ├── data/                        # Data processing (proprietary)
│   │   ├── collectors/              # Data collection services
│   │   ├── processors/              # Data processing pipelines
│   │   ├── enrichers/               # Data enrichment
│   │   └── validators/              # Data validation
│   │
│   └── integrations/                # Third-party integrations (proprietary)
│       ├── football-apis/           # Football data providers
│       ├── betting-apis/            # Betting odds providers
│       └── notification-services/   # Push notification services
│
├── migrations/                      # Proprietary database migrations
│   ├── 0003_business_tables.sql     # Subscription, payment tables
│   ├── 0004_analytics_tables.sql    # Analytics and tracking
│   └── 0005_ai_tables.sql           # AI-specific tables
│
└── config/                          # Proprietary configuration
    ├── ai-config.json               # AI provider configurations
    ├── business-rules.json          # Business logic rules
    └── feature-flags.json           # Feature flag configurations
```

## Code Organization Principles

### 1. Clean Architecture
- **Domain Layer**: Core business entities and rules (proprietary)
- **Application Layer**: Use cases and application services (mixed)
- **Infrastructure Layer**: External services and frameworks (mixed)
- **Presentation Layer**: UI components and controllers (mostly open source)

### 2. Dependency Injection
- Use interfaces to decouple open source from proprietary code
- Implement dependency injection for swappable services
- Create abstract factories for proprietary service creation

### 3. Plugin Architecture
- Design proprietary features as plugins
- Use event-driven architecture for loose coupling
- Implement feature flags for gradual rollouts

## Interface Definitions

### AI Analysis Interface
```typescript
// src/lib/types/ai.ts (open source)
export interface AIAnalysisProvider {
  analyzeMatch(matchData: MatchData): Promise<AnalysisResult>;
  generateInsight(prompt: string): Promise<string>;
  getBettingTips(matchData: MatchData): Promise<string[]>;
}

export interface AnalysisResult {
  tacticalInsights: string;
  keyFactors: string[];
  prediction: Prediction;
  confidence: number;
}
```

### Payment Interface
```typescript
// src/lib/types/payments.ts (open source)
export interface PaymentProvider {
  createSubscription(userId: string, planId: string): Promise<Subscription>;
  cancelSubscription(subscriptionId: string): Promise<void>;
  getSubscriptionStatus(userId: string): Promise<SubscriptionStatus>;
}
```

### Data Provider Interface
```typescript
// src/lib/types/data.ts (open source)
export interface DataProvider {
  getMatches(date: Date): Promise<Match[]>;
  getLiveScore(matchId: string): Promise<LiveScore>;
  getOdds(matchId: string): Promise<Odds>;
}
```

## Development Workflow

### 1. Open Source Development
- All UI components, layouts, and public APIs
- Basic data types and interfaces
- Documentation and contribution guidelines
- Public database schema

### 2. Proprietary Development
- Business logic implementation
- AI analysis algorithms
- Payment processing
- Advanced analytics and tracking

### 3. Integration Points
- Use dependency injection to connect layers
- Implement feature flags for proprietary features
- Use environment variables for configuration

## Security Considerations

### What Goes in Git (Open Source)
- ✅ UI components and layouts
- ✅ Public API endpoints
- ✅ Basic database schema
- ✅ Team logos and public assets
- ✅ Type definitions and interfaces
- ✅ Documentation and guides

### What Stays Private
- ❌ AI prompts and algorithms
- ❌ Payment processing logic
- ❌ API keys and secrets
- ❌ Business rules and pricing
- ❌ Analytics and tracking code
- ❌ Fraud detection logic

## Benefits

### For Open Source Community
- Clean, reusable UI components
- Well-documented APIs
- Contribution opportunities
- Learning resource for sports apps

### For Business
- Protected intellectual property
- Flexible deployment options
- Easy feature flag management
- Simplified compliance and auditing

### For Development Team
- Clear separation of concerns
- Easier testing and maintenance
- Better code organization
- AI-friendly codebase structure

## Migration Plan

1. **Phase 1**: Restructure existing code
2. **Phase 2**: Extract proprietary logic
3. **Phase 3**: Implement interfaces
4. **Phase 4**: Set up build pipeline
5. **Phase 5**: Update documentation 