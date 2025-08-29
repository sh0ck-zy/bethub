"""
Advanced Sentiment Analysis for Football Content
Analyzes sentiment across multiple dimensions including team-specific, temporal, and contextual sentiment
"""

import logging
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional, Tuple
import re
from collections import defaultdict, Counter
import math

logger = logging.getLogger(__name__)

class FootballSentimentAnalyzer:
    def __init__(self):
        # Football-specific sentiment lexicons
        self.football_positive = {
            'performance': [
                'brilliant', 'outstanding', 'excellent', 'superb', 'amazing', 'incredible',
                'masterclass', 'clinical', 'precise', 'dominant', 'impressive', 'stunning'
            ],
            'results': [
                'victory', 'win', 'triumph', 'success', 'champion', 'winner', 'celebration',
                'qualify', 'advance', 'progress', 'achievement', 'glory', 'historic'
            ],
            'players': [
                'hero', 'legend', 'star', 'talent', 'genius', 'skillful', 'magical',
                'world-class', 'phenomenal', 'exceptional', 'gifted', 'composed'
            ],
            'team': [
                'united', 'solid', 'strong', 'powerful', 'confident', 'determined',
                'resilient', 'organized', 'disciplined', 'motivated', 'focused'
            ]
        }
        
        self.football_negative = {
            'performance': [
                'terrible', 'awful', 'horrible', 'disastrous', 'pathetic', 'embarrassing',
                'shocking', 'disappointing', 'poor', 'weak', 'sluggish', 'sloppy'
            ],
            'results': [
                'defeat', 'loss', 'failure', 'eliminated', 'knocked out', 'relegated',
                'disaster', 'collapse', 'humiliation', 'crushing', 'devastating'
            ],
            'players': [
                'mistake', 'error', 'miss', 'injured', 'suspended', 'banned',
                'criticized', 'disappointing', 'struggling', 'out of form'
            ],
            'team': [
                'crisis', 'chaos', 'pressure', 'tension', 'divided', 'unstable',
                'struggling', 'declining', 'falling apart', 'dysfunctional'
            ]
        }
        
        self.football_neutral = {
            'general': [
                'match', 'game', 'fixture', 'squad', 'team', 'player', 'manager',
                'coach', 'training', 'preparation', 'tactics', 'formation', 'strategy'
            ],
            'events': [
                'goal', 'assist', 'pass', 'shot', 'save', 'tackle', 'substitution',
                'corner', 'free kick', 'penalty', 'offside', 'yellow card'
            ]
        }
        
        # Emotional intensity modifiers
        self.intensity_modifiers = {
            'high': ['very', 'extremely', 'incredibly', 'absolutely', 'completely', 'totally'],
            'medium': ['quite', 'rather', 'fairly', 'pretty', 'somewhat'],
            'low': ['slightly', 'mildly', 'a bit', 'a little', 'kind of']
        }
        
        # Negation words
        self.negation_words = [
            'not', 'no', 'never', 'none', 'nobody', 'nothing', 'neither', 'nor',
            'barely', 'hardly', 'scarcely', "n't", 'without', 'lack', 'deny'
        ]
        
        # Context-specific sentiment adjustments
        self.context_adjustments = {
            'injury_context': -0.3,      # Injuries are generally negative
            'transfer_context': 0.1,     # Transfers can be positive (new opportunities)
            'match_preview': 0.0,        # Neutral anticipation
            'match_report': 0.0,         # Depends on result
            'breaking_news': 0.1,        # Breaking news often positive (exclusives)
            'official_statement': 0.1,   # Official sources more neutral/positive
            'rumor': -0.2,              # Rumors often negative speculation
            'controversy': -0.4,         # Controversies are negative
            'celebration': 0.5           # Celebrations are very positive
        }
    
    def analyze_sentiment(self, text: str, article: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Comprehensive sentiment analysis for football content
        """
        if not text:
            return self._empty_sentiment_result()
        
        try:
            # Preprocess text
            processed_text = self._preprocess_text(text)
            
            # Basic sentiment scores
            basic_sentiment = self._calculate_basic_sentiment(processed_text)
            
            # Football-specific sentiment
            football_sentiment = self._calculate_football_sentiment(processed_text)
            
            # Contextual adjustments
            context_adjustment = self._calculate_context_adjustment(processed_text, article)
            
            # Temporal sentiment (if match date available)
            temporal_sentiment = self._calculate_temporal_sentiment(processed_text, article)
            
            # Combine all sentiment scores
            combined_sentiment = self._combine_sentiment_scores(
                basic_sentiment, football_sentiment, context_adjustment, temporal_sentiment
            )
            
            # Entity-specific sentiment
            entity_sentiment = self._analyze_entity_sentiment(processed_text, article)
            
            # Emotional analysis
            emotional_analysis = self._analyze_emotions(processed_text)
            
            # Confidence calculation
            confidence = self._calculate_confidence(processed_text, combined_sentiment)
            
            result = {
                'overall_sentiment': self._determine_overall_sentiment(combined_sentiment),
                'sentiment_scores': combined_sentiment,
                'confidence': confidence,
                'entity_sentiment': entity_sentiment,
                'emotional_analysis': emotional_analysis,
                'sentiment_breakdown': {
                    'basic_sentiment': basic_sentiment,
                    'football_sentiment': football_sentiment,
                    'context_adjustment': context_adjustment,
                    'temporal_sentiment': temporal_sentiment
                },
                'analysis_metadata': {
                    'text_length': len(text),
                    'processed_length': len(processed_text),
                    'analysis_timestamp': datetime.utcnow(),
                    'method': 'football_specific_lexicon'
                }
            }
            
            return result
            
        except Exception as e:
            logger.error(f"Sentiment analysis failed: {e}")
            return self._empty_sentiment_result()
    
    def _preprocess_text(self, text: str) -> str:
        """Preprocess text for sentiment analysis"""
        # Convert to lowercase
        text = text.lower()
        
        # Remove URLs
        text = re.sub(r'http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+', '', text)
        
        # Remove extra whitespace
        text = ' '.join(text.split())
        
        return text
    
    def _calculate_basic_sentiment(self, text: str) -> Dict[str, float]:
        """Calculate basic positive/negative sentiment"""
        words = text.split()
        scores = {'positive': 0, 'negative': 0, 'neutral': 0}
        
        # Count sentiment words
        for word in words:
            # Check all football sentiment categories
            found_sentiment = False
            
            # Positive sentiment
            for category, word_list in self.football_positive.items():
                if word in word_list:
                    scores['positive'] += 1
                    found_sentiment = True
                    break
            
            if not found_sentiment:
                # Negative sentiment
                for category, word_list in self.football_negative.items():
                    if word in word_list:
                        scores['negative'] += 1
                        found_sentiment = True
                        break
            
            if not found_sentiment:
                # Neutral sentiment
                for category, word_list in self.football_neutral.items():
                    if word in word_list:
                        scores['neutral'] += 1
                        break
        
        # Handle negations
        scores = self._apply_negation_rules(text, scores)
        
        # Normalize scores
        total = sum(scores.values())
        if total > 0:
            return {k: v / total for k, v in scores.items()}
        else:
            return {'positive': 0.33, 'negative': 0.33, 'neutral': 0.34}
    
    def _calculate_football_sentiment(self, text: str) -> Dict[str, float]:
        """Calculate football-specific sentiment patterns"""
        scores = {'positive': 0, 'negative': 0, 'neutral': 0}
        
        # Football-specific patterns
        patterns = {
            'positive': [
                r'scored? \d+ goals?', r'won \d+-\d+', r'clean sheet', r'hat[- ]?trick',
                r'man of the match', r'player of the year', r'top scorer',
                r'unbeaten', r'perfect record', r'champions?', r'qualified'
            ],
            'negative': [
                r'lost \d+-\d+', r'defeated \d+-\d+', r'red card', r'sent off',
                r'injured', r'out for \d+', r'banned', r'suspended',
                r'relegated', r'eliminated', r'knocked out', r'crisis'
            ],
            'neutral': [
                r'kick[- ]?off', r'half[- ]?time', r'full[- ]?time', r'extra time',
                r'penalty shoot[- ]?out', r'transfer window', r'press conference'
            ]
        }
        
        for sentiment, pattern_list in patterns.items():
            for pattern in pattern_list:
                matches = len(re.findall(pattern, text, re.IGNORECASE))
                scores[sentiment] += matches * 2  # Weight patterns higher
        
        # Normalize
        total = sum(scores.values())
        if total > 0:
            return {k: v / total for k, v in scores.items()}
        else:
            return {'positive': 0.33, 'negative': 0.33, 'neutral': 0.34}
    
    def _calculate_context_adjustment(self, text: str, article: Dict[str, Any]) -> float:
        """Calculate sentiment adjustment based on context"""
        adjustment = 0.0
        
        if not article:
            return adjustment
        
        # Content type adjustments
        content_type = article.get('content_classification', {}).get('content_type', 'general')
        adjustment += self.context_adjustments.get(content_type, 0)
        
        # Source type adjustments
        source_type = article.get('source_type', '')
        if source_type == 'reddit':
            adjustment -= 0.1  # Reddit tends to be more emotional/negative
        elif 'official' in article.get('source', '').lower():
            adjustment += 0.1  # Official sources more balanced
        
        # Tags-based adjustments
        tags = article.get('tags', [])
        for tag in tags:
            if tag in self.context_adjustments:
                adjustment += self.context_adjustments[tag]
        
        # Title sentiment influence
        title = article.get('title', '')
        if title:
            title_sentiment = self._calculate_basic_sentiment(title.lower())
            title_polarity = title_sentiment['positive'] - title_sentiment['negative']
            adjustment += title_polarity * 0.2  # Title has 20% influence
        
        return max(-0.5, min(0.5, adjustment))  # Clamp adjustment
    
    def _calculate_temporal_sentiment(self, text: str, article: Dict[str, Any]) -> Dict[str, float]:
        """Calculate sentiment changes over time"""
        if not article:
            return {'positive': 0, 'negative': 0, 'neutral': 0}
        
        pub_date = article.get('published_at')
        if not pub_date:
            return {'positive': 0, 'negative': 0, 'neutral': 0}
        
        if isinstance(pub_date, str):
            try:
                pub_date = datetime.fromisoformat(pub_date.replace('Z', '+00:00'))
            except:
                return {'positive': 0, 'negative': 0, 'neutral': 0}
        
        # Time-based sentiment patterns
        age_hours = (datetime.utcnow() - pub_date).total_seconds() / 3600
        
        # Immediate reactions tend to be more emotional
        if age_hours <= 2:
            emotional_multiplier = 1.2
        elif age_hours <= 24:
            emotional_multiplier = 1.0
        else:
            emotional_multiplier = 0.8  # Older content more measured
        
        # Temporal keywords
        temporal_positive = ['breaking', 'just in', 'confirmed', 'official', 'announced']
        temporal_negative = ['developing', 'unconfirmed', 'rumors', 'speculation']
        
        positive_count = sum(1 for word in temporal_positive if word in text)
        negative_count = sum(1 for word in temporal_negative if word in text)
        
        scores = {
            'positive': positive_count * emotional_multiplier,
            'negative': negative_count * emotional_multiplier,
            'neutral': 1.0
        }
        
        # Normalize
        total = sum(scores.values())
        if total > 0:
            return {k: v / total for k, v in scores.items()}
        else:
            return {'positive': 0.33, 'negative': 0.33, 'neutral': 0.34}
    
    def _analyze_entity_sentiment(self, text: str, article: Dict[str, Any]) -> Dict[str, Dict[str, float]]:
        """Analyze sentiment toward specific entities (teams, players, etc.)"""
        entity_sentiment = {}
        
        if not article:
            return entity_sentiment
        
        # Extract team names from tags or content
        teams = []
        tags = article.get('tags', [])
        for tag in tags:
            if tag not in ['official', 'news', 'breaking', 'match', 'football']:
                teams.append(tag.replace('_', ' ').title())
        
        # Analyze sentiment for each team
        for team in teams:
            team_sentiment = self._analyze_entity_sentiment_in_text(text, team)
            if team_sentiment:
                entity_sentiment[team] = team_sentiment
        
        # Look for player names (simple pattern matching)
        player_pattern = r'\b[A-Z][a-z]+ [A-Z][a-z]+\b'
        potential_players = re.findall(player_pattern, text)
        
        for player in potential_players[:5]:  # Limit to 5 to avoid noise
            player_sentiment = self._analyze_entity_sentiment_in_text(text, player)
            if player_sentiment:
                entity_sentiment[player] = player_sentiment
        
        return entity_sentiment
    
    def _analyze_entity_sentiment_in_text(self, text: str, entity: str) -> Optional[Dict[str, float]]:
        """Analyze sentiment toward a specific entity in text"""
        entity_lower = entity.lower()
        
        # Find sentences mentioning the entity
        sentences = re.split(r'[.!?]+', text)
        relevant_sentences = [s for s in sentences if entity_lower in s.lower()]
        
        if not relevant_sentences:
            return None
        
        # Analyze sentiment in relevant sentences
        entity_text = ' '.join(relevant_sentences)
        sentiment = self._calculate_basic_sentiment(entity_text)
        
        # Boost confidence if entity is mentioned multiple times
        mention_count = text.lower().count(entity_lower)
        confidence = min(mention_count * 0.1 + 0.5, 1.0)
        
        sentiment['confidence'] = confidence
        sentiment['mention_count'] = mention_count
        
        return sentiment
    
    def _analyze_emotions(self, text: str) -> Dict[str, float]:
        """Analyze emotional content beyond basic sentiment"""
        emotions = {
            'excitement': 0, 'disappointment': 0, 'anger': 0, 'fear': 0,
            'joy': 0, 'surprise': 0, 'anticipation': 0, 'sadness': 0
        }
        
        emotion_keywords = {
            'excitement': ['excited', 'thrilled', 'buzzing', 'pumped', 'electric', 'amazing'],
            'disappointment': ['disappointed', 'let down', 'frustrated', 'gutted', 'devastated'],
            'anger': ['angry', 'furious', 'outraged', 'livid', 'disgusted', 'appalled'],
            'fear': ['worried', 'concerned', 'nervous', 'anxious', 'scared', 'fearful'],
            'joy': ['happy', 'delighted', 'ecstatic', 'overjoyed', 'jubilant', 'elated'],
            'surprise': ['surprised', 'shocked', 'stunned', 'amazed', 'astonished'],
            'anticipation': ['excited', 'eager', 'looking forward', 'can\'t wait', 'expecting'],
            'sadness': ['sad', 'upset', 'heartbroken', 'depressed', 'down', 'miserable']
        }
        
        words = text.split()
        total_emotional_words = 0
        
        for emotion, keywords in emotion_keywords.items():
            count = sum(1 for word in words if any(keyword in word for keyword in keywords))
            emotions[emotion] = count
            total_emotional_words += count
        
        # Normalize
        if total_emotional_words > 0:
            emotions = {k: v / total_emotional_words for k, v in emotions.items()}
        
        return emotions
    
    def _apply_negation_rules(self, text: str, scores: Dict[str, float]) -> Dict[str, float]:
        """Apply negation rules to sentiment scores"""
        words = text.split()
        negated_indices = set()
        
        # Find negation words and mark next 3 words as negated
        for i, word in enumerate(words):
            if word in self.negation_words:
                for j in range(i + 1, min(i + 4, len(words))):
                    negated_indices.add(j)
        
        # Adjust scores based on negation
        if negated_indices:
            negation_factor = len(negated_indices) / len(words)
            
            # Swap positive and negative scores proportionally
            pos_adjustment = scores['positive'] * negation_factor
            neg_adjustment = scores['negative'] * negation_factor
            
            scores['positive'] -= pos_adjustment
            scores['negative'] -= neg_adjustment
            scores['positive'] += neg_adjustment
            scores['negative'] += pos_adjustment
        
        return scores
    
    def _combine_sentiment_scores(self, basic: Dict, football: Dict, context: float, temporal: Dict) -> Dict[str, float]:
        """Combine multiple sentiment score sources"""
        weights = {
            'basic': 0.4,
            'football': 0.4,
            'temporal': 0.2
        }
        
        combined = {
            'positive': (basic['positive'] * weights['basic'] + 
                        football['positive'] * weights['football'] + 
                        temporal['positive'] * weights['temporal']),
            'negative': (basic['negative'] * weights['basic'] + 
                        football['negative'] * weights['football'] + 
                        temporal['negative'] * weights['temporal']),
            'neutral': (basic['neutral'] * weights['basic'] + 
                       football['neutral'] * weights['football'] + 
                       temporal['neutral'] * weights['temporal'])
        }
        
        # Apply context adjustment
        if context > 0:  # Positive context
            combined['positive'] += abs(context)
            combined['negative'] = max(0, combined['negative'] - abs(context) / 2)
        elif context < 0:  # Negative context
            combined['negative'] += abs(context)
            combined['positive'] = max(0, combined['positive'] - abs(context) / 2)
        
        # Normalize to ensure sum equals 1
        total = sum(combined.values())
        if total > 0:
            combined = {k: v / total for k, v in combined.items()}
        
        return combined
    
    def _determine_overall_sentiment(self, scores: Dict[str, float]) -> str:
        """Determine overall sentiment classification"""
        if scores['positive'] > scores['negative'] * 1.2:
            return 'positive'
        elif scores['negative'] > scores['positive'] * 1.2:
            return 'negative'
        else:
            return 'neutral'
    
    def _calculate_confidence(self, text: str, sentiment_scores: Dict[str, float]) -> float:
        """Calculate confidence in sentiment analysis"""
        # Base confidence on text length
        word_count = len(text.split())
        length_confidence = min(word_count / 100, 1.0)  # Max confidence at 100+ words
        
        # Confidence based on sentiment strength
        max_sentiment = max(sentiment_scores.values())
        sentiment_confidence = max_sentiment
        
        # Confidence based on emotional words density
        emotional_words = sum(1 for word in text.split() 
                            if any(word in word_list 
                                  for category in self.football_positive.values() 
                                  for word_list in [category] 
                                  if isinstance(category, list)))
        emotional_density = min(emotional_words / len(text.split()), 0.3)
        
        # Combined confidence
        confidence = (length_confidence * 0.4 + 
                     sentiment_confidence * 0.4 + 
                     emotional_density * 0.2)
        
        return min(confidence, 1.0)
    
    def _empty_sentiment_result(self) -> Dict[str, Any]:
        """Return empty sentiment result for error cases"""
        return {
            'overall_sentiment': 'neutral',
            'sentiment_scores': {'positive': 0.33, 'negative': 0.33, 'neutral': 0.34},
            'confidence': 0.0,
            'entity_sentiment': {},
            'emotional_analysis': {},
            'sentiment_breakdown': {},
            'analysis_metadata': {
                'text_length': 0,
                'analysis_timestamp': datetime.utcnow(),
                'method': 'error_fallback'
            }
        }
    
    def analyze_article_sentiment(self, article: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze sentiment for a complete article"""
        # Combine title, summary, and content
        text_parts = []
        
        if article.get('title'):
            text_parts.append(article['title'])
        
        if article.get('summary'):
            text_parts.append(article['summary'])
        
        if article.get('content'):
            text_parts.append(article['content'])
        
        # Add Reddit comments if available
        reddit_data = article.get('reddit_data', {})
        if reddit_data.get('top_comments'):
            for comment in reddit_data['top_comments'][:3]:  # Top 3 comments
                if comment.get('body'):
                    text_parts.append(comment['body'])
        
        full_text = ' '.join(text_parts)
        
        # Analyze sentiment
        sentiment_result = self.analyze_sentiment(full_text, article)
        
        # Add article-specific metadata
        sentiment_result['article_metadata'] = {
            'article_id': article.get('hash', 'unknown'),
            'source': article.get('source', 'unknown'),
            'source_type': article.get('source_type', 'unknown'),
            'published_at': article.get('published_at'),
            'content_type': article.get('content_classification', {}).get('content_type', 'general')
        }
        
        return sentiment_result
    
    def batch_analyze_sentiment(self, articles: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Analyze sentiment for multiple articles"""
        analyzed_articles = []
        
        for article in articles:
            try:
                sentiment_analysis = self.analyze_article_sentiment(article)
                article['sentiment_analysis'] = sentiment_analysis
                analyzed_articles.append(article)
            except Exception as e:
                logger.error(f"Failed to analyze sentiment for article {article.get('title', 'unknown')}: {e}")
                article['sentiment_analysis'] = self._empty_sentiment_result()
                analyzed_articles.append(article)
        
        return analyzed_articles
    
    def get_sentiment_summary(self, articles: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Get sentiment summary across multiple articles"""
        if not articles:
            return {}
        
        # Aggregate sentiment scores
        total_positive = 0
        total_negative = 0
        total_neutral = 0
        sentiment_counts = {'positive': 0, 'negative': 0, 'neutral': 0}
        
        for article in articles:
            sentiment_analysis = article.get('sentiment_analysis', {})
            scores = sentiment_analysis.get('sentiment_scores', {})
            overall = sentiment_analysis.get('overall_sentiment', 'neutral')
            
            total_positive += scores.get('positive', 0)
            total_negative += scores.get('negative', 0)
            total_neutral += scores.get('neutral', 0)
            sentiment_counts[overall] += 1
        
        article_count = len(articles)
        
        return {
            'article_count': article_count,
            'average_sentiment': {
                'positive': total_positive / article_count,
                'negative': total_negative / article_count,
                'neutral': total_neutral / article_count
            },
            'sentiment_distribution': {
                'positive': sentiment_counts['positive'],
                'negative': sentiment_counts['negative'],
                'neutral': sentiment_counts['neutral']
            },
            'sentiment_percentages': {
                'positive': (sentiment_counts['positive'] / article_count) * 100,
                'negative': (sentiment_counts['negative'] / article_count) * 100,
                'neutral': (sentiment_counts['neutral'] / article_count) * 100
            },
            'overall_trend': max(sentiment_counts, key=sentiment_counts.get),
            'analysis_timestamp': datetime.utcnow()
        }