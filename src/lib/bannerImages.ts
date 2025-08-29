// Imagens explícitas de futebol para banners
// Todas as imagens são de uso livre (Unsplash, Pexels, Pixabay)

export const BANNER_IMAGES = {
  // Premier League
  'Manchester United': {
    'Liverpool': 'https://images.pexels.com/photos/399187/pexels-photo-399187.jpeg', // estádio cheio
    'default': 'https://images.pexels.com/photos/114296/pexels-photo-114296.jpeg', // bola no gramado
  },
  'Liverpool': {
    'Manchester United': 'https://images.pexels.com/photos/399187/pexels-photo-399187.jpeg',
    'default': 'https://images.pexels.com/photos/274506/pexels-photo-274506.jpeg', // jogadores comemorando
  },
  'Arsenal': {
    'Chelsea': 'https://images.pexels.com/photos/399187/pexels-photo-399187.jpeg',
    'default': 'https://images.pexels.com/photos/46798/pexels-photo-46798.jpeg', // chuteira e bola
  },
  'Chelsea': {
    'Arsenal': 'https://images.pexels.com/photos/399187/pexels-photo-399187.jpeg',
    'default': 'https://images.pexels.com/photos/274506/pexels-photo-274506.jpeg',
  },
  // La Liga
  'Real Madrid': {
    'Barcelona': 'https://images.pexels.com/photos/399187/pexels-photo-399187.jpeg',
    'default': 'https://images.pexels.com/photos/114296/pexels-photo-114296.jpeg',
  },
  'Barcelona': {
    'Real Madrid': 'https://images.pexels.com/photos/399187/pexels-photo-399187.jpeg',
    'default': 'https://images.pexels.com/photos/46798/pexels-photo-46798.jpeg',
  },
  // Serie A
  'Juventus': {
    'AC Milan': 'https://images.pexels.com/photos/399187/pexels-photo-399187.jpeg',
    'default': 'https://images.pexels.com/photos/114296/pexels-photo-114296.jpeg',
  },
  'AC Milan': {
    'Juventus': 'https://images.pexels.com/photos/399187/pexels-photo-399187.jpeg',
    'default': 'https://images.pexels.com/photos/274506/pexels-photo-274506.jpeg',
  },
  // Bundesliga
  'Bayern Munich': {
    'Borussia Dortmund': 'https://images.pexels.com/photos/399187/pexels-photo-399187.jpeg',
    'default': 'https://images.pexels.com/photos/46798/pexels-photo-46798.jpeg',
  },
  // Default para qualquer outro confronto
  'default': 'https://images.pexels.com/photos/399187/pexels-photo-399187.jpeg', // estádio lotado
};

export const getBannerImage = (homeTeam: string, awayTeam: string): string => {
  const homeTeamImages = BANNER_IMAGES[homeTeam as keyof typeof BANNER_IMAGES];
  if (homeTeamImages && typeof homeTeamImages === 'object' && 'default' in homeTeamImages) {
    const specificImage = (homeTeamImages as any)[awayTeam];
    if (specificImage) {
      return specificImage;
    }
    return (homeTeamImages as any).default || BANNER_IMAGES.default;
  }
  // Tenta o inverso
  const awayTeamImages = BANNER_IMAGES[awayTeam as keyof typeof BANNER_IMAGES];
  if (awayTeamImages && typeof awayTeamImages === 'object' && 'default' in awayTeamImages) {
    const specificImage = (awayTeamImages as any)[homeTeam];
    if (specificImage) {
      return specificImage;
    }
    return (awayTeamImages as any).default || BANNER_IMAGES.default;
  }
  return BANNER_IMAGES.default;
}; 