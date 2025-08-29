'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';

interface CompetitionLogoProps {
  competition: string;
  country?: string;
  size?: number;
}

interface CompetitionData {
  id: string;
  name: string;
  logo_url?: string;
  country?: string;
}

// Competition to country mapping
const COMPETITION_COUNTRIES: Record<string, string> = {
  'Premier League': 'England',
  'Championship': 'England', 
  'FA Cup': 'England',
  'EFL Cup': 'England',
  'La Liga': 'Spain',
  'Copa del Rey': 'Spain',
  'Bundesliga': 'Germany',
  'DFB-Pokal': 'Germany',
  'Serie A': 'Italy',
  'Coppa Italia': 'Italy',
  'Ligue 1': 'France',
  'Coupe de France': 'France',
  'Eredivisie': 'Netherlands',
  'KNVB Beker': 'Netherlands',
  'Primeira Liga': 'Portugal',
  'Taça de Portugal': 'Portugal',
  'Brasileirão Série A': 'Brazil',
  'Copa do Brasil': 'Brazil',
  'UEFA Champions League': 'Europe',
  'UEFA Europa League': 'Europe',
  'UEFA Conference League': 'Europe',
};

// Country flag URLs
const COUNTRY_FLAGS: Record<string, string> = {
  'England': 'https://flagcdn.com/w80/gb-eng.png',
  'Spain': 'https://flagcdn.com/w80/es.png',
  'Germany': 'https://flagcdn.com/w80/de.png',
  'Italy': 'https://flagcdn.com/w80/it.png',
  'France': 'https://flagcdn.com/w80/fr.png',
  'Netherlands': 'https://flagcdn.com/w80/nl.png',
  'Portugal': 'https://flagcdn.com/w80/pt.png',
  'Brazil': 'https://flagcdn.com/w80/br.png',
  'Europe': 'https://flagcdn.com/w80/eu.png',
};

// Determine if competition should use country flag
function shouldUseCountryFlag(competitionName: string): boolean {
  const cupKeywords = ['cup', 'copa', 'coupe', 'pokal', 'beker', 'taça'];
  return cupKeywords.some(keyword => 
    competitionName.toLowerCase().includes(keyword)
  );
}

export const CompetitionLogo = ({ competition, country, size = 40 }: CompetitionLogoProps) => {
  const [imageError, setImageError] = useState(false);
  const [competitionData, setCompetitionData] = useState<CompetitionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Determine country from competition name or prop
  const competitionCountry = country || COMPETITION_COUNTRIES[competition] || 'Unknown';
  
  // Fetch competition data from database
  useEffect(() => {
    const fetchCompetitionData = async () => {
      try {
        const response = await fetch(`/api/v1/leagues?name=${encodeURIComponent(competition)}`);
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            setCompetitionData(data.data);
          }
        }
      } catch (error) {
        console.log('Could not fetch competition data from database');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompetitionData();
  }, [competition]);

  // Determine which logo to use
  let logoUrl = competitionData?.logo_url;
  
  // For cups/knockout competitions, prefer country flag if no specific logo
  if (!logoUrl && shouldUseCountryFlag(competition)) {
    logoUrl = COUNTRY_FLAGS[competitionCountry];
  }

  // Show loading state
  if (isLoading) {
    return (
      <div
        className="flex items-center justify-center text-xs font-bold text-white rounded-full flex-shrink-0 animate-pulse bg-slate-500"
        style={{ 
          width: size, 
          height: size,
          border: '2px solid rgba(100, 116, 139, 0.4)'
        }}
      >
        ...
      </div>
    );
  }

  // Show competition initials if no logo available or image failed to load
  if (!logoUrl || imageError) {
    const initials = competition
      .split(' ')
      .map(word => word[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
    
    // Color based on competition type
    const getCompetitionColor = () => {
      if (competition.includes('Champions')) return '#1e40af'; // blue
      if (competition.includes('Europa')) return '#f97316'; // orange
      if (competition.includes('Conference')) return '#10b981'; // green
      if (shouldUseCountryFlag(competition)) return '#dc2626'; // red for cups
      return '#6366f1'; // indigo for leagues
    };
    
    return (
      <div
        className="flex items-center justify-center text-xs font-bold text-white rounded-full flex-shrink-0"
        style={{ 
          width: size, 
          height: size,
          backgroundColor: getCompetitionColor(),
          border: `2px solid ${getCompetitionColor()}40`
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
        src={logoUrl}
        alt={`${competition} logo`}
        width={size}
        height={size}
        className="object-contain max-w-full max-h-full rounded-sm"
        priority
        onError={() => setImageError(true)}
      />
    </div>
  );
};

// Helper function to get competition colors for styling
export const getCompetitionColor = (competitionName: string) => {
  if (competitionName.includes('Champions')) return '#1e40af';
  if (competitionName.includes('Europa')) return '#f97316';
  if (competitionName.includes('Conference')) return '#10b981';
  if (shouldUseCountryFlag(competitionName)) return '#dc2626';
  return '#6366f1';
};