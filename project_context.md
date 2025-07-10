# BetHub Project Context

*Last Updated: December 28, 2024*

## 🎯 **Project Overview**

**BetHub** is an AI-powered sports analysis platform focused on football (soccer) match insights. The platform provides intelligent, data-driven analysis to help users understand match dynamics without pushing betting decisions.

### **Core Value Proposition**
- **AI Tactical Analysis**: Formation breakdowns, player impacts, tactical mismatches
- **Specific Insights**: "Without Van Dijk, Liverpool concede 40% more goals" 
- **Mobile-First**: Clean, thumb-friendly interface optimized for mobile consumption
- **Freemium Model**: Free tier with limited access, premium for unlimited analysis

### **Target User Journey**
```
User sees match card → Reads compelling insight → Clicks for full analysis → 
Gets hooked by specific details → Upgrades to premium for unlimited access
```

## 🏗️ **Technical Architecture**

### **Current Tech Stack**
- **Frontend**: Next.js 15.3.3 with App Router, TypeScript, Tailwind CSS 4.0
- **UI Components**: Radix UI primitives with shadcn/ui
- **Database**: Supabase (PostgreSQL) with RLS
- **Authentication**: Supabase Auth with magic links
- **Styling**: Mobile-first responsive design with dark sportsbook theme
- **Deployment**: Vercel (live at https://bethub-nu.vercel.app/)

### **Project Structure**
```
src/
├── app/                    # Next.js App Router pages
│   ├── api/v1/            # API routes with fallback data
│   ├── match/[id]/        # Match detail pages
│   ├── admin/             # Admin panel for content management
│   └── page.tsx           # Homepage with match listings
├── components/            # React components
│   ├── ui/               # shadcn/ui base components
│   ├── Layout/           # Header/Footer components
│   ├── MatchCard.tsx     # Match display with AI insights
│   ├── AnalysisTabs.tsx  # Analysis interface
│   └── AuthModal.tsx     # Authentication modal
├── lib/                  # Utilities and services
│   ├── supabase.ts       # Database client
│   ├── auth.ts           # Authentication service
│   └── config.ts         # Configuration management
└── types/                # TypeScript definitions
```

### **Database Schema**
```sql
-- Core tables
matches: id, league, home_team, away_team, kickoff_utc, status, is_published
analysis_snapshots: id, match_id, snapshot_ts, payload (jsonb)
profiles: id, email, role (user/admin), subscription_status
```

## 🎨 **Design System & UX Philosophy**

### **Design Principles**
- **Mobile-First**: All components designed for thumb navigation
- **Clean & Minimal**: Remove visual noise, focus on content
- **Intelligent Content**: No generic insights like "both teams are strong"
- **Progressive Enhancement**: Graceful degradation when services fail

### **Visual Design**
- **Color Palette**: Blue (#3B82F6) to Purple (#8B5CF6) gradients, dark theme
- **Typography**: Mobile-optimized font sizes (14px+ on mobile)
- **Cards**: Subtle shadows, rounded corners, hover effects
- **Touch Targets**: 44px minimum for mobile accessibility

### **User States & Content Strategy**
```
Unauthenticated User:
- Hero: "AI-Powered Match Analysis"
- CTA: "Sign up for free analysis"
- Content: Basic insights visible

Authenticated Free User:
- Hero: "Welcome back, [name]"
- Usage: "1 analysis remaining today"
- CTA: "Upgrade to unlimited access"

Premium User:
- Hero: "Premium Access Active"
- Badge: Crown icon + "Premium" badge
- Content: Full tactical breakdowns, live updates
```

## 🤖 **AI & Content Strategy**

### **Content Structure Philosophy**
**The "Hook-Insight-Action" Model:**
1. **Hook (5 seconds)**: "Van Dijk absence could decide this clash"
2. **Insight (30 seconds)**: "Without their defensive leader, Liverpool concede 40% more goals"
3. **Action**: "Watch for United's pace on the counter-attack"

### **AI Analysis Framework**
- **Templates**: Specific insight types (defensive_weakness, key_player_impact, historical_pattern)
- **Quality Gates**: Confidence scoring, specificity checks, factual validation
- **External Agent**: Separate private service for AI analysis generation
- **Webhook Integration**: `/api/v1/ingest/analysis` for receiving AI-generated content

### **Content Quality Rules**
```
✅ Good Examples:
- "Without Van Dijk, Liverpool concede 40% more goals (1.8 vs 1.1 per game)"
- "Rashford has 5 goals in 3 games vs Liverpool, all from counter-attacks"

❌ Bad Examples:
- "Both teams are strong and this will be close"
- "Form goes out the window in this fixture"
- "Manchester City are favorites"
```

## 💰 **Business Model & Monetization**

### **Freemium Structure**
- **Free Tier**: 1 analysis per day, basic insights
- **Premium ($9.99/month)**: Unlimited analysis, tactical breakdowns, live updates
- **Single Unlock**: $2.99 per analysis for casual users

### **Revenue Streams**
1. **Premium Subscriptions**: Primary revenue source
2. **Single Analysis Purchases**: Impulse buys for big matches
3. **Betting House Partnerships**: Regional bookmaker integrations (future)
4. **API Access**: Developer tier for accessing analysis data (future)

### **Growth Strategy**
- **Target**: 5% conversion rate (free → premium)
- **Viral Mechanics**: Social sharing of specific insights
- **SEO**: "[Team] vs [Team] prediction" content strategy
- **Regional Expansion**: Start Portugal, expand globally

## 🔄 **Current Development Status**

### **✅ Completed (Production Ready)**
- Core platform architecture with Next.js + Supabase
- Authentication system with user roles (user/admin)
- Admin panel for match management and AI triggers
- Mobile-optimized match cards with intelligent insights
- Homepage with user state management
- Consistent header/footer across all pages
- Graceful fallback system when services are unavailable

### **🔄 In Progress**
- Premium payment integration (Stripe)
- AI agent webhook system for real analysis
- Match detail page optimization
- User dashboard for account management

### **❌ Still Needed**
- Real football data API integration (API-Football)
- External AI agent implementation
- Payment processing and subscription management
- Live match updates via Server-Sent Events
- Advanced analytics and user tracking

## 🚀 **Deployment & Configuration**

### **Live Environment**
- **URL**: https://bethub-nu.vercel.app/
- **Status**: Demo with intelligent fallback data
- **Performance**: Mobile-optimized, fast loading

### **Configuration Management**
```typescript
// Feature flags for different environments
ENABLE_MOCK_DATA=true          // Use fallback data
ENABLE_AI_ANALYSIS=false       // Enable AI agent integration
ENABLE_PAYMENTS=false          // Enable Stripe integration
```

### **Environment Variables Required**
```bash
# Supabase (Database & Auth)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# AI Agent (External Service)
AI_AGENT_URL=
AI_AGENT_SECRET=

# Football Data APIs
FOOTBALL_API_KEY=              # API-Football
FOOTBALL_DATA_ORG_KEY=         # Football-Data.org

# Payments
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
```

## 🎯 **Immediate Priorities**

### **Phase 1: Complete Core Platform (Next 2 weeks)**
1. **Match Detail Page**: Complete the analysis experience with premium upsells
2. **Payment Integration**: Stripe subscription flow with usage tracking
3. **User Dashboard**: Account management and subscription status
4. **AI Webhook System**: Ready for external AI agent integration

### **Phase 2: Real Data Integration (Week 3-4)**
1. **Football API**: Integrate API-Football for real match data
2. **AI Agent**: Deploy external analysis service
3. **Live Updates**: Server-Sent Events for real-time match analysis
4. **Quality Control**: Analysis validation and confidence scoring

### **Phase 3: Growth & Optimization (Month 2)**
1. **Analytics**: User behavior tracking and conversion optimization
2. **SEO**: Content strategy for organic growth
3. **Regional Expansion**: Localized betting house integrations
4. **Performance**: Advanced caching and optimization

## 📊 **Success Metrics**

### **Technical KPIs**
- Lighthouse mobile score: >90
- Page load time: <3 seconds
- Uptime: 99.9%
- Mobile conversion rate: >3%

### **Business KPIs**
- User registration: 100+ in first month
- Free-to-premium conversion: 5%
- Average session time: 5+ minutes
- Weekly active users: 30% retention

### **Content Quality KPIs**
- AI insight accuracy: 85%+ post-match validation
- User "helpful" ratings: 70%+
- Specific stats per analysis: 3+
- Zero generic insights published

## 🔮 **Future Vision**

### **6-Month Goals**
- 10,000+ monthly active users
- $10,000+ monthly recurring revenue
- Expansion to top 5 European leagues
- API partnerships with sports media companies

### **12-Month Goals**
- White-label platform for regional sports media
- Mobile app with push notifications
- Multi-sport expansion (basketball, tennis)
- $100,000+ monthly recurring revenue

## 📝 **Key Decisions & Lessons Learned**

### **Architecture Decisions**
- **Why Supabase**: Fast setup, great auth, real-time capabilities
- **Why Mobile-First**: 70%+ of sports content consumed on mobile
- **Why External AI Agent**: Keeps competitive advantage separate from open-source platform
- **Why Freemium**: Allows rapid user acquisition with clear upgrade path

### **UX Decisions**
- **Consistent Header/Footer**: Builds trust and reliability
- **User State Awareness**: Different content for different user types
- **Smart Fallbacks**: Platform works even when external services fail
- **Touch-Friendly Design**: 44px minimum touch targets for mobile

### **Content Strategy Decisions**
- **Specific Over Generic**: "40% more goals" vs "weak defense"
- **Actionable Insights**: Always end with "what to watch for"
- **Context-Aware**: Different insights for different team matchups
- **Confidence Scoring**: Show AI confidence to build trust

---

## 🔄 **Update Log**

**December 28, 2024**: Initial project context creation
- Documented current architecture and design system
- Established content strategy and user state management
- Defined immediate priorities and success metrics
- Created foundation for future AI assistant handoffs

---

*This document should be updated whenever major architectural decisions are made, new features are implemented, or business strategy evolves.*