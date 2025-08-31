import { Analysis, DummyAnalysisOptions } from '../types/analysis.types';
import { Match } from '../types/match.types';

export class DummyAIService {
  
  async analyzeMatch(match: Match, options: DummyAnalysisOptions = {}): Promise<Omit<Analysis, 'id' | 'created_at'>> {
    const startTime = Date.now();
    
    // Simulate processing time (1-5 seconds)
    if (options.realistic_delay !== false) {
      const delay = 1000 + Math.random() * 4000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    
    const processingTime = Date.now() - startTime;
    
    // Generate realistic dummy analysis
    return {
      match_id: match.id,
      prediction: this.generatePrediction(match),
      confidence_score: this.generateConfidenceScore(options.confidence_range),
      key_insights: this.generateInsights(match),
      statistical_analysis: this.generateStatistics(match),
      ai_model_version: 'dummy-v1',
      processing_time_ms: processingTime,
      analysis_quality_score: this.generateQualityScore(options.quality_score_range)
    };
  }

  async analyzeBatch(matches: Match[], options: DummyAnalysisOptions = {}): Promise<Array<Omit<Analysis, 'id' | 'created_at'>>> {
    const analyses: Array<Omit<Analysis, 'id' | 'created_at'>> = [];
    
    for (const match of matches) {
      try {
        const analysis = await this.analyzeMatch(match, {
          ...options,
          realistic_delay: false // Process batch faster
        });
        analyses.push(analysis);
      } catch (error) {
        console.error(`Failed to analyze match ${match.id}:`, error);
      }
    }
    
    // Add small delay to simulate batch processing
    if (options.realistic_delay !== false && matches.length > 1) {
      await new Promise(resolve => setTimeout(resolve, 1000 + matches.length * 200));
    }
    
    return analyses;
  }

  private generatePrediction(match: Match): string {
    const predictions = [
      `${match.home_team} to win 2-1`,
      `${match.away_team} to win 1-0`,
      `Draw 1-1`,
      `${match.home_team} to win 3-2`,
      `${match.away_team} to win 2-1`,
      `Draw 2-2`,
      `${match.home_team} to win by 2+ goals`,
      `Tight match ending 1-0`,
      `High-scoring draw 3-3`,
      `${match.away_team} to win narrowly`,
      `${match.home_team} clean sheet victory`,
      `Both teams to score, over 2.5 goals`
    ];
    
    return predictions[Math.floor(Math.random() * predictions.length)];
  }

  private generateConfidenceScore(range?: [number, number]): number {
    const [min, max] = range || [0.6, 0.9];
    return Math.round((min + Math.random() * (max - min)) * 100) / 100;
  }

  private generateInsights(match: Match): string[] {
    const homeInsights = [
      `Strong home advantage expected at ${match.venue || 'home venue'}`,
      `${match.home_team}'s home form has been impressive recently`,
      `Home crowd could be decisive factor`,
      `${match.home_team} historically strong at home against this opponent`
    ];

    const awayInsights = [
      `${match.away_team} has excellent away record this season`,
      `Visitors have won their last 3 away matches`,
      `${match.away_team}'s counter-attacking style suits away games`,
      `Away team's defensive solidity on the road`
    ];

    const generalInsights = [
      "Both teams in excellent recent form",
      "Key player matchups will determine outcome", 
      "Weather conditions could affect play style",
      "Historical head-to-head records are evenly matched",
      "Set pieces could be decisive",
      "Expect high-tempo attacking football",
      "Midfield battle will be crucial",
      "Both goalkeepers in top form recently",
      "Tactical flexibility will be key",
      "Late substitutions likely to impact result",
      "European competition fatigue may be a factor",
      "Recent injury updates favor one side",
      "Press resistance will be tested",
      "Aerial duels expected to be important"
    ];
    
    // Mix insights from different categories
    const allInsights = [...homeInsights, ...awayInsights, ...generalInsights];
    
    // Return 3-4 random insights
    const numInsights = 3 + Math.floor(Math.random() * 2);
    const shuffled = allInsights.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, numInsights);
  }

  private generateStatistics(match: Match): Analysis['statistical_analysis'] {
    const homeAdvantage = 0.1 + Math.random() * 0.2; // 10-30% advantage
    
    return {
      possession_prediction: Math.round(45 + Math.random() * 20), // 45-65%
      goals_over_under: Math.round((1.5 + Math.random() * 2) * 10) / 10, // 1.5-3.5
      both_teams_to_score: Math.random() > 0.4, // 60% chance of yes
      win_probabilities: this.generateWinProbabilities(homeAdvantage),
      expected_goals: {
        home: Math.round((0.8 + Math.random() * 1.7 + homeAdvantage) * 10) / 10, // 0.8-2.5 + home advantage
        away: Math.round((0.6 + Math.random() * 1.9) * 10) / 10  // 0.6-2.5
      }
    };
  }

  private generateWinProbabilities(homeAdvantage: number = 0.15): { home_win: number, draw: number, away_win: number } {
    // Generate base probabilities
    let home = 0.3 + Math.random() * 0.4 + homeAdvantage; // 0.3-0.7 + advantage
    let draw = 0.2 + Math.random() * 0.3; // 0.2-0.5
    let away = 1 - home - draw;
    
    // Ensure away is positive and reasonable
    if (away < 0.1) {
      home = home - 0.1;
      away = 0.1;
    }
    
    // Normalize to ensure they sum to 1.0
    const total = home + draw + away;
    home = home / total;
    draw = draw / total;
    away = away / total;
    
    // Round to 2 decimal places
    return {
      home_win: Math.round(home * 100) / 100,
      draw: Math.round(draw * 100) / 100,
      away_win: Math.round(away * 100) / 100
    };
  }

  private generateQualityScore(range?: [number, number]): number {
    const [min, max] = range || [75, 95];
    return Math.floor(min + Math.random() * (max - min + 1));
  }

  // Health check for the AI service
  async healthCheck(): Promise<{ status: 'ok' | 'error'; message: string; response_time_ms: number }> {
    const startTime = Date.now();
    
    try {
      // Simulate a quick analysis
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const responseTime = Date.now() - startTime;
      
      return {
        status: 'ok',
        message: 'Dummy AI service is operational',
        response_time_ms: responseTime
      };
    } catch (error) {
      return {
        status: 'error',
        message: `AI service error: ${error.message}`,
        response_time_ms: Date.now() - startTime
      };
    }
  }

  // Get AI model info
  getModelInfo(): { version: string; type: string; capabilities: string[] } {
    return {
      version: 'dummy-v1',
      type: 'rule-based-simulation',
      capabilities: [
        'match_prediction',
        'statistical_analysis', 
        'key_insights_extraction',
        'confidence_scoring',
        'batch_processing'
      ]
    };
  }
}