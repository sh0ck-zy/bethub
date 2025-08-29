"""
RSS Feed Collector - Completely Free News Aggregation
Collects news from RSS feeds across multiple football sources
"""

import asyncio
import aiohttp
import feedparser
import logging
from datetime import datetime, timedelta
from typing import List, Dict, Optional, Any
from urllib.parse import urljoin, urlparse
import hashlib
import re

from ..config import RSS_SOURCES, RATE_LIMITS, DEFAULT_HEADERS, TEAM_VARIATIONS

logger = logging.getLogger(__name__)

class RSSCollector:
    def __init__(self):
        self.sources = RSS_SOURCES
        self.headers = DEFAULT_HEADERS.copy()
        self.rate_limiter = asyncio.Semaphore(RATE_LIMITS['rss_feeds']['concurrent_requests'])
        self.session = None
        
    async def __aenter__(self):
        timeout = aiohttp.ClientTimeout(total=30)
        self.session = aiohttp.ClientSession(
            timeout=timeout,
            headers=self.headers,
            connector=aiohttp.TCPConnector(limit=20)
        )
        return self
        
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def collect_for_match(self, home_team: str, away_team: str, match_date: datetime) -> List[Dict[str, Any]]:
        """Collect RSS articles relevant to a specific match"""
        queries = self._build_queries(home_team, away_team, match_date)
        
        # Get relevant feeds based on teams
        relevant_feeds = self._get_relevant_feeds(home_team, away_team)
        
        # Collect from all feeds
        tasks = []
        for source_name, feed_url in relevant_feeds.items():
            task = self._collect_from_feed(source_name, feed_url, queries)
            tasks.append(task)
        
        # Execute all tasks concurrently
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Merge and deduplicate results
        all_articles = []
        for result in results:
            if isinstance(result, Exception):
                logger.error(f"Error collecting from feed: {result}")
                continue
            all_articles.extend(result)
        
        # Sort by relevance and recency
        all_articles.sort(key=lambda x: (x['relevance_score'], x['published_at']), reverse=True)
        
        return all_articles
    
    def _build_queries(self, home_team: str, away_team: str, match_date: datetime) -> Dict[str, Any]:
        """Build comprehensive search queries"""
        # Get team variations
        home_variations = TEAM_VARIATIONS.get(home_team, [home_team])
        away_variations = TEAM_VARIATIONS.get(away_team, [away_team])
        
        # Build query patterns
        queries = {
            'primary_terms': [home_team, away_team],
            'match_terms': [
                f"{home_team} vs {away_team}",
                f"{away_team} vs {home_team}",
                f"{home_team} v {away_team}",
                f"{away_team} v {home_team}",
            ],
            'team_variations': home_variations + away_variations,
            'date_range': (match_date - timedelta(days=3), match_date + timedelta(days=1)),
            'keywords': [
                'match preview', 'team news', 'injury report', 'starting eleven',
                'head to head', 'prediction', 'betting odds', 'live stream',
                'match report', 'post match', 'highlights', 'goals', 'result'
            ],
            'exclude_terms': ['women', 'youth', 'u21', 'u19', 'reserves', 'academy']
        }
        
        return queries
    
    def _get_relevant_feeds(self, home_team: str, away_team: str) -> Dict[str, str]:
        """Get feeds most relevant to the teams playing"""
        relevant_feeds = {}
        
        # Always include major news sources
        major_sources = [
            'bbc_sport', 'guardian_football', 'sky_sports', 'espn_fc',
            'premier_league', 'champions_league', 'europa_league'
        ]
        
        for source in major_sources:
            if source in self.sources:
                relevant_feeds[source] = self.sources[source]
        
        # Add team-specific feeds
        team_feeds = self._get_team_feeds(home_team, away_team)
        relevant_feeds.update(team_feeds)
        
        # Add league-specific feeds based on teams
        league_feeds = self._get_league_feeds(home_team, away_team)
        relevant_feeds.update(league_feeds)
        
        return relevant_feeds
    
    def _get_team_feeds(self, home_team: str, away_team: str) -> Dict[str, str]:
        """Get official team RSS feeds"""
        team_feeds = {}
        
        # Map team names to RSS keys
        team_mapping = {
            'Manchester United': 'manutd_official',
            'Liverpool': 'liverpool_official',
            'Arsenal': 'arsenal_official',
            'Chelsea': 'chelsea_official',
            'Tottenham': 'tottenham_official',
            'Manchester City': 'manchestercity_official',
            'Real Madrid': 'realmadrid_official',
            'Barcelona': 'barcelona_official',
            'Juventus': 'juventus_official',
            'AC Milan': 'acmilan_official',
            'Bayern Munich': 'bayernmunich_official',
            'Borussia Dortmund': 'borussia_dortmund',
        }
        
        for team in [home_team, away_team]:
            if team in team_mapping:
                source_key = team_mapping[team]
                if source_key in self.sources:
                    team_feeds[source_key] = self.sources[source_key]
        
        return team_feeds
    
    def _get_league_feeds(self, home_team: str, away_team: str) -> Dict[str, str]:
        """Get league-specific feeds based on teams"""
        league_feeds = {}
        
        # Simple league detection based on team names
        premier_league_teams = [
            'Manchester United', 'Liverpool', 'Arsenal', 'Chelsea',
            'Tottenham', 'Manchester City', 'Leicester', 'West Ham',
            'Everton', 'Aston Villa', 'Newcastle', 'Brighton',
            'Crystal Palace', 'Brentford', 'Fulham', 'Wolves',
            'Bournemouth', 'Nottingham Forest', 'Burnley', 'Sheffield United'
        ]
        
        la_liga_teams = ['Real Madrid', 'Barcelona', 'Atletico Madrid', 'Sevilla']
        bundesliga_teams = ['Bayern Munich', 'Borussia Dortmund', 'RB Leipzig']
        serie_a_teams = ['Juventus', 'AC Milan', 'Inter Milan', 'Napoli']
        
        if home_team in premier_league_teams or away_team in premier_league_teams:
            league_feeds['premier_league'] = self.sources['premier_league']
        
        if home_team in la_liga_teams or away_team in la_liga_teams:
            league_feeds['laliga'] = self.sources['laliga']
        
        if home_team in bundesliga_teams or away_team in bundesliga_teams:
            league_feeds['bundesliga'] = self.sources['bundesliga']
        
        if home_team in serie_a_teams or away_team in serie_a_teams:
            league_feeds['serie_a'] = self.sources['serie_a']
        
        return league_feeds
    
    async def _collect_from_feed(self, source_name: str, feed_url: str, queries: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Collect and filter articles from a single RSS feed"""
        async with self.rate_limiter:
            try:
                # Add random delay to be respectful
                await asyncio.sleep(0.5)
                
                # Fetch RSS feed
                async with self.session.get(feed_url) as response:
                    if response.status != 200:
                        logger.warning(f"Failed to fetch {source_name}: HTTP {response.status}")
                        return []
                    
                    content = await response.text()
                
                # Parse RSS feed
                feed = feedparser.parse(content)
                
                if not feed.entries:
                    logger.warning(f"No entries found in {source_name}")
                    return []
                
                # Filter and process entries
                articles = []
                for entry in feed.entries:
                    article = self._process_entry(entry, source_name, queries)
                    if article:
                        articles.append(article)
                
                logger.info(f"Collected {len(articles)} articles from {source_name}")
                return articles
                
            except Exception as e:
                logger.error(f"Error collecting from {source_name}: {e}")
                return []
    
    def _process_entry(self, entry: Any, source_name: str, queries: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Process a single RSS entry"""
        try:
            # Extract basic info
            title = entry.get('title', '').strip()
            summary = entry.get('summary', '').strip()
            link = entry.get('link', '').strip()
            
            if not title or not link:
                return None
            
            # Check relevance
            relevance_score = self._calculate_relevance(title, summary, queries)
            if relevance_score < 0.3:  # Minimum relevance threshold
                return None
            
            # Parse publication date
            pub_date = self._parse_date(entry.get('published', ''))
            if not pub_date:
                pub_date = datetime.utcnow()
            
            # Check date relevance
            if not self._is_date_relevant(pub_date, queries['date_range']):
                return None
            
            # Generate hash for deduplication
            content_hash = self._generate_hash(title, link)
            
            # Extract additional metadata
            author = entry.get('author', '').strip()
            category = entry.get('category', '').strip()
            
            article = {
                'title': title,
                'summary': summary,
                'link': link,
                'author': author,
                'category': category,
                'published_at': pub_date,
                'source': source_name,
                'source_type': 'rss',
                'relevance_score': relevance_score,
                'quality_score': self._calculate_quality_score(source_name, title, summary),
                'hash': content_hash,
                'collected_at': datetime.utcnow(),
                'language': self._detect_language(title, summary),
                'tags': self._extract_tags(title, summary, queries),
            }
            
            return article
            
        except Exception as e:
            logger.error(f"Error processing entry: {e}")
            return None
    
    def _calculate_relevance(self, title: str, summary: str, queries: Dict[str, Any]) -> float:
        """Calculate relevance score based on content matching"""
        text = f"{title} {summary}".lower()
        score = 0.0
        
        # Check for direct team mentions
        for term in queries['primary_terms']:
            if term.lower() in text:
                score += 0.4
        
        # Check for team variations
        for variation in queries['team_variations']:
            if variation.lower() in text:
                score += 0.2
        
        # Check for match-specific terms
        for term in queries['match_terms']:
            if term.lower() in text:
                score += 0.6
        
        # Check for football keywords
        for keyword in queries['keywords']:
            if keyword.lower() in text:
                score += 0.1
        
        # Penalize excluded terms
        for exclude_term in queries['exclude_terms']:
            if exclude_term.lower() in text:
                score -= 0.3
        
        # Bonus for title matches
        title_lower = title.lower()
        for term in queries['primary_terms']:
            if term.lower() in title_lower:
                score += 0.2
        
        return min(score, 1.0)
    
    def _calculate_quality_score(self, source_name: str, title: str, summary: str) -> float:
        """Calculate quality score based on source and content"""
        from ..config import QUALITY_SCORING
        
        base_score = QUALITY_SCORING['source_weights'].get(source_name, 0.5)
        
        # Content quality indicators
        text = f"{title} {summary}".lower()
        
        # Check for quality indicators
        if any(indicator in text for indicator in ['breaking', 'exclusive', 'confirmed']):
            base_score *= 1.2
        
        if any(indicator in text for indicator in ['rumor', 'speculation', 'reportedly']):
            base_score *= 0.8
        
        # Length penalty for very short articles
        if len(summary) < 100:
            base_score *= 0.9
        
        return min(base_score, 1.0)
    
    def _parse_date(self, date_str: str) -> Optional[datetime]:
        """Parse various date formats"""
        if not date_str:
            return None
        
        # Try feedparser's built-in parser first
        try:
            import email.utils
            parsed = email.utils.parsedate_tz(date_str)
            if parsed:
                return datetime(*parsed[:6])
        except:
            pass
        
        # Try common formats
        formats = [
            '%a, %d %b %Y %H:%M:%S %z',
            '%a, %d %b %Y %H:%M:%S %Z',
            '%Y-%m-%dT%H:%M:%S%z',
            '%Y-%m-%d %H:%M:%S',
            '%Y-%m-%d',
        ]
        
        for fmt in formats:
            try:
                return datetime.strptime(date_str, fmt)
            except ValueError:
                continue
        
        return None
    
    def _is_date_relevant(self, pub_date: datetime, date_range: tuple) -> bool:
        """Check if publication date is within relevant range"""
        start_date, end_date = date_range
        return start_date <= pub_date <= end_date
    
    def _generate_hash(self, title: str, link: str) -> str:
        """Generate unique hash for deduplication"""
        content = f"{title}{link}"
        return hashlib.md5(content.encode('utf-8')).hexdigest()
    
    def _detect_language(self, title: str, summary: str) -> str:
        """Simple language detection"""
        try:
            from langdetect import detect
            text = f"{title} {summary}"
            return detect(text)
        except:
            return 'en'  # Default to English
    
    def _extract_tags(self, title: str, summary: str, queries: Dict[str, Any]) -> List[str]:
        """Extract relevant tags from content"""
        tags = []
        text = f"{title} {summary}".lower()
        
        # Add team tags
        for term in queries['primary_terms']:
            if term.lower() in text:
                tags.append(term)
        
        # Add content type tags
        if any(word in text for word in ['preview', 'preview']):
            tags.append('match_preview')
        
        if any(word in text for word in ['report', 'result', 'final']):
            tags.append('match_report')
        
        if any(word in text for word in ['injury', 'injured', 'fitness']):
            tags.append('injury_news')
        
        if any(word in text for word in ['transfer', 'signing', 'deal']):
            tags.append('transfer_news')
        
        if any(word in text for word in ['breaking', 'urgent', 'just in']):
            tags.append('breaking_news')
        
        return list(set(tags))
    
    async def get_all_feeds_health(self) -> Dict[str, Dict[str, Any]]:
        """Check health of all RSS feeds"""
        health_results = {}
        
        for source_name, feed_url in self.sources.items():
            try:
                async with self.session.get(feed_url) as response:
                    health_results[source_name] = {
                        'status': 'healthy' if response.status == 200 else 'unhealthy',
                        'status_code': response.status,
                        'response_time': response.headers.get('x-response-time', 'unknown'),
                        'last_checked': datetime.utcnow().isoformat(),
                    }
            except Exception as e:
                health_results[source_name] = {
                    'status': 'error',
                    'error': str(e),
                    'last_checked': datetime.utcnow().isoformat(),
                }
        
        return health_results