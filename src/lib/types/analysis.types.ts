export interface Analysis {
  id: string;
  match_id: string;
  
  // AI-generated content
  prediction: string;
  confidence_score: number; // 0.0 to 1.0
  key_insights: string[];
  
  // Detailed analysis (flexible JSON structure)
  statistical_analysis: {
    possession_prediction?: number;
    goals_over_under?: number;
    both_teams_to_score?: boolean;
    win_probabilities?: {
      home_win: number;
      draw: number;
      away_win: number;
    };
    expected_goals?: {
      home: number;
      away: number;
    };
  };
  
  // Metadata
  ai_model_version: string;
  processing_time_ms: number;
  analysis_quality_score: number;
  created_at: string;
}

export interface AnalysisRequest {
  match_ids: string[];
  priority?: 'low' | 'normal' | 'high';
  analysis_types?: ('prediction' | 'insights' | 'statistics')[];
}

export interface AnalysisResponse {
  success: boolean;
  data: {
    queued_count: number;
    estimated_completion: string;
    job_ids: string[];
    matches_updated: Array<{
      match_id: string;
      status: string;
    }>;
  };
}

export interface DummyAnalysisOptions {
  realistic_delay?: boolean; // Simulate processing time
  confidence_range?: [number, number]; // Min/max confidence
  quality_score_range?: [number, number]; // Min/max quality
}

// For creating analysis (omits generated fields)
export type CreateAnalysisData = Omit<Analysis, 'id' | 'created_at'> & {
  id?: string;
  created_at?: string;
};

// Public analysis response (what frontend sees)
export interface PublicAnalysis {
  prediction: string;
  confidence_score: number;
  key_insights: string[];
  statistical_analysis: Analysis['statistical_analysis'];
  analysis_quality_score: number;
  created_at: string;
}