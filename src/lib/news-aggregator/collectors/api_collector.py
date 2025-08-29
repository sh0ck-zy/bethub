"""
API Collector - Free News APIs Integration
Collects news from Guardian, NewsData.io, and other free APIs
"""

import asyncio
import aiohttp
import logging
from datetime import datetime, timedelta
from typing import List, Dict, Optional, Any
import hashlib
import json

from ..config import NEWS_APIS, RATE_LIMITS, DEFAULT_HEADERS, TEAM_VARIATIONS

logger = logging.getLogger(__name__)

class APICollector:
    def __init__(self):
        self.apis = NEWS_APIS
        self.headers = DEFAULT_HEADERS.copy()
        self.rate_limiter = asyncio.Semaphore(RATE_LIMITS['news_apis']['concurrent_requests'])
        self.session = None
        self.daily_usage = {api: 0 for api in self.apis.keys()}
        
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
        """Collect news from free APIs for a specific match"""
        queries = self._build_queries(home_team, away_team, match_date)
        
        # Collect from all available APIs
        tasks = []
        
        if self._can_use_api('guardian'):
            tasks.append(self._collect_from_guardian(queries))
        
        if self._can_use_api('newsdata'):
            tasks.append(self._collect_from_newsdata(queries))
        
        if self._can_use_api('currents'):
            tasks.append(self._collect_from_currents(queries))
        
        if not tasks:
            logger.warning("No APIs available for collection")
            return []
        
        # Execute all tasks concurrently
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Merge results
        all_articles = []
        for result in results:
            if isinstance(result, Exception):
                logger.error(f"API collection error: {result}")
                continue
            all_articles.extend(result)
        
        # Sort by relevance and quality
        all_articles.sort(key=lambda x: (x['relevance_score'], x['quality_score']), reverse=True)
        
        return all_articles
    
    def _build_queries(self, home_team: str, away_team: str, match_date: datetime) -> Dict[str, Any]:
        """Build comprehensive search queries for APIs"""
        # Get team variations
        home_variations = TEAM_VARIATIONS.get(home_team, [home_team])
        away_variations = TEAM_VARIATIONS.get(away_team, [away_team])
        
        return {
            'primary_teams': [home_team, away_team],
            'all_variations': home_variations + away_variations,
            'match_phrases': [
                f"{home_team} vs {away_team}",
                f"{away_team} vs {home_team}",
                f"{home_team} v {away_team}",
                f"{away_team} v {home_team}",
            ],
            'keywords': [
                'football', 'soccer', 'match', 'game', 'fixture',
                'preview', 'prediction', 'team news', 'injury',
                'lineup', 'starting eleven', 'tactics'
            ],
            'date_range': (match_date - timedelta(days=3), match_date + timedelta(days=1)),
            'exclude_terms': ['women', 'youth', 'u21', 'u19', 'reserves']
        }
    
    def _can_use_api(self, api_name: str) -> bool:
        """Check if API can be used (within daily limits)"""
        if api_name not in self.apis:
            return False
        
        api_config = self.apis[api_name]
        
        # Check if API key is available
        if not api_config.get('key'):
            logger.warning(f"No API key for {api_name}")
            return False
        
        # Check daily usage
        current_usage = self.daily_usage.get(api_name, 0)
        daily_limit = api_config.get('daily_limit', 0)
        
        if current_usage >= daily_limit:
            logger.warning(f"Daily limit reached for {api_name}")
            return False
        
        return True
    
    async def _collect_from_guardian(self, queries: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Collect from Guardian Open Platform API"""
        async with self.rate_limiter:
            try:
                # Rate limiting
                await asyncio.sleep(1.0 / self.apis['guardian']['rate_limit'])
                
                articles = []
                
                # Try different query combinations
                for team in queries['primary_teams']:
                    params = {
                        'q': f"{team} AND (football OR soccer)",
                        'from-date': queries['date_range'][0].strftime('%Y-%m-%d'),
                        'to-date': queries['date_range'][1].strftime('%Y-%m-%d'),
                        'section': 'sport',
                        'show-fields': 'headline,trailText,body,publication,thumbnail',
                        'show-tags': 'keyword',
                        'page-size': 20,
                        'api-key': self.apis['guardian']['key']
                    }
                    
                    async with self.session.get(self.apis['guardian']['url'], params=params) as response:
                        if response.status == 200:
                            data = await response.json()
                            
                            for item in data.get('response', {}).get('results', []):
                                article = self._process_guardian_article(item, queries)
                                if article:
                                    articles.append(article)
                            
                            self.daily_usage['guardian'] += 1
                        else:
                            logger.error(f"Guardian API error: {response.status}")
                
                logger.info(f"Collected {len(articles)} articles from Guardian API")
                return articles
                
            except Exception as e:
                logger.error(f"Error collecting from Guardian API: {e}")
                return []
    
    async def _collect_from_newsdata(self, queries: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Collect from NewsData.io API"""
        async with self.rate_limiter:
            try:
                # Rate limiting
                await asyncio.sleep(1.0 / self.apis['newsdata']['rate_limit'])
                
                articles = []
                
                # Use primary match query
                match_query = f"({queries['primary_teams'][0]} AND {queries['primary_teams'][1]}) OR ({' OR '.join(queries['match_phrases'])})"
                
                params = {
                    'q': match_query,
                    'category': 'sports',
                    'language': 'en',
                    'country': 'us,gb',
                    'from_date': queries['date_range'][0].strftime('%Y-%m-%d'),
                    'to_date': queries['date_range'][1].strftime('%Y-%m-%d'),
                    'size': 50,
                    'apikey': self.apis['newsdata']['key']
                }
                
                async with self.session.get(self.apis['newsdata']['url'], params=params) as response:
                    if response.status == 200:
                        data = await response.json()
                        
                        for item in data.get('results', []):
                            article = self._process_newsdata_article(item, queries)
                            if article:
                                articles.append(article)
                        
                        self.daily_usage['newsdata'] += 1
                    else:
                        logger.error(f"NewsData API error: {response.status}")
                
                logger.info(f"Collected {len(articles)} articles from NewsData API")
                return articles
                
            except Exception as e:
                logger.error(f"Error collecting from NewsData API: {e}")
                return []
    
    async def _collect_from_currents(self, queries: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Collect from Currents API"""
        async with self.rate_limiter:
            try:
                # Rate limiting
                await asyncio.sleep(1.0 / self.apis['currents']['rate_limit'])
                
                articles = []
                
                # Use team names for search
                for team in queries['primary_teams']:
                    params = {
                        'keywords': f"{team} football OR {team} soccer",
                        'category': 'sports',
                        'language': 'en',
                        'country': 'US,GB',
                        'start_date': queries['date_range'][0].strftime('%Y-%m-%d'),
                        'end_date': queries['date_range'][1].strftime('%Y-%m-%d'),
                        'page_size': 20,
                        'apiKey': self.apis['currents']['key']
                    }
                    
                    async with self.session.get(self.apis['currents']['url'], params=params) as response:
                        if response.status == 200:
                            data = await response.json()
                            
                            for item in data.get('news', []):
                                article = self._process_currents_article(item, queries)
                                if article:
                                    articles.append(article)
                            
                            self.daily_usage['currents'] += 1
                        else:
                            logger.error(f"Currents API error: {response.status}")
                
                logger.info(f"Collected {len(articles)} articles from Currents API")
                return articles
                
            except Exception as e:
                logger.error(f"Error collecting from Currents API: {e}")
                return []
    
    def _process_guardian_article(self, item: Dict[str, Any], queries: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Process Guardian API article"""
        try:
            fields = item.get('fields', {})
            
            title = fields.get('headline', item.get('webTitle', ''))
            summary = fields.get('trailText', '')
            content = fields.get('body', '')
            
            if not title:
                return None
            
            # Check relevance
            relevance_score = self._calculate_relevance(title, summary, content, queries)
            if relevance_score < 0.3:
                return None
            
            # Parse date
            pub_date = self._parse_date(item.get('webPublicationDate', ''))
            
            article = {
                'title': title,
                'summary': summary,
                'content': content[:1000] if content else '',  # Limit content length
                'link': item.get('webUrl', ''),
                'published_at': pub_date,
                'source': 'Guardian',
                'source_type': 'api',
                'api_source': 'guardian',
                'relevance_score': relevance_score,
                'quality_score': self._calculate_quality_score('guardian', title, summary),
                'hash': self._generate_hash(title, item.get('id', '')),
                'collected_at': datetime.utcnow(),
                'language': 'en',
                'tags': self._extract_tags(title, summary, content, queries),
                'section': item.get('sectionName', ''),
                'pillar': item.get('pillarName', ''),
                'thumbnail': fields.get('thumbnail', ''),
            }
            
            return article
            
        except Exception as e:
            logger.error(f"Error processing Guardian article: {e}")
            return None
    
    def _process_newsdata_article(self, item: Dict[str, Any], queries: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Process NewsData.io article"""
        try:
            title = item.get('title', '')
            description = item.get('description', '')
            content = item.get('content', '')
            
            if not title:
                return None
            
            # Check relevance
            relevance_score = self._calculate_relevance(title, description, content, queries)
            if relevance_score < 0.3:
                return None
            
            # Parse date
            pub_date = self._parse_date(item.get('pubDate', ''))
            
            article = {
                'title': title,
                'summary': description,
                'content': content[:1000] if content else '',
                'link': item.get('link', ''),
                'published_at': pub_date,
                'source': item.get('source_id', 'NewsData'),
                'source_type': 'api',
                'api_source': 'newsdata',
                'relevance_score': relevance_score,
                'quality_score': self._calculate_quality_score('newsdata', title, description),
                'hash': self._generate_hash(title, item.get('article_id', '')),
                'collected_at': datetime.utcnow(),
                'language': item.get('language', 'en'),
                'tags': self._extract_tags(title, description, content, queries),
                'category': item.get('category', []),
                'country': item.get('country', []),
                'image_url': item.get('image_url', ''),
            }
            
            return article
            
        except Exception as e:
            logger.error(f"Error processing NewsData article: {e}")
            return None
    
    def _process_currents_article(self, item: Dict[str, Any], queries: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Process Currents API article"""
        try:
            title = item.get('title', '')
            description = item.get('description', '')
            
            if not title:
                return None
            
            # Check relevance
            relevance_score = self._calculate_relevance(title, description, '', queries)
            if relevance_score < 0.3:
                return None
            
            # Parse date
            pub_date = self._parse_date(item.get('published', ''))
            
            article = {
                'title': title,
                'summary': description,
                'content': '',
                'link': item.get('url', ''),
                'published_at': pub_date,
                'source': item.get('author', 'Currents'),
                'source_type': 'api',
                'api_source': 'currents',
                'relevance_score': relevance_score,
                'quality_score': self._calculate_quality_score('currents', title, description),
                'hash': self._generate_hash(title, item.get('id', '')),
                'collected_at': datetime.utcnow(),
                'language': item.get('language', 'en'),
                'tags': self._extract_tags(title, description, '', queries),
                'category': item.get('category', []),
                'image': item.get('image', ''),
            }
            
            return article
            
        except Exception as e:
            logger.error(f"Error processing Currents article: {e}")
            return None
    
    def _calculate_relevance(self, title: str, summary: str, content: str, queries: Dict[str, Any]) -> float:
        """Calculate relevance score"""
        text = f"{title} {summary} {content}".lower()
        score = 0.0
        
        # Check for direct team mentions
        for team in queries['primary_teams']:
            if team.lower() in text:
                score += 0.5
        
        # Check for team variations
        for variation in queries['all_variations']:
            if variation.lower() in text:
                score += 0.2
        
        # Check for match phrases
        for phrase in queries['match_phrases']:
            if phrase.lower() in text:
                score += 0.7
        
        # Check for keywords
        for keyword in queries['keywords']:
            if keyword.lower() in text:
                score += 0.1
        
        # Penalize excluded terms
        for exclude_term in queries['exclude_terms']:
            if exclude_term.lower() in text:
                score -= 0.4
        
        # Bonus for title matches
        title_lower = title.lower()
        for team in queries['primary_teams']:
            if team.lower() in title_lower:
                score += 0.3
        
        return min(score, 1.0)
    
    def _calculate_quality_score(self, api_name: str, title: str, summary: str) -> float:
        """Calculate quality score"""
        from ..config import QUALITY_SCORING
        
        base_score = QUALITY_SCORING['source_weights'].get(api_name, 0.6)
        
        # Content quality indicators
        text = f"{title} {summary}".lower()
        
        # Quality indicators
        if any(indicator in text for indicator in ['breaking', 'exclusive', 'confirmed']):
            base_score *= 1.2
        
        if any(indicator in text for indicator in ['rumor', 'speculation', 'reportedly']):
            base_score *= 0.8
        
        # Length considerations
        if len(summary) < 50:
            base_score *= 0.9
        
        return min(base_score, 1.0)
    
    def _parse_date(self, date_str: str) -> datetime:
        """Parse date string"""
        if not date_str:
            return datetime.utcnow()
        
        # Try ISO format first
        try:
            return datetime.fromisoformat(date_str.replace('Z', '+00:00'))
        except ValueError:
            pass
        
        # Try other formats
        formats = [
            '%Y-%m-%dT%H:%M:%S%z',
            '%Y-%m-%d %H:%M:%S',
            '%Y-%m-%d',
            '%a, %d %b %Y %H:%M:%S %Z',
        ]
        
        for fmt in formats:
            try:
                return datetime.strptime(date_str, fmt)
            except ValueError:
                continue
        
        return datetime.utcnow()
    
    def _generate_hash(self, title: str, article_id: str) -> str:
        """Generate unique hash"""
        content = f"{title}{article_id}"
        return hashlib.md5(content.encode('utf-8')).hexdigest()
    
    def _extract_tags(self, title: str, summary: str, content: str, queries: Dict[str, Any]) -> List[str]:
        """Extract tags from content"""
        tags = []
        text = f"{title} {summary} {content}".lower()
        
        # Team tags
        for team in queries['primary_teams']:
            if team.lower() in text:
                tags.append(team)
        
        # Content type tags
        if any(word in text for word in ['preview', 'prediction']):
            tags.append('match_preview')
        
        if any(word in text for word in ['report', 'result', 'final']):
            tags.append('match_report')
        
        if any(word in text for word in ['injury', 'injured', 'fitness']):
            tags.append('injury_news')
        
        if any(word in text for word in ['transfer', 'signing', 'deal']):
            tags.append('transfer_news')
        
        if any(word in text for word in ['breaking', 'urgent']):
            tags.append('breaking_news')
        
        return list(set(tags))
    
    def get_daily_usage(self) -> Dict[str, Dict[str, Any]]:
        """Get current daily usage statistics"""
        usage_stats = {}
        
        for api_name, api_config in self.apis.items():
            current_usage = self.daily_usage.get(api_name, 0)
            daily_limit = api_config.get('daily_limit', 0)
            
            usage_stats[api_name] = {
                'current_usage': current_usage,
                'daily_limit': daily_limit,
                'remaining': daily_limit - current_usage,
                'percentage_used': (current_usage / daily_limit * 100) if daily_limit > 0 else 0,
                'status': 'available' if current_usage < daily_limit else 'exhausted'
            }
        
        return usage_stats
    
    def reset_daily_usage(self):
        """Reset daily usage counters (call this daily)"""
        self.daily_usage = {api: 0 for api in self.apis.keys()}
        logger.info("Daily usage counters reset")
    
    async def test_api_connections(self) -> Dict[str, Dict[str, Any]]:
        """Test connections to all configured APIs"""
        results = {}
        
        for api_name, api_config in self.apis.items():
            try:
                test_params = {
                    'q': 'football',
                    'page-size': 1,
                    'api-key': api_config['key']
                } if api_name == 'guardian' else {
                    'q': 'football',
                    'size': 1,
                    'apikey': api_config['key']
                }
                
                async with self.session.get(api_config['url'], params=test_params) as response:
                    results[api_name] = {
                        'status': 'healthy' if response.status == 200 else 'unhealthy',
                        'status_code': response.status,
                        'response_time': response.headers.get('x-response-time', 'unknown'),
                        'last_tested': datetime.utcnow().isoformat(),
                        'has_key': bool(api_config['key'])
                    }
                    
            except Exception as e:
                results[api_name] = {
                    'status': 'error',
                    'error': str(e),
                    'last_tested': datetime.utcnow().isoformat(),
                    'has_key': bool(api_config.get('key'))
                }
        
        return results