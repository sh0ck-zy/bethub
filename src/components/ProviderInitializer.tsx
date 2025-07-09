'use client';

import { useEffect } from 'react';

export function ProviderInitializer() {
  useEffect(() => {
    // Import and initialize development providers
    const initializeProviders = async () => {
      if (process.env.NODE_ENV === 'development') {
        try {
          const { initializeDevelopmentProviders } = await import('@/lib/providers/development');
          await initializeDevelopmentProviders();
        } catch (error) {
          console.error('Failed to initialize development providers:', error);
        }
      }
    };

    initializeProviders();
  }, []);

  return null; // This component doesn't render anything
} 