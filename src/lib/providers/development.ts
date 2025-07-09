import { providerRegistry } from './registry';
import { mockProviders } from './mock';
import type { AppConfig } from '../types';

/**
 * Initialize providers for development environment
 * This file sets up mock implementations for all services
 */
export async function initializeDevelopmentProviders(): Promise<void> {
  const config: Partial<AppConfig> = {
    environment: 'development',
    feature_flags: {
      ai_analysis_enabled: true,
      real_time_updates_enabled: true,
      payment_processing_enabled: true,
      advanced_analytics_enabled: true,
      social_features_enabled: false,
    },
    limits: {
      free_analyses_per_day: 10, // More generous limits for development
      max_real_time_connections: 50,
      api_rate_limit: 1000,
    },
  };

  // Initialize the registry with development config
  await providerRegistry.initialize(config);

  // Register all mock providers
  providerRegistry.registerProvider('ai', mockProviders.ai);
  providerRegistry.registerProvider('payment', mockProviders.payment);
  providerRegistry.registerProvider('data', mockProviders.data);
  providerRegistry.registerProvider('realtime', mockProviders.realtime);
  providerRegistry.registerProvider('analytics', mockProviders.analytics);

  // Initialize realtime provider
  await mockProviders.realtime.connect();

  console.log('🚀 Development providers initialized successfully');
  console.log('📊 Available services:', {
    ai: 'Mock AI Analysis Provider',
    payment: 'Mock Payment Provider',
    data: 'Mock Data Provider',
    realtime: 'Mock Realtime Provider',
    analytics: 'Mock Analytics Provider',
  });

  // Verify providers are accessible
  console.log('🔍 Provider verification:');
  console.log('- AI Provider:', providerRegistry.getAIProvider() ? '✅' : '❌');
  console.log('- Data Provider:', providerRegistry.getDataProvider() ? '✅' : '❌');
  console.log('- Payment Provider:', providerRegistry.getPaymentProvider() ? '✅' : '❌');
  console.log('- Realtime Provider:', providerRegistry.getRealtimeProvider() ? '✅' : '❌');
  console.log('- Analytics Provider:', providerRegistry.getAnalyticsProvider() ? '✅' : '❌');
}

// Auto-initialize in development environment
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  console.log('🔧 Auto-initializing development providers...');
  initializeDevelopmentProviders().catch(console.error);
} 