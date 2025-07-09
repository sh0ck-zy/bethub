'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Brain, 
  BarChart3, 
  Lock, 
  Crown,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Target,
  Trophy
} from 'lucide-react';

interface AnalysisTabsProps {
  matchId: string;
  isAuthenticated: boolean;
}

// Generate match-specific insights based on teams
const generateMatchInsights = (matchId: string) => {
  const insightTemplates = {
    '1': { // Man United vs Liverpool
      insights: [
        "Van Dijk ruled out - Liverpool concede 40% more without their defensive leader",
        "Rashford has 5 goals in 3 games vs Liverpool, all from counter-attacks", 
        "United's Old Trafford record: 4 wins in last 6 vs top-6 opponents"
      ],
      tacticalAnalysis: {
        homeTeam: {
          formation: "4-2-3-1",
          style: "Counter-attacking with high pressing",
          strengths: ["Pace on transitions", "Set-piece delivery", "Home crowd factor"],
          weaknesses: ["Defensive consistency", "Midfield creativity", "Squad depth"]
        },
        awayTeam: {
          formation: "4-3-3", 
          style: "High-intensity pressing",
          strengths: ["Attack coordination", "Midfield dominance", "Experience"],
          weaknesses: ["Defensive injuries", "Away form", "Set-piece defending"]
        }
      }
    },
    '2': { // Real Madrid vs Barcelona
      insights: [
        "Clasico history favors Real Madrid at home with 65% win rate",
        "Barcelona's high line vulnerable to Vinicius Jr's pace and direct runs",
        "El Clasico averages 3.2 goals per game in last 10 meetings"
      ],
      tacticalAnalysis: {
        homeTeam: {
          formation: "4-3-3",
          style: "Possession-based with quick transitions", 
          strengths: ["Counter-attacking", "Individual quality", "Home advantage"],
          weaknesses: ["Defensive transitions", "Squad rotation", "Pressure moments"]
        },
        awayTeam: {
          formation: "4-3-3",
          style: "Tiki-taka possession football",
          strengths: ["Ball retention", "Creative midfield", "Tactical discipline"], 
          weaknesses: ["Defensive stability", "Away record", "Physical duels"]
        }
      }
    },
    default: {
      insights: [
        "Home team averages 2.1 goals per game in recent matches",
        "Away team's defensive record: 1.3 goals conceded per away game", 
        "Head-to-head record suggests tight encounter with few clear chances"
      ],
      tacticalAnalysis: {
        homeTeam: {
          formation: "4-4-2",
          style: "Balanced approach with home support",
          strengths: ["Home form", "Set pieces", "Crowd support"],
          weaknesses: ["Away record when reversed", "Squad depth", "Consistency"]
        },
        awayTeam: {
          formation: "4-3-3",
          style: "Disciplined defensive shape",
          strengths: ["Away organization", "Counter-attacks", "Experience"],
          weaknesses: ["Creating chances", "Home pressure", "Squad fatigue"]
        }
      }
    }
  };

  return insightTemplates[matchId as keyof typeof insightTemplates] || insightTemplates.default;
};

export function AnalysisTabs({ matchId, isAuthenticated }: AnalysisTabsProps) {
  const [activeTab, setActiveTab] = useState('analysis');
  
  const matchData = generateMatchInsights(matchId);

  // Quick stats based on match ID
  const quickStats = {
    possession: { home: 58, away: 42 },
    shotsPerGame: { home: 13.4, away: 11.6 },
    goalsPerGame: { home: 1.8, away: 1.6 },
    lastMeetings: "3-2 to home team in last 5",
    avgGoals: 2.8,
    homeScoresFirst: 60
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {/* Mobile-Optimized Tab List */}
        <TabsList className="grid w-full grid-cols-2 bg-white border border-gray-200 rounded-lg p-1 h-auto">
          <TabsTrigger 
            value="analysis"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-50 data-[state=active]:to-purple-50 data-[state=active]:text-blue-700 font-medium transition-all duration-200 py-3 text-sm"
          >
            <Brain className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">AI Analysis</span>
            <span className="sm:hidden">Analysis</span>
          </TabsTrigger>
          <TabsTrigger 
            value="stats"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-50 data-[state=active]:to-purple-50 data-[state=active]:text-blue-700 font-medium transition-all duration-200 py-3 text-sm"
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Statistics</span>
            <span className="sm:hidden">Stats</span>
          </TabsTrigger>
        </TabsList>

        {/* AI Analysis Tab */}
        <TabsContent value="analysis" className="space-y-4 mt-4">
          
          {/* Free Insights - Mobile Optimized Cards */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900 text-sm px-1 flex items-center">
              <Brain className="w-4 h-4 mr-2 text-blue-600" />
              Key Insights
              <Badge className="ml-2 bg-green-50 text-green-600 border-green-200 text-xs">Free</Badge>
            </h3>
            
            {matchData.insights.map((insight, index) => (
              <Card key={index} className="border-0 bg-white shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-gray-700 leading-relaxed">{insight}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Premium Content Preview */}
          {isAuthenticated ? (
            <div className="space-y-4">
              {/* Tactical Analysis */}
              <Card className="border-0 bg-white shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center space-x-2 text-base">
                    <Target className="w-5 h-5 text-blue-500" />
                    <span>Tactical Breakdown</span>
                    <Badge className="bg-blue-50 text-blue-600 border-blue-200 text-xs">Premium</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Home Team */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-3 text-sm">Home Team Setup</h4>
                      <div className="space-y-2 text-xs">
                        <div><span className="text-gray-500">Formation:</span> <span className="font-medium text-gray-900">{matchData.tacticalAnalysis.homeTeam.formation}</span></div>
                        <div><span className="text-gray-500">Style:</span> <span className="text-gray-700">{matchData.tacticalAnalysis.homeTeam.style}</span></div>
                        <div className="space-y-1">
                          <span className="text-gray-500">Strengths:</span>
                          {matchData.tacticalAnalysis.homeTeam.strengths.map((strength, i) => (
                            <div key={i} className="flex items-center space-x-1">
                              <CheckCircle className="w-3 h-3 text-green-500" />
                              <span className="text-gray-700">{strength}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Away Team */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-3 text-sm">Away Team Setup</h4>
                      <div className="space-y-2 text-xs">
                        <div><span className="text-gray-500">Formation:</span> <span className="font-medium text-gray-900">{matchData.tacticalAnalysis.awayTeam.formation}</span></div>
                        <div><span className="text-gray-500">Style:</span> <span className="text-gray-700">{matchData.tacticalAnalysis.awayTeam.style}</span></div>
                        <div className="space-y-1">
                          <span className="text-gray-500">Weaknesses:</span>
                          {matchData.tacticalAnalysis.awayTeam.weaknesses.map((weakness, i) => (
                            <div key={i} className="flex items-center space-x-1">
                              <AlertTriangle className="w-3 h-3 text-orange-500" />
                              <span className="text-gray-700">{weakness}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Head-to-Head */}
              <Card className="border-0 bg-white shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center space-x-2 text-base">
                    <Trophy className="w-5 h-5 text-purple-500" />
                    <span>Historical Patterns</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-lg font-bold text-gray-900">{quickStats.lastMeetings}</div>
                      <div className="text-xs text-gray-600">Last 5 meetings</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-lg font-bold text-gray-900">{quickStats.avgGoals}</div>
                      <div className="text-xs text-gray-600">Avg goals</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-lg font-bold text-gray-900">{quickStats.homeScoresFirst}%</div>
                      <div className="text-xs text-gray-600">Home scores first</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-lg font-bold text-gray-900">High</div>
                      <div className="text-xs text-gray-600">Goal expectation</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            /* Premium Upsell */
            <Card className="border-0 bg-gradient-to-r from-gray-900 to-gray-800 shadow-sm">
              <CardContent className="p-6 text-center text-white">
                <Crown className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                <h3 className="text-lg font-bold mb-2">Unlock Full Tactical Analysis</h3>
                <p className="text-gray-300 text-sm mb-4">
                  Get formation breakdowns, player analysis, and winning patterns
                </p>
                <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium">
                  <Crown className="w-4 h-4 mr-2" />
                  Upgrade to Premium • $9.99/month
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Statistics Tab */}
        <TabsContent value="stats" className="space-y-4 mt-4">
          
          {/* Basic Stats - Always Free */}
          <Card className="border-0 bg-white shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-base">
                <BarChart3 className="w-5 h-5 text-green-500" />
                <span>Quick Stats</span>
                <Badge className="bg-green-50 text-green-600 border-green-200 text-xs">Free</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900 text-sm">Home Team</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Goals per game:</span>
                      <span className="font-medium text-gray-900">{quickStats.goalsPerGame.home}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Shots per game:</span>
                      <span className="font-medium text-gray-900">{quickStats.shotsPerGame.home}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Recent form:</span>
                      <span className="font-medium text-gray-900 font-mono">WWDLW</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900 text-sm">Away Team</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Goals per game:</span>
                      <span className="font-medium text-gray-900">{quickStats.goalsPerGame.away}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Shots per game:</span>
                      <span className="font-medium text-gray-900">{quickStats.shotsPerGame.away}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Recent form:</span>
                      <span className="font-medium text-gray-900 font-mono">LWWDL</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Premium Stats Upsell */}
          {!isAuthenticated && (
            <Card className="border-0 bg-gradient-to-r from-gray-900 to-gray-800 shadow-sm">
              <CardContent className="p-6 text-center text-white">
                <Lock className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                <h3 className="text-lg font-bold mb-2">Advanced Statistics</h3>
                <p className="text-gray-300 text-sm mb-4">
                  Possession maps, passing accuracy, xG analysis and more
                </p>
                <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium">
                  <Crown className="w-4 h-4 mr-2" />
                  Upgrade for Detailed Stats
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Premium Advanced Stats */}
          {isAuthenticated && (
            <Card className="border-0 bg-white shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2 text-base">
                  <TrendingUp className="w-5 h-5 text-orange-500" />
                  <span>Advanced Metrics</span>
                  <Badge className="bg-blue-50 text-blue-600 border-blue-200 text-xs">Premium</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900 text-sm">Possession & Control</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Avg possession:</span>
                        <span className="font-medium text-gray-900">{quickStats.possession.home}% vs {quickStats.possession.away}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Pass accuracy:</span>
                        <span className="font-medium text-gray-900">87% vs 83%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Key passes:</span>
                        <span className="font-medium text-gray-900">12.4 vs 9.8</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900 text-sm">Attack & Defense</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">xG per game:</span>
                        <span className="font-medium text-gray-900">1.8 vs 1.4</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Clean sheets:</span>
                        <span className="font-medium text-gray-900">40% vs 30%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Corners per game:</span>
                        <span className="font-medium text-gray-900">5.7 vs 4.9</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}