// Simple test to verify carousel functionality
import { getCarouselImagesFromUnsplash } from './src/lib/services/unsplashImageService.js';

async function testCarousel() {
  console.log('🎠 Testing Carousel Image Service...\n');
  
  const testMatch = {
    id: '1',
    home_team: 'Santos',
    away_team: 'Flamengo',
    league: 'Brasileirão'
  };
  
  console.log('📋 Test match:', testMatch.home_team, 'vs', testMatch.away_team);
  
  try {
    const images = await getCarouselImagesFromUnsplash(testMatch);
    
    console.log('✅ Images found:', images.length);
    
    images.forEach((img, index) => {
      console.log(`${index + 1}. ${img.description}`);
      console.log(`   - URL: ${img.url}`);
      console.log(`   - Team: ${img.team}`);
      console.log(`   - Category: ${img.category}`);
      console.log(`   - Venue: ${img.venue || 'N/A'}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testCarousel();