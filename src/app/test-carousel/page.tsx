import { BannerCarousel } from '@/components/features/BannerCarousel';

export default function TestCarouselPage() {
  const testMatch = {
    id: 'test-santos-flamengo',
    league: 'Brasileirão',
    home_team: 'Santos FC',
    away_team: 'CR Flamengo',
    kickoff_utc: '2025-07-16T18:00:00+00:00',
    status: 'PRE' as const,
    venue: 'Vila Belmiro'
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">🎠 Teste do Carousel</h1>
      
      <div className="max-w-4xl">
        <BannerCarousel match={testMatch} />
      </div>
      
      <div className="mt-8 p-4 bg-gray-100 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">📋 Informações do Teste:</h2>
        <ul className="space-y-2">
          <li>✅ Componente: BannerCarousel</li>
          <li>🏠 Home: Santos FC</li>
          <li>🛣️ Away: CR Flamengo</li>
          <li>🏟️ Venue: Vila Belmiro</li>
          <li>⏱️ Auto-play: 5 segundos</li>
          <li>🖼️ Imagens: 5 fotos reais</li>
        </ul>
      </div>
    </div>
  );
} 