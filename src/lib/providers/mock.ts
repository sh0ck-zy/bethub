import type {
  AIAnalysisProvider,
  PaymentProvider,
  DataProvider,
  RealtimeProvider,
  AnalyticsProvider,
  Match,
  AnalysisResult,
  AnalysisRequest,
  AnalysisOptions,
  Subscription,
  SubscriptionStatus,
  PaymentResult,
  Invoice,
  Team,
  League,
  Odds,
  MatchStats,
  LiveMatchUpdate,
  Notification,
  AnalyticsData,
  User,
  Prediction,
  BettingRecommendation
} from '../types';

/**
 * Mock AI Analysis Provider for development
 */
export class MockAIAnalysisProvider implements AIAnalysisProvider {
  async analyzeMatch(matchData: Match, options?: AnalysisOptions): Promise<AnalysisResult> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    const predictions: Prediction = {
      outcome: Math.random() > 0.5 ? 'home' : Math.random() > 0.5 ? 'away' : 'draw',
      confidence: Math.round((0.6 + Math.random() * 0.4) * 100),
      reasoning: "Based on recent form, head-to-head record, and tactical analysis.",
      probability_home: Math.round((0.2 + Math.random() * 0.6) * 100) / 100,
      probability_draw: Math.round((0.15 + Math.random() * 0.3) * 100) / 100,
      probability_away: Math.round((0.2 + Math.random() * 0.6) * 100) / 100,
    };

    const bettingRecommendation: BettingRecommendation = {
      bet: predictions.outcome === 'home' ? 'Home Win' : predictions.outcome === 'away' ? 'Away Win' : 'Draw',
      confidence: predictions.confidence,
      reasoning: "Value bet based on probability analysis and current odds.",
      risk_level: predictions.confidence > 75 ? 'low' : predictions.confidence > 60 ? 'medium' : 'high',
      expected_value: Math.round((Math.random() * 0.2 + 0.05) * 100) / 100,
      recommended_stake: Math.round(Math.random() * 50 + 10),
    };

    return {
      id: `analysis_${Date.now()}`,
      match_id: matchData.id,
      type: options?.depth || 'standard',
      tactical_insights: `${matchData.home_team} is expected to dominate possession with their 4-3-3 formation, while ${matchData.away_team} will likely play a more defensive 5-4-1 setup. Key battles will be in midfield where creativity meets defensive solidity.`,
      key_factors: [
        "Home advantage and crowd support",
        "Recent form and momentum",
        "Head-to-head historical record",
        "Team injury reports and suspensions",
        "Weather conditions and pitch quality"
      ],
      prediction: predictions,
      betting_recommendation: bettingRecommendation,
      player_watch: [
        "Star striker's goal scoring form",
        "Defensive midfielder's distribution",
        "Goalkeeper's recent performances"
      ],
      formation_analysis: `${matchData.home_team} 4-3-3 vs ${matchData.away_team} 5-4-1 - Tactical battle between attack and defense`,
      confidence: predictions.confidence,
      weather_impact: "Clear conditions expected, no significant impact on play style",
      injury_impact: "Both teams have key players available, minimal impact expected",
      created_at: new Date().toISOString(),
    };
  }

  async generateInsight(prompt: string, context?: any): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return `AI-generated insight: ${prompt}. This is a mock response for development purposes.`;
  }

  async getBettingTips(matchData: Match): Promise<string[]> {
    await new Promise(resolve => setTimeout(resolve, 800));
    return [
      `Consider ${matchData.home_team} to win with moderate confidence`,
      "Over 2.5 goals looks promising based on both teams' attacking form",
      "Both teams to score has good value given defensive vulnerabilities",
      "Corner kicks over 9.5 could be worth considering"
    ];
  }

  async validateAnalysisRequest(request: AnalysisRequest): Promise<boolean> {
    return true; // Mock always validates
  }
}

/**
 * Mock Payment Provider for development
 */
export class MockPaymentProvider implements PaymentProvider {
  async createSubscription(userId: string, planId: string): Promise<Subscription> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const now = new Date();
    const periodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days

    return {
      id: `sub_${Date.now()}`,
      user_id: userId,
      tier: planId as any,
      status: 'active',
      current_period_start: now.toISOString(),
      current_period_end: periodEnd.toISOString(),
      cancel_at_period_end: false,
    };
  }

  async cancelSubscription(subscriptionId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 800));
    console.log(`Mock: Cancelled subscription ${subscriptionId}`);
  }

  async updateSubscription(subscriptionId: string, planId: string): Promise<Subscription> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const now = new Date();
    const periodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    return {
      id: subscriptionId,
      user_id: 'mock_user',
      tier: planId as any,
      status: 'active',
      current_period_start: now.toISOString(),
      current_period_end: periodEnd.toISOString(),
      cancel_at_period_end: false,
    };
  }

  async getSubscriptionStatus(userId: string): Promise<SubscriptionStatus> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return Math.random() > 0.7 ? 'active' : 'free';
  }

  async processPayment(amount: number, currency: string, customerId: string): Promise<PaymentResult> {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const success = Math.random() > 0.1; // 90% success rate
    
    return {
      success,
      transaction_id: `txn_${Date.now()}`,
      amount,
      currency,
      status: success ? 'succeeded' : 'failed',
      error: success ? undefined : 'Mock payment failure for testing',
    };
  }

  async createCustomer(user: User): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 600));
    return `cus_${Date.now()}`;
  }

  async getInvoices(customerId: string): Promise<Invoice[]> {
    await new Promise(resolve => setTimeout(resolve, 700));
    
    return [
      {
        id: `inv_${Date.now()}`,
        amount: 999,
        currency: 'usd',
        status: 'paid',
        date: new Date().toISOString(),
        pdf_url: 'https://example.com/invoice.pdf',
      },
    ];
  }
}

/**
 * Mock Data Provider for development
 */
export class MockDataProvider implements DataProvider {
  private mockTeams: Team[] = [
    { id: '1', name: 'Manchester United', short_name: 'MUN', country: 'England', logo_url: '/logos/manchester-united.svg' },
    { id: '2', name: 'Liverpool', short_name: 'LIV', country: 'England', logo_url: '/logos/liverpool.svg' },
    { id: '3', name: 'Arsenal', short_name: 'ARS', country: 'England', logo_url: '/logos/arsenal.svg' },
    { id: '4', name: 'Chelsea', short_name: 'CHE', country: 'England', logo_url: '/logos/chelsea.svg' },
  ];

  async getMatches(date: Date, league?: string): Promise<Match[]> {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return [
      {
        id: '1',
        league: 'Premier League',
        home_team: 'Manchester United',
        away_team: 'Liverpool',
        kickoff_utc: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
        status: 'PRE',
        venue: 'Old Trafford',
        referee: 'Michael Oliver',
        odds: {
          home: 2.1,
          draw: 3.4,
          away: 3.2,
          provider: 'Mock Odds',
          last_updated: new Date().toISOString(),
        },
      },
      {
        id: '2',
        league: 'Premier League',
        home_team: 'Arsenal',
        away_team: 'Chelsea',
        kickoff_utc: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
        status: 'PRE',
        venue: 'Emirates Stadium',
        referee: 'Anthony Taylor',
        odds: {
          home: 1.8,
          draw: 3.6,
          away: 4.2,
          provider: 'Mock Odds',
          last_updated: new Date().toISOString(),
        },
      },
    ];
  }

  async getLiveScore(matchId: string): Promise<Match> {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    return {
      id: matchId,
      league: 'Premier League',
      home_team: 'Manchester United',
      away_team: 'Liverpool',
      kickoff_utc: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      status: 'LIVE',
      home_score: 1,
      away_score: 0,
      current_minute: 47,
      venue: 'Old Trafford',
    };
  }

  async getOdds(matchId: string): Promise<Odds> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return {
      home: 2.1 + (Math.random() - 0.5) * 0.4,
      draw: 3.4 + (Math.random() - 0.5) * 0.6,
      away: 3.2 + (Math.random() - 0.5) * 0.4,
      provider: 'Mock Odds',
      last_updated: new Date().toISOString(),
    };
  }

  async getMatchStats(matchId: string): Promise<{ home: MatchStats; away: MatchStats }> {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    return {
      home: {
        possession: 58,
        shots: 12,
        shots_on_target: 4,
        corners: 6,
        fouls: 8,
        yellow_cards: 2,
        red_cards: 0,
        offsides: 3,
        saves: 2,
      },
      away: {
        possession: 42,
        shots: 8,
        shots_on_target: 3,
        corners: 4,
        fouls: 11,
        yellow_cards: 3,
        red_cards: 0,
        offsides: 1,
        saves: 3,
      },
    };
  }

  async getTeam(teamId: string): Promise<Team> {
    await new Promise(resolve => setTimeout(resolve, 400));
    return this.mockTeams.find(t => t.id === teamId) || this.mockTeams[0];
  }

  async getLeague(leagueId: string): Promise<League> {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    return {
      id: leagueId,
      name: 'Premier League',
      country: 'England',
      logo_url: '/logos/premier-league.svg',
      season: '2024-25',
      type: 'league',
    };
  }

  async searchTeams(query: string): Promise<Team[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return this.mockTeams.filter(team => 
      team.name.toLowerCase().includes(query.toLowerCase()) ||
      team.short_name.toLowerCase().includes(query.toLowerCase())
    );
  }
}

/**
 * Mock Realtime Provider for development
 */
export class MockRealtimeProvider implements RealtimeProvider {
  private connected = false;
  private subscriptions: Map<string, () => void> = new Map();

  async connect(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500));
    this.connected = true;
    console.log('Mock realtime provider connected');
  }

  async disconnect(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 200));
    this.connected = false;
    this.subscriptions.clear();
    console.log('Mock realtime provider disconnected');
  }

  subscribeToMatch(matchId: string, callback: (update: LiveMatchUpdate) => void): () => void {
    const unsubscribe = () => {
      this.subscriptions.delete(matchId);
    };

    this.subscriptions.set(matchId, unsubscribe);

    // Mock sending updates every 30 seconds
    const interval = setInterval(() => {
      if (this.subscriptions.has(matchId)) {
        const mockUpdate: LiveMatchUpdate = {
          matchId,
          type: Math.random() > 0.7 ? 'goal' : Math.random() > 0.5 ? 'card' : 'analysis',
          timestamp: new Date().toISOString(),
          data: {
            minute: Math.floor(Math.random() * 90) + 1,
            team: Math.random() > 0.5 ? 'home' : 'away',
            description: 'Mock live update',
          },
        };
        callback(mockUpdate);
      } else {
        clearInterval(interval);
      }
    }, 30000);

    return unsubscribe;
  }

  subscribeToNotifications(userId: string, callback: (notification: Notification) => void): () => void {
    const unsubscribe = () => {
      this.subscriptions.delete(`notifications_${userId}`);
    };

    this.subscriptions.set(`notifications_${userId}`, unsubscribe);

    // Mock sending notifications occasionally
    const interval = setInterval(() => {
      if (this.subscriptions.has(`notifications_${userId}`)) {
        const mockNotification: Notification = {
          id: `notif_${Date.now()}`,
          user_id: userId,
          type: 'analysis_ready',
          title: 'Analysis Ready',
          message: 'Your match analysis is ready to view',
          timestamp: new Date().toISOString(),
          read: false,
        };
        callback(mockNotification);
      } else {
        clearInterval(interval);
      }
    }, 60000);

    return unsubscribe;
  }

  async sendNotification(notification: Omit<Notification, 'id' | 'timestamp'>): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 200));
    console.log('Mock notification sent:', notification);
  }

  getConnectionStatus(): boolean {
    return this.connected;
  }
}

/**
 * Mock Analytics Provider for development
 */
export class MockAnalyticsProvider implements AnalyticsProvider {
  async trackEvent(event: string, properties?: Record<string, any>): Promise<void> {
    console.log('Mock analytics event:', event, properties);
  }

  async trackUser(userId: string, properties?: Record<string, any>): Promise<void> {
    console.log('Mock analytics user:', userId, properties);
  }

  async trackPageView(page: string, properties?: Record<string, any>): Promise<void> {
    console.log('Mock analytics page view:', page, properties);
  }

  async trackConversion(event: string, value?: number): Promise<void> {
    console.log('Mock analytics conversion:', event, value);
  }

  async getAnalytics(timeframe: string): Promise<AnalyticsData> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      users: {
        total: Math.floor(Math.random() * 10000) + 1000,
        active: Math.floor(Math.random() * 500) + 100,
        new: Math.floor(Math.random() * 50) + 10,
      },
      usage: {
        analyses_generated: Math.floor(Math.random() * 1000) + 100,
        matches_viewed: Math.floor(Math.random() * 5000) + 500,
        subscriptions_created: Math.floor(Math.random() * 20) + 5,
      },
      revenue: {
        total: Math.floor(Math.random() * 50000) + 5000,
        mrr: Math.floor(Math.random() * 5000) + 1000,
        churn_rate: Math.round((Math.random() * 0.1 + 0.02) * 100) / 100,
      },
    };
  }
}

// Export all mock providers
export const mockProviders = {
  ai: new MockAIAnalysisProvider(),
  payment: new MockPaymentProvider(),
  data: new MockDataProvider(),
  realtime: new MockRealtimeProvider(),
  analytics: new MockAnalyticsProvider(),
}; 