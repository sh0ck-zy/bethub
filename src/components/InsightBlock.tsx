'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Brain, TrendingUp, AlertTriangle, CheckCircle, Target } from 'lucide-react';

interface Insight {
  id: string;
  content: string;
  confidence: number;
}

interface InsightBlockProps {
  insight: Insight;
}

export function InsightBlock({ insight }: InsightBlockProps) {
  const confidencePercentage = Math.round(insight.confidence * 100);
  
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-400';
    if (confidence >= 0.6) return 'text-yellow-400';
    return 'text-orange-400';
  };

  const getConfidenceIcon = (confidence: number) => {
    if (confidence >= 0.8) return <CheckCircle className="w-4 h-4 text-green-400" />;
    if (confidence >= 0.6) return <Target className="w-4 h-4 text-yellow-400" />;
    return <AlertTriangle className="w-4 h-4 text-orange-400" />;
  };

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 0.8) return { text: 'High Confidence', color: 'bg-green-500/20 text-green-400 border-green-500/30' };
    if (confidence >= 0.6) return { text: 'Medium Confidence', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' };
    return { text: 'Low Confidence', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' };
  };

  const confidenceBadge = getConfidenceBadge(insight.confidence);

  return (
    <Card className="premium-card hover:border-purple-500/30 transition-all duration-300">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2 text-lg">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <span className="gradient-text">AI Insight</span>
          </CardTitle>
          <div className="flex items-center space-x-3">
            {getConfidenceIcon(insight.confidence)}
            <Badge className={`${confidenceBadge.color} border font-medium`}>
              {confidenceBadge.text}
            </Badge>
          </div>
        </div>
        
        {/* Confidence Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Confidence Score</span>
            <span className={`font-bold ${getConfidenceColor(insight.confidence)}`}>
              {confidencePercentage}%
            </span>
          </div>
          <Progress 
            value={confidencePercentage} 
            className="h-2 bg-gray-800"
          />
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Insight Content */}
        <div className="p-4 rounded-lg bg-gradient-to-r from-purple-500/5 to-blue-500/5 border border-purple-500/20">
          <div 
            className="prose prose-sm max-w-none text-gray-300 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: insight.content }}
          />
        </div>
        
        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-white/10">
          <div className="flex items-center space-x-2 text-sm text-gray-400">
            <TrendingUp className="w-4 h-4" />
            <span>AI Analysis • Real-time</span>
          </div>
          <div className="flex items-center space-x-2">
            <button className="text-xs text-purple-400 hover:text-purple-300 transition-colors">
              View Details
            </button>
            <div className="w-px h-4 bg-white/20"></div>
            <button className="text-xs text-green-400 hover:text-green-300 transition-colors">
              Apply to Bet
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}