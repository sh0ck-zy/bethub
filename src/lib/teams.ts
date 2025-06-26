export const TEAMS = {
  'Manchester United': {
    slug: 'manchester-united',
    primary: '#DA291C',
    logo: '/logos/manchester-united.svg',
  },
  'Liverpool': {
    slug: 'liverpool',
    primary: '#C8102E',
    logo: '/logos/liverpool.svg',
  },
  'Arsenal': {
    slug: 'arsenal',
    primary: '#EF0107',
    logo: '/logos/arsenal.svg',
  },
  'Chelsea': {
    slug: 'chelsea',
    primary: '#034694',
    logo: '/logos/chelsea.svg',
  },
  'Real Madrid': {
    slug: 'real-madrid',
    primary: '#FEBE10',
    logo: '/logos/real-madrid.svg',
  },
  'Barcelona': {
    slug: 'barcelona',
    primary: '#A50044',
    logo: '/logos/barcelona.svg',
  },
  'Bayern Munich': {
    slug: 'bayern-munich',
    primary: '#DC052D',
    logo: '/logos/bayern-munich.svg',
  },
  'Borussia Dortmund': {
    slug: 'borussia-dortmund',
    primary: '#FDE100',
    logo: '/logos/borussia-dortmund.svg',
  },
  'Juventus': {
    slug: 'juventus',
    primary: '#000000',
    logo: '/logos/juventus.svg',
  },
  'AC Milan': {
    slug: 'ac-milan',
    primary: '#FF0000',
    logo: '/logos/ac-milan.svg',
  },
} as const;

export type TeamName = keyof typeof TEAMS; 