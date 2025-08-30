# Components

## LiveMatchCard
Default export from `src/components/LiveMatchCard.tsx`

Props:
```ts
{
  matchId: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  currentMinute?: number;
  status: string; // PRE|LIVE|FT|...
  league: string;
  date: string;
  odds?: { home: number; draw: number; away: number };
}
```

Usage:
```tsx
import LiveMatchCard from '@/components/LiveMatchCard';

<LiveMatchCard
  matchId="fd-123"
  homeTeam="Arsenal"
  awayTeam="Chelsea"
  homeScore={0}
  awayScore={0}
  status="PRE"
  league="Premier League"
  date={new Date().toISOString()}
/>
```

## NotificationCenter
Default export from `src/components/NotificationCenter.tsx`

Usage:
```tsx
import NotificationCenter from '@/components/NotificationCenter';

<NotificationCenter />
```

## TeamLogo
Named export from `src/components/TeamLogo.tsx`

Props:
```ts
{ team: string | { name: string; crest?: string }, size?: number, className?: string, logoUrl?: string }
```

## LeagueLogo
Named export from `src/components/LeagueLogo.tsx`

Props:
```ts
{ league: string | { name: string; emblem?: string }, size?: number, className?: string, logoUrl?: string }
```

## CompetitionLogo
Named export from `src/components/CompetitionLogo.tsx`

Props:
```ts
{ competition: string, country?: string, size?: number }
```

## BettingSiteLogo
Named export from `src/components/BettingSiteLogo.tsx`

Props:
```ts
{ site: string | { name: string; logo?: string }, size?: number, className?: string }
```

## UI Primitives (shadcn/ui)
- `Button` from `src/components/ui/button.tsx`
  - Variants: `default | destructive | outline | secondary | ghost | link`
  - Sizes: `default | sm | lg | icon`
- `Badge`, `Card`, `Dialog`, `Input`, `Select`, `Tabs` from `src/components/ui/`