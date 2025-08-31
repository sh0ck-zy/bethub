import { BaseRepository } from './base.repository';
import { Analysis, CreateAnalysisData } from '../types/analysis.types';

export class AnalysisRepository extends BaseRepository {

  async create(analysisData: CreateAnalysisData): Promise<Analysis> {
    try {
      const dataToInsert = {
        ...analysisData,
        id: analysisData.id || `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        created_at: analysisData.created_at || this.now()
      };

      const { data, error } = await this.supabase
        .from('analysis')
        .insert([dataToInsert])
        .select('*')
        .single();

      if (error) {
        this.handleError(error, 'create analysis');
      }

      return data;
      
    } catch (error) {
      this.handleError(error, 'create analysis');
    }
  }

  async findByMatchId(matchId: string): Promise<Analysis | null> {
    try {
      const { data, error } = await this.supabase
        .from('analysis')
        .select('*')
        .eq('match_id', matchId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') { // Not found
          return null;
        }
        this.handleError(error, 'find analysis by match id');
      }

      return data;
      
    } catch (error) {
      if (error.message.includes('not found')) {
        return null;
      }
      throw error;
    }
  }

  async findByMatchIds(matchIds: string[]): Promise<Analysis[]> {
    if (matchIds.length === 0) {
      return [];
    }

    try {
      const { data, error } = await this.supabase
        .from('analysis')
        .select('*')
        .in('match_id', matchIds);

      if (error) {
        this.handleError(error, 'find analysis by match ids');
      }

      return data || [];
      
    } catch (error) {
      this.handleError(error, 'find analysis by match ids');
    }
  }

  async findById(id: string): Promise<Analysis | null> {
    try {
      const { data, error } = await this.supabase
        .from('analysis')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') { // Not found
          return null;
        }
        this.handleError(error, 'find analysis by id');
      }

      return data;
      
    } catch (error) {
      if (error.message.includes('not found')) {
        return null;
      }
      throw error;
    }
  }

  async update(id: string, updates: Partial<Analysis>): Promise<Analysis> {
    try {
      const { data, error } = await this.supabase
        .from('analysis')
        .update(updates)
        .eq('id', id)
        .select('*')
        .single();

      if (error) {
        this.handleError(error, 'update analysis');
      }

      return data;
      
    } catch (error) {
      this.handleError(error, 'update analysis');
    }
  }

  async deleteByMatchId(matchId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('analysis')
        .delete()
        .eq('match_id', matchId);

      if (error) {
        this.handleError(error, 'delete analysis by match id');
      }
      
    } catch (error) {
      this.handleError(error, 'delete analysis by match id');
    }
  }

  async getRecentAnalysis(limit: number = 10): Promise<Analysis[]> {
    try {
      const { data, error } = await this.supabase
        .from('analysis')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        this.handleError(error, 'get recent analysis');
      }

      return data || [];
      
    } catch (error) {
      this.handleError(error, 'get recent analysis');
    }
  }

  async getAnalysisStats(): Promise<{
    total_analysis: number;
    average_confidence: number;
    average_quality_score: number;
    recent_count: number;
  }> {
    try {
      // Get basic counts and averages
      const { data, error } = await this.supabase
        .from('analysis')
        .select('confidence_score, analysis_quality_score, created_at');

      if (error) {
        this.handleError(error, 'get analysis stats');
      }

      const analyses = data || [];
      const total = analyses.length;
      
      if (total === 0) {
        return {
          total_analysis: 0,
          average_confidence: 0,
          average_quality_score: 0,
          recent_count: 0
        };
      }

      const avgConfidence = analyses.reduce((sum, a) => sum + a.confidence_score, 0) / total;
      const avgQuality = analyses.reduce((sum, a) => sum + a.analysis_quality_score, 0) / total;
      
      // Count recent analyses (last 24 hours)
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const recentCount = analyses.filter(a => a.created_at > oneDayAgo).length;

      return {
        total_analysis: total,
        average_confidence: Math.round(avgConfidence * 100) / 100,
        average_quality_score: Math.round(avgQuality),
        recent_count: recentCount
      };
      
    } catch (error) {
      this.handleError(error, 'get analysis stats');
    }
  }
}