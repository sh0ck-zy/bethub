"""
Advanced Deduplication System for News Articles
Handles duplicate detection across multiple sources and formats
"""

import hashlib
import logging
from datetime import datetime, timedelta
from typing import List, Dict, Any, Set, Optional, Tuple
import difflib
import re
from collections import defaultdict

logger = logging.getLogger(__name__)

class Deduplicator:
    def __init__(self, cache_size: int = 10000):
        self.seen_hashes: Set[str] = set()
        self.title_hashes: Set[str] = set()
        self.content_hashes: Set[str] = set()
        self.url_hashes: Set[str] = set()
        self.cache_size = cache_size
        
        # Similarity thresholds
        self.title_similarity_threshold = 0.85
        self.content_similarity_threshold = 0.75
        self.url_similarity_threshold = 0.90
        
        # Patterns for normalization
        self.title_patterns = [
            r'^(BREAKING|OFFICIAL|EXCLUSIVE|LIVE|UPDATE):\s*',
            r'\s*\|\s*.*$',  # Remove "| Source Name" suffixes
            r'\s*-\s*.*$',   # Remove "- Source Name" suffixes
            r'\s*\.\.\.$',   # Remove trailing ellipsis
        ]
        
        self.content_patterns = [
            r'<[^>]+>',  # HTML tags
            r'\s+',      # Multiple whitespace
            r'^\s+|\s+$',  # Leading/trailing whitespace
        ]
    
    def deduplicate_articles(self, articles: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Remove duplicate articles using multiple strategies
        Returns deduplicated articles with merge information
        """
        if not articles:
            return []
        
        # Sort by quality score (highest first) to prioritize better articles
        sorted_articles = sorted(articles, key=lambda x: x.get('quality_score', 0), reverse=True)
        
        unique_articles = []
        processed_hashes = set()
        
        for article in sorted_articles:
            # Generate multiple hash strategies
            hashes = self._generate_article_hashes(article)
            
            # Check if we've seen any of these hashes
            if self._is_duplicate_by_hash(hashes, processed_hashes):
                # Find the original article and merge information
                original_article = self._find_original_article(article, unique_articles)
                if original_article:
                    self._merge_article_info(original_article, article)
                continue
            
            # Check for similarity-based duplicates
            duplicate_found = False
            for existing_article in unique_articles:
                if self._is_similar_article(article, existing_article):
                    self._merge_article_info(existing_article, article)
                    duplicate_found = True
                    break
            
            if not duplicate_found:
                # Add tracking information
                article['deduplication_info'] = {
                    'is_original': True,
                    'merged_count': 0,
                    'merged_sources': [],
                    'first_seen': datetime.utcnow(),
                    'hashes': hashes
                }
                unique_articles.append(article)
                
                # Store hashes
                for hash_val in hashes.values():
                    processed_hashes.add(hash_val)
        
        logger.info(f"Deduplicated {len(articles)} articles to {len(unique_articles)} unique articles")
        return unique_articles
    
    def _generate_article_hashes(self, article: Dict[str, Any]) -> Dict[str, str]:
        """Generate multiple hash strategies for an article"""
        hashes = {}
        
        # Title hash (normalized)
        title = article.get('title', '')
        normalized_title = self._normalize_title(title)
        hashes['title'] = self._hash_string(normalized_title)
        
        # Content hash (first paragraph)
        content = article.get('content', '') or article.get('summary', '')
        if content:
            first_paragraph = self._extract_first_paragraph(content)
            normalized_content = self._normalize_content(first_paragraph)
            hashes['content'] = self._hash_string(normalized_content)
        
        # URL hash (domain + path)
        url = article.get('link', '') or article.get('url', '')
        if url:
            normalized_url = self._normalize_url(url)
            hashes['url'] = self._hash_string(normalized_url)
        
        # Combined hash
        combined_content = f"{normalized_title}{normalized_content}"
        hashes['combined'] = self._hash_string(combined_content)
        
        # Exact hash (for exact matches)
        exact_content = f"{title}{content}{url}"
        hashes['exact'] = self._hash_string(exact_content)
        
        return hashes
    
    def _is_duplicate_by_hash(self, hashes: Dict[str, str], processed_hashes: Set[str]) -> bool:
        """Check if article is duplicate based on hash matching"""
        # Check exact match first
        if hashes.get('exact') in processed_hashes:
            return True
        
        # Check title hash
        if hashes.get('title') in processed_hashes:
            return True
        
        # Check content hash
        if hashes.get('content') in processed_hashes:
            return True
        
        # Check URL hash
        if hashes.get('url') in processed_hashes:
            return True
        
        return False
    
    def _is_similar_article(self, article1: Dict[str, Any], article2: Dict[str, Any]) -> bool:
        """Check if two articles are similar using content analysis"""
        # Title similarity
        title1 = self._normalize_title(article1.get('title', ''))
        title2 = self._normalize_title(article2.get('title', ''))
        
        if title1 and title2:
            title_similarity = difflib.SequenceMatcher(None, title1, title2).ratio()
            if title_similarity >= self.title_similarity_threshold:
                return True
        
        # Content similarity
        content1 = self._normalize_content(article1.get('content', '') or article1.get('summary', ''))
        content2 = self._normalize_content(article2.get('content', '') or article2.get('summary', ''))
        
        if content1 and content2 and len(content1) > 50 and len(content2) > 50:
            content_similarity = difflib.SequenceMatcher(None, content1, content2).ratio()
            if content_similarity >= self.content_similarity_threshold:
                return True
        
        # URL similarity
        url1 = self._normalize_url(article1.get('link', '') or article1.get('url', ''))
        url2 = self._normalize_url(article2.get('link', '') or article2.get('url', ''))
        
        if url1 and url2:
            url_similarity = difflib.SequenceMatcher(None, url1, url2).ratio()
            if url_similarity >= self.url_similarity_threshold:
                return True
        
        return False
    
    def _find_original_article(self, duplicate_article: Dict[str, Any], unique_articles: List[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
        """Find the original article that this duplicate matches"""
        duplicate_hashes = self._generate_article_hashes(duplicate_article)
        
        for article in unique_articles:
            article_hashes = article.get('deduplication_info', {}).get('hashes', {})
            
            # Check for hash matches
            for hash_type, hash_val in duplicate_hashes.items():
                if hash_val in article_hashes.values():
                    return article
            
            # Check for similarity
            if self._is_similar_article(duplicate_article, article):
                return article
        
        return None
    
    def _merge_article_info(self, original_article: Dict[str, Any], duplicate_article: Dict[str, Any]):
        """Merge information from duplicate article into original"""
        dedup_info = original_article.get('deduplication_info', {})
        
        # Increment merge count
        dedup_info['merged_count'] = dedup_info.get('merged_count', 0) + 1
        
        # Add source information
        merged_sources = dedup_info.get('merged_sources', [])
        duplicate_source = {
            'source': duplicate_article.get('source', ''),
            'source_type': duplicate_article.get('source_type', ''),
            'url': duplicate_article.get('link', '') or duplicate_article.get('url', ''),
            'quality_score': duplicate_article.get('quality_score', 0),
            'published_at': duplicate_article.get('published_at'),
            'merged_at': datetime.utcnow()
        }
        merged_sources.append(duplicate_source)
        dedup_info['merged_sources'] = merged_sources
        
        # Update quality score if duplicate has higher score
        if duplicate_article.get('quality_score', 0) > original_article.get('quality_score', 0):
            original_article['quality_score'] = duplicate_article['quality_score']
        
        # Enhance content if duplicate has more content
        if len(duplicate_article.get('content', '')) > len(original_article.get('content', '')):
            original_article['content'] = duplicate_article['content']
        
        # Enhance summary if duplicate has better summary
        if len(duplicate_article.get('summary', '')) > len(original_article.get('summary', '')):
            original_article['summary'] = duplicate_article['summary']
        
        # Merge tags
        original_tags = set(original_article.get('tags', []))
        duplicate_tags = set(duplicate_article.get('tags', []))
        original_article['tags'] = list(original_tags.union(duplicate_tags))
        
        # Update latest seen timestamp
        dedup_info['last_seen'] = datetime.utcnow()
        
        original_article['deduplication_info'] = dedup_info
    
    def _normalize_title(self, title: str) -> str:
        """Normalize title for comparison"""
        if not title:
            return ""
        
        normalized = title.lower()
        
        # Apply normalization patterns
        for pattern in self.title_patterns:
            normalized = re.sub(pattern, '', normalized, flags=re.IGNORECASE)
        
        # Remove extra whitespace
        normalized = ' '.join(normalized.split())
        
        return normalized.strip()
    
    def _normalize_content(self, content: str) -> str:
        """Normalize content for comparison"""
        if not content:
            return ""
        
        normalized = content.lower()
        
        # Apply normalization patterns
        for pattern in self.content_patterns:
            normalized = re.sub(pattern, ' ', normalized)
        
        # Remove extra whitespace
        normalized = ' '.join(normalized.split())
        
        return normalized.strip()
    
    def _normalize_url(self, url: str) -> str:
        """Normalize URL for comparison"""
        if not url:
            return ""
        
        # Remove protocol and www
        normalized = url.lower()
        normalized = re.sub(r'^https?://', '', normalized)
        normalized = re.sub(r'^www\.', '', normalized)
        
        # Remove common URL parameters
        normalized = re.sub(r'[?&](utm_|ref=|source=|fbclid=|gclid=)[^&]*', '', normalized)
        
        # Remove trailing slash
        normalized = normalized.rstrip('/')
        
        return normalized
    
    def _extract_first_paragraph(self, content: str) -> str:
        """Extract first paragraph from content"""
        if not content:
            return ""
        
        # Split by double newlines or paragraph tags
        paragraphs = re.split(r'\n\s*\n|</p>|<p>', content)
        
        if paragraphs:
            first_paragraph = paragraphs[0].strip()
            # Remove HTML tags
            first_paragraph = re.sub(r'<[^>]+>', '', first_paragraph)
            return first_paragraph
        
        return content[:500]  # Fallback to first 500 characters
    
    def _hash_string(self, content: str) -> str:
        """Generate hash for string content"""
        return hashlib.md5(content.encode('utf-8')).hexdigest()
    
    def get_duplicate_statistics(self, articles: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Get statistics about duplicates in the article set"""
        if not articles:
            return {}
        
        total_articles = len(articles)
        unique_articles = len(self.deduplicate_articles(articles))
        duplicates_removed = total_articles - unique_articles
        
        # Source distribution
        source_counts = defaultdict(int)
        for article in articles:
            source_counts[article.get('source', 'unknown')] += 1
        
        # Quality score distribution
        quality_scores = [article.get('quality_score', 0) for article in articles]
        avg_quality = sum(quality_scores) / len(quality_scores) if quality_scores else 0
        
        return {
            'total_articles': total_articles,
            'unique_articles': unique_articles,
            'duplicates_removed': duplicates_removed,
            'duplicate_percentage': (duplicates_removed / total_articles * 100) if total_articles > 0 else 0,
            'source_distribution': dict(source_counts),
            'average_quality_score': avg_quality,
            'quality_score_range': {
                'min': min(quality_scores) if quality_scores else 0,
                'max': max(quality_scores) if quality_scores else 0
            }
        }
    
    def clear_cache(self):
        """Clear the deduplication cache"""
        self.seen_hashes.clear()
        self.title_hashes.clear()
        self.content_hashes.clear()
        self.url_hashes.clear()
        logger.info("Deduplication cache cleared")
    
    def get_cache_stats(self) -> Dict[str, int]:
        """Get current cache statistics"""
        return {
            'total_hashes': len(self.seen_hashes),
            'title_hashes': len(self.title_hashes),
            'content_hashes': len(self.content_hashes),
            'url_hashes': len(self.url_hashes),
            'cache_size_limit': self.cache_size
        }


class SmartMerger:
    """
    Smart merger for combining information from duplicate articles
    """
    
    def __init__(self):
        self.content_preferences = [
            'content', 'summary', 'description', 'text'
        ]
        
        self.source_quality_weights = {
            'bbc_sport': 0.95,
            'guardian_football': 0.92,
            'sky_sports': 0.88,
            'espn_fc': 0.85,
            'official_club': 0.90,
            'reddit_match_thread': 0.75,
            'twitter_verified': 0.70,
            'google_news': 0.55,
        }
    
    def merge_duplicate_articles(self, articles: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Merge multiple duplicate articles into a single comprehensive article
        """
        if not articles:
            return {}
        
        if len(articles) == 1:
            return articles[0]
        
        # Sort by quality score
        sorted_articles = sorted(articles, key=lambda x: x.get('quality_score', 0), reverse=True)
        base_article = sorted_articles[0].copy()
        
        # Merge information from other articles
        for article in sorted_articles[1:]:
            base_article = self._merge_two_articles(base_article, article)
        
        # Add merge metadata
        base_article['merge_info'] = {
            'merged_from': len(articles),
            'source_articles': [
                {
                    'source': article.get('source', ''),
                    'url': article.get('link', '') or article.get('url', ''),
                    'quality_score': article.get('quality_score', 0),
                    'published_at': article.get('published_at')
                }
                for article in articles
            ],
            'merged_at': datetime.utcnow(),
            'primary_source': base_article.get('source', '')
        }
        
        return base_article
    
    def _merge_two_articles(self, primary: Dict[str, Any], secondary: Dict[str, Any]) -> Dict[str, Any]:
        """Merge two articles, preferring primary"""
        merged = primary.copy()
        
        # Merge content (prefer longer, more detailed content)
        for content_field in self.content_preferences:
            primary_content = primary.get(content_field, '')
            secondary_content = secondary.get(content_field, '')
            
            if len(secondary_content) > len(primary_content):
                merged[content_field] = secondary_content
        
        # Merge tags
        primary_tags = set(primary.get('tags', []))
        secondary_tags = set(secondary.get('tags', []))
        merged['tags'] = list(primary_tags.union(secondary_tags))
        
        # Update quality score if secondary is better
        if secondary.get('quality_score', 0) > primary.get('quality_score', 0):
            merged['quality_score'] = secondary['quality_score']
        
        # Prefer earlier publication date
        primary_date = primary.get('published_at')
        secondary_date = secondary.get('published_at')
        
        if secondary_date and (not primary_date or secondary_date < primary_date):
            merged['published_at'] = secondary_date
        
        # Merge author information
        primary_author = primary.get('author', '')
        secondary_author = secondary.get('author', '')
        
        if secondary_author and not primary_author:
            merged['author'] = secondary_author
        elif primary_author and secondary_author and primary_author != secondary_author:
            merged['author'] = f"{primary_author}, {secondary_author}"
        
        return merged