import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function NotFound() {
  return (
          <div className="min-h-screen bg-gradient-to-br from-background via-background to-background flex items-center justify-center">
      <div className="container mx-auto px-4 py-8">
        <Card className="bg-card/50 border border-border max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-2">Match Not Found</h1>
                          <p className="text-muted-foreground mb-6">
                This match doesn't exist or hasn't been published yet.
              </p>
            <Link href="/">
              <Button className="bg-blue-600 hover:bg-blue-700">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Homepage
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 