import React from 'react';

// Mocked betting houses data
const bettingHouses = [
  {
    id: 'bet365',
    name: 'Bet365',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/5/5a/Bet365_logo.svg',
    countries: ['GB', 'PT', 'BR', 'ES'],
    offer: 'Get €50 in Free Bets',
    affiliateLink: 'https://www.bet365.com/affiliate-link',
  },
  {
    id: 'betano',
    name: 'Betano',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/2/2e/Betano_logo.svg',
    countries: ['PT', 'BR', 'DE', 'RO'],
    offer: '100% Bonus up to €100',
    affiliateLink: 'https://www.betano.com/affiliate-link',
  },
  {
    id: 'betclic',
    name: 'Betclic',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/2/2a/Betclic_logo.svg',
    countries: ['FR', 'PT', 'PL'],
    offer: '€20 Risk-Free Bet',
    affiliateLink: 'https://www.betclic.com/affiliate-link',
  },
  {
    id: 'bwin',
    name: 'Bwin',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/2/2a/Bwin_logo.svg',
    countries: ['PT', 'DE', 'AT', 'ES'],
    offer: '€50 Welcome Bonus',
    affiliateLink: 'https://www.bwin.com/affiliate-link',
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
    <div className="bg-gradient-to-br from-[#27293D] to-[#1E1E2D] p-6 rounded-2xl border border-gray-700/50 shadow-2xl">
      <h2 className="font-bold text-white text-xl mb-4">Betting Offers</h2>
      <div className="space-y-4">
        {offers.map(house => (
          <a
            key={house.id}
            href={house.affiliateLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 p-3 rounded-lg bg-[#23243a] hover:bg-blue-600/80 transition-colors shadow group"
          >
            <img src={house.logo} alt={house.name} className="w-12 h-12 bg-white rounded-full p-1 object-contain" />
            <div className="flex-1">
              <div className="font-semibold text-white text-base group-hover:text-yellow-400 transition-colors">{house.name}</div>
              <div className="text-sm text-blue-300 font-medium">{house.offer}</div>
            </div>
            <span className="text-xs text-blue-400 font-bold group-hover:text-yellow-400 transition-colors">Claim</span>
          </a>
        ))}
      </div>
    </div>
  );
} 