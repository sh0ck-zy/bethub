'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, BarChart3, ChevronLeft, ChevronRight, Play, Pause, Brain, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { type UnsplashImage } from '@/lib/services/unsplashImageService';
import { simpleImageService, type SimpleImageServiceResult } from '@/lib/services/simpleImageService';
import type { Match } from '@/lib/types';

interface BannerCarouselProps {
  match: Match;
  autoPlay?: boolean;
  interval?: number;
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

export function BannerCarousel({ match, autoPlay = true, interval = 5000 }: BannerCarouselProps) {
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

        console.log(`🎠 Loading AI-generated images for: ${match.home_team} vs ${match.away_team}`);
        
        // Use AI service to get better images
        const result = await simpleImageService.getBannerImages(match.home_team, match.away_team);
        
        setAiResult(result);
        setImages(result.images);
        
        if (!result.success) {
          setError(result.error || 'Failed to load images');
        }

        // Log AI query for debugging
        if (result.aiQuery) {
          console.log(`🤖 AI Query: "${result.aiQuery.query}"`);
          console.log(`🔄 Fallback Query: "${result.aiQuery.fallbackQuery}"`);
          console.log(`📊 Source: ${result.source}`);
        }
        
      } catch (error) {
        console.error('Error loading AI carousel images:', error);
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

  // Loading effect
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

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
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-transparent rounded-2xl"></div>
        <div className="relative z-10 flex flex-col h-full justify-between">
          <div>
            <h2 className="text-white text-4xl font-bold tracking-tight">
              {match.home_team} VS {match.away_team}
            </h2>
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
            {error && (
              <div className="mt-4 flex items-center space-x-2 text-yellow-400">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">Unable to load images: {error}</span>
              </div>
            )}
            {aiResult && (
              <div className="mt-2 text-xs text-gray-400">
                AI Query: "{aiResult.aiQuery?.query}" ({aiResult.source})
              </div>
            )}
          </div>
          <div>
            <Link href={`/match/${match.id}`}>
              <Button className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-lg transition-colors flex items-center gap-3 text-lg shadow-lg shadow-red-600/40 transform hover:scale-105">
                <BarChartIcon /> AI Detailed Analysis
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const currentImage = images[currentIndex];

  return (
    <div className="relative h-72 rounded-2xl overflow-hidden border border-border shadow-lg">
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
          <h2 className="text-white text-4xl font-bold tracking-tight">
            {match.home_team} VS {match.away_team}
          </h2>
          <div className="flex items-center space-x-6 mt-3 text-base text-muted-foreground">
            <span className="flex items-center gap-2">
              <Calendar className="w-4 h-4" /> 
              {new Date(match.kickoff_utc).toLocaleDateString()}
            </span>
            <span className="flex items-center gap-2">
              <PinIcon /> 
              {currentImage.venue || match.venue || 'TBD'}
            </span>
          </div>
          
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
            <Button className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-lg transition-colors flex items-center gap-3 text-lg shadow-lg shadow-red-600/40 transform hover:scale-105">
              <BarChartIcon /> AI Detailed Analysis
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