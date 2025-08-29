/**
 * Publication Module - Automated Publishing with Audit Trail
 * Handles automated content publication with comprehensive audit logging
 */

import { eventBus, emitEvent } from './event-bus';
import { competitionManager } from './competition-config';
import { supabase } from '../supabase';

export interface PublicationRequest {
  match_id: string;
  analysis_id: string;
  validation_id: string;
  publication_type: 'auto' | 'manual' | 'scheduled';
  scheduled_for?: string;
  priority: 'high' | 'medium' | 'low';
  approval_source: 'quality_control' | 'admin_override' | 'manual_approval';
}

export interface PublicationResult {
  publication_id: string;
  match_id: string;
  analysis_id: string;
  validation_id: string;
  
  // Publication details
  publication_status: 'published' | 'failed' | 'scheduled' | 'cancelled';
  published_at?: string;
  scheduled_for?: string;
  publication_type: 'auto' | 'manual' | 'scheduled';
  
  // Content snapshot
  content_snapshot: {
    title: string;
    prediction: string;
    key_insights: string[];
    confidence_score: number;
    quality_score: number;
  };
  
  // Audit trail
  audit_trail: Array<{
    timestamp: string;
    action: string;
    actor: 'system' | 'admin' | 'quality_control';
    details: string;
    ip_address?: string;
  }>;
  
  // Metadata
  publication_version: string;
  created_at: string;
  updated_at: string;
}

export interface PublicationMetrics {
  total_published: number;
  auto_published: number;
  manual_published: number;
  failed_publications: number;
  avg_time_to_publish: number; // minutes
  quality_score_avg: number;
}

/**
 * Publication Module - Manages automated content publishing
 */
export class PublicationModule {
  private publicationQueue: PublicationRequest[] = [];
  private scheduledPublications = new Map<string, NodeJS.Timeout>();
  private isProcessing = false;

  constructor() {
    this.setupEventHandlers();
    this.initializeScheduledPublications();
  }

  /**
   * Setup event handlers
   */
  private setupEventHandlers(): void {
    // Listen for approved content
    eventBus.on('content.validated', async (event) => {
      if (event.data.validation_status === 'approved' && event.data.auto_approved) {
        console.log(`[Publication] Auto-queueing publication for validated content: ${event.data.analysis_id}`);
        await this.queuePublication({
          match_id: event.data.match_id,
          analysis_id: event.data.analysis_id,
          validation_id: event.data.validation_id || '',
          publication_type: 'auto',
          priority: 'high',
          approval_source: 'quality_control'
        });
      }
    });

    // Listen for manual publication requests
    eventBus.on('manual.publish.request', async (event) => {
      console.log(`[Publication] Manual publication request: ${event.data.analysis_id}`);
      await this.queuePublication({
        match_id: event.data.match_id,
        analysis_id: event.data.analysis_id,
        validation_id: event.data.validation_id || '',
        publication_type: 'manual',
        priority: 'medium',
        approval_source: 'admin_override'
      });
    });
  }

  /**
   * Queue publication request
   */
  async queuePublication(request: PublicationRequest): Promise<void> {
    // Validate request
    if (await this.isAlreadyPublished(request.match_id)) {
      console.log(`[Publication] Match ${request.match_id} already published, skipping`);
      return;
    }

    // Check timing constraints for auto publications
    if (request.publication_type === 'auto') {
      const timingCheck = await this.checkPublicationTiming(request.match_id);
      if (!timingCheck.can_publish) {
        console.log(`[Publication] Timing constraint failed for ${request.match_id}: ${timingCheck.reason}`);
        
        if (timingCheck.suggested_time) {
          // Schedule for later
          request.publication_type = 'scheduled';
          request.scheduled_for = timingCheck.suggested_time;
        } else {
          return; // Skip publication
        }
      }
    }

    this.publicationQueue.push(request);
    
    // Sort by priority and scheduled time
    this.publicationQueue.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      
      if (priorityDiff !== 0) return priorityDiff;
      
      // If same priority, scheduled items come first
      if (a.scheduled_for && !b.scheduled_for) return -1;
      if (!a.scheduled_for && b.scheduled_for) return 1;
      
      return 0;
    });

    console.log(`[Publication] Queued publication for match ${request.match_id} (type: ${request.publication_type}, priority: ${request.priority})`);

    if (!this.isProcessing) {
      this.processPublicationQueue();
    }
  }

  /**
   * Process publication queue
   */
  private async processPublicationQueue(): Promise<void> {
    if (this.isProcessing || this.publicationQueue.length === 0) {
      return;
    }

    this.isProcessing = true;
    console.log(`[Publication] Processing ${this.publicationQueue.length} publication requests`);

    while (this.publicationQueue.length > 0) {
      const request = this.publicationQueue.shift()!;
      
      try {
        if (request.publication_type === 'scheduled' && request.scheduled_for) {
          await this.schedulePublication(request);
        } else {
          await this.publishContent(request);
        }
        
        // Rate limiting delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
      } catch (error) {
        console.error(`[Publication] Failed to publish ${request.analysis_id}:`, error);
        
        await this.recordPublicationFailure(request, error);
        
        await emitEvent(
          'system.error',
          'publication-module',
          {
            match_id: request.match_id,
            analysis_id: request.analysis_id,
            error: error instanceof Error ? error.message : String(error),
            module: 'publication'
          }
        );
      }
    }

    this.isProcessing = false;
    console.log('[Publication] Finished processing publication queue');
  }

  /**
   * Publish content immediately
   */
  async publishContent(request: PublicationRequest): Promise<PublicationResult> {
    console.log(`[Publication] Publishing content for analysis ${request.analysis_id}`);

    // Get analysis and validation data
    const [analysisData, validationData, matchData] = await Promise.all([
      this.getAnalysisData(request.analysis_id),
      this.getValidationData(request.validation_id),
      this.getMatchData(request.match_id)
    ]);

    // Create publication record
    const publicationResult: PublicationResult = {
      publication_id: `pub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      match_id: request.match_id,
      analysis_id: request.analysis_id,
      validation_id: request.validation_id,
      
      publication_status: 'published',
      published_at: new Date().toISOString(),
      publication_type: request.publication_type,
      
      content_snapshot: {
        title: `${matchData.home_team} vs ${matchData.away_team} - AI Analysis`,
        prediction: analysisData.analysis_data?.prediction || '',
        key_insights: analysisData.analysis_data?.key_insights || [],
        confidence_score: analysisData.confidence_score || 0,
        quality_score: validationData?.overall_score || 0
      },
      
      audit_trail: [
        {
          timestamp: new Date().toISOString(),
          action: 'publication_initiated',
          actor: request.approval_source === 'admin_override' ? 'admin' : 'system',
          details: `Publication started via ${request.publication_type} workflow`
        },
        {
          timestamp: new Date().toISOString(),
          action: 'content_validated',
          actor: 'quality_control',
          details: `Quality score: ${validationData?.overall_score || 0}%`
        },
        {
          timestamp: new Date().toISOString(),
          action: 'content_published',
          actor: 'system',
          details: 'Content successfully published to main site'
        }
      ],
      
      publication_version: '1.0.0',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Update match as published
    await this.updateMatchPublicationStatus(request.match_id, true, publicationResult.publication_id);

    // Store publication record
    await this.storePublicationResult(publicationResult);

    // Emit publication event
    await emitEvent(
      'content.published',
      'publication-module',
      {
        match_id: request.match_id,
        publication_status: 'live',
        audit_trail: publicationResult.audit_trail.map(entry => entry.action)
      },
      `publication_${request.match_id}`
    );

    console.log(`[Publication] Successfully published content for match ${request.match_id}`);
    return publicationResult;
  }

  /**
   * Schedule publication for later
   */
  private async schedulePublication(request: PublicationRequest): Promise<void> {
    if (!request.scheduled_for) return;

    const scheduledTime = new Date(request.scheduled_for);
    const now = new Date();
    const delay = scheduledTime.getTime() - now.getTime();

    if (delay <= 0) {
      // Time has passed, publish immediately
      await this.publishContent({
        ...request,
        publication_type: 'auto'
      });
      return;
    }

    console.log(`[Publication] Scheduling publication for ${request.match_id} at ${scheduledTime.toISOString()}`);

    // Store scheduled publication
    const publicationResult: PublicationResult = {
      publication_id: `scheduled_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      match_id: request.match_id,
      analysis_id: request.analysis_id,
      validation_id: request.validation_id,
      
      publication_status: 'scheduled',
      scheduled_for: request.scheduled_for,
      publication_type: 'scheduled',
      
      content_snapshot: {
        title: '',
        prediction: '',
        key_insights: [],
        confidence_score: 0,
        quality_score: 0
      },
      
      audit_trail: [
        {
          timestamp: new Date().toISOString(),
          action: 'publication_scheduled',
          actor: 'system',
          details: `Scheduled for ${scheduledTime.toISOString()}`
        }
      ],
      
      publication_version: '1.0.0',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    await this.storePublicationResult(publicationResult);

    // Set timer for actual publication
    const timeout = setTimeout(async () => {
      try {
        await this.publishContent({
          ...request,
          publication_type: 'auto'
        });
        this.scheduledPublications.delete(publicationResult.publication_id);
      } catch (error) {
        console.error(`[Publication] Scheduled publication failed for ${request.match_id}:`, error);
      }
    }, delay);

    this.scheduledPublications.set(publicationResult.publication_id, timeout);
  }

  /**
   * Check if match is already published
   */
  private async isAlreadyPublished(matchId: string): Promise<boolean> {
    const { data: match } = await supabase
      .from('matches')
      .select('is_published')
      .eq('id', matchId)
      .single();

    return match?.is_published || false;
  }

  /**
   * Check publication timing constraints
   */
  private async checkPublicationTiming(matchId: string): Promise<{
    can_publish: boolean;
    reason?: string;
    suggested_time?: string;
  }> {
    const { data: match } = await supabase
      .from('matches')
      .select('*, competition_rule_id')
      .eq('id', matchId)
      .single();

    if (!match) {
      return { can_publish: false, reason: 'Match not found' };
    }

    const config = competitionManager.getMatchConfig({
      league: match.league,
      home_team: match.home_team,
      away_team: match.away_team,
      kickoff_utc: match.kickoff_utc
    });

    if (!config) {
      return { can_publish: false, reason: 'No competition configuration' };
    }

    const kickoffTime = new Date(match.kickoff_utc);
    const now = new Date();
    const hoursUntilKickoff = (kickoffTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    // Check if it's too early to publish
    if (hoursUntilKickoff > config.timing.publish_hours_before_kickoff) {
      const suggestedTime = new Date(kickoffTime.getTime() - (config.timing.publish_hours_before_kickoff * 60 * 60 * 1000));
      return {
        can_publish: false,
        reason: 'Too early to publish',
        suggested_time: suggestedTime.toISOString()
      };
    }

    // Check if it's too late to publish
    if (hoursUntilKickoff < 0.5) { // 30 minutes before kickoff
      return {
        can_publish: false,
        reason: 'Too close to kickoff'
      };
    }

    return { can_publish: true };
  }

  /**
   * Get analysis data
   */
  private async getAnalysisData(analysisId: string): Promise<any> {
    const { data, error } = await supabase
      .from('analysis_snapshots')
      .select('*')
      .eq('id', analysisId)
      .single();

    if (error) throw new Error(`Failed to get analysis data: ${error.message}`);
    return data;
  }

  /**
   * Get validation data
   */
  private async getValidationData(validationId: string): Promise<any> {
    if (!validationId) return null;

    const { data, error } = await supabase
      .from('content_validations')
      .select('*')
      .eq('validation_id', validationId)
      .single();

    if (error && error.code !== 'PGRST116') { // Ignore "not found" errors
      console.warn(`[Publication] Could not get validation data: ${error.message}`);
    }

    return data;
  }

  /**
   * Get match data
   */
  private async getMatchData(matchId: string): Promise<any> {
    const { data, error } = await supabase
      .from('matches')
      .select('*')
      .eq('id', matchId)
      .single();

    if (error) throw new Error(`Failed to get match data: ${error.message}`);
    return data;
  }

  /**
   * Update match publication status
   */
  private async updateMatchPublicationStatus(matchId: string, isPublished: boolean, publicationId?: string): Promise<void> {
    const updateData: any = {
      is_published: isPublished,
      updated_at: new Date().toISOString()
    };

    if (publicationId) {
      updateData.publication_id = publicationId;
      updateData.published_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from('matches')
      .update(updateData)
      .eq('id', matchId);

    if (error) {
      throw new Error(`Failed to update match publication status: ${error.message}`);
    }
  }

  /**
   * Store publication result
   */
  private async storePublicationResult(result: PublicationResult): Promise<void> {
    const { error } = await supabase
      .from('publications')
      .upsert(result, { onConflict: 'publication_id' });

    if (error) {
      throw new Error(`Failed to store publication result: ${error.message}`);
    }
  }

  /**
   * Record publication failure
   */
  private async recordPublicationFailure(request: PublicationRequest, error: any): Promise<void> {
    const failureRecord: PublicationResult = {
      publication_id: `failed_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      match_id: request.match_id,
      analysis_id: request.analysis_id,
      validation_id: request.validation_id,
      
      publication_status: 'failed',
      publication_type: request.publication_type,
      
      content_snapshot: {
        title: '',
        prediction: '',
        key_insights: [],
        confidence_score: 0,
        quality_score: 0
      },
      
      audit_trail: [
        {
          timestamp: new Date().toISOString(),
          action: 'publication_failed',
          actor: 'system',
          details: `Error: ${error instanceof Error ? error.message : String(error)}`
        }
      ],
      
      publication_version: '1.0.0',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    await this.storePublicationResult(failureRecord);
  }

  /**
   * Initialize scheduled publications on startup
   */
  private async initializeScheduledPublications(): Promise<void> {
    try {
      const { data: scheduledPubs } = await supabase
        .from('publications')
        .select('*')
        .eq('publication_status', 'scheduled')
        .not('scheduled_for', 'is', null);

      if (scheduledPubs) {
        for (const pub of scheduledPubs) {
          const scheduledTime = new Date(pub.scheduled_for!);
          const now = new Date();
          const delay = scheduledTime.getTime() - now.getTime();

          if (delay > 0) {
            const timeout = setTimeout(async () => {
              try {
                await this.publishContent({
                  match_id: pub.match_id,
                  analysis_id: pub.analysis_id,
                  validation_id: pub.validation_id,
                  publication_type: 'auto',
                  priority: 'medium',
                  approval_source: 'quality_control'
                });
              } catch (error) {
                console.error(`[Publication] Scheduled publication failed for ${pub.match_id}:`, error);
              }
            }, delay);

            this.scheduledPublications.set(pub.publication_id, timeout);
          }
        }
      }
    } catch (error) {
      console.error('[Publication] Failed to initialize scheduled publications:', error);
    }
  }

  /**
   * Manual publication trigger (admin use)
   */
  async triggerManualPublication(matchId: string, analysisId: string): Promise<PublicationResult> {
    console.log(`[Publication] Manual publication trigger for match ${matchId}`);
    
    const request: PublicationRequest = {
      match_id: matchId,
      analysis_id: analysisId,
      validation_id: '', // Manual publications may skip validation
      publication_type: 'manual',
      priority: 'high',
      approval_source: 'admin_override'
    };

    return await this.publishContent(request);
  }

  /**
   * Cancel scheduled publication
   */
  async cancelScheduledPublication(publicationId: string): Promise<void> {
    const timeout = this.scheduledPublications.get(publicationId);
    if (timeout) {
      clearTimeout(timeout);
      this.scheduledPublications.delete(publicationId);

      // Update publication status
      await supabase
        .from('publications')
        .update({
          publication_status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('publication_id', publicationId);

      console.log(`[Publication] Cancelled scheduled publication ${publicationId}`);
    }
  }

  /**
   * Get publication statistics
   */
  async getStats(): Promise<PublicationMetrics> {
    const today = new Date().toISOString().split('T')[0];
    
    const { data: todayPublications } = await supabase
      .from('publications')
      .select('publication_type, publication_status, content_snapshot, created_at, published_at')
      .gte('created_at', `${today}T00:00:00Z`);

    const published = todayPublications?.filter(p => p.publication_status === 'published') || [];
    const autoPublished = published.filter(p => p.publication_type === 'auto');
    const manualPublished = published.filter(p => p.publication_type === 'manual');
    const failed = todayPublications?.filter(p => p.publication_status === 'failed') || [];

    // Calculate average time to publish (from creation to publication)
    const avgTimeToPublish = published.length > 0 ? 
      published.reduce((sum, p) => {
        const created = new Date(p.created_at).getTime();
        const published = new Date(p.published_at || p.created_at).getTime();
        return sum + ((published - created) / (1000 * 60)); // minutes
      }, 0) / published.length : 0;

    // Calculate average quality score
    const avgQualityScore = published.length > 0 ?
      published.reduce((sum, p) => sum + (p.content_snapshot?.quality_score || 0), 0) / published.length : 0;

    return {
      total_published: published.length,
      auto_published: autoPublished.length,
      manual_published: manualPublished.length,
      failed_publications: failed.length,
      avg_time_to_publish: Math.round(avgTimeToPublish * 10) / 10,
      quality_score_avg: Math.round(avgQualityScore)
    };
  }

  /**
   * Get audit trail for a publication
   */
  async getAuditTrail(publicationId: string): Promise<any[]> {
    const { data } = await supabase
      .from('publications')
      .select('audit_trail')
      .eq('publication_id', publicationId)
      .single();

    return data?.audit_trail || [];
  }
}

// Export singleton instance
export const publicationModule = new PublicationModule();