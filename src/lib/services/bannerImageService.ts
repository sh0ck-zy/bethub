import { Match } from '@/lib/types';

// Tipos para o sistema de IA de imagens
export interface BannerImageStrategy {
  type: 'player_focus' | 'stadium_atmosphere' | 'team_rivalry' | 'home_advantage' | 'derby_clash' | 'championship_moment';
  priority: number;
  reasoning: string;
  searchKeywords: string[];
  targetAspectRatio: '16:9' | '21:9' | '4:3';
  mood: 'intense' | 'celebratory' | 'atmospheric' | 'competitive';
}

export interface BannerImageResult {
  imageUrl: string;
  strategy: BannerImageStrategy;
  confidence: number;
  metadata: {
    source: string;
    dimensions: { width: number; height: number };
    optimization: 'high' | 'medium' | 'low';
    altText: string;
  };
}

export interface TeamContext {
  name: string;
  league: string;
  homeStadium?: string;
  keyPlayers?: string[];
  recentForm?: string;
  rivalryTeams?: string[];
  fanbaseSize?: 'large' | 'medium' | 'small';
}

// Estratégias de IA para diferentes tipos de jogos
const STRATEGY_TEMPLATES = {
  // Clássicos/Derbys
  derby_clash: {
    type: 'derby_clash' as const,
    priority: 10,
    reasoning: 'Clássico entre rivais históricos - foco na intensidade e rivalidade',
    searchKeywords: ['football rivalry', 'derby match', 'intense football', 'rival teams'],
    targetAspectRatio: '21:9' as const,
    mood: 'intense' as const
  },
  
  // Jogos em casa com vantagem
  home_advantage: {
    type: 'home_advantage' as const,
    priority: 8,
    reasoning: 'Time jogando em casa - destaque para torcida e atmosfera do estádio',
    searchKeywords: ['home crowd', 'stadium atmosphere', 'football fans', 'home advantage'],
    targetAspectRatio: '16:9' as const,
    mood: 'atmospheric' as const
  },
  
  // Foco em jogador específico
  player_focus: {
    type: 'player_focus' as const,
    priority: 7,
    reasoning: 'Jogador em destaque - foco individual para maior impacto',
    searchKeywords: ['football player', 'soccer player', 'athlete', 'player action'],
    targetAspectRatio: '16:9' as const,
    mood: 'competitive' as const
  },
  
  // Momentos de campeonato
  championship_moment: {
    type: 'championship_moment' as const,
    priority: 6,
    reasoning: 'Jogo importante para o campeonato - atmosfera de decisão',
    searchKeywords: ['championship football', 'important match', 'decisive game'],
    targetAspectRatio: '21:9' as const,
    mood: 'intense' as const
  }
};

// Importar base de dados de times do ecossistema
import { BRAZILIAN_TEAMS, getTeamContext, calculateMatchImportance } from '../ecosystem/data/teams-database';

// Base de dados de contextos dos times (usando ecossistema)
const TEAM_CONTEXTS: Record<string, TeamContext> = {
  ...BRAZILIAN_TEAMS,
  // Fallback para times não brasileiros
  'Manchester United': {
    name: 'Manchester United',
    league: 'Premier League',
    homeStadium: 'Old Trafford',
    keyPlayers: ['Bruno Fernandes', 'Marcus Rashford'],
    rivalryTeams: ['Liverpool', 'Manchester City', 'Arsenal'],
    fanbaseSize: 'large'
  },
  'Liverpool': {
    name: 'Liverpool',
    league: 'Premier League',
    homeStadium: 'Anfield',
    keyPlayers: ['Mohamed Salah', 'Virgil van Dijk'],
    rivalryTeams: ['Manchester United', 'Everton', 'Manchester City'],
    fanbaseSize: 'large'
  },
  'Real Madrid': {
    name: 'Real Madrid',
    league: 'La Liga',
    homeStadium: 'Santiago Bernabéu',
    keyPlayers: ['Vinicius Jr', 'Jude Bellingham'],
    rivalryTeams: ['Barcelona', 'Atlético Madrid'],
    fanbaseSize: 'large'
  },
  'Barcelona': {
    name: 'Barcelona',
    league: 'La Liga',
    homeStadium: 'Camp Nou',
    keyPlayers: ['Robert Lewandowski', 'Frenkie de Jong'],
    rivalryTeams: ['Real Madrid', 'Espanyol'],
    fanbaseSize: 'large'
  }
};

// Função principal de IA para encontrar a melhor imagem
export async function findBestBannerImage(match: Match): Promise<BannerImageResult> {
  console.log(`🎯 IA analisando jogo: ${match.home_team} vs ${match.away_team}`);
  
  // 1. Analisar contexto do jogo
  const gameContext = analyzeGameContext(match);
  
  // 2. Determinar estratégia de IA
  const strategy = determineImageStrategy(gameContext);
  
  // 3. Buscar imagem baseada na estratégia
  const imageResult = await searchAndOptimizeImage(strategy, gameContext);
  
  console.log(`✅ IA selecionou imagem: ${strategy.type} (confiança: ${imageResult.confidence}%)`);
  
  return imageResult;
}

// Analisa o contexto do jogo para IA
function analyzeGameContext(match: Match) {
  // Try to find team context with variations
  const homeTeam = TEAM_CONTEXTS[match.home_team] || 
                   TEAM_CONTEXTS[match.home_team.replace(' FC', '').replace('CR ', '')] ||
                   createDefaultTeamContext(match.home_team);
  const awayTeam = TEAM_CONTEXTS[match.away_team] || 
                   TEAM_CONTEXTS[match.away_team.replace(' FC', '').replace('CR ', '')] ||
                   createDefaultTeamContext(match.away_team);
  
  const isDerby = homeTeam.rivalryTeams?.includes(awayTeam.name) || 
                  awayTeam.rivalryTeams?.includes(homeTeam.name);
  
  const isHomeGame = true; // Sempre é jogo em casa para o time da casa
  const isChampionshipDecisive = match.league.includes('Championship') || 
                                 match.league.includes('Final') ||
                                 match.league.includes('Semi');
  
  return {
    homeTeam,
    awayTeam,
    isDerby,
    isHomeGame,
    isChampionshipDecisive,
    league: match.league,
    venue: match.venue,
    kickoffTime: match.kickoff_utc
  };
}

// IA determina a melhor estratégia de imagem
function determineImageStrategy(context: any): BannerImageStrategy {
  const strategies: BannerImageStrategy[] = [];
  
  // Estratégia 1: Derby/Clássico (maior prioridade)
  if (context.isDerby) {
    strategies.push({
      ...STRATEGY_TEMPLATES.derby_clash,
      reasoning: `Clássico ${context.homeTeam.name} vs ${context.awayTeam.name} - intensidade máxima`,
      searchKeywords: [
        `${context.homeTeam.name} ${context.awayTeam.name} rivalry`,
        'football derby intense',
        'rival teams clash',
        'passionate football fans'
      ]
    });
  }
  
  // Estratégia 2: Vantagem em casa
  if (context.isHomeGame && context.homeTeam.fanbaseSize === 'large') {
    strategies.push({
      ...STRATEGY_TEMPLATES.home_advantage,
      reasoning: `${context.homeTeam.name} jogando em casa - torcida como 12º jogador`,
      searchKeywords: [
        `${context.homeTeam.homeStadium || context.homeTeam.name} stadium`,
        'home crowd football',
        'passionate home fans',
        'stadium atmosphere'
      ]
    });
  }
  
  // Estratégia 3: Jogador em destaque
  if (context.homeTeam.keyPlayers?.length > 0) {
    strategies.push({
      ...STRATEGY_TEMPLATES.player_focus,
      reasoning: `Foco em ${context.homeTeam.keyPlayers[0]} - jogador principal do ${context.homeTeam.name}`,
      searchKeywords: [
        context.homeTeam.keyPlayers[0],
        'football player action',
        'soccer player dynamic',
        'athlete in motion'
      ]
    });
  }
  
  // Estratégia 4: Momento de campeonato
  if (context.isChampionshipDecisive) {
    strategies.push({
      ...STRATEGY_TEMPLATES.championship_moment,
      reasoning: 'Jogo decisivo para o campeonato - atmosfera de final',
      searchKeywords: [
        'championship football',
        'decisive match',
        'important game',
        'football final atmosphere'
      ]
    });
  }
  
  // Seleciona a estratégia com maior prioridade
  const bestStrategy = strategies.sort((a, b) => b.priority - a.priority)[0];
  
  // Fallback para estratégia padrão
  return bestStrategy || {
    type: 'stadium_atmosphere',
    priority: 1,
    reasoning: 'Imagem padrão de atmosfera de futebol',
    searchKeywords: ['football stadium', 'soccer atmosphere', 'football match'],
    targetAspectRatio: '16:9',
    mood: 'atmospheric'
  };
}

// Busca e otimiza imagem baseada na estratégia
async function searchAndOptimizeImage(strategy: BannerImageStrategy, context: any): Promise<BannerImageResult> {
  // Simulação de busca de imagem com IA
  // Em produção, isso seria integrado com APIs de busca de imagens
  
  const imageUrls = await searchImagesByStrategy(strategy);
  const bestImage = selectBestImage(imageUrls, strategy);
  const optimizedImage = await optimizeImageForBanner(bestImage, strategy);
  
  return {
    imageUrl: optimizedImage.url,
    strategy,
    confidence: calculateConfidence(strategy, context),
    metadata: {
      source: 'AI-powered search',
      dimensions: optimizedImage.dimensions,
      optimization: 'high',
      altText: generateAltText(strategy, context)
    }
  };
}

// Simula busca de imagens (em produção seria API real)
async function searchImagesByStrategy(strategy: BannerImageStrategy): Promise<string[]> {
  // Simulação de diferentes fontes de imagem baseadas na estratégia
  const imagePools: Record<string, string[]> = {
    derby_clash: [
      'https://images.pexels.com/photos/3621104/pexels-photo-3621104.jpeg', // Vila Belmiro lotada
      'https://images.pexels.com/photos/3628925/pexels-photo-3628925.jpeg'  // Maracanã
    ],
    home_advantage: [
      'https://images.pexels.com/photos/3621104/pexels-photo-3621104.jpeg', // Vila Belmiro
      'https://images.pexels.com/photos/114296/pexels-photo-114296.jpeg'
    ],
    player_focus: [
      'https://images.pexels.com/photos/274506/pexels-photo-274506.jpeg',
      'https://images.pexels.com/photos/399187/pexels-photo-399187.jpeg'
    ],
    championship_moment: [
      'https://images.pexels.com/photos/3621104/pexels-photo-3621104.jpeg',
      'https://images.pexels.com/photos/114296/pexels-photo-114296.jpeg'
    ],
    stadium_atmosphere: [
      'https://images.pexels.com/photos/3621104/pexels-photo-3621104.jpeg',
      'https://images.pexels.com/photos/46798/pexels-photo-46798.jpeg'
    ],
    team_rivalry: [
      'https://images.pexels.com/photos/3621104/pexels-photo-3621104.jpeg',
      'https://images.pexels.com/photos/3628925/pexels-photo-3628925.jpeg'
    ]
  };
  
  return imagePools[strategy.type] || imagePools.stadium_atmosphere;
}

// Seleciona a melhor imagem do conjunto
function selectBestImage(imageUrls: string[], strategy: BannerImageStrategy): string {
  // Simulação de seleção baseada em critérios de IA
  // Em produção, analisaria qualidade, relevância, composição, etc.
  return imageUrls[Math.floor(Math.random() * imageUrls.length)];
}

// Otimiza imagem para banner
async function optimizeImageForBanner(imageUrl: string, strategy: BannerImageStrategy) {
  // Simulação de otimização
  // Em produção, redimensionaria, comprimiria, ajustaria cores, etc.
  
  const dimensions = strategy.targetAspectRatio === '21:9' 
    ? { width: 2100, height: 900 }
    : { width: 1600, height: 900 };
  
  return {
    url: imageUrl,
    dimensions
  };
}

// Calcula confiança da seleção
function calculateConfidence(strategy: BannerImageStrategy, context: any): number {
  let confidence = 70; // Base
  
  if (strategy.priority >= 8) confidence += 20;
  if (context.isDerby) confidence += 10;
  if (context.homeTeam.fanbaseSize === 'large') confidence += 5;
  
  return Math.min(confidence, 95);
}

// Gera texto alternativo para acessibilidade
function generateAltText(strategy: BannerImageStrategy, context: any): string {
  const homeTeam = context.homeTeam.name;
  const awayTeam = context.awayTeam.name;
  
  switch (strategy.type) {
    case 'derby_clash':
      return `Clássico intenso entre ${homeTeam} e ${awayTeam} - rivalidade histórica`;
    case 'home_advantage':
      return `Torcida do ${homeTeam} no estádio ${context.homeTeam.homeStadium} - vantagem em casa`;
    case 'player_focus':
      return `${context.homeTeam.keyPlayers?.[0] || 'Jogador'} do ${homeTeam} em ação`;
    default:
      return `Jogo ${homeTeam} vs ${awayTeam} - atmosfera de futebol`;
  }
}

// Cria contexto padrão para times não mapeados
function createDefaultTeamContext(teamName: string): TeamContext {
  return {
    name: teamName,
    league: 'Unknown',
    fanbaseSize: 'medium'
  };
}

// Função de conveniência para uso direto
export async function getBannerImageForMatch(match: Match): Promise<string> {
  try {
    const result = await findBestBannerImage(match);
    return result.imageUrl;
  } catch (error) {
    console.error('Erro ao buscar imagem de banner:', error);
    // Fallback para imagem padrão - Santos vs Flamengo
    return 'https://images.pexels.com/photos/3621104/pexels-photo-3621104.jpeg';
  }
} 