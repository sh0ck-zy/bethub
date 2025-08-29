/**
 * Competition Coverage Configuration
 * Defines which competitions are covered by the autonomous pipeline
 */

export interface CompetitionRule {
  id: string;
  name: string;
  enabled: boolean;
  priority: 'high' | 'medium' | 'low';
  
  // Match filtering criteria
  criteria: {
    leagues: string[];
    countries?: string[];
    min_team_ranking?: number;
    exclude_teams?: string[];
    include_teams?: string[];
  };
  
  // Analysis configuration
  analysis: {
    auto_analyze: boolean;
    auto_publish: boolean;
    min_confidence_threshold: number;
    require_news: boolean;
    max_daily_matches?: number;
  };
  
  // News aggregation settings
  news: {
    sources: Array<'reddit' | 'guardian' | 'rss'>;
    keywords: string[];
    min_relevance_score: number;
    max_articles_per_source: number;
  };
  
  // Timing configuration
  timing: {
    analyze_hours_before_kickoff: number;
    stop_analysis_hours_before_kickoff: number;
    publish_hours_before_kickoff: number;
  };
}

/**
 * Default competition coverage rules
 */
export const DEFAULT_COMPETITION_RULES: CompetitionRule[] = [
  {
    id: 'premier-league',
    name: 'Premier League',
    enabled: true,
    priority: 'high',
    criteria: {
      leagues: ['Premier League'],
      countries: ['England']
    },
    analysis: {
      auto_analyze: true,
      auto_publish: true,
      min_confidence_threshold: 75,
      require_news: true,
      max_daily_matches: 10
    },
    news: {
      sources: ['reddit', 'guardian', 'rss'],
      keywords: ['premier league', 'epl', 'english football'],
      min_relevance_score: 0.6,
      max_articles_per_source: 5
    },
    timing: {
      analyze_hours_before_kickoff: 24,
      stop_analysis_hours_before_kickoff: 2,
      publish_hours_before_kickoff: 6
    }
  },
  {
    id: 'champions-league',
    name: 'UEFA Champions League',
    enabled: true,
    priority: 'high',
    criteria: {
      leagues: ['UEFA Champions League', 'Champions League']
    },
    analysis: {
      auto_analyze: true,
      auto_publish: true,
      min_confidence_threshold: 80,
      require_news: true,
      max_daily_matches: 8
    },
    news: {
      sources: ['reddit', 'guardian', 'rss'],
      keywords: ['champions league', 'uefa', 'ucl'],
      min_relevance_score: 0.7,
      max_articles_per_source: 8
    },
    timing: {
      analyze_hours_before_kickoff: 48,
      stop_analysis_hours_before_kickoff: 3,
      publish_hours_before_kickoff: 12
    }
  },
  {
    id: 'la-liga',
    name: 'La Liga',
    enabled: true,
    priority: 'medium',
    criteria: {
      leagues: ['La Liga', 'Primera División'],
      countries: ['Spain'],
      include_teams: ['Real Madrid', 'Barcelona', 'Atletico Madrid']
    },
    analysis: {
      auto_analyze: true,
      auto_publish: true,
      min_confidence_threshold: 70,
      require_news: false,
      max_daily_matches: 6
    },
    news: {
      sources: ['reddit', 'guardian'],
      keywords: ['la liga', 'real madrid', 'barcelona', 'atletico madrid'],
      min_relevance_score: 0.6,
      max_articles_per_source: 4
    },
    timing: {
      analyze_hours_before_kickoff: 24,
      stop_analysis_hours_before_kickoff: 2,
      publish_hours_before_kickoff: 8
    }
  },
  {
    id: 'serie-a',
    name: 'Serie A',
    enabled: false, // Disabled by default - can be enabled later
    priority: 'medium',
    criteria: {
      leagues: ['Serie A'],
      countries: ['Italy']
    },
    analysis: {
      auto_analyze: true,
      auto_publish: false, // Require manual approval
      min_confidence_threshold: 75,
      require_news: false,
      max_daily_matches: 4
    },
    news: {
      sources: ['reddit'],
      keywords: ['serie a', 'juventus', 'inter', 'milan'],
      min_relevance_score: 0.6,
      max_articles_per_source: 3
    },
    timing: {
      analyze_hours_before_kickoff: 24,
      stop_analysis_hours_before_kickoff: 2,
      publish_hours_before_kickoff: 8
    }
  }
];

/**
 * Competition Coverage Manager
 * Handles filtering and configuration logic for autonomous pipeline
 */
export class CompetitionManager {
  private rules: CompetitionRule[] = [];

  constructor(initialRules: CompetitionRule[] = DEFAULT_COMPETITION_RULES) {
    this.rules = [...initialRules];
  }

  /**
   * Check if a match should be covered by the autonomous pipeline
   */
  shouldCoverMatch(match: {
    league: string;
    home_team: string;
    away_team: string;
    kickoff_utc: string;
  }): {
    should_cover: boolean;
    rule?: CompetitionRule;
    reason?: string;
  } {
    // Find matching rule
    const rule = this.findMatchingRule(match);
    
    if (!rule) {
      return {
        should_cover: false,
        reason: 'No matching competition rule found'
      };
    }

    if (!rule.enabled) {
      return {
        should_cover: false,
        rule,
        reason: 'Competition rule disabled'
      };
    }

    // Check daily match limit
    if (rule.analysis.max_daily_matches) {
      // TODO: Implement daily match counting logic
      // For now, assume we're under the limit
    }

    // Check team exclusions/inclusions
    const { criteria } = rule;
    
    if (criteria.exclude_teams?.some(team => 
      match.home_team.includes(team) || match.away_team.includes(team)
    )) {
      return {
        should_cover: false,
        rule,
        reason: 'Team excluded by rule'
      };
    }

    if (criteria.include_teams && criteria.include_teams.length > 0) {
      const hasIncludedTeam = criteria.include_teams.some(team =>
        match.home_team.includes(team) || match.away_team.includes(team)
      );
      
      if (!hasIncludedTeam) {
        return {
          should_cover: false,
          rule,
          reason: 'No included teams found'
        };
      }
    }

    // Check timing constraints
    const kickoffTime = new Date(match.kickoff_utc);
    const now = new Date();
    const hoursUntilKickoff = (kickoffTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursUntilKickoff < rule.timing.stop_analysis_hours_before_kickoff) {
      return {
        should_cover: false,
        rule,
        reason: 'Too close to kickoff for analysis'
      };
    }

    if (hoursUntilKickoff > rule.timing.analyze_hours_before_kickoff) {
      return {
        should_cover: false,
        rule,
        reason: 'Too early for analysis'
      };
    }

    return {
      should_cover: true,
      rule
    };
  }

  /**
   * Find the matching rule for a match
   */
  private findMatchingRule(match: {
    league: string;
    home_team: string;
    away_team: string;
  }): CompetitionRule | undefined {
    // Sort by priority (high -> medium -> low)
    const sortedRules = [...this.rules].sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    return sortedRules.find(rule => {
      // Check league match
      const leagueMatch = rule.criteria.leagues.some(league =>
        match.league.toLowerCase().includes(league.toLowerCase()) ||
        league.toLowerCase().includes(match.league.toLowerCase())
      );

      return leagueMatch;
    });
  }

  /**
   * Get configuration for a specific match
   */
  getMatchConfig(match: {
    league: string;
    home_team: string;
    away_team: string;
    kickoff_utc: string;
  }): CompetitionRule | null {
    const result = this.shouldCoverMatch(match);
    return result.should_cover ? result.rule! : null;
  }

  /**
   * Get all enabled competition rules
   */
  getEnabledRules(): CompetitionRule[] {
    return this.rules.filter(rule => rule.enabled);
  }

  /**
   * Update a competition rule
   */
  updateRule(ruleId: string, updates: Partial<CompetitionRule>): boolean {
    const index = this.rules.findIndex(rule => rule.id === ruleId);
    if (index === -1) return false;

    this.rules[index] = { ...this.rules[index], ...updates };
    return true;
  }

  /**
   * Add a new competition rule
   */
  addRule(rule: CompetitionRule): void {
    this.rules.push(rule);
  }

  /**
   * Remove a competition rule
   */
  removeRule(ruleId: string): boolean {
    const index = this.rules.findIndex(rule => rule.id === ruleId);
    if (index === -1) return false;

    this.rules.splice(index, 1);
    return true;
  }

  /**
   * Get coverage statistics
   */
  getStats(): {
    total_rules: number;
    enabled_rules: number;
    high_priority_rules: number;
    auto_publish_rules: number;
  } {
    const enabled = this.rules.filter(r => r.enabled);
    
    return {
      total_rules: this.rules.length,
      enabled_rules: enabled.length,
      high_priority_rules: enabled.filter(r => r.priority === 'high').length,
      auto_publish_rules: enabled.filter(r => r.analysis.auto_publish).length
    };
  }
}

// Export singleton instance
export const competitionManager = new CompetitionManager();