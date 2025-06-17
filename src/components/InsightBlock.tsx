'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

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

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">AI Insight</CardTitle>
          <div className="text-sm text-muted-foreground">
            Confidence: {confidencePercentage}%
          </div>
        </div>
        <Progress value={confidencePercentage} className="w-full" />
      </CardHeader>
      <CardContent>
        <div 
          className="prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: insight.content }}
        />
      </CardContent>
    </Card>
  );
}

