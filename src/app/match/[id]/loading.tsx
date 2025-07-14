import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/">
            <Button variant="outline" className="border-border text-muted-foreground hover:bg-accent">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Matches
            </Button>
          </Link>
        </div>

        {/* Loading Header */}
        <Card className="bg-card/50 border border-border mb-8 animate-pulse">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="h-6 bg-muted rounded w-24"></div>
              <div className="h-6 bg-muted rounded w-20"></div>
            </div>

            {/* Match Display Skeleton */}
            <div className="flex items-center justify-between">
              {/* Home Team */}
              <div className="flex-1 text-center">
                <div className="w-16 h-16 bg-muted rounded-full mx-auto mb-3"></div>
                <div className="h-6 bg-muted rounded w-32 mx-auto mb-1"></div>
                <div className="h-8 bg-muted rounded w-8 mx-auto"></div>
              </div>

              {/* VS */}
              <div className="flex-1 text-center px-4">
                <div className="h-6 bg-muted rounded w-8 mx-auto mb-2"></div>
                <div className="h-4 bg-muted rounded w-24 mx-auto"></div>
              </div>

              {/* Away Team */}
              <div className="flex-1 text-center">
                <div className="w-16 h-16 bg-muted rounded-full mx-auto mb-3"></div>
                <div className="h-6 bg-muted rounded w-32 mx-auto mb-1"></div>
                <div className="h-8 bg-muted rounded w-8 mx-auto"></div>
              </div>
            </div>

            {/* Match Info Skeleton */}
            <div className="flex items-center justify-center space-x-6 mt-6">
              <div className="h-4 bg-muted rounded w-20"></div>
              <div className="h-4 bg-muted rounded w-24"></div>
              <div className="h-4 bg-muted rounded w-16"></div>
            </div>
          </CardContent>
        </Card>

        {/* Loading Analysis */}
        <Card className="bg-card/50 border border-border">
          <CardContent className="p-8 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-foreground mb-2">Loading Match Analysis</h3>
                          <p className="text-muted-foreground">Preparing AI insights...</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 