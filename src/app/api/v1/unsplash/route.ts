import { NextRequest, NextResponse } from 'next/server';

// Unsplash API key (server-side only)
const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    const count = searchParams.get('count') || '10';
    const team = searchParams.get('team') || '';

    if (!query) {
      return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
    }

    console.log(`🔍 Server-side Unsplash search: "${query}" (count: ${count}, team: ${team})`);

    // Check if we have a valid API key
    if (!UNSPLASH_ACCESS_KEY || UNSPLASH_ACCESS_KEY === 'demo_key') {
      console.log('⚠️ No Unsplash API key, using mock data');
      return NextResponse.json({
        success: true,
        images: generateMockImages(query, parseInt(count), team),
        source: 'mock'
      });
    }

    // Call Unsplash API
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=${count}&orientation=landscape`,
      {
        headers: {
          'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`
        }
      }
    );

    if (!response.ok) {
      console.error(`Unsplash API error: ${response.status}`);
      return NextResponse.json({
        success: true,
        images: generateMockImages(query, parseInt(count), team),
        source: 'mock-fallback'
      });
    }

    const data = await response.json();
    const results = data.results || [];

    console.log(`✅ Found ${results.length} real Unsplash images for "${query}"`);

    // Transform results to our format
    const transformedImages = results.map((result: any) => ({
      id: result.id,
      url: result.urls.regular,
      thumbnailUrl: result.urls.thumb,
      description: result.alt_description || `${team} - ${query}`,
      photographer: result.user.name,
      team: team,
      tags: query.split(' ').filter(word => word.length > 2)
    }));

    // If no results, fallback to mock
    if (transformedImages.length === 0) {
      console.log(`⚠️ No Unsplash results for "${query}", using mock data`);
      return NextResponse.json({
        success: true,
        images: generateMockImages(query, parseInt(count), team),
        source: 'mock-fallback'
      });
    }

    return NextResponse.json({
      success: true,
      images: transformedImages,
      source: 'unsplash-api'
    });

  } catch (error) {
    console.error('Unsplash API error:', error);
    
    // Fallback to mock data on error
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query') || '';
    const count = searchParams.get('count') || '10';
    const team = searchParams.get('team') || '';

    return NextResponse.json({
      success: true,
      images: generateMockImages(query, parseInt(count), team),
      source: 'mock-error'
    });
  }
}

// Generate mock images for fallback
function generateMockImages(query: string, count: number, team: string) {
  const results = [];
  
  // Botafogo-specific images
  const botafogoImages = [
    {
      id: 'botafogo-crowd-1',
      url: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1200&h=600&fit=crop&q=80',
      description: 'Botafogo fans in black and white stripes celebrating'
    },
    {
      id: 'botafogo-crowd-2',
      url: 'https://images.unsplash.com/photo-1578662015879-bd1916fdd1d4?w=1200&h=600&fit=crop&q=80',
      description: 'Passionate Botafogo supporters with flags'
    },
    {
      id: 'botafogo-stadium-1',
      url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200&h=600&fit=crop&q=80',
      description: 'Nilton Santos stadium with Botafogo atmosphere'
    },
    {
      id: 'botafogo-classic-1',
      url: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=1200&h=600&fit=crop&q=80',
      description: 'Classic Botafogo match atmosphere'
    }
  ];

  // Brazilian football images
  const brazilianImages = [
    {
      id: 'brazilian-crowd-1',
      url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&h=600&fit=crop&q=80',
      description: 'Passionate Brazilian football crowd'
    },
    {
      id: 'brazilian-crowd-2',
      url: 'https://images.unsplash.com/photo-1553778263-73a83bab9b0c?w=1200&h=600&fit=crop&q=80',
      description: 'Brazilian football fans with flags and colors'
    },
    {
      id: 'rio-stadium-1',
      url: 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=1200&h=600&fit=crop&q=80',
      description: 'Rio de Janeiro football stadium atmosphere'
    }
  ];

  // Select appropriate images based on query/team
  let selectedImages = [];
  if (query.includes('botafogo') || team === 'Botafogo') {
    selectedImages = botafogoImages;
  } else if (query.includes('brazil') || query.includes('rio') || query.includes('carioca')) {
    selectedImages = brazilianImages;
  } else {
    selectedImages = [...botafogoImages, ...brazilianImages];
  }
  
  for (let i = 0; i < count; i++) {
    const imageIndex = i % selectedImages.length;
    const image = selectedImages[imageIndex];
    const imageId = Math.floor(Math.random() * 1000000);
    
    results.push({
      id: `mock-${image.id}-${imageId}`,
      url: image.url,
      thumbnailUrl: image.url.replace('w=1200&h=600', 'w=400&h=200'),
      description: `${query} - ${image.description}`,
      photographer: 'Sports Photographer Brazil',
      team: team,
      tags: query.split(' ').filter(word => word.length > 2)
    });
  }
  
  return results;
}