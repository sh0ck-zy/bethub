// Simple AI Image Service for generating contextual banner images
// Uses AI to create better search queries and fetch relevant images

import { UnsplashImage } from './unsplashImageService';

// Groq API configuration
const GROQ_API_KEY = process.env.NEXT_PUBLIC_GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// Unsplash API endpoint
const UNSPLASH_API_ENDPOINT = '/api/v1/unsplash';

export interface SimpleImageQuery {
  query: string;
  fallbackQuery: string;
}

export interface SimpleImageServiceResult {
  success: boolean;
  images: UnsplashImage[];
  aiQuery?: SimpleImageQuery;
  source: 'ai-generated' | 'fallback' | 'error';
  error?: string;
}

class SimpleAIQueryGenerator {
  private apiKey = GROQ_API_KEY;
  
  /**
   * Generate a single, specific query for match images
   * Takes 2 teams, returns 1 great query
   */
  async generateImageQuery(homeTeam: string, awayTeam: string): Promise<SimpleImageQuery> {
    // Skip AI if no key, use smart fallback
    if (!this.apiKey || this.apiKey === 'demo_key') {
      console.log('🔄 No Groq API key, using smart fallback');
      return this.getSmartFallback(homeTeam, awayTeam);
    }

    try {
      const response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: [{
            role: 'user',
            content: this.buildSimplePrompt(homeTeam, awayTeam)
          }],
          temperature: 0.2,
          max_tokens: 50
        })
      });

      if (!response.ok) {
        throw new Error(`Groq API error: ${response.status}`);
      }

      const data = await response.json();
      const aiQuery = data.choices[0].message.content.trim();
      
      console.log(`🤖 AI suggests: "${aiQuery}"`);
      
      return {
        query: aiQuery,
        fallbackQuery: `${homeTeam} football fans crowd`
      };
      
    } catch (error) {
      console.error('AI query generation failed:', error);
      return this.getSmartFallback(homeTeam, awayTeam);
    }
  }

  /**
   * Smart fallback when AI is not available
   */
  private getSmartFallback(homeTeam: string, awayTeam: string): SimpleImageQuery {
    // Hardcoded smart queries for popular teams
    const smartQueries: Record<string, string> = {
      'Botafogo': 'botafogo torcida estrela solitaria',
      'Flamengo': 'flamengo torcida maracana red',
      'Santos': 'santos peixe vila belmiro crowd',
      'Palmeiras': 'palmeiras allianz parque verde',
      'Corinthians': 'corinthians fiel torcida arena',
      'Barcelona': 'barcelona camp nou crowd celebration',
      'Real Madrid': 'real madrid bernabeu crowd',
      'Liverpool': 'liverpool anfield crowd atmosphere',
      'Manchester United': 'manchester united old trafford crowd',
      'Arsenal': 'arsenal emirates stadium crowd'
    };

    const primaryTeam = homeTeam; // Usually home team gets priority
    const smartQuery = smartQueries[primaryTeam] || `${primaryTeam} football fans crowd`;

    return {
      query: smartQuery,
      fallbackQuery: `${primaryTeam} vs ${awayTeam} football`
    };
  }

  /**
   * Simple, effective prompt that works
   */
  private buildSimplePrompt(homeTeam: string, awayTeam: string): string {
    return `Generate ONE search query for Unsplash to find the best banner image for ${homeTeam} vs ${awayTeam}.

Focus on:
- The bigger/more popular team (like sports media would)
- Fans and crowd atmosphere over generic stadium shots
- Specific terms that get authentic, passionate images
- 4-6 words maximum

Good examples:
- "Flamengo vs Botafogo" → "flamengo torcida maracana red"
- "Barcelona vs Getafe" → "barcelona fans camp nou celebration"
- "Santos vs Palmeiras" → "santos peixe vila belmiro crowd"

Bad examples:
- "football match stadium" (too generic)
- "team vs team soccer" (boring stock photos)
- "players on field" (not engaging)

${homeTeam} vs ${awayTeam} →`;
  }

  public async getBannerImages(homeTeam: string, awayTeam: string): Promise<SimpleImageServiceResult> {
    try {
      console.log(`🎯 Getting banner images for ${homeTeam} vs ${awayTeam}`);
      
      // Step 1: AI generates better query
      const { query, fallbackQuery } = await this.generateImageQuery(homeTeam, awayTeam);
      console.log(`🤖 AI suggests: "${query}"`);
      
      // Step 2: Search with AI query
      let images = await this.searchImages(query, homeTeam, awayTeam);
      
      // Step 3: Fallback if needed
      if (images.length < 3) {
        console.log(`🔄 Trying fallback: "${fallbackQuery}"`);
        const fallbackImages = await this.searchImages(fallbackQuery, homeTeam, awayTeam);
        images = [...images, ...fallbackImages];
      }
      
      return {
        success: true,
        images: this.formatImages(images, homeTeam),
        aiQuery: { query, fallbackQuery },
        source: images.length > 0 ? 'ai-generated' : 'fallback'
      };

    } catch (error) {
      console.error('❌ Banner image generation failed:', error);
      
      // Final fallback to generic football images
      const fallbackImages = await this.searchImages(`${homeTeam} ${awayTeam} football`, homeTeam, awayTeam);
      
      return {
        success: false,
        images: this.formatImages(fallbackImages, homeTeam),
        source: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async searchImages(query: string, homeTeam: string, awayTeam: string): Promise<any[]> {
    try {
      console.log(`🔍 Searching images with query: "${query}"`);

      const response = await fetch(
        `${UNSPLASH_API_ENDPOINT}?query=${encodeURIComponent(query)}&count=5&team=${encodeURIComponent(homeTeam)}`
      );

      if (!response.ok) {
        throw new Error(`Image search failed: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.images) {
        console.log(`✅ Found ${data.images.length} images for query: "${query}"`);
        return data.images;
      }

      return [];
    } catch (error) {
      console.error(`❌ Image search failed for query "${query}":`, error);
      return [];
    }
  }

  private formatImages(rawImages: any[], primaryTeam: string): UnsplashImage[] {
    return rawImages.map(img => ({
      id: img.id,
      url: img.url,
      thumbnailUrl: img.thumbnailUrl,
      description: img.description || `${primaryTeam} match image`,
      photographer: img.photographer,
      team: primaryTeam,
      venue: this.determineVenue(primaryTeam),
      category: 'crowd' as const,
      tags: img.tags || [],
      verified: true
    }));
  }

  private determineCategory(query: string): 'stadium' | 'crowd' | 'players' | 'history' | 'atmosphere' {
    if (query.includes('crowd') || query.includes('fans') || query.includes('supporters') || query.includes('torcida')) {
      return 'crowd';
    }
    if (query.includes('stadium') || query.includes('arena') || query.includes('ground')) {
      return 'stadium';
    }
    if (query.includes('players') || query.includes('action') || query.includes('match')) {
      return 'players';
    }
    if (query.includes('history') || query.includes('historic') || query.includes('classic')) {
      return 'history';
    }
    return 'atmosphere';
  }

  private determineVenue(team: string): string | undefined {
    const venues: Record<string, string> = {
      'Botafogo': 'Nilton Santos',
      'Flamengo': 'Maracanã',
      'Santos': 'Vila Belmiro',
      'Palmeiras': 'Allianz Parque',
      'Corinthians': 'Arena Corinthians',
      'Real Madrid': 'Santiago Bernabéu',
      'Barcelona': 'Camp Nou',
      'Manchester United': 'Old Trafford',
      'Liverpool': 'Anfield',
      'Arsenal': 'Emirates Stadium',
      'Chelsea': 'Stamford Bridge'
    };

    return venues[team];
  }
}

// Export singleton instance
export const simpleImageService = new SimpleAIQueryGenerator();