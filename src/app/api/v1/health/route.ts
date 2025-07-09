import { NextResponse } from 'next/server';
import { providerRegistry } from '@/lib/providers/registry';

export async function GET() {
  try {
    const config = providerRegistry.getConfig();
    const featureFlags = providerRegistry.getFeatureFlags();
    
    // Check provider initialization
    const isInitialized = providerRegistry.isInitialized();
    
    // Basic health checks
    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: config.environment,
      version: config.app_name + ' ' + config.version,
      services: {
        providers: isInitialized ? 'healthy' : 'initializing',
        database: 'healthy', // TODO: Add actual database health check
        cache: 'healthy',     // TODO: Add cache health check if applicable
      },
      features: {
        ai_analysis: featureFlags.ai_analysis_enabled,
        realtime_updates: featureFlags.real_time_updates_enabled,
        payments: featureFlags.payment_processing_enabled,
        analytics: featureFlags.advanced_analytics_enabled,
        social: featureFlags.social_features_enabled,
      },
      uptime: process.uptime(),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      },
    };

    return NextResponse.json(health, { status: 200 });
  } catch (error) {
    console.error('Health check failed:', error);
    
    return NextResponse.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: 'Health check failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function HEAD() {
  // Quick health check without response body
  try {
    const isInitialized = providerRegistry.isInitialized();
    return new Response(null, { 
      status: isInitialized ? 200 : 503,
      headers: {
        'X-Health-Status': isInitialized ? 'healthy' : 'initializing',
        'X-Timestamp': new Date().toISOString(),
      }
    });
  } catch (error) {
    return new Response(null, { 
      status: 500,
      headers: {
        'X-Health-Status': 'error',
        'X-Timestamp': new Date().toISOString(),
      }
    });
  }
} 