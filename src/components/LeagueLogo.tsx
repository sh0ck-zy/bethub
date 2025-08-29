'use client';

import { useState } from 'react';
// Reliable league logo mapping with multiple CDN sources
const LEAGUE_LOGOS: { [key: string]: string[] } = {
  'Premier League': [
    'https://logos-world.net/wp-content/uploads/2020/06/Premier-League-Logo.png',
    'https://img.uefa.com/imgml/TP/competitions/logos/50x50/GB1.png',
    'https://logoeps.com/wp-content/uploads/2013/03/premier-league-vector-logo.png'
  ],
  'La Liga': [
    'https://logos-world.net/wp-content/uploads/2020/06/LaLiga-Logo.png',
    'https://img.uefa.com/imgml/TP/competitions/logos/50x50/ES1.png'
  ],
  'Primera Division': [
    'https://logos-world.net/wp-content/uploads/2020/06/LaLiga-Logo.png',
    'https://img.uefa.com/imgml/TP/competitions/logos/50x50/ES1.png'
  ],
  'Serie A': [
    'https://logos-world.net/wp-content/uploads/2020/06/Serie-A-Logo.png',
    'https://img.uefa.com/imgml/TP/competitions/logos/50x50/IT1.png'
  ],
  'Bundesliga': [
    'https://logos-world.net/wp-content/uploads/2020/06/Bundesliga-Logo.png',
    'https://img.uefa.com/imgml/TP/competitions/logos/50x50/DE1.png'
  ],
  'Ligue 1': [
    'https://logos-world.net/wp-content/uploads/2020/06/Ligue-1-Logo.png',
    'https://img.uefa.com/imgml/TP/competitions/logos/50x50/FR1.png'
  ],
  'Champions League': [
    'https://logos-world.net/wp-content/uploads/2020/06/UEFA-Champions-League-Logo.png',
    'https://img.uefa.com/imgml/TP/competitions/logos/50x50/1.png'
  ],
  'UEFA Champions League': [
    'https://logos-world.net/wp-content/uploads/2020/06/UEFA-Champions-League-Logo.png',
    'https://img.uefa.com/imgml/TP/competitions/logos/50x50/1.png'
  ],
  'Europa League': [
    'https://logos-world.net/wp-content/uploads/2020/06/UEFA-Europa-League-Logo.png',
    'https://img.uefa.com/imgml/TP/competitions/logos/50x50/2.png'
  ],
  'UEFA Europa League': [
    'https://logos-world.net/wp-content/uploads/2020/06/UEFA-Europa-League-Logo.png',
    'https://img.uefa.com/imgml/TP/competitions/logos/50x50/2.png'
  ],
  'Conference League': [
    'https://img.uefa.com/imgml/TP/competitions/logos/50x50/1001.png',
    'https://logoeps.com/wp-content/uploads/2021/05/uefa-europa-conference-league-vector-logo.png'
  ],
  'UEFA Conference League': [
    'https://img.uefa.com/imgml/TP/competitions/logos/50x50/1001.png',
    'https://logoeps.com/wp-content/uploads/2021/05/uefa-europa-conference-league-vector-logo.png'
  ]
};

function getLeagueLogos(league: string, apiLogoUrl?: string): string[] {
  const logos: string[] = [];
  
  // Highest priority: API-provided logo
  if (apiLogoUrl) {
    logos.push(apiLogoUrl);
  }
  
  // League name to local filename mapping
  const LOCAL_LEAGUE_MAP: { [key: string]: string } = {
    'Premier League': 'premier-league',
    'La Liga': 'la-liga',
    'Primera División': 'la-liga',
    'Serie A': 'serie-a',
    'Bundesliga': 'bundesliga',
    'Ligue 1': 'ligue-1',
    'Champions League': 'champions-league',
    'UEFA Champions League': 'champions-league',
    'Europa League': 'europa-league',
    'UEFA Europa League': 'europa-league',
    'Conference League': 'conference-league',
    'UEFA Conference League': 'conference-league'
  };
  
  // Use mapping or fallback to slug conversion
  const leagueSlug = LOCAL_LEAGUE_MAP[league] || league
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
  
  if (leagueSlug) {
    logos.push(`/logos/leagues/${leagueSlug}.png`);
  }
  
  // Add predefined CDN logos
  const predefinedLogos = LEAGUE_LOGOS[league] || [];
  logos.push(...predefinedLogos);
  
  // Always add fallback placeholder as last option
  logos.push(`https://placehold.co/40x40/6366f1/FFFFFF/png?text=${league.charAt(0)}`);
  return logos;
}

interface LeagueLogoProps {
  league: string | { name: string; emblem?: string };
  size?: number;
  className?: string;
  // API-provided logo URL (highest priority)  
  logoUrl?: string;
}

export const LeagueLogo = ({ league, size = 40, className = '', logoUrl }: LeagueLogoProps) => {
  const [currentLogoIndex, setCurrentLogoIndex] = useState(0);
  const [allLogosExhausted, setAllLogosExhausted] = useState(false);
  
  // Extract league name and logo URLs
  const leagueName = typeof league === 'string' ? league : league.name;
  const logoUrls = getLeagueLogos(leagueName, logoUrl);
  
  // If league object has emblem, use it as first option
  if (typeof league === 'object' && league.emblem) {
    logoUrls.unshift(league.emblem);
  }
  
  // Generate initials for fallback
  const initials = leagueName
    .split(' ')
    .map(word => word[0])
    .join('')
    .slice(0, 3)
    .toUpperCase();
  
  const handleImageError = () => {
    const nextIndex = currentLogoIndex + 1;
    if (nextIndex < logoUrls.length) {
      setCurrentLogoIndex(nextIndex);
    } else {
      setAllLogosExhausted(true);
    }
  };
  
  // Show initials if all logos failed to load
  if (allLogosExhausted) {
    return (
      <div
        className={`flex items-center justify-center text-white font-bold rounded-full flex-shrink-0 ${className}`}
        style={{ 
          width: size, 
          height: size,
          backgroundColor: '#6366f1', // Purple for leagues
          fontSize: size * 0.25
        }}
        title={leagueName}
      >
        {initials}
      </div>
    );
  }
  
  return (
    <img
      src={logoUrls[currentLogoIndex]}
      alt={`${leagueName} logo`}
      width={size}
      height={size}
      onError={handleImageError}
      className={`rounded-full object-contain flex-shrink-0 bg-white p-1 ${className}`}
      title={leagueName}
    />
  );
};