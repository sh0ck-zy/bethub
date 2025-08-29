"""
Content Processing Pipeline
Handles text processing, language detection, sentiment analysis, and content enhancement
"""

import re
import logging
from datetime import datetime
from typing import List, Dict, Any, Optional, Tuple
from collections import Counter, defaultdict
import asyncio

logger = logging.getLogger(__name__)

class ContentProcessor:
    def __init__(self):
        self.language_detector = LanguageDetector()
        self.sentiment_analyzer = SentimentAnalyzer()
        self.content_enhancer = ContentEnhancer()
        self.keyword_extractor = KeywordExtractor()
        
    async def process_articles(self, articles: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Process all articles through the content pipeline"""
        if not articles:
            return []
        
        processed_articles = []
        
        for article in articles:
            try:
                processed_article = await self._process_single_article(article)
                if processed_article:
                    processed_articles.append(processed_article)
            except Exception as e:
                logger.error(f"Error processing article {article.get('title', 'unknown')}: {e}")
                # Include original article if processing fails
                processed_articles.append(article)
        
        return processed_articles
    
    async def _process_single_article(self, article: Dict[str, Any]) -> Dict[str, Any]:
        """Process a single article through the pipeline"""
        processed = article.copy()
        
        # Extract text content
        text_content = self._extract_text_content(article)
        
        # Language detection
        language_info = self.language_detector.detect_language(text_content)
        processed['language_info'] = language_info
        
        # Sentiment analysis
        sentiment_info = self.sentiment_analyzer.analyze_sentiment(text_content, article)
        processed['sentiment_info'] = sentiment_info
        
        # Content enhancement
        enhanced_content = self.content_enhancer.enhance_content(article, text_content)
        processed.update(enhanced_content)
        
        # Keyword extraction
        keywords = self.keyword_extractor.extract_keywords(text_content, article)
        processed['keywords'] = keywords
        
        # Content classification
        classification = self._classify_content(article, text_content)
        processed['content_classification'] = classification
        
        # Processing metadata
        processed['content_processing'] = {
            'processed_at': datetime.utcnow(),
            'text_length': len(text_content),
            'processing_version': '1.0'
        }
        
        return processed
    
    def _extract_text_content(self, article: Dict[str, Any]) -> str:
        """Extract all text content from article"""
        text_parts = []
        
        # Title
        if article.get('title'):
            text_parts.append(article['title'])
        
        # Summary/Description
        if article.get('summary'):
            text_parts.append(article['summary'])
        elif article.get('description'):
            text_parts.append(article['description'])
        
        # Content
        if article.get('content'):
            text_parts.append(article['content'])
        
        # Reddit comments (if available)
        if article.get('top_comments'):
            for comment in article['top_comments']:
                if comment.get('body'):
                    text_parts.append(comment['body'])
        
        return ' '.join(text_parts)
    
    def _classify_content(self, article: Dict[str, Any], text_content: str) -> Dict[str, Any]:
        """Classify content type and topic"""
        title = article.get('title', '').lower()
        content = text_content.lower()
        
        # Content type classification
        content_type = 'general'
        
        if any(indicator in title for indicator in ['match thread', 'live thread', 'game thread']):
            content_type = 'match_thread'
        elif any(indicator in title for indicator in ['preview', 'prediction', 'vs', 'v']):
            content_type = 'match_preview'
        elif any(indicator in title for indicator in ['report', 'result', 'final', 'ft']):
            content_type = 'match_report'
        elif any(indicator in title for indicator in ['injury', 'injured', 'fitness']):
            content_type = 'injury_news'
        elif any(indicator in title for indicator in ['transfer', 'signing', 'deal', 'contract']):
            content_type = 'transfer_news'
        elif any(indicator in title for indicator in ['breaking', 'urgent', 'official']):
            content_type = 'breaking_news'
        elif any(indicator in title for indicator in ['interview', 'exclusive', 'talks']):
            content_type = 'interview'
        elif any(indicator in title for indicator in ['analysis', 'tactical', 'stats']):
            content_type = 'analysis'
        
        # Topic classification
        topics = []
        
        # Team-related topics
        if any(word in content for word in ['lineup', 'starting', 'eleven', 'formation']):
            topics.append('team_news')
        
        if any(word in content for word in ['goal', 'goals', 'scorer', 'assist']):
            topics.append('match_events')
        
        if any(word in content for word in ['manager', 'coach', 'tactical', 'strategy']):
            topics.append('tactics')
        
        if any(word in content for word in ['fan', 'fans', 'supporter', 'crowd']):
            topics.append('fan_reaction')
        
        if any(word in content for word in ['referee', 'var', 'decision', 'controversy']):
            topics.append('officiating')
        
        # Urgency level
        urgency = 'low'
        if any(word in title for word in ['breaking', 'urgent', 'just in']):
            urgency = 'high'
        elif any(word in title for word in ['confirmed', 'official', 'announced']):
            urgency = 'medium'
        
        return {
            'content_type': content_type,
            'topics': topics,
            'urgency': urgency,
            'confidence': 0.8  # Static confidence for now
        }


class LanguageDetector:
    """Language detection and handling"""
    
    def __init__(self):
        self.supported_languages = ['en', 'es', 'fr', 'de', 'it', 'pt', 'nl']
        self.confidence_threshold = 0.7
    
    def detect_language(self, text: str) -> Dict[str, Any]:
        """Detect language of text content"""
        if not text or len(text) < 20:
            return {
                'language': 'unknown',
                'confidence': 0.0,
                'needs_translation': False
            }
        
        try:
            # Use langdetect library if available
            try:
                from langdetect import detect, detect_langs
                
                # Get language with confidence
                language_probs = detect_langs(text)
                
                if language_probs:
                    top_lang = language_probs[0]
                    language = top_lang.lang
                    confidence = top_lang.prob
                    
                    return {
                        'language': language,
                        'confidence': confidence,
                        'needs_translation': language != 'en' and confidence > self.confidence_threshold,
                        'all_probabilities': [(lang.lang, lang.prob) for lang in language_probs[:3]]
                    }
            except ImportError:
                # Fallback to simple detection
                language = self._simple_language_detection(text)
                return {
                    'language': language,
                    'confidence': 0.6,
                    'needs_translation': language != 'en',
                    'detection_method': 'simple'
                }
        except Exception as e:
            logger.warning(f"Language detection failed: {e}")
            return {
                'language': 'en',  # Default to English
                'confidence': 0.0,
                'needs_translation': False,
                'error': str(e)
            }
    
    def _simple_language_detection(self, text: str) -> str:
        """Simple language detection based on common words"""
        text_lower = text.lower()
        
        # Common words by language
        language_indicators = {
            'es': ['el', 'la', 'de', 'que', 'y', 'en', 'un', 'es', 'se', 'no', 'te', 'lo', 'le', 'da', 'su', 'por', 'son', 'con', 'para', 'una', 'tienen', 'él', 'sobre', 'del', 'fue', 'son', 'muy', 'están', 'cuando', 'hasta', 'desde'],
            'fr': ['le', 'de', 'et', 'à', 'un', 'il', 'être', 'et', 'en', 'avoir', 'que', 'pour', 'dans', 'ce', 'son', 'une', 'sur', 'avec', 'ne', 'se', 'pas', 'tout', 'plus', 'par', 'grand', 'comme', 'cette', 'lui', 'bien', 'deux'],
            'de': ['der', 'die', 'und', 'in', 'den', 'von', 'zu', 'das', 'mit', 'sich', 'des', 'auf', 'für', 'ist', 'im', 'dem', 'nicht', 'ein', 'eine', 'als', 'auch', 'es', 'an', 'werden', 'aus', 'er', 'hat', 'dass', 'sie', 'nach'],
            'it': ['il', 'di', 'che', 'e', 'la', 'il', 'un', 'a', 'essere', 'da', 'in', 'per', 'una', 'con', 'non', 'avere', 'lo', 'su', 'si', 'me', 'mi', 'ma', 'anche', 'come', 'dalla', 'bene', 'sì', 'tutto', 'questo', 'fare'],
            'pt': ['o', 'de', 'a', 'e', 'do', 'da', 'em', 'um', 'para', 'é', 'com', 'não', 'uma', 'os', 'no', 'se', 'na', 'por', 'mais', 'as', 'dos', 'como', 'mas', 'foi', 'ao', 'ele', 'das', 'tem', 'à', 'seu']
        }
        
        scores = defaultdict(int)
        words = text_lower.split()
        
        for word in words:
            for lang, indicators in language_indicators.items():
                if word in indicators:
                    scores[lang] += 1
        
        # Default to English if no strong indicators
        if not scores:
            return 'en'
        
        # Return language with highest score
        return max(scores, key=scores.get)


class SentimentAnalyzer:
    """Sentiment analysis for football content"""
    
    def __init__(self):
        # Football-specific sentiment words
        self.positive_words = {
            'general': ['good', 'great', 'excellent', 'amazing', 'brilliant', 'fantastic', 'outstanding', 'superb', 'incredible', 'perfect'],
            'football': ['goal', 'victory', 'win', 'champion', 'success', 'triumph', 'celebration', 'hero', 'legend', 'star', 'talent', 'skill', 'masterclass', 'dominate', 'clinical', 'precise']
        }
        
        self.negative_words = {
            'general': ['bad', 'terrible', 'awful', 'horrible', 'disappointing', 'disaster', 'failure', 'worst', 'pathetic', 'useless'],
            'football': ['miss', 'defeat', 'loss', 'injury', 'injured', 'mistake', 'error', 'penalty', 'red card', 'banned', 'suspended', 'crisis', 'struggle', 'pressure', 'criticism', 'controversy']
        }
        
        self.neutral_words = {
            'football': ['match', 'game', 'play', 'player', 'team', 'club', 'manager', 'coach', 'training', 'transfer', 'contract', 'season', 'league', 'tournament']
        }
    
    def analyze_sentiment(self, text: str, article: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze sentiment of article content"""
        if not text:
            return {
                'overall_sentiment': 'neutral',
                'confidence': 0.0,
                'scores': {'positive': 0.0, 'negative': 0.0, 'neutral': 1.0}
            }
        
        text_lower = text.lower()
        words = re.findall(r'\b\w+\b', text_lower)
        
        positive_score = 0
        negative_score = 0
        neutral_score = 0
        
        # Count sentiment words
        for word in words:
            # Positive words
            if word in self.positive_words['general']:
                positive_score += 1
            elif word in self.positive_words['football']:
                positive_score += 1.5  # Football-specific words weighted higher
            
            # Negative words
            elif word in self.negative_words['general']:
                negative_score += 1
            elif word in self.negative_words['football']:
                negative_score += 1.5
            
            # Neutral words
            elif word in self.neutral_words['football']:
                neutral_score += 0.5
        
        # Normalize scores
        total_score = positive_score + negative_score + neutral_score
        if total_score == 0:
            total_score = 1
        
        scores = {
            'positive': positive_score / total_score,
            'negative': negative_score / total_score,
            'neutral': neutral_score / total_score
        }
        
        # Determine overall sentiment
        if positive_score > negative_score * 1.2:
            overall_sentiment = 'positive'
            confidence = min(positive_score / (positive_score + negative_score + 1), 0.9)
        elif negative_score > positive_score * 1.2:
            overall_sentiment = 'negative'
            confidence = min(negative_score / (positive_score + negative_score + 1), 0.9)
        else:
            overall_sentiment = 'neutral'
            confidence = 0.5
        
        # Context-based adjustments
        context_sentiment = self._analyze_context_sentiment(article, text_lower)
        
        return {
            'overall_sentiment': overall_sentiment,
            'confidence': confidence,
            'scores': scores,
            'context_sentiment': context_sentiment,
            'word_counts': {
                'positive': positive_score,
                'negative': negative_score,
                'neutral': neutral_score
            }
        }
    
    def _analyze_context_sentiment(self, article: Dict[str, Any], text: str) -> Dict[str, Any]:
        """Analyze sentiment based on context"""
        context = {}
        
        # Source-based sentiment
        source = article.get('source', '').lower()
        if 'reddit' in source:
            # Reddit comments tend to be more emotional
            context['source_bias'] = 'emotional'
        elif any(official in source for official in ['official', 'club']):
            context['source_bias'] = 'positive'
        else:
            context['source_bias'] = 'neutral'
        
        # Content type sentiment
        title = article.get('title', '').lower()
        if any(word in title for word in ['breaking', 'urgent', 'crisis']):
            context['urgency_sentiment'] = 'negative'
        elif any(word in title for word in ['celebration', 'victory', 'win']):
            context['urgency_sentiment'] = 'positive'
        else:
            context['urgency_sentiment'] = 'neutral'
        
        # Team-specific sentiment (if teams are mentioned)
        teams = article.get('tags', [])
        if teams:
            team_sentiment = {}
            for team in teams:
                if team.lower() in text:
                    # Simple team-specific sentiment
                    team_context = text[max(0, text.find(team.lower()) - 50):text.find(team.lower()) + 50]
                    if any(word in team_context for word in ['win', 'goal', 'victory']):
                        team_sentiment[team] = 'positive'
                    elif any(word in team_context for word in ['loss', 'defeat', 'injury']):
                        team_sentiment[team] = 'negative'
                    else:
                        team_sentiment[team] = 'neutral'
            
            context['team_sentiment'] = team_sentiment
        
        return context


class ContentEnhancer:
    """Content enhancement and standardization"""
    
    def enhance_content(self, article: Dict[str, Any], text_content: str) -> Dict[str, Any]:
        """Enhance article content with additional metadata"""
        enhancements = {}
        
        # Text statistics
        enhancements['text_stats'] = self._calculate_text_stats(text_content)
        
        # Content quality indicators
        enhancements['quality_indicators'] = self._assess_content_quality(article, text_content)
        
        # Enhanced tags
        enhancements['enhanced_tags'] = self._enhance_tags(article, text_content)
        
        # Reading time estimation
        enhancements['reading_time'] = self._estimate_reading_time(text_content)
        
        # Content summary
        enhancements['auto_summary'] = self._create_auto_summary(text_content)
        
        return enhancements
    
    def _calculate_text_stats(self, text: str) -> Dict[str, int]:
        """Calculate text statistics"""
        words = text.split()
        sentences = re.split(r'[.!?]+', text)
        paragraphs = text.split('\n\n')
        
        return {
            'character_count': len(text),
            'word_count': len(words),
            'sentence_count': len([s for s in sentences if s.strip()]),
            'paragraph_count': len([p for p in paragraphs if p.strip()]),
            'avg_words_per_sentence': len(words) / max(len(sentences), 1)
        }
    
    def _assess_content_quality(self, article: Dict[str, Any], text: str) -> Dict[str, Any]:
        """Assess content quality indicators"""
        quality_indicators = {}
        
        # Length indicators
        word_count = len(text.split())
        quality_indicators['length_score'] = min(word_count / 300, 1.0)  # Optimal around 300 words
        
        # Structure indicators
        has_quotes = '"' in text or "'" in text
        has_numbers = bool(re.search(r'\d+', text))
        has_proper_nouns = bool(re.search(r'\b[A-Z][a-z]+\b', text))
        
        quality_indicators['structure_score'] = sum([has_quotes, has_numbers, has_proper_nouns]) / 3
        
        # Source credibility
        source_score = article.get('quality_score', 0.5)
        quality_indicators['source_credibility'] = source_score
        
        # Recency score
        published_at = article.get('published_at')
        if published_at:
            age_hours = (datetime.utcnow() - published_at).total_seconds() / 3600
            recency_score = max(0, 1 - (age_hours / 24))  # Decays over 24 hours
            quality_indicators['recency_score'] = recency_score
        
        # Overall quality score
        overall_score = (
            quality_indicators['length_score'] * 0.3 +
            quality_indicators['structure_score'] * 0.3 +
            quality_indicators['source_credibility'] * 0.4
        )
        quality_indicators['overall_quality'] = overall_score
        
        return quality_indicators
    
    def _enhance_tags(self, article: Dict[str, Any], text: str) -> List[str]:
        """Enhance article tags with automatic detection"""
        existing_tags = set(article.get('tags', []))
        enhanced_tags = existing_tags.copy()
        
        text_lower = text.lower()
        
        # Add competition tags
        competitions = ['premier league', 'champions league', 'europa league', 'fa cup', 'world cup', 'euro']
        for comp in competitions:
            if comp in text_lower:
                enhanced_tags.add(comp.replace(' ', '_'))
        
        # Add position tags
        positions = ['goalkeeper', 'defender', 'midfielder', 'striker', 'winger', 'captain']
        for pos in positions:
            if pos in text_lower:
                enhanced_tags.add(pos)
        
        # Add event tags
        events = ['goal', 'assist', 'penalty', 'red card', 'yellow card', 'substitution']
        for event in events:
            if event in text_lower:
                enhanced_tags.add(event.replace(' ', '_'))
        
        return list(enhanced_tags)
    
    def _estimate_reading_time(self, text: str) -> int:
        """Estimate reading time in minutes"""
        word_count = len(text.split())
        # Average reading speed: 200-250 words per minute
        reading_time = max(1, round(word_count / 225))
        return reading_time
    
    def _create_auto_summary(self, text: str) -> str:
        """Create automatic summary of the content"""
        if not text or len(text) < 100:
            return text
        
        # Simple extractive summarization
        sentences = re.split(r'[.!?]+', text)
        sentences = [s.strip() for s in sentences if s.strip() and len(s.strip()) > 20]
        
        if not sentences:
            return text[:200] + '...'
        
        # Take first sentence and one from the middle
        summary_sentences = [sentences[0]]
        if len(sentences) > 2:
            middle_idx = len(sentences) // 2
            summary_sentences.append(sentences[middle_idx])
        
        summary = '. '.join(summary_sentences)
        
        # Ensure summary is not too long
        if len(summary) > 300:
            summary = summary[:297] + '...'
        
        return summary


class KeywordExtractor:
    """Extract keywords and entities from content"""
    
    def __init__(self):
        # Football-specific keywords
        self.football_keywords = {
            'positions': ['goalkeeper', 'defender', 'midfielder', 'striker', 'winger', 'fullback', 'centreback'],
            'actions': ['goal', 'assist', 'pass', 'shot', 'save', 'tackle', 'dribble', 'cross', 'header'],
            'events': ['penalty', 'free kick', 'corner', 'offside', 'foul', 'booking', 'substitution'],
            'results': ['win', 'loss', 'draw', 'victory', 'defeat', 'champion', 'relegated', 'promoted']
        }
        
        # Stop words to exclude
        self.stop_words = set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them'])
    
    def extract_keywords(self, text: str, article: Dict[str, Any]) -> Dict[str, Any]:
        """Extract keywords from article content"""
        if not text:
            return {'keywords': [], 'entities': [], 'football_terms': []}
        
        # Clean text
        text_lower = text.lower()
        words = re.findall(r'\b\w+\b', text_lower)
        
        # Count word frequencies
        word_counts = Counter(words)
        
        # Remove stop words
        filtered_words = {word: count for word, count in word_counts.items() 
                         if word not in self.stop_words and len(word) > 2}
        
        # Get top keywords
        keywords = [word for word, count in 
                   Counter(filtered_words).most_common(20)]
        
        # Extract football-specific terms
        football_terms = []
        for category, terms in self.football_keywords.items():
            for term in terms:
                if term in text_lower:
                    football_terms.append({
                        'term': term,
                        'category': category,
                        'frequency': text_lower.count(term)
                    })
        
        # Extract entities (simple approach)
        entities = self._extract_entities(text)
        
        return {
            'keywords': keywords,
            'entities': entities,
            'football_terms': football_terms,
            'keyword_density': len(keywords) / len(words) if words else 0
        }
    
    def _extract_entities(self, text: str) -> List[Dict[str, Any]]:
        """Extract named entities from text"""
        entities = []
        
        # Simple pattern-based entity extraction
        patterns = {
            'person': r'\b[A-Z][a-z]+ [A-Z][a-z]+\b',
            'team': r'\b[A-Z][a-z]+ (FC|United|City|Arsenal|Chelsea|Liverpool|Tottenham|Madrid|Barcelona|Bayern|Milan|Juventus)\b',
            'competition': r'\b(Premier League|Champions League|Europa League|World Cup|FA Cup|League Cup)\b',
            'venue': r'\b(Stadium|Arena|Ground|Park)\b'
        }
        
        for entity_type, pattern in patterns.items():
            matches = re.finditer(pattern, text)
            for match in matches:
                entities.append({
                    'text': match.group(),
                    'type': entity_type,
                    'start': match.start(),
                    'end': match.end()
                })
        
        return entities