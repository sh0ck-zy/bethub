'use client';

import Image from 'next/image';
import { TEAMS } from '@/lib/teams';
import { useState } from 'react';

interface TeamLogoProps {
  team: string;
  size?: number; // pixel size
}

export const TeamLogo = ({ team, size = 40 }: TeamLogoProps) => {
  const [imageError, setImageError] = useState(false);
  const data = TEAMS[team as keyof typeof TEAMS];

  if (!data || !data.logo || imageError) {
    const initials = team.split(' ').map(w => w[0]).join('').slice(0, 2);
    return (
      <div
        className="flex items-center justify-center text-xs font-bold text-white rounded-full flex-shrink-0"
        style={{ 
          width: size, 
          height: size,
          backgroundColor: data?.primary || '#64748b',
          border: `2px solid ${data?.primary || '#64748b'}40`
        }}
      >
        {initials}
      </div>
    );
  }

  return (
    <div 
      className="flex items-center justify-center flex-shrink-0"
      style={{ width: size, height: size }}
    >
      <Image
        src={data.logo}
        alt={`${team} crest`}
        width={size}
        height={size}
        className="object-contain max-w-full max-h-full"
        priority
        onError={() => setImageError(true)}
      />
    </div>
  );
};

// Helper function to get team colors for styling
export const getTeamColor = (teamName: string) => {
  const data = TEAMS[teamName as keyof typeof TEAMS];
  return data?.primary || '#64748b'; // fallback to slate-500
}; 