'use client';

import { useRegion } from './RegionProvider';

interface OddsPillProps {
  matchId: string;
  className?: string;
}

export function OddsPill({ matchId, className = '' }: OddsPillProps) {
  const { region } = useRegion();

  return (
    <div className={`inline-flex items-center px-3 py-1 rounded-full bg-muted text-sm text-muted-foreground ${className}`}>
      Odds for {region} coming soon
    </div>
  );
}

