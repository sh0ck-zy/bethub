# Hooks and Contexts

## AuthContext

Provider: `AuthProvider`

Hook: `useAuth()`

Value shape:
```ts
{
  user: { id: string; email: string; role: 'user'|'premium'|'admin'; created_at: string } | null,
  isLoading: boolean,
  isAdmin: boolean,
  isPremium: boolean,
  signIn(email: string, password: string): Promise<void>,
  signUp(email: string, password: string): Promise<void>,
  signOut(): Promise<void>
}
```

Usage:
```tsx
import { AuthProvider, useAuth } from '@/contexts/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Page />
    </AuthProvider>
  );
}

function Page() {
  const { user, signIn, signOut, isAdmin } = useAuth();
  // ...
}
```

## ThemeContext

Provider: `ThemeProvider`

Hook: `useTheme()`

Value shape:
```ts
{ theme: 'light'|'dark', toggleTheme(): void, setTheme(theme: 'light'|'dark'): void }
```

Usage:
```tsx
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <Page />
    </ThemeProvider>
  );
}
```

## Provider Hooks

Source: `src/hooks/useProviders.ts`

### useAIProvider()
Returns:
```ts
{ provider, isLoading, analyzeMatch, generateInsight, getBettingTips, isEnabled }
```

### usePaymentProvider()
Returns:
```ts
{ provider, isLoading, createSubscription, cancelSubscription, getSubscriptionStatus, isEnabled }
```

### useDataProvider()
Returns:
```ts
{ provider, isLoading, getMatches, getLiveScore, getOdds }
```

### useRealtimeProvider()
Returns:
```ts
{ provider, isConnected, isLoading, subscribeToMatch, subscribeToNotifications, sendNotification, isEnabled }
```

### useAnalyticsProvider()
Returns:
```ts
{ provider, isLoading, trackEvent, trackPageView, trackConversion, isEnabled }
```

### useFeatureFlags()
Returns:
```ts
{ flags, isLoading, isEnabled(feature) }
```

### useUsageLimits()
Returns:
```ts
{ limits, isLoading }
```