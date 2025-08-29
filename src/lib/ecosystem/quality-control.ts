/**
 * Quality Control Module - Content Validation and Safety Checks
 * Ensures all content meets quality standards before publication
 */

import { eventBus, emitEvent } from './event-bus';
import { supabase } from '../supabase';

export interface QualityCheck {
  id: string;
  name: string;
  category: 'safety' | 'accuracy' | 'completeness' | 'style';
  severity: 'critical' | 'major' | 'minor';
  description: string;
  automated: boolean;
}

export interface QualityResult {
  check_id: string;
  status: 'pass' | 'fail' | 'warning';
  score: number; // 0-100
  details: string;
  suggestions?: string[];
}

export interface ContentValidation {
  match_id: string;
  analysis_id: string;
  validation_id: string;
  
  // Overall scores
  overall_score: number; // 0-100
  safety_score: number;
  accuracy_score: number;
  completeness_score: number;
  style_score: number;
  
  // Check results
  checks_performed: QualityResult[];
  critical_issues: number;
  major_issues: number;
  minor_issues: number;
  
  // Decision
  validation_status: 'approved' | 'rejected' | 'needs_review' | 'pending_manual';
  approval_reason?: string;
  rejection_reason?: string;
  
  // Metadata
  validated_at: string;
  validation_version: string;
  auto_approved: boolean;
}

/**
 * Quality Control Module - Validates content before publication
 */
export class QualityControlModule {
  private readonly QUALITY_CHECKS: QualityCheck[] = [
    // Safety checks
    {
      id: 'profanity-check',
      name: 'Profanity Detection',
      category: 'safety',
      severity: 'critical',
      description: 'Scans for inappropriate language and profanity',
      automated: true
    },
    {
      id: 'bias-detection',
      name: 'Bias Detection',
      category: 'safety',
      severity: 'major',
      description: 'Checks for unfair bias toward teams or players',
      automated: true
    },
    {
      id: 'factual-accuracy',
      name: 'Factual Accuracy',
      category: 'accuracy',
      severity: 'critical',
      description: 'Validates team names, dates, and basic facts',
      automated: true
    },
    {
      id: 'confidence-threshold',
      name: 'AI Confidence Check',
      category: 'accuracy',
      severity: 'major',
      description: 'Ensures AI confidence meets minimum thresholds',
      automated: true
    },
    {
      id: 'content-completeness',
      name: 'Content Completeness',
      category: 'completeness',
      severity: 'major',
      description: 'Verifies all required sections are present',
      automated: true
    },
    {
      id: 'data-sufficiency',
      name: 'Data Sufficiency',
      category: 'completeness',
      severity: 'minor',
      description: 'Checks if enough context data was used',
      automated: true
    },
    {
      id: 'readability-score',
      name: 'Readability Assessment',
      category: 'style',
      severity: 'minor',
      description: 'Evaluates text readability and clarity',
      automated: true
    },
    {
      id: 'brand-consistency',
      name: 'Brand Consistency',
      category: 'style',
      severity: 'minor',
      description: 'Ensures content matches brand voice and style',
      automated: true
    }
  ];

  private validationQueue: Array<{
    match_id: string;
    analysis_id: string;
    priority: 'high' | 'medium' | 'low';
  }> = [];
  
  private isProcessing = false;

  constructor() {
    this.setupEventHandlers();
  }

  /**
   * Setup event handlers
   */
  private setupEventHandlers(): void {
    // Listen for completed analysis
    eventBus.on('analysis.completed', async (event) => {
      console.log(`[QualityControl] Queueing validation for analysis: ${event.data.analysis.analysis_id}`);
      await this.queueValidation(
        event.data.match_id,
        event.data.analysis.analysis_id,
        this.getPriorityFromConfidence(event.data.confidence_score)
      );
    });
  }

  /**
   * Queue content for validation
   */
  async queueValidation(matchId: string, analysisId: string, priority: 'high' | 'medium' | 'low' = 'medium'): Promise<void> {
    this.validationQueue.push({ match_id: matchId, analysis_id: analysisId, priority });
    
    // Sort by priority
    this.validationQueue.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    console.log(`[QualityControl] Queued validation for match ${matchId} (priority: ${priority})`);

    if (!this.isProcessing) {
      this.processValidationQueue();
    }
  }

  /**
   * Process validation queue
   */
  private async processValidationQueue(): Promise<void> {
    if (this.isProcessing || this.validationQueue.length === 0) {
      return;
    }

    this.isProcessing = true;
    console.log(`[QualityControl] Processing ${this.validationQueue.length} validation requests`);

    while (this.validationQueue.length > 0) {
      const request = this.validationQueue.shift()!;
      
      try {
        await this.validateContent(request.match_id, request.analysis_id);
        
        // Small delay between validations
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`[QualityControl] Validation failed for ${request.analysis_id}:`, error);
        
        await emitEvent(
          'system.error',
          'quality-control-module',
          {
            match_id: request.match_id,
            analysis_id: request.analysis_id,
            error: error instanceof Error ? error.message : String(error),
            module: 'quality-control'
          }
        );
      }
    }

    this.isProcessing = false;
    console.log('[QualityControl] Finished processing validation queue');
  }

  /**
   * Validate content
   */
  async validateContent(matchId: string, analysisId: string): Promise<ContentValidation> {
    console.log(`[QualityControl] Validating content for analysis ${analysisId}`);

    // Get analysis data
    const { data: analysis, error: analysisError } = await supabase
      .from('analysis_snapshots')
      .select('*')
      .eq('id', analysisId)
      .single();

    if (analysisError || !analysis) {
      throw new Error(`Failed to get analysis data: ${analysisError?.message}`);
    }

    // Get match data for context
    const { data: match } = await supabase
      .from('matches')
      .select('*, intelligence_data')
      .eq('id', matchId)
      .single();

    if (!match) {
      throw new Error('Match data not found');
    }

    // Perform all quality checks
    const checkResults = await this.performQualityChecks(analysis, match);

    // Calculate scores
    const scores = this.calculateQualityScores(checkResults);

    // Determine validation status
    const validationStatus = this.determineValidationStatus(checkResults, scores);

    const validation: ContentValidation = {
      match_id: matchId,
      analysis_id: analysisId,
      validation_id: `validation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      
      overall_score: scores.overall,
      safety_score: scores.safety,
      accuracy_score: scores.accuracy,
      completeness_score: scores.completeness,
      style_score: scores.style,
      
      checks_performed: checkResults,
      critical_issues: checkResults.filter(r => r.status === 'fail' && this.getCheckSeverity(r.check_id) === 'critical').length,
      major_issues: checkResults.filter(r => r.status === 'fail' && this.getCheckSeverity(r.check_id) === 'major').length,
      minor_issues: checkResults.filter(r => r.status === 'fail' && this.getCheckSeverity(r.check_id) === 'minor').length,
      
      validation_status: validationStatus.status,
      approval_reason: validationStatus.reason,
      rejection_reason: validationStatus.status === 'rejected' ? validationStatus.reason : undefined,
      
      validated_at: new Date().toISOString(),
      validation_version: '1.0.0',
      auto_approved: validationStatus.status === 'approved' && scores.overall >= 85
    };

    // Store validation result
    await this.storeValidationResult(validation);

    // Emit validation event
    await emitEvent(
      'content.validated',
      'quality-control-module',
      {
        match_id: matchId,
        analysis_id: analysisId,
        validation_status: validation.validation_status,
        overall_score: validation.overall_score,
        auto_approved: validation.auto_approved
      },
      `validation_${matchId}`
    );

    console.log(`[QualityControl] Validation complete for ${analysisId}: ${validation.validation_status} (score: ${validation.overall_score})`);
    return validation;
  }

  /**
   * Perform all quality checks
   */
  private async performQualityChecks(analysis: any, match: any): Promise<QualityResult[]> {
    const results: QualityResult[] = [];

    for (const check of this.QUALITY_CHECKS) {
      try {
        const result = await this.performCheck(check, analysis, match);
        results.push(result);
      } catch (error) {
        console.error(`[QualityControl] Check ${check.id} failed:`, error);
        results.push({
          check_id: check.id,
          status: 'fail',
          score: 0,
          details: `Check failed: ${error instanceof Error ? error.message : String(error)}`
        });
      }
    }

    return results;
  }

  /**
   * Perform individual quality check
   */
  private async performCheck(check: QualityCheck, analysis: any, match: any): Promise<QualityResult> {
    const analysisData = analysis.analysis_data || {};
    const content = `${analysisData.prediction || ''} ${analysisData.key_insights?.join(' ') || ''}`;

    switch (check.id) {
      case 'profanity-check':
        return this.checkProfanity(content);
        
      case 'bias-detection':
        return this.checkBias(content, match);
        
      case 'factual-accuracy':
        return this.checkFactualAccuracy(analysisData, match);
        
      case 'confidence-threshold':
        return this.checkConfidenceThreshold(analysis);
        
      case 'content-completeness':
        return this.checkContentCompleteness(analysisData);
        
      case 'data-sufficiency':
        return this.checkDataSufficiency(match);
        
      case 'readability-score':
        return this.checkReadability(content);
        
      case 'brand-consistency':
        return this.checkBrandConsistency(content);
        
      default:
        return {
          check_id: check.id,
          status: 'pass',
          score: 100,
          details: 'Check not implemented'
        };
    }
  }

  // Individual check implementations
  private checkProfanity(content: string): QualityResult {
    const profanityWords = ['damn', 'shit', 'fuck', 'bastard']; // Basic list
    const lowerContent = content.toLowerCase();
    const foundProfanity = profanityWords.filter(word => lowerContent.includes(word));

    return {
      check_id: 'profanity-check',
      status: foundProfanity.length === 0 ? 'pass' : 'fail',
      score: foundProfanity.length === 0 ? 100 : 0,
      details: foundProfanity.length === 0 ? 'No profanity detected' : `Found profanity: ${foundProfanity.join(', ')}`,
      suggestions: foundProfanity.length > 0 ? ['Remove inappropriate language', 'Use professional sports terminology'] : undefined
    };
  }

  private checkBias(content: string, match: any): QualityResult {
    const homeTeam = match.home_team.toLowerCase();
    const awayTeam = match.away_team.toLowerCase();
    const lowerContent = content.toLowerCase();

    // Simple bias detection - count team mentions
    const homeCount = (lowerContent.match(new RegExp(homeTeam, 'g')) || []).length;
    const awayCount = (lowerContent.match(new RegExp(awayTeam, 'g')) || []).length;
    
    const total = homeCount + awayCount;
    const bias = total > 0 ? Math.abs(homeCount - awayCount) / total : 0;

    const score = Math.max(0, 100 - (bias * 100));
    const status = bias < 0.3 ? 'pass' : bias < 0.5 ? 'warning' : 'fail';

    return {
      check_id: 'bias-detection',
      status,
      score: Math.round(score),
      details: `Team mention ratio: ${homeTeam} (${homeCount}) vs ${awayTeam} (${awayCount}), bias score: ${Math.round(bias * 100)}%`,
      suggestions: bias >= 0.3 ? ['Balance team coverage', 'Ensure neutral perspective'] : undefined
    };
  }

  private checkFactualAccuracy(analysisData: any, match: any): QualityResult {
    let score = 100;
    const issues: string[] = [];

    // Check if team names are referenced correctly
    const content = JSON.stringify(analysisData).toLowerCase();
    const homeTeam = match.home_team.toLowerCase();
    const awayTeam = match.away_team.toLowerCase();

    if (!content.includes(homeTeam)) {
      score -= 25;
      issues.push('Home team name not found in analysis');
    }

    if (!content.includes(awayTeam)) {
      score -= 25;
      issues.push('Away team name not found in analysis');
    }

    // Check for reasonable confidence score
    if (analysisData.confidence_score && (analysisData.confidence_score < 0 || analysisData.confidence_score > 100)) {
      score -= 30;
      issues.push('Invalid confidence score');
    }

    return {
      check_id: 'factual-accuracy',
      status: score >= 70 ? 'pass' : score >= 50 ? 'warning' : 'fail',
      score: Math.max(0, score),
      details: issues.length === 0 ? 'All basic facts verified' : issues.join(', '),
      suggestions: issues.length > 0 ? ['Verify team names', 'Check data accuracy'] : undefined
    };
  }

  private checkConfidenceThreshold(analysis: any): QualityResult {
    const confidence = analysis.confidence_score || 0;
    const minThreshold = 70; // Configurable threshold

    return {
      check_id: 'confidence-threshold',
      status: confidence >= minThreshold ? 'pass' : 'fail',
      score: Math.min(100, (confidence / minThreshold) * 100),
      details: `AI confidence: ${confidence}%, threshold: ${minThreshold}%`,
      suggestions: confidence < minThreshold ? ['Improve data quality', 'Gather more context'] : undefined
    };
  }

  private checkContentCompleteness(analysisData: any): QualityResult {
    const requiredSections = ['prediction', 'key_insights', 'tactical_analysis'];
    const presentSections = requiredSections.filter(section => analysisData[section]);
    
    const completeness = presentSections.length / requiredSections.length;
    const score = completeness * 100;

    return {
      check_id: 'content-completeness',
      status: completeness >= 0.8 ? 'pass' : completeness >= 0.6 ? 'warning' : 'fail',
      score: Math.round(score),
      details: `${presentSections.length}/${requiredSections.length} required sections present`,
      suggestions: completeness < 0.8 ? ['Add missing analysis sections', 'Ensure comprehensive coverage'] : undefined
    };
  }

  private checkDataSufficiency(match: any): QualityResult {
    let score = 50; // Base score
    
    if (match.intelligence_data?.home_team_intel) score += 20;
    if (match.intelligence_data?.away_team_intel) score += 20;
    if (match.intelligence_data?.venue_intel) score += 10;

    return {
      check_id: 'data-sufficiency',
      status: score >= 80 ? 'pass' : score >= 60 ? 'warning' : 'fail',
      score,
      details: `Data richness score: ${score}%`,
      suggestions: score < 80 ? ['Gather more team data', 'Include venue information'] : undefined
    };
  }

  private checkReadability(content: string): QualityResult {
    // Simple readability check
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = content.split(/\s+/).filter(w => w.length > 0);
    
    const avgWordsPerSentence = sentences.length > 0 ? words.length / sentences.length : 0;
    const avgCharsPerWord = words.length > 0 ? content.replace(/\s/g, '').length / words.length : 0;

    // Ideal: 15-20 words per sentence, 4-6 chars per word
    let score = 100;
    if (avgWordsPerSentence > 25) score -= 20;
    if (avgWordsPerSentence < 8) score -= 10;
    if (avgCharsPerWord > 7) score -= 15;

    return {
      check_id: 'readability-score',
      status: score >= 70 ? 'pass' : 'warning',
      score: Math.max(0, score),
      details: `Avg words/sentence: ${Math.round(avgWordsPerSentence)}, avg chars/word: ${Math.round(avgCharsPerWord)}`,
      suggestions: score < 70 ? ['Simplify sentence structure', 'Use clearer language'] : undefined
    };
  }

  private checkBrandConsistency(content: string): QualityResult {
    // Check for consistent professional tone
    const informalWords = ['gonna', 'wanna', 'awesome', 'totally', 'super'];
    const foundInformal = informalWords.filter(word => content.toLowerCase().includes(word));

    return {
      check_id: 'brand-consistency',
      status: foundInformal.length === 0 ? 'pass' : 'warning',
      score: foundInformal.length === 0 ? 100 : Math.max(60, 100 - (foundInformal.length * 20)),
      details: foundInformal.length === 0 ? 'Professional tone maintained' : `Informal language detected: ${foundInformal.join(', ')}`,
      suggestions: foundInformal.length > 0 ? ['Use professional sports terminology', 'Maintain consistent brand voice'] : undefined
    };
  }

  /**
   * Calculate quality scores by category
   */
  private calculateQualityScores(results: QualityResult[]): {
    overall: number;
    safety: number;
    accuracy: number;
    completeness: number;
    style: number;
  } {
    const byCategory = this.groupResultsByCategory(results);
    
    const scores = {
      safety: this.calculateCategoryScore(byCategory.safety),
      accuracy: this.calculateCategoryScore(byCategory.accuracy),
      completeness: this.calculateCategoryScore(byCategory.completeness),
      style: this.calculateCategoryScore(byCategory.style)
    };

    // Weighted overall score (safety and accuracy are more important)
    const overall = (
      scores.safety * 0.4 +
      scores.accuracy * 0.3 +
      scores.completeness * 0.2 +
      scores.style * 0.1
    );

    return {
      overall: Math.round(overall),
      safety: Math.round(scores.safety),
      accuracy: Math.round(scores.accuracy),
      completeness: Math.round(scores.completeness),
      style: Math.round(scores.style)
    };
  }

  private groupResultsByCategory(results: QualityResult[]): Record<string, QualityResult[]> {
    const groups: Record<string, QualityResult[]> = {
      safety: [],
      accuracy: [],
      completeness: [],
      style: []
    };

    results.forEach(result => {
      const check = this.QUALITY_CHECKS.find(c => c.id === result.check_id);
      if (check) {
        groups[check.category].push(result);
      }
    });

    return groups;
  }

  private calculateCategoryScore(results: QualityResult[]): number {
    if (results.length === 0) return 100;
    
    return results.reduce((sum, result) => sum + result.score, 0) / results.length;
  }

  /**
   * Determine validation status
   */
  private determineValidationStatus(results: QualityResult[], scores: any): {
    status: 'approved' | 'rejected' | 'needs_review' | 'pending_manual';
    reason: string;
  } {
    const criticalFailures = results.filter(r => 
      r.status === 'fail' && this.getCheckSeverity(r.check_id) === 'critical'
    );

    // Reject if critical failures
    if (criticalFailures.length > 0) {
      return {
        status: 'rejected',
        reason: `Critical failures: ${criticalFailures.map(f => f.check_id).join(', ')}`
      };
    }

    // Auto-approve if high overall score
    if (scores.overall >= 85 && scores.safety >= 90) {
      return {
        status: 'approved',
        reason: `High quality score: ${scores.overall}%`
      };
    }

    // Needs review if moderate score
    if (scores.overall >= 70) {
      return {
        status: 'needs_review',
        reason: `Moderate quality score: ${scores.overall}%`
      };
    }

    // Reject if low score
    return {
      status: 'rejected',
      reason: `Low quality score: ${scores.overall}%`
    };
  }

  private getCheckSeverity(checkId: string): 'critical' | 'major' | 'minor' {
    const check = this.QUALITY_CHECKS.find(c => c.id === checkId);
    return check?.severity || 'minor';
  }

  private getPriorityFromConfidence(confidence: number): 'high' | 'medium' | 'low' {
    if (confidence >= 85) return 'high';
    if (confidence >= 70) return 'medium';
    return 'low';
  }

  /**
   * Store validation result
   */
  private async storeValidationResult(validation: ContentValidation): Promise<void> {
    const { error } = await supabase
      .from('content_validations')
      .insert(validation);

    if (error) {
      console.error('[QualityControl] Failed to store validation result:', error);
      throw new Error(`Failed to store validation: ${error.message}`);
    }

    // Update analysis with validation status
    const { error: updateError } = await supabase
      .from('analysis_snapshots')
      .update({
        validation_status: validation.validation_status,
        validation_id: validation.validation_id,
        quality_score: validation.overall_score
      })
      .eq('id', validation.analysis_id);

    if (updateError) {
      console.error('[QualityControl] Failed to update analysis with validation:', updateError);
    }
  }

  /**
   * Get quality control statistics
   */
  async getStats(): Promise<{
    queue_size: number;
    is_processing: boolean;
    validated_today: number;
    avg_quality_score: number;
    approval_rate: number;
  }> {
    const today = new Date().toISOString().split('T')[0];
    
    const { data: todayValidations } = await supabase
      .from('content_validations')
      .select('overall_score, validation_status')
      .gte('validated_at', `${today}T00:00:00Z`);

    const validatedToday = todayValidations?.length || 0;
    const avgScore = validatedToday > 0 ? 
      todayValidations!.reduce((sum, v) => sum + v.overall_score, 0) / validatedToday : 0;
    
    const approved = todayValidations?.filter(v => v.validation_status === 'approved').length || 0;
    const approvalRate = validatedToday > 0 ? approved / validatedToday : 0;

    return {
      queue_size: this.validationQueue.length,
      is_processing: this.isProcessing,
      validated_today: validatedToday,
      avg_quality_score: Math.round(avgScore),
      approval_rate: Math.round(approvalRate * 100) / 100
    };
  }
}

// Export singleton instance
export const qualityControlModule = new QualityControlModule();