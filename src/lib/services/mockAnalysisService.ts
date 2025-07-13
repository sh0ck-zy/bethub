import { Match } from '@/lib/types';

export interface MatchAnalysis {
  id: string;
  matchId: string;
  homeTeam: string;
  awayTeam: string;
  league: string;
  kickoffUtc: string;
  analysis: {
    summary: string;
    keyMoments: Array<{
      minute: number;
      type: string;
      description: string;
      importance: 'low' | 'medium' | 'high' | 'critical';
    }>;
    tacticalInsights: {
      homeTeam: {
        formation: string;
        possessionPercentage: number;
        pressingIntensity: string;
        weaknesses: string[];
        strengths: string[];
      };
      awayTeam: {
        formation: string;
        possessionPercentage: number;
        pressingIntensity: string;
        weaknesses: string[];
        strengths: string[];
      };
    };
    playerPerformances: Array<{
      playerId: string;
      name: string;
      rating: number;
      keyStats: {
        goals?: number;
        assists?: number;
        passAccuracy?: number;
        keyPasses?: number;
        tackles?: number;
        interceptions?: number;
      };
    }>;
    predictedOutcome: {
      homeWinProbability: number;
      drawProbability: number;
      awayWinProbability: number;
      predictedScore: string;
    };
    viewerEngagementScore: number;
    highlightWorthiness: 'low' | 'medium' | 'high';
    keyInsights: string[];
    confidence: number;
    riskFactors: string[];
    recommendations: string[];
  };
  stats: {
    possession: { home: number; away: number };
    shots: { home: number; away: number };
    shotsOnTarget: { home: number; away: number };
    corners: { home: number; away: number };
    fouls: { home: number; away: number };
    yellowCards: { home: number; away: number };
    redCards: { home: number; away: number };
  };
  createdAt: string;
  updatedAt: string;
}

export class MockAnalysisService {
  private analysisQueue = new Map();
  private analyzedMatches = new Map();
  private publishedMatches = new Map();

  // Simplified templates that never fail
  private analysisTemplates = {
    summary: [
      "Este jogo apresenta uma batalha tática interessante entre {homeTeam} e {awayTeam}. {homeTeam} normalmente confia na sua capacidade ofensiva, enquanto {awayTeam} se destaca na organização defensiva.",
      "{homeTeam} entra neste jogo com um plano de jogo ofensivo, focando na criação de oportunidades. {awayTeam}, por outro lado, vai tentar explorar contra-ataques.",
      "Um confronto de estilos contrastantes entre {homeTeam} e {awayTeam}. A batalha chave será no meio-campo onde ambas as equipas mostraram qualidade esta temporada."
    ],
    keyInsights: [
      "{homeTeam} venceu {homeWins} dos últimos {homeGames} jogos em casa",
      "{awayTeam} marcou em {awayScoring} dos últimos {awayGames} jogos fora",
      "Ambas as equipas marcaram em {bothScoring} dos últimos {recentGames} encontros",
      "{homeTeam} marca em média {homeGoals} golos por jogo em casa",
      "{awayTeam} manteve {awayCleanSheets} jogos sem sofrer golos fora"
    ],
    riskFactors: [
      "Lesões recentes de jogadores importantes",
      "Suspensão de jogadores defensivos",
      "Má forma recente fora de casa",
      "Fadiga de jogos recentes",
      "Condições meteorológicas"
    ],
    recommendations: [
      "Monitorizar notícias da equipa para lesões",
      "Considerar o impacto da forma recente",
      "Atenção às rotinas de bolas paradas",
      "Considerar o impacto do apoio da casa"
    ]
  };

  private generateRandomNumber(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  private getRandomElement<T>(array: T[]): T {
    if (!array || array.length === 0) {
      throw new Error('Array is empty or undefined');
    }
    return array[Math.floor(Math.random() * array.length)];
  }

  private replacePlaceholders(text: string, match: Match): string {
    if (!text || !match) return "Análise disponível";
    
    try {
      return text
        .replace('{homeTeam}', match.home_team || 'Equipa Casa')
        .replace('{awayTeam}', match.away_team || 'Equipa Visitante')
        .replace('{homeWins}', this.generateRandomNumber(2, 5).toString())
        .replace('{homeGames}', this.generateRandomNumber(5, 8).toString())
        .replace('{awayScoring}', this.generateRandomNumber(3, 6).toString())
        .replace('{awayGames}', this.generateRandomNumber(5, 8).toString())
        .replace('{bothScoring}', this.generateRandomNumber(2, 4).toString())
        .replace('{recentGames}', this.generateRandomNumber(3, 6).toString())
        .replace('{homeGoals}', (this.generateRandomNumber(15, 25) / 10).toFixed(1))
        .replace('{awayCleanSheets}', this.generateRandomNumber(1, 3).toString());
    } catch (error) {
      console.error('Error replacing placeholders:', error);
      return "Análise disponível";
    }
  }

  // Simulate sending matches for analysis
  async sendForAnalysis(matchIds: string[]): Promise<{
    analysisId: string;
    status: string;
    message: string;
    estimatedTime: string;
  }> {
    try {
      const analysisId = `analysis_${Date.now()}`;
      
      this.analysisQueue.set(analysisId, {
        id: analysisId,
        matchIds,
        status: 'pending',
        requestedAt: new Date().toISOString(),
        estimatedCompletionTime: 5000
      });

      setTimeout(() => {
        this._processAnalysis(analysisId, matchIds);
      }, 5000);

      return {
        analysisId,
        status: 'queued',
        message: `${matchIds.length} jogos em fila para análise`,
        estimatedTime: '5 segundos'
      };
    } catch (error) {
      console.error('Error in sendForAnalysis:', error);
      return {
        analysisId: `error_${Date.now()}`,
        status: 'error',
        message: 'Erro ao enviar para análise',
        estimatedTime: '0 segundos'
      };
    }
  }

  // Private method to simulate AI analysis
  private async _processAnalysis(analysisId: string, matchIds: string[]) {
    try {
      const analyzedResults = await Promise.all(matchIds.map(async matchId => {
        const mockMatch: Match = {
          id: matchId,
          league: 'Liga',
          home_team: 'Equipa Casa',
          away_team: 'Equipa Visitante',
          kickoff_utc: new Date().toISOString(),
          status: 'PRE',
          is_published: false,
          analysis_status: 'pending'
        };

        return await this.generateAnalysis(mockMatch);
      }));

      analyzedResults.forEach(result => {
        this.analyzedMatches.set(result.matchId, result);
      });

      const queueItem = this.analysisQueue.get(analysisId);
      if (queueItem) {
        queueItem.status = 'completed';
        queueItem.completedAt = new Date().toISOString();
      }
    } catch (error) {
      console.error('Error in _processAnalysis:', error);
    }
  }

  // Get all analyzed but unpublished matches
  async getAnalyzedMatches(): Promise<{
    matches: MatchAnalysis[];
    total: number;
  }> {
    try {
      const unpublished = [];
      
      for (const [matchId, analysis] of this.analyzedMatches) {
        if (!this.publishedMatches.has(matchId)) {
          unpublished.push(analysis);
        }
      }
      
      return {
        matches: unpublished,
        total: unpublished.length
      };
    } catch (error) {
      console.error('Error in getAnalyzedMatches:', error);
      return {
        matches: [],
        total: 0
      };
    }
  }

  // Publish selected matches
  async publishMatches(matchIds: string[]): Promise<{
    published: number;
    matches: MatchAnalysis[];
    message: string;
  }> {
    try {
      const published = [];
      
      for (const matchId of matchIds) {
        const analysis = this.analyzedMatches.get(matchId);
        if (analysis) {
          this.publishedMatches.set(matchId, analysis);
          published.push(analysis);
        }
      }
      
      return {
        published: published.length,
        matches: published,
        message: `${published.length} jogos publicados com sucesso`
      };
    } catch (error) {
      console.error('Error in publishMatches:', error);
      return {
        published: 0,
        matches: [],
        message: 'Erro ao publicar jogos'
      };
    }
  }

  // Get published matches
  async getPublishedMatches(): Promise<{
    matches: MatchAnalysis[];
    total: number;
  }> {
    try {
      const published = Array.from(this.publishedMatches.values());
      return {
        matches: published,
        total: published.length
      };
    } catch (error) {
      console.error('Error in getPublishedMatches:', error);
      return {
        matches: [],
        total: 0
      };
    }
  }

  // Get analysis status
  async getAnalysisStatus(analysisId: string): Promise<any> {
    try {
      return this.analysisQueue.get(analysisId) || { status: 'not_found' };
    } catch (error) {
      console.error('Error in getAnalysisStatus:', error);
      return { status: 'error' };
    }
  }

  // Get match analysis
  async getMatchAnalysis(matchId: string): Promise<MatchAnalysis | null> {
    try {
      return this.analyzedMatches.get(matchId) || null;
    } catch (error) {
      console.error('Error in getMatchAnalysis:', error);
      return null;
    }
  }

  // Generate analysis - SIMPLIFIED AND ROBUST
  async generateAnalysis(match: Match): Promise<MatchAnalysis> {
    try {
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));

      const analysisId = `analysis_${match.id}_${Date.now()}`;
      const now = new Date().toISOString();

      // Generate summary with fallback
      let summary: string;
      try {
        summary = this.replacePlaceholders(
          this.getRandomElement(this.analysisTemplates.summary),
          match
        );
      } catch (error) {
        summary = `Análise disponível para ${match.home_team} vs ${match.away_team}`;
      }

      // Generate key insights (2-3 insights)
      const keyInsights = [];
      try {
        const numInsights = this.generateRandomNumber(2, 3);
        const usedInsights = new Set();
        
        for (let i = 0; i < numInsights && i < this.analysisTemplates.keyInsights.length; i++) {
          let insight;
          do {
            insight = this.getRandomElement(this.analysisTemplates.keyInsights);
          } while (usedInsights.has(insight));
          
          usedInsights.add(insight);
          keyInsights.push(this.replacePlaceholders(insight, match));
        }
      } catch (error) {
        keyInsights.push("Análise estatística disponível");
      }

      // Generate confidence (60-90%)
      const confidence = this.generateRandomNumber(60, 90);

      // Generate risk factors (1-2 factors)
      const riskFactors = [];
      try {
        const numRiskFactors = this.generateRandomNumber(1, 2);
        const usedRiskFactors = new Set();
        
        for (let i = 0; i < numRiskFactors && i < this.analysisTemplates.riskFactors.length; i++) {
          let factor;
          do {
            factor = this.getRandomElement(this.analysisTemplates.riskFactors);
          } while (usedRiskFactors.has(factor));
          
          usedRiskFactors.add(factor);
          riskFactors.push(factor);
        }
      } catch (error) {
        riskFactors.push("Fatores de risco a considerar");
      }

      // Generate recommendations (2-3 recommendations)
      const recommendations = [];
      try {
        const numRecommendations = this.generateRandomNumber(2, 3);
        const usedRecommendations = new Set();
        
        for (let i = 0; i < numRecommendations && i < this.analysisTemplates.recommendations.length; i++) {
          let recommendation;
          do {
            recommendation = this.getRandomElement(this.analysisTemplates.recommendations);
          } while (usedRecommendations.has(recommendation));
          
          usedRecommendations.add(recommendation);
          recommendations.push(recommendation);
        }
      } catch (error) {
        recommendations.push("Monitorizar desenvolvimento do jogo");
      }

      // Generate key moments (always 3)
      const keyMoments = [
        {
          minute: 15,
          type: 'goal_opportunity',
          description: 'Excelente construção de jogo levando a quase golo',
          importance: 'high' as const
        },
        {
          minute: 34,
          type: 'tactical_shift',
          description: 'Mudança de formação tática',
          importance: 'medium' as const
        },
        {
          minute: 67,
          type: 'decisive_goal',
          description: 'Contra-ataque resultando em golo da vitória',
          importance: 'critical' as const
        }
      ];

      // Generate tactical insights
      const homePossession = this.generateRandomNumber(45, 65);
      const tacticalInsights = {
        homeTeam: {
          formation: '4-3-3',
          possessionPercentage: homePossession,
          pressingIntensity: 'alta',
          weaknesses: ['Defesa do flanco esquerdo', 'Defesa de bolas paradas'],
          strengths: ['Retenção de bola', 'Transições rápidas']
        },
        awayTeam: {
          formation: '5-3-2',
          possessionPercentage: 100 - homePossession,
          pressingIntensity: 'média',
          weaknesses: ['Criação de oportunidades', 'Controlo do meio-campo'],
          strengths: ['Organização defensiva', 'Contra-ataques']
        }
      };

      // Generate player performances (always 2)
      const playerPerformances = [
        {
          playerId: 'player_1',
          name: 'João Silva',
          rating: 8.5,
          keyStats: {
            goals: 1,
            assists: 1,
            passAccuracy: 89,
            keyPasses: 4
          }
        },
        {
          playerId: 'player_2',
          name: 'Miguel Santos',
          rating: 7.8,
          keyStats: {
            goals: 0,
            assists: 0,
            tackles: 6,
            interceptions: 4
          }
        }
      ];

      // Generate predicted outcome
      const homeWinProb = this.generateRandomNumber(30, 70);
      const drawProb = this.generateRandomNumber(15, 35);
      const awayWinProb = Math.max(0, 100 - homeWinProb - drawProb);

      const predictedOutcome = {
        homeWinProbability: homeWinProb,
        drawProbability: drawProb,
        awayWinProbability: awayWinProb,
        predictedScore: `${this.generateRandomNumber(1, 3)}-${this.generateRandomNumber(0, 2)}`
      };

      // Generate realistic stats
      const stats = {
        possession: {
          home: tacticalInsights.homeTeam.possessionPercentage,
          away: tacticalInsights.awayTeam.possessionPercentage
        },
        shots: {
          home: this.generateRandomNumber(8, 18),
          away: this.generateRandomNumber(6, 16)
        },
        shotsOnTarget: {
          home: this.generateRandomNumber(3, 8),
          away: this.generateRandomNumber(2, 7)
        },
        corners: {
          home: this.generateRandomNumber(4, 12),
          away: this.generateRandomNumber(3, 10)
        },
        fouls: {
          home: this.generateRandomNumber(8, 16),
          away: this.generateRandomNumber(9, 17)
        },
        yellowCards: {
          home: this.generateRandomNumber(1, 4),
          away: this.generateRandomNumber(1, 4)
        },
        redCards: {
          home: this.generateRandomNumber(0, 1),
          away: this.generateRandomNumber(0, 1)
        }
      };

      return {
        id: analysisId,
        matchId: match.id,
        homeTeam: match.home_team || 'Equipa Casa',
        awayTeam: match.away_team || 'Equipa Visitante',
        league: match.league || 'Liga',
        kickoffUtc: match.kickoff_utc,
        analysis: {
          summary,
          keyMoments,
          tacticalInsights,
          playerPerformances,
          predictedOutcome,
          viewerEngagementScore: Number((Math.random() * 2 + 8).toFixed(1)), // 8.0-10.0
          highlightWorthiness: this.getRandomElement(['low', 'medium', 'high']),
          keyInsights,
          confidence,
          riskFactors,
          recommendations
        },
        stats,
        createdAt: now,
        updatedAt: now
      };
    } catch (error) {
      console.error('Error in generateAnalysis:', error);
      
      // Return a safe fallback analysis
      return {
        id: `fallback_${Date.now()}`,
        matchId: match.id,
        homeTeam: match.home_team || 'Equipa Casa',
        awayTeam: match.away_team || 'Equipa Visitante',
        league: match.league || 'Liga',
        kickoffUtc: match.kickoff_utc,
        analysis: {
          summary: "Análise disponível para este jogo",
          keyMoments: [
            {
              minute: 15,
              type: 'goal_opportunity',
              description: 'Oportunidade de golo',
              importance: 'medium'
            }
          ],
          tacticalInsights: {
            homeTeam: {
              formation: '4-3-3',
              possessionPercentage: 55,
              pressingIntensity: 'média',
              weaknesses: ['A definir'],
              strengths: ['A definir']
            },
            awayTeam: {
              formation: '4-4-2',
              possessionPercentage: 45,
              pressingIntensity: 'média',
              weaknesses: ['A definir'],
              strengths: ['A definir']
            }
          },
          playerPerformances: [
            {
              playerId: 'player_1',
              name: 'Jogador 1',
              rating: 7.0,
              keyStats: {
                goals: 0,
                assists: 0,
                passAccuracy: 80
              }
            }
          ],
          predictedOutcome: {
            homeWinProbability: 40,
            drawProbability: 30,
            awayWinProbability: 30,
            predictedScore: '1-1'
          },
          viewerEngagementScore: 7.5,
          highlightWorthiness: 'medium',
          keyInsights: ['Análise em desenvolvimento'],
          confidence: 70,
          riskFactors: ['Fatores a considerar'],
          recommendations: ['Monitorizar jogo']
        },
        stats: {
          possession: { home: 55, away: 45 },
          shots: { home: 10, away: 8 },
          shotsOnTarget: { home: 4, away: 3 },
          corners: { home: 6, away: 5 },
          fouls: { home: 12, away: 13 },
          yellowCards: { home: 2, away: 2 },
          redCards: { home: 0, away: 0 }
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    }
  }

  // Get analysis
  async getAnalysis(matchId: string): Promise<MatchAnalysis | null> {
    return this.getMatchAnalysis(matchId);
  }

  // Save analysis
  async saveAnalysis(analysis: MatchAnalysis): Promise<boolean> {
    try {
      this.analyzedMatches.set(analysis.matchId, analysis);
      return true;
    } catch (error) {
      console.error('Error in saveAnalysis:', error);
      return false;
    }
  }
}

// Export singleton instance
export const mockAnalysisService = new MockAnalysisService(); 