// Configuration management with fallbacks and validation
export const config = {
  // Supabase (required in production)
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    isConfigured: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
  },

  // Stripe Payment Processing
  stripe: {
    publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    secretKey: process.env.STRIPE_SECRET_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    priceId: process.env.STRIPE_PRICE_ID || 'price_premium_monthly',
    isConfigured: Boolean(process.env.STRIPE_SECRET_KEY && process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY),
  },

  // AI Agent (external service)
  aiAgent: {
    url: process.env.AI_AGENT_URL,
    secret: process.env.AI_AGENT_SECRET,
    isConfigured: Boolean(process.env.AI_AGENT_URL && process.env.AI_AGENT_SECRET),
  },

  // Football Data APIs
  footballData: {
    apiFootballKey: process.env.FOOTBALL_API_KEY,
    footballDataOrgKey: process.env.FOOTBALL_DATA_ORG_KEY,
    hasApiFootball: Boolean(process.env.FOOTBALL_API_KEY),
    hasFootballDataOrg: Boolean(process.env.FOOTBALL_DATA_ORG_KEY),
    isConfigured: Boolean(process.env.FOOTBALL_API_KEY || process.env.FOOTBALL_DATA_ORG_KEY),
  },

  // App Configuration
  app: {
    name: process.env.NEXT_PUBLIC_APP_NAME || 'BetHub',
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    version: '1.0.0',
  },

  // Internal security
  internal: {
    apiKey: process.env.INTERNAL_API_KEY,
    isConfigured: Boolean(process.env.INTERNAL_API_KEY),
  },

  // Feature flags
  features: {
    enableMockData: process.env.ENABLE_MOCK_DATA === 'true',
    enableAiAnalysis: process.env.ENABLE_AI_ANALYSIS === 'true',
    enablePayments: Boolean(process.env.STRIPE_SECRET_KEY),
    debugMode: process.env.DEBUG_MODE === 'true',
  },

  // Environment detection
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',

  // Validation
  validate() {
    const errors: string[] = [];

    if (!this.supabase.isConfigured) {
      errors.push('Supabase configuration is missing');
    }

    if (this.isProduction && !this.stripe.isConfigured) {
      errors.push('Stripe configuration is required in production');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  },
};

// Runtime validation
export function validateConfig() {
  const validation = config.validate();
  
  if (!validation.isValid) {
    console.error('❌ Configuration errors:', validation.errors);
    if (config.isProduction) {
      throw new Error(`Configuration validation failed: ${validation.errors.join(', ')}`);
    }
  }

  return validation;
} 