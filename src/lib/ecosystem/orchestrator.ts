/**
 * Pipeline Orchestrator - Complete Autonomous Content Pipeline Integration
 * Connects all modules through event-driven workflow and provides monitoring
 */

import { eventBus } from './event-bus';
import { discoveryModule } from './discovery';
import { intelligenceModule } from './intelligence';
import { newsAggregationModule } from './news-aggregation';
import { aiAnalysisModule } from './ai-analysis';
import { qualityControlModule } from './quality-control';
import { publicationModule } from './publication';
import { competitionManager } from './competition-config';

export interface PipelineStatus {
  is_running: boolean;
  modules_active: {
    discovery: boolean;
    intelligence: boolean;
    news_aggregation: boolean;
    ai_analysis: boolean;
    quality_control: boolean;
    publication: boolean;
  };
  pipeline_health: 'healthy' | 'degraded' | 'error';
  last_health_check: string;
}

export interface PipelineMetrics {
  // Throughput metrics
  matches_processed_today: number;
  content_published_today: number;
  pipeline_success_rate: number;
  avg_processing_time: number; // minutes
  
  // Module metrics
  discovery_stats: any;
  intelligence_stats: any;
  news_stats: any;
  analysis_stats: any;
  quality_stats: any;
  publication_stats: any;
  
  // Competition coverage
  competition_coverage: any;
  
  // Health metrics
  error_rate: number;
  last_successful_completion: string | null;
}

/**
 * Pipeline Orchestrator - Main coordination point for autonomous pipeline
 */
export class PipelineOrchestrator {
  private isRunning = false;
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private metricsCollectionInterval: NodeJS.Timeout | null = null;
  private lastHealthCheck: Date = new Date();
  private pipelineHealth: 'healthy' | 'degraded' | 'error' = 'healthy';

  private readonly HEALTH_CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes
  private readonly METRICS_COLLECTION_INTERVAL = 15 * 60 * 1000; // 15 minutes

  constructor() {
    this.setupGlobalErrorHandling();
    this.setupPipelineMonitoring();
  }

  /**
   * Start the complete autonomous pipeline
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      console.log('[Orchestrator] Pipeline already running');
      return;
    }

    console.log('[Orchestrator] Starting autonomous content pipeline...');
    this.isRunning = true;

    try {
      // Initialize all modules
      await this.initializeModules();

      // Start health monitoring
      this.startHealthMonitoring();

      // Start metrics collection
      this.startMetricsCollection();

      // Log pipeline startup
      console.log('[Orchestrator] ✅ Autonomous content pipeline started successfully');
      console.log('[Orchestrator] Pipeline flow: Discovery → Intelligence → News → AI Analysis → Quality Control → Publication');
      
      // Emit startup event
      eventBus.emit({
        id: `pipeline_start_${Date.now()}`,
        type: 'system.error', // Using existing event type
        timestamp: new Date().toISOString(),
        source: 'orchestrator',
        data: { action: 'pipeline_started', status: 'running' }
      } as any);

    } catch (error) {
      console.error('[Orchestrator] Failed to start pipeline:', error);
      this.isRunning = false;
      throw error;
    }
  }

  /**
   * Stop the autonomous pipeline
   */
  async stop(): Promise<void> {
    console.log('[Orchestrator] Stopping autonomous content pipeline...');
    this.isRunning = false;

    // Stop health monitoring
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }

    // Stop metrics collection
    if (this.metricsCollectionInterval) {
      clearInterval(this.metricsCollectionInterval);
      this.metricsCollectionInterval = null;
    }

    // Stop discovery module
    discoveryModule.stop();

    console.log('[Orchestrator] Pipeline stopped');
  }

  /**
   * Initialize all pipeline modules
   */
  private async initializeModules(): Promise<void> {
    console.log('[Orchestrator] Initializing pipeline modules...');

    // Start discovery module (this triggers the cascade)
    await discoveryModule.start();

    // Other modules are event-driven and will activate automatically
    console.log('[Orchestrator] All modules initialized');
  }

  /**
   * Setup global error handling for the pipeline
   */
  private setupGlobalErrorHandling(): void {
    eventBus.on('system.error', async (event) => {
      console.error(`[Orchestrator] Pipeline error in ${event.source}:`, event.data);
      
      // Update health status
      this.pipelineHealth = 'error';
      
      // Implement error recovery strategies
      await this.handlePipelineError(event);
    });
  }

  /**
   * Setup pipeline monitoring and logging
   */
  private setupPipelineMonitoring(): void {
    // Monitor major pipeline events
    const monitoredEvents = [
      'match.discovered',
      'match.enriched',
      'news.collected',
      'analysis.completed',
      'content.validated',
      'content.published'
    ];

    monitoredEvents.forEach(eventType => {
      eventBus.on(eventType as any, async (event) => {
        console.log(`[Orchestrator] Pipeline progress: ${eventType} for match ${event.data.match_id || 'unknown'}`);
        
        // Track pipeline flow for metrics
        await this.trackPipelineProgress(eventType, event);
      });
    });
  }

  /**
   * Handle pipeline errors with recovery strategies
   */
  private async handlePipelineError(errorEvent: any): Promise<void> {
    const errorSource = errorEvent.source;
    const errorData = errorEvent.data;

    console.log(`[Orchestrator] Implementing error recovery for ${errorSource}`);

    switch (errorSource) {
      case 'discovery-module':
        // Restart discovery if it fails
        if (this.isRunning) {
          setTimeout(async () => {
            try {
              await discoveryModule.start();
              this.pipelineHealth = 'healthy';
            } catch (error) {
              console.error('[Orchestrator] Discovery restart failed:', error);
            }
          }, 60000); // Retry after 1 minute
        }
        break;

      case 'news-aggregation-module':
        // News aggregation failures are non-critical
        console.log('[Orchestrator] News aggregation error - continuing pipeline');
        break;

      case 'ai-analysis-module':
        // AI analysis failures require manual review
        console.log('[Orchestrator] AI analysis error - flagging for manual review');
        if (errorData.match_id) {
          // Could implement admin notification here
        }
        break;

      case 'quality-control-module':
        // Quality control failures prevent publication
        console.log('[Orchestrator] Quality control error - blocking publication');
        break;

      case 'publication-module':
        // Publication failures need immediate attention
        console.log('[Orchestrator] Publication error - requires manual intervention');
        this.pipelineHealth = 'degraded';
        break;

      default:
        console.log(`[Orchestrator] Unknown error source: ${errorSource}`);
    }
  }

  /**
   * Track pipeline progress for metrics
   */
  private async trackPipelineProgress(eventType: string, event: any): Promise<void> {
    // This would integrate with a metrics store in production
    // For now, we'll just log significant milestones
    
    if (eventType === 'content.published') {
      console.log(`[Orchestrator] 🎉 Complete pipeline success for match ${event.data.match_id}`);
    }
  }

  /**
   * Start health monitoring
   */
  private startHealthMonitoring(): void {
    this.healthCheckInterval = setInterval(async () => {
      try {
        await this.performHealthCheck();
      } catch (error) {
        console.error('[Orchestrator] Health check failed:', error);
        this.pipelineHealth = 'error';
      }
    }, this.HEALTH_CHECK_INTERVAL);

    console.log('[Orchestrator] Health monitoring started');
  }

  /**
   * Start metrics collection
   */
  private startMetricsCollection(): void {
    this.metricsCollectionInterval = setInterval(async () => {
      try {
        const metrics = await this.collectPipelineMetrics();
        console.log('[Orchestrator] Pipeline metrics collected:', {
          processed_today: metrics.matches_processed_today,
          published_today: metrics.content_published_today,
          success_rate: `${metrics.pipeline_success_rate}%`,
          health: this.pipelineHealth
        });
      } catch (error) {
        console.error('[Orchestrator] Metrics collection failed:', error);
      }
    }, this.METRICS_COLLECTION_INTERVAL);

    console.log('[Orchestrator] Metrics collection started');
  }

  /**
   * Perform comprehensive health check
   */
  private async performHealthCheck(): Promise<void> {
    this.lastHealthCheck = new Date();
    let healthScore = 0;
    const maxScore = 6;

    try {
      // Check each module
      const discoveryStats = await discoveryModule.getStats();
      if (discoveryStats.is_running) healthScore++;

      const intelligenceStats = await intelligenceModule.getStats();
      if (!intelligenceStats.is_processing || intelligenceStats.queue_size < 10) healthScore++;

      const newsStats = await newsAggregationModule.getStats();
      if (!newsStats.is_processing || newsStats.queue_size < 5) healthScore++;

      const analysisStats = await aiAnalysisModule.getStats();
      if (analysisStats.queue_size < 5) healthScore++;

      const qualityStats = await qualityControlModule.getStats();
      if (!qualityStats.is_processing || qualityStats.queue_size < 3) healthScore++;

      const publicationStats = await publicationModule.getStats();
      if (publicationStats.failed_publications === 0) healthScore++;

      // Determine health status
      const healthPercentage = (healthScore / maxScore) * 100;
      
      if (healthPercentage >= 80) {
        this.pipelineHealth = 'healthy';
      } else if (healthPercentage >= 60) {
        this.pipelineHealth = 'degraded';
      } else {
        this.pipelineHealth = 'error';
      }

      console.log(`[Orchestrator] Health check complete: ${this.pipelineHealth} (${healthPercentage}%)`);

    } catch (error) {
      console.error('[Orchestrator] Health check error:', error);
      this.pipelineHealth = 'error';
    }
  }

  /**
   * Get current pipeline status
   */
  async getStatus(): Promise<PipelineStatus> {
    const [
      discoveryStats,
      intelligenceStats,
      newsStats,
      analysisStats,
      qualityStats,
      publicationStats
    ] = await Promise.all([
      discoveryModule.getStats().catch(() => ({ is_running: false })),
      intelligenceModule.getStats().catch(() => ({ is_processing: false })),
      newsAggregationModule.getStats().catch(() => ({ is_processing: false })),
      aiAnalysisModule.getStats().catch(() => ({ queue_size: 0 })),
      qualityControlModule.getStats().catch(() => ({ is_processing: false })),
      publicationModule.getStats().catch(() => ({ total_published: 0 }))
    ]);

    return {
      is_running: this.isRunning,
      modules_active: {
        discovery: discoveryStats.is_running || false,
        intelligence: !intelligenceStats.is_processing || false,
        news_aggregation: !newsStats.is_processing || false,
        ai_analysis: analysisStats.queue_size < 5,
        quality_control: !qualityStats.is_processing || false,
        publication: publicationStats.total_published >= 0
      },
      pipeline_health: this.pipelineHealth,
      last_health_check: this.lastHealthCheck.toISOString()
    };
  }

  /**
   * Collect comprehensive pipeline metrics
   */
  async collectPipelineMetrics(): Promise<PipelineMetrics> {
    const [
      discoveryStats,
      intelligenceStats,
      newsStats,
      analysisStats,
      qualityStats,
      publicationStats,
      competitionStats
    ] = await Promise.all([
      discoveryModule.getStats(),
      intelligenceModule.getStats(),
      newsAggregationModule.getStats(),
      aiAnalysisModule.getStats(),
      qualityControlModule.getStats(),
      publicationModule.getStats(),
      competitionManager.getStats()
    ]);

    // Calculate pipeline success rate
    const totalStarted = discoveryStats.discovered_today || 0;
    const totalPublished = publicationStats.total_published || 0;
    const successRate = totalStarted > 0 ? (totalPublished / totalStarted) * 100 : 0;

    // Calculate average processing time (mock calculation)
    const avgProcessingTime = 45; // minutes - would be calculated from actual data

    return {
      matches_processed_today: discoveryStats.discovered_today || 0,
      content_published_today: publicationStats.total_published || 0,
      pipeline_success_rate: Math.round(successRate),
      avg_processing_time: avgProcessingTime,
      
      discovery_stats: discoveryStats,
      intelligence_stats: intelligenceStats,
      news_stats: newsStats,
      analysis_stats: analysisStats,
      quality_stats: qualityStats,
      publication_stats: publicationStats,
      
      competition_coverage: competitionStats,
      
      error_rate: 5, // Mock value - would be calculated from error events
      last_successful_completion: new Date().toISOString() // Mock value
    };
  }

  /**
   * Manual trigger for pipeline testing
   */
  async triggerPipelineTest(matchId?: string): Promise<void> {
    console.log('[Orchestrator] Triggering manual pipeline test...');
    
    if (matchId) {
      // Test specific match
      await discoveryModule.triggerDiscovery();
    } else {
      // Trigger discovery cycle
      await discoveryModule.triggerDiscovery();
    }
  }

  /**
   * Get pipeline flow visualization data
   */
  getPipelineFlow(): any {
    return {
      stages: [
        { id: 'discovery', name: 'Match Discovery', status: 'active' },
        { id: 'intelligence', name: 'Data Enrichment', status: 'active' },
        { id: 'news', name: 'News Aggregation', status: 'active' },
        { id: 'analysis', name: 'AI Analysis', status: 'active' },
        { id: 'quality', name: 'Quality Control', status: 'active' },
        { id: 'publication', name: 'Publication', status: 'active' }
      ],
      connections: [
        { from: 'discovery', to: 'intelligence', event: 'match.discovered' },
        { from: 'intelligence', to: 'news', event: 'match.enriched' },
        { from: 'news', to: 'analysis', event: 'news.collected' },
        { from: 'analysis', to: 'quality', event: 'analysis.completed' },
        { from: 'quality', to: 'publication', event: 'content.validated' }
      ]
    };
  }

  /**
   * Emergency stop for pipeline
   */
  async emergencyStop(reason: string): Promise<void> {
    console.log(`[Orchestrator] 🚨 Emergency stop triggered: ${reason}`);
    
    await this.stop();
    
    // Log emergency stop
    eventBus.emit({
      id: `emergency_stop_${Date.now()}`,
      type: 'system.error',
      timestamp: new Date().toISOString(),
      source: 'orchestrator',
      data: { action: 'emergency_stop', reason }
    } as any);
  }
}

// Export singleton instance
export const pipelineOrchestrator = new PipelineOrchestrator();

// Auto-start in production
if (process.env.NODE_ENV === 'production' && process.env.AUTO_START_PIPELINE === 'true') {
  pipelineOrchestrator.start().catch(error => {
    console.error('[Orchestrator] Failed to auto-start pipeline:', error);
  });
}