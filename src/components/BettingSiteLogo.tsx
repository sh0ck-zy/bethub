'use client';

import { useState } from 'react';

interface BettingSiteLogoProps {
  site: string | { name: string; logo?: string };
  size?: number;
  className?: string;
}

// Reliable betting site logo mapping with multiple CDN sources
const BETTING_SITE_LOGOS: { [key: string]: string[] } = {
  'bet365': [
    'https://logos-world.net/wp-content/uploads/2021/02/Bet365-Logo.png',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Bet365_logo.svg/200px-Bet365_logo.svg.png'
  ],
  'Bet365': [
    'https://logos-world.net/wp-content/uploads/2021/02/Bet365-Logo.png',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Bet365_logo.svg/200px-Bet365_logo.svg.png'
  ],
  'betfair': [
    'https://logos-world.net/wp-content/uploads/2021/02/Betfair-Logo.png',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Betfair_logo.svg/200px-Betfair_logo.svg.png'
  ],
  'Betfair': [
    'https://logos-world.net/wp-content/uploads/2021/02/Betfair-Logo.png',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Betfair_logo.svg/200px-Betfair_logo.svg.png'
  ],
  'william hill': [
    'https://logos-world.net/wp-content/uploads/2021/02/William-Hill-Logo.png',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/William_Hill_logo.svg/200px-William_Hill_logo.svg.png'
  ],
  'William Hill': [
    'https://logos-world.net/wp-content/uploads/2021/02/William-Hill-Logo.png',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/William_Hill_logo.svg/200px-William_Hill_logo.svg.png'
  ],
  'ladbrokes': [
    'https://logos-world.net/wp-content/uploads/2021/02/Ladbrokes-Logo.png',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Ladbrokes_logo.svg/200px-Ladbrokes_logo.svg.png'
  ],
  'Ladbrokes': [
    'https://logos-world.net/wp-content/uploads/2021/02/Ladbrokes-Logo.png',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Ladbrokes_logo.svg/200px-Ladbrokes_logo.svg.png'
  ],
  'paddypower': [
    'https://logos-world.net/wp-content/uploads/2021/02/Paddy-Power-Logo.png'
  ],
  'Paddy Power': [
    'https://logos-world.net/wp-content/uploads/2021/02/Paddy-Power-Logo.png'
  ],
  'unibet': [
    'https://logos-world.net/wp-content/uploads/2021/02/Unibet-Logo.png',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/Unibet_logo.svg/200px-Unibet_logo.svg.png'
  ],
  'Unibet': [
    'https://logos-world.net/wp-content/uploads/2021/02/Unibet-Logo.png',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/Unibet_logo.svg/200px-Unibet_logo.svg.png'
  ],
  'betway': [
    'https://logos-world.net/wp-content/uploads/2021/02/Betway-Logo.png'
  ],
  'Betway': [
    'https://logos-world.net/wp-content/uploads/2021/02/Betway-Logo.png'
  ],
  'coral': [
    'https://logos-world.net/wp-content/uploads/2021/02/Coral-Logo.png'
  ],
  'Coral': [
    'https://logos-world.net/wp-content/uploads/2021/02/Coral-Logo.png'
  ],
  'skybet': [
    'https://logos-world.net/wp-content/uploads/2021/02/SkyBet-Logo.png'
  ],
  'SkyBet': [
    'https://logos-world.net/wp-content/uploads/2021/02/SkyBet-Logo.png'
  ],
  'Sky Bet': [
    'https://logos-world.net/wp-content/uploads/2021/02/SkyBet-Logo.png'
  ]
};

function getBettingSiteLogos(site: string | { name: string; logo?: string }): string[] {
  const siteName = typeof site === 'string' ? site : site.name;
  const logos: string[] = [];
  
  // If site object has logo, use it as first option
  if (typeof site === 'object' && site.logo) {
    logos.push(site.logo);
  }
  
  // Try local logo first (convert site name to slug)
  const siteSlug = siteName
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
  
  if (siteSlug) {
    logos.push(`/logos/bookmakers/${siteSlug}.png`);
  }
  
  // Add predefined CDN logos for this site
  const predefinedLogos = BETTING_SITE_LOGOS[siteName] || [];
  logos.push(...predefinedLogos);
  
  // Generate initials for fallback
  const initials = siteName
    .split(' ')
    .map(word => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  
  // Final fallback to placeholder
  logos.push(`https://placehold.co/60x60/10b981/FFFFFF/png?text=${initials}`);
  
  return logos;
}

export const BettingSiteLogo = ({ site, size = 40, className = '' }: BettingSiteLogoProps) => {
  const [currentLogoIndex, setCurrentLogoIndex] = useState(0);
  const [allLogosExhausted, setAllLogosExhausted] = useState(false);
  
  const siteName = typeof site === 'string' ? site : site.name;
  const logoUrls = getBettingSiteLogos(site);
  
  // Generate initials for fallback
  const initials = siteName
    .split(' ')
    .map(word => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  
  const handleImageError = () => {
    const nextIndex = currentLogoIndex + 1;
    if (nextIndex < logoUrls.length) {
      setCurrentLogoIndex(nextIndex);
    } else {
      setAllLogosExhausted(true);
    }
  };
  
  // Show initials with green background if all logos failed to load
  if (allLogosExhausted) {
    return (
      <div
        className={`flex items-center justify-center text-white font-bold rounded-lg flex-shrink-0 ${className}`}
        style={{ 
          width: size, 
          height: size,
          backgroundColor: '#10b981', // Green for betting sites
          fontSize: size * 0.3
        }}
        title={siteName}
      >
        {initials}
      </div>
    );
  }
  
  return (
    <img
      src={logoUrls[currentLogoIndex]}
      alt={`${siteName} logo`}
      width={size}
      height={size}
      onError={handleImageError}
      className={`rounded-lg object-contain flex-shrink-0 bg-white p-1 ${className}`}
      title={siteName}
    />
  );
};