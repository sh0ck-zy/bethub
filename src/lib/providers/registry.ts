/**
 * Provider Registry - Simplified Implementation
 * Manages provider dependencies for the application
 */

import { FootballDataProvider } from './football-data';
import { MockAIAnalysisProvider, MockPaymentProvider, MockRealtimeProvider, MockAnalyticsProvider } from './mock';
import type { 
  DataProvider, 
  AIAnalysisProvider, 
  PaymentProvider, 
  RealtimeProvider, 
  AnalyticsProvider,
  FeatureFlags 
} from '../types';

class ProviderRegistry {
  private dataProvider: DataProvider | null = null;
  private aiProvider: AIAnalysisProvider | null = null;
  private paymentProvider: PaymentProvider | null = null;
  private realtimeProvider: RealtimeProvider | null = null;
  private analyticsProvider: AnalyticsProvider | null = null;
  private initialized = false;

  constructor() {
    this.initialize();
  }

  private initialize() {
    // Initialize with default providers
    this.dataProvider = new FootballDataProvider();
    this.aiProvider = new MockAIAnalysisProvider();
    this.paymentProvider = new MockPaymentProvider();
    this.realtimeProvider = new MockRealtimeProvider();
    this.analyticsProvider = new MockAnalyticsProvider();
    this.initialized = true;
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  getDataProvider(): DataProvider | null {
    return this.dataProvider;
  }

  getAIProvider(): AIAnalysisProvider | null {
    return this.aiProvider;
  }

  getPaymentProvider(): PaymentProvider | null {
    return this.paymentProvider;
  }

  getRealtimeProvider(): RealtimeProvider | null {
    return this.realtimeProvider;
  }

  getAnalyticsProvider(): AnalyticsProvider | null {
    return this.analyticsProvider;
  }
}

// Global registry instance
export const providerRegistry = new ProviderRegistry();

// Convenience functions
export function getDataProvider(): DataProvider | null {
  return providerRegistry.getDataProvider();
}

export function getAIProvider(): AIAnalysisProvider | null {
  return providerRegistry.getAIProvider();
}

export function getPaymentProvider(): PaymentProvider | null {
  return providerRegistry.getPaymentProvider();
}

export function getRealtimeProvider(): RealtimeProvider | null {
  return providerRegistry.getRealtimeProvider();
}

export function getAnalyticsProvider(): AnalyticsProvider | null {
  return providerRegistry.getAnalyticsProvider();
}

// Feature flags - simplified
export function getFeatureFlags(): FeatureFlags {
  return {
    ai_analysis_enabled: false,
    real_time_updates_enabled: true,
    payment_processing_enabled: true,
    advanced_analytics_enabled: true,
    social_features_enabled: false
  };
}

export function getLimits() {
  return {
    requests_per_minute: 100,
    matches_per_day: 1000,
    api_calls_per_hour: 1000
  };
}

export function isFeatureEnabled(feature: string): boolean {
  const flags = getFeatureFlags();
  return (flags as any)[feature] || false;
}
