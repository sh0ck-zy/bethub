import React from 'react';

export function AdComponent() {
  // Mock ad data
  const ad = {
    image: 'https://www.betano.pt/static/betano/img/logo-betano.svg',
    title: 'Betano - 100% Bonus até 100€',
    description: 'Aproveita o bónus de boas-vindas exclusivo para novos utilizadores!',
    url: 'https://www.betano.com/affiliate-link',
    cta: 'Apostar Agora',
  };

  return (
    <a
      href={ad.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block bg-gradient-to-br from-[#27293D] to-[#1E1E2D] p-6 rounded-2xl border border-gray-700/50 shadow-2xl hover:bg-blue-900/40 transition-colors group"
      style={{ textDecoration: 'none' }}
    >
      <div className="flex items-center gap-4 mb-3">
        <img src={ad.image} alt={ad.title} className="w-14 h-14 bg-white rounded-full p-2 object-contain" />
        <div className="flex-1">
          <div className="font-bold text-white text-lg group-hover:text-yellow-400 transition-colors">{ad.title}</div>
        </div>
      </div>
      <div className="text-sm text-blue-200 mb-4">{ad.description}</div>
      <div className="w-full">
        <span className="inline-block bg-yellow-500 text-white font-bold px-4 py-2 rounded-lg shadow hover:bg-yellow-400 transition-colors text-center w-full">{ad.cta}</span>
      </div>
    </a>
  );
} 