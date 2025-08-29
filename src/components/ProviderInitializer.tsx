'use client';

import { useEffect } from 'react';

export function ProviderInitializer() {
  useEffect(() => {
    // Development providers have been removed
    // This component is kept for potential future provider initialization
  }, []);

  return null; // This component doesn't render anything
} 