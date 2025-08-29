"""
Pydantic models for API requests and responses
"""

from pydantic import BaseModel, Field, validator
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional, Union
from enum import Enum

class Priority(str, Enum):
    LOW = "low"
    NORMAL = "normal"
    HIGH = "high"
    URGENT = "urgent"

class SourceType(str, Enum):
    RSS = "rss"
    REDDIT = "reddit"
    API = "api"
    SCRAPE = "scrape"
    TWITTER = "twitter"

class ContentType(str, Enum):
    GENERAL = "general"
    MATCH_THREAD = "match_thread"
    MATCH_PREVIEW = "match_preview"
    MATCH_REPORT = "match_report"
    INJURY_NEWS = "injury_news"
    TRANSFER_NEWS = "transfer_news"
    BREAKING_NEWS = "breaking_news"
    INTERVIEW = "interview"
    ANALYSIS = "analysis"

class SentimentType(str, Enum):
    POSITIVE = "positive"
    NEGATIVE = "negative"
    NEUTRAL = "neutral"

# Request Models
class MatchRequest(BaseModel):
    home_team: str = Field(..., description="Home team name")
    away_team: str = Field(..., description="Away team name")
    match_date: datetime = Field(..., description="Match date and time")
    priority: Priority = Field(default=Priority.NORMAL, description="Aggregation priority")
    league: Optional[str] = Field(None, description="League or competition name")
    
    @validator('match_date')
    def validate_match_date(cls, v):
        # Allow past dates for historical matches
        if v > datetime.utcnow() + timedelta(days=30):
            raise ValueError('Match date cannot be more than 30 days in the future')
        return v

class SearchRequest(BaseModel):
    query: str = Field(..., min_length=1, max_length=200, description="Search query")
    match_id: Optional[str] = Field(None, description="Filter by match ID")
    source_type: Optional[SourceType] = Field(None, description="Filter by source type")
    content_type: Optional[ContentType] = Field(None, description="Filter by content type")
    language: Optional[str] = Field(None, description="Filter by language code")
    date_from: Optional[datetime] = Field(None, description="Start date filter")
    date_to: Optional[datetime] = Field(None, description="End date filter")
    min_quality: Optional[float] = Field(0.0, ge=0.0, le=1.0, description="Minimum quality score")
    limit: int = Field(50, ge=1, le=200, description="Maximum results")

# Response Models
class ArticleModel(BaseModel):
    title: str
    summary: Optional[str] = None
    content: Optional[str] = None
    link: str
    author: Optional[str] = None
    published_at: datetime
    source: str
    source_type: SourceType
    relevance_score: float
    quality_score: float
    language: str = "en"
    tags: List[str] = []
    
    # Enhanced fields from processing
    sentiment_info: Optional[Dict[str, Any]] = None
    content_classification: Optional[Dict[str, Any]] = None
    keywords: Optional[List[str]] = None
    reading_time: Optional[int] = None
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class PaginationModel(BaseModel):
    offset: int
    limit: int
    total: int
    has_more: bool

class ContextModel(BaseModel):
    match_id: str
    teams: List[str]
    total_articles: int
    source_breakdown: Dict[str, int]
    sentiment_overview: Dict[str, float]
    key_narratives: List[str]
    trending_topics: List[str]
    last_updated: datetime
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class NewsResponse(BaseModel):
    match_id: str
    article_count: int
    total_articles: int
    articles: List[ArticleModel]
    context: Optional[ContextModel] = None
    pagination: PaginationModel
    generated_at: datetime
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class InsightModel(BaseModel):
    insight_type: str
    title: str
    description: str
    confidence: float
    supporting_articles: List[str]  # Article IDs
    timestamp: datetime
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class InsightsResponse(BaseModel):
    match_id: str
    insights: List[InsightModel]
    data_sources: Dict[str, int]
    last_updated: datetime
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class SourceBreakdownModel(BaseModel):
    source: str
    source_type: SourceType
    count: int
    avg_quality: float
    latest_article: Optional[datetime] = None
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class SourcesResponse(BaseModel):
    match_id: str
    source_breakdown: List[SourceBreakdownModel]
    total_sources: int
    total_articles: int
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class TimelineEntry(BaseModel):
    timestamp: datetime
    article_count: int
    avg_quality: float
    content_types: Dict[str, int]
    top_articles: List[Dict[str, Any]]
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class TimelineResponse(BaseModel):
    match_id: str
    timeline: List[TimelineEntry]
    total_periods: int
    total_articles: int
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class SentimentScore(BaseModel):
    positive: float
    negative: float
    neutral: float
    overall: SentimentType
    confidence: float

class TeamSentimentModel(BaseModel):
    team: str
    sentiment: SentimentScore
    article_count: int
    key_phrases: List[str]

class SentimentResponse(BaseModel):
    match_id: str
    overall_sentiment: SentimentScore
    team_sentiments: List[TeamSentimentModel]
    source_sentiments: Dict[str, SentimentScore]
    analyzed_articles: int
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class TrendingTopicModel(BaseModel):
    topic: str
    count: int
    trend_score: float
    avg_quality: float
    sources: List[str]
    sample_articles: List[str]

class TrendingResponse(BaseModel):
    trending_topics: List[TrendingTopicModel]
    period_days: int
    generated_at: datetime
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class SearchResponse(BaseModel):
    query: str
    match_id: Optional[str] = None
    results: List[ArticleModel]
    result_count: int
    search_time_ms: Optional[float] = None
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class AggregationStatus(BaseModel):
    status: str
    match_id: str
    teams: str
    progress: float = 0.0
    current_stage: str
    estimated_completion: datetime
    articles_collected: int = 0
    sources_processed: int = 0
    errors: List[str] = []
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

# Health Check Models
class DatabaseHealth(BaseModel):
    status: str
    connected: bool
    response_time_ms: Optional[float] = None
    collections: Optional[Dict[str, int]] = None
    storage_used_mb: Optional[float] = None
    storage_percentage: Optional[float] = None

class AggregatorHealth(BaseModel):
    status: str
    active_tasks: int
    completed_tasks: int
    failed_tasks: int
    queue_size: int
    sources_healthy: Dict[str, bool]
    last_successful_run: Optional[datetime] = None
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class StorageStats(BaseModel):
    articles_count: int
    matches_count: int
    contexts_count: int
    storage_used_bytes: int
    storage_limit_bytes: int
    storage_percentage: float
    cleanup_stats: Optional[Dict[str, Any]] = None

class HealthCheck(BaseModel):
    status: str
    timestamp: datetime
    database: Optional[DatabaseHealth] = None
    aggregator: Optional[AggregatorHealth] = None
    storage: Optional[StorageStats] = None
    uptime_seconds: Optional[float] = None
    error: Optional[str] = None
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

# Statistics Models
class SourceStatsModel(BaseModel):
    source_name: str
    articles_collected: int
    avg_quality: float
    success_rate: float
    errors: int
    last_successful_collection: Optional[datetime] = None
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class AggregatorStatsModel(BaseModel):
    total_aggregations: int
    successful_aggregations: int
    failed_aggregations: int
    avg_aggregation_time: float
    avg_articles_per_match: float
    most_active_sources: List[SourceStatsModel]
    recent_errors: List[str]

class SystemStatsResponse(BaseModel):
    storage: StorageStats
    sources: List[SourceStatsModel]
    aggregator: AggregatorStatsModel
    generated_at: datetime
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

# WebSocket Message Models
class WebSocketMessage(BaseModel):
    type: str
    match_id: str
    timestamp: datetime
    data: Dict[str, Any]
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class InitialDataMessage(WebSocketMessage):
    type: str = "initial_data"
    articles: List[ArticleModel]

class UpdateMessage(WebSocketMessage):
    type: str = "update"
    new_articles: List[ArticleModel]
    updated_context: Optional[ContextModel] = None

class AggregationCompleteMessage(WebSocketMessage):
    type: str = "aggregation_complete"
    result: Dict[str, Any]

class ErrorMessage(WebSocketMessage):
    type: str = "error"
    error: str
    error_code: Optional[str] = None

# Configuration Models
class APIConfig(BaseModel):
    base_path: str
    max_articles_per_request: int = 200
    default_articles_limit: int = 50
    websocket_update_interval: int = 30
    cache_ttl_seconds: int = 300
    rate_limit_per_minute: int = 60

class CollectorConfig(BaseModel):
    enabled: bool = True
    max_articles: int = 100
    timeout_seconds: int = 30
    rate_limit_per_minute: int = 60
    quality_threshold: float = 0.3

class RSSConfig(CollectorConfig):
    sources: List[str] = []
    update_interval_minutes: int = 15

class RedditConfig(CollectorConfig):
    client_id: str
    client_secret: str
    subreddits: List[str] = []

class APISourceConfig(CollectorConfig):
    api_key: str
    base_url: str
    daily_limit: int = 1000