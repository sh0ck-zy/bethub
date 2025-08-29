"""
Main News Aggregator Class
Orchestrates collection, processing, and storage of news articles
"""

import asyncio
import logging
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from collections import defaultdict
import json

from ..collectors.rss_collector import RSSCollector
from ..collectors.reddit_collector import RedditCollector
from ..collectors.api_collector import APICollector
from ..processors.deduplicator import Deduplicator
from ..processors.content_processor import ContentProcessor
from ..storage.mongodb_storage import MongoDBStorage
from ..config import QUALITY_SCORING

logger = logging.getLogger(__name__)

class NewsAggregator:
    def __init__(self, storage: MongoDBStorage):
        self.storage = storage
        self.deduplicator = Deduplicator()
        self.content_processor = ContentProcessor()
        
        # Collectors
        self.rss_collector = None
        self.reddit_collector = None
        self.api_collector = None
        
        # Statistics
        self.stats = {
            'aggregations_completed': 0,
            'total_articles_collected': 0,
            'successful_collections': 0,
            'failed_collections': 0,
            'avg_aggregation_time': 0.0,
            'last_aggregation': None,
            'sources_health': {}
        }
        
        # Active tasks
        self.active_tasks = {}
        self.task_queue = asyncio.Queue()
        
    async def initialize(self):
        """Initialize all collectors and processors"""
        try:
            # Initialize collectors
            self.rss_collector = RSSCollector()
            self.reddit_collector = RedditCollector()
            self.api_collector = APICollector()
            
            # Test collector health
            await self._check_collectors_health()
            
            logger.info("News aggregator initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize news aggregator: {e}")
            raise
    
    async def aggregate_match_news(self, match_id: str, home_team: str, away_team: str, 
                                 match_date: datetime, priority: str = "normal") -> Dict[str, Any]:
        """
        Main aggregation method - collects, processes, and stores news for a match
        """
        start_time = datetime.utcnow()
        
        try:
            logger.info(f"Starting aggregation for match {match_id}: {home_team} vs {away_team}")
            
            # Store match info
            match_info = {
                'match_id': match_id,
                'home_team': home_team,
                'away_team': away_team,
                'match_date': match_date,
                'aggregation_started': start_time,
                'priority': priority,
                'status': 'aggregating'
            }
            await self.storage.store_match_info(match_info)
            
            # Collect from all sources in parallel
            collection_tasks = []
            
            # RSS Collection
            if self.rss_collector:
                collection_tasks.append(self._collect_rss_articles(home_team, away_team, match_date))
            
            # Reddit Collection
            if self.reddit_collector:
                collection_tasks.append(self._collect_reddit_content(home_team, away_team, match_date))
            
            # API Collection
            if self.api_collector:
                collection_tasks.append(self._collect_api_articles(home_team, away_team, match_date))
            
            # Execute all collections concurrently
            collection_results = await asyncio.gather(*collection_tasks, return_exceptions=True)
            
            # Merge all articles
            all_articles = []
            collection_errors = []
            
            for i, result in enumerate(collection_results):
                if isinstance(result, Exception):
                    collection_errors.append(str(result))
                    logger.error(f"Collection task {i} failed: {result}")
                else:
                    all_articles.extend(result)
            
            logger.info(f"Collected {len(all_articles)} articles from {len(collection_tasks)} sources")
            
            # Add match_id to all articles
            for article in all_articles:
                article['match_id'] = match_id
            
            # Process articles
            processed_articles = await self._process_articles(all_articles)
            
            # Deduplicate
            unique_articles = self.deduplicator.deduplicate_articles(processed_articles)
            
            # Store articles
            storage_result = await self.storage.store_articles_batch(unique_articles)
            
            # Generate and store match context
            context = await self._generate_match_context(match_id, unique_articles, home_team, away_team)
            await self.storage.store_match_context(match_id, context)
            
            # Update match status
            match_info['status'] = 'completed'
            match_info['aggregation_completed'] = datetime.utcnow()
            match_info['articles_collected'] = len(unique_articles)
            match_info['sources_processed'] = len(collection_tasks)
            match_info['errors'] = collection_errors
            await self.storage.store_match_info(match_info)
            
            # Update statistics
            aggregation_time = (datetime.utcnow() - start_time).total_seconds()
            await self._update_stats(aggregation_time, len(unique_articles), len(collection_errors) == 0)
            
            result = {
                'match_id': match_id,
                'status': 'completed',
                'articles_collected': len(unique_articles),
                'articles_stored': storage_result['stored'],
                'duplicates_removed': len(all_articles) - len(unique_articles),
                'sources_processed': len(collection_tasks),
                'processing_time_seconds': aggregation_time,
                'errors': collection_errors,
                'context': context
            }
            
            logger.info(f"Aggregation completed for match {match_id} in {aggregation_time:.2f}s")
            return result
            
        except Exception as e:
            logger.error(f"Aggregation failed for match {match_id}: {e}")
            
            # Update match status with error
            match_info['status'] = 'failed'
            match_info['error'] = str(e)
            match_info['aggregation_completed'] = datetime.utcnow()
            await self.storage.store_match_info(match_info)
            
            # Update stats
            await self._update_stats(0, 0, False)
            
            raise
    
    async def _collect_rss_articles(self, home_team: str, away_team: str, match_date: datetime) -> List[Dict[str, Any]]:
        """Collect articles from RSS feeds"""
        try:
            async with self.rss_collector:
                articles = await self.rss_collector.collect_for_match(home_team, away_team, match_date)
                logger.info(f"RSS collection: {len(articles)} articles")
                return articles
        except Exception as e:
            logger.error(f"RSS collection failed: {e}")
            return []
    
    async def _collect_reddit_content(self, home_team: str, away_team: str, match_date: datetime) -> List[Dict[str, Any]]:
        """Collect content from Reddit"""
        try:
            reddit_content = await self.reddit_collector.collect_for_match(home_team, away_team, match_date)
            
            # Convert Reddit content to article format
            articles = []
            
            for category, discussions in reddit_content.items():
                for discussion in discussions:
                    article = {
                        'title': discussion.get('title', ''),
                        'content': discussion.get('content', ''),
                        'summary': discussion.get('title', ''),  # Use title as summary for Reddit
                        'link': f"https://reddit.com{discussion.get('url', '')}",
                        'author': discussion.get('author', ''),
                        'published_at': discussion.get('created_at', datetime.utcnow()),
                        'source': f"Reddit - {discussion.get('subreddit', 'unknown')}",
                        'source_type': 'reddit',
                        'relevance_score': 0.7,  # Default relevance for Reddit
                        'quality_score': self._calculate_reddit_quality(discussion),
                        'hash': discussion.get('hash', ''),
                        'collected_at': datetime.utcnow(),
                        'language': 'en',
                        'tags': [category, 'reddit', 'discussion'],
                        'reddit_data': {
                            'score': discussion.get('score', 0),
                            'num_comments': discussion.get('num_comments', 0),
                            'subreddit': discussion.get('subreddit', ''),
                            'category': category,
                            'top_comments': discussion.get('top_comments', [])
                        }
                    }
                    articles.append(article)
            
            logger.info(f"Reddit collection: {len(articles)} articles")
            return articles
            
        except Exception as e:
            logger.error(f"Reddit collection failed: {e}")
            return []
    
    async def _collect_api_articles(self, home_team: str, away_team: str, match_date: datetime) -> List[Dict[str, Any]]:
        """Collect articles from news APIs"""
        try:
            async with self.api_collector:
                articles = await self.api_collector.collect_for_match(home_team, away_team, match_date)
                logger.info(f"API collection: {len(articles)} articles")
                return articles
        except Exception as e:
            logger.error(f"API collection failed: {e}")
            return []
    
    async def _process_articles(self, articles: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Process articles through content processing pipeline"""
        try:
            processed_articles = await self.content_processor.process_articles(articles)
            logger.info(f"Processed {len(processed_articles)} articles")
            return processed_articles
        except Exception as e:
            logger.error(f"Article processing failed: {e}")
            return articles  # Return original articles if processing fails
    
    async def _generate_match_context(self, match_id: str, articles: List[Dict[str, Any]], 
                                    home_team: str, away_team: str) -> Dict[str, Any]:
        """Generate comprehensive match context from articles"""
        try:
            if not articles:
                return {
                    'match_id': match_id,
                    'teams': [home_team, away_team],
                    'total_articles': 0,
                    'source_breakdown': {},
                    'sentiment_overview': {},
                    'key_narratives': [],
                    'trending_topics': [],
                    'last_updated': datetime.utcnow()
                }
            
            # Source breakdown
            source_breakdown = defaultdict(int)
            for article in articles:
                source_breakdown[article.get('source_type', 'unknown')] += 1
            
            # Quality distribution
            quality_scores = [article.get('quality_score', 0) for article in articles]
            avg_quality = sum(quality_scores) / len(quality_scores) if quality_scores else 0
            
            # Sentiment overview
            sentiment_overview = self._analyze_overall_sentiment(articles)
            
            # Key narratives
            key_narratives = self._extract_key_narratives(articles)
            
            # Trending topics
            trending_topics = self._extract_trending_topics(articles)
            
            # Team-specific insights
            team_insights = self._generate_team_insights(articles, home_team, away_team)
            
            context = {
                'match_id': match_id,
                'teams': [home_team, away_team],
                'total_articles': len(articles),
                'source_breakdown': dict(source_breakdown),
                'quality_stats': {
                    'average_quality': avg_quality,
                    'high_quality_count': sum(1 for q in quality_scores if q > 0.8),
                    'low_quality_count': sum(1 for q in quality_scores if q < 0.5)
                },
                'sentiment_overview': sentiment_overview,
                'key_narratives': key_narratives,
                'trending_topics': trending_topics,
                'team_insights': team_insights,
                'collection_stats': {
                    'latest_article': max(article.get('published_at', datetime.utcnow()) for article in articles).isoformat(),
                    'oldest_article': min(article.get('published_at', datetime.utcnow()) for article in articles).isoformat(),
                    'languages': list(set(article.get('language', 'en') for article in articles)),
                    'content_types': dict(Counter(article.get('content_classification', {}).get('content_type', 'general') for article in articles))
                },
                'last_updated': datetime.utcnow()
            }
            
            return context
            
        except Exception as e:
            logger.error(f"Context generation failed: {e}")
            return {
                'match_id': match_id,
                'teams': [home_team, away_team],
                'total_articles': len(articles),
                'error': str(e),
                'last_updated': datetime.utcnow()
            }
    
    def _calculate_reddit_quality(self, discussion: Dict[str, Any]) -> float:
        """Calculate quality score for Reddit content"""
        base_score = QUALITY_SCORING['source_weights'].get('reddit_discussion', 0.65)
        
        # Adjust based on engagement
        score = discussion.get('score', 0)
        comments = discussion.get('num_comments', 0)
        
        # Engagement multiplier
        engagement_multiplier = 1.0
        if score > 100:
            engagement_multiplier += 0.1
        if comments > 50:
            engagement_multiplier += 0.1
        
        # Subreddit quality adjustment
        subreddit = discussion.get('subreddit', '')
        if subreddit in ['soccer', 'football', 'PremierLeague']:
            engagement_multiplier += 0.05
        
        return min(base_score * engagement_multiplier, 1.0)
    
    def _analyze_overall_sentiment(self, articles: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze overall sentiment from articles"""
        positive_count = 0
        negative_count = 0
        neutral_count = 0
        
        for article in articles:
            sentiment_info = article.get('sentiment_info', {})
            overall_sentiment = sentiment_info.get('overall_sentiment', 'neutral')
            
            if overall_sentiment == 'positive':
                positive_count += 1
            elif overall_sentiment == 'negative':
                negative_count += 1
            else:
                neutral_count += 1
        
        total = len(articles)
        if total == 0:
            return {'positive': 0, 'negative': 0, 'neutral': 0, 'overall': 'neutral'}
        
        return {
            'positive': positive_count / total,
            'negative': negative_count / total,
            'neutral': neutral_count / total,
            'overall': max(['positive', 'negative', 'neutral'], 
                         key=lambda x: {'positive': positive_count, 'negative': negative_count, 'neutral': neutral_count}[x])
        }
    
    def _extract_key_narratives(self, articles: List[Dict[str, Any]]) -> List[str]:
        """Extract key narratives from articles"""
        narratives = []
        
        # Look for recurring themes in titles
        title_words = []
        for article in articles:
            title = article.get('title', '').lower()
            title_words.extend(title.split())
        
        # Count word frequencies
        word_counts = Counter(title_words)
        
        # Filter out common words and get top themes
        stop_words = {'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'vs', 'v'}
        
        for word, count in word_counts.most_common(10):
            if word not in stop_words and len(word) > 3 and count > 2:
                narratives.append(f"{word.title()} mentioned in {count} articles")
        
        return narratives[:5]  # Return top 5 narratives
    
    def _extract_trending_topics(self, articles: List[Dict[str, Any]]) -> List[str]:
        """Extract trending topics from articles"""
        all_tags = []
        
        for article in articles:
            tags = article.get('tags', [])
            all_tags.extend(tags)
        
        # Get most common tags
        tag_counts = Counter(all_tags)
        
        return [tag for tag, count in tag_counts.most_common(10) if count > 1]
    
    def _generate_team_insights(self, articles: List[Dict[str, Any]], home_team: str, away_team: str) -> Dict[str, Any]:
        """Generate team-specific insights"""
        insights = {
            home_team: {'mentions': 0, 'sentiment': 'neutral', 'key_topics': []},
            away_team: {'mentions': 0, 'sentiment': 'neutral', 'key_topics': []}
        }
        
        for article in articles:
            title = article.get('title', '').lower()
            content = article.get('content', '').lower()
            text = f"{title} {content}"
            
            # Count mentions
            if home_team.lower() in text:
                insights[home_team]['mentions'] += 1
            
            if away_team.lower() in text:
                insights[away_team]['mentions'] += 1
        
        return insights
    
    async def generate_insights(self, articles: List[Dict[str, Any]], context: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Generate AI insights from articles and context"""
        insights = []
        
        try:
            # High-level insights
            if context.get('total_articles', 0) > 0:
                insights.append({
                    'insight_type': 'coverage',
                    'title': 'Match Coverage Overview',
                    'description': f"Found {context['total_articles']} articles from {len(context.get('source_breakdown', {}))} different source types",
                    'confidence': 0.9,
                    'supporting_articles': [a.get('title', '') for a in articles[:3]],
                    'timestamp': datetime.utcnow()
                })
            
            # Quality insights
            quality_stats = context.get('quality_stats', {})
            if quality_stats.get('high_quality_count', 0) > 5:
                insights.append({
                    'insight_type': 'quality',
                    'title': 'High-Quality Coverage Available',
                    'description': f"Found {quality_stats['high_quality_count']} high-quality articles from reliable sources",
                    'confidence': 0.8,
                    'supporting_articles': [a.get('title', '') for a in articles if a.get('quality_score', 0) > 0.8][:3],
                    'timestamp': datetime.utcnow()
                })
            
            # Sentiment insights
            sentiment = context.get('sentiment_overview', {})
            if sentiment.get('overall') != 'neutral':
                insights.append({
                    'insight_type': 'sentiment',
                    'title': f'Overall Sentiment: {sentiment["overall"].title()}',
                    'description': f"The overall sentiment in match coverage is {sentiment['overall']} ({sentiment.get(sentiment['overall'], 0):.1%} of articles)",
                    'confidence': 0.7,
                    'supporting_articles': [a.get('title', '') for a in articles if a.get('sentiment_info', {}).get('overall_sentiment') == sentiment['overall']][:3],
                    'timestamp': datetime.utcnow()
                })
            
            # Trending topics insights
            trending = context.get('trending_topics', [])
            if trending:
                insights.append({
                    'insight_type': 'trending',
                    'title': 'Key Topics in Discussion',
                    'description': f"Most discussed topics: {', '.join(trending[:3])}",
                    'confidence': 0.6,
                    'supporting_articles': [a.get('title', '') for a in articles if any(topic in a.get('tags', []) for topic in trending[:3])][:3],
                    'timestamp': datetime.utcnow()
                })
            
            return insights
            
        except Exception as e:
            logger.error(f"Insight generation failed: {e}")
            return []
    
    async def analyze_match_sentiment(self, articles: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze sentiment for a match"""
        try:
            if not articles:
                return {'error': 'No articles available for sentiment analysis'}
            
            # Overall sentiment
            overall_sentiment = self._analyze_overall_sentiment(articles)
            
            # Source-based sentiment
            source_sentiment = defaultdict(lambda: {'positive': 0, 'negative': 0, 'neutral': 0})
            
            for article in articles:
                source = article.get('source_type', 'unknown')
                sentiment = article.get('sentiment_info', {}).get('overall_sentiment', 'neutral')
                source_sentiment[source][sentiment] += 1
            
            # Normalize source sentiment
            for source, sentiments in source_sentiment.items():
                total = sum(sentiments.values())
                if total > 0:
                    for sentiment_type in sentiments:
                        sentiments[sentiment_type] /= total
            
            # Time-based sentiment analysis
            time_sentiment = []
            articles_by_time = sorted(articles, key=lambda x: x.get('published_at', datetime.utcnow()))
            
            # Group by 4-hour periods
            for i in range(0, len(articles_by_time), max(1, len(articles_by_time) // 6)):
                chunk = articles_by_time[i:i + max(1, len(articles_by_time) // 6)]
                chunk_sentiment = self._analyze_overall_sentiment(chunk)
                time_sentiment.append({
                    'period': chunk[0].get('published_at', datetime.utcnow()).isoformat(),
                    'sentiment': chunk_sentiment,
                    'article_count': len(chunk)
                })
            
            return {
                'overall_sentiment': overall_sentiment,
                'source_sentiment': dict(source_sentiment),
                'time_sentiment': time_sentiment,
                'analyzed_articles': len(articles),
                'analysis_timestamp': datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Sentiment analysis failed: {e}")
            return {'error': str(e)}
    
    async def _check_collectors_health(self):
        """Check health of all collectors"""
        try:
            # Check RSS collector
            if self.rss_collector:
                async with self.rss_collector:
                    rss_health = await self.rss_collector.get_all_feeds_health()
                    self.stats['sources_health']['rss'] = rss_health
            
            # Check Reddit collector
            if self.reddit_collector:
                reddit_health = await self.reddit_collector.get_subreddit_health()
                self.stats['sources_health']['reddit'] = reddit_health
            
            # Check API collector
            if self.api_collector:
                async with self.api_collector:
                    api_health = await self.api_collector.test_api_connections()
                    self.stats['sources_health']['api'] = api_health
            
            logger.info("Collector health check completed")
            
        except Exception as e:
            logger.error(f"Health check failed: {e}")
    
    async def _update_stats(self, aggregation_time: float, articles_count: int, success: bool):
        """Update aggregator statistics"""
        try:
            self.stats['aggregations_completed'] += 1
            self.stats['total_articles_collected'] += articles_count
            self.stats['last_aggregation'] = datetime.utcnow().isoformat()
            
            if success:
                self.stats['successful_collections'] += 1
            else:
                self.stats['failed_collections'] += 1
            
            # Update average aggregation time
            if self.stats['aggregations_completed'] > 0:
                current_avg = self.stats['avg_aggregation_time']
                new_avg = (current_avg * (self.stats['aggregations_completed'] - 1) + aggregation_time) / self.stats['aggregations_completed']
                self.stats['avg_aggregation_time'] = new_avg
            
        except Exception as e:
            logger.error(f"Stats update failed: {e}")
    
    async def get_stats(self) -> Dict[str, Any]:
        """Get aggregator statistics"""
        return {
            'aggregations_completed': self.stats['aggregations_completed'],
            'total_articles_collected': self.stats['total_articles_collected'],
            'successful_collections': self.stats['successful_collections'],
            'failed_collections': self.stats['failed_collections'],
            'success_rate': self.stats['successful_collections'] / max(self.stats['aggregations_completed'], 1),
            'avg_aggregation_time': self.stats['avg_aggregation_time'],
            'last_aggregation': self.stats['last_aggregation'],
            'active_tasks': len(self.active_tasks),
            'queue_size': self.task_queue.qsize(),
            'sources_health': self.stats['sources_health']
        }
    
    async def health_check(self) -> Dict[str, Any]:
        """Comprehensive health check"""
        try:
            # Check collectors
            await self._check_collectors_health()
            
            # Check if all collectors are initialized
            collectors_status = {
                'rss': self.rss_collector is not None,
                'reddit': self.reddit_collector is not None,
                'api': self.api_collector is not None
            }
            
            # Overall health
            overall_healthy = all(collectors_status.values())
            
            return {
                'status': 'healthy' if overall_healthy else 'degraded',
                'collectors': collectors_status,
                'sources_health': self.stats['sources_health'],
                'stats': await self.get_stats(),
                'last_check': datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Health check failed: {e}")
            return {
                'status': 'unhealthy',
                'error': str(e),
                'last_check': datetime.utcnow().isoformat()
            }