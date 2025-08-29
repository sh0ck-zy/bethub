"""
Advanced Quality Scoring System
Evaluates news articles across multiple dimensions for credibility and relevance
"""

import logging
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional, Tuple
import re
from collections import Counter
import math

from ..config import QUALITY_SCORING

logger = logging.getLogger(__name__)

class QualityScorer:
    def __init__(self):
        self.source_weights = QUALITY_SCORING['source_weights']
        self.content_multipliers = QUALITY_SCORING['content_multipliers']
        self.engagement_weights = QUALITY_SCORING['engagement_weights']
        
        # Quality indicators
        self.positive_indicators = {
            'source_authority': [
                'official', 'verified', 'confirmed', 'statement', 'press release',
                'exclusive', 'interview', 'quotes', 'breaking'
            ],
            'content_quality': [
                'analysis', 'detailed', 'comprehensive', 'in-depth', 'expert',
                'statistics', 'data', 'evidence', 'research', 'study'
            ],
            'credibility': [
                'according to', 'sources say', 'confirmed by', 'reported by',
                'spokesperson', 'manager said', 'player said', 'official statement'
            ]
        }
        
        self.negative_indicators = {
            'speculation': [
                'rumor', 'rumour', 'speculation', 'allegedly', 'reportedly',
                'unconfirmed', 'gossip', 'whisper', 'buzz', 'chatter'
            ],
            'clickbait': [
                'shocking', 'incredible', 'unbelievable', 'amazing', 'stunning',
                'you won\'t believe', 'this will blow your mind', 'viral'
            ],
            'low_quality': [
                'opinion', 'blog', 'personal view', 'rant', 'hot take',
                'controversial', 'drama', 'feud', 'controversy'
            ]
        }
        
        # Source reliability tiers
        self.source_tiers = {
            'tier_1': [  # Highest credibility
                'bbc_sport', 'guardian_football', 'sky_sports', 'official_club'
            ],
            'tier_2': [  # High credibility
                'espn_fc', 'premier_league', 'champions_league', 'reuters_sport'
            ],
            'tier_3': [  # Medium credibility
                'cnn_sport', 'goal_com', 'football_365', 'transfermarkt'
            ],
            'tier_4': [  # Lower credibility
                'reddit_match_thread', 'twitter_journalist', 'scraped_news'
            ],
            'tier_5': [  # Lowest credibility
                'reddit_discussion', 'twitter_verified', 'google_news'
            ]
        }
    
    def calculate_quality_score(self, article: Dict[str, Any]) -> float:
        """
        Calculate comprehensive quality score for an article
        Returns a score between 0.0 and 1.0
        """
        try:
            # Extract article components
            title = article.get('title', '')
            content = article.get('content', '') or article.get('summary', '')
            source = article.get('source', '')
            source_type = article.get('source_type', '')
            
            # Calculate individual scores
            source_score = self._calculate_source_score(source, source_type)
            content_score = self._calculate_content_score(title, content)
            authority_score = self._calculate_authority_score(title, content)
            freshness_score = self._calculate_freshness_score(article)
            engagement_score = self._calculate_engagement_score(article)
            consistency_score = self._calculate_consistency_score(article)
            
            # Weighted combination
            weights = {
                'source': 0.30,
                'content': 0.25,
                'authority': 0.20,
                'freshness': 0.10,
                'engagement': 0.10,
                'consistency': 0.05
            }
            
            final_score = (
                source_score * weights['source'] +
                content_score * weights['content'] +
                authority_score * weights['authority'] +
                freshness_score * weights['freshness'] +
                engagement_score * weights['engagement'] +
                consistency_score * weights['consistency']
            )
            
            # Apply content type multipliers
            content_type = article.get('content_classification', {}).get('content_type', 'general')
            multiplier = self.content_multipliers.get(content_type, 1.0)
            final_score *= multiplier
            
            # Ensure score is within bounds
            final_score = max(0.0, min(1.0, final_score))
            
            # Store detailed scoring breakdown
            article['quality_breakdown'] = {
                'source_score': source_score,
                'content_score': content_score,
                'authority_score': authority_score,
                'freshness_score': freshness_score,
                'engagement_score': engagement_score,
                'consistency_score': consistency_score,
                'content_multiplier': multiplier,
                'final_score': final_score,
                'calculated_at': datetime.utcnow()
            }
            
            return final_score
            
        except Exception as e:
            logger.error(f"Quality scoring failed: {e}")
            return 0.5  # Default score on error
    
    def _calculate_source_score(self, source: str, source_type: str) -> float:
        """Calculate score based on source credibility"""
        # Start with base source weight
        base_score = self.source_weights.get(source_type, 0.5)
        
        # Apply source-specific adjustments
        source_lower = source.lower()
        
        # Tier-based adjustments
        for tier, sources in self.source_tiers.items():
            if any(src in source_lower for src in sources):
                tier_multipliers = {
                    'tier_1': 1.0,
                    'tier_2': 0.95,
                    'tier_3': 0.85,
                    'tier_4': 0.75,
                    'tier_5': 0.65
                }
                base_score *= tier_multipliers[tier]
                break
        
        # Boost for official sources
        if 'official' in source_lower or 'verified' in source_lower:
            base_score *= 1.1
        
        # Penalty for aggregators
        if any(word in source_lower for word in ['aggregator', 'compilation', 'roundup']):
            base_score *= 0.8
        
        return min(base_score, 1.0)
    
    def _calculate_content_score(self, title: str, content: str) -> float:
        """Calculate score based on content quality indicators"""
        text = f"{title} {content}".lower()
        score = 0.5  # Base score
        
        # Positive indicators
        positive_count = 0
        for category, indicators in self.positive_indicators.items():
            for indicator in indicators:
                if indicator in text:
                    positive_count += 1
        
        # Negative indicators
        negative_count = 0
        for category, indicators in self.negative_indicators.items():
            for indicator in indicators:
                if indicator in text:
                    negative_count += 1
        
        # Calculate adjustment
        net_indicators = positive_count - negative_count
        score += net_indicators * 0.05  # 5% per net positive indicator
        
        # Length quality (sweet spot around 200-800 words)
        word_count = len(content.split()) if content else len(title.split())
        if 200 <= word_count <= 800:
            score += 0.1
        elif word_count < 50:
            score -= 0.2
        elif word_count > 1500:
            score -= 0.1
        
        # Structure quality
        structure_score = self._assess_content_structure(title, content)
        score += structure_score * 0.2
        
        return max(0.0, min(1.0, score))
    
    def _calculate_authority_score(self, title: str, content: str) -> float:
        """Calculate score based on authority indicators"""
        text = f"{title} {content}".lower()
        score = 0.5
        
        # Authority indicators
        authority_terms = [
            'manager', 'coach', 'player', 'spokesperson', 'chairman',
            'director', 'official', 'statement', 'press conference',
            'interview', 'quotes', 'said', 'confirmed', 'announced'
        ]
        
        authority_count = sum(1 for term in authority_terms if term in text)
        score += min(authority_count * 0.1, 0.3)  # Max 30% boost
        
        # Named sources boost credibility
        if re.search(r'\b[A-Z][a-z]+ [A-Z][a-z]+\b', content or title):
            score += 0.1
        
        # Quotes indicate first-hand information
        if '"' in text or "'" in text:
            score += 0.1
        
        # Statistics and data
        if re.search(r'\d+%|\d+\.\d+|statistics|data|analysis', text):
            score += 0.1
        
        return min(score, 1.0)
    
    def _calculate_freshness_score(self, article: Dict[str, Any]) -> float:
        """Calculate score based on article freshness"""
        pub_date = article.get('published_at')
        if not pub_date:
            return 0.5
        
        if isinstance(pub_date, str):
            try:
                pub_date = datetime.fromisoformat(pub_date.replace('Z', '+00:00'))
            except:
                return 0.5
        
        # Calculate age in hours
        age_hours = (datetime.utcnow() - pub_date).total_seconds() / 3600
        
        # Fresher articles get higher scores
        if age_hours <= 1:
            return 1.0
        elif age_hours <= 6:
            return 0.9
        elif age_hours <= 24:
            return 0.8
        elif age_hours <= 72:
            return 0.6
        elif age_hours <= 168:  # 1 week
            return 0.4
        else:
            return 0.2
    
    def _calculate_engagement_score(self, article: Dict[str, Any]) -> float:
        """Calculate score based on engagement metrics"""
        score = 0.5
        
        # Reddit-specific engagement
        reddit_data = article.get('reddit_data', {})
        if reddit_data:
            upvotes = reddit_data.get('score', 0)
            comments = reddit_data.get('num_comments', 0)
            
            # Scale engagement scores
            upvote_score = min(upvotes * self.engagement_weights['reddit_upvotes'], 0.3)
            comment_score = min(comments * self.engagement_weights['reddit_comments'], 0.3)
            
            score += upvote_score + comment_score
        
        # Twitter-specific engagement
        twitter_data = article.get('twitter_data', {})
        if twitter_data:
            # For Twitter, engagement is implicit in the account quality
            account = twitter_data.get('account', '')
            if account in ['FabrizioRomano', 'David_Ornstein', 'JamesPearceLFC']:
                score += 0.2  # High-profile journalists
        
        # View count or other metrics (if available)
        view_count = article.get('view_count', 0)
        if view_count > 0:
            view_score = min(math.log10(view_count) * 0.05, 0.2)
            score += view_score
        
        return min(score, 1.0)
    
    def _calculate_consistency_score(self, article: Dict[str, Any]) -> float:
        """Calculate score based on internal consistency"""
        title = article.get('title', '')
        summary = article.get('summary', '')
        content = article.get('content', '')
        
        score = 0.5
        
        # Title-content consistency
        if summary and content:
            title_words = set(title.lower().split())
            summary_words = set(summary.lower().split())
            content_words = set(content.lower().split())
            
            # Remove common words
            stop_words = {'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'}
            title_words -= stop_words
            summary_words -= stop_words
            content_words -= stop_words
            
            # Calculate overlap
            if title_words and summary_words:
                title_summary_overlap = len(title_words & summary_words) / len(title_words | summary_words)
                score += title_summary_overlap * 0.2
            
            if summary_words and content_words:
                summary_content_overlap = len(summary_words & content_words) / len(summary_words | content_words)
                score += summary_content_overlap * 0.2
        
        # Date consistency
        pub_date = article.get('published_at')
        collected_date = article.get('collected_at')
        
        if pub_date and collected_date:
            if isinstance(pub_date, str):
                try:
                    pub_date = datetime.fromisoformat(pub_date.replace('Z', '+00:00'))
                except:
                    pub_date = None
            
            if pub_date and pub_date <= collected_date:
                score += 0.1  # Logical date ordering
        
        return min(score, 1.0)
    
    def _assess_content_structure(self, title: str, content: str) -> float:
        """Assess structural quality of content"""
        score = 0.0
        
        if not content:
            return score
        
        # Sentence structure
        sentences = re.split(r'[.!?]+', content)
        sentences = [s.strip() for s in sentences if s.strip()]
        
        if sentences:
            avg_sentence_length = sum(len(s.split()) for s in sentences) / len(sentences)
            
            # Optimal sentence length is 15-25 words
            if 15 <= avg_sentence_length <= 25:
                score += 0.3
            elif 10 <= avg_sentence_length <= 30:
                score += 0.2
            elif avg_sentence_length < 5 or avg_sentence_length > 40:
                score -= 0.1
        
        # Paragraph structure
        paragraphs = content.split('\n\n')
        paragraphs = [p.strip() for p in paragraphs if p.strip()]
        
        if len(paragraphs) > 1:
            score += 0.2  # Multi-paragraph content is generally better structured
        
        # Punctuation and grammar indicators
        punctuation_ratio = len(re.findall(r'[.!?]', content)) / len(content.split())
        if 0.05 <= punctuation_ratio <= 0.15:  # Reasonable punctuation density
            score += 0.2
        
        # Capital letters (proper nouns, names)
        capital_ratio = len(re.findall(r'\b[A-Z][a-z]+\b', content)) / len(content.split())
        if 0.1 <= capital_ratio <= 0.3:  # Reasonable proper noun density
            score += 0.3
        
        return min(score, 1.0)
    
    def batch_score_articles(self, articles: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Score multiple articles efficiently"""
        scored_articles = []
        
        for article in articles:
            try:
                quality_score = self.calculate_quality_score(article)
                article['quality_score'] = quality_score
                scored_articles.append(article)
            except Exception as e:
                logger.error(f"Failed to score article {article.get('title', 'unknown')}: {e}")
                article['quality_score'] = 0.5  # Default score
                scored_articles.append(article)
        
        return scored_articles
    
    def get_quality_distribution(self, articles: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze quality distribution across articles"""
        if not articles:
            return {}
        
        scores = [article.get('quality_score', 0) for article in articles]
        
        return {
            'total_articles': len(articles),
            'average_quality': sum(scores) / len(scores),
            'median_quality': sorted(scores)[len(scores) // 2],
            'quality_distribution': {
                'excellent': len([s for s in scores if s >= 0.8]),
                'good': len([s for s in scores if 0.6 <= s < 0.8]),
                'fair': len([s for s in scores if 0.4 <= s < 0.6]),
                'poor': len([s for s in scores if s < 0.4])
            },
            'top_quality_threshold': sorted(scores, reverse=True)[min(len(scores) // 10, len(scores) - 1)],  # Top 10%
            'source_quality': self._analyze_source_quality(articles)
        }
    
    def _analyze_source_quality(self, articles: List[Dict[str, Any]]) -> Dict[str, float]:
        """Analyze quality by source"""
        source_scores = {}
        
        for article in articles:
            source = article.get('source_type', 'unknown')
            quality = article.get('quality_score', 0)
            
            if source not in source_scores:
                source_scores[source] = []
            source_scores[source].append(quality)
        
        # Calculate average quality per source
        avg_source_quality = {}
        for source, scores in source_scores.items():
            avg_source_quality[source] = sum(scores) / len(scores)
        
        return avg_source_quality
    
    def recommend_quality_threshold(self, articles: List[Dict[str, Any]], target_count: int = 50) -> float:
        """Recommend quality threshold to get approximately target_count articles"""
        if not articles or target_count <= 0:
            return 0.5
        
        scores = sorted([article.get('quality_score', 0) for article in articles], reverse=True)
        
        if len(scores) <= target_count:
            return 0.0  # Include all articles
        
        # Return the score that would include approximately target_count articles
        threshold_index = min(target_count - 1, len(scores) - 1)
        return scores[threshold_index]
    
    def flag_low_quality_articles(self, articles: List[Dict[str, Any]], threshold: float = 0.3) -> List[Dict[str, Any]]:
        """Flag articles that may be low quality"""
        flagged = []
        
        for article in articles:
            quality_score = article.get('quality_score', 0.5)
            
            if quality_score < threshold:
                breakdown = article.get('quality_breakdown', {})
                
                # Identify specific issues
                issues = []
                
                if breakdown.get('source_score', 0.5) < 0.4:
                    issues.append('unreliable_source')
                
                if breakdown.get('content_score', 0.5) < 0.4:
                    issues.append('poor_content_quality')
                
                if breakdown.get('authority_score', 0.5) < 0.3:
                    issues.append('lack_of_authority')
                
                if breakdown.get('freshness_score', 0.5) < 0.3:
                    issues.append('outdated_content')
                
                article['quality_flags'] = {
                    'flagged': True,
                    'issues': issues,
                    'quality_score': quality_score,
                    'threshold': threshold,
                    'flagged_at': datetime.utcnow()
                }
                
                flagged.append(article)
        
        return flagged