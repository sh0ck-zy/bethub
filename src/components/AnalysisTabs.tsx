'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AdSlot } from './AdSlot';
import { InsightBlock } from './InsightBlock';

interface AnalysisTabsProps {
  matchId: string;
  isAuthenticated: boolean;
}

export function AnalysisTabs({ matchId, isAuthenticated }: AnalysisTabsProps) {
  const [liveData, setLiveData] = useState<any>(null);

  useEffect(() => {
    if (!isAuthenticated) return;

    // Set up SSE connection for live updates
    const eventSource = new EventSource(`/api/v1/match/${matchId}/stream`);

    eventSource.onmessage = (event) => {
      if (event.type === 'analysis') {
        const data = JSON.parse(event.data);
        setLiveData(data);
      }
    };

    eventSource.onerror = (error) => {
      console.error('SSE error:', error);
    };

    return () => {
      eventSource.close();
    };
  }, [matchId, isAuthenticated]);

  return (
    <div className="sticky top-4">
      <Tabs defaultValue="live" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="live">Live Feed</TabsTrigger>
          <TabsTrigger value="stats">Stats</TabsTrigger>
          <TabsTrigger value="odds">Odds</TabsTrigger>
          <TabsTrigger value="insights" disabled={!isAuthenticated}>
            AI Insights {!isAuthenticated && '🔒'}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="live" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Live Feed</CardTitle>
            </CardHeader>
            <CardContent>
              {liveData ? (
                <div className="space-y-2">
                  <Badge>{liveData.status}</Badge>
                  <p className="text-sm text-muted-foreground">
                    Last update: {new Date(liveData.snapshotTs).toLocaleTimeString()}
                  </p>
                </div>
              ) : (
                <div className="animate-pulse">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Match Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              {liveData?.stats ? (
                <pre className="text-sm">{JSON.stringify(liveData.stats, null, 2)}</pre>
              ) : (
                <p className="text-muted-foreground">No statistics available yet.</p>
              )}
            </CardContent>
          </Card>
          <AdSlot id="match_inline" sizes={[728, 90]} className="mx-auto" />
        </TabsContent>

        <TabsContent value="odds" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Betting Odds</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Odds data coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          {isAuthenticated ? (
            <div className="space-y-4">
              {liveData?.aiInsights?.map((insight: any) => (
                <InsightBlock key={insight.id} insight={insight} />
              )) || (
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-muted-foreground">No AI insights available yet.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <p className="text-muted-foreground">Please sign in to view AI insights.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

