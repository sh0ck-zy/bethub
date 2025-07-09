import type {
  AIAnalysisProvider,
  PaymentProvider,
  DataProvider,
  RealtimeProvider,
  AnalyticsProvider,
  AppConfig,
  FeatureFlags
} from '../types';

/**
 * Provider Registry - Manages all proprietary service implementations
 * This is the bridge between open source and proprietary code
 */
export class ProviderRegistry {
  private static instance: ProviderRegistry;
  private providers: Map<string, any> = new Map();
  private config: AppConfig;
  private initialized = false;

  private constructor() {
    this.config = this.getDefaultConfig();
  }

  static getInstance(): ProviderRegistry {
    if (!ProviderRegistry.instance) {
      ProviderRegistry.instance = new ProviderRegistry();
    }
    return ProviderRegistry.instance;
  }

  /**
   * Initialize the registry with proprietary implementations
   * This method is called by the proprietary code during app startup
   */
  async initialize(config?: Partial<AppConfig>): Promise<void> {
    if (this.initialized) return;

    // Merge provided config with defaults
    this.config = { ...this.config, ...config };

    // Initialize providers based on environment and feature flags
    await this.initializeProviders();

    this.initialized = true;
  }

  /**
   * Register a provider implementation
   */
  registerProvider<T>(key: string, provider: T): void {
    this.providers.set(key, provider);
  }

  /**
   * Get a provider by key
   */
  getProvider<T>(key: string): T | null {
    return this.providers.get(key) || null;
  }

  /**
   * Get AI Analysis provider
   */
  getAIProvider(): AIAnalysisProvider | null {
    return this.getProvider<AIAnalysisProvider>('ai');
  }

  /**
   * Get Payment provider
   */
  getPaymentProvider(): PaymentProvider | null {
    return this.getProvider<PaymentProvider>('payment');
  }

  /**
   * Get Data provider
   */
  getDataProvider(): DataProvider | null {
    return this.getProvider<DataProvider>('data');
  }

  /**
   * Get Realtime provider
   */
  getRealtimeProvider(): RealtimeProvider | null {
    return this.getProvider<RealtimeProvider>('realtime');
  }

  /**
   * Get Analytics provider
   */
  getAnalyticsProvider(): AnalyticsProvider | null {
    return this.getProvider<AnalyticsProvider>('analytics');
  }

  /**
   * Get current configuration
   */
  getConfig(): AppConfig {
    return this.config;
  }

  /**
   * Get feature flags
   */
  getFeatureFlags(): FeatureFlags {
    return this.config.feature_flags;
  }

  /**
   * Check if a feature is enabled
   */
  isFeatureEnabled(feature: keyof FeatureFlags): boolean {
    return this.config.feature_flags[feature] || false;
  }

  /**
   * Get usage limits
   */
  getLimits() {
    return this.config.limits;
  }

  /**
   * Check if the registry is initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Initialize providers based on configuration
   */
  private async initializeProviders(): Promise<void> {
    // This method will be extended by proprietary code
    // For now, we just log that initialization is happening
    console.log('Initializing providers with config:', {
      environment: this.config.environment,
      features: Object.keys(this.config.feature_flags).filter(
        key => this.config.feature_flags[key as keyof FeatureFlags]
      )
    });
  }

  /**
   * Get default configuration
   */
  private getDefaultConfig(): AppConfig {
    return {
      app_name: 'BetHub',
      version: '1.0.0',
      environment: (process.env.NODE_ENV as any) || 'development',
      feature_flags: {
        ai_analysis_enabled: process.env.AI_ANALYSIS_ENABLED === 'true',
        real_time_updates_enabled: process.env.REALTIME_ENABLED === 'true',
        payment_processing_enabled: process.env.PAYMENTS_ENABLED === 'true',
        advanced_analytics_enabled: process.env.ANALYTICS_ENABLED === 'true',
        social_features_enabled: process.env.SOCIAL_FEATURES_ENABLED === 'true',
      },
      limits: {
        free_analyses_per_day: parseInt(process.env.FREE_ANALYSES_LIMIT || '3'),
        max_real_time_connections: parseInt(process.env.MAX_REALTIME_CONNECTIONS || '10'),
        api_rate_limit: parseInt(process.env.API_RATE_LIMIT || '100'),
      },
    };
  }
}

// Export singleton instance
export const providerRegistry = ProviderRegistry.getInstance();

// Convenience functions for accessing providers
export const getAIProvider = () => providerRegistry.getAIProvider();
export const getPaymentProvider = () => providerRegistry.getPaymentProvider();
export const getDataProvider = () => providerRegistry.getDataProvider();
export const getRealtimeProvider = () => providerRegistry.getRealtimeProvider();
export const getAnalyticsProvider = () => providerRegistry.getAnalyticsProvider();
export const getConfig = () => providerRegistry.getConfig();
export const getFeatureFlags = () => providerRegistry.getFeatureFlags();
export const isFeatureEnabled = (feature: keyof FeatureFlags) => providerRegistry.isFeatureEnabled(feature);
export const getLimits = () => providerRegistry.getLimits();

// Hook for React components
export const useProvider = <T>(key: string): T | null => {
  return providerRegistry.getProvider<T>(key);
};

// Hook for feature flags
export const useFeatureFlag = (feature: keyof FeatureFlags): boolean => {
  return providerRegistry.isFeatureEnabled(feature);
};

// Initialize providers on module load in non-test environments
if (process.env.NODE_ENV !== 'test') {
  // Initialize in both client and server environments
  if (typeof window !== 'undefined') {
    // Client-side initialization
    import('./development').then(({ initializeDevelopmentProviders }) => {
      initializeDevelopmentProviders().catch(console.error);
    }).catch(console.error);
  } else {
    // Server-side initialization
    if (process.env.NODE_ENV === 'development') {
      import('./development').then(({ initializeDevelopmentProviders }) => {
        initializeDevelopmentProviders().catch(console.error);
      }).catch(console.error);
    }
  }
} 