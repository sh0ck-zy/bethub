import { BaseExtractor } from './base-extractor';
import { ExtractionResult, RawMatchData, DataSource, RateLimitConfig, RetryPolicy, CacheStrategy } from '../core/types';
import { FootballDataProvider } from '../../providers/football-data';
import { SportsAPIProvider } from '../../providers/sports-api';
import type { Match } from '../../types';

/**
 * Multi-source data extractor that combines multiple sports APIs
 */
export class MultiSourceExtractor extends BaseExtractor<RawMatchData> {
  private providers: Map<string, any>;
  private rateLimiters: Map<string, RateLimiter>;

  constructor(
    source: DataSource,
    rateLimitConfig: RateLimitConfig,
    retryPolicy: RetryPolicy,
    cacheStrategy: CacheStrategy
  ) {
    super(source, rateLimitConfig, retryPolicy, cacheStrategy);
    this.initializeProviders();
    this.initializeRateLimiters();
  }

  private initializeProviders() {
    this.providers = new Map();

    // Initialize Football-Data.org provider
    if (process.env.FOOTBALL_DATA_API_KEY) {
      this.providers.set('football-data', new FootballDataProvider(process.env.FOOTBALL_DATA_API_KEY));
    }

    // Initialize Sports API provider (API-Sports + TheSportsDB)
    this.providers.set('sports-api', new SportsAPIProvider());
  }

  private initializeRateLimiters() {
    this.rateLimiters = new Map();

    // Football-Data.org: 10 requests per minute
    this.rateLimiters.set('football-data', new RateLimiter({
      maxRequests: 10,
      windowMs: 60000,
      strategy: 'fixed-window'
    }));

    // API-Sports: 30 requests per minute (free tier)
    this.rateLimiters.set('api-sports', new RateLimiter({
      maxRequests: 30,
      windowMs: 60000,
      strategy: 'sliding-window'
    }));

    // TheSportsDB: 100 requests per minute
    this.rateLimiters.set('sports-db', new RateLimiter({
      maxRequests: 100,
      windowMs: 60000,
      strategy: 'fixed-window'
    }));
  }

  async extract(params?: { date?: Date; league?: string }): Promise<ExtractionResult<RawMatchData>> {
    const startTime = Date.now();
    const date = params?.date || new Date();
    const allMatches: RawMatchData[] = [];
    const errors: Error[] = [];

    console.log(`🔄 Starting multi-source extraction for ${date.toDateString()}`);

    // Extract from all providers in parallel
    const extractionPromises = Array.from(this.providers.entries()).map(async ([providerId, provider]) => {
      try {
        const rateLimiter = this.rateLimiters.get(providerId);
        if (rateLimiter) {
          await rateLimiter.acquire();
        }

        const matches = await this.executeWithRetry(async () => {
          return provider.getMatches(date, params?.league);
        });

        console.log(`✅ ${providerId}: Extracted ${matches.length} matches`);
        
        // Transform provider matches to raw match data
        const rawMatches = matches.map((match: Match) => this.transformToRawMatch(match, providerId));
        allMatches.push(...rawMatches);
      } catch (error: any) {
        console.error(`❌ ${providerId}: Extraction failed - ${error.message}`);
        errors.push(error);
      }
    });

    await Promise.allSettled(extractionPromises);

    // Remove duplicates
    const uniqueMatches = this.deduplicateMatches(allMatches);
    const duration = Date.now() - startTime;

    console.log(`✅ Extraction completed: ${uniqueMatches.length} unique matches from ${allMatches.length} total`);

    return {
      source: 'multi-source',
      data: uniqueMatches,
      extractedAt: new Date(),
      metadata: {
        totalRecords: uniqueMatches.length,
        duration,
        rateLimitRemaining: this.getMinRateLimitRemaining()
      }
    };
  }

  protected validateExtractedData(data: any): boolean {
    if (!Array.isArray(data)) return false;
    
    return data.every(match => 
      match.externalId &&
      match.source &&
      match.league &&
      match.homeTeam &&
      match.awayTeam &&
      match.kickoffTime
    );
  }

  private transformToRawMatch(match: Match, source: string): RawMatchData {
    return {
      externalId: `${source}_${match.id}`,
      source,
      league: match.league,
      homeTeam: match.home_team,
      awayTeam: match.away_team,
      kickoffTime: match.kickoff_utc,
      status: match.status,
      homeScore: match.home_score,
      awayScore: match.away_score,
      venue: match.venue,
      referee: match.referee,
      rawData: {
        homeTeamLogo: (match as any).home_team_logo,
        awayTeamLogo: (match as any).away_team_logo,
        leagueLogo: (match as any).league_logo,
        originalId: match.id
      }
    };
  }

  private deduplicateMatches(matches: RawMatchData[]): RawMatchData[] {
    const seen = new Map<string, RawMatchData>();
    
    for (const match of matches) {
      // Create a unique key based on teams and approximate kickoff time
      const kickoffHour = new Date(match.kickoffTime).toISOString().slice(0, 13);
      const key = `${match.homeTeam}-${match.awayTeam}-${kickoffHour}`;
      
      if (!seen.has(key) || this.isHigherQualitySource(match, seen.get(key)!)) {
        seen.set(key, match);
      }
    }
    
    return Array.from(seen.values());
  }

  private isHigherQualitySource(newMatch: RawMatchData, existingMatch: RawMatchData): boolean {
    // Priority order: football-data > api-sports > sports-db
    const sourcePriority: Record<string, number> = {
      'football-data': 3,
      'api-sports': 2,
      'sports-api': 2,
      'sports-db': 1
    };
    
    return (sourcePriority[newMatch.source] || 0) > (sourcePriority[existingMatch.source] || 0);
  }

  private getMinRateLimitRemaining(): number {
    let minRemaining = Infinity;
    
    this.rateLimiters.forEach(limiter => {
      const remaining = limiter.getRemaining();
      if (remaining < minRemaining) {
        minRemaining = remaining;
      }
    });
    
    return minRemaining === Infinity ? 0 : minRemaining;
  }
}

/**
 * Simple rate limiter implementation
 */
class RateLimiter {
  private config: RateLimitConfig;
  private requests: number[] = [];

  constructor(config: RateLimitConfig) {
    this.config = config;
  }

  async acquire(): Promise<void> {
    const now = Date.now();
    
    // Remove old requests outside the window
    this.requests = this.requests.filter(time => 
      now - time < this.config.windowMs
    );
    
    // Check if we can make a request
    if (this.requests.length >= this.config.maxRequests) {
      const oldestRequest = this.requests[0];
      const waitTime = this.config.windowMs - (now - oldestRequest) + 100; // Add 100ms buffer
      
      console.log(`⏳ Rate limit reached, waiting ${waitTime}ms`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      
      // Retry after waiting
      return this.acquire();
    }
    
    // Record this request
    this.requests.push(now);
  }

  getRemaining(): number {
    const now = Date.now();
    this.requests = this.requests.filter(time => 
      now - time < this.config.windowMs
    );
    return Math.max(0, this.config.maxRequests - this.requests.length);
  }
}