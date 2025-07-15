// Improved Unsplash Service with specific queries for Botafogo fans
// src/lib/services/unsplashImageService.ts (replacement)

export interface UnsplashImage {
  id: string;
  url: string;
  thumbnailUrl: string;
  description: string;
  photographer: string;
  team: string;
  venue?: string;
  category: 'stadium' | 'crowd' | 'players' | 'history' | 'atmosphere';
  tags: string[];
  verified: boolean;
}

// Use server-side API endpoint for Unsplash calls
const UNSPLASH_API_ENDPOINT = '/api/v1/unsplash';

// Queries MUITO específicas para times brasileiros (especialmente Botafogo)
const BRAZILIAN_TEAM_QUERIES = {
  'Botafogo': [
    'botafogo rio janeiro crowd',
    'botafogo torcida estrela solitária',
    'botafogo fans nilton santos',
    'botafogo supporters brazil',
    'botafogo ultras rio',
    'botafogo crowd maracana',
    'botafogo black white stripes fans',
    'botafogo estrela solitária crowd',
    'botafogo rio football atmosphere',
    'botafogo carnival football',
    'brazilian football fans botafogo',
    'rio janeiro football crowd',
    'nilton santos stadium crowd',
    'botafogo glorioso crowd'
  ],
  'Flamengo': [
    'flamengo maracana crowd',
    'flamengo torcida urubu',
    'flamengo fans rio janeiro',
    'flamengo supporters maracana',
    'flamengo red black crowd',
    'flamengo nacao rubro negra',
    'flamengo crowd biggest fanbase',
    'maracana flamengo atmosphere'
  ],
  'Santos': [
    'santos vila belmiro crowd',
    'santos torcida peixe',
    'santos fans brazil',
    'vila belmiro atmosphere',
    'santos supporters sao paulo',
    'santos crowd historic'
  ],
  'Palmeiras': [
    'palmeiras allianz parque crowd',
    'palmeiras torcida verdao',
    'palmeiras fans sao paulo',
    'palmeiras supporters green',
    'allianz parque atmosphere'
  ],
  'Corinthians': [
    'corinthians arena crowd',
    'corinthians torcida timao',
    'corinthians fans sao paulo',
    'arena corinthians atmosphere',
    'corinthians supporters brazil'
  ]
};

// Queries específicas para clássicos brasileiros
const BRAZILIAN_CLASSIC_QUERIES = {
  'Botafogo-Flamengo': [
    'botafogo flamengo classico carioca',
    'botafogo flamengo rivalry rio',
    'classico carioca crowd',
    'botafogo flamengo maracana',
    'rio janeiro football derby',
    'carioca rivalry atmosphere',
    'botafogo flamengo historic rivalry'
  ],
  'Botafogo-Vasco': [
    'botafogo vasco classico carioca',
    'botafogo vasco rivalry rio',
    'classico carioca vasco botafogo',
    'rio janeiro football classic'
  ],
  'Botafogo-Fluminense': [
    'botafogo fluminense classico vovo',
    'botafogo fluminense rivalry rio',
    'classico vovo rio janeiro',
    'oldest rivalry brazil football'
  ]
};

// Export for potential future use
export { BRAZILIAN_CLASSIC_QUERIES };

// Função melhorada para buscar imagens específicas via API server-side
async function searchUnsplashImages(query: string, count: number = 10, team: string = ''): Promise<any[]> {
  try {
    console.log(`🔍 Buscando imagens via API: "${query}" (team: ${team})`);
    
    const response = await fetch(
      `${UNSPLASH_API_ENDPOINT}?query=${encodeURIComponent(query)}&count=${count}&team=${encodeURIComponent(team)}`
    );
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.success) {
      console.log(`✅ Recebidas ${data.images.length} imagens (fonte: ${data.source})`);
      return data.images;
    } else {
      console.error('API returned error:', data.error);
      return [];
    }
    
  } catch (error) {
    console.error(`Erro ao buscar "${query}":`, error);
    return [];
  }
}

// Convert API response to UnsplashImage format
function convertApiResponseToUnsplashImage(apiImage: any, team: string, category: string, venue?: string): UnsplashImage {
  return {
    id: apiImage.id,
    url: apiImage.url,
    thumbnailUrl: apiImage.thumbnailUrl,
    description: apiImage.description,
    photographer: apiImage.photographer,
    team,
    venue,
    category: category as any,
    tags: apiImage.tags || [],
    verified: true
  };
}

// Função específica para Botafogo
export async function getBotafogoFansImages(): Promise<UnsplashImage[]> {
  console.log('🔥 Buscando imagens específicas da torcida do Botafogo...');
  
  const botafogoQueries = BRAZILIAN_TEAM_QUERIES['Botafogo'];
  const allImages: UnsplashImage[] = [];
  
  for (const query of botafogoQueries) {
    try {
      const results = await searchUnsplashImages(query, 3, 'Botafogo');
      
      for (const result of results) {
        const teamImage = convertApiResponseToUnsplashImage(
          result,
          'Botafogo',
          'crowd',
          'Nilton Santos'
        );
        
        // Add Botafogo-specific tags
        teamImage.tags = [...teamImage.tags, 'botafogo', 'torcida', 'rio', 'estrela solitária'];
        
        allImages.push(teamImage);
      }
    } catch (error) {
      console.error(`Erro ao buscar "${query}":`, error);
    }
  }
  
  // Remover duplicatas
  const uniqueImages = allImages.filter((image, index, self) => 
    index === self.findIndex(img => img.id === image.id)
  );
  
  console.log(`✅ Encontradas ${uniqueImages.length} imagens da torcida do Botafogo`);
  return uniqueImages;
}

// Função melhorada para times brasileiros
export async function getTeamImagesFromUnsplash(teamName: string): Promise<UnsplashImage[]> {
  const normalizedTeam = teamName.replace(' FC', '').replace('CR ', '').replace('SE ', '').replace('EC ', '');
  
  // Use queries específicas para times brasileiros
  const queries = BRAZILIAN_TEAM_QUERIES[normalizedTeam as keyof typeof BRAZILIAN_TEAM_QUERIES] || [
    `${normalizedTeam} football crowd`,
    `${normalizedTeam} fans brazil`,
    `${normalizedTeam} supporters`,
    `${normalizedTeam} stadium atmosphere`
  ];
  
  console.log(`🔍 Buscando imagens específicas para ${normalizedTeam}...`);
  
  const allImages: UnsplashImage[] = [];
  
  for (const query of queries) {
    try {
      const results = await searchUnsplashImages(query, 2, normalizedTeam);
      
      for (const result of results) {
        const teamImage = convertApiResponseToUnsplashImage(
          result,
          normalizedTeam,
          determineCategory(query),
          determineVenue(query, normalizedTeam)
        );
        
        allImages.push(teamImage);
      }
    } catch (error) {
      console.error(`Erro ao buscar "${query}":`, error);
    }
  }
  
  // Remover duplicatas
  const uniqueImages = allImages.filter((image, index, self) => 
    index === self.findIndex(img => img.id === image.id)
  );
  
  console.log(`✅ Encontradas ${uniqueImages.length} imagens para ${normalizedTeam}`);
  return uniqueImages;
}

// Função para determinar categoria baseada na query
function determineCategory(query: string): 'stadium' | 'crowd' | 'players' | 'history' | 'atmosphere' {
  if (query.includes('crowd') || query.includes('fans') || query.includes('torcida')) return 'crowd';
  if (query.includes('stadium') || query.includes('arena')) return 'stadium';
  if (query.includes('players') || query.includes('action')) return 'players';
  if (query.includes('history') || query.includes('historic')) return 'history';
  return 'atmosphere';
}

// Função para determinar venue baseada na query
function determineVenue(_query: string, team: string): string | undefined {
  const teamVenues: Record<string, string> = {
    'Botafogo': 'Nilton Santos',
    'Flamengo': 'Maracanã',
    'Santos': 'Vila Belmiro',
    'Palmeiras': 'Allianz Parque',
    'Corinthians': 'Arena Corinthians'
  };
  
  return teamVenues[team];
}

// Função principal para carousel melhorada
export async function getCarouselImagesFromUnsplash(match: any): Promise<UnsplashImage[]> {
  const homeTeam = match.home_team;
  const awayTeam = match.away_team;
  
  console.log(`🎠 Buscando imagens específicas para: ${homeTeam} vs ${awayTeam}`);
  
  try {
    // Se for um jogo do Botafogo, usar função específica
    if (homeTeam === 'Botafogo' || awayTeam === 'Botafogo') {
      const botafogoImages = await getBotafogoFansImages();
      if (botafogoImages.length > 0) {
        console.log(`🔥 Usando ${botafogoImages.length} imagens específicas do Botafogo`);
        return botafogoImages.slice(0, 5); // Limitar a 5 imagens
      }
    }
    
    // Para outros times, usar busca normal mas melhorada
    const homeImages = await getTeamImagesFromUnsplash(homeTeam);
    const awayImages = await getTeamImagesFromUnsplash(awayTeam);
    
    const allImages = [...homeImages, ...awayImages];
    
    // Remover duplicatas
    const uniqueImages = allImages.filter((image, index, self) => 
      index === self.findIndex(img => img.id === image.id)
    );
    
    console.log(`✅ Total de ${uniqueImages.length} imagens encontradas`);
    return uniqueImages.slice(0, 8); // Limitar a 8 imagens
    
  } catch (error) {
    console.error('Erro ao buscar imagens do carousel:', error);
    return [];
  }
} 