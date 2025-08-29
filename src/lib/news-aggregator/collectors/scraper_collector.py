"""
Smart Web Scraping Collector
Responsibly scrapes club websites and Google News for match information
"""

import asyncio
import aiohttp
import logging
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
import hashlib
from urllib.parse import urljoin, urlparse
import re
from bs4 import BeautifulSoup

try:
    from newspaper import Article
    NEWSPAPER_AVAILABLE = True
except ImportError:
    NEWSPAPER_AVAILABLE = False
    logging.warning("Newspaper3k not available. Article extraction will be limited.")

try:
    from pygooglenews import GoogleNews
    GOOGLE_NEWS_AVAILABLE = True
except ImportError:
    GOOGLE_NEWS_AVAILABLE = False
    logging.warning("PyGoogleNews not available. Google News scraping will be disabled.")

from ..config import CLUB_WEBSITES, RATE_LIMITS, DEFAULT_HEADERS, TEAM_VARIATIONS

logger = logging.getLogger(__name__)

class ScraperCollector:
    def __init__(self):
        self.club_websites = CLUB_WEBSITES
        self.headers = DEFAULT_HEADERS.copy()
        self.rate_limiter = asyncio.Semaphore(RATE_LIMITS['web_scraping']['concurrent_requests'])
        self.session = None
        
        # Initialize Google News if available
        self.google_news = None
        if GOOGLE_NEWS_AVAILABLE:
            try:
                self.google_news = GoogleNews()
                logger.info("Google News initialized successfully")
            except Exception as e:
                logger.error(f"Failed to initialize Google News: {e}")
                self.google_news = None
        
        # Common selectors for club websites
        self.news_selectors = {
            'generic': [
                '.news-item', '.article-card', '.news-card', '.post-item',
                'article', '.article', '[class*="news"]', '[class*="article"]'
            ],
            'title_selectors': [
                'h1', 'h2', 'h3', '.title', '.headline', '.article-title',
                '.news-title', '[class*="title"]', '[class*="headline"]'
            ],
            'content_selectors': [
                '.content', '.article-content', '.news-content', '.post-content',
                '.entry-content', 'p', '.description', '.summary'
            ],
            'date_selectors': [
                '.date', '.publish-date', '.article-date', '.news-date',
                'time', '[datetime]', '.timestamp', '[class*="date"]'
            ],
            'link_selectors': [
                'a', '.read-more', '.article-link', '.news-link'
            ]
        }
    
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
        """Collect articles by scraping club websites and Google News"""
        queries = self._build_queries(home_team, away_team, match_date)
        
        # Collect from different sources
        tasks = []
        
        # Club websites
        tasks.append(self._scrape_club_websites(queries))
        
        # Google News
        if self.google_news:
            tasks.append(self._scrape_google_news(queries))
        
        # Additional news websites
        tasks.append(self._scrape_general_news_sites(queries))
        
        # Execute all tasks
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Merge results
        all_articles = []
        for result in results:
            if isinstance(result, Exception):
                logger.error(f"Scraping task failed: {result}")
                continue
            all_articles.extend(result)
        
        # Sort by relevance and quality
        all_articles.sort(key=lambda x: (x['relevance_score'], x['quality_score']), reverse=True)
        
        return all_articles
    
    def _build_queries(self, home_team: str, away_team: str, match_date: datetime) -> Dict[str, Any]:
        """Build search queries for scraping"""
        # Get team variations
        home_variations = TEAM_VARIATIONS.get(home_team, [home_team])
        away_variations = TEAM_VARIATIONS.get(away_team, [away_team])
        
        return {
            'teams': [home_team, away_team],
            'all_variations': home_variations + away_variations,
            'match_queries': [
                f"{home_team} vs {away_team}",
                f"{away_team} vs {home_team}",
                f"{home_team} v {away_team}",
                f"{away_team} v {home_team}",
            ],
            'search_terms': [
                f"{home_team} {away_team}",
                f"{home_team} match",
                f"{away_team} match",
                f"{home_team} news",
                f"{away_team} news",
            ],
            'date_range': (match_date - timedelta(days=3), match_date + timedelta(days=1)),
            'keywords': [
                'match', 'game', 'fixture', 'preview', 'report', 'news',
                'team news', 'injury', 'lineup', 'squad', 'tactics'
            ]
        }
    
    async def _scrape_club_websites(self, queries: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Scrape official club websites"""
        articles = []
        
        for team in queries['teams']:
            if team in self.club_websites:
                club_url = self.club_websites[team]
                team_articles = await self._scrape_single_club_website(club_url, team, queries)
                articles.extend(team_articles)
        
        return articles
    
    async def _scrape_single_club_website(self, base_url: str, team: str, queries: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Scrape a single club website"""
        async with self.rate_limiter:
            try:
                # Add respectful delay
                await asyncio.sleep(RATE_LIMITS['web_scraping']['delay_between_requests'])
                
                # Common news page paths
                news_paths = ['/news', '/en/news', '/news/first-team', '/first-team/news']
                
                articles = []
                
                for path in news_paths:
                    news_url = urljoin(base_url, path)
                    
                    try:
                        async with self.session.get(news_url) as response:
                            if response.status == 200:
                                html = await response.text()
                                page_articles = await self._extract_articles_from_page(
                                    html, news_url, team, queries
                                )
                                articles.extend(page_articles)
                                
                                # Don't scrape too many pages from the same site
                                if len(articles) >= 20:
                                    break
                                    
                    except Exception as e:
                        logger.warning(f"Failed to scrape {news_url}: {e}")
                        continue
                
                # Get full article content for relevant articles
                for article in articles:
                    if article.get('link'):
                        full_content = await self._extract_full_article_content(article['link'])
                        if full_content:
                            article['content'] = full_content
                
                logger.info(f"Scraped {len(articles)} articles from {team}")
                return articles
                
            except Exception as e:
                logger.error(f"Failed to scrape {team} website: {e}")
                return []
    
    async def _extract_articles_from_page(self, html: str, page_url: str, team: str, queries: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Extract articles from a webpage"""
        try:
            soup = BeautifulSoup(html, 'html.parser')
            articles = []
            
            # Try different selectors to find news items
            news_items = []
            for selector in self.news_selectors['generic']:
                items = soup.select(selector)
                if items:
                    news_items.extend(items[:10])  # Limit to 10 items per selector
                    break
            
            for item in news_items:
                try:
                    # Extract title
                    title_elem = None
                    for selector in self.news_selectors['title_selectors']:
                        title_elem = item.select_one(selector)
                        if title_elem:
                            break
                    
                    if not title_elem:
                        continue
                    
                    title = title_elem.get_text(strip=True)
                    
                    # Check relevance
                    relevance_score = self._calculate_relevance(title, '', queries)
                    if relevance_score < 0.3:
                        continue
                    
                    # Extract link
                    link_elem = item.select_one('a')
                    if not link_elem:
                        continue
                    
                    link = link_elem.get('href', '')
                    if link:
                        # Make absolute URL
                        link = urljoin(page_url, link)
                    
                    # Extract summary/description
                    summary = ''
                    for selector in self.news_selectors['content_selectors']:
                        summary_elem = item.select_one(selector)
                        if summary_elem:
                            summary = summary_elem.get_text(strip=True)
                            break
                    
                    # Extract date
                    pub_date = self._extract_date_from_element(item)
                    
                    # Check date relevance
                    if pub_date and not self._is_date_relevant(pub_date, queries['date_range']):
                        continue
                    
                    article = {
                        'title': title,
                        'summary': summary,
                        'content': summary,  # Will be enhanced later
                        'link': link,
                        'author': team,  # Use team as author for club websites
                        'published_at': pub_date or datetime.utcnow(),
                        'source': f"{team} Official",
                        'source_type': 'scrape',
                        'relevance_score': relevance_score,
                        'quality_score': 0.85,  # Official club sources have high quality
                        'hash': self._generate_hash(title, link),
                        'collected_at': datetime.utcnow(),
                        'language': 'en',
                        'tags': ['official', 'club', team.lower().replace(' ', '_')],
                        'scrape_info': {
                            'source_url': page_url,
                            'scrape_method': 'club_website'
                        }
                    }
                    
                    articles.append(article)
                    
                except Exception as e:
                    logger.warning(f"Failed to extract article from item: {e}")
                    continue
            
            return articles
            
        except Exception as e:
            logger.error(f"Failed to extract articles from page: {e}")
            return []
    
    async def _extract_full_article_content(self, article_url: str) -> Optional[str]:
        """Extract full article content from URL"""
        if not NEWSPAPER_AVAILABLE:
            return None
        
        try:
            async with self.rate_limiter:
                await asyncio.sleep(1)  # Be respectful
                
                async with self.session.get(article_url) as response:
                    if response.status == 200:
                        html = await response.text()
                        
                        # Use newspaper3k for content extraction
                        article = Article(article_url)
                        article.set_html(html)
                        article.parse()
                        
                        if article.text:
                            return article.text[:2000]  # Limit content length
                        
        except Exception as e:
            logger.warning(f"Failed to extract full content from {article_url}: {e}")
        
        return None
    
    async def _scrape_google_news(self, queries: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Scrape Google News for match-related articles"""
        if not self.google_news:
            return []
        
        articles = []
        
        try:
            # Search for different query combinations
            for query in queries['search_terms'][:3]:  # Limit to 3 queries
                try:
                    # Search with time filter
                    search_results = self.google_news.search(f"{query} football", when='7d')
                    
                    for entry in search_results.get('entries', [])[:10]:  # Limit results
                        try:
                            title = entry.get('title', '')
                            link = entry.get('link', '')
                            published = entry.get('published', '')
                            source = entry.get('source', {}).get('title', 'Google News')
                            
                            if not title or not link:
                                continue
                            
                            # Check relevance
                            relevance_score = self._calculate_relevance(title, '', queries)
                            if relevance_score < 0.4:
                                continue
                            
                            # Parse date
                            pub_date = self._parse_date_string(published)
                            
                            # Check date relevance
                            if pub_date and not self._is_date_relevant(pub_date, queries['date_range']):
                                continue
                            
                            article = {
                                'title': title,
                                'summary': self._clean_summary(entry.get('summary', '')),
                                'content': '',
                                'link': link,
                                'author': source,
                                'published_at': pub_date or datetime.utcnow(),
                                'source': f"Google News - {source}",
                                'source_type': 'scrape',
                                'relevance_score': relevance_score,
                                'quality_score': 0.6,  # Google News has moderate quality
                                'hash': self._generate_hash(title, link),
                                'collected_at': datetime.utcnow(),
                                'language': 'en',
                                'tags': ['google_news', 'news_aggregator'],
                                'scrape_info': {
                                    'search_query': query,
                                    'scrape_method': 'google_news'
                                }
                            }
                            
                            articles.append(article)
                            
                        except Exception as e:
                            logger.warning(f"Failed to process Google News entry: {e}")
                            continue
                    
                    # Add delay between searches
                    await asyncio.sleep(2)
                    
                except Exception as e:
                    logger.error(f"Google News search failed for query '{query}': {e}")
                    continue
            
            logger.info(f"Scraped {len(articles)} articles from Google News")
            return articles
            
        except Exception as e:
            logger.error(f"Google News scraping failed: {e}")
            return []
    
    async def _scrape_general_news_sites(self, queries: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Scrape general news sites for football content"""
        # List of general news sites with football sections
        news_sites = [
            'https://www.bbc.com/sport/football',
            'https://www.skysports.com/football',
            'https://www.independent.co.uk/sport/football',
            'https://www.telegraph.co.uk/football',
        ]
        
        articles = []
        
        for site_url in news_sites:
            try:
                async with self.rate_limiter:
                    await asyncio.sleep(RATE_LIMITS['web_scraping']['delay_between_requests'])
                    
                    async with self.session.get(site_url) as response:
                        if response.status == 200:
                            html = await response.text()
                            site_articles = await self._extract_articles_from_news_site(
                                html, site_url, queries
                            )
                            articles.extend(site_articles[:5])  # Limit per site
                            
            except Exception as e:
                logger.warning(f"Failed to scrape {site_url}: {e}")
                continue
        
        return articles
    
    async def _extract_articles_from_news_site(self, html: str, site_url: str, queries: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Extract articles from general news sites"""
        try:
            soup = BeautifulSoup(html, 'html.parser')
            articles = []
            
            # Common news article selectors
            article_selectors = [
                'article', '.story', '.article-item', '.news-item',
                '[class*="story"]', '[class*="article"]'
            ]
            
            news_items = []
            for selector in article_selectors:
                items = soup.select(selector)
                if items:
                    news_items.extend(items[:20])
                    break
            
            for item in news_items:
                try:
                    # Extract title
                    title_elem = item.select_one('h1, h2, h3, .headline, .title')
                    if not title_elem:
                        continue
                    
                    title = title_elem.get_text(strip=True)
                    
                    # Check relevance
                    relevance_score = self._calculate_relevance(title, '', queries)
                    if relevance_score < 0.4:
                        continue
                    
                    # Extract link
                    link_elem = item.select_one('a')
                    if not link_elem:
                        continue
                    
                    link = link_elem.get('href', '')
                    if link:
                        link = urljoin(site_url, link)
                    
                    # Extract summary
                    summary_elem = item.select_one('p, .summary, .description')
                    summary = summary_elem.get_text(strip=True) if summary_elem else ''
                    
                    # Extract date
                    pub_date = self._extract_date_from_element(item)
                    
                    # Determine source name
                    domain = urlparse(site_url).netloc
                    source_name = domain.replace('www.', '').replace('.com', '').replace('.co.uk', '').title()
                    
                    article = {
                        'title': title,
                        'summary': summary,
                        'content': summary,
                        'link': link,
                        'author': source_name,
                        'published_at': pub_date or datetime.utcnow(),
                        'source': source_name,
                        'source_type': 'scrape',
                        'relevance_score': relevance_score,
                        'quality_score': 0.7,  # General news sites have good quality
                        'hash': self._generate_hash(title, link),
                        'collected_at': datetime.utcnow(),
                        'language': 'en',
                        'tags': ['news', 'general'],
                        'scrape_info': {
                            'source_url': site_url,
                            'scrape_method': 'general_news'
                        }
                    }
                    
                    articles.append(article)
                    
                except Exception as e:
                    logger.warning(f"Failed to extract article from news site: {e}")
                    continue
            
            return articles
            
        except Exception as e:
            logger.error(f"Failed to extract articles from news site: {e}")
            return []
    
    def _calculate_relevance(self, title: str, summary: str, queries: Dict[str, Any]) -> float:
        """Calculate relevance score for scraped content"""
        text = f"{title} {summary}".lower()
        score = 0.0
        
        # Check for direct team mentions
        for team in queries['teams']:
            if team.lower() in text:
                score += 0.5
        
        # Check for team variations
        for variation in queries['all_variations']:
            if variation.lower() in text:
                score += 0.3
        
        # Check for match queries
        for query in queries['match_queries']:
            if query.lower() in text:
                score += 0.7
        
        # Check for keywords
        for keyword in queries['keywords']:
            if keyword.lower() in text:
                score += 0.1
        
        # Bonus for title matches
        title_lower = title.lower()
        for team in queries['teams']:
            if team.lower() in title_lower:
                score += 0.3
        
        return min(score, 1.0)
    
    def _extract_date_from_element(self, element) -> Optional[datetime]:
        """Extract publication date from HTML element"""
        try:
            # Try different date selectors
            for selector in self.news_selectors['date_selectors']:
                date_elem = element.select_one(selector)
                if date_elem:
                    # Try datetime attribute first
                    datetime_attr = date_elem.get('datetime')
                    if datetime_attr:
                        return self._parse_date_string(datetime_attr)
                    
                    # Try text content
                    date_text = date_elem.get_text(strip=True)
                    if date_text:
                        return self._parse_date_string(date_text)
            
            return None
            
        except Exception as e:
            logger.warning(f"Failed to extract date: {e}")
            return None
    
    def _parse_date_string(self, date_str: str) -> Optional[datetime]:
        """Parse date string into datetime object"""
        if not date_str:
            return None
        
        # Common date formats
        formats = [
            '%Y-%m-%dT%H:%M:%S%z',
            '%Y-%m-%dT%H:%M:%SZ',
            '%Y-%m-%d %H:%M:%S',
            '%Y-%m-%d',
            '%d %B %Y',
            '%d %b %Y',
            '%B %d, %Y',
            '%b %d, %Y',
            '%d/%m/%Y',
            '%m/%d/%Y',
        ]
        
        for fmt in formats:
            try:
                return datetime.strptime(date_str, fmt)
            except ValueError:
                continue
        
        # Try relative dates
        date_str_lower = date_str.lower()
        now = datetime.utcnow()
        
        if 'today' in date_str_lower:
            return now
        elif 'yesterday' in date_str_lower:
            return now - timedelta(days=1)
        elif 'hour' in date_str_lower and 'ago' in date_str_lower:
            # Extract hours
            hours_match = re.search(r'(\d+)\s*hour', date_str_lower)
            if hours_match:
                hours = int(hours_match.group(1))
                return now - timedelta(hours=hours)
        elif 'minute' in date_str_lower and 'ago' in date_str_lower:
            # Extract minutes
            minutes_match = re.search(r'(\d+)\s*minute', date_str_lower)
            if minutes_match:
                minutes = int(minutes_match.group(1))
                return now - timedelta(minutes=minutes)
        
        return None
    
    def _is_date_relevant(self, pub_date: datetime, date_range: tuple) -> bool:
        """Check if date is within relevant range"""
        start_date, end_date = date_range
        return start_date <= pub_date <= end_date
    
    def _clean_summary(self, summary: str) -> str:
        """Clean and normalize summary text"""
        if not summary:
            return ''
        
        # Remove HTML tags
        summary = re.sub(r'<[^>]+>', '', summary)
        
        # Remove extra whitespace
        summary = ' '.join(summary.split())
        
        # Limit length
        if len(summary) > 500:
            summary = summary[:497] + '...'
        
        return summary
    
    def _generate_hash(self, title: str, link: str) -> str:
        """Generate unique hash for deduplication"""
        content = f"{title}{link}"
        return hashlib.md5(content.encode('utf-8')).hexdigest()
    
    async def get_scraping_health(self) -> Dict[str, Any]:
        """Check health of scraping targets"""
        health_results = {}
        
        # Test club websites
        for team, url in self.club_websites.items():
            try:
                async with self.session.get(url, timeout=10) as response:
                    health_results[f"club_{team}"] = {
                        'status': 'healthy' if response.status == 200 else 'unhealthy',
                        'status_code': response.status,
                        'response_time': response.headers.get('server-timing', 'unknown'),
                        'last_checked': datetime.utcnow().isoformat(),
                        'url': url
                    }
            except Exception as e:
                health_results[f"club_{team}"] = {
                    'status': 'error',
                    'error': str(e),
                    'last_checked': datetime.utcnow().isoformat(),
                    'url': url
                }
        
        # Test Google News
        if self.google_news:
            try:
                test_search = self.google_news.search('football', when='1d')
                health_results['google_news'] = {
                    'status': 'healthy' if test_search else 'unhealthy',
                    'results_count': len(test_search.get('entries', [])),
                    'last_checked': datetime.utcnow().isoformat()
                }
            except Exception as e:
                health_results['google_news'] = {
                    'status': 'error',
                    'error': str(e),
                    'last_checked': datetime.utcnow().isoformat()
                }
        
        return health_results