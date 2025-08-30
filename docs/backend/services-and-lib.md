# Services and Libraries

## Stripe Helpers (`src/lib/stripe.ts`)
- `isStripeConfigured(): boolean`
- `getStripe(): Stripe`
- `createCheckoutSession(userId: string, email: string)`
- `createCustomerPortalSession(customerId: string)`
- `getSubscription(subscriptionId: string)`
- `cancelSubscription(subscriptionId: string)`

Env vars: `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_ID`, `NEXT_PUBLIC_APP_URL`

## Supabase Clients
- Browser: `supabase` from `src/lib/supabase.ts`
- Server: `getSupabaseServer()`, `isSupabaseConfigured()` from `src/lib/supabase-server.ts`

## Auth Service (`src/lib/auth.ts`)
- `signUp(email, password)`
- `signIn(email, password)`
- `signOut()`
- `getCurrentUser(): Promise<UserProfile|null>`
- `isAdmin(): Promise<boolean>`
- `promoteToAdmin(userId)`
- `checkAdminFromRequest(request)`
- `getAuthToken()`
- `onAuthStateChange(callback)`

## Admin Protection (`src/lib/admin-protection.ts`)
- `requireAdmin(request)` -> `NextResponse | null`
- `withAdminProtection(handler)` -> guarded handler

## Ads Utilities (`src/lib/ads.ts`)
- `getAd(adSlotId, region?)` -> `AdCreative | null`
- `initializeAds()`
- `trackAdImpression(adId, region?)`
- `trackAdClick(adId, region?)`

## Consent (CMP) (`src/lib/cmp.ts`)
- `initializeCMP()`
- `updateConsent({ analytics, advertising, functional })`
- `showConsentBanner()`

## Config (`src/lib/config.ts`)
- `config` object with sections: `supabase`, `stripe`, `aiAgent`, `footballData`, `app`, `internal`, `features`
- `validateConfig()` -> `{ isValid, errors }`