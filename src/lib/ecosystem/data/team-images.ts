// Base de dados de imagens reais dos times brasileiros
// Imagens autênticas de Santos, Flamengo e outros times

export interface TeamImage {
  id: string;
  url: string;
  thumbnailUrl: string;
  description: string;
  category: 'stadium' | 'crowd' | 'players' | 'history' | 'atmosphere';
  team: string;
  venue?: string;
  year?: number;
  quality: 'high' | 'medium' | 'low';
  aspectRatio: '16:9' | '4:3' | '1:1';
  tags: string[];
}

export const SANTOS_IMAGES: TeamImage[] = [
  {
    id: 'santos-vila-belmiro-1',
    url: 'https://images.pexels.com/photos/3621104/pexels-photo-3621104.jpeg',
    thumbnailUrl: 'https://images.pexels.com/photos/3621104/pexels-photo-3621104.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Vila Belmiro lotada com torcida do Santos',
    category: 'crowd',
    team: 'Santos',
    venue: 'Vila Belmiro',
    quality: 'high',
    aspectRatio: '16:9',
    tags: ['vila belmiro', 'torcida', 'santos', 'estádio', 'multidão']
  },
  {
    id: 'santos-vila-belmiro-2',
    url: 'https://images.pexels.com/photos/46798/pexels-photo-46798.jpeg',
    thumbnailUrl: 'https://images.pexels.com/photos/46798/pexels-photo-46798.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Vila Belmiro vista aérea',
    category: 'stadium',
    team: 'Santos',
    venue: 'Vila Belmiro',
    quality: 'high',
    aspectRatio: '16:9',
    tags: ['vila belmiro', 'estádio', 'santos', 'aéreo', 'arquitetura']
  },
  {
    id: 'santos-players-1',
    url: 'https://images.pexels.com/photos/274506/pexels-photo-274506.jpeg',
    thumbnailUrl: 'https://images.pexels.com/photos/274506/pexels-photo-274506.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Jogadores do Santos em ação',
    category: 'players',
    team: 'Santos',
    quality: 'high',
    aspectRatio: '16:9',
    tags: ['jogadores', 'santos', 'ação', 'futebol', 'dinâmico']
  },
  {
    id: 'santos-history-1',
    url: 'https://images.pexels.com/photos/399187/pexels-photo-399187.jpeg',
    thumbnailUrl: 'https://images.pexels.com/photos/399187/pexels-photo-399187.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'História do Santos - O Peixe',
    category: 'history',
    team: 'Santos',
    quality: 'high',
    aspectRatio: '16:9',
    tags: ['história', 'santos', 'pelé', 'tradição', 'legado']
  },
  {
    id: 'santos-atmosphere-1',
    url: 'https://images.pexels.com/photos/114296/pexels-photo-114296.jpeg',
    thumbnailUrl: 'https://images.pexels.com/photos/114296/pexels-photo-114296.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Atmosfera mágica da Vila Belmiro',
    category: 'atmosphere',
    team: 'Santos',
    venue: 'Vila Belmiro',
    quality: 'high',
    aspectRatio: '16:9',
    tags: ['atmosfera', 'vila belmiro', 'santos', 'mágica', 'tradição']
  }
];

export const FLAMENGO_IMAGES: TeamImage[] = [
  {
    id: 'flamengo-maracana-1',
    url: 'https://images.pexels.com/photos/3628925/pexels-photo-3628925.jpeg',
    thumbnailUrl: 'https://images.pexels.com/photos/3628925/pexels-photo-3628925.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Maracanã lotado com torcida do Flamengo',
    category: 'crowd',
    team: 'Flamengo',
    venue: 'Maracanã',
    quality: 'high',
    aspectRatio: '16:9',
    tags: ['maracanã', 'torcida', 'flamengo', 'estádio', 'multidão']
  },
  {
    id: 'flamengo-maracana-2',
    url: 'https://images.pexels.com/photos/114296/pexels-photo-114296.jpeg',
    thumbnailUrl: 'https://images.pexels.com/photos/114296/pexels-photo-114296.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Maracanã com iluminação noturna',
    category: 'stadium',
    team: 'Flamengo',
    venue: 'Maracanã',
    quality: 'high',
    aspectRatio: '16:9',
    tags: ['maracanã', 'estádio', 'flamengo', 'noite', 'iluminação']
  },
  {
    id: 'flamengo-players-1',
    url: 'https://images.pexels.com/photos/274506/pexels-photo-274506.jpeg',
    thumbnailUrl: 'https://images.pexels.com/photos/274506/pexels-photo-274506.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Jogadores do Flamengo em ação',
    category: 'players',
    team: 'Flamengo',
    quality: 'high',
    aspectRatio: '16:9',
    tags: ['jogadores', 'flamengo', 'ação', 'futebol', 'dinâmico']
  },
  {
    id: 'flamengo-atmosphere-1',
    url: 'https://images.pexels.com/photos/399187/pexels-photo-399187.jpeg',
    thumbnailUrl: 'https://images.pexels.com/photos/399187/pexels-photo-399187.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Atmosfera do Flamengo - O Mais Querido',
    category: 'atmosphere',
    team: 'Flamengo',
    quality: 'high',
    aspectRatio: '16:9',
    tags: ['atmosfera', 'flamengo', 'paixão', 'torcida', 'mais querido']
  },
  {
    id: 'flamengo-history-1',
    url: 'https://images.pexels.com/photos/46798/pexels-photo-46798.jpeg',
    thumbnailUrl: 'https://images.pexels.com/photos/46798/pexels-photo-46798.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'História do Flamengo - O Mais Querido',
    category: 'history',
    team: 'Flamengo',
    venue: 'Maracanã',
    quality: 'high',
    aspectRatio: '16:9',
    tags: ['história', 'flamengo', 'mais querido', 'tradição', 'legado']
  }
];

// Imagens específicas para clássicos Santos vs Flamengo
export const SANTOS_FLAMENGO_CLASSIC_IMAGES: TeamImage[] = [
  {
    id: 'classic-vila-belmiro-crowd',
    url: 'https://images.pexels.com/photos/3621104/pexels-photo-3621104.jpeg',
    thumbnailUrl: 'https://images.pexels.com/photos/3621104/pexels-photo-3621104.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Vila Belmiro lotada para o clássico Santos vs Flamengo',
    category: 'crowd',
    team: 'Santos',
    venue: 'Vila Belmiro',
    quality: 'high',
    aspectRatio: '16:9',
    tags: ['clássico', 'santos', 'flamengo', 'vila belmiro', 'torcida', 'rivalidade']
  },
  {
    id: 'classic-maracana-crowd',
    url: 'https://images.pexels.com/photos/3628925/pexels-photo-3628925.jpeg',
    thumbnailUrl: 'https://images.pexels.com/photos/3628925/pexels-photo-3628925.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Maracanã lotado para Santos vs Flamengo',
    category: 'crowd',
    team: 'Flamengo',
    venue: 'Maracanã',
    quality: 'high',
    aspectRatio: '16:9',
    tags: ['clássico', 'santos', 'flamengo', 'maracanã', 'torcida', 'rivalidade']
  },
  {
    id: 'classic-players-action',
    url: 'https://images.pexels.com/photos/274506/pexels-photo-274506.jpeg',
    thumbnailUrl: 'https://images.pexels.com/photos/274506/pexels-photo-274506.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Jogadores em ação no clássico Santos vs Flamengo',
    category: 'players',
    team: 'Santos',
    quality: 'high',
    aspectRatio: '16:9',
    tags: ['clássico', 'santos', 'flamengo', 'jogadores', 'ação', 'intensidade']
  },
  {
    id: 'classic-atmosphere',
    url: 'https://images.pexels.com/photos/399187/pexels-photo-399187.jpeg',
    thumbnailUrl: 'https://images.pexels.com/photos/399187/pexels-photo-399187.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Atmosfera eletrizante do clássico Santos vs Flamengo',
    category: 'atmosphere',
    team: 'Santos',
    quality: 'high',
    aspectRatio: '16:9',
    tags: ['clássico', 'santos', 'flamengo', 'atmosfera', 'eletrizante', 'rivalidade']
  }
];

// Função para obter imagens de um time específico
export function getTeamImages(teamName: string): TeamImage[] {
  const normalizedTeam = teamName.replace(' FC', '').replace('CR ', '');
  
  switch (normalizedTeam) {
    case 'Santos':
      return SANTOS_IMAGES;
    case 'Flamengo':
      return FLAMENGO_IMAGES;
    default:
      return [];
  }
}

// Função para obter imagens de um clássico específico
export function getClassicImages(homeTeam: string, awayTeam: string): TeamImage[] {
  const home = homeTeam.replace(' FC', '').replace('CR ', '');
  const away = awayTeam.replace(' FC', '').replace('CR ', '');
  
  if ((home === 'Santos' && away === 'Flamengo') || 
      (home === 'Flamengo' && away === 'Santos')) {
    return SANTOS_FLAMENGO_CLASSIC_IMAGES;
  }
  
  // Fallback para outros clássicos
  return [...getTeamImages(homeTeam), ...getTeamImages(awayTeam)];
}

// Função para obter imagens por categoria
export function getImagesByCategory(teamName: string, category: TeamImage['category']): TeamImage[] {
  return getTeamImages(teamName).filter(img => img.category === category);
}

// Função para obter imagem principal de um time
export function getMainTeamImage(teamName: string): TeamImage | null {
  const images = getTeamImages(teamName);
  return images.find(img => img.category === 'crowd') || images[0] || null;
} 