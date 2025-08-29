// Providers de imagens para o ecossistema de banner
// Integração com APIs reais de busca de imagens

export interface ImageResult {
  id: string;
  url: string;
  thumbnailUrl: string;
  width: number;
  height: number;
  description: string;
  photographer: string;
  source: 'pexels' | 'unsplash' | 'fallback';
  license: string;
  tags: string[];
  quality: 'low' | 'medium' | 'high';
  aspectRatio: string;
  downloadUrl?: string;
}

export interface SearchOptions {
  query: string;
  aspectRatio?: '16:9' | '4:3' | '1:1' | '3:2';
  orientation?: 'landscape' | 'portrait' | 'square';
  minWidth?: number;
  minHeight?: number;
  maxResults?: number;
  quality?: 'low' | 'medium' | 'high';
}

// Provider base abstrato
export abstract class ImageProvider {
  abstract name: string;
  abstract apiKey?: string;
  
  abstract searchImages(options: SearchOptions): Promise<ImageResult[]>;
  abstract getImageById(id: string): Promise<ImageResult | null>;
  
  protected abstract transformToImageResult(rawData: any): ImageResult;
}

// Provider Pexels
export class PexelsImageProvider extends ImageProvider {
  name = 'pexels';
  apiKey = process.env.PEXELS_API_KEY;
  private baseUrl = 'https://api.pexels.com/v1';
  
  async searchImages(options: SearchOptions): Promise<ImageResult[]> {
    if (!this.apiKey) {
      console.warn('⚠️ Pexels API key não configurada');
      return [];
    }
    
    try {
      const params = new URLSearchParams({
        query: options.query,
        per_page: (options.maxResults || 10).toString(),
        orientation: options.orientation || 'landscape'
      });
      
      const response = await fetch(`${this.baseUrl}/search?${params}`, {
        headers: {
          'Authorization': this.apiKey
        }
      });
      
      if (!response.ok) {
        throw new Error(`Pexels API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      return data.photos
        .filter((photo: any) => {
          // Filtrar por dimensões mínimas
          if (options.minWidth && photo.width < options.minWidth) return false;
          if (options.minHeight && photo.height < options.minHeight) return false;
          
          // Filtrar por aspect ratio
          if (options.aspectRatio) {
            const ratio = photo.width / photo.height;
            const targetRatio = this.parseAspectRatio(options.aspectRatio);
            const tolerance = 0.1;
            
            if (Math.abs(ratio - targetRatio) > tolerance) return false;
          }
          
          return true;
        })
        .map((photo: any) => this.transformToImageResult(photo))
        .slice(0, options.maxResults || 10);
        
    } catch (error) {
      console.error('❌ Erro ao buscar imagens no Pexels:', error);
      return [];
    }
  }
  
  async getImageById(id: string): Promise<ImageResult | null> {
    if (!this.apiKey) return null;
    
    try {
      const response = await fetch(`${this.baseUrl}/photos/${id}`, {
        headers: {
          'Authorization': this.apiKey
        }
      });
      
      if (!response.ok) return null;
      
      const photo = await response.json();
      return this.transformToImageResult(photo);
      
    } catch (error) {
      console.error('❌ Erro ao buscar imagem por ID no Pexels:', error);
      return null;
    }
  }
  
  protected transformToImageResult(photo: any): ImageResult {
    const aspectRatio = photo.width / photo.height;
    
    return {
      id: photo.id.toString(),
      url: photo.src.large2x || photo.src.large,
      thumbnailUrl: photo.src.medium,
      width: photo.width,
      height: photo.height,
      description: photo.alt || 'Football match image',
      photographer: photo.photographer,
      source: 'pexels',
      license: 'Free to use',
      tags: [],
      quality: this.assessQuality(photo.width, photo.height),
      aspectRatio: this.formatAspectRatio(aspectRatio),
      downloadUrl: photo.src.original
    };
  }
  
  private parseAspectRatio(ratio: string): number {
    const [width, height] = ratio.split(':').map(Number);
    return width / height;
  }
  
  private formatAspectRatio(ratio: number): string {
    if (Math.abs(ratio - 16/9) < 0.1) return '16:9';
    if (Math.abs(ratio - 4/3) < 0.1) return '4:3';
    if (Math.abs(ratio - 1) < 0.1) return '1:1';
    if (Math.abs(ratio - 3/2) < 0.1) return '3:2';
    return `${Math.round(ratio * 100) / 100}:1`;
  }
  
  private assessQuality(width: number, height: number): 'low' | 'medium' | 'high' {
    const pixels = width * height;
    if (pixels >= 4000000) return 'high'; // 4MP+
    if (pixels >= 1000000) return 'medium'; // 1MP+
    return 'low';
  }
}

// Provider Unsplash
export class UnsplashImageProvider extends ImageProvider {
  name = 'unsplash';
  apiKey = process.env.UNSPLASH_API_KEY;
  private baseUrl = 'https://api.unsplash.com';
  
  async searchImages(options: SearchOptions): Promise<ImageResult[]> {
    if (!this.apiKey) {
      console.warn('⚠️ Unsplash API key não configurada');
      return [];
    }
    
    try {
      const params = new URLSearchParams({
        query: options.query,
        per_page: (options.maxResults || 10).toString(),
        orientation: options.orientation || 'landscape'
      });
      
      const response = await fetch(`${this.baseUrl}/search/photos?${params}`, {
        headers: {
          'Authorization': `Client-ID ${this.apiKey}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Unsplash API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      return data.results
        .filter((photo: any) => {
          if (options.minWidth && photo.width < options.minWidth) return false;
          if (options.minHeight && photo.height < options.minHeight) return false;
          
          if (options.aspectRatio) {
            const ratio = photo.width / photo.height;
            const targetRatio = this.parseAspectRatio(options.aspectRatio);
            const tolerance = 0.1;
            
            if (Math.abs(ratio - targetRatio) > tolerance) return false;
          }
          
          return true;
        })
        .map((photo: any) => this.transformToImageResult(photo))
        .slice(0, options.maxResults || 10);
        
    } catch (error) {
      console.error('❌ Erro ao buscar imagens no Unsplash:', error);
      return [];
    }
  }
  
  async getImageById(id: string): Promise<ImageResult | null> {
    if (!this.apiKey) return null;
    
    try {
      const response = await fetch(`${this.baseUrl}/photos/${id}`, {
        headers: {
          'Authorization': `Client-ID ${this.apiKey}`
        }
      });
      
      if (!response.ok) return null;
      
      const photo = await response.json();
      return this.transformToImageResult(photo);
      
    } catch (error) {
      console.error('❌ Erro ao buscar imagem por ID no Unsplash:', error);
      return null;
    }
  }
  
  protected transformToImageResult(photo: any): ImageResult {
    const aspectRatio = photo.width / photo.height;
    
    return {
      id: photo.id,
      url: photo.urls.regular,
      thumbnailUrl: photo.urls.small,
      width: photo.width,
      height: photo.height,
      description: photo.alt_description || photo.description || 'Football match image',
      photographer: photo.user?.name || 'Unknown',
      source: 'unsplash',
      license: 'Free to use',
      tags: photo.tags?.map((tag: any) => tag.title) || [],
      quality: this.assessQuality(photo.width, photo.height),
      aspectRatio: this.formatAspectRatio(aspectRatio),
      downloadUrl: photo.links.download
    };
  }
  
  private parseAspectRatio(ratio: string): number {
    const [width, height] = ratio.split(':').map(Number);
    return width / height;
  }
  
  private formatAspectRatio(ratio: number): string {
    if (Math.abs(ratio - 16/9) < 0.1) return '16:9';
    if (Math.abs(ratio - 4/3) < 0.1) return '4:3';
    if (Math.abs(ratio - 1) < 0.1) return '1:1';
    if (Math.abs(ratio - 3/2) < 0.1) return '3:2';
    return `${Math.round(ratio * 100) / 100}:1`;
  }
  
  private assessQuality(width: number, height: number): 'low' | 'medium' | 'high' {
    const pixels = width * height;
    if (pixels >= 4000000) return 'high';
    if (pixels >= 1000000) return 'medium';
    return 'low';
  }
}

// Provider de fallback com imagens locais
export class FallbackImageProvider extends ImageProvider {
  name = 'fallback';
  apiKey = undefined;
  
  private fallbackImages: ImageResult[] = [
    {
      id: 'fallback-1',
      url: 'https://images.pexels.com/photos/3621104/pexels-photo-3621104.jpeg',
      thumbnailUrl: 'https://images.pexels.com/photos/3621104/pexels-photo-3621104.jpeg?auto=compress&cs=tinysrgb&w=400',
      width: 1920,
      height: 1080,
      description: 'Football stadium with crowd',
      photographer: 'Pexels',
      source: 'fallback',
      license: 'Free to use',
      tags: ['football', 'stadium', 'crowd'],
      quality: 'high',
      aspectRatio: '16:9'
    },
    {
      id: 'fallback-2',
      url: 'https://images.pexels.com/photos/3628925/pexels-photo-3628925.jpeg',
      thumbnailUrl: 'https://images.pexels.com/photos/3628925/pexels-photo-3628925.jpeg?auto=compress&cs=tinysrgb&w=400',
      width: 1920,
      height: 1080,
      description: 'Football players in action',
      photographer: 'Pexels',
      source: 'fallback',
      license: 'Free to use',
      tags: ['football', 'players', 'action'],
      quality: 'high',
      aspectRatio: '16:9'
    },
    {
      id: 'fallback-3',
      url: 'https://images.pexels.com/photos/3621104/pexels-photo-3621104.jpeg',
      thumbnailUrl: 'https://images.pexels.com/photos/3621104/pexels-photo-3621104.jpeg?auto=compress&cs=tinysrgb&w=400',
      width: 1920,
      height: 1080,
      description: 'Football field with lights',
      photographer: 'Pexels',
      source: 'fallback',
      license: 'Free to use',
      tags: ['football', 'field', 'lights'],
      quality: 'high',
      aspectRatio: '16:9'
    }
  ];
  
  async searchImages(options: SearchOptions): Promise<ImageResult[]> {
    // Simular busca baseada em query
    const query = options.query.toLowerCase();
    
    const filtered = this.fallbackImages.filter(image => {
      return image.description.toLowerCase().includes(query) ||
             image.tags.some(tag => tag.toLowerCase().includes(query));
    });
    
    return filtered.slice(0, options.maxResults || 3);
  }
  
  async getImageById(id: string): Promise<ImageResult | null> {
    return this.fallbackImages.find(img => img.id === id) || null;
  }
  
  protected transformToImageResult(rawData: any): ImageResult {
    return rawData;
  }
}

// Gerenciador de providers
export class ImageProviderManager {
  private providers: ImageProvider[] = [];
  
  constructor() {
    // Adicionar providers na ordem de preferência
    this.providers.push(new PexelsImageProvider());
    this.providers.push(new UnsplashImageProvider());
    this.providers.push(new FallbackImageProvider());
  }
  
  async searchImages(options: SearchOptions): Promise<ImageResult[]> {
    console.log(`🔍 Buscando imagens: "${options.query}"`);
    
    for (const provider of this.providers) {
      try {
        const results = await provider.searchImages(options);
        
        if (results.length > 0) {
          console.log(`✅ ${results.length} imagens encontradas no ${provider.name}`);
          return results;
        }
      } catch (error) {
        console.warn(`⚠️ Erro no provider ${provider.name}:`, error);
        continue;
      }
    }
    
    console.log('❌ Nenhuma imagem encontrada em nenhum provider');
    return [];
  }
  
  async getImageById(id: string, source?: string): Promise<ImageResult | null> {
    if (source) {
      const provider = this.providers.find(p => p.name === source);
      if (provider) {
        return await provider.getImageById(id);
      }
    }
    
    // Tentar em todos os providers
    for (const provider of this.providers) {
      try {
        const result = await provider.getImageById(id);
        if (result) return result;
      } catch (error) {
        continue;
      }
    }
    
    return null;
  }
  
  getAvailableProviders(): string[] {
    return this.providers.map(p => p.name);
  }
}

// Instância global
export const imageProviderManager = new ImageProviderManager(); 