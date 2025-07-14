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
          confidence: 78,
          scoreline: "2-1 to Real Madrid",
          reasoning: "Real's experience and home advantage, combined with Vinícius' form and Barcelona's away struggles, should see the hosts edge a tight Clásico."
        },
        
        weatherImpact: "Perfect conditions for technical football - both teams can play their preferred style"
      },
      
      premiumAnalysis: {
        extendedTactical: {
          defensiveSetups: [
            "Real's 4-3-3 becomes 4-5-1 defensively, with Valverde dropping to help midfield",
            "Barcelona's 4-2-3-1 presses high but leaves gaps for counter-attacks"
          ],
          attackingPatterns: [
            "Real's right-sided attacks: Carvajal + Valverde + Vinícius creating overloads",
            "Barcelona's left channel: Alba + Pedri + Lewandowski triangle"
          ],
          setpieceAnalysis: "Real's corners target the near post where Barcelona are vulnerable - 68% conversion rate"
        },
        
        injuryImpact: {
          missing: [
            {
              player: "Robert Lewandowski",
              team: "Barcelona",
              tacticalChange: "Barcelona lose their focal point - more reliance on wide play",
              replacementQuality: "Ferran Torres lacks Lewandowski's aerial threat and finishing"
            }
          ]
        },
        
        refereeAnalysis: {
          referee: "Mateu Lahoz",
          avgCards: 5.8,
          tendencies: ["Strict on dissent", "Allows physical play", "Consistent with VAR"],
          impact: "High card count expected - benefits Real's physical midfield"
        },
        
        contextAnalysis: {
          leaguePosition: "Real comfortable in 2nd, Barcelona fighting for title - more pressure on visitors",
          recentForm: "Real won 6 of last 7, Barcelona lost 2 of last 5 - momentum clearly with hosts",
          motivation: ["Real: Maintain dominance", "Barcelona: Prove they're back"],
          pressure: "More on Barcelona - need points to stay in title race"
        }
      }
    },
    
    '3': { // Juventus vs AC Milan
      headline: "Milan's Attack Meets Juventus' Defensive Wall",
      confidence: 79,
      
      freeAnalysis: {
        tacticalBreakdown: {
          title: "Contrasting Styles in Serie A Showdown",
          formation: "Juventus' 3-5-2 vs Milan's 4-2-3-1",
          keyInsight: "Juventus' defensive solidity vs Milan's attacking flair - classic Italian tactical battle",
          explanation: "Juventus will look to absorb pressure and counter, while Milan need to break down the organized defense"
        },
        
        dataInsights: [
          {
            icon: <TrendingUp className="w-4 h-4 text-green-500" />,
            stat: "AC Milan: Scored in 12 consecutive Serie A matches",
            context: "Attacking form is excellent - they'll create chances"
        },
        {
            icon: <Shield className="w-4 h-4 text-blue-500" />,
            stat: "Juventus: Only 0.8 goals conceded per game at home",
            context: "Defensive fortress - very hard to break down"
          },
          {
            icon: <Target className="w-4 h-4 text-purple-500" />,
            stat: "Head-to-head: 6 of last 8 meetings had under 2.5 goals",
            context: "Tight, low-scoring encounters are the norm"
          },
          {
            icon: <Users className="w-4 h-4 text-orange-500" />,
            stat: "Leão: 3 goals in last 4 games vs Juventus",
            context: "Milan's key man has good record against this opponent"
          }
        ],
        
        keyBattles: [
          {
            title: "Leão vs Danilo",
            advantage: "Milan",
            explanation: "Leão's pace and dribbling against Danilo's experience. This battle could decide the game."
        },
        {
            title: "Vlahović vs Tomori",
            advantage: "Even",
            explanation: "Two quality players in their prime. Vlahović's movement vs Tomori's reading of the game."
          },
          {
            title: "Milan's Midfield vs Juventus' Organization",
            advantage: "Juventus",
            explanation: "Juventus' 3-5-2 gives them numerical advantage in midfield, making it hard for Milan to control possession."
          }
        ],
        
        prediction: {
          outcome: "Draw",
          confidence: 65,
          scoreline: "1-1",
          reasoning: "Milan's attacking form vs Juventus' defensive solidity suggests a balanced encounter. Both teams have quality but cancel each other out."
        },
        
        weatherImpact: "Cool conditions favor high-intensity football - both teams can maintain their preferred tempo"
      },
      
      premiumAnalysis: {
        extendedTactical: {
          defensiveSetups: [
            "Juventus' 3-5-2 becomes 5-3-2 defensively, with wing-backs dropping deep",
            "Milan's 4-2-3-1 presses high but leaves space for counter-attacks"
          ],
          attackingPatterns: [
            "Juventus' direct play: Long balls to Vlahović and Chiesa",
            "Milan's left channel: Leão + Theo Hernández creating overloads"
          ],
          setpieceAnalysis: "Juventus' corners target the far post where Milan are weak - 62% conversion rate"
        },
        
        injuryImpact: {
          missing: [
            {
              player: "Federico Chiesa",
              team: "Juventus",
              tacticalChange: "Juventus lose their main counter-attacking threat",
              replacementQuality: "Significant downgrade - Di María lacks Chiesa's pace and directness"
            }
          ]
        },
        
        refereeAnalysis: {
          referee: "Marco Guida",
          avgCards: 4.1,
          tendencies: ["Allows physical play", "Consistent with VAR", "Quick to book dissent"],
          impact: "Benefits Juventus' physical style - won't penalize aggressive defending"
        },
        
        contextAnalysis: {
          leaguePosition: "Both teams fighting for Champions League spots - high stakes",
          recentForm: "Juventus won 4 of last 5, Milan won 3 of last 5 - both in good form",
          motivation: ["Juventus: Return to elite", "Milan: Defend title credentials"],
          pressure: "Equal pressure - both need points for top-4"
        }
      }
    }
  };

  return analysisDatabase[matchId as keyof typeof analysisDatabase] || {
    headline: "Tactical Battle Expected Between Evenly Matched Sides",
    confidence: 75,
    freeAnalysis: {
      tacticalBreakdown: {
        title: "Balanced Encounter Expected",
        formation: "4-3-3 vs 4-3-3",
        keyInsight: "Both teams prefer possession-based football with quick transitions",
        explanation: "The team that can control midfield and create clear chances will likely prevail"
      },
      dataInsights: [
        {
          icon: <Users className="w-4 h-4 text-blue-500" />,
          stat: "Both teams average 55% possession",
          context: "Similar playing styles should lead to an even contest"
        }
      ],
      keyBattles: [
        {
          title: "Midfield Control",
          advantage: "Even",
          explanation: "Both teams have quality midfielders - this battle will be crucial."
        }
      ],
      prediction: {
        outcome: "Draw",
        confidence: 60,
        scoreline: "1-1",
        reasoning: "Evenly matched teams with similar styles suggest a balanced encounter."
      },
      weatherImpact: "Good conditions for technical football"
    },
    premiumAnalysis: {
      extendedTactical: {
        defensiveSetups: ["Standard defensive setups for both teams"],
        attackingPatterns: ["Both teams prefer possession-based attacks"],
        setpieceAnalysis: "Standard set-piece routines"
      },
      injuryImpact: { missing: [] },
      refereeAnalysis: {
        referee: "Standard referee",
        avgCards: 3.5,
        tendencies: ["Standard officiating"],
        impact: "No significant impact"
      },
      contextAnalysis: {
        leaguePosition: "Both teams in mid-table",
        recentForm: "Similar recent form",
        motivation: ["Both teams looking to improve"],
        pressure: "Equal pressure on both teams"
      }
    }
  };
};

// Usage tracking for free tier
const usageTracker = {
  getUsageToday: () => {
    const today = new Date().toDateString();
    const stored = localStorage.getItem(`analysis-usage-${today}`);
    return stored ? parseInt(stored) : 0;
  },
  
  incrementUsage: () => {
    const today = new Date().toDateString();
    const current = usageTracker.getUsageToday();
    localStorage.setItem(`analysis-usage-${today}`, (current + 1).toString());
  },
  
  hasUsageLeft: () => {
    return usageTracker.getUsageToday() < 3;
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
                <h3 className="text-xl font-bold mb-2 text-foreground">AI Tactical Analysis</h3>
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
                <h3 className="text-xl font-bold mb-2 text-foreground">Daily Limit Reached</h3>
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
                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                      Free Analyses Today: {usageCount}/3
                    </span>
                    <Badge variant="outline" className="text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700">
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
                    <Badge variant="outline" className="bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700">
                      {analysis.confidence}% Confidence
              </Badge>
            </div>
                  <h2 className="text-2xl font-bold mb-2 text-foreground">{analysis.headline}</h2>
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
                    <h4 className="font-semibold text-lg mb-2 text-foreground">{analysis.freeAnalysis.tacticalBreakdown.title}</h4>
                    <p className="text-sm text-muted-foreground mb-3">{analysis.freeAnalysis.tacticalBreakdown.formation}</p>
                    <p className="font-medium mb-2 text-foreground">{analysis.freeAnalysis.tacticalBreakdown.keyInsight}</p>
                    <p className="text-sm text-muted-foreground">{analysis.freeAnalysis.tacticalBreakdown.explanation}</p>
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
                        <p className="font-medium text-sm mb-1 text-foreground">{insight.stat}</p>
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
                    <div key={index} className="border border-border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-foreground">{battle.title}</h4>
                        <Badge variant={battle.advantage === "Even" ? "secondary" : "default"}>
                          {battle.advantage}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{battle.explanation}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
              
              {/* Prediction */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Trophy className="w-5 h-5" />
                    <span>AI Prediction</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-gradient-to-r from-primary/5 to-purple-500/5 rounded-lg p-4 border border-primary/20">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-bold text-lg text-foreground">{analysis.freeAnalysis.prediction.outcome}</h4>
                      <Badge className="bg-primary text-primary-foreground">
                        {analysis.freeAnalysis.prediction.confidence}% confidence
                      </Badge>
                    </div>
                    <p className="text-lg font-semibold text-primary mb-2">{analysis.freeAnalysis.prediction.scoreline}</p>
                    <p className="text-sm text-muted-foreground">{analysis.freeAnalysis.prediction.reasoning}</p>
                  </div>
                  
                  <div className="bg-muted/30 rounded-lg p-3">
                    <h5 className="font-medium text-sm mb-1 text-foreground">Weather Impact</h5>
                    <p className="text-xs text-muted-foreground">{analysis.freeAnalysis.weatherImpact}</p>
                  </div>
                </CardContent>
              </Card>
              
              {/* Premium Upgrade CTA */}
              {!finalIsPremium && (
                <Card className="border-yellow-200 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20">
                  <CardContent className="p-6 text-center">
                    <div className="flex items-center justify-center space-x-2 mb-3">
                      <Crown className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                      <span className="text-sm font-semibold text-foreground">Get Premium for 2x More Insights</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      Extended tactical analysis, injury impact, referee analysis, and context breakdown.
                    </p>
                    <Button className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white">
                      <Crown className="w-4 h-4 mr-2" />
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5" />
                <span>Match Statistics</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Possession */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-foreground">Possession</span>
                  <span className="text-muted-foreground">{quickStats.possession.home}% - {quickStats.possession.away}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full" 
                    style={{ width: `${quickStats.possession.home}%` }}
                  ></div>
                </div>
              </div>
              
              {/* Shots per Game */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-foreground">Shots per Game</span>
                  <span className="text-muted-foreground">{quickStats.shotsPerGame.home} - {quickStats.shotsPerGame.away}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full" 
                    style={{ width: `${(quickStats.shotsPerGame.home / 20) * 100}%` }}
                  ></div>
                </div>
              </div>
              
              {/* Goals per Game */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-foreground">Goals per Game</span>
                  <span className="text-muted-foreground">{quickStats.goalsPerGame.home} - {quickStats.goalsPerGame.away}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-purple-500 h-2 rounded-full" 
                    style={{ width: `${(quickStats.goalsPerGame.home / 3) * 100}%` }}
                  ></div>
                </div>
              </div>
              
              {/* Recent Form */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-muted/30 rounded-lg">
                  <h4 className="font-semibold text-sm mb-1 text-foreground">Home Form</h4>
                  <p className="text-lg font-mono text-green-600 dark:text-green-400">{quickStats.recentForm.home}</p>
                </div>
                <div className="text-center p-3 bg-muted/30 rounded-lg">
                  <h4 className="font-semibold text-sm mb-1 text-foreground">Away Form</h4>
                  <p className="text-lg font-mono text-red-600 dark:text-red-400">{quickStats.recentForm.away}</p>
                </div>
              </div>
              
              {/* Head to Head */}
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <h4 className="font-semibold text-sm mb-2 text-foreground">Head to Head</h4>
                <p className="text-muted-foreground">{quickStats.headToHead}</p>
                <p className="text-sm text-muted-foreground mt-1">Average: {quickStats.avgGoals} goals per game</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Head to Head Tab */}
        <TabsContent value="h2h" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="w-5 h-5" />
                <span>Recent Meetings</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Recent Results */}
              <div className="space-y-3">
                <h4 className="font-semibold text-foreground">Last 5 Meetings</h4>
                {[
                  { date: '2024-01-15', home: '2', away: '1', venue: 'Home' },
                  { date: '2023-08-20', home: '0', away: '2', venue: 'Away' },
                  { date: '2023-03-10', home: '1', away: '1', venue: 'Home' },
                  { date: '2022-11-05', home: '3', away: '0', venue: 'Away' },
                  { date: '2022-04-15', home: '2', away: '2', venue: 'Home' }
                ].map((match, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <span className="text-sm text-muted-foreground">{new Date(match.date).toLocaleDateString()}</span>
                    <div className="flex items-center space-x-3">
                      <span className="font-semibold text-foreground">{match.home}</span>
                      <span className="text-muted-foreground">-</span>
                      <span className="font-semibold text-foreground">{match.away}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {match.venue}
                    </Badge>
                  </div>
                ))}
              </div>
              
              {/* Key Stats */}
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="text-center p-3 bg-muted/30 rounded-lg">
                  <h5 className="font-semibold text-sm mb-1 text-foreground">Home Wins</h5>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">3</p>
                </div>
                <div className="text-center p-3 bg-muted/30 rounded-lg">
                  <h5 className="font-semibold text-sm mb-1 text-foreground">Away Wins</h5>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">1</p>
                </div>
                <div className="text-center p-3 bg-muted/30 rounded-lg">
                  <h5 className="font-semibold text-sm mb-1 text-foreground">Draws</h5>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">1</p>
                </div>
                <div className="text-center p-3 bg-muted/30 rounded-lg">
                  <h5 className="font-semibold text-sm mb-1 text-foreground">Avg Goals</h5>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">2.8</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}