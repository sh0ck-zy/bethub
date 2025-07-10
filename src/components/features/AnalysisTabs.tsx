'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useRoleSelector } from '@/components/ui/RoleSelector';
import { 
  Brain, 
  BarChart3, 
  Lock, 
  Crown,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Target,
  Trophy,
  Users,
  Zap,
  Activity,
  Eye
} from 'lucide-react';

interface AnalysisTabsProps {
  matchId: string;
  isAuthenticated: boolean;
}

// Generate enhanced match-specific insights
const generateEnhancedInsights = (matchId: string) => {
  const insightDatabase = {
    '1': { // Man United vs Liverpool
      freeInsights: [
        {
          type: 'injury_impact',
          icon: <AlertTriangle className="w-4 h-4 text-orange-500" />,
          title: "Key Injury Impact",
          content: "Van Dijk ruled out - Liverpool concede 40% more without their defensive leader (1.8 vs 1.1 goals per game)",
          confidence: 92
        },
        {
          type: 'player_form',
          icon: <TrendingUp className="w-4 h-4 text-green-500" />,
          title: "Player in Form",
          content: "Rashford has 5 goals in 3 games vs Liverpool, all coming from counter-attacking situations",
          confidence: 88
        },
        {
          type: 'home_advantage',
          icon: <Users className="w-4 h-4 text-blue-500" />,
          title: "Home Fortress",
          content: "United's Old Trafford record: 4 wins in last 6 vs top-6 opponents with crowd support",
          confidence: 85
        }
      ],
      premiumInsights: [
        {
          type: 'tactical_setup',
          title: "Formation Battle",
          content: "United's 4-2-3-1 counter-press vs Liverpool's 4-3-3 high line creates space behind for Rashford and Garnacho",
          details: "When Liverpool's fullbacks push high, United's wide forwards exploit the space with through balls from Bruno Fernandes"
        },
        {
          type: 'set_pieces',
          title: "Set-Piece Advantage", 
          content: "Liverpool have conceded 3 goals from corners this month - United's aerial threat could be decisive",
          details: "Maguire and Varane vs Liverpool's shorter center-backs without Van Dijk creates clear height advantage"
        }
      ],
      liveUpdates: [
        { minute: 23, event: "Rashford's pace causes penalty - prediction validated", impact: "positive" },
        { minute: 45, event: "Liverpool's high line exposed twice in first half", impact: "positive" }
      ]
    },
    '2': { // Real Madrid vs Barcelona
      freeInsights: [
        {
          type: 'historical_pattern',
          icon: <Trophy className="w-4 h-4 text-yellow-500" />,
          title: "El Clasico History",
          content: "Real Madrid have 65% win rate vs Barcelona at the Bernabeu in the last decade",
          confidence: 78
        },
        {
          type: 'tactical_mismatch',
          icon: <Zap className="w-4 h-4 text-purple-500" />,
          title: "Pace vs High Line",
          content: "Vinicius Jr's speed against Barcelona's defensive line has produced 7 goals in 4 recent Clasicos",
          confidence: 84
        },
        {
          type: 'goals_expectation',
          icon: <Target className="w-4 h-4 text-red-500" />,
          title: "High-Scoring Expected",
          content: "El Clasico averages 3.2 goals per game with both teams scoring in 89% of meetings",
          confidence: 91
        }
      ],
      premiumInsights: [
        {
          type: 'tactical_analysis',
          title: "Midfield Battle",
          content: "Modric and Kroos' experience vs Pedri and Gavi's energy will control the game's tempo",
          details: "Real's deeper midfield allows quicker transitions, while Barca's high press could tire in final 30 minutes"
        }
      ],
      liveUpdates: [
        { minute: 15, event: "Vinicius Jr's pace threatens Barcelona's high line", impact: "positive" },
        { minute: 38, event: "Clasico living up to expectations with end-to-end action", impact: "neutral" }
      ]
    },
    default: {
      freeInsights: [
        {
          type: 'form_analysis',
          icon: <BarChart3 className="w-4 h-4 text-blue-500" />,
          title: "Recent Form",
          content: "Home team averaging 2.1 goals in last 5 matches vs away team's 1.3 defensive record",
          confidence: 75
        },
        {
          type: 'head_to_head',
          icon: <Activity className="w-4 h-4 text-green-500" />,
          title: "Head-to-Head", 
          content: "Last 5 meetings suggest tight encounter with home advantage proving decisive",
          confidence: 72
        }
      ],
      premiumInsights: [
        {
          type: 'tactical_preview',
          title: "Tactical Setup",
          content: "Expect defensive solidity from both sides with quality required to break the deadlock",
          details: "Set pieces and individual moments of brilliance likely to decide the outcome"
        }
      ],
      liveUpdates: []
    }
  };

  return insightDatabase[matchId as keyof typeof insightDatabase] || insightDatabase.default;
};

// Usage tracking for free users
const usageTracker = {
  getUsageToday: () => {
    const today = new Date().toDateString();
    const usage = localStorage.getItem(`usage_${today}`);
    return usage ? parseInt(usage) : 0;
  },
  
  incrementUsage: () => {
    const today = new Date().toDateString();
    const current = usageTracker.getUsageToday();
    localStorage.setItem(`usage_${today}`, (current + 1).toString());
  },
  
  hasUsageLeft: () => {
    return usageTracker.getUsageToday() < 1; // 1 free analysis per day
  }
};

export function AnalysisTabs({ matchId, isAuthenticated }: AnalysisTabsProps) {
  const [activeTab, setActiveTab] = useState('insights');
  const [hasViewedAnalysis, setHasViewedAnalysis] = useState(false);
  const [usageCount, setUsageCount] = useState(0);
  
  // Use demo role system for testing
  const { isPremium, isAuthenticated: isDemoAuthenticated } = useRoleSelector();
  const finalIsAuthenticated = isDemoAuthenticated || isAuthenticated;
  const finalIsPremium = isPremium;
  
  const insights = generateEnhancedInsights(matchId);
  const hasUsageLeft = !finalIsAuthenticated || finalIsPremium || usageTracker.hasUsageLeft();

  useEffect(() => {
    if (finalIsAuthenticated && !finalIsPremium) {
      setUsageCount(usageTracker.getUsageToday());
    }
  }, [finalIsAuthenticated, finalIsPremium]);

  const handleViewAnalysis = () => {
    if (!finalIsAuthenticated || finalIsPremium) {
      setHasViewedAnalysis(true);
      return;
    }

    if (usageTracker.hasUsageLeft()) {
      usageTracker.incrementUsage();
      setUsageCount(usageTracker.getUsageToday());
      setHasViewedAnalysis(true);
    }
  };

  const quickStats = {
    possession: { home: 58, away: 42 },
    shotsPerGame: { home: 13.4, away: 11.6 },
    goalsPerGame: { home: 1.8, away: 1.6 },
    recentForm: { home: "WWDLW", away: "LWWDL" },
    headToHead: "3-2 to home team in last 5",
    avgGoals: 2.8
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-card border border-border rounded-lg p-1 h-auto">
          <TabsTrigger 
            value="insights"
            className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary font-medium py-3 text-sm"
          >
            <Brain className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">AI Insights</span>
            <span className="sm:hidden">Insights</span>
          </TabsTrigger>
          
          <TabsTrigger 
            value="stats"
            className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary font-medium py-3 text-sm"
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Statistics</span>
            <span className="sm:hidden">Stats</span>
          </TabsTrigger>
          
          <TabsTrigger 
            value="live"
            className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary font-medium py-3 text-sm"
          >
            <Activity className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Live Feed</span>
            <span className="sm:hidden">Live</span>
          </TabsTrigger>
        </TabsList>

        {/* Usage Indicator for Free Users */}
        {finalIsAuthenticated && !finalIsPremium && (
          <Card className="border-orange-200 bg-orange-500/10 dark:border-orange-800/50 dark:bg-orange-500/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Eye className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                  <span className="text-sm font-medium text-orange-800 dark:text-orange-200">Daily Usage</span>
                </div>
                <span className="text-sm text-orange-600 dark:text-orange-400">{usageCount}/1 used</span>
              </div>
              <Progress value={usageCount * 100} className="h-2 mb-2" />
              <p className="text-xs text-orange-700 dark:text-orange-300">
                {hasUsageLeft ? 'You have 1 free analysis remaining today' : 'Daily limit reached - upgrade for unlimited access'}
              </p>
            </CardContent>
          </Card>
        )}

        {/* AI Insights Tab */}
        <TabsContent value="insights" className="space-y-4">
          {/* Free Insights - Enhanced */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-foreground flex items-center">
                <Brain className="w-5 h-5 mr-2 text-primary" />
                Key Insights
              </h3>
              <Badge className="bg-green-500/10 text-green-600 border-green-500/20 dark:text-green-400 text-xs">
                Always Free
              </Badge>
            </div>
            
            {/* Show more free insights (4 instead of 2) */}
            {insights.freeInsights.map((insight, index) => (
              <Card key={index} className="border-0 bg-card shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {insight.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-foreground text-sm">{insight.title}</h4>
                        <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs">
                          {insight.confidence}%
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{insight.content}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {/* Additional free insights from premium pool */}
            {insights.premiumInsights.slice(0, 2).map((insight, index) => (
              <Card key={`free-bonus-${index}`} className="border-0 bg-card shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-0.5">
                      <CheckCircle className="w-4 h-4 text-blue-500" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-foreground text-sm">{insight.title}</h4>
                        <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-xs">
                          Free
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{insight.content}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Premium Content Gate - Only show if no free analysis left */}
          {(!finalIsAuthenticated || (!finalIsPremium && !hasUsageLeft)) && !hasViewedAnalysis ? (
            <Card className="border-0 bg-gradient-to-r from-slate-900 to-slate-800 dark:from-slate-800 dark:to-slate-900 text-white">
              <CardContent className="p-6 text-center">
                <Lock className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">Unlock Advanced Analysis</h3>
                <p className="text-gray-300 mb-6">
                  Get tactical formations, player analysis, and live updates
                </p>
                
                {!finalIsAuthenticated ? (
                  <Button 
                    onClick={() => alert('Sign up modal')}
                    className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-700 text-white font-semibold px-8 py-3"
                  >
                    Sign Up for Free Analysis
                  </Button>
                ) : !hasUsageLeft ? (
                  <Button 
                    onClick={() => alert('Premium upgrade modal')}
                    className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-semibold px-8 py-3"
                  >
                    <Crown className="w-5 h-5 mr-2" />
                    Upgrade to Premium • $9.99/month
                  </Button>
                ) : (
                  <Button 
                    onClick={handleViewAnalysis}
                    className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-700 text-white font-semibold px-8 py-3"
                  >
                    <Eye className="w-5 h-5 mr-2" />
                    Use Your Free Analysis
                  </Button>
                )}
                
                <p className="text-xs text-gray-400 mt-3">
                  {!finalIsAuthenticated ? 'Free account gets 1 analysis per day' : 'Upgrade for unlimited access'}
                </p>
              </CardContent>
            </Card>
          ) : (
            /* Premium Insights - Only remaining premium content */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-foreground flex items-center">
                  <Target className="w-5 h-5 mr-2 text-purple-600 dark:text-purple-400" />
                  Tactical Analysis
                </h3>
                <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">
                  {finalIsPremium ? 'Premium' : 'Free Today'}
                </Badge>
              </div>

              {insights.premiumInsights?.slice(2).map((insight, index) => (
                <Card key={index} className="border-0 bg-gradient-to-r from-primary/5 to-purple-500/5 dark:from-primary/10 dark:to-purple-500/10">
                  <CardContent className="p-6">
                    <h4 className="font-semibold text-foreground mb-3">{insight.title}</h4>
                    <p className="text-muted-foreground mb-4 leading-relaxed">{insight.content}</p>
                    <div className="bg-card/50 rounded-lg p-4 border border-border/20">
                      <p className="text-sm text-muted-foreground leading-relaxed">{insight.details}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Upgrade Prompt for Free Users Who Used Their Analysis */}
              {!isPremium && (
                <Card className="border-yellow-200 bg-yellow-50">
                  <CardContent className="p-4 text-center">
                    <Crown className="w-8 h-8 text-yellow-600 mx-auto mb-3" />
                    <h4 className="font-semibold text-gray-900 mb-2">Want unlimited access?</h4>
                    <p className="text-sm text-gray-600 mb-4">
                      Get detailed analysis for every match, plus live updates and advanced stats
                    </p>
                    <Button 
                      onClick={() => alert('Premium upgrade modal')}
                      className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-medium"
                    >
                      Upgrade to Premium
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>

        {/* Statistics Tab */}
        <TabsContent value="stats" className="space-y-4">
          <Card className="border-0 bg-white shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-base">
                <BarChart3 className="w-5 h-5 text-green-500" />
                <span>Match Statistics</span>
                <Badge className="bg-green-50 text-green-600 border-green-200 text-xs">Free</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 text-sm">Home Team</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Goals per game</span>
                      <span className="font-semibold text-gray-900">{quickStats.goalsPerGame.home}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Shots per game</span>
                      <span className="font-semibold text-gray-900">{quickStats.shotsPerGame.home}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Recent form</span>
                      <span className="font-mono text-sm font-semibold text-gray-900">{quickStats.recentForm.home}</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 text-sm">Away Team</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Goals per game</span>
                      <span className="font-semibold text-gray-900">{quickStats.goalsPerGame.away}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Shots per game</span>
                      <span className="font-semibold text-gray-900">{quickStats.shotsPerGame.away}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Recent form</span>
                      <span className="font-mono text-sm font-semibold text-gray-900">{quickStats.recentForm.away}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100">
                <h4 className="font-semibold text-gray-900 text-sm mb-3">Head-to-Head</h4>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-lg font-bold text-gray-900">{quickStats.headToHead}</div>
                    <div className="text-xs text-gray-600">Last 5 meetings</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-lg font-bold text-gray-900">{quickStats.avgGoals}</div>
                    <div className="text-xs text-gray-600">Avg goals per game</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-lg font-bold text-gray-900">High</div>
                    <div className="text-xs text-gray-600">Entertainment factor</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Premium Stats Upsell */}
          {!isPremium && (
            <Card className="border-0 bg-gradient-to-r from-gray-900 to-gray-800 text-white">
              <CardContent className="p-6 text-center">
                <TrendingUp className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                <h3 className="text-lg font-bold mb-2">Advanced Statistics</h3>
                <p className="text-gray-300 mb-6">
                  Get xG analysis, possession maps, passing networks, and heat maps
                </p>
                <Button 
                  onClick={() => alert('Premium upgrade modal')}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium"
                >
                  <Crown className="w-4 h-4 mr-2" />
                  Unlock Advanced Stats
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Live Feed Tab */}
        <TabsContent value="live" className="space-y-4">
          <Card className="border-0 bg-white shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-base">
                <Activity className="w-5 h-5 text-red-500" />
                <span>Live Analysis Feed</span>
                {matchId === '2' && (
                  <Badge className="bg-red-50 text-red-600 border-red-200 text-xs animate-pulse">
                    Live Match
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
                         <CardContent>
               {matchId === '2' && insights.liveUpdates && insights.liveUpdates.length > 0 ? (
                 <div className="space-y-4">
                   {insights.liveUpdates.map((update: any, index: number) => (
                     <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                       <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                         {update.minute}'
                       </div>
                       <div className="flex-1">
                         <p className="text-sm text-gray-900 font-medium">{update.event}</p>
                         <div className="flex items-center space-x-2 mt-1">
                           <Badge className={`text-xs ${
                             update.impact === 'positive' 
                               ? 'bg-green-100 text-green-700' 
                               : 'bg-yellow-100 text-yellow-700'
                           }`}>
                             {update.impact === 'positive' ? 'Prediction Validated' : 'Monitoring'}
                           </Badge>
                         </div>
                       </div>
                     </div>
                   ))}
                 </div>
              ) : (
                <div className="text-center py-8">
                  <Activity className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-700 mb-2">
                    {matchId === '2' ? 'Live Updates Coming Soon' : 'No Live Updates'}
                  </h3>
                  <p className="text-gray-500 text-sm">
                    {matchId === '2' 
                      ? 'Live tactical analysis will appear here during the match'
                      : 'Live updates are only available during match time'
                    }
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Premium Live Features */}
          {!isPremium && (
            <Card className="border-0 bg-gradient-to-r from-red-50 to-orange-50 border-orange-200">
              <CardContent className="p-6 text-center">
                <Zap className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-900 mb-2">Premium Live Features</h3>
                <p className="text-gray-600 mb-6">
                  Get real-time tactical updates, momentum shifts, and AI predictions during live matches
                </p>
                <div className="grid grid-cols-2 gap-4 text-xs text-gray-600 mb-6">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Live tactical analysis</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Momentum tracking</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>AI predictions updates</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Key moments alerts</span>
                  </div>
                </div>
                <Button 
                  onClick={() => alert('Premium upgrade modal')}
                  className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-medium"
                >
                  <Crown className="w-4 h-4 mr-2" />
                  Upgrade for Live Updates
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}