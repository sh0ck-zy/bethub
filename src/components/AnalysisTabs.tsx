'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { AdSlot } from './AdSlot';
import { InsightBlock } from './InsightBlock';
import { 
  Activity, 
  BarChart3, 
  TrendingUp, 
  Brain, 
  Lock, 
  Zap, 
  Target,
  Users,
  Clock,
  AlertCircle,
  CheckCircle,
  Star
} from 'lucide-react';

interface AnalysisTabsProps {
  matchId: string;
  isAuthenticated: boolean;
}

export function AnalysisTabs({ matchId, isAuthenticated }: AnalysisTabsProps) {
  const [liveData, setLiveData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('live');

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

  // Mock data for demonstration
  const mockStats = {
    possession: { home: 58, away: 42 },
    shots: { home: 7, away: 4 },
    corners: { home: 3, away: 1 },
    fouls: { home: 8, away: 12 },
    yellowCards: { home: 1, away: 2 },
    redCards: { home: 0, away: 0 }
  };

  const mockOdds = {
    homeWin: 2.1,
    draw: 3.4,
    awayWin: 3.8,
    over25: 1.8,
    under25: 2.0,
    bothTeamsScore: 1.9
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-gray-800/50 border border-white/10 rounded-xl p-1">
          <TabsTrigger 
            value="live" 
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-red-600 data-[state=active]:text-white font-semibold"
          >
            <Activity className="w-4 h-4 mr-2" />
            Live Feed
          </TabsTrigger>
          <TabsTrigger 
            value="stats"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white font-semibold"
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Statistics
          </TabsTrigger>
          <TabsTrigger 
            value="odds"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-green-600 data-[state=active]:text-white font-semibold"
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Betting Odds
          </TabsTrigger>
          <TabsTrigger 
            value="insights" 
            disabled={!isAuthenticated}
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-purple-600 data-[state=active]:text-white font-semibold disabled:opacity-50"
          >
            <Brain className="w-4 h-4 mr-2" />
            AI Insights {!isAuthenticated && <Lock className="w-3 h-3 ml-1" />}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="live" className="space-y-6 mt-6">
          <Card className="premium-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  <span>Live Match Feed</span>
                </CardTitle>
                <Badge className="bg-red-500/20 text-red-400 border border-red-500/30">
                  <Zap className="w-3 h-3 mr-1" />
                  Real-time
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {liveData ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/20">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-400" />
                      <div>
                        <div className="font-semibold text-white">Status: {liveData.status}</div>
                        <div className="text-sm text-gray-400">
                          Last update: {new Date(liveData.snapshotTs).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                    <Badge className="bg-green-500/20 text-green-400 border border-green-500/30">
                      Connected
                    </Badge>
                  </div>
                  
                  {/* Live Events Timeline */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-white flex items-center">
                      <Clock className="w-4 h-4 mr-2 text-blue-400" />
                      Recent Events
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-3 p-3 rounded-lg bg-white/5 border border-white/10">
                        <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-white">45' - Yellow Card</div>
                          <div className="text-xs text-gray-400">Player cautioned for tactical foul</div>
                        </div>
                        <div className="text-xs text-gray-400">2 min ago</div>
                      </div>
                      <div className="flex items-center space-x-3 p-3 rounded-lg bg-white/5 border border-white/10">
                        <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-white">42' - Corner Kick</div>
                          <div className="text-xs text-gray-400">Dangerous cross cleared by defense</div>
                        </div>
                        <div className="text-xs text-gray-400">5 min ago</div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 space-y-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-full mx-auto flex items-center justify-center animate-pulse">
                    <Activity className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Connecting to Live Feed</h3>
                    <p className="text-gray-400 text-sm">Establishing real-time connection...</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Possession */}
            <Card className="premium-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="w-5 h-5 text-blue-400" />
                  <span>Ball Possession</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-300">Home Team</span>
                    <span className="font-bold text-green-400">{mockStats.possession.home}%</span>
                  </div>
                  <Progress value={mockStats.possession.home} className="h-3" />
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-300">Away Team</span>
                    <span className="font-bold text-blue-400">{mockStats.possession.away}%</span>
                  </div>
                  <Progress value={mockStats.possession.away} className="h-3" />
                </div>
              </CardContent>
            </Card>

            {/* Shots */}
            <Card className="premium-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="w-5 h-5 text-green-400" />
                  <span>Shots on Goal</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="space-y-2">
                    <div className="text-3xl font-bold text-green-400">{mockStats.shots.home}</div>
                    <div className="text-sm text-gray-400">Home</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-3xl font-bold text-blue-400">{mockStats.shots.away}</div>
                    <div className="text-sm text-gray-400">Away</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Additional Stats */}
            <Card className="premium-card lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5 text-purple-400" />
                  <span>Match Statistics</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="text-center space-y-2">
                    <div className="text-2xl font-bold text-yellow-400">{mockStats.corners.home} - {mockStats.corners.away}</div>
                    <div className="text-sm text-gray-400">Corners</div>
                  </div>
                  <div className="text-center space-y-2">
                    <div className="text-2xl font-bold text-orange-400">{mockStats.fouls.home} - {mockStats.fouls.away}</div>
                    <div className="text-sm text-gray-400">Fouls</div>
                  </div>
                  <div className="text-center space-y-2">
                    <div className="text-2xl font-bold text-yellow-500">{mockStats.yellowCards.home} - {mockStats.yellowCards.away}</div>
                    <div className="text-sm text-gray-400">Yellow Cards</div>
                  </div>
                  <div className="text-center space-y-2">
                    <div className="text-2xl font-bold text-red-500">{mockStats.redCards.home} - {mockStats.redCards.away}</div>
                    <div className="text-sm text-gray-400">Red Cards</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <AdSlot id="match_inline" sizes={[728, 90]} className="mx-auto" />
        </TabsContent>

        <TabsContent value="odds" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Match Result */}
            <Card className="premium-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                  <span>Match Result</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 rounded-lg bg-green-500/10 border border-green-500/20 hover:bg-green-500/20 transition-colors cursor-pointer">
                    <span className="font-medium text-white">Home Win</span>
                    <Badge className="bg-green-500 text-white font-bold">{mockOdds.homeWin}</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-gray-500/10 border border-gray-500/20 hover:bg-gray-500/20 transition-colors cursor-pointer">
                    <span className="font-medium text-white">Draw</span>
                    <Badge className="bg-gray-500 text-white font-bold">{mockOdds.draw}</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 transition-colors cursor-pointer">
                    <span className="font-medium text-white">Away Win</span>
                    <Badge className="bg-blue-500 text-white font-bold">{mockOdds.awayWin}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Goals */}
            <Card className="premium-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="w-5 h-5 text-yellow-400" />
                  <span>Total Goals</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 hover:bg-yellow-500/20 transition-colors cursor-pointer">
                    <span className="font-medium text-white">Over 2.5</span>
                    <Badge className="bg-yellow-500 text-white font-bold">{mockOdds.over25}</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/20 transition-colors cursor-pointer">
                    <span className="font-medium text-white">Under 2.5</span>
                    <Badge className="bg-purple-500 text-white font-bold">{mockOdds.under25}</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-orange-500/10 border border-orange-500/20 hover:bg-orange-500/20 transition-colors cursor-pointer">
                    <span className="font-medium text-white">Both Teams Score</span>
                    <Badge className="bg-orange-500 text-white font-bold">{mockOdds.bothTeamsScore}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Betting Tips */}
            <Card className="premium-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Star className="w-5 h-5 text-purple-400 fill-current" />
                  <span>AI Recommendations</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="p-3 rounded-lg bg-gradient-to-r from-green-500/20 to-green-600/20 border border-green-500/30">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-green-400">Best Value</span>
                      <Badge className="bg-green-500 text-white text-xs">95% Confidence</Badge>
                    </div>
                    <div className="text-sm text-white">Over 2.5 Goals</div>
                  </div>
                  <div className="p-3 rounded-lg bg-gradient-to-r from-blue-500/20 to-blue-600/20 border border-blue-500/30">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-blue-400">Safe Bet</span>
                      <Badge className="bg-blue-500 text-white text-xs">88% Confidence</Badge>
                    </div>
                    <div className="text-sm text-white">Both Teams to Score</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6 mt-6">
          {isAuthenticated ? (
            <div className="space-y-6">
              {liveData?.aiInsights?.map((insight: any) => (
                <InsightBlock key={insight.id} insight={insight} />
              )) || (
                <div className="space-y-6">
                  {/* Premium AI Insights */}
                  <Card className="premium-card">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Brain className="w-5 h-5 text-purple-400" />
                        <span>AI Match Analysis</span>
                        <Badge className="bg-purple-500/20 text-purple-400 border border-purple-500/30">
                          Premium
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="p-4 rounded-lg bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold text-white">Key Tactical Insight</h4>
                          <Badge className="bg-green-500 text-white text-xs">92% Confidence</Badge>
                        </div>
                        <p className="text-gray-300 text-sm leading-relaxed">
                          The home team's high pressing strategy is creating significant opportunities in the final third. 
                          Their possession-based approach has resulted in 3 clear-cut chances in the last 15 minutes.
                        </p>
                        <Progress value={92} className="mt-3 h-2" />
                      </div>
                      
                      <div className="p-4 rounded-lg bg-gradient-to-r from-green-500/10 to-yellow-500/10 border border-green-500/20">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold text-white">Betting Opportunity</h4>
                          <Badge className="bg-yellow-500 text-white text-xs">85% Confidence</Badge>
                        </div>
                        <p className="text-gray-300 text-sm leading-relaxed">
                          Statistical analysis suggests a high probability of goals in the second half. 
                          Both teams have shown attacking intent with combined xG of 2.8.
                        </p>
                        <Progress value={85} className="mt-3 h-2" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          ) : (
            <Card className="premium-card">
              <CardContent className="p-8 text-center space-y-6">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full mx-auto flex items-center justify-center">
                  <Lock className="w-10 h-10 text-white" />
                </div>
                <div className="space-y-3">
                  <h3 className="text-2xl font-bold text-white">Premium AI Insights</h3>
                  <p className="text-gray-400 max-w-md mx-auto">
                    Unlock advanced AI-powered match analysis, betting recommendations, 
                    and real-time tactical insights with BetHub Premium.
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-center space-x-4 text-sm text-gray-300">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span>Real-time Analysis</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span>Betting Tips</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span>Tactical Insights</span>
                    </div>
                  </div>
                  <Button className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold px-8 py-3">
                    <Star className="w-4 h-4 mr-2 fill-current" />
                    Upgrade to Premium
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}