/**
 * Event Bus System for Autonomous Content Pipeline
 * Enables decoupled communication between modules
 */

export type EventType = 
  | 'match.discovered'
  | 'match.enriched' 
  | 'news.collected'
  | 'news.processed'
  | 'analysis.requested'
  | 'analysis.completed'
  | 'content.validated'
  | 'content.published'
  | 'content.rejected'
  | 'system.error';

export interface BaseEvent {
  id: string;
  type: EventType;
  timestamp: string;
  source: string;
  correlation_id?: string;
}

export interface MatchDiscoveredEvent extends BaseEvent {
  type: 'match.discovered';
  data: {
    match_id: string;
    league: string;
    home_team: string;
    away_team: string;
    kickoff_utc: string;
    competition_config: string;
  };
}

export interface MatchEnrichedEvent extends BaseEvent {
  type: 'match.enriched';
  data: {
    match_id: string;
    team_data: {
      home_team: any;
      away_team: any;
    };
    venue_data: any;
    historical_data: any;
  };
}

export interface NewsCollectedEvent extends BaseEvent {
  type: 'news.collected';
  data: {
    match_id: string;
    articles: Array<{
      id: string;
      title: string;
      content: string;
      source: string;
      url: string;
      published_at: string;
      relevance_score?: number;
    }>;
  };
}

export interface AnalysisCompletedEvent extends BaseEvent {
  type: 'analysis.completed';
  data: {
    match_id: string;
    analysis: any;
    confidence_score: number;
    validation_status: 'pending' | 'approved' | 'rejected';
  };
}

export interface ContentPublishedEvent extends BaseEvent {
  type: 'content.published';
  data: {
    match_id: string;
    publication_status: 'live' | 'scheduled';
    audit_trail: string[];
  };
}

export type PipelineEvent = 
  | MatchDiscoveredEvent
  | MatchEnrichedEvent 
  | NewsCollectedEvent
  | AnalysisCompletedEvent
  | ContentPublishedEvent
  | BaseEvent;

type EventHandler<T extends PipelineEvent = PipelineEvent> = (event: T) => Promise<void> | void;

/**
 * Simple in-memory event bus for modular monolith architecture
 * Provides async event handling with error isolation
 */
export class EventBus {
  private handlers: Map<EventType, EventHandler[]> = new Map();
  private eventHistory: PipelineEvent[] = [];
  private maxHistorySize = 1000;

  /**
   * Subscribe to events of a specific type
   */
  on<T extends PipelineEvent>(eventType: EventType, handler: EventHandler<T>): void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }
    this.handlers.get(eventType)!.push(handler as EventHandler);
  }

  /**
   * Unsubscribe from events
   */
  off(eventType: EventType, handler: EventHandler): void {
    const handlers = this.handlers.get(eventType);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  /**
   * Emit an event to all registered handlers
   */
  async emit(event: PipelineEvent): Promise<void> {
    // Add to event history
    this.eventHistory.push(event);
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift();
    }

    console.log(`[EventBus] Emitting ${event.type}:`, event);

    const handlers = this.handlers.get(event.type) || [];
    
    // Execute all handlers in parallel with error isolation
    const promises = handlers.map(async (handler) => {
      try {
        await handler(event);
      } catch (error) {
        console.error(`[EventBus] Handler error for ${event.type}:`, error);
        
        // Emit error event if handler fails
        this.emit({
          id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: 'system.error',
          timestamp: new Date().toISOString(),
          source: 'event-bus',
          correlation_id: event.id,
          data: {
            original_event: event,
            error: error instanceof Error ? error.message : String(error)
          }
        } as any);
      }
    });

    await Promise.allSettled(promises);
  }

  /**
   * Create a properly formatted event
   */
  createEvent<T extends PipelineEvent>(
    type: EventType, 
    source: string, 
    data: any,
    correlationId?: string
  ): T {
    return {
      id: `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      timestamp: new Date().toISOString(),
      source,
      correlation_id: correlationId,
      data
    } as T;
  }

  /**
   * Get event history for debugging/monitoring
   */
  getEventHistory(eventType?: EventType, limit: number = 100): PipelineEvent[] {
    let events = this.eventHistory;
    
    if (eventType) {
      events = events.filter(e => e.type === eventType);
    }
    
    return events.slice(-limit).reverse();
  }

  /**
   * Get event statistics
   */
  getStats(): {
    totalEvents: number;
    eventsByType: Record<string, number>;
    recentActivity: number;
  } {
    const eventsByType: Record<string, number> = {};
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    let recentActivity = 0;

    this.eventHistory.forEach(event => {
      eventsByType[event.type] = (eventsByType[event.type] || 0) + 1;
      
      if (new Date(event.timestamp) > oneHourAgo) {
        recentActivity++;
      }
    });

    return {
      totalEvents: this.eventHistory.length,
      eventsByType,
      recentActivity
    };
  }

  /**
   * Clear event history (useful for testing)
   */
  clearHistory(): void {
    this.eventHistory = [];
  }
}

// Export singleton instance
export const eventBus = new EventBus();

// Helper function to emit events with correlation tracking
export async function emitEvent<T extends PipelineEvent>(
  type: EventType,
  source: string,
  data: any,
  correlationId?: string
): Promise<void> {
  const event = eventBus.createEvent<T>(type, source, data, correlationId);
  await eventBus.emit(event);
}