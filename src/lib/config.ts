// Configuration management with fallbacks and validation
export const config = {
  // Supabase (required in production)
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    isConfigured: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
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

  // Internal security
  internal: {
    apiKey: process.env.INTERNAL_API_KEY,
    isConfigured: Boolean(process.env.INTERNAL_API_KEY),
  },

  // Feature flags
  features: {
    enableMockData: process.env.ENABLE_MOCK_DATA === 'true',
    enableAiAnalysis: process.env.ENABLE_AI_ANALYSIS === 'true',
    debugMode: process.env.DEBUG_MODE === 'true',
  },

  // Environment detection
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',

  // Validation helper
  validate() {
    const errors: string[] = [];
    
    if (this.isProduction) {
      if (!this.supabase.isConfigured) {
        errors.push('Supabase configuration required in production');
      }
      if (!this.internal.isConfigured) {
        errors.push('Internal API key required in production');
      }
      if (!this.footballData.isConfigured && !this.features.enableMockData) {
        errors.push('Football data API required when mock data is disabled');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings: this.getWarnings(),
    };
  },

  getWarnings() {
    const warnings: string[] = [];
    
    if (!this.aiAgent.isConfigured) {
      warnings.push('AI Agent not configured - analysis will be disabled');
    }
    
    if (this.features.enableMockData && this.isProduction) {
      warnings.push('Mock data enabled in production environment');
    }

    return warnings;
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

  if (validation.warnings.length > 0) {
    console.warn('⚠️ Configuration warnings:', validation.warnings);
  }

  return validation;
} 