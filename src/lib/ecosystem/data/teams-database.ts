// Base de dados de times brasileiros para o ecossistema de banner
// Fonte: Dados reais dos principais times do Brasil

export interface TeamContext {
  name: string;
  league: string;
  homeStadium: string;
  keyPlayers: string[];
  rivalryTeams: string[];
  fanbaseSize: 'small' | 'medium' | 'large' | 'largest';
  colors: string[];
  history: string;
  nickname: string;
  founded: number;
  city: string;
  state: string;
  championships: {
    brasileiro: number;
    libertadores: number;
    copaDoBrasil: number;
    estadual: number;
  };
  currentForm: 'excellent' | 'good' | 'average' | 'poor';
  homeAdvantage: number; // 0-100
  attackingStyle: 'possession' | 'counter' | 'direct' | 'mixed';
  defensiveStyle: 'high-press' | 'mid-block' | 'low-block' | 'mixed';
}

export const BRAZILIAN_TEAMS: Record<string, TeamContext> = {
  'Santos': {
    name: 'Santos',
    league: 'Brasileirão',
    homeStadium: 'Vila Belmiro',
    keyPlayers: ['Marcos Leonardo', 'João Paulo', 'Lucas Lima', 'Felipe Jonatan'],
    rivalryTeams: ['Palmeiras', 'Corinthians', 'São Paulo'],
    fanbaseSize: 'large',
    colors: ['white', 'black'],
    history: 'Clube fundado em 1912, conhecido como "O Peixe", casa do Rei Pelé',
    nickname: 'O Peixe',
    founded: 1912,
    city: 'Santos',
    state: 'São Paulo',
    championships: {
      brasileiro: 8,
      libertadores: 3,
      copaDoBrasil: 1,
      estadual: 22
    },
    currentForm: 'good',
    homeAdvantage: 85,
    attackingStyle: 'possession',
    defensiveStyle: 'mid-block'
  },
  'Santos FC': {
    name: 'Santos FC',
    league: 'Brasileirão',
    homeStadium: 'Vila Belmiro',
    keyPlayers: ['Marcos Leonardo', 'João Paulo', 'Lucas Lima', 'Felipe Jonatan'],
    rivalryTeams: ['Palmeiras', 'Corinthians', 'São Paulo'],
    fanbaseSize: 'large',
    colors: ['white', 'black'],
    history: 'Clube fundado em 1912, conhecido como "O Peixe", casa do Rei Pelé',
    nickname: 'O Peixe',
    founded: 1912,
    city: 'Santos',
    state: 'São Paulo',
    championships: {
      brasileiro: 8,
      libertadores: 3,
      copaDoBrasil: 1,
      estadual: 22
    },
    currentForm: 'good',
    homeAdvantage: 85,
    attackingStyle: 'possession',
    defensiveStyle: 'mid-block'
  },

  'Flamengo': {
    name: 'Flamengo',
    league: 'Brasileirão',
    homeStadium: 'Maracanã',
    keyPlayers: ['Gabigol', 'Arrascaeta', 'Pedro', 'Bruno Henrique', 'Everton Ribeiro'],
    rivalryTeams: ['Fluminense', 'Vasco', 'Botafogo'],
    fanbaseSize: 'largest',
    colors: ['red', 'black'],
    history: 'Maior torcida do Brasil, fundado em 1895, conhecido como "O Mais Querido"',
    nickname: 'O Mais Querido',
    founded: 1895,
    city: 'Rio de Janeiro',
    state: 'Rio de Janeiro',
    championships: {
      brasileiro: 8,
      libertadores: 3,
      copaDoBrasil: 4,
      estadual: 37
    },
    currentForm: 'excellent',
    homeAdvantage: 90,
    attackingStyle: 'possession',
    defensiveStyle: 'high-press'
  },
  'CR Flamengo': {
    name: 'CR Flamengo',
    league: 'Brasileirão',
    homeStadium: 'Maracanã',
    keyPlayers: ['Gabigol', 'Arrascaeta', 'Pedro', 'Bruno Henrique', 'Everton Ribeiro'],
    rivalryTeams: ['Fluminense', 'Vasco', 'Botafogo'],
    fanbaseSize: 'largest',
    colors: ['red', 'black'],
    history: 'Maior torcida do Brasil, fundado em 1895, conhecido como "O Mais Querido"',
    nickname: 'O Mais Querido',
    founded: 1895,
    city: 'Rio de Janeiro',
    state: 'Rio de Janeiro',
    championships: {
      brasileiro: 8,
      libertadores: 3,
      copaDoBrasil: 4,
      estadual: 37
    },
    currentForm: 'excellent',
    homeAdvantage: 90,
    attackingStyle: 'possession',
    defensiveStyle: 'high-press'
  },

  'Palmeiras': {
    name: 'Palmeiras',
    league: 'Brasileirão',
    homeStadium: 'Allianz Parque',
    keyPlayers: ['Endrick', 'Raphael Veiga', 'Dudu', 'Murilo'],
    rivalryTeams: ['Corinthians', 'Santos', 'São Paulo'],
    fanbaseSize: 'large',
    colors: ['green', 'white'],
    history: 'Fundado em 1914, conhecido como "O Verdão", maior campeão brasileiro',
    nickname: 'O Verdão',
    founded: 1914,
    city: 'São Paulo',
    state: 'São Paulo',
    championships: {
      brasileiro: 11,
      libertadores: 3,
      copaDoBrasil: 4,
      estadual: 25
    },
    currentForm: 'excellent',
    homeAdvantage: 88,
    attackingStyle: 'possession',
    defensiveStyle: 'high-press'
  },

  'Corinthians': {
    name: 'Corinthians',
    league: 'Brasileirão',
    homeStadium: 'Neo Química Arena',
    keyPlayers: ['Yuri Alberto', 'Renato Augusto', 'Fagner', 'Gil'],
    rivalryTeams: ['Palmeiras', 'Santos', 'São Paulo'],
    fanbaseSize: 'largest',
    colors: ['white', 'black'],
    history: 'Fundado em 1910, conhecido como "O Timão", torcida organizada mais famosa',
    nickname: 'O Timão',
    founded: 1910,
    city: 'São Paulo',
    state: 'São Paulo',
    championships: {
      brasileiro: 7,
      libertadores: 1,
      copaDoBrasil: 3,
      estadual: 30
    },
    currentForm: 'average',
    homeAdvantage: 82,
    attackingStyle: 'mixed',
    defensiveStyle: 'mid-block'
  },

  'São Paulo': {
    name: 'São Paulo',
    league: 'Brasileirão',
    homeStadium: 'Morumbi',
    keyPlayers: ['Luciano', 'Calleri', 'Alisson', 'Rafinha'],
    rivalryTeams: ['Corinthians', 'Palmeiras', 'Santos'],
    fanbaseSize: 'large',
    colors: ['white', 'red', 'black'],
    history: 'Fundado em 1930, conhecido como "O Tricolor", maior campeão da Libertadores',
    nickname: 'O Tricolor',
    founded: 1930,
    city: 'São Paulo',
    state: 'São Paulo',
    championships: {
      brasileiro: 6,
      libertadores: 3,
      copaDoBrasil: 1,
      estadual: 22
    },
    currentForm: 'good',
    homeAdvantage: 80,
    attackingStyle: 'possession',
    defensiveStyle: 'mid-block'
  },

  'Fluminense': {
    name: 'Fluminense',
    league: 'Brasileirão',
    homeStadium: 'Maracanã',
    keyPlayers: ['Germán Cano', 'André', 'Felipe Melo', 'Marcelo'],
    rivalryTeams: ['Flamengo', 'Vasco', 'Botafogo'],
    fanbaseSize: 'large',
    colors: ['green', 'red', 'white'],
    history: 'Fundado em 1902, conhecido como "O Tricolor Carioca", clube aristocrático',
    nickname: 'O Tricolor Carioca',
    founded: 1902,
    city: 'Rio de Janeiro',
    state: 'Rio de Janeiro',
    championships: {
      brasileiro: 4,
      libertadores: 1,
      copaDoBrasil: 1,
      estadual: 32
    },
    currentForm: 'good',
    homeAdvantage: 78,
    attackingStyle: 'possession',
    defensiveStyle: 'mid-block'
  },

  'Vasco': {
    name: 'Vasco',
    league: 'Brasileirão',
    homeStadium: 'São Januário',
    keyPlayers: ['Pedro Raul', 'Alex Teixeira', 'Puma Rodríguez'],
    rivalryTeams: ['Flamengo', 'Fluminense', 'Botafogo'],
    fanbaseSize: 'large',
    colors: ['white', 'black'],
    history: 'Fundado em 1898, conhecido como "O Gigante da Colina", pioneiro da inclusão',
    nickname: 'O Gigante da Colina',
    founded: 1898,
    city: 'Rio de Janeiro',
    state: 'Rio de Janeiro',
    championships: {
      brasileiro: 4,
      libertadores: 1,
      copaDoBrasil: 1,
      estadual: 24
    },
    currentForm: 'poor',
    homeAdvantage: 75,
    attackingStyle: 'direct',
    defensiveStyle: 'low-block'
  },

  'Botafogo': {
    name: 'Botafogo',
    league: 'Brasileirão',
    homeStadium: 'Nilton Santos',
    keyPlayers: ['Tiquinho Soares', 'Eduardo', 'Carlos Alberto'],
    rivalryTeams: ['Flamengo', 'Fluminense', 'Vasco'],
    fanbaseSize: 'medium',
    colors: ['white', 'black'],
    history: 'Fundado em 1904, conhecido como "O Fogão", clube de grandes craques',
    nickname: 'O Fogão',
    founded: 1904,
    city: 'Rio de Janeiro',
    state: 'Rio de Janeiro',
    championships: {
      brasileiro: 2,
      libertadores: 0,
      copaDoBrasil: 0,
      estadual: 21
    },
    currentForm: 'average',
    homeAdvantage: 70,
    attackingStyle: 'counter',
    defensiveStyle: 'mid-block'
  },

  'Grêmio': {
    name: 'Grêmio',
    league: 'Brasileirão',
    homeStadium: 'Arena do Grêmio',
    keyPlayers: ['Luis Suárez', 'Ferreira', 'Cristaldo'],
    rivalryTeams: ['Internacional'],
    fanbaseSize: 'large',
    colors: ['blue', 'white', 'black'],
    history: 'Fundado em 1903, conhecido como "O Imortal", grande tradição na Libertadores',
    nickname: 'O Imortal',
    founded: 1903,
    city: 'Porto Alegre',
    state: 'Rio Grande do Sul',
    championships: {
      brasileiro: 2,
      libertadores: 3,
      copaDoBrasil: 5,
      estadual: 42
    },
    currentForm: 'good',
    homeAdvantage: 85,
    attackingStyle: 'possession',
    defensiveStyle: 'high-press'
  },

  'Internacional': {
    name: 'Internacional',
    league: 'Brasileirão',
    homeStadium: 'Beira-Rio',
    keyPlayers: ['Enner Valencia', 'Wanderson', 'Maurício'],
    rivalryTeams: ['Grêmio'],
    fanbaseSize: 'large',
    colors: ['red', 'white'],
    history: 'Fundado em 1909, conhecido como "O Colorado", clube popular do RS',
    nickname: 'O Colorado',
    founded: 1909,
    city: 'Porto Alegre',
    state: 'Rio Grande do Sul',
    championships: {
      brasileiro: 3,
      libertadores: 2,
      copaDoBrasil: 1,
      estadual: 45
    },
    currentForm: 'average',
    homeAdvantage: 83,
    attackingStyle: 'mixed',
    defensiveStyle: 'mid-block'
  }
};

// Função para obter contexto de um time
export function getTeamContext(teamName: string): TeamContext | null {
  return BRAZILIAN_TEAMS[teamName] || null;
}

// Função para obter todos os times
export function getAllTeams(): TeamContext[] {
  return Object.values(BRAZILIAN_TEAMS);
}

// Função para buscar times por cidade
export function getTeamsByCity(city: string): TeamContext[] {
  return getAllTeams().filter(team => 
    team.city.toLowerCase().includes(city.toLowerCase())
  );
}

// Função para buscar times por estado
export function getTeamsByState(state: string): TeamContext[] {
  return getAllTeams().filter(team => 
    team.state.toLowerCase().includes(state.toLowerCase())
  );
}

// Função para obter rivais de um time
export function getRivalTeams(teamName: string): TeamContext[] {
  const team = getTeamContext(teamName);
  if (!team) return [];
  
  return team.rivalryTeams
    .map(rivalName => getTeamContext(rivalName))
    .filter(Boolean) as TeamContext[];
}

// Função para calcular importância de um jogo
export function calculateMatchImportance(homeTeam: string, awayTeam: string): number {
  const home = getTeamContext(homeTeam);
  const away = getTeamContext(awayTeam);
  
  if (!home || !away) return 50;
  
  let importance = 50;
  
  // Rivalidade
  if (home.rivalryTeams.includes(awayTeam) || away.rivalryTeams.includes(homeTeam)) {
    importance += 30;
  }
  
  // Tamanho das torcidas
  const fanbaseScore = {
    'small': 10,
    'medium': 20,
    'large': 30,
    'largest': 40
  };
  
  importance += fanbaseScore[home.fanbaseSize] + fanbaseScore[away.fanbaseSize];
  
  // Forma atual
  const formScore = {
    'excellent': 15,
    'good': 10,
    'average': 5,
    'poor': 0
  };
  
  importance += formScore[home.currentForm] + formScore[away.currentForm];
  
  return Math.min(importance, 100);
} 