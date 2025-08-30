# BetHub - AI-Powered Football Analysis Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14.0-black.svg)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18.0-blue.svg)](https://reactjs.org/)

BetHub is an open-source football analysis platform that combines real-time match data with AI-powered insights. This repository contains the open-source frontend and core infrastructure, while proprietary business logic is kept separate.

## 🏗️ Architecture Overview

BetHub follows a **clean architecture** with clear separation between open-source and proprietary components:

### Open Source Components (This Repository)
- 🎨 **UI Components** - Reusable React components with modern design
- 🔧 **Core Infrastructure** - Provider system, type definitions, utilities
- 📱 **Public API** - Health checks and public data endpoints
- 🗄️ **Basic Database Schema** - Teams, leagues, matches, authentication
- 📚 **Documentation** - Setup guides, API docs, contribution guidelines

### Proprietary Components (Separate Repository)
- 🤖 **AI Analysis Engine** - Advanced match analysis and predictions
- 💳 **Payment Processing** - Subscription management and billing
- 📊 **Advanced Analytics** - User behavior tracking and business metrics
- 🔄 **Data Collection** - Real-time sports data integration
- 🛡️ **Security & Fraud Detection** - Advanced security measures

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and pnpm
- Supabase account (for database)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/bethub.git
   cd bethub
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local` with your configuration:
   ```env
   # Database
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   
   # Feature Flags (for development)
   AI_ANALYSIS_ENABLED=true
   REALTIME_ENABLED=true
   PAYMENTS_ENABLED=true
   ANALYTICS_ENABLED=true
   
   # Development Limits
   FREE_ANALYSES_LIMIT=10
   MAX_REALTIME_CONNECTIONS=50
   API_RATE_LIMIT=1000
   ```

4. **Set up the database**
   ```bash
   npx supabase start
   npx supabase db push
   ```

5. **Start the development server**
   ```bash
   pnpm dev
   ```

Visit `http://localhost:3000` to see the application running with mock data.

## 🏛️ Project Structure

```
bethub/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/v1/            # Public API endpoints
│   │   ├── match/[id]/        # Match detail pages
│   │   └── page.tsx           # Homepage
│   │
│   ├── components/            # React Components
│   │   ├── ui/               # Base UI components (shadcn/ui)
│   │   ├── features/         # Feature-specific components
│   │   └── layout/           # Layout components
│   │
│   ├── lib/                  # Core Libraries
│   │   ├── providers/        # Provider system (DI container)
│   │   ├── types/           # TypeScript definitions
│   │   └── utils.ts         # Utility functions
│   │
│   └── hooks/               # Custom React hooks
│       └── useProviders.ts  # Provider access hooks
│
├── supabase/
│   └── migrations/          # Database migrations (public schema)
│
├── docs/                    # Documentation
├── scripts/                 # Build and utility scripts
└── public/                  # Static assets
```

## 🔧 Provider System

BetHub uses a **Provider Registry** pattern to manage dependencies and enable clean separation between open-source and proprietary code.

### Using Providers in Components

```typescript
import { useAIProvider, useDataProvider } from '@/hooks/useProviders';

function MatchAnalysis({ matchId }: { matchId: string }) {
  const { analyzeMatch, isLoading, isEnabled } = useAIProvider();
  const { getMatches } = useDataProvider();
  
  if (!isEnabled) {
    return <div>AI Analysis not available</div>;
  }
  
  // Use the providers...
}
```

### Available Providers

- **`useAIProvider()`** - AI analysis and predictions
- **`useDataProvider()`** - Match data and statistics
- **`usePaymentProvider()`** - Subscription management
- **`useRealtimeProvider()`** - Live updates and notifications
- **`useAnalyticsProvider()`** - User analytics and tracking
- **`useFeatureFlags()`** - Feature flag management

## 🎯 Development Workflow

### Mock Data Development
The application includes comprehensive mock providers for development:

```bash
# All providers are automatically mocked in development
pnpm dev

# Mock data includes:
# - Realistic match data and statistics
# - AI analysis responses with delays
# - Payment processing simulation
# - Real-time updates every 30 seconds
```

### Adding New Features

1. **Define interfaces** in `src/lib/types/index.ts`
2. **Create mock implementation** in `src/lib/providers/mock.ts`
3. **Add to provider registry** in `src/lib/providers/registry.ts`
4. **Create React hooks** in `src/hooks/useProviders.ts`
5. **Build UI components** using the hooks

### Testing

```bash
# Run type checking
pnpm type-check

# Run linting
pnpm lint

# Run tests (when added)
pnpm test
```

## 🔐 Security & Privacy

### What's Open Source ✅
- UI components and layouts
- Provider interfaces and type definitions
- Basic database schema (teams, matches, users)
- Public API endpoints
- Documentation and guides

### What's Proprietary ❌
- AI prompts and analysis algorithms
- Payment processing logic
- User analytics and tracking
- Advanced business rules
- API keys and secrets

## 🤝 Contributing

We welcome contributions to the open-source components! Please see our [Contributing Guide](./docs/CONTRIBUTING.md) for details.

### Areas for Contribution
- 🎨 UI/UX improvements
- 🔧 Performance optimizations
- 📱 Mobile responsiveness
- 🌐 Internationalization
- 📚 Documentation
- 🧪 Testing coverage

## 📚 Documentation

- [Repository Structure](./REPOSITORY_STRUCTURE.md) - Detailed architecture overview
- [Docs Index](./docs/index.md) - Start here for all docs
- [Public API](./docs/api/endpoints.md) - Endpoints, request/response, examples
- [Hooks & Contexts](./docs/frontend/hooks-and-contexts.md) - Usage and examples
- [Components](./docs/frontend/components.md) - Props and usage
- [Services & Libraries](./docs/backend/services-and-lib.md) - Utilities and helpers
- [Core Types](./docs/reference/types.md) - Domain types and errors
- [Contributing Guide](./docs/CONTRIBUTING.md) - How to contribute
- [Deployment Guide](./docs/DEPLOYMENT.md) - Production deployment

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety and better DX
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - High-quality UI components
- **Framer Motion** - Smooth animations

### Backend & Database
- **Supabase** - PostgreSQL database and authentication
- **Next.js API Routes** - Serverless API endpoints
- **Provider Pattern** - Dependency injection system

### Development Tools
- **ESLint & Prettier** - Code linting and formatting
- **Husky** - Git hooks for quality gates
- **TypeScript** - Static type checking
- **pnpm** - Fast, disk space efficient package manager

## 📊 Business Model

BetHub operates on a **freemium model**:

- **Free Tier**: Basic match data and limited AI analysis
- **Premium Tier**: Unlimited AI analysis and real-time updates
- **Pro Tier**: Advanced analytics and betting insights
- **Enterprise**: Custom solutions and API access

## 🔮 Roadmap

### Phase 1: Core Platform ✅
- [x] Modern UI with match cards and analysis tabs
- [x] Provider system architecture
- [x] Mock data for development
- [x] Basic database schema

### Phase 2: MVP Features (In Progress)
- [ ] User authentication and profiles
- [ ] Payment processing integration
- [ ] Real match data integration
- [ ] AI analysis service

### Phase 3: Advanced Features
- [ ] Mobile app (React Native)
- [ ] Social features and community
- [ ] Advanced betting tools
- [ ] Multi-language support

### Phase 4: Scale & Optimize
- [ ] Performance optimization
- [ ] Advanced analytics dashboard
- [ ] API marketplace
- [ ] White-label solutions

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

The open-source components are free to use, modify, and distribute. Proprietary components are subject to separate commercial licensing.

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for the excellent UI components
- [Supabase](https://supabase.com/) for the backend infrastructure
- [Next.js](https://nextjs.org/) team for the amazing framework
- Football data providers for making sports data accessible

## 📞 Support

- 📧 **Email**: support@bethub.com
- 💬 **Discord**: [Join our community](https://discord.gg/bethub)
- 📖 **Documentation**: [docs.bethub.com](https://docs.bethub.com)
- 🐛 **Issues**: [GitHub Issues](https://github.com/yourusername/bethub/issues)

---

**Built with ❤️ by the BetHub team**

