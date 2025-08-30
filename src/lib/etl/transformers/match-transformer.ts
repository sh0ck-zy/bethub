import { RawMatchData, EnrichedMatch, TransformationResult, ValidationResult, ValidationError } from '../core/types';
import { z } from 'zod';
import { createHash } from 'crypto';

/**
 * Match data transformer with validation, normalization and enrichment
 */
export class MatchTransformer {
  private readonly matchSchema = z.object({
    externalId: z.string().min(1),
    source: z.string().min(1),
    league: z.string().min(1),
    homeTeam: z.string().min(1),
    awayTeam: z.string().min(1),
    kickoffTime: z.string().datetime(),
    status: z.enum(['PRE', 'LIVE', 'HT', 'FT', 'POSTPONED', 'CANCELLED']),
    homeScore: z.number().min(0).optional(),
    awayScore: z.number().min(0).optional(),
    venue: z.string().optional(),
    referee: z.string().optional()
  });

  async transform(rawMatches: RawMatchData[]): Promise<TransformationResult<EnrichedMatch>> {
    const startTime = Date.now();
    const enrichedMatches: EnrichedMatch[] = [];
    const validationErrors: ValidationError[] = [];
    let duplicatesRemoved = 0;

    console.log(`🔄 Starting transformation of ${rawMatches.length} matches`);

    // Step 1: Validate all matches
    const validMatches = rawMatches.filter(match => {
      const validation = this.validateMatch(match);
      if (!validation.valid) {
        validationErrors.push(...validation.errors);
        return false;
      }
      return true;
    });

    console.log(`✅ Validation: ${validMatches.length}/${rawMatches.length} matches valid`);

    // Step 2: Normalize data
    const normalizedMatches = validMatches.map(match => this.normalizeMatch(match));

    // Step 3: Remove duplicates
    const uniqueMatches = this.removeDuplicates(normalizedMatches);
    duplicatesRemoved = normalizedMatches.length - uniqueMatches.length;

    console.log(`🔄 Deduplication: Removed ${duplicatesRemoved} duplicates`);

    // Step 4: Enrich matches
    for (const match of uniqueMatches) {
      const enriched = await this.enrichMatch(match);
      enrichedMatches.push(enriched);
    }

    const duration = Date.now() - startTime;

    return {
      data: enrichedMatches,
      transformedAt: new Date(),
      metadata: {
        inputRecords: rawMatches.length,
        outputRecords: enrichedMatches.length,
        validationErrors: validationErrors.length,
        duplicatesRemoved,
        enrichmentStats: {
          withLogos: enrichedMatches.filter(m => m.homeTeamLogo && m.awayTeamLogo).length,
          withVenue: enrichedMatches.filter(m => m.venue).length,
          withOdds: enrichedMatches.filter(m => m.odds).length
        }
      }
    };
  }

  private validateMatch(match: RawMatchData): ValidationResult {
    try {
      // Parse and validate with Zod schema
      this.matchSchema.parse({
        ...match,
        status: this.normalizeStatus(match.status)
      });

      return { valid: true, errors: [], warnings: [] };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: ValidationError[] = error.errors.map(err => ({
          field: err.path.join('.'),
          rule: err.code,
          message: err.message,
          value: match
        }));
        return { valid: false, errors, warnings: [] };
      }
      
      return {
        valid: false,
        errors: [{
          field: 'unknown',
          rule: 'validation',
          message: 'Unknown validation error',
          value: match
        }],
        warnings: []
      };
    }
  }

  private normalizeMatch(match: RawMatchData): RawMatchData {
    return {
      ...match,
      // Normalize team names
      homeTeam: this.normalizeTeamName(match.homeTeam),
      awayTeam: this.normalizeTeamName(match.awayTeam),
      // Normalize league names
      league: this.normalizeLeagueName(match.league),
      // Normalize status
      status: this.normalizeStatus(match.status),
      // Ensure UTC time
      kickoffTime: this.normalizeDateTime(match.kickoffTime)
    };
  }

  private normalizeTeamName(name: string): string {
    return name
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/^(FC|CF|SC|AS|AC)\s+/i, '') // Remove common prefixes
      .replace(/\s+(FC|CF|SC|AS|AC)$/i, ''); // Remove common suffixes
  }

  private normalizeLeagueName(name: string): string {
    const leagueMap: Record<string, string> = {
      'English Premier League': 'Premier League',
      'Spanish La Liga': 'La Liga',
      'Italian Serie A': 'Serie A',
      'German Bundesliga': 'Bundesliga',
      'French Ligue 1': 'Ligue 1',
      'UEFA Champions League': 'Champions League',
      'UEFA Europa League': 'Europa League'
    };

    const normalized = name.trim();
    return leagueMap[normalized] || normalized;
  }

  private normalizeStatus(status: string): string {
    const statusMap: Record<string, string> = {
      'SCHEDULED': 'PRE',
      'NOT_STARTED': 'PRE',
      'NS': 'PRE',
      'LIVE': 'LIVE',
      'IN_PLAY': 'LIVE',
      '1H': 'LIVE',
      '2H': 'LIVE',
      'HALF_TIME': 'HT',
      'HT': 'HT',
      'FINISHED': 'FT',
      'FULL_TIME': 'FT',
      'FT': 'FT',
      'AET': 'FT',
      'PEN': 'FT',
      'POSTPONED': 'POSTPONED',
      'PST': 'POSTPONED',
      'CANCELLED': 'CANCELLED',
      'CANC': 'CANCELLED'
    };

    return statusMap[status.toUpperCase()] || 'PRE';
  }

  private normalizeDateTime(dateTime: string): string {
    try {
      const date = new Date(dateTime);
      return date.toISOString();
    } catch {
      // If parsing fails, assume it's already in ISO format
      return dateTime;
    }
  }

  private removeDuplicates(matches: RawMatchData[]): RawMatchData[] {
    const seen = new Map<string, RawMatchData>();

    for (const match of matches) {
      const key = this.generateMatchKey(match);
      
      if (!seen.has(key) || this.isHigherQuality(match, seen.get(key)!)) {
        seen.set(key, match);
      }
    }

    return Array.from(seen.values());
  }

  private generateMatchKey(match: RawMatchData): string {
    // Create a unique key based on normalized data
    const parts = [
      match.homeTeam.toLowerCase(),
      match.awayTeam.toLowerCase(),
      new Date(match.kickoffTime).toISOString().slice(0, 13) // Hour precision
    ];
    
    return createHash('md5').update(parts.join('-')).digest('hex');
  }

  private isHigherQuality(newMatch: RawMatchData, existingMatch: RawMatchData): boolean {
    // Calculate quality score based on data completeness
    const calculateScore = (match: RawMatchData): number => {
      let score = 0;
      if (match.venue) score += 2;
      if (match.referee) score += 1;
      if (match.rawData?.homeTeamLogo) score += 2;
      if (match.rawData?.awayTeamLogo) score += 2;
      if (match.rawData?.leagueLogo) score += 1;
      
      // Source priority
      const sourcePriority: Record<string, number> = {
        'football-data': 10,
        'api-sports': 8,
        'sports-api': 6,
        'sports-db': 4
      };
      score += sourcePriority[match.source] || 0;
      
      return score;
    };

    return calculateScore(newMatch) > calculateScore(existingMatch);
  }

  private async enrichMatch(match: RawMatchData): Promise<EnrichedMatch> {
    // Generate unique ID
    const id = this.generateMatchId(match);

    // Calculate confidence score
    const confidenceScore = this.calculateConfidenceScore(match);

    // Determine data quality
    const dataQuality = this.determineDataQuality(match, confidenceScore);

    // Extract enrichment data from raw data
    const enriched: EnrichedMatch = {
      ...match,
      id,
      homeTeamLogo: match.rawData?.homeTeamLogo,
      awayTeamLogo: match.rawData?.awayTeamLogo,
      leagueLogo: match.rawData?.leagueLogo,
      confidenceScore,
      dataQuality
    };

    // Add placeholder odds (would be enriched from odds API)
    if (match.status === 'PRE') {
      enriched.odds = {
        home: 2.5,
        draw: 3.2,
        away: 2.8,
        provider: 'placeholder'
      };
    }

    return enriched;
  }

  private generateMatchId(match: RawMatchData): string {
    const parts = [
      match.league,
      match.homeTeam,
      match.awayTeam,
      new Date(match.kickoffTime).toISOString()
    ];
    
    return createHash('sha256').update(parts.join('|')).digest('hex').slice(0, 16);
  }

  private calculateConfidenceScore(match: RawMatchData): number {
    let score = 0.5; // Base score

    // Increase score for data completeness
    if (match.venue) score += 0.1;
    if (match.referee) score += 0.1;
    if (match.rawData?.homeTeamLogo) score += 0.1;
    if (match.rawData?.awayTeamLogo) score += 0.1;
    
    // Source reliability
    const sourceReliability: Record<string, number> = {
      'football-data': 0.2,
      'api-sports': 0.15,
      'sports-api': 0.1,
      'sports-db': 0.05
    };
    score += sourceReliability[match.source] || 0;

    return Math.min(score, 1.0);
  }

  private determineDataQuality(match: RawMatchData, confidenceScore: number): 'high' | 'medium' | 'low' {
    if (confidenceScore >= 0.8) return 'high';
    if (confidenceScore >= 0.5) return 'medium';
    return 'low';
  }
}