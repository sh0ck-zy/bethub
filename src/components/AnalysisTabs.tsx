'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { InsightBlock } from './InsightBlock';
import { 
  Brain, 
  BarChart3, 
  TrendingUp, 
  Lock, 
  Target,
  Users,
  Trophy,
  Activity,
  AlertTriangle,
  CheckCircle,
  Star,
  Zap,
  Shield,
  ArrowUpRight,
  ExternalLink,
  Award
} from 'lucide-react';

interface AnalysisTabsProps {
  matchId: string;
  isAuthenticated: boolean;
}

export function AnalysisTabs({ matchId, isAuthenticated }: AnalysisTabsProps) {
  const [activeTab, setActiveTab] = useState('analysis');

  // Mock data for detailed analysis
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
        <TabsList className="grid w-full grid-cols-3 bg-slate-800/50 border border-slate-700 rounded-xl p-1">
          <TabsTrigger 
            value="analysis"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-cyan-600 data-[state=active]:text-white font-semibold transition-all duration-300"
          >
            <Brain className="w-4 h-4 mr-2" />
            AI Analysis
          </TabsTrigger>
          <TabsTrigger 
            value="stats"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-slate-600 data-[state=active]:to-slate-700 data-[state=active]:text-white font-semibold transition-all duration-300"
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Detailed Statistics
          </TabsTrigger>
          <TabsTrigger 
            value="odds"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-emerald-600 data-[state=active]:text-white font-semibold transition-all duration-300"
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Betting Odds
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: ANÁLISE DA IA */}
        <TabsContent value="analysis" className="space-y-6 mt-8">
          
          {/* Análise Tática */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Equipa Casa */}
            <Card className="border-slate-700 bg-slate-900/50 backdrop-blur-sm">
            <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                   <Shield className="w-5 h-5 text-green-400" />
                   <span>Tactical Analysis - Home</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-3">
                      <div>
                    <span className="text-sm text-slate-400">Preferred Formation:</span>
                    <p className="text-white font-semibold">{tacticalData.homeTeam.formation}</p>
                        </div>
                  <div>
                    <span className="text-sm text-slate-400">Playing Style:</span>
                    <p className="text-white font-semibold">{tacticalData.homeTeam.style}</p>
                  </div>
                  
                  <div>
                    <span className="text-sm text-slate-400">Strengths:</span>
                    <ul className="mt-1 space-y-1">
                      {tacticalData.homeTeam.strengths.map((strength, index) => (
                        <li key={index} className="flex items-center space-x-2">
                          <CheckCircle className="w-3 h-3 text-green-400" />
                          <span className="text-sm text-slate-300">{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <span className="text-sm text-slate-400">Weaknesses:</span>
                    <ul className="mt-1 space-y-1">
                      {tacticalData.homeTeam.weaknesses.map((weakness, index) => (
                        <li key={index} className="flex items-center space-x-2">
                          <AlertTriangle className="w-3 h-3 text-orange-400" />
                          <span className="text-sm text-slate-300">{weakness}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
            </CardContent>
          </Card>

            {/* Equipa Fora */}
            <Card className="border-slate-700 bg-slate-900/50 backdrop-blur-sm">
              <CardHeader>
                                 <CardTitle className="flex items-center space-x-2">
                   <Shield className="w-5 h-5 text-blue-400" />
                   <span>Tactical Analysis - Away</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-slate-400">Preferred Formation:</span>
                    <p className="text-white font-semibold">{tacticalData.awayTeam.formation}</p>
                  </div>
                  <div>
                    <span className="text-sm text-slate-400">Playing Style:</span>
                    <p className="text-white font-semibold">{tacticalData.awayTeam.style}</p>
                  </div>
                  
                  <div>
                    <span className="text-sm text-slate-400">Strengths:</span>
                    <ul className="mt-1 space-y-1">
                      {tacticalData.awayTeam.strengths.map((strength, index) => (
                        <li key={index} className="flex items-center space-x-2">
                          <CheckCircle className="w-3 h-3 text-green-400" />
                          <span className="text-sm text-slate-300">{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <span className="text-sm text-slate-400">Weaknesses:</span>
                    <ul className="mt-1 space-y-1">
                      {tacticalData.awayTeam.weaknesses.map((weakness, index) => (
                        <li key={index} className="flex items-center space-x-2">
                          <AlertTriangle className="w-3 h-3 text-orange-400" />
                          <span className="text-sm text-slate-300">{weakness}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Jogadores Chave */}
          <Card className="border-slate-700 bg-slate-900/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Star className="w-5 h-5 text-yellow-400" />
                <span>Key Players & Impact</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-white mb-3">Home Team</h4>
                  <div className="space-y-3">
                    {tacticalData.homeTeam.keyPlayers.map((player, index) => (
                      <div key={index} className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-white">{player.name}</span>
                          <Badge className="bg-green-500/20 text-green-400 border border-green-500/30 text-xs">
                            {player.role}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-300">{player.impact}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-3">Away Team</h4>
                  <div className="space-y-3">
                    {tacticalData.awayTeam.keyPlayers.map((player, index) => (
                      <div key={index} className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-white">{player.name}</span>
                          <Badge className="bg-blue-500/20 text-blue-400 border border-blue-500/30 text-xs">
                            {player.role}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-300">{player.impact}</p>
                      </div>
                    ))}
                  </div>
                  </div>
                </div>
              </CardContent>
            </Card>

          {/* Confronto Direto (H2H) */}
          <Card className="border-slate-700 bg-slate-900/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Trophy className="w-5 h-5 text-purple-400" />
                <span>Head-to-Head - Patterns & Trends</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-white mb-4">Last 5 Encounters</h4>
                  <div className="space-y-2">
                    {h2hData.lastMatches.map((match, index) => (
                      <div key={index} className="flex justify-between items-center p-3 rounded-lg bg-slate-800/50">
                        <span className="text-sm text-slate-400">{match.date}</span>
                        <span className="font-mono text-white font-semibold">{match.result}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-4">AI Identified Patterns</h4>
                  <ul className="space-y-2">
                    {h2hData.patterns.map((pattern, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <Zap className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-slate-300">{pattern}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                  </div>
            </CardContent>
          </Card>

          {/* AI Insights Premium */}
          {isAuthenticated ? (
            <div className="space-y-4">
              <InsightBlock 
                insight={{
                  id: '1',
                  content: "<strong>Duelo Tático:</strong> A pressão alta da equipa casa pode explorar a dificuldade da equipa visitante em sair a jogar sob pressão, especialmente nas zonas laterais onde têm mostrado maior vulnerabilidade.",
                  confidence: 0.87
                }}
              />
              <InsightBlock 
                insight={{
                  id: '2',
                  content: "<strong>Fator Chave:</strong> A ausência do meio-campo defensivo titular da equipa casa pode alterar significativamente o equilíbrio tático, favorecendo as transições rápidas do adversário.",
                  confidence: 0.79
                }}
              />
                  </div>
          ) : (
            <Card className="border-slate-700 bg-slate-900/50">
              <CardContent className="p-8 text-center space-y-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl mx-auto flex items-center justify-center">
                  <Lock className="w-8 h-8 text-white" />
                  </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Advanced AI Analysis</h3>
                  <p className="text-slate-400">Access to detailed tactical insights, player analysis and contextual predictions</p>
                </div>
                <Button 
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white"
                >
                  <Brain className="w-4 h-4 mr-2" />
                  Upgrade to Premium
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* TAB 2: DETAILED STATISTICS */}
        <TabsContent value="stats" className="space-y-6 mt-8">
          
          {/* Section 1: Recent Form */}
          <div>
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-2">Recent Form</h3>
              <p className="text-sm text-slate-400">Performance in last games</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-slate-700 bg-slate-900/50">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Activity className="w-5 h-5 text-green-400" />
                    <span>Home Team</span>
                </CardTitle>
              </CardHeader>
                <CardContent>
                  <div className="flex space-x-2 mb-4">
                    {teamAverages.form.home.map((match, index) => (
                      <div 
                        key={index}
                        title={`${match.score} vs ${match.opponent} (${new Date(match.date).toLocaleDateString()})`}
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold cursor-pointer transition-transform hover:scale-110 ${
                          match.result === 'W' ? 'bg-green-500 text-white' : 
                          match.result === 'D' ? 'bg-yellow-500 text-white' : 
                          'bg-red-500 text-white'
                        }`}
                      >
                        {match.result}
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-slate-400">Last 7 matches (most recent left)</p>
                </CardContent>
              </Card>

              <Card className="border-slate-700 bg-slate-900/50">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Activity className="w-5 h-5 text-blue-400" />
                    <span>Away Team</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex space-x-2 mb-4">
                    {teamAverages.form.away.map((match, index) => (
                      <div 
                        key={index}
                        title={`${match.score} vs ${match.opponent} (${new Date(match.date).toLocaleDateString()})`}
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold cursor-pointer transition-transform hover:scale-110 ${
                          match.result === 'W' ? 'bg-green-500 text-white' : 
                          match.result === 'D' ? 'bg-yellow-500 text-white' : 
                          'bg-red-500 text-white'
                        }`}
                      >
                        {match.result}
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-slate-400">Last 7 matches (most recent left)</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Section 2: Average Per Game Metrics */}
          <div>
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-2">Average Per Game Metrics</h3>
              <p className="text-sm text-slate-400">Data based on team performances over the last 10 league games</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Ball Possession */}
              <Card className="border-slate-700 bg-slate-900/50">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="w-5 h-5 text-blue-400" />
                    <span>Average Ball Possession</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-300">Home Team</span>
                      <span className="text-white font-semibold">{teamAverages.possession.home}%</span>
                    </div>
                    <Progress value={teamAverages.possession.home} className="h-3" />
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-300">Away Team</span>
                      <span className="text-white font-semibold">{teamAverages.possession.away}%</span>
                    </div>
                    <Progress value={teamAverages.possession.away} className="h-3" />
                  </div>
                </CardContent>
              </Card>

              {/* Shots */}
              <Card className="border-slate-700 bg-slate-900/50">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="w-5 h-5 text-orange-400" />
                    <span>Average Shots</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-400">{teamAverages.shots.home.total}</div>
                        <div className="text-xs text-slate-400">Total Shots</div>
                        <div className="text-sm text-green-300">({teamAverages.shots.home.onTarget} on target)</div>
                        <div className="text-xs text-slate-400 mt-1">Home Team</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-blue-400">{teamAverages.shots.away.total}</div>
                        <div className="text-xs text-slate-400">Total Shots</div>
                        <div className="text-sm text-blue-300">({teamAverages.shots.away.onTarget} on target)</div>
                        <div className="text-xs text-slate-400 mt-1">Away Team</div>
                      </div>
                  </div>
                </div>
              </CardContent>
            </Card>

              {/* Pass Accuracy */}
              <Card className="border-slate-700 bg-slate-900/50">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Activity className="w-5 h-5 text-purple-400" />
                    <span>Average Pass Accuracy</span>
                </CardTitle>
              </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-green-400">{teamAverages.passAccuracy.home}%</div>
                      <div className="text-sm text-slate-400">Home Team</div>
                  </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-400">{teamAverages.passAccuracy.away}%</div>
                      <div className="text-sm text-slate-400">Away Team</div>
                  </div>
                </div>
              </CardContent>
            </Card>

              {/* Dangerous Attacks */}
              <Card className="border-slate-700 bg-slate-900/50">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Zap className="w-5 h-5 text-red-400" />
                    <span>Average Dangerous Attacks</span>
                </CardTitle>
              </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-green-400">{teamAverages.attacks.home}</div>
                      <div className="text-sm text-slate-400">Home Team</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-400">{teamAverages.attacks.away}</div>
                      <div className="text-sm text-slate-400">Away Team</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Discipline & Other Stats */}
              <Card className="border-slate-700 bg-slate-900/50 lg:col-span-2">
                <CardHeader>
                  <CardTitle>Average Discipline & Game Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                    <div className="text-center">
                      <div className="text-lg font-bold text-white">{teamAverages.fouls.home}</div>
                      <div className="text-xs text-slate-400">Fouls</div>
                      <div className="text-xs text-green-400">Home</div>
                      <div className="text-lg font-bold text-white mt-2">{teamAverages.fouls.away}</div>
                      <div className="text-xs text-blue-400">Away</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-white">{teamAverages.corners.home}</div>
                      <div className="text-xs text-slate-400">Corners</div>
                      <div className="text-xs text-green-400">Home</div>
                      <div className="text-lg font-bold text-white mt-2">{teamAverages.corners.away}</div>
                      <div className="text-xs text-blue-400">Away</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-yellow-400">{teamAverages.discipline.home.yellow}</div>
                      <div className="text-xs text-slate-400">Yellow Cards</div>
                      <div className="text-xs text-green-400">Home</div>
                      <div className="text-lg font-bold text-yellow-400 mt-2">{teamAverages.discipline.away.yellow}</div>
                      <div className="text-xs text-blue-400">Away</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-red-400">{teamAverages.discipline.home.red}</div>
                      <div className="text-xs text-slate-400">Red Cards</div>
                      <div className="text-xs text-green-400">Home</div>
                      <div className="text-lg font-bold text-red-400 mt-2">{teamAverages.discipline.away.red}</div>
                      <div className="text-xs text-blue-400">Away</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          </div>

          {/* Section 3: Goals - Offensive & Defensive Profile */}
          <div>
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-2">Goals: Average Offensive & Defensive Profile</h3>
              <p className="text-sm text-slate-400">Goal statistics based on recent performances</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="border-slate-700 bg-slate-900/50">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                    <Target className="w-5 h-5 text-green-400" />
                    <span>Average Goals Scored</span>
                      </CardTitle>
                    </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-green-400">{teamAverages.goals.home.scored}</div>
                      <div className="text-sm text-slate-400">Home Team</div>
                        </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-400">{teamAverages.goals.away.scored}</div>
                      <div className="text-sm text-slate-400">Away Team</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

              <Card className="border-slate-700 bg-slate-900/50">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Shield className="w-5 h-5 text-red-400" />
                    <span>Average Goals Conceded</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-green-400">{teamAverages.goals.home.conceded}</div>
                      <div className="text-sm text-slate-400">Home Team</div>
                </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-400">{teamAverages.goals.away.conceded}</div>
                      <div className="text-sm text-slate-400">Away Team</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-700 bg-slate-900/50">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Award className="w-5 h-5 text-yellow-400" />
                    <span>Clean Sheet Percentage</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-green-400">{teamAverages.goals.home.cleanSheets}%</div>
                      <div className="text-sm text-slate-400">Home Team</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-400">{teamAverages.goals.away.cleanSheets}%</div>
                      <div className="text-sm text-slate-400">Away Team</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* TAB 3: BETTING ODDS */}
        <TabsContent value="odds" className="space-y-6 mt-8">
          
          <Card className="border-slate-700 bg-slate-900/50">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                  <span>Available Odds for this Match</span>
                </div>
                <Badge className="bg-green-500/20 text-green-400 border border-green-500/30 text-xs">
                  Licensed Sources
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left py-3 text-slate-400">Bookmaker</th>
                      <th className="text-center py-3 text-slate-400">Home Win</th>
                      <th className="text-center py-3 text-slate-400">Draw</th>
                      <th className="text-center py-3 text-slate-400">Away Win</th>
                      <th className="text-center py-3 text-slate-400">Over 2.5</th>
                      <th className="text-center py-3 text-slate-400">Both Score</th>
                      <th className="text-center py-3 text-slate-400">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {oddsData.map((odds, index) => (
                      <tr key={index} className="border-b border-slate-800">
                        <td className="py-4">
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-slate-700 rounded-lg flex items-center justify-center">
                              <span className="text-xs font-bold text-white">{odds.bookmaker.charAt(0)}</span>
                            </div>
                            <span className="font-medium text-white">{odds.bookmaker}</span>
                          </div>
                        </td>
                        <td className="text-center py-4">
                          <Badge className="bg-green-500/20 text-green-400 border border-green-500/30 font-mono">
                            {odds.homeWin}
                          </Badge>
                        </td>
                        <td className="text-center py-4">
                          <Badge className="bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 font-mono">
                            {odds.draw}
                          </Badge>
                        </td>
                        <td className="text-center py-4">
                          <Badge className="bg-blue-500/20 text-blue-400 border border-blue-500/30 font-mono">
                            {odds.awayWin}
                          </Badge>
                        </td>
                        <td className="text-center py-4">
                          <Badge className="bg-orange-500/20 text-orange-400 border border-orange-500/30 font-mono">
                            {odds.over25}
                          </Badge>
                        </td>
                        <td className="text-center py-4">
                          <Badge className="bg-purple-500/20 text-purple-400 border border-purple-500/30 font-mono">
                            {odds.btts}
                          </Badge>
                        </td>
                        <td className="text-center py-4">
                          <Button variant="outline" size="sm" className="border-slate-600 text-slate-300 hover:bg-slate-800">
                            <ExternalLink className="w-3 h-3 mr-1" />
                            View More
                  </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="mt-6 p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                <p className="text-xs text-slate-400 text-center">
                  <AlertTriangle className="w-4 h-4 inline mr-1" />
                  Odds are provided for informational purposes only and subject to change. 
                  Please gamble responsibly. +18 | Support: responsiblegambling.org
                </p>
                </div>
              </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}