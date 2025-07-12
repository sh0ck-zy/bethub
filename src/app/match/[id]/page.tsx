import React from 'react';

// Mock fetch de dados do jogo publicado
async function fetchMatch(id: string) {
  // Em produção, isto viria de um endpoint real
  if (id === '2') {
    return {
      id: '2',
      league: 'Brasileirão',
      homeTeam: 'Vasco',
      awayTeam: 'Botafogo',
      kickoffUtc: '2025-07-12T20:00:00Z',
      isPublished: true,
      analysisStatus: 'completed',
      analysis: {
        tacticalSummary: "Vasco's home form vs Botafogo's away record will be key.",
        confidence: 0.81,
        keyBattles: ["Vasco midfield vs Botafogo counter-attack"],
        prediction: "Vasco likely to dominate possession, but Botafogo dangerous on the break.",
        stats: {
          homeWinProbability: 0.55,
          drawProbability: 0.25,
          awayWinProbability: 0.20
        }
      }
    };
  }
  if (id === '1') {
    return {
      id: '1',
      league: 'Brasileirão',
      homeTeam: 'Flamengo',
      awayTeam: 'São Paulo',
      kickoffUtc: '2025-07-12T20:00:00Z',
      isPublished: false
    };
  }
  return null;
}

export default async function MatchPage({ params }: { params: { id: string } }) {
  const match = await fetchMatch(params.id);

  if (!match || !match.isPublished) {
    return <div className="py-12 text-center text-red-600">Match Not Found<br/>This match doesn't exist or hasn't been published yet.</div>;
  }

  return (
    <div className="max-w-xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-2">{match.homeTeam} vs {match.awayTeam}</h1>
      <div className="mb-2 text-gray-600">{match.league} &middot; {new Date(match.kickoffUtc).toLocaleString()}</div>
      <div className="mb-6 text-sm text-gray-500">ID: {match.id}</div>

      {match.analysisStatus === 'completed' && match.analysis ? (
        <div className="bg-green-50 p-4 rounded mb-4">
          <div className="font-semibold mb-2">Análise AI</div>
          <div className="mb-2">{match.analysis.tacticalSummary}</div>
          <div className="mb-2">Confiança: {(match.analysis.confidence * 100).toFixed(0)}%</div>
          <div className="mb-2">Prediction: {match.analysis.prediction}</div>
          <div className="mb-2">Probabilidades: Casa {Math.round(match.analysis.stats.homeWinProbability*100)}% &middot; Empate {Math.round(match.analysis.stats.drawProbability*100)}% &middot; Fora {Math.round(match.analysis.stats.awayWinProbability*100)}%</div>
        </div>
      ) : match.analysisStatus === 'pending' ? (
        <div className="bg-yellow-50 p-4 rounded mb-4 text-yellow-700">Análise em progresso...</div>
      ) : (
        <div className="bg-gray-100 p-4 rounded mb-4 text-gray-600">Análise disponível em breve.</div>
      )}
    </div>
  );
}