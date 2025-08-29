/**
 * News Aggregation Module - Multi-source News Collection and Processing
 * Collects relevant news from Reddit, RSS feeds, and Guardian API
 */

import { eventBus, emitEvent } from './event-bus';
import { competitionManager } from './competition-config';
import { supabase } from '../supabase';

export interface NewsArticle {
  id: string;
  title: string;
  content: string;
  summary?: string;
  url: string;
  source: 'reddit' | 'guardian' | 'rss';
  source_name: string;
  author?: string;
  published_at: string;
  collected_at: string;
  
  // Match relevance
  match_id?: string;
  teams_mentioned: string[];
  keywords_matched: string[];
  relevance_score: number; // 0-1
  sentiment_score: number; // -1 to 1
  
  // Content analysis
  word_count: number;
  language: string;
  has_quotes: boolean;
  
  // Deduplication
  content_hash: string;
  similar_articles: string[];
}

export interface NewsCollectionResult {
  source: string;
  collected: number;
  filtered: number;
  duplicates: number;
  errors: string[];
  processing_time: number;
}

/**
 * Reddit News Collector
 */
export class RedditCollector {
  private readonly subreddits = [
    'soccer',
    'PremierLeague', 
    'football',
    'realmadrid',
    'Barca',
    'chelseafc',
    'LiverpoolFC',
    'Gunners',
    'coys',
    'MCFC',
    'reddevils'
  ];

  async collectNews(teams: string[], keywords: string[], maxArticles: number = 20): Promise<NewsArticle[]> {
    console.log('[Reddit] Collecting news for teams:', teams);
    const articles: NewsArticle[] = [];

    try {
      // For demo purposes, generate realistic mock Reddit posts
      // In production, this would use Reddit API
      
      const mockPosts = await this.generateMockRedditPosts(teams, keywords, maxArticles);
      
      for (const post of mockPosts) {
        const article: NewsArticle = {
          id: `reddit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          title: post.title,
          content: post.content,
          url: `https://reddit.com/r/soccer/comments/${post.id}`,
          source: 'reddit',
          source_name: `r/${post.subreddit}`,
          author: post.author,
          published_at: post.created_utc,
          collected_at: new Date().toISOString(),
          
          teams_mentioned: this.extractTeamMentions(post.title + ' ' + post.content, teams),
          keywords_matched: this.extractKeywordMatches(post.title + ' ' + post.content, keywords),
          relevance_score: this.calculateRelevance(post, teams, keywords),
          sentiment_score: this.analyzeSentiment(post.title + ' ' + post.content),
          
          word_count: post.content.split(' ').length,
          language: 'en',
          has_quotes: post.content.includes('"'),
          
          content_hash: this.generateContentHash(post.title + post.content),
          similar_articles: []
        };

        articles.push(article);
      }

    } catch (error) {
      console.error('[Reddit] Collection failed:', error);
      throw error;
    }

    console.log(`[Reddit] Collected ${articles.length} articles`);
    return articles;
  }

  private async generateMockRedditPosts(teams: string[], keywords: string[], maxArticles: number) {
    const mockTitles = [
      `${teams[0]} vs ${teams[1]}: Pre-match Analysis`,
      `[Injury Update] ${teams[0]} star player doubtful for upcoming match`,
      `Tactical breakdown: How ${teams[0]} can exploit ${teams[1]}'s weakness`,
      `${teams[1]} manager confident ahead of big clash`,
      `Head-to-head: ${teams[0]} and ${teams[1]} recent meetings`,
      `Fan predictions for ${teams[0]} vs ${teams[1]}`,
      `Key players to watch in ${teams[0]} vs ${teams[1]}`
    ];

    return Array.from({ length: Math.min(maxArticles, mockTitles.length) }, (_, i) => ({
      id: `post_${i}_${Date.now()}`,
      title: mockTitles[i] || `${teams[0]} news update #${i + 1}`,
      content: `Detailed analysis and discussion about ${teams[0]} and ${teams[1]}. This would contain the full Reddit post content with user comments and insights about the upcoming match.`,
      subreddit: this.subreddits[Math.floor(Math.random() * this.subreddits.length)],
      author: `fan_user_${Math.floor(Math.random() * 1000)}`,
      created_utc: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
      score: Math.floor(Math.random() * 500) + 10
    }));
  }

  private extractTeamMentions(text: string, teams: string[]): string[] {
    return teams.filter(team => 
      text.toLowerCase().includes(team.toLowerCase())
    );
  }

  private extractKeywordMatches(text: string, keywords: string[]): string[] {
    return keywords.filter(keyword =>
      text.toLowerCase().includes(keyword.toLowerCase())
    );
  }

  private calculateRelevance(post: any, teams: string[], keywords: string[]): number {
    let score = 0;
    
    // Team mentions
    teams.forEach(team => {
      if (post.title.toLowerCase().includes(team.toLowerCase())) score += 0.3;
      if (post.content.toLowerCase().includes(team.toLowerCase())) score += 0.2;
    });
    
    // Keyword matches
    keywords.forEach(keyword => {
      if (post.title.toLowerCase().includes(keyword.toLowerCase())) score += 0.2;
      if (post.content.toLowerCase().includes(keyword.toLowerCase())) score += 0.1;
    });
    
    // Post engagement
    if (post.score > 100) score += 0.2;
    if (post.score > 500) score += 0.3;
    
    return Math.min(1, score);
  }

  private analyzeSentiment(text: string): number {
    // Simple sentiment analysis - in production, use proper NLP
    const positiveWords = ['win', 'victory', 'excellent', 'great', 'amazing', 'brilliant'];
    const negativeWords = ['lose', 'defeat', 'terrible', 'awful', 'disappointing', 'poor'];
    
    const words = text.toLowerCase().split(' ');
    let sentiment = 0;
    
    words.forEach(word => {
      if (positiveWords.includes(word)) sentiment += 0.1;
      if (negativeWords.includes(word)) sentiment -= 0.1;
    });
    
    return Math.max(-1, Math.min(1, sentiment));
  }

  private generateContentHash(content: string): string {
    // Simple hash function - in production, use proper hashing
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }
}

/**
 * Guardian API Collector
 */
export class GuardianCollector {
  private readonly apiKey = process.env.GUARDIAN_API_KEY;
  private readonly baseUrl = 'https://content.guardianapis.com';

  async collectNews(teams: string[], keywords: string[], maxArticles: number = 15): Promise<NewsArticle[]> {
    console.log('[Guardian] Collecting news for teams:', teams);
    const articles: NewsArticle[] = [];

    try {
      // For demo purposes, generate mock Guardian articles
      // In production, this would use the actual Guardian API
      
      const mockArticles = await this.generateMockGuardianArticles(teams, keywords, maxArticles);
      
      for (const article of mockArticles) {
        const newsArticle: NewsArticle = {
          id: `guardian_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          title: article.webTitle,
          content: article.body || article.webTitle,
          summary: article.summary,
          url: article.webUrl,
          source: 'guardian',
          source_name: 'The Guardian',
          author: article.author,
          published_at: article.webPublicationDate,
          collected_at: new Date().toISOString(),
          
          teams_mentioned: this.extractTeamMentions(article.webTitle + ' ' + (article.body || ''), teams),
          keywords_matched: this.extractKeywordMatches(article.webTitle + ' ' + (article.body || ''), keywords),
          relevance_score: this.calculateRelevance(article, teams, keywords),
          sentiment_score: this.analyzeSentiment(article.webTitle + ' ' + (article.body || '')),
          
          word_count: (article.body || article.webTitle).split(' ').length,
          language: 'en',
          has_quotes: (article.body || '').includes('"'),
          
          content_hash: this.generateContentHash(article.webTitle + (article.body || '')),
          similar_articles: []
        };

        articles.push(newsArticle);
      }

    } catch (error) {
      console.error('[Guardian] Collection failed:', error);
      throw error;
    }

    console.log(`[Guardian] Collected ${articles.length} articles`);
    return articles;
  }

  private async generateMockGuardianArticles(teams: string[], keywords: string[], maxArticles: number) {
    const mockArticles = [
      `${teams[0]} prepare for crucial ${teams[1]} clash with tactical changes`,
      `Analysis: Why ${teams[1]} hold the advantage over ${teams[0]}`,
      `${teams[0]} manager addresses injury concerns ahead of big match`,
      `Fans react to ${teams[0]} vs ${teams[1]} team selections`,
      `Historical perspective: ${teams[0]} and ${teams[1]} previous encounters`
    ];

    return Array.from({ length: Math.min(maxArticles, mockArticles.length) }, (_, i) => ({
      id: `guardian_${i}_${Date.now()}`,
      webTitle: mockArticles[i] || `${teams[0]} football news #${i + 1}`,
      webUrl: `https://www.theguardian.com/football/article-${i}`,
      webPublicationDate: new Date(Date.now() - Math.random() * 48 * 60 * 60 * 1000).toISOString(),
      body: `Professional analysis and reporting on ${teams[0]} vs ${teams[1]}. This would contain the full Guardian article content with detailed journalism and expert insights.`,
      summary: `Brief overview of the ${teams[0]} vs ${teams[1]} situation.`,
      author: ['Sports Correspondent', 'Football Reporter', 'Chief Sports Writer'][Math.floor(Math.random() * 3)]
    }));
  }

  private extractTeamMentions(text: string, teams: string[]): string[] {
    return teams.filter(team => 
      text.toLowerCase().includes(team.toLowerCase())
    );
  }

  private extractKeywordMatches(text: string, keywords: string[]): string[] {
    return keywords.filter(keyword =>
      text.toLowerCase().includes(keyword.toLowerCase())
    );
  }

  private calculateRelevance(article: any, teams: string[], keywords: string[]): number {
    let score = 0;
    
    // Team mentions
    teams.forEach(team => {
      if (article.webTitle.toLowerCase().includes(team.toLowerCase())) score += 0.4;
      if ((article.body || '').toLowerCase().includes(team.toLowerCase())) score += 0.3;
    });
    
    // Keyword matches
    keywords.forEach(keyword => {
      if (article.webTitle.toLowerCase().includes(keyword.toLowerCase())) score += 0.2;
      if ((article.body || '').toLowerCase().includes(keyword.toLowerCase())) score += 0.1;
    });
    
    // Guardian articles are high quality
    score += 0.3;
    
    return Math.min(1, score);
  }

  private analyzeSentiment(text: string): number {
    // Simple sentiment analysis
    const positiveWords = ['success', 'victory', 'confident', 'strong', 'impressive'];
    const negativeWords = ['concern', 'worry', 'struggle', 'doubt', 'pressure'];
    
    const words = text.toLowerCase().split(' ');
    let sentiment = 0;
    
    words.forEach(word => {
      if (positiveWords.includes(word)) sentiment += 0.1;
      if (negativeWords.includes(word)) sentiment -= 0.1;
    });
    
    return Math.max(-1, Math.min(1, sentiment));
  }

  private generateContentHash(content: string): string {
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  }
}

/**
 * RSS Feed Collector
 */
export class RSSCollector {
  private readonly feeds = [
    'https://www.bbc.com/sport/football/rss.xml',
    'https://www.skysports.com/rss/12040',
    'https://www.espn.com/espn/rss/soccer/news',
    'https://feeds.feedburner.com/football365'
  ];

  async collectNews(teams: string[], keywords: string[], maxArticles: number = 10): Promise<NewsArticle[]> {
    console.log('[RSS] Collecting news for teams:', teams);
    const articles: NewsArticle[] = [];

    try {
      // For demo purposes, generate mock RSS articles
      // In production, this would parse actual RSS feeds
      
      const mockRssItems = await this.generateMockRssItems(teams, keywords, maxArticles);
      
      for (const item of mockRssItems) {
        const article: NewsArticle = {
          id: `rss_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          title: item.title,
          content: item.description || item.title,
          url: item.link,
          source: 'rss',
          source_name: item.source,
          published_at: item.pubDate,
          collected_at: new Date().toISOString(),
          
          teams_mentioned: this.extractTeamMentions(item.title + ' ' + (item.description || ''), teams),
          keywords_matched: this.extractKeywordMatches(item.title + ' ' + (item.description || ''), keywords),
          relevance_score: this.calculateRelevance(item, teams, keywords),
          sentiment_score: this.analyzeSentiment(item.title + ' ' + (item.description || '')),
          
          word_count: (item.description || item.title).split(' ').length,
          language: 'en',
          has_quotes: (item.description || '').includes('"'),
          
          content_hash: this.generateContentHash(item.title + (item.description || '')),
          similar_articles: []
        };

        articles.push(article);
      }

    } catch (error) {
      console.error('[RSS] Collection failed:', error);
      throw error;
    }

    console.log(`[RSS] Collected ${articles.length} articles`);
    return articles;
  }

  private async generateMockRssItems(teams: string[], keywords: string[], maxArticles: number) {
    const sources = ['BBC Sport', 'Sky Sports', 'ESPN', 'Football365'];
    const mockTitles = [
      `Breaking: ${teams[0]} make key signing ahead of ${teams[1]} clash`,
      `${teams[1]} injury update could impact upcoming fixture`,
      `Match preview: ${teams[0]} vs ${teams[1]} tactical analysis`,
      `Quotes: ${teams[0]} manager speaks ahead of big game`,
      `Stats: ${teams[1]}'s recent form analysis`
    ];

    return Array.from({ length: Math.min(maxArticles, mockTitles.length) }, (_, i) => ({
      title: mockTitles[i] || `${teams[0]} football update #${i + 1}`,
      description: `RSS feed content about ${teams[0]} and ${teams[1]}. This would contain the article summary from the RSS feed.`,
      link: `https://sports-source.com/article-${i}`,
      pubDate: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
      source: sources[Math.floor(Math.random() * sources.length)]
    }));
  }

  private extractTeamMentions(text: string, teams: string[]): string[] {
    return teams.filter(team => 
      text.toLowerCase().includes(team.toLowerCase())
    );
  }

  private extractKeywordMatches(text: string, keywords: string[]): string[] {
    return keywords.filter(keyword =>
      text.toLowerCase().includes(keyword.toLowerCase())
    );
  }

  private calculateRelevance(item: any, teams: string[], keywords: string[]): number {
    let score = 0;
    
    teams.forEach(team => {
      if (item.title.toLowerCase().includes(team.toLowerCase())) score += 0.3;
      if ((item.description || '').toLowerCase().includes(team.toLowerCase())) score += 0.2;
    });
    
    keywords.forEach(keyword => {
      if (item.title.toLowerCase().includes(keyword.toLowerCase())) score += 0.2;
      if ((item.description || '').toLowerCase().includes(keyword.toLowerCase())) score += 0.1;
    });
    
    return Math.min(1, score);
  }

  private analyzeSentiment(text: string): number {
    const positiveWords = ['win', 'success', 'positive', 'boost', 'confident'];
    const negativeWords = ['lose', 'injury', 'concern', 'doubt', 'problem'];
    
    const words = text.toLowerCase().split(' ');
    let sentiment = 0;
    
    words.forEach(word => {
      if (positiveWords.includes(word)) sentiment += 0.1;
      if (negativeWords.includes(word)) sentiment -= 0.1;
    });
    
    return Math.max(-1, Math.min(1, sentiment));
  }

  private generateContentHash(content: string): string {
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  }
}

/**
 * Main News Aggregation Module
 */
export class NewsAggregationModule {
  private redditCollector = new RedditCollector();
  private guardianCollector = new GuardianCollector();
  private rssCollector = new RSSCollector();
  
  private collectionQueue: Array<{
    matchId: string;
    teams: string[];
    keywords: string[];
    sources: Array<'reddit' | 'guardian' | 'rss'>;
  }> = [];
  
  private isProcessing = false;

  constructor() {
    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    // Listen for enriched matches
    eventBus.on('match.enriched', async (event) => {
      console.log(`[NewsAggregation] Queueing news collection for match: ${event.data.match_id}`);
      await this.queueNewsCollection(event.data.match_id, event.data.team_data);
    });
  }

  async queueNewsCollection(matchId: string, teamData: any): Promise<void> {
    // Get match data to determine teams and keywords
    const { data: match } = await supabase
      .from('matches')
      .select('*, competition_rule_id')
      .eq('id', matchId)
      .single();

    if (!match) return;

    // Get competition configuration
    const config = competitionManager.getMatchConfig({
      league: match.league,
      home_team: match.home_team,
      away_team: match.away_team,
      kickoff_utc: match.kickoff_utc
    });

    if (!config) return;

    this.collectionQueue.push({
      matchId,
      teams: [match.home_team, match.away_team],
      keywords: config.news.keywords,
      sources: config.news.sources
    });

    if (!this.isProcessing) {
      this.processCollectionQueue();
    }
  }

  private async processCollectionQueue(): Promise<void> {
    if (this.isProcessing || this.collectionQueue.length === 0) return;

    this.isProcessing = true;
    console.log(`[NewsAggregation] Processing ${this.collectionQueue.length} news collection requests`);

    while (this.collectionQueue.length > 0) {
      const request = this.collectionQueue.shift()!;
      
      try {
        await this.collectNewsForMatch(request);
        
        // Rate limiting delay
        await new Promise(resolve => setTimeout(resolve, 5000));
        
      } catch (error) {
        console.error(`[NewsAggregation] Failed to collect news for match ${request.matchId}:`, error);
      }
    }

    this.isProcessing = false;
  }

  private async collectNewsForMatch(request: {
    matchId: string;
    teams: string[];
    keywords: string[];
    sources: Array<'reddit' | 'guardian' | 'rss'>;
  }): Promise<void> {
    console.log(`[NewsAggregation] Collecting news for match ${request.matchId}`);
    
    const allArticles: NewsArticle[] = [];
    const results: NewsCollectionResult[] = [];

    // Collect from each requested source
    for (const source of request.sources) {
      const startTime = Date.now();
      
      try {
        let articles: NewsArticle[] = [];
        
        switch (source) {
          case 'reddit':
            articles = await this.redditCollector.collectNews(request.teams, request.keywords, 20);
            break;
          case 'guardian':
            articles = await this.guardianCollector.collectNews(request.teams, request.keywords, 15);
            break;
          case 'rss':
            articles = await this.rssCollector.collectNews(request.teams, request.keywords, 10);
            break;
        }

        // Filter by relevance
        const relevantArticles = articles.filter(article => article.relevance_score >= 0.3);
        
        allArticles.push(...relevantArticles);
        
        results.push({
          source,
          collected: articles.length,
          filtered: articles.length - relevantArticles.length,
          duplicates: 0,
          errors: [],
          processing_time: Date.now() - startTime
        });

      } catch (error) {
        results.push({
          source,
          collected: 0,
          filtered: 0,
          duplicates: 0,
          errors: [error instanceof Error ? error.message : String(error)],
          processing_time: Date.now() - startTime
        });
      }
    }

    // Remove duplicates and store articles
    const uniqueArticles = this.deduplicateArticles(allArticles);
    await this.storeArticles(request.matchId, uniqueArticles);

    // Emit news collected event
    await emitEvent(
      'news.collected',
      'news-aggregation-module',
      {
        match_id: request.matchId,
        articles: uniqueArticles.map(article => ({
          id: article.id,
          title: article.title,
          content: article.content,
          source: article.source,
          url: article.url,
          published_at: article.published_at,
          relevance_score: article.relevance_score
        }))
      },
      `news_${request.matchId}`
    );

    console.log(`[NewsAggregation] Collected ${uniqueArticles.length} unique articles for match ${request.matchId}`);
  }

  private deduplicateArticles(articles: NewsArticle[]): NewsArticle[] {
    const uniqueArticles: NewsArticle[] = [];
    const seenHashes = new Set<string>();

    for (const article of articles) {
      if (!seenHashes.has(article.content_hash)) {
        seenHashes.add(article.content_hash);
        uniqueArticles.push(article);
      }
    }

    return uniqueArticles;
  }

  private async storeArticles(matchId: string, articles: NewsArticle[]): Promise<void> {
    if (articles.length === 0) return;

    const { error } = await supabase
      .from('match_news')
      .upsert(
        articles.map(article => ({
          ...article,
          match_id: matchId
        })),
        { onConflict: 'id' }
      );

    if (error) {
      throw new Error(`Failed to store articles: ${error.message}`);
    }
  }

  async getStats(): Promise<{
    queue_size: number;
    is_processing: boolean;
    articles_collected_today: number;
    avg_collection_time: number;
  }> {
    const today = new Date().toISOString().split('T')[0];
    
    const { count: articlesCollectedToday } = await supabase
      .from('match_news')
      .select('*', { count: 'exact', head: true })
      .gte('collected_at', `${today}T00:00:00Z`);

    return {
      queue_size: this.collectionQueue.length,
      is_processing: this.isProcessing,
      articles_collected_today: articlesCollectedToday || 0,
      avg_collection_time: 8.5 // seconds, mock value
    };
  }
}

// Export singleton instance
export const newsAggregationModule = new NewsAggregationModule();