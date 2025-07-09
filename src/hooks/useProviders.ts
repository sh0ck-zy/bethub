import { useState, useEffect, useCallback } from 'react';
import { 
  getAIProvider, 
  getPaymentProvider, 
  getDataProvider, 
  getRealtimeProvider, 
  getAnalyticsProvider,
  getFeatureFlags,
  getLimits,
  isFeatureEnabled,
  providerRegistry
} from '../lib/providers/registry';
import type { 
  AIAnalysisProvider, 
  PaymentProvider, 
  DataProvider, 
  RealtimeProvider, 
  AnalyticsProvider,
  FeatureFlags,
  Match,
  AnalysisResult,
  AnalysisRequest,
  User,
  Subscription,
  LiveMatchUpdate,
  Notification
} from '../lib/types';

/**
 * Hook to access AI Analysis provider
 */
export function useAIProvider() {
  const [provider, setProvider] = useState<AIAnalysisProvider | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkProvider = () => {
      const aiProvider = getAIProvider();
      setProvider(aiProvider);
      setIsLoading(!providerRegistry.isInitialized());
    };

    checkProvider();
    
    // Check again after a short delay if not initialized
    if (!providerRegistry.isInitialized()) {
      const timeout = setTimeout(checkProvider, 1000);
      return () => clearTimeout(timeout);
    }
  }, []);

  const analyzeMatch = useCallback(async (matchData: Match, options?: any): Promise<AnalysisResult | null> => {
    if (!provider) return null;
    try {
      return await provider.analyzeMatch(matchData, options);
    } catch (error) {
      console.error('AI analysis failed:', error);
      return null;
    }
  }, [provider]);

  const generateInsight = useCallback(async (prompt: string, context?: any): Promise<string | null> => {
    if (!provider) return null;
    try {
      return await provider.generateInsight(prompt, context);
    } catch (error) {
      console.error('AI insight generation failed:', error);
      return null;
    }
  }, [provider]);

  const getBettingTips = useCallback(async (matchData: Match): Promise<string[] | null> => {
    if (!provider) return null;
    try {
      return await provider.getBettingTips(matchData);
    } catch (error) {
      console.error('Betting tips generation failed:', error);
      return null;
    }
  }, [provider]);

  return {
    provider,
    isLoading,
    analyzeMatch,
    generateInsight,
    getBettingTips,
    isEnabled: isFeatureEnabled('ai_analysis_enabled'),
  };
}

/**
 * Hook to access Payment provider
 */
export function usePaymentProvider() {
  const [provider, setProvider] = useState<PaymentProvider | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkProvider = () => {
      const paymentProvider = getPaymentProvider();
      setProvider(paymentProvider);
      setIsLoading(!providerRegistry.isInitialized());
    };

    checkProvider();
    
    if (!providerRegistry.isInitialized()) {
      const timeout = setTimeout(checkProvider, 1000);
      return () => clearTimeout(timeout);
    }
  }, []);

  const createSubscription = useCallback(async (userId: string, planId: string): Promise<Subscription | null> => {
    if (!provider) return null;
    try {
      return await provider.createSubscription(userId, planId);
    } catch (error) {
      console.error('Subscription creation failed:', error);
      return null;
    }
  }, [provider]);

  const cancelSubscription = useCallback(async (subscriptionId: string): Promise<boolean> => {
    if (!provider) return false;
    try {
      await provider.cancelSubscription(subscriptionId);
      return true;
    } catch (error) {
      console.error('Subscription cancellation failed:', error);
      return false;
    }
  }, [provider]);

  const getSubscriptionStatus = useCallback(async (userId: string) => {
    if (!provider) return null;
    try {
      return await provider.getSubscriptionStatus(userId);
    } catch (error) {
      console.error('Subscription status check failed:', error);
      return null;
    }
  }, [provider]);

  return {
    provider,
    isLoading,
    createSubscription,
    cancelSubscription,
    getSubscriptionStatus,
    isEnabled: isFeatureEnabled('payment_processing_enabled'),
  };
}

/**
 * Hook to access Data provider
 */
export function useDataProvider() {
  const [provider, setProvider] = useState<DataProvider | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkProvider = () => {
      const dataProvider = getDataProvider();
      setProvider(dataProvider);
      setIsLoading(!providerRegistry.isInitialized());
    };

    checkProvider();
    
    if (!providerRegistry.isInitialized()) {
      const timeout = setTimeout(checkProvider, 1000);
      return () => clearTimeout(timeout);
    }
  }, []);

  const getMatches = useCallback(async (date: Date, league?: string): Promise<Match[] | null> => {
    if (!provider) return null;
    try {
      return await provider.getMatches(date, league);
    } catch (error) {
      console.error('Failed to fetch matches:', error);
      return null;
    }
  }, [provider]);

  const getLiveScore = useCallback(async (matchId: string): Promise<Match | null> => {
    if (!provider) return null;
    try {
      return await provider.getLiveScore(matchId);
    } catch (error) {
      console.error('Failed to fetch live score:', error);
      return null;
    }
  }, [provider]);

  const getOdds = useCallback(async (matchId: string) => {
    if (!provider) return null;
    try {
      return await provider.getOdds(matchId);
    } catch (error) {
      console.error('Failed to fetch odds:', error);
      return null;
    }
  }, [provider]);

  return {
    provider,
    isLoading,
    getMatches,
    getLiveScore,
    getOdds,
  };
}

/**
 * Hook to access Realtime provider
 */
export function useRealtimeProvider() {
  const [provider, setProvider] = useState<RealtimeProvider | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkProvider = () => {
      const realtimeProvider = getRealtimeProvider();
      setProvider(realtimeProvider);
      setIsConnected(realtimeProvider?.getConnectionStatus() || false);
      setIsLoading(!providerRegistry.isInitialized());
    };

    checkProvider();
    
    if (!providerRegistry.isInitialized()) {
      const timeout = setTimeout(checkProvider, 1000);
      return () => clearTimeout(timeout);
    }
  }, []);

  const subscribeToMatch = useCallback((matchId: string, callback: (update: LiveMatchUpdate) => void) => {
    if (!provider) return () => {};
    return provider.subscribeToMatch(matchId, callback);
  }, [provider]);

  const subscribeToNotifications = useCallback((userId: string, callback: (notification: Notification) => void) => {
    if (!provider) return () => {};
    return provider.subscribeToNotifications(userId, callback);
  }, [provider]);

  const sendNotification = useCallback(async (notification: Omit<Notification, 'id' | 'timestamp'>) => {
    if (!provider) return false;
    try {
      await provider.sendNotification(notification);
      return true;
    } catch (error) {
      console.error('Failed to send notification:', error);
      return false;
    }
  }, [provider]);

  return {
    provider,
    isConnected,
    isLoading,
    subscribeToMatch,
    subscribeToNotifications,
    sendNotification,
    isEnabled: isFeatureEnabled('real_time_updates_enabled'),
  };
}

/**
 * Hook to access Analytics provider
 */
export function useAnalyticsProvider() {
  const [provider, setProvider] = useState<AnalyticsProvider | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkProvider = () => {
      const analyticsProvider = getAnalyticsProvider();
      setProvider(analyticsProvider);
      setIsLoading(!providerRegistry.isInitialized());
    };

    checkProvider();
    
    if (!providerRegistry.isInitialized()) {
      const timeout = setTimeout(checkProvider, 1000);
      return () => clearTimeout(timeout);
    }
  }, []);

  const trackEvent = useCallback(async (event: string, properties?: Record<string, any>) => {
    if (!provider) return;
    try {
      await provider.trackEvent(event, properties);
    } catch (error) {
      console.error('Analytics tracking failed:', error);
    }
  }, [provider]);

  const trackPageView = useCallback(async (page: string, properties?: Record<string, any>) => {
    if (!provider) return;
    try {
      await provider.trackPageView(page, properties);
    } catch (error) {
      console.error('Page view tracking failed:', error);
    }
  }, [provider]);

  const trackConversion = useCallback(async (event: string, value?: number) => {
    if (!provider) return;
    try {
      await provider.trackConversion(event, value);
    } catch (error) {
      console.error('Conversion tracking failed:', error);
    }
  }, [provider]);

  return {
    provider,
    isLoading,
    trackEvent,
    trackPageView,
    trackConversion,
    isEnabled: isFeatureEnabled('advanced_analytics_enabled'),
  };
}

/**
 * Hook to access feature flags
 */
export function useFeatureFlags() {
  const [flags, setFlags] = useState<FeatureFlags | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkFlags = () => {
      const featureFlags = getFeatureFlags();
      setFlags(featureFlags);
      setIsLoading(!providerRegistry.isInitialized());
    };

    checkFlags();
    
    if (!providerRegistry.isInitialized()) {
      const timeout = setTimeout(checkFlags, 1000);
      return () => clearTimeout(timeout);
    }
  }, []);

  const isEnabled = useCallback((feature: keyof FeatureFlags): boolean => {
    return flags?.[feature] || false;
  }, [flags]);

  return {
    flags,
    isLoading,
    isEnabled,
  };
}

/**
 * Hook to access usage limits
 */
export function useUsageLimits() {
  const [limits, setLimits] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkLimits = () => {
      const usageLimits = getLimits();
      setLimits(usageLimits);
      setIsLoading(!providerRegistry.isInitialized());
    };

    checkLimits();
    
    if (!providerRegistry.isInitialized()) {
      const timeout = setTimeout(checkLimits, 1000);
      return () => clearTimeout(timeout);
    }
  }, []);

  return {
    limits,
    isLoading,
  };
} 