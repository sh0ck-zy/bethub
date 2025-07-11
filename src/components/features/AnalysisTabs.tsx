// Enhanced AnalysisTabs.tsx - Complete Free Tier AI Analysis
// Implements research findings: exceptional free experience, Portuguese market focus

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
  Eye,
  Shield,
  Swords,
  Timer,
  Star
} from 'lucide-react';

interface AnalysisTabsProps {
  matchId: string;
  isAuthenticated: boolean;
}

// Enhanced AI Analysis - "Expert Teammate" Voice
const generateCompleteAnalysis = (matchId: string) => {
  const analysisDatabase = {
    '1': { // Man United vs Liverpool - Portuguese user would relate to Bruno Fernandes
      headline: "Van Dijk's Absence Transforms This Into United's Game",
      confidence: 87,
      
      // FREE TIER - Complete Analysis (Research: generous free experience)
      freeAnalysis: {
        tacticalBreakdown: {
          title: "Tactical Mismatch Favors United",
          formation: "United's 4-2-3-1 vs Liverpool's 4-3-3",
          keyInsight: "Without Van Dijk, Liverpool's high line becomes vulnerable to Rashford's pace behind",
          explanation: "Bruno Fernandes can exploit the space between Liverpool's midfield and makeshift defense with his killer through balls"
        },
        
        dataInsights: [
          {
          icon: <AlertTriangle className="w-4 h-4 text-orange-500" />,
            stat: "Liverpool concede 1.8 goals per game without Van Dijk vs 1.1 with him",
            context: "40% defensive drop without their leader - this is United's biggest advantage"
        },
        {
          icon: <TrendingUp className="w-4 h-4 text-green-500" />,
            stat: "Rashford: 5 goals in 3 games vs Liverpool at Old Trafford",
            context: "All from counter-attacks - exactly how United will play today"
        },
        {
          icon: <Users className="w-4 h-4 text-blue-500" />,
            stat: "United: 4 wins in last 6 vs top-6 teams at home",
            context: "Old Trafford crowd creates the intensity Liverpool will struggle to match"
          },
          {
            icon: <Target className="w-4 h-4 text-purple-500" />,
            stat: "Set-pieces: Liverpool conceded 3 corner goals this month",
            context: "Bruno's delivery vs weakened aerial defense - major opportunity"
          }
        ],
        
        keyBattles: [
          {
            title: "Bruno Fernandes vs Liverpool's Midfield",
            advantage: "United",
            explanation: "With Van Dijk absent, Bruno has more space to pick his passes. Liverpool's midfield will have to drop deeper, giving United's captain the freedom he needs."
          },
          {
            title: "Rashford vs Makeshift Defense",
            advantage: "United", 
            explanation: "Liverpool's CB partnership lacks Van Dijk's pace. Rashford's direct running at Matip/Gomez could be decisive."
          },
          {
            title: "Liverpool's Press vs United's Counter",
            advantage: "Even",
            explanation: "Liverpool need to press to create chances, but this leaves space for United's rapid transitions. First to execute their plan wins."
          }
        ],
        
        prediction: {
          outcome: "United Win",
          confidence: 67,
          scoreline: "2-1 to United",
          reasoning: "Van Dijk's absence removes Liverpool's defensive anchor. United's counter-attacking threat at Old Trafford, led by Bruno and Rashford, should prove decisive against Liverpool's weakened backline."
        },
        
        weatherImpact: "Clear conditions favor United's direct style over Liverpool's intricate passing"
      },
      
      // PREMIUM TIER - Enhanced Depth (Research: 2x more insights)
      premiumAnalysis: {
        extendedTactical: {
          defensiveSetups: [
            "United's mid-block designed to funnel Liverpool wide where they're less dangerous",
            "Liverpool's 4-3-3 becomes 4-5-1 defensively, but gaps appear without Van Dijk organizing"
          ],
          attackingPatterns: [
            "United's left-sided overloads: Shaw + Rashford + Bruno creating 3v2 situations",
            "Liverpool rely on Salah isolation plays, but need quick service without Van Dijk's long passing"
          ],
          setpieceAnalysis: "United's corners target the penalty spot where Van Dijk usually dominates - 73% conversion opportunity increase"
        },
        
        injuryImpact: {
          missing: [
            {
              player: "Virgil van Dijk",
              team: "Liverpool",
              tacticalChange: "Liverpool drop their defensive line 8 yards deeper, reducing their press intensity by 15%",
              replacementQuality: "Significant downgrade - Matip lacks Van Dijk's pace and leadership"
            }
          ]
        },
        
        refereeAnalysis: {
          referee: "Michael Oliver",
          avgCards: 4.2,
          tendencies: ["Allows physical duels", "Quick to book dissent", "Consistent with VAR calls"],
          impact: "Benefits United's direct style - won't penalize Bruno's aggressive pressing"
        },
        
        contextAnalysis: {
          leaguePosition: "United need points for top-4, Liverpool fighting for Europe - desperation levels even",
          recentForm: "United won 4 of last 5 at home, Liverpool lost 2 of last 4 away - momentum favors United",
          motivation: ["United: Prove they belong with the elite", "Liverpool: Salvage disappointing season"],
          pressure: "More on Liverpool - expected to dominate but weakened by injuries"
        }
      }
    },
    
    '2': { // Real Madrid vs Barcelona - El Clasico
      headline: "Bernabéu Fortress Meets Barcelona's Desperation",
      confidence: 82,
      
      freeAnalysis: {
        tacticalBreakdown: {
          title: "Experience vs Youth in El Clásico",
          formation: "Real's 4-3-3 vs Barca's 4-2-3-1", 
          keyInsight: "Modric and Kroos' experience will control tempo against Pedri and Gavi's energy",
          explanation: "Real's deeper midfield allows quicker transitions, while Barca's high press could tire in final 30 minutes"
        },
        
        dataInsights: [
          {
            icon: <Users className="w-4 h-4 text-blue-500" />,
            stat: "Real Madrid: 65% win rate vs Barcelona at Bernabéu (last 10 years)",
            context: "Home advantage is real in Clásicos - crowd becomes the 12th man"
        },
        {
            icon: <TrendingUp className="w-4 h-4 text-green-500" />,
            stat: "Vinícius Jr: 4 goals in last 3 Clásicos",
            context: "His pace vs aging Piqué could be the difference maker"
          },
          {
            icon: <Target className="w-4 h-4 text-purple-500" />,
            stat: "Barcelona: 71% possession average away from home",
            context: "But struggle to create clear chances - possession without penetration"
          },
          {
            icon: <Shield className="w-4 h-4 text-orange-500" />,
            stat: "Real's defense: Only 0.8 goals conceded per game at Bernabéu",
            context: "Alaba and Militão partnership proving rock solid at home"
          }
        ],
        
        keyBattles: [
          {
            title: "Vinícius Jr vs Dest/Sergi Roberto",
            advantage: "Real Madrid",
            explanation: "Vinícius' pace and direct running against Barcelona's makeshift right defense could create multiple chances."
        },
        {
            title: "Modric vs Pedri - Midfield Mastery",
            advantage: "Even",
            explanation: "Old master vs young apprentice. Modric's experience vs Pedri's fresh legs - whoever controls the tempo wins."
          },
          {
            title: "Benzema vs Piqué/Araújo",
            advantage: "Real Madrid",
            explanation: "Benzema's movement and link-up play perfect for exploiting space behind Barcelona's high line."
          }
        ],
        
        prediction: {
          outcome: "Real Madrid Win", 
          confidence: 68,
          scoreline: "2-1 to Real Madrid",
          reasoning: "Bernabéu advantage plus Real's experience in big moments should edge this. Barcelona need perfection; Real just need to be Real Madrid."
        },
        
        weatherImpact: "Perfect conditions for technical football - no advantage either way"
      },
      
      premiumAnalysis: {
        // Enhanced analysis for premium users (2x more depth)
        historicalPatterns: [
          "Last 5 Clásicos at Bernabéu: 3 Real wins, 1 draw, 1 Barca win",
          "When Real score first at home vs Barca: 89% win rate since 2015"
        ],
        psychologicalFactors: [
          "Real relaxed with La Liga won, could be dangerous or complacent",
          "Barca desperate for statement win - creates pressure and opportunity"
        ]
      }
    },
    
    // Portuguese League Example - Liga Portugal
    'benfica_porto': {
      headline: "O Clássico: Benfica's Momentum vs Porto's Fortress",
      confidence: 79,
      
      freeAnalysis: {
        tacticalBreakdown: {
          title: "Dragão Fortress Under Siege",
          formation: "Porto's 4-4-2 vs Benfica's 4-3-3",
          keyInsight: "Porto's compact shape at Estádio do Dragão meets Benfica's attacking fluidity",
          explanation: "Rafa Silva's pace down the flanks could stretch Porto's disciplined defensive block"
        },
        
        dataInsights: [
          {
            icon: <Users className="w-4 h-4 text-blue-500" />,
            stat: "Porto: 78% win rate at Estádio do Dragão this season",
            context: "The Dragão crowd creates an intimidating atmosphere Benfica must overcome"
          },
          {
            icon: <TrendingUp className="w-4 h-4 text-green-500" />,
            stat: "Benfica: 12 goals in last 4 away games", 
            context: "Their attacking momentum could break Porto's defensive resolve"
          },
          {
            icon: <Swords className="w-4 h-4 text-red-500" />,
            stat: "Head-to-head: 3-2 to Porto in last 5 meetings",
            context: "Tight margins in O Clássico - individual moments decide these games"
          }
        ],
        
        keyBattles: [
          {
            title: "Rafa Silva vs Zaidu Sanusi",
            advantage: "Benfica", 
            explanation: "Rafa's dribbling and pace could expose Zaidu's occasional defensive lapses."
          },
          {
            title: "Pepe vs Darwin Núñez",
            advantage: "Porto",
            explanation: "Veteran experience vs raw talent - Pepe's positioning could neutralize Darwin's movement."
          }
        ],
        
        prediction: {
          outcome: "Draw",
          confidence: 71,
          scoreline: "1-1", 
          reasoning: "O Clássico rarely disappoints but often ends level. Both teams too well-organized to concede many chances."
        }
      }
    },
    
    // Default analysis for any match
    default: {
      headline: "Tactical Chess Match Awaits",
      confidence: 75,
      
      freeAnalysis: {
        tacticalBreakdown: {
          title: "Home vs Away Philosophies Clash",
          formation: "Tactical battle between contrasting styles",
          keyInsight: "Home team's familiarity with their system vs away team's adaptability",
          explanation: "Set pieces and individual moments of quality likely to decide tight encounter"
        },
        
        dataInsights: [
          {
            icon: <BarChart3 className="w-4 h-4 text-blue-500" />,
            stat: "Home team: 2.1 goals per game average",
            context: "Strong attacking record at home ground"
          },
          {
            icon: <Shield className="w-4 h-4 text-green-500" />,
            stat: "Away team: 1.3 goals conceded per game",
            context: "Solid defensive organization on the road"
          }
        ],
        
        keyBattles: [
          {
            title: "Midfield Control",
            advantage: "Even",
            explanation: "Both teams will look to dominate the middle of the park to dictate tempo."
          }
        ],
        
        prediction: {
          outcome: "Close Contest",
          confidence: 65,
          scoreline: "1-1 or 2-1",
          reasoning: "Evenly matched teams suggest tight affair decided by fine margins."
        }
      }
    }
  };

  return analysisDatabase[matchId as keyof typeof analysisDatabase] || analysisDatabase.default;
};

// Usage tracking (Portuguese users get 3 analyses per day)
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
    return usageTracker.getUsageToday() < 3; // 3 free analyses per day (research finding)
  }
};

export function AnalysisTabs({ matchId, isAuthenticated }: AnalysisTabsProps) {
  const [activeTab, setActiveTab] = useState('insights');
  const [hasViewedAnalysis, setHasViewedAnalysis] = useState(false);
  const [usageCount, setUsageCount] = useState(0);
  
  // Demo role system for testing
  const { isPremium, isAuthenticated: isDemoAuthenticated } = useRoleSelector();
  const finalIsAuthenticated = isDemoAuthenticated || isAuthenticated;
  const finalIsPremium = isPremium;
  
  const analysis = generateCompleteAnalysis(matchId);
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

  // Quick stats for the Statistics tab
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
            <span className="hidden sm:inline">AI Analysis</span>
            <span className="sm:hidden">Analysis</span>
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
            value="h2h"
            className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary font-medium py-3 text-sm"
          >
            <Activity className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Head-to-Head</span>
            <span className="sm:hidden">H2H</span>
          </TabsTrigger>
        </TabsList>

        {/* AI Analysis Tab - The Star of the Show */}
        <TabsContent value="insights" className="space-y-4">
          {!finalIsAuthenticated ? (
            // Not authenticated - Show teaser
            <Card className="border-primary/20">
              <CardContent className="p-6 text-center">
                <Brain className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">AI Tactical Analysis</h3>
                <p className="text-muted-foreground mb-4">
                  Get complete pre-match analysis with tactical breakdowns, key battles, and data-driven insights.
                </p>
                <Button className="w-full">
                  Sign In for Free Analysis
                </Button>
              </CardContent>
            </Card>
          ) : !hasUsageLeft && !finalIsPremium ? (
            // Used up free analyses
            <Card className="border-orange-200">
              <CardContent className="p-6 text-center">
                <Timer className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">Daily Limit Reached</h3>
                <p className="text-muted-foreground mb-4">
                  You've used all 3 free analyses today. Reset in {24 - new Date().getHours()} hours or upgrade for unlimited access.
                </p>
                <Button variant="outline" className="w-full">
                  <Crown className="w-4 h-4 mr-2" />
                  Upgrade to Premium
                </Button>
              </CardContent>
            </Card>
          ) : (
            // Show complete analysis
            <div className="space-y-6">
              {/* Usage indicator for free users */}
              {!finalIsPremium && finalIsAuthenticated && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-blue-700">
                      Free Analyses Today: {usageCount}/3
                    </span>
                    <Badge variant="outline" className="text-blue-700 border-blue-300">
                      {3 - usageCount} remaining
                    </Badge>
                  </div>
                  <Progress value={(usageCount / 3) * 100} className="h-2" />
                </div>
              )}
              
              {/* Main Headline */}
              <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <Brain className="w-6 h-6 text-primary" />
                      <span className="font-semibold text-primary">AI Expert Analysis</span>
                    </div>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                      {analysis.confidence}% Confidence
              </Badge>
            </div>
                  <h2 className="text-2xl font-bold mb-2">{analysis.headline}</h2>
                </CardContent>
              </Card>
              
              {/* Tactical Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Swords className="w-5 h-5" />
                    <span>Tactical Breakdown</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-muted/50 rounded-lg p-4">
                    <h4 className="font-semibold text-lg mb-2">{analysis.freeAnalysis.tacticalBreakdown.title}</h4>
                    <p className="text-sm text-muted-foreground mb-3">{analysis.freeAnalysis.tacticalBreakdown.formation}</p>
                    <p className="font-medium mb-2">{analysis.freeAnalysis.tacticalBreakdown.keyInsight}</p>
                    <p className="text-sm">{analysis.freeAnalysis.tacticalBreakdown.explanation}</p>
                  </div>
                </CardContent>
              </Card>
              
              {/* Data-Driven Insights */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="w-5 h-5" />
                    <span>Key Data Insights</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {analysis.freeAnalysis.dataInsights.map((insight, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-muted/30 rounded-lg">
                      {insight.icon}
                      <div className="flex-1">
                        <p className="font-medium text-sm mb-1">{insight.stat}</p>
                        <p className="text-xs text-muted-foreground">{insight.context}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
              
              {/* Key Battles */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="w-5 h-5" />
                    <span>Key Battles</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {analysis.freeAnalysis.keyBattles.map((battle, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{battle.title}</h4>
                        <Badge variant={battle.advantage === "Even" ? "secondary" : "default"}>
                          {battle.advantage}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{battle.explanation}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
              
              {/* Match Prediction */}
              <Card className="border-green-200 bg-green-50/50">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-green-700">
                    <Trophy className="w-5 h-5" />
                    <span>AI Prediction</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">Outcome:</span>
                      <Badge className="bg-green-600">{analysis.freeAnalysis.prediction.outcome}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">Predicted Score:</span>
                      <span className="font-mono text-lg">{analysis.freeAnalysis.prediction.scoreline}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">Confidence:</span>
                      <span className="font-semibold text-green-600">{analysis.freeAnalysis.prediction.confidence}%</span>
                      </div>
                    <div className="pt-2 border-t">
                      <p className="text-sm">{analysis.freeAnalysis.prediction.reasoning}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Premium Upgrade Prompt */}
              {!finalIsPremium && (
                <Card className="border-primary bg-gradient-to-r from-primary/5 to-purple/5">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <Crown className="w-8 h-8 text-primary" />
                      <div>
                        <h3 className="font-bold text-lg">Want Even Deeper Analysis?</h3>
                        <p className="text-sm text-muted-foreground">Get 2x more tactical insights, injury impact analysis, and referee patterns</p>
                      </div>
                    </div>
                    <div className="space-y-2 mb-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Extended tactical deep-dive with formation analysis</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Detailed injury impact and replacement quality assessment</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Referee analysis and historical patterns</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Unlimited analyses for all matches</span>
                      </div>
                    </div>
                    <Button className="w-full">
                      <Crown className="w-4 h-4 mr-2" />
                      Upgrade to Premium - €4.99/month
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>

        {/* Statistics Tab */}
        <TabsContent value="stats" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Match Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold">{quickStats.possession.home}%</p>
                  <p className="text-sm text-muted-foreground">Home Possession</p>
                    </div>
                <div>
                  <p className="text-lg font-semibold text-muted-foreground">vs</p>
                    </div>
                <div>
                  <p className="text-2xl font-bold">{quickStats.possession.away}%</p>
                  <p className="text-sm text-muted-foreground">Away Possession</p>
                    </div>
                  </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-muted/30 rounded">
                  <p className="text-xl font-bold">{quickStats.shotsPerGame.home}</p>
                  <p className="text-xs">Shots/Game (Home)</p>
                </div>
                <div className="text-center p-3 bg-muted/30 rounded">
                  <p className="text-xl font-bold">{quickStats.shotsPerGame.away}</p>
                  <p className="text-xs">Shots/Game (Away)</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Goals Per Game</span>
                  <div className="flex space-x-4">
                    <span className="font-semibold">{quickStats.goalsPerGame.home}</span>
                    <span className="text-muted-foreground">vs</span>
                    <span className="font-semibold">{quickStats.goalsPerGame.away}</span>
                  </div>
                  </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm">Recent Form (Last 5)</span>
                  <div className="flex space-x-4">
                    <span className="font-mono text-sm">{quickStats.recentForm.home}</span>
                    <span className="text-muted-foreground">vs</span>
                    <span className="font-mono text-sm">{quickStats.recentForm.away}</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm">Head-to-Head</span>
                  <span className="font-semibold text-sm">{quickStats.headToHead}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm">Expected Goals (This Match)</span>
                  <span className="font-semibold">{quickStats.avgGoals}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Premium Stats Teaser */}
          {!finalIsPremium && (
            <Card className="border-dashed border-primary/50 bg-primary/5">
              <CardContent className="p-6 text-center">
                <Lock className="w-8 h-8 text-primary mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Advanced Statistics</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Get detailed form curves, performance predictors, and advanced metrics
                </p>
                <Button variant="outline" size="sm">
                  <Crown className="w-4 h-4 mr-2" />
                  Unlock Premium Stats
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Head-to-Head Tab */}
        <TabsContent value="h2h" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Head-to-Head Record</CardTitle>
            </CardHeader>
                         <CardContent>
                 <div className="space-y-4">
                <div className="text-center p-4 bg-muted/30 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Last 5 Meetings</p>
                  <p className="text-lg font-bold">{quickStats.headToHead}</p>
                       </div>
                
                <div className="space-y-3">
                  <h4 className="font-semibold">Recent Matches</h4>
                  
                  {/* Mock recent matches */}
                  {[
                    { date: "2024-03-15", result: "2-1", venue: "Home" },
                    { date: "2023-11-08", result: "0-2", venue: "Away" },
                    { date: "2023-05-23", result: "3-1", venue: "Home" },
                    { date: "2022-12-10", result: "1-1", venue: "Away" },
                    { date: "2022-08-14", result: "2-0", venue: "Home" }
                  ].map((match, index) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b border-muted">
                      <span className="text-sm text-muted-foreground">{match.date}</span>
                      <span className="font-mono font-semibold">{match.result}</span>
                      <Badge variant={match.venue === "Home" ? "default" : "secondary"} className="text-xs">
                        {match.venue}
                           </Badge>
                     </div>
                   ))}
                 </div>
                
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">Key Patterns</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Home team has won 3 of last 5 meetings</li>
                    <li>• Average goals per game: {quickStats.avgGoals}</li>
                    <li>• Both teams scored in 4 of last 5 matches</li>
                    <li>• No draw in last 5 encounters</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Premium H2H Teaser */}
          {!finalIsPremium && (
            <Card className="border-dashed border-primary/50 bg-primary/5">
              <CardContent className="p-6 text-center">
                <Activity className="w-8 h-8 text-primary mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Deep Historical Analysis</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  10+ years of patterns, seasonal trends, and referee influences
                </p>
                <div className="text-xs text-left space-y-1 mb-4 bg-white/50 p-3 rounded">
                  <p>• Detailed situational stats (when trailing, leading, etc.)</p>
                  <p>• Referee impact analysis and card patterns</p>
                  <p>• Weather and venue-specific performance data</p>
                  <p>• Injury impact on historical results</p>
                </div>
                <Button variant="outline" size="sm">
                  <Crown className="w-4 h-4 mr-2" />
                  Unlock Premium H2H
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}