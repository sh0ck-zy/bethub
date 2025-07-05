'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  BarChart3, 
  TrendingUp, 
  Lock, 
  Crown,
  CheckCircle,
  AlertTriangle,
  Trophy,
  Target
} from 'lucide-react';

interface AnalysisTabsProps {
  matchId: string;
  isAuthenticated: boolean;
}

export function AnalysisTabs({ matchId, isAuthenticated }: AnalysisTabsProps) {
  const [activeTab, setActiveTab] = useState('analysis');

  // Free tier insights (limited)
  const freeInsights = [
    "Van Dijk ruled out - Liverpool concede 40% more without him",
    "Arsenal scored first in 4 of last 5 home games vs Liverpool",
    "Both teams average 3.2 goals in recent head-to-head matches"
  ];

  // Mock premium data (full analysis)
  const tacticalData = {
    homeTeam: {
      formation: '4-3-3',
      style: 'Possession-Based with High Press',
      strengths: ['Build-up Through Center', 'Counter-Pressing', 'Final Third Movement'],
      weaknesses: ['Vulnerable to Counter-Attacks', 'Over-Reliance on Full-backs', 'Set-piece Defense'],
      keyPlayers: [
        { name: 'Bruno Fernandes', role: 'Playmaker', impact: 'Essential link between midfield and attack' },
        { name: 'Rashford', role: 'Finisher', impact: 'Speed and finishing in transitions' }
      ]
    },
    awayTeam: {
      formation: '4-4-2',
      style: 'Quick Transitions with Defensive Block',
      strengths: ['Defensive Organization', 'Clinical Finishing', 'Aerial Dominance'],
      weaknesses: ['Ball Retention', 'Creating Under Pressure', 'Squad Depth'],
      keyPlayers: [
        { name: 'Salah', role: 'Winger', impact: 'Game-changer with pace and technique' },
        { name: 'Van Dijk', role: 'Defensive Leader', impact: 'Organization and ball distribution' }
      ]
    }
  };

  const h2hData = {
    lastMatches: [
      { date: 'Mar 2024', result: '2-1', homeGoals: 2, awayGoals: 1 },
      { date: 'Out 2023', result: '0-3', homeGoals: 0, awayGoals: 3 },
      { date: 'Abr 2023', result: '1-1', homeGoals: 1, awayGoals: 1 },
      { date: 'Ago 2022', result: '2-0', homeGoals: 2, awayGoals: 0 },
      { date: 'Mar 2022', result: '1-4', homeGoals: 1, awayGoals: 4 }
    ],
    patterns: [
      'Home team scores first in 60% of encounters',
      'Average of 2.8 goals per game in last 5 meetings',
      'Less than 3 yellow cards in 80% of matches',
      '3 of last 5 games had over 2.5 goals'
    ]
  };

  // Historical averages data (based on last 10 league games)
  const teamAverages = {
    form: {
      home: [
        { result: 'W', score: '2-1', opponent: 'Liverpool', date: '2024-06-10' },
        { result: 'W', score: '3-0', opponent: 'Chelsea', date: '2024-06-03' },
        { result: 'D', score: '1-1', opponent: 'Arsenal', date: '2024-05-28' },
        { result: 'L', score: '0-2', opponent: 'Man City', date: '2024-05-21' },
        { result: 'W', score: '2-0', opponent: 'Tottenham', date: '2024-05-15' },
        { result: 'W', score: '1-0', opponent: 'Brighton', date: '2024-05-08' },
        { result: 'D', score: '2-2', opponent: 'Newcastle', date: '2024-05-01' }
      ],
      away: [
        { result: 'L', score: '1-3', opponent: 'Real Madrid', date: '2024-06-12' },
        { result: 'W', score: '2-1', opponent: 'Barcelona', date: '2024-06-05' },
        { result: 'W', score: '1-0', opponent: 'Atletico', date: '2024-05-29' },
        { result: 'D', score: '0-0', opponent: 'Sevilla', date: '2024-05-22' },
        { result: 'L', score: '1-2', opponent: 'Valencia', date: '2024-05-16' },
        { result: 'W', score: '3-1', opponent: 'Villarreal', date: '2024-05-09' },
        { result: 'W', score: '2-0', opponent: 'Real Sociedad', date: '2024-05-02' }
      ]
    },
    possession: {
      home: 61.2,
      away: 54.8
    },
    shots: {
      home: { total: 13.4, onTarget: 4.8 },
      away: { total: 11.6, onTarget: 4.2 }
    },
    attacks: {
      home: 42.3,
      away: 38.7
    },
    discipline: {
      home: { yellow: 1.8, red: 0.1 },
      away: { yellow: 2.2, red: 0.2 }
    },
    fouls: {
      home: 11.4,
      away: 13.1
    },
    corners: {
      home: 5.7,
      away: 4.9
    },
    passAccuracy: {
      home: 87.3,
      away: 82.6
    },
    goals: {
      home: { scored: 1.8, conceded: 1.1, cleanSheets: 40 },
      away: { scored: 1.6, conceded: 1.3, cleanSheets: 30 }
    }
  };

  const oddsData = [
    {
      bookmaker: 'Betclic',
      homeWin: 2.10,
      draw: 3.40,
      awayWin: 3.80,
      over25: 1.85,
      btts: 1.90
    },
    {
      bookmaker: 'Bwin',
      homeWin: 2.05,
      draw: 3.50,
      awayWin: 3.75,
      over25: 1.80,
      btts: 1.95
    },
    {
      bookmaker: 'ESC Online',
      homeWin: 2.15,
      draw: 3.30,
      awayWin: 3.85,
      over25: 1.88,
      btts: 1.87
    }
  ];

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-gray-800/50 border border-white/10 rounded-lg p-1">
          <TabsTrigger 
            value="analysis"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-blue-600 data-[state=active]:text-white font-medium transition-all duration-200"
          >
            <Brain className="w-4 h-4 mr-2" />
            AI Analysis
          </TabsTrigger>
          <TabsTrigger 
            value="stats"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-blue-600 data-[state=active]:text-white font-medium transition-all duration-200"
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Statistics
          </TabsTrigger>
        </TabsList>

        {/* AI Analysis Tab */}
        <TabsContent value="analysis" className="space-y-6 mt-6">
          
          {/* Free Insights */}
          <Card className="border-white/10 bg-gray-900/50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Brain className="w-5 h-5 text-green-400" />
                <span>Key Insights</span>
                <Badge className="bg-green-500/20 text-green-400 border border-green-500/30 text-xs">
                  Free
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {freeInsights.map((insight, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-300">{insight}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Premium Upsell */}
          {!isAuthenticated && (
            <Card className="border-white/10 bg-gray-900/50">
              <CardContent className="p-6 text-center space-y-4">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg mx-auto flex items-center justify-center">
                  <Lock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">Unlock Advanced AI Analysis</h3>
                  <p className="text-gray-400 text-sm mb-4">
                    Get tactical breakdowns, player analysis, hidden patterns, and confidence scores
                  </p>
                  <div className="flex items-center justify-center gap-4 text-xs text-gray-500 mb-4">
                    <span>• Tactical formations & weaknesses</span>
                    <span>• Player impact analysis</span>
                    <span>• Historical patterns</span>
                  </div>
                </div>
                <Button 
                  className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-medium"
                >
                  <Crown className="w-4 h-4 mr-2" />
                  Upgrade to Premium • €9.99/month
                </Button>
              </CardContent>
            </Card>
          )}
          
          {/* Premium Content Preview (for authenticated users) */}
          {isAuthenticated && (
            <div className="space-y-4">
              <Card className="border-white/10 bg-gray-900/50">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="w-5 h-5 text-blue-400" />
                    <span>Tactical Analysis</span>
                    <Badge className="bg-blue-500/20 text-blue-400 border border-blue-500/30 text-xs">
                      Premium
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-white mb-2">Arsenal (Home)</h4>
                      <div className="space-y-2 text-sm">
                        <div><span className="text-gray-400">Formation:</span> <span className="text-white">4-3-3</span></div>
                        <div><span className="text-gray-400">Style:</span> <span className="text-white">High press, possession-based</span></div>
                        <div className="flex items-center gap-1">
                          <CheckCircle className="w-3 h-3 text-green-400" />
                          <span className="text-gray-300">Strong set-piece delivery</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 text-orange-400" />
                          <span className="text-gray-300">Vulnerable on counter-attacks</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-white mb-2">Liverpool (Away)</h4>
                      <div className="space-y-2 text-sm">
                        <div><span className="text-gray-400">Formation:</span> <span className="text-white">4-2-3-1</span></div>
                        <div><span className="text-gray-400">Style:</span> <span className="text-white">Quick transitions, direct</span></div>
                        <div className="flex items-center gap-1">
                          <CheckCircle className="w-3 h-3 text-green-400" />
                          <span className="text-gray-300">Pace on the wings</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 text-orange-400" />
                          <span className="text-gray-300">Missing key defender</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-white/10 bg-gray-900/50">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Trophy className="w-5 h-5 text-purple-400" />
                    <span>Head-to-Head Patterns</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Last 5 meetings:</span>
                      <span className="text-white font-mono">W-L-D-W-L</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Average goals:</span>
                      <span className="text-white">3.2 per game</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Home team scores first:</span>
                      <span className="text-white">80% of time</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Statistics Tab */}
        <TabsContent value="stats" className="space-y-6 mt-6">
          
          {/* Basic Stats (Free) */}
          <Card className="border-white/10 bg-gray-900/50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5 text-blue-400" />
                <span>Team Statistics</span>
                <Badge className="bg-green-500/20 text-green-400 border border-green-500/30 text-xs">
                  Free
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-white mb-3">Arsenal (Home)</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Goals scored (avg):</span>
                      <span className="text-white">1.8</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Goals conceded (avg):</span>
                      <span className="text-white">1.1</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Recent form:</span>
                      <span className="text-white font-mono">WWDLW</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-white mb-3">Liverpool (Away)</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Goals scored (avg):</span>
                      <span className="text-white">1.6</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Goals conceded (avg):</span>
                      <span className="text-white">1.3</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Recent form:</span>
                      <span className="text-white font-mono">LWWDW</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Premium Upsell */}
          {!isAuthenticated && (
            <Card className="border-white/10 bg-gray-900/50">
              <CardContent className="p-6 text-center space-y-4">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg mx-auto flex items-center justify-center">
                  <Lock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">Unlock Advanced Statistics</h3>
                  <p className="text-gray-400 text-sm mb-4">
                    Get detailed possession stats, shot accuracy, passing patterns, and much more
                  </p>
                </div>
                <Button 
                  className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-medium"
                >
                  <Crown className="w-4 h-4 mr-2" />
                  Upgrade to Premium • €9.99/month
                </Button>
              </CardContent>
            </Card>
          )}
          
          {/* Premium Stats (for authenticated users) */}
          {isAuthenticated && (
            <div className="space-y-4">
              <Card className="border-white/10 bg-gray-900/50">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="w-5 h-5 text-orange-400" />
                    <span>Advanced Metrics</span>
                    <Badge className="bg-blue-500/20 text-blue-400 border border-blue-500/30 text-xs">
                      Premium
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-white mb-3">Possession & Passing</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Avg possession:</span>
                          <span className="text-white">61% vs 55%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Pass accuracy:</span>
                          <span className="text-white">87% vs 83%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Key passes:</span>
                          <span className="text-white">12.4 vs 9.8</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-white mb-3">Attacking & Defending</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Shots per game:</span>
                          <span className="text-white">13.4 vs 11.6</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">On target:</span>
                          <span className="text-white">4.8 vs 4.2</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Clean sheets:</span>
                          <span className="text-white">40% vs 30%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}