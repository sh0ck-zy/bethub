'use client';

import { useState } from 'react';
// Comprehensive league logo mapping with multiple CDN sources
const LEAGUE_LOGOS: { [key: string]: string[] } = {
  // TOP 5 EUROPEAN LEAGUES
  'Premier League': [
    'https://logos-world.net/wp-content/uploads/2020/06/Premier-League-Logo.png',
    'https://img.uefa.com/imgml/TP/competitions/logos/50x50/GB1.png',
    'https://logoeps.com/wp-content/uploads/2013/03/premier-league-vector-logo.png'
  ],
  'La Liga': [
    'https://logos-world.net/wp-content/uploads/2020/06/LaLiga-Logo.png',
    'https://img.uefa.com/imgml/TP/competitions/logos/50x50/ES1.png',
    'https://1000logos.net/wp-content/uploads/2018/06/La-Liga-Logo.png'
  ],
  'Primera División': [
    'https://logos-world.net/wp-content/uploads/2020/06/LaLiga-Logo.png',
    'https://img.uefa.com/imgml/TP/competitions/logos/50x50/ES1.png'
  ],
  'Serie A': [
    'https://logos-world.net/wp-content/uploads/2020/06/Serie-A-Logo.png',
    'https://img.uefa.com/imgml/TP/competitions/logos/50x50/IT1.png',
    'https://1000logos.net/wp-content/uploads/2020/08/Serie-A-Logo.png'
  ],
  'Bundesliga': [
    'https://logos-world.net/wp-content/uploads/2020/06/Bundesliga-Logo.png',
    'https://img.uefa.com/imgml/TP/competitions/logos/50x50/DE1.png',
    'https://1000logos.net/wp-content/uploads/2017/05/Bundesliga-Logo.png'
  ],
  'Ligue 1': [
    'https://logos-world.net/wp-content/uploads/2020/06/Ligue-1-Logo.png',
    'https://img.uefa.com/imgml/TP/competitions/logos/50x50/FR1.png',
    'https://1000logos.net/wp-content/uploads/2018/06/Ligue-1-logo.png'
  ],

  // UEFA COMPETITIONS
  'Champions League': [
    'https://logos-world.net/wp-content/uploads/2020/06/UEFA-Champions-League-Logo.png',
    'https://img.uefa.com/imgml/TP/competitions/logos/50x50/1.png',
    'https://1000logos.net/wp-content/uploads/2018/06/UEFA-Champions-League-logo.png'
  ],
  'UEFA Champions League': [
    'https://logos-world.net/wp-content/uploads/2020/06/UEFA-Champions-League-Logo.png',
    'https://img.uefa.com/imgml/TP/competitions/logos/50x50/1.png'
  ],
  'Europa League': [
    'https://logos-world.net/wp-content/uploads/2020/06/UEFA-Europa-League-Logo.png',
    'https://img.uefa.com/imgml/TP/competitions/logos/50x50/2.png',
    'https://1000logos.net/wp-content/uploads/2018/06/UEFA-Europa-League-logo.png'
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
  ],

  // SECOND TIER EUROPEAN LEAGUES
  'Championship': [
    'https://logos-world.net/wp-content/uploads/2020/06/EFL-Championship-Logo.png',
    'https://1000logos.net/wp-content/uploads/2020/09/EFL-Championship-Logo.png'
  ],
  'EFL Championship': [
    'https://logos-world.net/wp-content/uploads/2020/06/EFL-Championship-Logo.png',
    'https://1000logos.net/wp-content/uploads/2020/09/EFL-Championship-Logo.png'
  ],
  'Segunda División': [
    'https://logoeps.com/wp-content/uploads/2013/12/laliga-smartbank-vector-logo.png',
    'https://1000logos.net/wp-content/uploads/2020/08/LaLiga-SmartBank-Logo.png'
  ],
  'Serie B': [
    'https://logoeps.com/wp-content/uploads/2013/12/serie-b-vector-logo.png',
    'https://1000logos.net/wp-content/uploads/2020/08/Serie-B-Logo.png'
  ],
  '2. Bundesliga': [
    'https://logoeps.com/wp-content/uploads/2013/12/2-bundesliga-vector-logo.png',
    'https://1000logos.net/wp-content/uploads/2020/08/2-Bundesliga-Logo.png'
  ],
  'Ligue 2': [
    'https://logoeps.com/wp-content/uploads/2013/12/ligue-2-vector-logo.png',
    'https://1000logos.net/wp-content/uploads/2020/08/Ligue-2-Logo.png'
  ],

  // SOUTH AMERICAN LEAGUES
  'Copa Libertadores': [
    'https://logoeps.com/wp-content/uploads/2013/12/conmebol-libertadores-vector-logo.png',
    'https://1000logos.net/wp-content/uploads/2020/08/Copa-Libertadores-Logo.png'
  ],
  'CONMEBOL Libertadores': [
    'https://logoeps.com/wp-content/uploads/2013/12/conmebol-libertadores-vector-logo.png',
    'https://1000logos.net/wp-content/uploads/2020/08/Copa-Libertadores-Logo.png'
  ],
  'Brasileirão': [
    'https://logoeps.com/wp-content/uploads/2013/12/brasileirao-serie-a-vector-logo.png',
    'https://1000logos.net/wp-content/uploads/2020/08/Brasileirao-Logo.png'
  ],
  'Brasileirão Série A': [
    'https://logoeps.com/wp-content/uploads/2013/12/brasileirao-serie-a-vector-logo.png',
    'https://1000logos.net/wp-content/uploads/2020/08/Brasileirao-Logo.png'
  ],
  'Copa do Brasil': [
    'https://logoeps.com/wp-content/uploads/2013/12/copa-do-brasil-vector-logo.png',
    'https://1000logos.net/wp-content/uploads/2020/08/Copa-do-Brasil-Logo.png'
  ],
  'Argentine Primera División': [
    'https://logoeps.com/wp-content/uploads/2013/12/liga-profesional-argentina-vector-logo.png',
    'https://1000logos.net/wp-content/uploads/2020/08/Argentine-Primera-Division-Logo.png'
  ],

  // DUTCH & BELGIAN LEAGUES
  'Eredivisie': [
    'https://logos-world.net/wp-content/uploads/2020/06/Eredivisie-Logo.png',
    'https://1000logos.net/wp-content/uploads/2020/08/Eredivisie-Logo.png',
    'https://logoeps.com/wp-content/uploads/2013/12/eredivisie-vector-logo.png'
  ],
  'Belgian Pro League': [
    'https://logoeps.com/wp-content/uploads/2013/12/jupiler-pro-league-vector-logo.png',
    'https://1000logos.net/wp-content/uploads/2020/08/Belgian-Pro-League-Logo.png'
  ],
  'Jupiler Pro League': [
    'https://logoeps.com/wp-content/uploads/2013/12/jupiler-pro-league-vector-logo.png',
    'https://1000logos.net/wp-content/uploads/2020/08/Belgian-Pro-League-Logo.png'
  ],

  // PORTUGUESE LEAGUES
  'Primeira Liga': [
    'https://logoeps.com/wp-content/uploads/2013/12/primeira-liga-vector-logo.png',
    'https://1000logos.net/wp-content/uploads/2020/08/Primeira-Liga-Logo.png'
  ],
  'Liga Portugal': [
    'https://logoeps.com/wp-content/uploads/2013/12/primeira-liga-vector-logo.png',
    'https://1000logos.net/wp-content/uploads/2020/08/Primeira-Liga-Logo.png'
  ],

  // INTERNATIONAL TOURNAMENTS
  'FIFA World Cup': [
    'https://logos-world.net/wp-content/uploads/2020/06/FIFA-World-Cup-Logo.png',
    'https://1000logos.net/wp-content/uploads/2018/06/FIFA-World-Cup-logo.png'
  ],
  'UEFA European Championship': [
    'https://logos-world.net/wp-content/uploads/2020/06/UEFA-Euro-2024-Logo.png',
    'https://1000logos.net/wp-content/uploads/2020/08/UEFA-Euro-Logo.png'
  ],
  'UEFA Nations League': [
    'https://logos-world.net/wp-content/uploads/2020/06/UEFA-Nations-League-Logo.png',
    'https://1000logos.net/wp-content/uploads/2020/08/UEFA-Nations-League-Logo.png'
  ],
  'Copa América': [
    'https://logoeps.com/wp-content/uploads/2013/12/copa-america-vector-logo.png',
    'https://1000logos.net/wp-content/uploads/2020/08/Copa-America-Logo.png'
  ],

  // OTHER MAJOR LEAGUES
  'MLS': [
    'https://logos-world.net/wp-content/uploads/2020/06/MLS-Logo.png',
    'https://1000logos.net/wp-content/uploads/2017/05/MLS-Logo.png'
  ],
  'Major League Soccer': [
    'https://logos-world.net/wp-content/uploads/2020/06/MLS-Logo.png',
    'https://1000logos.net/wp-content/uploads/2017/05/MLS-Logo.png'
  ],
  'Scottish Premiership': [
    'https://logoeps.com/wp-content/uploads/2013/12/scottish-premiership-vector-logo.png',
    'https://1000logos.net/wp-content/uploads/2020/08/Scottish-Premiership-Logo.png'
  ],
  'Saudi Pro League': [
    'https://logoeps.com/wp-content/uploads/2023/08/saudi-pro-league-vector-logo.png',
    'https://1000logos.net/wp-content/uploads/2023/08/Saudi-Pro-League-Logo.png'
  ]
};

function getLeagueLogos(league: string, apiLogoUrl?: string): string[] {
  const logos: string[] = [];
  
  // League name to local filename mapping
  const LOCAL_LEAGUE_MAP: { [key: string]: string } = {
    // Top 5 European Leagues
    'Premier League': 'premier-league',
    'La Liga': 'la-liga',
    'Primera División': 'primera-division',
    'Primera Division': 'primera-division',
    'Serie A': 'serie-a',
    'Bundesliga': 'bundesliga',
    'Ligue 1': 'ligue-1',
    
    // UEFA Competitions
    'Champions League': 'champions-league',
    'UEFA Champions League': 'uefa-champions-league',
    'Europa League': 'europa-league',
    'UEFA Europa League': 'europa-league',
    'Conference League': 'conference-league',
    'UEFA Conference League': 'conference-league',
    
    // Second Tier European Leagues
    'Championship': 'championship',
    'EFL Championship': 'championship',
    'Segunda División': 'segunda-division',
    'Serie B': 'serie-b',
    '2. Bundesliga': '2-bundesliga',
    'Ligue 2': 'ligue-2',
    
    // South American Competitions
    'Copa Libertadores': 'copa-libertadores',
    'CONMEBOL Libertadores': 'copa-libertadores',
    'Brasileirão': 'brasileiro',
    'Brasileirão Série A': 'campeonato-brasileiro-srie-a',
    'Campeonato Brasileiro Série A': 'campeonato-brasileiro-srie-a',
    'Copa do Brasil': 'copa-do-brasil',
    'Argentine Primera División': 'argentine-primera',
    
    // Dutch & Belgian Leagues
    'Eredivisie': 'eredivisie',
    'Belgian Pro League': 'belgian-pro-league',
    'Jupiler Pro League': 'belgian-pro-league',
    
    // Portuguese Leagues
    'Primeira Liga': 'primeira-liga',
    'Liga Portugal': 'primeira-liga',
    
    // International Tournaments
    'FIFA World Cup': 'world-cup',
    'UEFA European Championship': 'euro-championship',
    'UEFA Nations League': 'nations-league',
    'Copa América': 'copa-america',
    
    // Other Major Leagues
    'MLS': 'mls',
    'Major League Soccer': 'mls',
    'Scottish Premiership': 'scottish-premiership',
    'Saudi Pro League': 'saudi-pro-league'
  };
  
  // Use mapping or fallback to slug conversion
  const leagueSlug = LOCAL_LEAGUE_MAP[league] || league
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
  
  // Priority 1: Local file (highest priority)
  if (leagueSlug) {
    logos.push(`/logos/leagues/${leagueSlug}.png`);
  }
  
  // Priority 2: API-provided logo
  if (apiLogoUrl) {
    logos.push(apiLogoUrl);
  }
  
  // Priority 3: Add predefined CDN logos as fallbacks
  const predefinedLogos = LEAGUE_LOGOS[league] || [];
  logos.push(...predefinedLogos);
  
  // Priority 4: Always add fallback placeholder as last option
  logos.push(`https://placehold.co/40x40/6366f1/FFFFFF/png?text=${league.charAt(0)}`);
  return logos;
}

interface LeagueLogoProps {
  league: string | { name: string; emblem?: string };
  size?: number;
  className?: string;
  // API-provided logo URL (highest priority)  
  logoUrl?: string;
  variant?: 'circle' | 'plain';
}

export const LeagueLogo = ({ league, size = 40, className = '', logoUrl, variant = 'plain' }: LeagueLogoProps) => {
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
      variant === 'plain' ? (
        <div
          className={`flex items-center justify-center text-white font-bold flex-shrink-0 ${className}`}
          style={{ width: size, height: size, fontSize: size * 0.25 }}
          title={leagueName}
        >
          {initials}
        </div>
      ) : (
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
      )
    );
  }
  
  return (
    <img
      src={logoUrls[currentLogoIndex]}
      alt={`${leagueName} logo`}
      width={size}
      height={size}
      onError={handleImageError}
      className={`${variant === 'plain' ? 'object-contain flex-shrink-0' : 'rounded-full object-contain flex-shrink-0 bg-white p-1'} ${className}`}
      style={{ width: size, height: size, objectFit: 'contain' }}
      referrerPolicy="no-referrer"
      decoding="async"
      title={leagueName}
      draggable={false}
    />
  );
};