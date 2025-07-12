// src/lib/services/mockAnalysisService.ts

export interface MockAnalysisData {
  tacticalSummary: string;
  confidence: number; // 0.6-0.95
  keyBattles: string[];
  prediction: string;
  stats: {
    homeWinProbability: number;
    drawProbability: number;
    awayWinProbability: number;
  };
}

function randomBetween(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function generateMockAnalysis(match: { homeTeam: string; awayTeam: string; league: string }): MockAnalysisData {
  // Simples templates, pode ser expandido
  return {
    tacticalSummary: `${match.homeTeam}'s home form vs ${match.awayTeam}'s away record will be key in this ${match.league} clash.`,
    confidence: Number(randomBetween(0.6, 0.95).toFixed(2)),
    keyBattles: [
      `${match.homeTeam} midfield vs ${match.awayTeam} counter-attack`,
      `${match.homeTeam} defense vs ${match.awayTeam} striker`
    ],
    prediction: `${match.homeTeam} likely to dominate possession, but ${match.awayTeam} dangerous on the break.`,
    stats: {
      homeWinProbability: Number(randomBetween(0.3, 0.6).toFixed(2)),
      drawProbability: Number(randomBetween(0.2, 0.3).toFixed(2)),
      awayWinProbability: Number(randomBetween(0.2, 0.5).toFixed(2)),
    }
  };
}

export async function runMockAnalysis(match: { id: string; homeTeam: string; awayTeam: string; league: string }) {
  // Espera 10 segundos para simular análise
  await new Promise(res => setTimeout(res, 10000));

  // 95% sucesso
  const success = Math.random() < 0.95;

  if (success) {
    const analysis = generateMockAnalysis(match);
    // Chama endpoint para completar análise
    await fetch('/api/v1/admin/complete-analysis', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        matchId: match.id,
        analysisStatus: 'completed',
        analysisData: analysis
      })
    });
  } else {
    // Chama endpoint para marcar como failed
    await fetch('/api/v1/admin/complete-analysis', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        matchId: match.id,
        analysisStatus: 'failed'
      })
    });
  }
} 