'use client';

import { createContext, useContext, useEffect, useState } from 'react';

interface RegionContextType {
  region: string | null;
  setRegion: (region: string) => void;
}

const RegionContext = createContext<RegionContextType | undefined>(undefined);

export function RegionProvider({ children }: { children: React.ReactNode }) {
  const [region, setRegionState] = useState<string | null>(null);

  useEffect(() => {
    // Get region from cookie or detect via IP
    const savedRegion = document.cookie
      .split('; ')
      .find(row => row.startsWith('sb_region='))
      ?.split('=')[1];

    if (savedRegion) {
      setRegionState(savedRegion);
    } else {
      // TODO (backend): Implement IP-based region detection
      // For now, default to 'US'
      setRegionState('US');
      document.cookie = `sb_region=US; max-age=${30 * 24 * 60 * 60}; path=/`;
    }
  }, []);

  const setRegion = (newRegion: string) => {
    setRegionState(newRegion);
    document.cookie = `sb_region=${newRegion}; max-age=${30 * 24 * 60 * 60}; path=/`;
  };

  return (
    <RegionContext.Provider value={{ region, setRegion }}>
      {children}
    </RegionContext.Provider>
  );
}

export function useRegion() {
  const context = useContext(RegionContext);
  if (context === undefined) {
    throw new Error('useRegion must be used within a RegionProvider');
  }
  return context;
}

