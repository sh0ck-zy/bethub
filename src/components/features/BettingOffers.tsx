import React from 'react';

// Updated betting houses data with working logo URLs
const bettingHouses = [
  {
    id: 'bet365',
    name: 'Bet365',
    logo: 'https://logos-world.net/wp-content/uploads/2021/02/Bet365-Logo.png',
    countries: ['GB', 'PT', 'BR', 'ES'],
    offer: 'Get €50 in Free Bets',
    affiliateLink: 'https://www.bet365.com/affiliate-link',
  },
  {
    id: 'betano',
    name: 'Betano',
    logo: 'https://logos-world.net/wp-content/uploads/2022/01/Betano-Logo.png',
    countries: ['PT', 'BR', 'DE', 'RO'],
    offer: '100% Bonus up to €100',
    affiliateLink: 'https://www.betano.com/affiliate-link',
  },
  {
    id: 'betclic',
    name: 'Betclic',
    logo: 'https://companieslogo.com/img/orig/BCLIC.PA-b3c13779.png',
    countries: ['FR', 'PT', 'PL'],
    offer: '€20 Risk-Free Bet',
    affiliateLink: 'https://www.betclic.com/affiliate-link',
  },
  {
    id: 'bwin',
    name: 'Bwin',
    logo: 'https://logos-world.net/wp-content/uploads/2020/06/Bwin-Logo.png',
    countries: ['PT', 'DE', 'AT', 'ES'],
    offer: '€50 Welcome Bonus',
    affiliateLink: 'https://www.bwin.com/affiliate-link',
  },
  {
    id: 'betfair',
    name: 'Betfair',
    logo: 'https://logos-world.net/wp-content/uploads/2020/06/Betfair-Logo.png',
    countries: ['GB', 'PT', 'ES', 'IT'],
    offer: 'Get €100 in Free Bets',
    affiliateLink: 'https://www.betfair.com/affiliate-link',
  },
  {
    id: 'winamax',
    name: 'Winamax',
    logo: 'https://logos-world.net/wp-content/uploads/2022/01/Winamax-Logo.png',
    countries: ['FR', 'ES'],
    offer: '€100 Welcome Bonus',
    affiliateLink: 'https://www.winamax.fr/affiliate-link',
  },
  {
    id: 'unibet',
    name: 'Unibet',
    logo: 'https://logos-world.net/wp-content/uploads/2020/06/Unibet-Logo.png',
    countries: ['GB', 'FR', 'DE', 'IT'],
    offer: '€200 Risk-Free Bet',
    affiliateLink: 'https://www.unibet.com/affiliate-link',
  },
  {
    id: 'pokerstars',
    name: 'PokerStars Sports',
    logo: 'https://logos-world.net/wp-content/uploads/2020/06/PokerStars-Logo.png',
    countries: ['PT', 'ES', 'GB'],
    offer: '€30 Free Bet',
    affiliateLink: 'https://www.pokerstars.com/sports/affiliate-link',
  },
];

// Mock country detection (replace with real logic later)
function detectUserCountry() {
  // For MVP, return 'PT' (Portugal)
  return 'PT';
}

export function BettingOffers() {
  const country = detectUserCountry();
  const offers = bettingHouses.filter(house => house.countries.includes(country));

  if (offers.length === 0) return null;

  return (
    <div className="bg-card p-6 rounded-2xl border border-border shadow-lg">
      <h2 className="font-bold text-card-foreground text-xl mb-4">Betting Offers</h2>
      <div className="space-y-4">
        {offers.map(house => (
          <a
            key={house.id}
            href={house.affiliateLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 hover:bg-primary/10 transition-colors shadow group border border-border"
          >
            <img 
              src={house.logo} 
              alt={house.name} 
              className="w-12 h-12 bg-white rounded-lg p-2 object-contain shadow-sm" 
              onError={(e) => {
                // Fallback to generic betting icon if logo fails to load
                e.currentTarget.src = 'https://cdn-icons-png.flaticon.com/512/3659/3659899.png';
              }}
            />
            <div className="flex-1">
              <div className="font-semibold text-card-foreground text-base group-hover:text-primary transition-colors">{house.name}</div>
              <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">{house.offer}</div>
            </div>
            <span className="text-xs text-primary font-bold group-hover:text-yellow-600 dark:group-hover:text-yellow-400 transition-colors">Claim</span>
          </a>
        ))}
      </div>
    </div>
  );
} 