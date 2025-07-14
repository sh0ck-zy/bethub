import { Loader2, RefreshCw } from 'lucide-react';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'spinner' | 'dots' | 'pulse';
  text?: string;
  className?: string;
}

export function Loading({ 
  size = 'md', 
  variant = 'spinner', 
  text,
  className = '' 
}: LoadingProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  if (variant === 'dots') {
    return (
      <div className={`flex items-center justify-center gap-2 ${className}`}>
        <div className="flex gap-1">
          <div className={`${sizeClasses[size]} bg-green-500 rounded-full animate-bounce`} style={{ animationDelay: '0ms' }}></div>
          <div className={`${sizeClasses[size]} bg-blue-500 rounded-full animate-bounce`} style={{ animationDelay: '150ms' }}></div>
          <div className={`${sizeClasses[size]} bg-green-500 rounded-full animate-bounce`} style={{ animationDelay: '300ms' }}></div>
        </div>
        {text && <span className={`${textSizes[size]} text-muted-foreground ml-2`}>{text}</span>}
      </div>
    );
  }

  if (variant === 'pulse') {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <div className={`${sizeClasses[size]} bg-gradient-to-r from-green-400 to-blue-500 rounded-full animate-pulse`}></div>
        {text && <span className={`${textSizes[size]} text-muted-foreground ml-2`}>{text}</span>}
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <Loader2 className={`${sizeClasses[size]} animate-spin text-green-400`} />
      {text && <span className={`${textSizes[size]} text-muted-foreground ml-2`}>{text}</span>}
    </div>
  );
}

interface LoadingCardProps {
  className?: string;
  showSkeleton?: boolean;
}

export function LoadingCard({ className = '', showSkeleton = false }: LoadingCardProps) {
  if (showSkeleton) {
    return (
      <div className={`bg-card/90 border border-border rounded-lg p-4 ${className}`}>
                  <div className="animate-pulse space-y-4">
            {/* Header skeleton */}
            <div className="flex justify-between items-center">
              <div className="h-4 bg-muted rounded w-24"></div>
              <div className="h-6 bg-muted rounded w-16"></div>
            </div>
            
            {/* League skeleton */}
            <div className="h-4 bg-muted rounded w-32"></div>
            
            {/* Teams skeleton */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-muted rounded-full"></div>
                <div className="h-4 bg-muted rounded w-20"></div>
              </div>
              <div className="h-6 bg-muted rounded w-8"></div>
              <div className="flex items-center gap-3">
                <div className="h-4 bg-muted rounded w-20"></div>
                <div className="w-8 h-8 bg-muted rounded-full"></div>
              </div>
            </div>
            
            {/* AI Analysis skeleton */}
            <div className="border-t border-border pt-4">
              <div className="flex justify-between items-center mb-3">
                <div className="h-4 bg-muted rounded w-24"></div>
                <div className="h-5 bg-muted rounded w-20"></div>
              </div>
              <div className="h-16 bg-muted rounded"></div>
            </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-card/90 border border-border rounded-lg p-8 ${className}`}>
      <Loading size="lg" text="Loading match data..." />
    </div>
  );
}

interface LoadingButtonProps {
  children: React.ReactNode;
  loading?: boolean;
  loadingText?: string;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
}

export function LoadingButton({ 
  children, 
  loading = false, 
  loadingText = "Loading...",
  className = "",
  onClick,
  disabled = false
}: LoadingButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={loading || disabled}
      className={`flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {loading && <RefreshCw className="w-4 h-4 animate-spin" />}
      {loading ? loadingText : children}
    </button>
  );
}

interface LoadingPageProps {
  text?: string;
  showLogo?: boolean;
}

export function LoadingPage({ text = "Loading BetHub...", showLogo = true }: LoadingPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background flex items-center justify-center">
      <div className="text-center space-y-6">
        {showLogo && (
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center mx-auto">
            <span className="text-white font-bold text-2xl">B</span>
          </div>
        )}
        <Loading size="lg" text={text} />
      </div>
    </div>
  );
} 