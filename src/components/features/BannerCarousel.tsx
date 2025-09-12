'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, BarChart3, ChevronLeft, ChevronRight, Play, Pause, Brain, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { type UnsplashImage } from '@/lib/services/unsplashImageService';
import { simpleImageService, type SimpleImageServiceResult } from '@/lib/services/simpleImageService';
import { TeamLogo } from '@/components/TeamLogo';
import type { Match } from '@/lib/types';

interface BannerCarouselProps {
  match: Match;
  autoPlay?: boolean;
  interval?: number;
  accentColor?: 'green' | 'red';
  ctaLabel?: string;
  showRibbon?: boolean;
  design?: 'carousel' | 'diagonal' | 'diagonal-v2' | 'diagonal-v2-alt'; // New prop to choose between designs
  homeTeamStats?: string; // e.g., "UNBEATEN IN 5"
  awayTeamStats?: string; // e.g., "TOP SCORER HAS 7 GOALS"
}

// SVG Icon Components
const PinIcon = ({ size = 16, className = '' }: { size?: number; className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
    <circle cx="12" cy="10" r="3"></circle>
  </svg>
);

const BarChartIcon = ({ size = 20, className = '' }: { size?: number; className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="12" y1="20" x2="12" y2="10"></line>
    <line x1="18" y1="20" x2="18" y2="4"></line>
    <line x1="6" y1="20" x2="6" y2="16"></line>
  </svg>
);

// New Diagonal Banner Component
function DiagonalBanner({ match, ctaLabel = 'AI Detailed Analysis', homeTeamStats, awayTeamStats, accentColor = 'red' }: BannerCarouselProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAIGenerating, setIsAIGenerating] = useState(false);
  const [aiResult, setAiResult] = useState<SimpleImageServiceResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [images, setImages] = useState<UnsplashImage[]>([]);
  
  const accentGreen = 'bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-600/40';
  const accentRed = 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/40';
  
  // Load images for the diagonal banner
  useEffect(() => {
    const loadImages = async () => {
      try {
        setIsLoading(true);
        setIsAIGenerating(true);
        setError(null);

        console.log(`🎠 Loading images for diagonal banner: ${match.home_team} vs ${match.away_team}`);
        
        try {
          // Use AI service to get better images
          const result = await simpleImageService.getBannerImages(match.home_team, match.away_team);
          
          setAiResult(result);
          setImages(result.images);
          
          if (!result.success) {
            console.warn('AI image service failed:', result.error);
          } else if (result.aiQuery) {
            console.log(`🤖 AI Query: "${result.aiQuery.query}"`);
            console.log(`🔄 Fallback Query: "${result.aiQuery.fallbackQuery}"`);
            console.log(`📊 Source: ${result.source}`);
          }
        } catch (imageError) {
          console.warn('AI image service unavailable:', imageError);
          setImages([]);
        }
        
      } catch (error) {
        console.error('Error in diagonal banner:', error);
        setError(error instanceof Error ? error.message : 'Unknown error');
        setImages([]);
      } finally {
        setIsLoading(false);
        setIsAIGenerating(false);
      }
    };
    
    loadImages();
  }, [match]);

  // Use different images for each side or fallback
  const homeTeamImage = images.length > 0 ? images[0].url : "https://placehold.co/1200x500/1a1a1a/FFFFFF?text=Home+Team";
  const awayTeamImage = images.length > 1 ? images[1].url : images.length > 0 ? images[0].url : "https://placehold.co/1200x500/1a1a1a/FFFFFF?text=Away+Team";

  if (isLoading) {
    return (
      <div className="relative w-full overflow-hidden rounded-2xl shadow-lg border border-border">
        <div className="relative z-10 flex flex-col md:flex-row h-72 bg-gradient-to-r from-gray-800 to-gray-900 animate-pulse">
          <div className="flex-1 relative p-6 flex flex-col justify-between">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 bg-gray-600 rounded-full"></div>
              <div className="h-8 bg-gray-600 rounded w-48"></div>
            </div>
            <div className="h-12 bg-gray-600 rounded w-48"></div>
          </div>
          <div className="flex-1 relative p-6 flex flex-col items-end justify-between">
            <div className="flex items-center justify-end space-x-4 mb-4">
              <div className="h-8 bg-gray-600 rounded w-48"></div>
              <div className="w-12 h-12 bg-gray-600 rounded-full"></div>
            </div>
            <div className="h-4 bg-gray-600 rounded w-32"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full overflow-hidden rounded-2xl shadow-lg border border-border">
      {/* Main content container with diagonal split */}
      <div className="relative z-10 h-72">
        {/* Left half - Home team side */}
        <div className="absolute left-0 top-0 w-1/2 h-full p-6 flex flex-col justify-between overflow-hidden"
          style={{ 
            clipPath: 'polygon(0 0, 100% 0, 70% 100%, 0% 100%)' 
          }}
        >
          {/* Home team background image */}
          <div className="absolute inset-0 z-0" style={{ backgroundImage: `url(${homeTeamImage})`, backgroundSize: 'cover', backgroundPosition: 'left center' }}/>
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-transparent z-10" />

          {/* Home team logo and title */}
          <div className="relative z-20">
            <div className="flex items-start space-x-3 mb-4 max-w-full">
              <div className="flex-shrink-0">
                <TeamLogo team={match.home_team} size={48} logoUrl={match.home_team_logo} />
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-white text-lg sm:text-xl md:text-2xl font-extrabold break-words leading-tight">{match.home_team}</span>
                {homeTeamStats && (
                  <span className="text-green-400 font-semibold uppercase text-xs tracking-wider mt-1">{homeTeamStats}</span>
                )}
              </div>
            </div>
            
            {/* Error Display */}
            {error && (
              <div className="mt-4 flex items-center space-x-2 text-yellow-400">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">Unable to load images: {error}</span>
              </div>
            )}
            
            {/* AI Query Info */}
            {aiResult?.aiQuery && (
              <div className="mt-2 flex items-center space-x-2 text-white/60">
                <Brain className="w-3 h-3" />
                <span className="text-xs">
                  AI Query: "{aiResult.aiQuery.query}" 
                  <span className="ml-1 text-white/40">({aiResult.source})</span>
                </span>
              </div>
            )}
          </div>
          
          {/* CTA button */}
          <div className="relative z-20">
            <Link href={`/match/${match.id}`}>
              <Button className={`${accentGreen} text-lg py-3 px-8 transform hover:scale-105 transition-transform flex items-center gap-2`}>
                <BarChartIcon />
                {ctaLabel}
              </Button>
            </Link>
          </div>
        </div>

        {/* Right half - Away team side */}
        <div className="absolute right-0 top-0 w-1/2 h-full p-6 flex flex-col items-end justify-between overflow-hidden"
          style={{ 
            clipPath: 'polygon(30% 0, 100% 0, 100% 100%, 0% 100%)' 
          }}
        >
          {/* Away team background image */}
          <div className="absolute inset-0 z-0" style={{ backgroundImage: `url(${awayTeamImage})`, backgroundSize: 'cover', backgroundPosition: 'right center' }}/>
          <div className="absolute inset-0 bg-gradient-to-l from-black/85 via-black/60 to-transparent z-10" />

          {/* Away team logo and title */}
          <div className="relative z-20 text-right">
            <div className="flex items-start justify-end space-x-3 mb-4 max-w-full">
              <div className="flex flex-col items-end min-w-0 flex-1">
                <span className="text-white text-lg sm:text-xl md:text-2xl font-extrabold break-words leading-tight">{match.away_team}</span>
                {awayTeamStats && (
                  <span className="text-red-400 font-semibold uppercase text-xs tracking-wider mt-1">{awayTeamStats}</span>
                )}
              </div>
              <div className="flex-shrink-0">
                <TeamLogo team={match.away_team} size={48} logoUrl={match.away_team_logo} />
              </div>
            </div>
          </div>
          
          {/* Match details - Date & Venue */}
          <div className="relative z-20 text-right text-gray-300 font-medium text-sm">
            <p className="flex items-center justify-end gap-2">
              <Calendar className="w-4 h-4" />
              {new Date(match.kickoff_utc).toLocaleDateString()}
            </p>
            <p className="flex items-center justify-end gap-2 mt-1">
              <PinIcon />
              {match.venue || 'TBD'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// New Diagonal Banner V2 Component - Enhanced version from HTML demo
function DiagonalBannerV2Legacy({ match, ctaLabel = 'View Full Analysis', homeTeamStats, awayTeamStats, accentColor = 'red' }: BannerCarouselProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAIGenerating, setIsAIGenerating] = useState(false);
  const [aiResult, setAiResult] = useState<SimpleImageServiceResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [images, setImages] = useState<UnsplashImage[]>([]);
  
  const accentGreen = 'bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-600/40';
  const accentRed = 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/40';
  
  // Load images for the diagonal banner
  useEffect(() => {
    const loadImages = async () => {
      try {
        setIsLoading(true);
        setIsAIGenerating(true);
        setError(null);

        console.log(`🎠 Loading images for diagonal banner v2: ${match.home_team} vs ${match.away_team}`);
        
        try {
          // Use AI service to get better images
          const result = await simpleImageService.getBannerImages(match.home_team, match.away_team);
          
          if (result && result.images && result.images.length > 0) {
            setImages(result.images);
            setAiResult(result);
            console.log(`✅ AI images loaded for diagonal banner v2:`, result.images.length, 'images');
          } else {
            console.warn('No AI images returned for diagonal banner v2');
            setImages([]);
          }
        } catch (imageError) {
          console.warn('AI image service unavailable for diagonal banner v2:', imageError);
          setImages([]);
        }
        
      } catch (error) {
        console.error('Error in diagonal banner v2:', error);
        setError(error instanceof Error ? error.message : 'Unknown error');
        setImages([]);
      } finally {
        setIsLoading(false);
        setIsAIGenerating(false);
      }
    };

    loadImages();
  }, [match.home_team, match.away_team]);

  // Get images for each team
  const homeTeamImage = images.find(img => img.team === 'home')?.url || 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1200&h=500&fit=crop&crop=center';
  const awayTeamImage = images.find(img => img.team === 'away')?.url || 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=1200&h=500&fit=crop&crop=center';

  if (isLoading) {
    return (
      <div className="relative w-full overflow-hidden rounded-2xl shadow-lg border border-border">
        <div className="relative z-10 h-72 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-white text-lg">Loading enhanced banner...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full overflow-hidden rounded-2xl shadow-lg border border-gray-700">
      {/* Main content container with diagonal split */}
      <div className="relative z-10 h-72">
        {/* Diagonal white separator line */}
        <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 -top-6 h-[130%] w-[4px] bg-white/90 shadow-md z-20" style={{ transform: 'rotate(-26deg)' }}></div>

        {/* Center VS badge */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-30">
          <div className="rounded-md px-3 py-1.5 bg-black/80 text-white font-extrabold tracking-wide text-sm border border-white/60 shadow-lg">VS</div>
        </div>

        {/* Left half - Home team side */}
        <div className="absolute left-0 top-0 w-1/2 h-full p-6 flex flex-col justify-between overflow-hidden"
          style={{ 
            clipPath: 'polygon(0 0, 100% 0, 70% 100%, 0% 100%)' 
          }}
        >
          {/* Home team background image */}
          <div className="absolute inset-0 z-0 bg-cover bg-center" style={{ backgroundImage: `url(${homeTeamImage})` }}></div>
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-700/60 via-black/50 to-transparent z-10"></div>

          {/* Home crest - top left */}
          <div className="absolute top-4 left-4 z-30">
              <TeamLogo team={match.home_team} size={48} logoUrl={match.home_team_logo} />
          </div>

          <div className="relative z-20">
            <div className="mb-2 max-w-[85%]">
              <span className="text-white uppercase tracking-wider text-3xl sm:text-4xl md:text-5xl font-extrabold leading-[1.05] break-words">{match.home_team}</span>
            </div>
            {homeTeamStats && (
              <span className="inline-block text-white/90 bg-emerald-600/80 backdrop-blur px-3 py-1 rounded-md font-semibold uppercase text-[10px] tracking-widest">{homeTeamStats}</span>
            )}
          </div>
          
          {/* CTA button */}
          <div className="relative z-20">
            <Link href={`/match/${match.id}`}>
              <Button className={`${accentGreen} text-sm md:text-base py-3 px-6 transform hover:scale-105 transition-transform flex items-center gap-2 rounded-xl font-extrabold uppercase tracking-wide`}>
                <BarChartIcon size={20} />
                {ctaLabel}
              </Button>
            </Link>
          </div>
        </div>

        {/* Right half - Away team side */}
        <div className="absolute right-0 top-0 w-1/2 h-full p-6 flex flex-col items-end justify-between overflow-hidden"
          style={{ 
            clipPath: 'polygon(30% 0, 100% 0, 100% 100%, 0% 100%)' 
          }}
        >
          {/* Away team background image */}
          <div className="absolute inset-0 z-0 bg-cover bg-center" style={{ backgroundImage: `url(${awayTeamImage})` }}></div>
          <div className="absolute inset-0 bg-gradient-to-l from-rose-700/60 via-black/50 to-transparent z-10"></div>

          {/* Away crest - top right */}
          <div className="absolute top-4 right-4 z-30">
              <TeamLogo team={match.away_team} size={48} logoUrl={match.away_team_logo} />
          </div>

          <div className="relative z-20 text-right">
            <div className="mb-2 max-w-[85%] ml-auto">
              <span className="text-white uppercase tracking-wider text-3xl sm:text-4xl md:text-5xl font-extrabold leading-[1.05] break-words">{match.away_team}</span>
            </div>
            {awayTeamStats && (
              <span className="inline-block text-white/95 bg-rose-600/80 backdrop-blur px-3 py-1 rounded-md font-semibold uppercase text-[10px] tracking-widest">{awayTeamStats}</span>
            )}
          </div>
        </div>

        {/* Bottom center date/time and dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 text-white text-sm font-semibold flex flex-col items-center">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>{new Date(match.kickoff_utc).toLocaleDateString()} | {new Date(match.kickoff_utc).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          <div className="mt-2 flex gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-white/80"></span>
            <span className="w-1.5 h-1.5 rounded-full bg-white/50"></span>
            <span className="w-1.5 h-1.5 rounded-full bg-white/50"></span>
            <span className="w-1.5 h-1.5 rounded-full bg-white/50"></span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Diagonal Banner V2 Alternative - Different color schemes
function DiagonalBannerV2AltLegacy({ match, ctaLabel = 'AI Detailed Analysis', homeTeamStats, awayTeamStats, accentColor = 'red' }: BannerCarouselProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAIGenerating, setIsAIGenerating] = useState(false);
  const [aiResult, setAiResult] = useState<SimpleImageServiceResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [images, setImages] = useState<UnsplashImage[]>([]);
  
  const accentGreen = 'bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-600/40';
  const accentRed = 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/40';
  
  // Load images for the diagonal banner
  useEffect(() => {
    const loadImages = async () => {
      try {
        setIsLoading(true);
        setIsAIGenerating(true);
        setError(null);

        console.log(`🎠 Loading images for diagonal banner v2 alt: ${match.home_team} vs ${match.away_team}`);
        
        try {
          // Use AI service to get better images
          const result = await simpleImageService.getBannerImages(match.home_team, match.away_team);
          
          if (result && result.images && result.images.length > 0) {
            setImages(result.images);
            setAiResult(result);
            console.log(`✅ AI images loaded for diagonal banner v2 alt:`, result.images.length, 'images');
          } else {
            console.warn('No AI images returned for diagonal banner v2 alt');
            setImages([]);
          }
        } catch (imageError) {
          console.warn('AI image service unavailable for diagonal banner v2 alt:', imageError);
          setImages([]);
        }
        
      } catch (error) {
        console.error('Error in diagonal banner v2 alt:', error);
        setError(error instanceof Error ? error.message : 'Unknown error');
        setImages([]);
      } finally {
        setIsLoading(false);
        setIsAIGenerating(false);
      }
    };

    loadImages();
  }, [match.home_team, match.away_team]);

  // Get images for each team
  const homeTeamImage = images.find(img => img.team === 'home')?.url || 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&h=400&fit=crop&crop=center';
  const awayTeamImage = images.find(img => img.team === 'away')?.url || 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&h=400&fit=crop&crop=center';

  if (isLoading) {
    return (
      <div className="relative w-full overflow-hidden rounded-2xl shadow-lg border border-border">
        <div className="relative z-10 h-64 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-white text-lg">Loading enhanced banner...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full overflow-hidden rounded-2xl shadow-lg border border-gray-700">
      {/* Main content container with diagonal split */}
      <div className="relative z-10 h-64">
        {/* Diagonal white separator line */}
        <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 -top-6 h-[130%] w-[4px] bg-white/90 shadow-md z-20" style={{ transform: 'rotate(-26deg)' }}></div>

        {/* Center VS badge */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-30">
          <div className="rounded-md px-3 py-1.5 bg-black/80 text-white font-extrabold tracking-wide text-sm border border-white/60 shadow-lg">VS</div>
        </div>

        {/* Left half - Home team side */}
        <div className="absolute left-0 top-0 w-1/2 h-full p-4 flex flex-col justify-between overflow-hidden"
          style={{ 
            clipPath: 'polygon(0 0, 100% 0, 70% 100%, 0% 100%)' 
          }}
        >
          {/* Home team background image */}
          <div className="absolute inset-0 z-0 bg-cover bg-center" style={{ backgroundImage: `url(${homeTeamImage})` }}></div>
          <div className="absolute inset-0 bg-gradient-to-r from-purple-700/60 via-black/50 to-transparent z-10"></div>

          {/* Home crest - top left */}
          <div className="absolute top-3 left-3 z-30">
              <TeamLogo team={match.home_team} size={40} logoUrl={match.home_team_logo} />
          </div>

          <div className="relative z-20">
            <div className="mb-2 max-w-[90%]">
              <span className="text-white uppercase tracking-wider text-2xl sm:text-3xl font-extrabold leading-[1.05] break-words">{match.home_team}</span>
            </div>
            {homeTeamStats && (
              <span className="inline-block text-white/90 bg-purple-600/80 backdrop-blur px-2 py-1 rounded-md font-semibold uppercase text-[9px] tracking-widest">{homeTeamStats}</span>
            )}
          </div>
        </div>

        {/* Right half - Away team side */}
        <div className="absolute right-0 top-0 w-1/2 h-full p-4 flex flex-col items-end justify-between overflow-hidden"
          style={{ 
            clipPath: 'polygon(30% 0, 100% 0, 100% 100%, 0% 100%)' 
          }}
        >
          {/* Away team background image */}
          <div className="absolute inset-0 z-0 bg-cover bg-center" style={{ backgroundImage: `url(${awayTeamImage})` }}></div>
          <div className="absolute inset-0 bg-gradient-to-l from-yellow-700/60 via-black/50 to-transparent z-10"></div>

          {/* Away crest - top right */}
          <div className="absolute top-3 right-3 z-30">
              <TeamLogo team={match.away_team} size={40} logoUrl={match.away_team_logo} />
          </div>

          <div className="relative z-20 text-right">
            <div className="mb-2 max-w-[90%] ml-auto">
              <span className="text-white uppercase tracking-wider text-2xl sm:text-3xl font-extrabold leading-[1.05] break-words">{match.away_team}</span>
            </div>
            {awayTeamStats && (
              <span className="inline-block text-white/95 bg-yellow-600/80 backdrop-blur px-2 py-1 rounded-md font-semibold uppercase text-[9px] tracking-widest">{awayTeamStats}</span>
            )}
          </div>
        </div>

        {/* Bottom center date/time and dots */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 text-white text-xs font-semibold flex flex-col items-center">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>{new Date(match.kickoff_utc).toLocaleDateString()} | {new Date(match.kickoff_utc).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          <div className="mt-1 flex gap-1">
            <span className="w-1 h-1 rounded-full bg-white/80"></span>
            <span className="w-1 h-1 rounded-full bg-white/50"></span>
            <span className="w-1 h-1 rounded-full bg-white/50"></span>
            <span className="w-1 h-1 rounded-full bg-white/50"></span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Diagonal Banner v2 Component - With smooth diagonal fade
function DiagonalBannerV2({ match, ctaLabel = 'AI Detailed Analysis', homeTeamStats, awayTeamStats, accentColor = 'red' }: BannerCarouselProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAIGenerating, setIsAIGenerating] = useState(false);
  const [aiResult, setAiResult] = useState<SimpleImageServiceResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [images, setImages] = useState<UnsplashImage[]>([]);
  
  useEffect(() => {
    const loadImages = async () => {
      try {
        setIsLoading(true);
        setIsAIGenerating(true);
        setError(null);

        console.log(`🎠 Loading images for v2: ${match.home_team} vs ${match.away_team}`);
        
        try {
          const result = await simpleImageService.getBannerImages(match.home_team, match.away_team);
          setAiResult(result);
          setImages(result.images || []);
          console.log(`✅ AI service loaded ${result.images?.length || 0} images`);
        } catch (aiError) {
          console.warn('AI service failed, falling back to basic images:', aiError);
          setImages([]);
        }
      } catch (err) {
        console.error('Error loading images:', err);
        setError(err instanceof Error ? err.message : 'Failed to load images');
        setImages([]);
      } finally {
        setIsLoading(false);
        setIsAIGenerating(false);
      }
    };

    loadImages();
  }, [match.home_team, match.away_team]);

  const formatKickoff = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }),
      time: date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
    };
  };

  const kickoff = formatKickoff(match.kickoff_utc);
  const homeImage = images[0]?.url || 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1200&h=500&fit=crop&crop=center';
  const awayImage = images[1]?.url || 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=1200&h=500&fit=crop&crop=center';

  return (
    <div className="relative w-full overflow-hidden rounded-2xl shadow-lg border border-gray-700">
      <div className="relative z-10 h-72">
        {/* Background images with smooth diagonal fade */}
        <div className="absolute inset-0 z-0">
          {/* Home team background - full width with diagonal mask */}
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ 
              backgroundImage: `url('${homeImage}')`,
              maskImage: 'linear-gradient(135deg, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 60%, rgba(0,0,0,0) 100%)',
              WebkitMaskImage: 'linear-gradient(135deg, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 60%, rgba(0,0,0,0) 100%)'
            }}
          />
          
          {/* Away team background - full width with opposite diagonal mask */}
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ 
              backgroundImage: `url('${awayImage}')`,
              maskImage: 'linear-gradient(135deg, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 40%, rgba(0,0,0,1) 100%)',
              WebkitMaskImage: 'linear-gradient(135deg, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 40%, rgba(0,0,0,1) 100%)'
            }}
          />
        </div>

        {/* Gradient overlays for better text readability */}
        <div className="absolute inset-0 z-10">
          <div 
            className="absolute inset-0 bg-gradient-to-r from-emerald-700/60 via-transparent to-transparent" 
            style={{ 
              maskImage: 'linear-gradient(135deg, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 60%, rgba(0,0,0,0) 100%)',
              WebkitMaskImage: 'linear-gradient(135deg, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 60%, rgba(0,0,0,0) 100%)'
            }} 
          />
          <div 
            className="absolute inset-0 bg-gradient-to-l from-rose-700/60 via-transparent to-transparent" 
            style={{ 
              maskImage: 'linear-gradient(135deg, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 40%, rgba(0,0,0,1) 100%)',
              WebkitMaskImage: 'linear-gradient(135deg, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 40%, rgba(0,0,0,1) 100%)'
            }} 
          />
        </div>

        {/* Center VS badge */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-30">
          <div className="rounded-md px-3 py-1.5 bg-black/80 text-white font-extrabold tracking-wide text-sm border border-white/60 shadow-lg" 
               style={{ fontFamily: 'var(--font-bebas-neue)' }}>
            VS
          </div>
        </div>

        {/* Home team content */}
        <div className="absolute left-0 top-0 w-1/2 h-full p-6 flex flex-col justify-between z-20">
          {/* Home logo - top left */}
          <div className="absolute top-4 left-4 z-30">
            <TeamLogo team={match.home_team} size={72} logoUrl={match.home_team_logo} variant="plain" />
          </div>

          <div className="relative z-20 pt-16">
            <div className="mb-2 max-w-[85%]">
              <span className="text-white uppercase tracking-wider text-3xl sm:text-4xl md:text-5xl font-extrabold leading-[1.05] break-words" 
                    style={{ fontFamily: 'var(--font-bebas-neue)' }}>
                {match.home_team}
              </span>
            </div>
            <span className="inline-block text-white/90 bg-emerald-600/85 backdrop-blur px-3 py-1 rounded-md font-medium uppercase text-[11px] tracking-[0.18em]">
              {homeTeamStats || 'FORM TEAM'}
            </span>
          </div>
          
          {/* CTA button */}
          <div className="relative z-20">
            <Link href={`/match/${match.id}`}>
              <button className="bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-600/40 text-sm md:text-base py-3 px-6 transform hover:scale-105 transition-transform flex items-center gap-2 rounded-xl font-extrabold uppercase tracking-wide" 
                      style={{ fontFamily: 'var(--font-bebas-neue)' }}>
                <BarChartIcon size={20} />
                {ctaLabel}
              </button>
            </Link>
          </div>
        </div>

        {/* Away team content */}
        <div className="absolute right-0 top-0 w-1/2 h-full p-6 flex flex-col items-end justify-between z-20">
          {/* Away logo - top right */}
          <div className="absolute top-4 right-4 z-30">
            <TeamLogo team={match.away_team} size={72} logoUrl={match.away_team_logo} variant="plain" />
          </div>

          <div className="relative z-20 text-right pt-16">
            <div className="mb-2 max-w-[85%] ml-auto">
              <span className="text-white uppercase tracking-wider text-3xl sm:text-4xl md:text-5xl font-extrabold leading-[1.05] break-words" 
                    style={{ fontFamily: 'var(--font-bebas-neue)' }}>
                {match.away_team}
              </span>
            </div>
            <span className="inline-block text-white/95 bg-rose-600/85 backdrop-blur px-3 py-1 rounded-md font-medium uppercase text-[11px] tracking-[0.18em]">
              {awayTeamStats || 'BIG GAME PLAYERS'}
            </span>
          </div>
        </div>

        {/* Bottom center date/time and dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 text-white text-sm font-semibold flex flex-col items-center">
          <div className="flex items-center gap-2">
            <Calendar size={16} />
            <span>{kickoff.date} | {kickoff.time} CET</span>
          </div>
          <div className="mt-2 flex gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-white/80"></span>
            <span className="w-1.5 h-1.5 rounded-full bg-white/50"></span>
            <span className="w-1.5 h-1.5 rounded-full bg-white/50"></span>
            <span className="w-1.5 h-1.5 rounded-full bg-white/50"></span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Diagonal Banner v2 Alt Component - Alternative version with solid color backgrounds
function DiagonalBannerV2Alt({ match, ctaLabel = 'AI Detailed Analysis', homeTeamStats, awayTeamStats, accentColor = 'red' }: BannerCarouselProps) {
  const formatKickoff = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }),
      time: date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
    };
  };

  const kickoff = formatKickoff(match.kickoff_utc);

  return (
    <div className="relative w-full overflow-hidden rounded-2xl shadow-lg border border-gray-700">
      <div className="relative z-10 h-72">
        {/* Diagonal white separator line */}
        <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 -top-6 h-[130%] w-[4px] bg-white/90 shadow-md z-20 transform rotate-[-26deg]"></div>

        {/* Center VS badge */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-30">
          <div className="rounded-md px-3 py-1.5 bg-black/80 text-white font-extrabold tracking-wide text-sm border border-white/60 shadow-lg">VS</div>
        </div>

        {/* Left half - Home team side */}
        <div className="absolute left-0 top-0 w-1/2 h-full p-6 flex flex-col justify-between overflow-hidden" style={{ clipPath: 'polygon(0 0, 100% 0, 70% 100%, 0% 100%)' }}>
          {/* Home team solid background with gradient */}
          <div className="absolute inset-0 z-0 bg-gradient-to-r from-purple-600 via-purple-700 to-purple-800"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/90 via-purple-700/80 to-transparent z-10"></div>

          {/* Home crest - top left */}
          <div className="absolute top-4 left-4 z-30">
               <TeamLogo team={match.home_team} size={48} logoUrl={match.home_team_logo} />
          </div>

          <div className="relative z-20">
            <div className="mb-2 max-w-[85%]">
              <span className="text-white uppercase tracking-wider text-3xl sm:text-4xl md:text-5xl font-extrabold leading-[1.05] break-words">{match.home_team}</span>
            </div>
            <span className="inline-block text-white/90 bg-purple-600/80 backdrop-blur px-3 py-1 rounded-md font-semibold uppercase text-[10px] tracking-widest">{homeTeamStats || 'CHAMPIONS'}</span>
          </div>
          
          {/* CTA button */}
          <div className="relative z-20">
            <Link href={`/match/${match.id}`}>
              <button className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-600/40 text-sm md:text-base py-3 px-6 transform hover:scale-105 transition-transform flex items-center gap-2 rounded-xl font-extrabold uppercase tracking-wide">
                <BarChartIcon size={20} />
                {ctaLabel}
              </button>
            </Link>
          </div>
        </div>

        {/* Right half - Away team side */}
        <div className="absolute right-0 top-0 w-1/2 h-full p-6 flex flex-col items-end justify-between overflow-hidden" style={{ clipPath: 'polygon(30% 0, 100% 0, 100% 100%, 0% 100%)' }}>
          {/* Away team solid background with gradient */}
          <div className="absolute inset-0 z-0 bg-gradient-to-l from-yellow-500 via-yellow-600 to-yellow-700"></div>
          <div className="absolute inset-0 bg-gradient-to-l from-yellow-500/90 via-yellow-600/80 to-transparent z-10"></div>

          {/* Away crest - top right */}
          <div className="absolute top-4 right-4 z-30">
               <TeamLogo team={match.away_team} size={48} logoUrl={match.away_team_logo} />
          </div>

          <div className="relative z-20 text-right">
            <div className="mb-2 max-w-[85%] ml-auto">
              <span className="text-white uppercase tracking-wider text-3xl sm:text-4xl md:text-5xl font-extrabold leading-[1.05] break-words">{match.away_team}</span>
            </div>
            <span className="inline-block text-white/95 bg-yellow-600/80 backdrop-blur px-3 py-1 rounded-md font-semibold uppercase text-[10px] tracking-widest">{awayTeamStats || 'LEGENDS'}</span>
          </div>
        </div>

        {/* Bottom center date/time and dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 text-white text-sm font-semibold flex flex-col items-center">
          <div className="flex items-center gap-2">
            <Calendar size={16} />
            <span>{kickoff.date} | {kickoff.time} CET</span>
          </div>
          <div className="mt-2 flex gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-white/80"></span>
            <span className="w-1.5 h-1.5 rounded-full bg-white/50"></span>
            <span className="w-1.5 h-1.5 rounded-full bg-white/50"></span>
            <span className="w-1.5 h-1.5 rounded-full bg-white/50"></span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function BannerCarousel({ match, autoPlay = true, interval = 5000, accentColor = 'red', ctaLabel = 'AI Detailed Analysis', showRibbon = false, design = 'carousel', homeTeamStats, awayTeamStats }: BannerCarouselProps) {
  // Return diagonal design if requested
  if (design === 'diagonal') {
    return <DiagonalBanner match={match} ctaLabel={ctaLabel} homeTeamStats={homeTeamStats} awayTeamStats={awayTeamStats} accentColor={accentColor} />;
  }
  
  // Return diagonal v2 design if requested
  if (design === 'diagonal-v2') {
    return <DiagonalBannerV2 match={match} ctaLabel={ctaLabel} homeTeamStats={homeTeamStats} awayTeamStats={awayTeamStats} accentColor={accentColor} />;
  }
  
  // Return diagonal v2 alt design if requested
  if (design === 'diagonal-v2-alt') {
    return <DiagonalBannerV2Alt match={match} ctaLabel={ctaLabel} homeTeamStats={homeTeamStats} awayTeamStats={awayTeamStats} accentColor={accentColor} />;
  }

  // Original carousel logic
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isLoading, setIsLoading] = useState(true);
  const [isAIGenerating, setIsAIGenerating] = useState(false);
  const [aiResult, setAiResult] = useState<SimpleImageServiceResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Get images for this match
  const [images, setImages] = useState<UnsplashImage[]>([]);
  
  useEffect(() => {
    const loadImages = async () => {
      try {
        setIsLoading(true);
        setIsAIGenerating(true);
        setError(null);

        console.log(`🎠 Loading images for: ${match.home_team} vs ${match.away_team}`);
        
        try {
          // Use AI service to get better images
          const result = await simpleImageService.getBannerImages(match.home_team, match.away_team);
          
          setAiResult(result);
          setImages(result.images);
          
          if (!result.success) {
            console.warn('AI image service failed:', result.error);
            // Don't set error here, let it fall through to fallback
          } else if (result.aiQuery) {
            console.log(`🤖 AI Query: "${result.aiQuery.query}"`);
            console.log(`🔄 Fallback Query: "${result.aiQuery.fallbackQuery}"`);
            console.log(`📊 Source: ${result.source}`);
          }
        } catch (imageError) {
          console.warn('AI image service unavailable:', imageError);
          // Fall through to show carousel without background images
          setImages([]);
        }
        
      } catch (error) {
        console.error('Error in carousel:', error);
        setError(error instanceof Error ? error.message : 'Unknown error');
        setImages([]);
      } finally {
        setIsLoading(false);
        setIsAIGenerating(false);
      }
    };
    
    loadImages();
  }, [match]);
  
  // Auto-play functionality
  useEffect(() => {
    if (!isPlaying || images.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, interval);

    return () => clearInterval(timer);
  }, [isPlaying, images.length, interval]);



  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  const togglePlayPause = useCallback(() => {
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const accentButtonClasses = accentColor === 'green'
    ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-600/40'
    : 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/40';

  if (isLoading) {
    return (
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl p-8 flex flex-col justify-between h-72 relative border border-border shadow-lg animate-pulse">
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-transparent rounded-2xl"></div>
        <div className="relative z-10 flex flex-col h-full justify-between">
          <div>
            <div className="h-8 bg-gray-600 rounded w-3/4 mb-3"></div>
            <div className="flex items-center space-x-6 mt-3">
              <div className="h-4 bg-gray-600 rounded w-32"></div>
              <div className="h-4 bg-gray-600 rounded w-24"></div>
            </div>
            {isAIGenerating && (
              <div className="mt-4 flex items-center space-x-2 text-blue-400">
                <Brain className="w-4 h-4 animate-pulse" />
                <span className="text-sm">AI generating optimal search query...</span>
              </div>
            )}
          </div>
          <div className="h-12 bg-gray-600 rounded w-48"></div>
        </div>
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl p-8 flex flex-col justify-between h-72 relative border border-border shadow-lg">
        {showRibbon && (
          <div className="absolute top-4 left-4 z-20">
            <span className="bg-green-600 text-white text-xs font-semibold uppercase px-2 py-1 rounded">Match of the day</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-transparent rounded-2xl"></div>
        <div className="relative z-10 flex flex-col h-full justify-between">
          <div>
            <div className="flex items-center gap-2 md:gap-4 mb-4 flex-wrap">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <div className="flex-shrink-0">
                <TeamLogo team={match.home_team} size={48} logoUrl={match.home_team_logo} />
                </div>
                <span className="text-white text-lg sm:text-xl md:text-2xl font-bold break-words leading-tight">{match.home_team}</span>
              </div>
              <span className="text-white/70 text-lg sm:text-xl font-bold flex-shrink-0 px-2">VS</span>
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <span className="text-white text-lg sm:text-xl md:text-2xl font-bold break-words leading-tight">{match.away_team}</span>
                <div className="flex-shrink-0">
                <TeamLogo team={match.away_team} size={48} logoUrl={match.away_team_logo} />
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-6 mt-3 text-base text-muted-foreground">
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4" /> 
                {new Date(match.kickoff_utc).toLocaleDateString()}
              </span>
              <span className="flex items-center gap-2">
                <PinIcon /> 
                {match.venue || 'TBD'}
              </span>
            </div>

          </div>
          <div>
            <Link href={`/match/${match.id}`}>
              <Button className={`${accentButtonClasses} font-bold py-3 px-8 rounded-lg transition-colors flex items-center gap-3 text-lg transform hover:scale-105`}>
                <BarChartIcon /> {ctaLabel}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const currentImage = images[currentIndex];

  // Safety check - if no images or currentImage is undefined
  if (!currentImage || images.length === 0) {
    return (
      <div className="relative h-72 rounded-2xl overflow-hidden border border-border shadow-lg bg-gradient-to-r from-gray-900 to-gray-700">
        {showRibbon && (
          <div className="absolute top-4 left-4 z-20">
            <span className="bg-green-600 text-white text-xs font-semibold uppercase px-2 py-1 rounded">Match of the day</span>
          </div>
        )}
        <div className="relative z-10 flex flex-col h-full justify-between p-8">
          <div>
            <div className="flex items-center gap-2 md:gap-4 mb-4 flex-wrap">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <div className="flex-shrink-0">
                <TeamLogo team={match.home_team} size={48} logoUrl={match.home_team_logo} />
                </div>
                <span className="text-white text-lg sm:text-xl md:text-2xl font-bold break-words leading-tight">{match.home_team}</span>
              </div>
              <span className="text-white/70 text-lg sm:text-xl font-bold flex-shrink-0 px-2">VS</span>
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <span className="text-white text-lg sm:text-xl md:text-2xl font-bold break-words leading-tight">{match.away_team}</span>
                <div className="flex-shrink-0">
                <TeamLogo team={match.away_team} size={48} logoUrl={match.away_team_logo} />
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-6 mt-3 text-base text-muted-foreground">
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4" /> 
                {new Date(match.kickoff_utc).toLocaleDateString()}
              </span>
              <span className="flex items-center gap-2">
                <PinIcon /> 
                {match.venue || 'TBD'}
              </span>
            </div>
            <div className="mt-4">
              <p className="text-white/90 text-lg font-medium">
                Match Preview
              </p>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <Link href={`/match/${match.id}`}>
              <Button className={`${accentButtonClasses} font-bold py-3 px-8 rounded-lg transition-colors flex items-center gap-3 text-lg transform hover:scale-105`}>
                <BarChartIcon /> {ctaLabel}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-72 rounded-2xl overflow-hidden border border-border shadow-lg" onMouseEnter={() => setIsPlaying(false)} onMouseLeave={() => setIsPlaying(true)}>
      {showRibbon && (
        <div className="absolute top-4 left-4 z-20">
          <span className="bg-green-600 text-white text-xs font-semibold uppercase px-2 py-1 rounded">Match of the day</span>
        </div>
      )}
      {/* Background Image with Smooth Transition */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-all duration-1000 ease-in-out"
        style={{ 
          backgroundImage: `url(${currentImage.url})`,
          transform: `scale(1.05)` // Slight zoom for better effect
        }}
      />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-transparent"></div>
      
      {/* Content */}
      <div className="relative z-10 flex flex-col h-full justify-between p-8">
        <div>
          <div className="flex items-center gap-2 md:gap-4 mb-4 flex-wrap">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <div className="flex-shrink-0">
              <TeamLogo team={match.home_team} size={48} logoUrl={match.home_team_logo} />
              </div>
              <span className="text-white text-lg sm:text-xl md:text-2xl font-bold break-words leading-tight">{match.home_team}</span>
            </div>
            <span className="text-white/70 text-lg sm:text-xl font-bold flex-shrink-0 px-2">VS</span>
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <span className="text-white text-lg sm:text-xl md:text-2xl font-bold break-words leading-tight">{match.away_team}</span>
              <div className="flex-shrink-0">
              <TeamLogo team={match.away_team} size={48} logoUrl={match.away_team_logo} />
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-6 mt-3 text-base text-muted-foreground">
            <span className="flex items-center gap-2">
              <Calendar className="w-4 h-4" /> 
              {new Date(match.kickoff_utc).toLocaleDateString()}
            </span>
            <span className="flex items-center gap-2">
              <PinIcon /> 
              {match.venue || 'TBD'}
            </span>
          </div>
          
          {/* Error Display */}
          {error && (
            <div className="mt-4 flex items-center space-x-2 text-yellow-400">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">Unable to load images: {error}</span>
            </div>
          )}
          
          {/* Image Description */}
          <div className="mt-4">
            <p className="text-white/90 text-sm font-medium">
              {currentImage.description}
            </p>
            {/* AI Query Info */}
            {aiResult?.aiQuery && (
              <div className="mt-2 flex items-center space-x-2 text-white/60">
                <Brain className="w-3 h-3" />
                <span className="text-xs">
                  AI Query: "{aiResult.aiQuery.query}" 
                  <span className="ml-1 text-white/40">({aiResult.source})</span>
                </span>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <Link href={`/match/${match.id}`}>
            <Button className={`${accentButtonClasses} font-bold py-3 px-8 rounded-lg transition-colors flex items-center gap-3 text-lg transform hover:scale-105`}>
              <BarChartIcon /> {ctaLabel}
            </Button>
          </Link>
          
          {/* Carousel Controls */}
          {images.length > 1 && (
            <div className="flex items-center gap-2">
              <Button
                onClick={togglePlayPause}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </Button>
            </div>
          )}
        </div>
      </div>
      
      {/* Navigation Arrows */}
      {images.length > 1 && (
        <>
          <Button
            onClick={prevSlide}
            variant="ghost"
            size="sm"
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 z-20"
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>
          
          <Button
            onClick={nextSlide}
            variant="ghost"
            size="sm"
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 z-20"
          >
            <ChevronRight className="w-6 h-6" />
          </Button>
        </>
      )}
      
      {/* Dots Indicator */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
          {images.map((_: UnsplashImage, index: number) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentIndex 
                  ? 'bg-white scale-125' 
                  : 'bg-white/50 hover:bg-white/75'
              }`}
            />
          ))}
        </div>
      )}
      
      {/* Image Counter */}
      {images.length > 1 && (
        <div className="absolute top-4 right-4 bg-black/50 text-white text-xs px-2 py-1 rounded-full z-20">
          {currentIndex + 1} / {images.length}
        </div>
      )}
    </div>
  );
} 