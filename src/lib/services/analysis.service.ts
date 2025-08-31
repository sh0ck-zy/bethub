import { AnalysisRepository } from '../repositories/analysis.repository';
import { MatchRepository } from '../repositories/match.repository';
import { DummyAIService } from './dummy-ai.service';
import { Analysis, AnalysisRequest, AnalysisResponse, PublicAnalysis } from '../types/analysis.types';

export class AnalysisService {
  constructor(
    private analysisRepo: AnalysisRepository,
    private matchRepo: MatchRepository,
    private aiService: DummyAIService
  ) {}

  async requestAnalysis(request: AnalysisRequest): Promise<AnalysisResponse> {
    console.log(`🤖 Admin triggered: Analysis for ${request.match_ids.length} matches`);
    
    if (request.match_ids.length === 0) {
      throw new Error('No match IDs provided for analysis');
    }
    
    if (request.match_ids.length > 20) {
      throw new Error('Cannot analyze more than 20 matches at once');
    }
    
    const jobIds: string[] = [];
    let queuedCount = 0;
    const matchesUpdated: Array<{ match_id: string, status: string }> = [];
    
    // Validate matches exist and can be analyzed
    const matches = await this.matchRepo.findByIds(request.match_ids);
    const foundMatchIds = matches.map(m => m.id);
    const missingMatchIds = request.match_ids.filter(id => !foundMatchIds.includes(id));
    
    if (missingMatchIds.length > 0) {
      throw new Error(`Matches not found: ${missingMatchIds.join(', ')}`);
    }
    
    for (const matchId of request.match_ids) {
      try {
        const match = matches.find(m => m.id === matchId);
        if (!match) continue;
        
        // Check if match is eligible for analysis
        if (!match.is_pulled) {
          matchesUpdated.push({ match_id: matchId, status: 'skipped_not_pulled' });
          continue;
        }
        
        // Update match status to pending
        await this.matchRepo.updateMatch(matchId, {
          analysis_status: 'pending',
          analysis_priority: request.priority || 'normal',
          updated_at: new Date().toISOString()
        });
        
        // Create job ID
        const jobId = `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        jobIds.push(jobId);
        matchesUpdated.push({ match_id: matchId, status: 'queued' });
        
        // Process analysis asynchronously (don't await)
        this.processMatchAnalysis(matchId, request.priority || 'normal', jobId).catch(error => {
          console.error(`Background analysis failed for match ${matchId}:`, error);
        });
        
        queuedCount++;
        
      } catch (error) {
        console.error(`Failed to queue analysis for match ${matchId}:`, error);
        matchesUpdated.push({ match_id: matchId, status: 'failed_to_queue' });
      }
    }
    
    // Estimate completion time
    const estimatedCompletion = this.estimateCompletionTime(queuedCount);
    
    console.log(`✅ Queued ${queuedCount}/${request.match_ids.length} matches for analysis`);
    
    return {
      success: true,
      data: {
        queued_count: queuedCount,
        estimated_completion: estimatedCompletion,
        job_ids: jobIds,
        matches_updated: matchesUpdated
      }
    };
  }

  private async processMatchAnalysis(matchId: string, priority: string, jobId: string): Promise<void> {
    try {
      console.log(`🔄 [${jobId}] Starting analysis for match ${matchId}`);
      
      // Get match data
      const match = await this.matchRepo.findById(matchId);
      if (!match) {
        throw new Error(`Match ${matchId} not found during processing`);
      }
      
      // Check if analysis already exists
      const existingAnalysis = await this.analysisRepo.findByMatchId(matchId);
      if (existingAnalysis) {
        console.log(`⚠️  [${jobId}] Analysis already exists for match ${matchId}, updating...`);
      }
      
      // Generate AI analysis (dummy)
      const analysisData = await this.aiService.analyzeMatch(match, {
        realistic_delay: true,
        confidence_range: priority === 'high' ? [0.75, 0.95] : [0.6, 0.85],
        quality_score_range: priority === 'high' ? [85, 95] : [75, 90]
      });
      
      // Save or update analysis results
      let analysis: Analysis;
      
      if (existingAnalysis) {
        analysis = await this.analysisRepo.update(existingAnalysis.id, {
          ...analysisData,
          id: existingAnalysis.id,
          created_at: existingAnalysis.created_at
        });
      } else {
        analysis = await this.analysisRepo.create({
          ...analysisData,
          id: `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          created_at: new Date().toISOString()
        });
      }
      
      // Update match status
      await this.matchRepo.updateMatch(matchId, {
        analysis_status: 'completed',
        is_analyzed: true,
        analyzed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      
      console.log(`✅ [${jobId}] Analysis completed for match ${matchId} (confidence: ${analysis.confidence_score})`);
      
    } catch (error) {
      console.error(`❌ [${jobId}] Analysis failed for match ${matchId}:`, error);
      
      // Update match status to failed
      try {
        await this.matchRepo.updateMatch(matchId, {
          analysis_status: 'failed',
          updated_at: new Date().toISOString()
        });
      } catch (updateError) {
        console.error(`Failed to update match status to failed:`, updateError);
      }
    }
  }

  async getAnalysis(matchId: string): Promise<Analysis | null> {
    try {
      return await this.analysisRepo.findByMatchId(matchId);
    } catch (error) {
      console.error(`Failed to get analysis for match ${matchId}:`, error);
      throw new Error(`Failed to retrieve analysis: ${error.message}`);
    }
  }

  async getPublicAnalysis(matchId: string): Promise<PublicAnalysis | null> {
    try {
      const analysis = await this.analysisRepo.findByMatchId(matchId);
      
      if (!analysis) {
        return null;
      }
      
      // Transform to public format (remove sensitive fields)
      return {
        prediction: analysis.prediction,
        confidence_score: analysis.confidence_score,
        key_insights: analysis.key_insights,
        statistical_analysis: analysis.statistical_analysis,
        analysis_quality_score: analysis.analysis_quality_score,
        created_at: analysis.created_at
      };
    } catch (error) {
      console.error(`Failed to get public analysis for match ${matchId}:`, error);
      throw new Error(`Failed to retrieve analysis: ${error.message}`);
    }
  }

  async reprocessAnalysis(matchId: string, priority: string = 'normal'): Promise<{ success: boolean; job_id: string }> {
    try {
      // Check if match exists
      const match = await this.matchRepo.findById(matchId);
      if (!match) {
        throw new Error('Match not found');
      }
      
      // Delete existing analysis if it exists
      await this.analysisRepo.deleteByMatchId(matchId);
      
      // Reset match analysis status
      await this.matchRepo.updateMatch(matchId, {
        is_analyzed: false,
        analysis_status: 'pending',
        analysis_priority: priority,
        analyzed_at: null,
        updated_at: new Date().toISOString()
      });
      
      // Process analysis
      const jobId = `reprocess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      this.processMatchAnalysis(matchId, priority, jobId).catch(error => {
        console.error(`Background reprocessing failed for match ${matchId}:`, error);
      });
      
      console.log(`🔄 Reprocessing analysis for match ${matchId}`);
      
      return { success: true, job_id: jobId };
      
    } catch (error) {
      console.error(`Failed to reprocess analysis for match ${matchId}:`, error);
      throw new Error(`Failed to reprocess analysis: ${error.message}`);
    }
  }

  async getAnalysisStats() {
    try {
      return await this.analysisRepo.getAnalysisStats();
    } catch (error) {
      console.error('Failed to get analysis stats:', error);
      throw new Error(`Failed to retrieve analysis stats: ${error.message}`);
    }
  }

  async getRecentAnalysis(limit: number = 10): Promise<Analysis[]> {
    try {
      return await this.analysisRepo.getRecentAnalysis(limit);
    } catch (error) {
      console.error('Failed to get recent analysis:', error);
      throw new Error(`Failed to retrieve recent analysis: ${error.message}`);
    }
  }

  private estimateCompletionTime(queuedCount: number): string {
    if (queuedCount === 0) {
      return "No matches queued";
    } else if (queuedCount === 1) {
      return "2-5 seconds";
    } else if (queuedCount <= 5) {
      return "30 seconds - 1 minute";
    } else if (queuedCount <= 10) {
      return "1-2 minutes";
    } else {
      return "2-5 minutes";
    }
  }

  // Health check for analysis service
  async healthCheck(): Promise<{ status: 'ok' | 'error'; ai_service: any; database: 'connected' | 'error' }> {
    try {
      // Check AI service
      const aiHealth = await this.aiService.healthCheck();
      
      // Check database connectivity
      let dbStatus: 'connected' | 'error' = 'connected';
      try {
        await this.analysisRepo.getAnalysisStats();
      } catch {
        dbStatus = 'error';
      }
      
      return {
        status: aiHealth.status === 'ok' && dbStatus === 'connected' ? 'ok' : 'error',
        ai_service: aiHealth,
        database: dbStatus
      };
    } catch (error) {
      return {
        status: 'error',
        ai_service: { status: 'error', message: error.message },
        database: 'error'
      };
    }
  }
}