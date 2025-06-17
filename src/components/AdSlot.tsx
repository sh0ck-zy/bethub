'use client';

import { useRegion } from './RegionProvider';

interface AdSlotProps {
  id: string;
  sizes?: [number, number];
  className?: string;
}

export function AdSlot({ id, sizes = [300, 250], className = '' }: AdSlotProps) {
  const { region } = useRegion();

  // TODO (backend): Implement actual ad serving logic
  const getAd = (adId: string) => {
    // For now, return null to collapse the ad slot
    return null;
  };

  const ad = getAd(id);

  if (!ad) {
    return null; // Collapse if no ad
  }

  return (
    <div 
      className={`ad-slot ${className}`}
      style={{ width: sizes[0], height: sizes[1] }}
      data-ad-id={id}
      data-region={region}
    >
      {/* Ad content would go here */}
      <div className="bg-muted border border-dashed border-muted-foreground/20 flex items-center justify-center text-muted-foreground text-sm">
        Ad Slot: {id}
      </div>
    </div>
  );
}

