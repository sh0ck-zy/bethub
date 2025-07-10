import { providerRegistry } from './registry';
import { mockProviders } from './mock';
import { FootballDataProvider } from './football-data';
import { SportsAPIProvider } from './sports-api';
import type { AppConfig } from '../types';

/**
 * Initialize providers for development environment
 * This file sets up real data provider and mock implementations for other services
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

  // Create multi-source data provider (Football-Data.org + Sports DB + more)
  const multiSourceProvider = new SportsAPIProvider();

  // Register providers - use MULTI-SOURCE data provider, mock others
  providerRegistry.registerProvider('ai', mockProviders.ai);
  providerRegistry.registerProvider('payment', mockProviders.payment);
  providerRegistry.registerProvider('data', multiSourceProvider); // 🔥 MULTI-SOURCE REAL DATA!
  providerRegistry.registerProvider('realtime', mockProviders.realtime);
  providerRegistry.registerProvider('analytics', mockProviders.analytics);

  // Initialize realtime provider
  await mockProviders.realtime.connect();

  console.log('🚀 Development providers initialized successfully');
  console.log('📊 Available services:', {
    ai: 'Mock AI Analysis Provider',
    payment: 'Mock Payment Provider',
    data: '🔥 MULTI-SOURCE Sports API (Football-Data.org + Sports DB)', // Updated!
    realtime: 'Mock Realtime Provider',
    analytics: 'Mock Analytics Provider',
  });

  // Verify providers are accessible
  console.log('🔍 Provider verification:');
  console.log('- AI Provider:', providerRegistry.getAIProvider() ? '✅' : '❌');
  console.log('- Data Provider:', providerRegistry.getDataProvider() ? '✅ MULTI-SOURCE REAL DATA!' : '❌');
  console.log('- Payment Provider:', providerRegistry.getPaymentProvider() ? '✅' : '❌');
  console.log('- Realtime Provider:', providerRegistry.getRealtimeProvider() ? '✅' : '❌');
  console.log('- Analytics Provider:', providerRegistry.getAnalyticsProvider() ? '✅' : '❌');
}

// Auto-initialize in development environment
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  console.log('🔧 Auto-initializing development providers with MULTI-SOURCE REAL DATA...');
  initializeDevelopmentProviders().catch(console.error);
} 