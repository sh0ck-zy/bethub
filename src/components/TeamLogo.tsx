'use client';

import { useState } from 'react';

interface TeamLogoProps {
  team: string | { name: string; crest?: string };
  size?: number;
  className?: string;
  // API-provided logo URL (highest priority)
  logoUrl?: string;
  variant?: 'circle' | 'plain';
}

// Reliable team logo mapping using multiple CDN sources
// NOTE: UEFA team IDs have been corrected based on verification
const TEAM_LOGOS: { [key: string]: string[] } = {
  // Premier League (multiple name variations)
  'Arsenal': ['https://logos-world.net/wp-content/uploads/2020/06/Arsenal-Logo.png', 'https://img.uefa.com/imgml/TP/teams/logos/50x50/52280.png'],
  'Arsenal FC': ['https://logos-world.net/wp-content/uploads/2020/06/Arsenal-Logo.png', 'https://img.uefa.com/imgml/TP/teams/logos/50x50/52280.png'],
  'Chelsea': ['https://logos-world.net/wp-content/uploads/2020/06/Chelsea-Logo.png', 'https://img.uefa.com/imgml/TP/teams/logos/50x50/52914.png'],
  'Chelsea FC': ['https://logos-world.net/wp-content/uploads/2020/06/Chelsea-Logo.png', 'https://img.uefa.com/imgml/TP/teams/logos/50x50/52914.png'],
  'Liverpool': [
    'https://img.uefa.com/imgml/TP/teams/logos/50x50/7889.png',
    'https://logos-world.net/wp-content/uploads/2020/06/Liverpool-Logo.png',
    'https://cdn.freebiesupply.com/logos/large/2x/liverpool-fc-logo-png-transparent.png'
  ],
  'Liverpool FC': [
    'https://img.uefa.com/imgml/TP/teams/logos/50x50/7889.png',
    'https://logos-world.net/wp-content/uploads/2020/06/Liverpool-Logo.png',
    'https://cdn.freebiesupply.com/logos/large/2x/liverpool-fc-logo-png-transparent.png'
  ],
  // FIXED: Manchester United - using multiple reliable sources
  'Manchester United': [
    'https://img.uefa.com/imgml/TP/teams/logos/50x50/985.png',
    'https://cdn.freebiesupply.com/logos/large/2x/manchester-united-fc-logo-png-transparent.png',
    'https://logos-world.net/wp-content/uploads/2020/06/Manchester-United-Logo.png'
  ],
  'Manchester United FC': [
    'https://img.uefa.com/imgml/TP/teams/logos/50x50/985.png',
    'https://cdn.freebiesupply.com/logos/large/2x/manchester-united-fc-logo-png-transparent.png',
    'https://logos-world.net/wp-content/uploads/2020/06/Manchester-United-Logo.png'
  ],
  'Manchester City': ['https://logos-world.net/wp-content/uploads/2020/06/Manchester-City-Logo.png', 'https://img.uefa.com/imgml/TP/teams/logos/50x50/52919.png'],
  'Manchester City FC': ['https://logos-world.net/wp-content/uploads/2020/06/Manchester-City-Logo.png', 'https://img.uefa.com/imgml/TP/teams/logos/50x50/52919.png'],
  'Tottenham': ['https://logos-world.net/wp-content/uploads/2020/06/Tottenham-Logo.png', 'https://img.uefa.com/imgml/TP/teams/logos/50x50/52255.png'],
  'Tottenham Hotspur FC': ['https://logos-world.net/wp-content/uploads/2020/06/Tottenham-Logo.png', 'https://img.uefa.com/imgml/TP/teams/logos/50x50/52255.png'],

  // La Liga
  'Real Madrid': ['https://logos-world.net/wp-content/uploads/2020/06/Real-Madrid-Logo.png', 'https://img.uefa.com/imgml/TP/teams/logos/50x50/50051.png'],
  'Real Madrid CF': ['https://logos-world.net/wp-content/uploads/2020/06/Real-Madrid-Logo.png', 'https://img.uefa.com/imgml/TP/teams/logos/50x50/50051.png'],
  'Barcelona': ['https://logos-world.net/wp-content/uploads/2020/06/Barcelona-Logo.png', 'https://img.uefa.com/imgml/TP/teams/logos/50x50/50080.png'],
  'FC Barcelona': ['https://logos-world.net/wp-content/uploads/2020/06/Barcelona-Logo.png', 'https://img.uefa.com/imgml/TP/teams/logos/50x50/50080.png'],
  'Atletico Madrid': ['https://logos-world.net/wp-content/uploads/2020/06/Atletico-Madrid-Logo.png', 'https://img.uefa.com/imgml/TP/teams/logos/50x50/50124.png'],
  'Club Atlético de Madrid': ['https://logos-world.net/wp-content/uploads/2020/06/Atletico-Madrid-Logo.png', 'https://img.uefa.com/imgml/TP/teams/logos/50x50/50124.png'],

  // Serie A
  'Juventus': ['https://logos-world.net/wp-content/uploads/2020/06/Juventus-Logo.png', 'https://img.uefa.com/imgml/TP/teams/logos/50x50/50139.png'],
  'AC Milan': ['https://logos-world.net/wp-content/uploads/2020/06/AC-Milan-Logo.png', 'https://img.uefa.com/imgml/TP/teams/logos/50x50/50058.png'],
  'Inter Milan': ['https://logos-world.net/wp-content/uploads/2020/06/Inter-Milan-Logo.png', 'https://img.uefa.com/imgml/TP/teams/logos/50x50/50138.png'],
  'AS Roma': ['https://logos-world.net/wp-content/uploads/2020/06/AS-Roma-Logo.png', 'https://img.uefa.com/imgml/TP/teams/logos/50x50/52723.png'],
  'Napoli': ['https://logos-world.net/wp-content/uploads/2020/06/Napoli-Logo.png', 'https://img.uefa.com/imgml/TP/teams/logos/50x50/52259.png'],

  // Bundesliga
  'Bayern Munich': [
    'https://img.uefa.com/imgml/TP/teams/logos/50x50/50037.png',
    'https://cdn.freebiesupply.com/logos/large/2x/bayern-munich-logo-png-transparent.png',
    'https://logos-world.net/wp-content/uploads/2020/06/Bayern-Munich-Logo.png'
  ],
  'Borussia Dortmund': [
    'https://img.uefa.com/imgml/TP/teams/logos/50x50/52758.png',
    'https://cdn.freebiesupply.com/logos/large/2x/borussia-dortmund-logo-png-transparent.png',
    'https://logos-world.net/wp-content/uploads/2020/06/Borussia-Dortmund-Logo.png'
  ],
  'RB Leipzig': ['https://logos-world.net/wp-content/uploads/2020/06/RB-Leipzig-Logo.png', 'https://img.uefa.com/imgml/TP/teams/logos/50x50/2603790.png'],

  // Ligue 1
  'PSG': ['https://logos-world.net/wp-content/uploads/2020/06/PSG-Logo.png', 'https://img.uefa.com/imgml/TP/teams/logos/50x50/52747.png'],
  'Paris Saint-Germain': ['https://logos-world.net/wp-content/uploads/2020/06/PSG-Logo.png', 'https://img.uefa.com/imgml/TP/teams/logos/50x50/52747.png'],
};

const TEAM_COLORS: { [key: string]: string } = {
  'Arsenal': '#DC2626',
  'Chelsea': '#1E40AF',
  'Liverpool': '#DC2626',
  'Manchester United': '#DC2626',
  'Manchester City': '#0EA5E9',
  'Tottenham Hotspur': '#1F2937',
  'Real Madrid': '#F8FAFC',
  'Barcelona': '#1E3A8A',
  'Atletico Madrid': '#DC2626',
  'Bayern Munich': '#DC2626',
  'Borussia Dortmund': '#FACC15',
  'Juventus': '#1F2937',
  'AC Milan': '#DC2626',
  'Inter Milan': '#1E40AF',
};

function getTeamInitials(teamName: string): string {
  return teamName
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .join('')
    .slice(0, 2);
}

function getTeamColor(teamName: string): string {
  return TEAM_COLORS[teamName] || '#64748B';
}

function getTeamLogos(team: string | { name: string; crest?: string }, apiLogoUrl?: string): string[] {
  const teamName = typeof team === 'string' ? team : team.name;
  
  // Priority order (reliable first): 1. Local file, 2. API logo, 3. Team crest, 4. CDN logos
  const logos: string[] = [];
  
  // Team name to local filename mapping
  const LOCAL_TEAM_MAP: { [key: string]: string } = {
    'Arsenal': 'arsenal',
    'Arsenal FC': 'arsenal',
    'Chelsea': 'chelsea', 
    'Chelsea FC': 'chelsea',
    'Liverpool': 'liverpool',
    'Liverpool FC': 'liverpool',
    'Manchester United': 'manchester-united',
    'Manchester United FC': 'manchester-united',
    'Manchester City': 'manchester-city',
    'Manchester City FC': 'manchester-city',
    'Tottenham': 'tottenham',
    'Tottenham Hotspur': 'tottenham',
    'Tottenham Hotspur FC': 'tottenham',
    'Real Madrid': 'real-madrid',
    'Real Madrid CF': 'real-madrid',
    'Barcelona': 'barcelona',
    'FC Barcelona': 'barcelona',
    'Atletico Madrid': 'atletico-madrid',
    'Club Atlético de Madrid': 'atletico-madrid',
    'Juventus': 'juventus',
    'AC Milan': 'ac-milan',
    'Inter Milan': 'inter-milan',
    'Bayern Munich': 'bayern-munich',
    'Borussia Dortmund': 'borussia-dortmund',
    'PSG': 'psg',
    'Paris Saint-Germain': 'psg'
  };
  
  // Use mapping or fallback to slug conversion
  const teamSlug = LOCAL_TEAM_MAP[teamName] || teamName
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/fc$/, '')
    .replace(/cf$/, '')
    .trim();
  
  if (teamSlug) {
    logos.push(`/logos/teams/${teamSlug}.png`);
  }

  // Next: API logo and crest
  if (apiLogoUrl) {
    logos.push(apiLogoUrl);
  }
  if (typeof team === 'object' && team.crest) {
    logos.push(team.crest);
  }
  
  // Add predefined CDN logos for this team
  const predefinedLogos = TEAM_LOGOS[teamName] || [];
  logos.push(...predefinedLogos);
  
  // Final fallback to placeholder
  logos.push(`https://placehold.co/60x60/64748B/FFFFFF/png?text=${getTeamInitials(teamName)}`);
  
  return logos;
}

export const TeamLogo = ({ team, size = 40, className = '', logoUrl, variant = 'plain' }: TeamLogoProps) => {
  const [currentLogoIndex, setCurrentLogoIndex] = useState(0);
  const [allLogosExhausted, setAllLogosExhausted] = useState(false);
  
  const teamName = typeof team === 'string' ? team : team.name;
  const logoUrls = getTeamLogos(team, logoUrl);
  const teamColor = getTeamColor(teamName);
  const initials = getTeamInitials(teamName);
  
  const handleImageError = () => {
    const nextIndex = currentLogoIndex + 1;
    if (nextIndex < logoUrls.length) {
      setCurrentLogoIndex(nextIndex);
    } else {
      setAllLogosExhausted(true);
    }
  };
  
  // Show initials with team color if all logos failed to load
  if (allLogosExhausted) {
    return (
      variant === 'plain' ? (
        <div
          className={`flex items-center justify-center text-white font-bold flex-shrink-0 ${className}`}
          style={{ width: size, height: size, fontSize: size * 0.3 }}
          title={teamName}
        >
          {initials}
        </div>
      ) : (
        <div
          className={`flex items-center justify-center text-white font-bold rounded-full flex-shrink-0 ${className}`}
          style={{ 
            width: size, 
            height: size,
            backgroundColor: teamColor,
            fontSize: size * 0.3
          }}
          title={teamName}
        >
          {initials}
        </div>
      )
    );
  }
  
  return (
    <img
      src={logoUrls[currentLogoIndex]}
      alt={`${teamName} logo`}
      width={size}
      height={size}
      onError={handleImageError}
      className={`${variant === 'plain' ? 'object-contain flex-shrink-0' : 'rounded-full object-cover flex-shrink-0 bg-white p-1 border border-border/20'} ${className}`}
      style={{ width: size, height: size, objectFit: variant === 'plain' ? 'contain' : 'cover' }}
      referrerPolicy="no-referrer"
      decoding="async"
      title={teamName}
      draggable={false}
    />
  );
};