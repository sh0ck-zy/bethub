"""
Reddit Collector - Free API for Match Context and Fan Sentiment
Collects match threads, discussions, and fan reactions from Reddit
"""

import asyncio
import logging
from datetime import datetime, timedelta
from typing import List, Dict, Optional, Any
import re
import hashlib

try:
    import praw
    import prawcore
    PRAW_AVAILABLE = True
except ImportError:
    PRAW_AVAILABLE = False
    logging.warning("PRAW not available. Reddit collection will be disabled.")

from ..config import REDDIT_CONFIG, TEAM_SUBREDDITS, RATE_LIMITS

logger = logging.getLogger(__name__)

class RedditCollector:
    def __init__(self):
        self.config = REDDIT_CONFIG
        self.team_subreddits = TEAM_SUBREDDITS
        self.rate_limiter = asyncio.Semaphore(RATE_LIMITS['reddit_api']['concurrent_requests'])
        self.reddit = None
        
        if PRAW_AVAILABLE and self.config['client_id'] and self.config['client_secret']:
            self._initialize_reddit()
    
    def _initialize_reddit(self):
        """Initialize Reddit API client"""
        try:
            self.reddit = praw.Reddit(
                client_id=self.config['client_id'],
                client_secret=self.config['client_secret'],
                user_agent=self.config['user_agent'],
                ratelimit_seconds=600,  # 10 minutes
                check_for_async=False
            )
            self.reddit.read_only = True
            logger.info("Reddit API initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize Reddit API: {e}")
            self.reddit = None
    
    async def collect_for_match(self, home_team: str, away_team: str, match_date: datetime) -> Dict[str, List[Dict[str, Any]]]:
        """Collect Reddit content for a specific match"""
        if not self.reddit:
            logger.warning("Reddit API not available")
            return {
                'match_threads': [],
                'pre_match_discussions': [],
                'post_match_discussions': [],
                'team_discussions': [],
                'general_discussions': []
            }
        
        queries = self._build_queries(home_team, away_team, match_date)
        
        # Collect from different sources
        tasks = [
            self._collect_match_threads(queries),
            self._collect_team_discussions(queries),
            self._collect_general_discussions(queries),
        ]
        
        try:
            results = await asyncio.gather(*tasks, return_exceptions=True)
            
            match_threads = results[0] if not isinstance(results[0], Exception) else []
            team_discussions = results[1] if not isinstance(results[1], Exception) else []
            general_discussions = results[2] if not isinstance(results[2], Exception) else []
            
            # Categorize discussions
            categorized = self._categorize_discussions(match_threads + team_discussions + general_discussions, queries)
            
            return categorized
            
        except Exception as e:
            logger.error(f"Error collecting Reddit content: {e}")
            return {
                'match_threads': [],
                'pre_match_discussions': [],
                'post_match_discussions': [],
                'team_discussions': [],
                'general_discussions': []
            }
    
    def _build_queries(self, home_team: str, away_team: str, match_date: datetime) -> Dict[str, Any]:
        """Build search queries for Reddit"""
        return {
            'teams': [home_team, away_team],
            'match_queries': [
                f"{home_team} vs {away_team}",
                f"{away_team} vs {home_team}",
                f"{home_team} v {away_team}",
                f"{away_team} v {home_team}",
            ],
            'team_queries': [
                home_team,
                away_team,
            ],
            'date_range': (match_date - timedelta(days=2), match_date + timedelta(days=1)),
            'keywords': [
                'match thread', 'pre match', 'post match', 'vs', 'v',
                'lineup', 'team news', 'injury', 'preview', 'prediction'
            ],
            'subreddits': ['soccer', 'football', 'PremierLeague', 'ChampionsLeague'] + list(self.team_subreddits.values())
        }
    
    async def _collect_match_threads(self, queries: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Collect official match threads from r/soccer"""
        async with self.rate_limiter:
            try:
                soccer_sub = self.reddit.subreddit("soccer")
                submissions = []
                
                # Search for match threads
                for query in queries['match_queries']:
                    search_results = soccer_sub.search(query, time_filter='week', limit=20)
                    
                    for submission in search_results:
                        if self._is_match_thread(submission, queries):
                            data = self._extract_submission_data(submission)
                            if data:
                                submissions.append(data)
                
                return submissions
                
            except Exception as e:
                logger.error(f"Error collecting match threads: {e}")
                return []
    
    async def _collect_team_discussions(self, queries: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Collect discussions from team-specific subreddits"""
        async with self.rate_limiter:
            try:
                submissions = []
                
                for team in queries['teams']:
                    if team in self.team_subreddits:
                        sub_name = self.team_subreddits[team]
                        try:
                            team_sub = self.reddit.subreddit(sub_name)
                            
                            # Get hot posts
                            for submission in team_sub.hot(limit=25):
                                if self._is_relevant_to_match(submission, queries):
                                    data = self._extract_submission_data(submission)
                                    if data:
                                        data['team_subreddit'] = sub_name
                                        submissions.append(data)
                            
                            # Get new posts
                            for submission in team_sub.new(limit=25):
                                if self._is_relevant_to_match(submission, queries):
                                    data = self._extract_submission_data(submission)
                                    if data:
                                        data['team_subreddit'] = sub_name
                                        submissions.append(data)
                                        
                        except Exception as e:
                            logger.error(f"Error accessing {sub_name}: {e}")
                            continue
                
                return submissions
                
            except Exception as e:
                logger.error(f"Error collecting team discussions: {e}")
                return []
    
    async def _collect_general_discussions(self, queries: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Collect general football discussions"""
        async with self.rate_limiter:
            try:
                submissions = []
                general_subs = ['soccer', 'football', 'PremierLeague', 'ChampionsLeague', 'footballtactics']
                
                for sub_name in general_subs:
                    try:
                        subreddit = self.reddit.subreddit(sub_name)
                        
                        # Search for relevant discussions
                        for query in queries['team_queries']:
                            search_results = subreddit.search(query, time_filter='week', limit=15)
                            
                            for submission in search_results:
                                if self._is_relevant_to_match(submission, queries):
                                    data = self._extract_submission_data(submission)
                                    if data:
                                        data['source_subreddit'] = sub_name
                                        submissions.append(data)
                                        
                    except Exception as e:
                        logger.error(f"Error accessing {sub_name}: {e}")
                        continue
                
                return submissions
                
            except Exception as e:
                logger.error(f"Error collecting general discussions: {e}")
                return []
    
    def _is_match_thread(self, submission: Any, queries: Dict[str, Any]) -> bool:
        """Check if submission is a match thread"""
        title = submission.title.lower()
        
        # Look for match thread indicators
        match_indicators = ['match thread', 'live thread', 'game thread', 'vs', 'v']
        has_indicator = any(indicator in title for indicator in match_indicators)
        
        if not has_indicator:
            return False
        
        # Check for team names
        has_teams = any(team.lower() in title for team in queries['teams'])
        
        # Check date relevance
        created_date = datetime.utcfromtimestamp(submission.created_utc)
        date_relevant = queries['date_range'][0] <= created_date <= queries['date_range'][1]
        
        return has_teams and date_relevant
    
    def _is_relevant_to_match(self, submission: Any, queries: Dict[str, Any]) -> bool:
        """Check if submission is relevant to the match"""
        title = submission.title.lower()
        content = getattr(submission, 'selftext', '').lower()
        text = f"{title} {content}"
        
        # Check for team mentions
        has_teams = any(team.lower() in text for team in queries['teams'])
        
        if not has_teams:
            return False
        
        # Check date relevance
        created_date = datetime.utcfromtimestamp(submission.created_utc)
        date_relevant = queries['date_range'][0] <= created_date <= queries['date_range'][1]
        
        # Check for relevant keywords
        has_keywords = any(keyword in text for keyword in queries['keywords'])
        
        return date_relevant and (has_keywords or any(query.lower() in text for query in queries['match_queries']))
    
    def _extract_submission_data(self, submission: Any) -> Optional[Dict[str, Any]]:
        """Extract data from Reddit submission"""
        try:
            # Basic submission data
            data = {
                'id': submission.id,
                'title': submission.title,
                'content': getattr(submission, 'selftext', ''),
                'url': submission.url,
                'score': submission.score,
                'upvote_ratio': getattr(submission, 'upvote_ratio', 0),
                'num_comments': submission.num_comments,
                'created_utc': submission.created_utc,
                'created_at': datetime.utcfromtimestamp(submission.created_utc),
                'author': str(submission.author) if submission.author else '[deleted]',
                'subreddit': str(submission.subreddit),
                'flair': getattr(submission, 'link_flair_text', ''),
                'is_stickied': getattr(submission, 'stickied', False),
                'is_locked': getattr(submission, 'locked', False),
                'source_type': 'reddit',
                'hash': self._generate_hash(submission.title, submission.id),
                'collected_at': datetime.utcnow(),
            }
            
            # Extract top comments
            try:
                submission.comments.replace_more(limit=0)  # Remove "more comments"
                top_comments = []
                
                for comment in submission.comments[:10]:  # Top 10 comments
                    if hasattr(comment, 'body') and comment.body != '[deleted]':
                        comment_data = {
                            'id': comment.id,
                            'body': comment.body,
                            'score': comment.score,
                            'author': str(comment.author) if comment.author else '[deleted]',
                            'created_utc': comment.created_utc,
                            'is_submitter': comment.is_submitter,
                            'controversiality': getattr(comment, 'controversiality', 0),
                        }
                        top_comments.append(comment_data)
                
                data['top_comments'] = top_comments
                
            except Exception as e:
                logger.warning(f"Error extracting comments for {submission.id}: {e}")
                data['top_comments'] = []
            
            # Calculate engagement metrics
            data['engagement_score'] = self._calculate_engagement_score(data)
            data['sentiment_indicators'] = self._extract_sentiment_indicators(data)
            
            return data
            
        except Exception as e:
            logger.error(f"Error extracting submission data: {e}")
            return None
    
    def _categorize_discussions(self, discussions: List[Dict[str, Any]], queries: Dict[str, Any]) -> Dict[str, List[Dict[str, Any]]]:
        """Categorize discussions by type"""
        categorized = {
            'match_threads': [],
            'pre_match_discussions': [],
            'post_match_discussions': [],
            'team_discussions': [],
            'general_discussions': []
        }
        
        for discussion in discussions:
            title = discussion['title'].lower()
            
            # Match threads
            if any(indicator in title for indicator in ['match thread', 'live thread', 'game thread']):
                categorized['match_threads'].append(discussion)
            
            # Pre-match discussions
            elif any(indicator in title for indicator in ['pre match', 'preview', 'prediction', 'lineup']):
                categorized['pre_match_discussions'].append(discussion)
            
            # Post-match discussions
            elif any(indicator in title for indicator in ['post match', 'full time', 'result', 'highlights']):
                categorized['post_match_discussions'].append(discussion)
            
            # Team-specific discussions
            elif discussion.get('team_subreddit'):
                categorized['team_discussions'].append(discussion)
            
            # General discussions
            else:
                categorized['general_discussions'].append(discussion)
        
        return categorized
    
    def _calculate_engagement_score(self, data: Dict[str, Any]) -> float:
        """Calculate engagement score based on Reddit metrics"""
        score = 0.0
        
        # Score based on upvotes
        score += min(data['score'] * 0.001, 1.0)
        
        # Score based on comments
        score += min(data['num_comments'] * 0.002, 1.0)
        
        # Score based on upvote ratio
        score += data.get('upvote_ratio', 0) * 0.5
        
        # Bonus for stickied posts
        if data.get('is_stickied'):
            score += 0.3
        
        # Bonus for active discussions
        if data['num_comments'] > 100:
            score += 0.2
        
        return min(score, 1.0)
    
    def _extract_sentiment_indicators(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Extract sentiment indicators from Reddit content"""
        text = f"{data['title']} {data['content']}"
        
        # Simple sentiment keywords
        positive_words = ['excited', 'confident', 'optimistic', 'great', 'amazing', 'brilliant']
        negative_words = ['worried', 'concerned', 'terrible', 'awful', 'disaster', 'disappointing']
        
        positive_count = sum(1 for word in positive_words if word in text.lower())
        negative_count = sum(1 for word in negative_words if word in text.lower())
        
        return {
            'positive_indicators': positive_count,
            'negative_indicators': negative_count,
            'engagement_level': 'high' if data['num_comments'] > 50 else 'medium' if data['num_comments'] > 10 else 'low',
            'controversy_level': 'high' if data.get('upvote_ratio', 1) < 0.7 else 'low'
        }
    
    def _generate_hash(self, title: str, reddit_id: str) -> str:
        """Generate unique hash for deduplication"""
        content = f"{title}{reddit_id}"
        return hashlib.md5(content.encode('utf-8')).hexdigest()
    
    async def get_subreddit_health(self) -> Dict[str, Dict[str, Any]]:
        """Check health of relevant subreddits"""
        if not self.reddit:
            return {}
        
        health_results = {}
        subreddits_to_check = ['soccer', 'football', 'PremierLeague'] + list(self.team_subreddits.values())
        
        for sub_name in subreddits_to_check:
            try:
                subreddit = self.reddit.subreddit(sub_name)
                
                # Try to get recent posts
                recent_posts = list(subreddit.new(limit=5))
                
                health_results[sub_name] = {
                    'status': 'healthy' if len(recent_posts) > 0 else 'unhealthy',
                    'recent_posts_count': len(recent_posts),
                    'last_checked': datetime.utcnow().isoformat(),
                    'accessible': True
                }
                
            except Exception as e:
                health_results[sub_name] = {
                    'status': 'error',
                    'error': str(e),
                    'last_checked': datetime.utcnow().isoformat(),
                    'accessible': False
                }
        
        return health_results
    
    async def get_trending_topics(self, queries: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Get trending topics related to the match"""
        if not self.reddit:
            return []
        
        try:
            soccer_sub = self.reddit.subreddit("soccer")
            hot_posts = list(soccer_sub.hot(limit=50))
            
            relevant_topics = []
            for post in hot_posts:
                if self._is_relevant_to_match(post, queries):
                    topic_data = {
                        'title': post.title,
                        'score': post.score,
                        'comments': post.num_comments,
                        'created_at': datetime.utcfromtimestamp(post.created_utc),
                        'url': post.url,
                        'trending_score': post.score + (post.num_comments * 2)
                    }
                    relevant_topics.append(topic_data)
            
            # Sort by trending score
            relevant_topics.sort(key=lambda x: x['trending_score'], reverse=True)
            
            return relevant_topics[:10]
            
        except Exception as e:
            logger.error(f"Error getting trending topics: {e}")
            return []