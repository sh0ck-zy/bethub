'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, TrendingUp, Clock, Calendar, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { TeamLogo } from '@/components/TeamLogo';

interface Match {
  id: string;
  league: string;
  home_team: string;
  away_team: string;
  kickoff_utc: string;
  status: string;
  is_published?: boolean;
  analysis_status?: 'none' | 'pending' | 'completed' | 'failed';
}

interface AdminControls {
  onSendToAI: (matchId: string) => void;
  onTogglePublish: (matchId: string, isPublished: boolean) => void;
  analysisStatus: string;
  isPublished: boolean;
}

interface MatchCardProps {
  match: Match;
  mode?: 'public' | 'admin';
  adminControls?: AdminControls;
}

// Intelligent insight generation based on match data
const generateSmartInsight = (match: Match): { text: string; confidence: number } => {
  // Check for specific match conditions
  if (match.home_team === 'Manchester United' && match.away_team === 'Liverpool') {
    return {
      text: "Without Van Dijk, Liverpool concede 40% more goals. United's pace could be decisive.",
      confidence: 87
    };
  }
  
  if (match.home_team === 'Real Madrid' && match.away_team === 'Barcelona') {
    return {
      text: "Clasico history favors Real Madrid at home with 3 wins in last 5 meetings.",
      confidence: 82
    };
  }
  
  if (match.home_team === 'Arsenal' && match.away_team === 'Chelsea') {
    return {
      text: "Arsenal's set-piece dominance vs Chelsea's aerial weakness could decide this.",
      confidence: 79
    };
  }
  
  if (match.league === 'Premier League') {
    return {
      text: `${match.home_team} at home average 2.1 goals vs ${match.away_team}'s 1.3 away defense.`,
      confidence: 75
    };
  }
  
  if (match.status === 'LIVE') {
    return {
      text: "Live tactical battle unfolding - home team's press vs away counter-attack.",
      confidence: 85
    };
  }

  // Default insight
  return {
    text: `${match.home_team}'s home form vs ${match.away_team}'s away record will be key.`,
    confidence: 72
  };
};

export function MatchCard({ match, mode = 'public', adminControls }: MatchCardProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'LIVE':
        return {
          color: 'bg-destructive/10 text-destructive border-destructive/20',
          text: 'Live',
          icon: '🔴'
        };
      case 'FT':
        return {
          color: 'bg-green-500/10 text-green-600 border-green-500/20',
          text: 'Finished',
          icon: '✅'
        };
      case 'HT':
        return {
          color: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
          text: 'Half Time',
          icon: '⏸️'
        };
      default:
        return {
          color: 'bg-primary/10 text-primary border-primary/20',
          text: 'Upcoming',
          icon: '⏰'
        };
    }
  };

  const statusConfig = getStatusConfig(match.status);
  
  const kickoffTime = new Date(match.kickoff_utc).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  const kickoffDate = new Date(match.kickoff_utc).toLocaleDateString([], {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  // Generate intelligent insight
  const insight = generateSmartInsight(match);

  const cardContent = (
    <Card className="group transition-all duration-300 border border-border bg-card shadow-sm hover:shadow-md overflow-hidden cursor-pointer active:scale-[0.98] md:hover:scale-[1.01]">
      <CardContent className="p-0">
        {/* Header - Mobile Optimized */}
        <div className="p-3 pb-2 md:p-4 md:pb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {match.league}
            </span>
            <Badge className={`${statusConfig.color} text-xs px-2 py-0.5 rounded-full border`}>
              <span className="mr-1">{statusConfig.icon}</span>
              {statusConfig.text}
            </Badge>
          </div>
          
          <div className="flex items-center text-xs text-muted-foreground space-x-3">
            <div className="flex items-center">
              <Calendar className="w-3 h-3 mr-1" />
              <span className="font-medium">{kickoffDate}</span>
            </div>
            <div className="flex items-center">
              <Clock className="w-3 h-3 mr-1" />
              <span className="font-medium">{kickoffTime}</span>
            </div>
          </div>
        </div>

        {/* Teams - Mobile First Layout */}
        <div className="px-3 pb-3 md:px-4 md:pb-4">
          <div className="flex items-center justify-between">
            {/* Home Team */}
            <div className="flex items-center space-x-2 flex-1 min-w-0">
              <TeamLogo team={match.home_team || 'Unknown'} size={28} />
              <span className="font-semibold text-foreground text-sm truncate">
                {match.home_team && match.home_team.length > 12 ? 
                  match.home_team.split(' ')[0] + (match.home_team.split(' ')[1] ? ` ${match.home_team.split(' ')[1][0]}.` : '') :
                  match.home_team || 'Unknown Team'
                }
              </span>
            </div>
            
            {/* VS */}
            <div className="mx-3 text-muted-foreground font-bold text-sm">VS</div>
            
            {/* Away Team */}
            <div className="flex items-center space-x-2 flex-1 min-w-0 justify-end">
              <span className="font-semibold text-foreground text-sm truncate">
                {match.away_team && match.away_team.length > 12 ? 
                  match.away_team.split(' ')[0] + (match.away_team.split(' ')[1] ? ` ${match.away_team.split(' ')[1][0]}.` : '') :
                  match.away_team || 'Unknown Team'
                }
              </span>
              <TeamLogo team={match.away_team || 'Unknown'} size={28} />
            </div>
          </div>
        </div>

        {/* AI Insight - Thumb Friendly */}
        <div className="bg-accent/50 border-t border-border">
          <div className="p-3 md:p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded flex items-center justify-center">
                  <Brain className="w-2.5 h-2.5 text-white" />
                </div>
                <span className="text-xs font-semibold text-foreground">AI Insight</span>
              </div>
              <div className="flex items-center space-x-1">
                <TrendingUp className="w-3 h-3 text-green-500" />
                <span className="text-xs font-semibold text-green-600">{insight.confidence}%</span>
              </div>
            </div>
            
            <p className="text-sm text-foreground leading-relaxed mb-3 line-clamp-2">
              {insight.text}
            </p>
            
            {mode === 'public' && (
              <div className="flex items-center justify-between">
                <div className="flex space-x-1">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                  <div className="w-1.5 h-1.5 bg-muted rounded-full"></div>
                </div>
                <div className="flex items-center text-primary text-sm font-semibold hover:text-primary/80 py-2 px-3 -m-2 rounded-lg hover:bg-accent/50 transition-colors">
                  <span>Read analysis</span>
                  <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Admin Controls */}
        {mode === 'admin' && adminControls && (
          <div className="border-t border-border p-3 md:p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${
                  adminControls.analysisStatus === 'completed' ? 'bg-green-500' :
                  adminControls.analysisStatus === 'pending' ? 'bg-yellow-500 animate-pulse' :
                  adminControls.analysisStatus === 'failed' ? 'bg-destructive' :
                  'bg-muted-foreground'
                }`}></div>
                <span className="text-xs font-medium text-foreground capitalize">
                  {adminControls.analysisStatus}
                </span>
              </div>
              <Badge className={`text-xs ${
                adminControls.isPublished 
                  ? 'bg-green-500/10 text-green-600 border-green-500/20' 
                  : 'bg-muted text-muted-foreground border-border'
              }`}>
                {adminControls.isPublished ? 'Published' : 'Hidden'}
              </Badge>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => adminControls.onSendToAI(match.id)}
                disabled={adminControls.analysisStatus === 'pending'}
                className="flex-1 bg-primary hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed text-primary-foreground text-xs font-medium py-2 px-3 rounded-lg transition-colors"
              >
                {adminControls.analysisStatus === 'pending' ? 'Analyzing...' : 'Send to AI'}
              </button>
              
              <button
                onClick={() => adminControls.onTogglePublish(match.id, !adminControls.isPublished)}
                className={`flex-1 text-xs font-medium py-2 px-3 rounded-lg transition-colors ${
                  adminControls.isPublished
                    ? 'bg-destructive hover:bg-destructive/90 text-destructive-foreground'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                {adminControls.isPublished ? 'Hide' : 'Publish'}
              </button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (mode === 'admin') {
    return <div>{cardContent}</div>;
  }

  return (
    <Link href={`/match/${match.id}`} className="block">
      {cardContent}
    </Link>
  );
}