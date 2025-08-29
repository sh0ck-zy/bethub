"""
Nitter RSS Collector - Twitter Data via Free RSS Feeds
Collects Twitter content without using the Twitter API by leveraging Nitter instances
"""

import asyncio
import aiohttp
import feedparser
import logging
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
import hashlib
import re
from urllib.parse import urljoin

from ..config import NITTER_INSTANCES, TWITTER_ACCOUNTS, RATE_LIMITS, DEFAULT_HEADERS

logger = logging.getLogger(__name__)

class NitterCollector:
    def __init__(self):
        self.nitter_instances = NITTER_INSTANCES
        self.twitter_accounts = TWITTER_ACCOUNTS
        self.headers = DEFAULT_HEADERS.copy()
        self.current_instance = 0
        self.session = None
        
        # Track instance health
        self.instance_health = {instance: True for instance in self.nitter_instances}
        
        # Rate limiting
        self.rate_limiter = asyncio.Semaphore(RATE_LIMITS['web_scraping']['concurrent_requests'])
        
    async def __aenter__(self):
        timeout = aiohttp.ClientTimeout(total=30)
        self.session = aiohttp.ClientSession(
            timeout=timeout,
            headers=self.headers,
            connector=aiohttp.TCPConnector(limit=10)
        )
        return self
        
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def collect_for_match(self, home_team: str, away_team: str, match_date: datetime) -> List[Dict[str, Any]]:
        """Collect Twitter content via Nitter RSS for a specific match"""
        queries = self._build_queries(home_team, away_team, match_date)
        
        # Get relevant Twitter accounts
        relevant_accounts = self._get_relevant_accounts(home_team, away_team)
        
        # Collect from all accounts
        tasks = []
        for account in relevant_accounts:
            task = self._collect_from_account(account, queries)
            tasks.append(task)
        
        # Execute all tasks concurrently
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Merge results
        all_tweets = []
        for result in results:
            if isinstance(result, Exception):
                logger.error(f"Nitter collection error: {result}")
                continue
            all_tweets.extend(result)
        
        # Sort by relevance and recency
        all_tweets.sort(key=lambda x: (x['relevance_score'], x['published_at']), reverse=True)
        
        logger.info(f"Collected {len(all_tweets)} tweets from {len(relevant_accounts)} accounts")
        return all_tweets
    
    def _build_queries(self, home_team: str, away_team: str, match_date: datetime) -> Dict[str, Any]:
        """Build search queries for Twitter content"""
        from ..config import TEAM_VARIATIONS
        
        # Get team variations
        home_variations = TEAM_VARIATIONS.get(home_team, [home_team])
        away_variations = TEAM_VARIATIONS.get(away_team, [away_team])
        
        return {
            'teams': [home_team, away_team],
            'all_variations': home_variations + away_variations,
            'match_terms': [
                f"{home_team} vs {away_team}",
                f"{away_team} vs {home_team}",
                f"{home_team} v {away_team}",
                f"{away_team} v {home_team}",
            ],
            'date_range': (match_date - timedelta(days=2), match_date + timedelta(days=1)),
            'keywords': [
                'match', 'game', 'fixture', 'vs', 'v', 'preview', 'prediction',
                'team news', 'lineup', 'starting eleven', 'injury', 'goal',
                'result', 'highlights', 'final', 'live'
            ],
            'hashtags': [
                f"#{home_team.replace(' ', '')}",
                f"#{away_team.replace(' ', '')}",
                '#football', '#soccer', '#premierleague', '#championsleague'
            ]
        }
    
    def _get_relevant_accounts(self, home_team: str, away_team: str) -> List[str]:
        """Get Twitter accounts relevant to the match"""
        relevant_accounts = []
        
        # Add journalists (always relevant)
        relevant_accounts.extend(self.twitter_accounts['journalists'][:10])  # Limit journalists
        
        # Add leagues (always relevant)
        relevant_accounts.extend(self.twitter_accounts['leagues'])
        
        # Add team-specific accounts
        team_accounts = self._get_team_accounts(home_team, away_team)
        relevant_accounts.extend(team_accounts)
        
        # Remove duplicates
        return list(set(relevant_accounts))
    
    def _get_team_accounts(self, home_team: str, away_team: str) -> List[str]:
        """Get team-specific Twitter accounts"""
        team_accounts = []
        
        # Map team names to Twitter accounts
        team_mapping = {
            'Manchester United': 'ManUtd',
            'Liverpool': 'LFC',
            'Arsenal': 'Arsenal',
            'Chelsea': 'ChelseaFC',
            'Tottenham': 'SpursOfficial',
            'Manchester City': 'ManCity',
            'Real Madrid': 'realmadrid',
            'Barcelona': 'FCBarcelona',
            'Juventus': 'juventusfc',
            'AC Milan': 'acmilan',
            'Bayern Munich': 'FCBayern',
            'Borussia Dortmund': 'BVB',
        }
        
        for team in [home_team, away_team]:
            if team in team_mapping:
                account = team_mapping[team]
                if account in self.twitter_accounts['clubs']:
                    team_accounts.append(account)
        
        return team_accounts
    
    async def _collect_from_account(self, account: str, queries: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Collect tweets from a single Twitter account via Nitter"""
        async with self.rate_limiter:
            try:
                # Add delay to be respectful
                await asyncio.sleep(1)
                
                # Get RSS feed from working Nitter instance
                rss_url = await self._get_account_rss_url(account)
                if not rss_url:
                    logger.warning(f"No working Nitter instance for {account}")
                    return []
                
                # Fetch RSS feed
                async with self.session.get(rss_url) as response:
                    if response.status != 200:
                        logger.warning(f"Failed to fetch {account} RSS: HTTP {response.status}")
                        return []
                    
                    content = await response.text()
                
                # Parse RSS feed
                feed = feedparser.parse(content)
                
                if not feed.entries:
                    logger.warning(f"No entries found for {account}")
                    return []
                
                # Process tweets
                tweets = []
                for entry in feed.entries:
                    tweet = self._process_tweet_entry(entry, account, queries)
                    if tweet:
                        tweets.append(tweet)
                
                logger.info(f"Collected {len(tweets)} relevant tweets from @{account}")
                return tweets
                
            except Exception as e:
                logger.error(f"Error collecting from @{account}: {e}")
                return []
    
    async def _get_account_rss_url(self, account: str) -> Optional[str]:
        """Get RSS URL for account from a working Nitter instance"""
        for attempt in range(len(self.nitter_instances)):
            instance = self._get_next_instance()
            
            if not self.instance_health.get(instance, True):
                continue
            
            rss_url = f"{instance}/{account}/rss"
            
            try:
                # Test the instance with a quick request
                async with self.session.head(rss_url) as response:
                    if response.status == 200:
                        return rss_url
                    else:
                        # Mark instance as unhealthy if it returns error
                        if response.status >= 500:
                            self.instance_health[instance] = False
                            logger.warning(f"Marking {instance} as unhealthy")
                        
            except Exception as e:
                logger.warning(f"Instance {instance} failed for {account}: {e}")
                self.instance_health[instance] = False
                continue
        
        # If all instances failed, reset health status and try again
        logger.warning("All Nitter instances failed, resetting health status")
        self.instance_health = {instance: True for instance in self.nitter_instances}
        
        return None
    
    def _get_next_instance(self) -> str:
        """Get next Nitter instance in rotation"""
        instance = self.nitter_instances[self.current_instance]
        self.current_instance = (self.current_instance + 1) % len(self.nitter_instances)
        return instance
    
    def _process_tweet_entry(self, entry: Any, account: str, queries: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Process a single tweet entry from RSS"""
        try:
            # Extract tweet content
            title = entry.get('title', '').strip()
            link = entry.get('link', '').strip()
            published = entry.get('published', '')
            
            if not title or not link:
                return None
            
            # Skip retweets and replies for cleaner content
            if title.startswith('RT @') or title.startswith('@'):
                return None
            
            # Check relevance
            relevance_score = self._calculate_tweet_relevance(title, queries)
            if relevance_score < 0.3:
                return None
            
            # Parse publication date
            pub_date = self._parse_date(published)
            if not pub_date:
                pub_date = datetime.utcnow()
            
            # Check date relevance
            if not self._is_date_relevant(pub_date, queries['date_range']):
                return None
            
            # Extract additional metadata from title/content
            is_retweet = 'RT @' in title
            is_reply = title.startswith('@')
            
            # Clean tweet content
            cleaned_content = self._clean_tweet_content(title)
            
            # Generate hash for deduplication
            content_hash = self._generate_hash(cleaned_content, link)
            
            # Determine tweet type
            tweet_type = self._classify_tweet_content(cleaned_content)
            
            # Calculate quality score
            quality_score = self._calculate_tweet_quality(account, cleaned_content, tweet_type)
            
            tweet = {
                'title': cleaned_content,
                'summary': cleaned_content,  # Twitter content is short
                'content': cleaned_content,
                'link': link,
                'author': f"@{account}",
                'published_at': pub_date,
                'source': f"Twitter - @{account}",
                'source_type': 'twitter',
                'relevance_score': relevance_score,
                'quality_score': quality_score,
                'hash': content_hash,
                'collected_at': datetime.utcnow(),
                'language': self._detect_tweet_language(cleaned_content),
                'tags': self._extract_tweet_tags(cleaned_content, account, queries),
                'twitter_data': {
                    'account': account,
                    'is_retweet': is_retweet,
                    'is_reply': is_reply,
                    'tweet_type': tweet_type,
                    'nitter_url': link,
                    'hashtags': self._extract_hashtags(cleaned_content),
                    'mentions': self._extract_mentions(cleaned_content)
                }
            }
            
            return tweet
            
        except Exception as e:
            logger.error(f"Error processing tweet entry: {e}")
            return None
    
    def _calculate_tweet_relevance(self, content: str, queries: Dict[str, Any]) -> float:
        """Calculate relevance score for tweet content"""
        content_lower = content.lower()
        score = 0.0
        
        # Check for direct team mentions
        for team in queries['teams']:
            if team.lower() in content_lower:
                score += 0.5
        
        # Check for team variations
        for variation in queries['all_variations']:
            if variation.lower() in content_lower:
                score += 0.3
        
        # Check for match terms
        for term in queries['match_terms']:
            if term.lower() in content_lower:
                score += 0.7
        
        # Check for keywords
        for keyword in queries['keywords']:
            if keyword.lower() in content_lower:
                score += 0.1
        
        # Check for hashtags
        for hashtag in queries['hashtags']:
            if hashtag.lower() in content_lower:
                score += 0.2
        
        # Bonus for breaking news indicators
        if any(indicator in content_lower for indicator in ['breaking', 'confirmed', 'official', 'just in']):
            score += 0.3
        
        return min(score, 1.0)
    
    def _calculate_tweet_quality(self, account: str, content: str, tweet_type: str) -> float:
        """Calculate quality score for tweet"""
        from ..config import QUALITY_SCORING
        
        # Base score depends on account type
        if account in self.twitter_accounts['journalists']:
            base_score = QUALITY_SCORING['source_weights'].get('twitter_journalist', 0.75)
        elif account in self.twitter_accounts['clubs']:
            base_score = QUALITY_SCORING['source_weights'].get('official_club', 0.90)
        elif account in self.twitter_accounts['leagues']:
            base_score = 0.85
        else:
            base_score = QUALITY_SCORING['source_weights'].get('twitter_verified', 0.70)
        
        # Content type multipliers
        content_multiplier = QUALITY_SCORING['content_multipliers'].get(tweet_type, 1.0)
        
        # Length penalty for very short tweets
        if len(content) < 50:
            content_multiplier *= 0.9
        
        # Quality indicators
        if any(indicator in content.lower() for indicator in ['breaking', 'exclusive', 'confirmed']):
            content_multiplier *= 1.2
        
        if any(indicator in content.lower() for indicator in ['rumor', 'unconfirmed', 'allegedly']):
            content_multiplier *= 0.8
        
        return min(base_score * content_multiplier, 1.0)
    
    def _clean_tweet_content(self, content: str) -> str:
        """Clean and normalize tweet content"""
        # Remove common RSS feed prefixes
        content = re.sub(r'^R to @\w+:', '', content)
        content = re.sub(r'^RT @\w+:', '', content)
        
        # Clean up whitespace
        content = ' '.join(content.split())
        
        return content.strip()
    
    def _classify_tweet_content(self, content: str) -> str:
        """Classify tweet content type"""
        content_lower = content.lower()
        
        if any(word in content_lower for word in ['breaking', 'just in', 'urgent']):
            return 'breaking_news'
        elif any(word in content_lower for word in ['goal', 'scores', 'penalty']):
            return 'match_events'
        elif any(word in content_lower for word in ['injury', 'injured', 'out for']):
            return 'injury_news'
        elif any(word in content_lower for word in ['transfer', 'signing', 'deal']):
            return 'transfer_news'
        elif any(word in content_lower for word in ['lineup', 'starting', 'team news']):
            return 'team_news'
        elif any(word in content_lower for word in ['interview', 'says', 'quotes']):
            return 'interview'
        else:
            return 'general'
    
    def _extract_hashtags(self, content: str) -> List[str]:
        """Extract hashtags from tweet content"""
        hashtag_pattern = r'#\w+'
        hashtags = re.findall(hashtag_pattern, content, re.IGNORECASE)
        return [tag.lower() for tag in hashtags]
    
    def _extract_mentions(self, content: str) -> List[str]:
        """Extract mentions from tweet content"""
        mention_pattern = r'@\w+'
        mentions = re.findall(mention_pattern, content, re.IGNORECASE)
        return [mention.lower() for mention in mentions]
    
    def _extract_tweet_tags(self, content: str, account: str, queries: Dict[str, Any]) -> List[str]:
        """Extract relevant tags from tweet"""
        tags = ['twitter', 'social_media']
        
        # Add account type tag
        if account in self.twitter_accounts['journalists']:
            tags.append('journalist')
        elif account in self.twitter_accounts['clubs']:
            tags.append('official_club')
        elif account in self.twitter_accounts['leagues']:
            tags.append('official_league')
        
        # Add team tags
        content_lower = content.lower()
        for team in queries['teams']:
            if team.lower() in content_lower:
                tags.append(team.lower().replace(' ', '_'))
        
        # Add content type tags
        if any(word in content_lower for word in ['goal', 'penalty', 'red card']):
            tags.append('match_events')
        
        if any(word in content_lower for word in ['injury', 'injured']):
            tags.append('injury_news')
        
        if any(word in content_lower for word in ['transfer', 'signing']):
            tags.append('transfer_news')
        
        return list(set(tags))
    
    def _detect_tweet_language(self, content: str) -> str:
        """Simple language detection for tweets"""
        try:
            from langdetect import detect
            return detect(content)
        except:
            return 'en'  # Default to English
    
    def _parse_date(self, date_str: str) -> Optional[datetime]:
        """Parse RSS date string"""
        if not date_str:
            return None
        
        # Try common RSS date formats
        import email.utils
        try:
            parsed = email.utils.parsedate_tz(date_str)
            if parsed:
                return datetime(*parsed[:6])
        except:
            pass
        
        # Fallback to current time
        return datetime.utcnow()
    
    def _is_date_relevant(self, pub_date: datetime, date_range: tuple) -> bool:
        """Check if tweet date is relevant"""
        start_date, end_date = date_range
        return start_date <= pub_date <= end_date
    
    def _generate_hash(self, content: str, link: str) -> str:
        """Generate unique hash for deduplication"""
        hash_content = f"{content}{link}"
        return hashlib.md5(hash_content.encode('utf-8')).hexdigest()
    
    async def get_nitter_health(self) -> Dict[str, Any]:
        """Check health of Nitter instances"""
        health_results = {}
        
        for instance in self.nitter_instances:
            try:
                # Test with a simple request
                test_url = f"{instance}/elonmusk/rss"  # Use a popular account for testing
                
                async with self.session.head(test_url) as response:
                    health_results[instance] = {
                        'status': 'healthy' if response.status == 200 else 'unhealthy',
                        'status_code': response.status,
                        'response_time': response.headers.get('server-timing', 'unknown'),
                        'last_checked': datetime.utcnow().isoformat(),
                        'currently_used': self.instance_health.get(instance, True)
                    }
                    
            except Exception as e:
                health_results[instance] = {
                    'status': 'error',
                    'error': str(e),
                    'last_checked': datetime.utcnow().isoformat(),
                    'currently_used': self.instance_health.get(instance, True)
                }
        
        return health_results
    
    async def get_trending_hashtags(self, queries: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Get trending hashtags related to the match"""
        hashtag_counts = {}
        
        try:
            # Collect from a few key accounts
            key_accounts = self.twitter_accounts['journalists'][:5] + self.twitter_accounts['clubs'][:5]
            
            for account in key_accounts:
                try:
                    tweets = await self._collect_from_account(account, queries)
                    
                    for tweet in tweets:
                        hashtags = tweet.get('twitter_data', {}).get('hashtags', [])
                        for hashtag in hashtags:
                            hashtag_counts[hashtag] = hashtag_counts.get(hashtag, 0) + 1
                            
                except Exception as e:
                    logger.warning(f"Failed to get hashtags from {account}: {e}")
                    continue
            
            # Sort by frequency
            trending = [
                {'hashtag': tag, 'count': count, 'trending_score': count}
                for tag, count in sorted(hashtag_counts.items(), key=lambda x: x[1], reverse=True)
                if count > 1
            ]
            
            return trending[:10]
            
        except Exception as e:
            logger.error(f"Failed to get trending hashtags: {e}")
            return []
    
    async def search_tweets(self, query: str, limit: int = 50) -> List[Dict[str, Any]]:
        """Search for tweets (limited functionality without Twitter API)"""
        # Since we can't search directly, we collect from relevant accounts
        # and filter by query
        
        all_tweets = []
        
        # Get recent tweets from journalists and clubs
        accounts_to_search = (
            self.twitter_accounts['journalists'][:10] +
            self.twitter_accounts['clubs'][:10]
        )
        
        for account in accounts_to_search:
            try:
                rss_url = await self._get_account_rss_url(account)
                if not rss_url:
                    continue
                
                async with self.session.get(rss_url) as response:
                    if response.status == 200:
                        content = await response.text()
                        feed = feedparser.parse(content)
                        
                        for entry in feed.entries:
                            title = entry.get('title', '').strip()
                            if query.lower() in title.lower():
                                tweet = {
                                    'title': title,
                                    'link': entry.get('link', ''),
                                    'published_at': self._parse_date(entry.get('published', '')),
                                    'account': account,
                                    'relevance': title.lower().count(query.lower())
                                }
                                all_tweets.append(tweet)
                                
            except Exception as e:
                logger.warning(f"Search failed for {account}: {e}")
                continue
        
        # Sort by relevance and recency
        all_tweets.sort(key=lambda x: (x['relevance'], x['published_at']), reverse=True)
        
        return all_tweets[:limit]