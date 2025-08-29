"""
FastAPI Main Application for News Aggregator
RESTful API with WebSocket support for real-time updates
"""

from fastapi import FastAPI, BackgroundTasks, HTTPException, WebSocket, WebSocketDisconnect, Query, Path
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import asyncio
import logging
import json
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

from .aggregator import NewsAggregator
from .models import MatchRequest, NewsResponse, AggregationStatus, HealthCheck
from ..storage.mongodb_storage import MongoDBStorage
from ..config import API_CONFIG

logger = logging.getLogger(__name__)

# Global storage instance
storage = None
aggregator = None
active_connections: Dict[str, List[WebSocket]] = {}

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager"""
    global storage, aggregator
    
    # Startup
    try:
        storage = MongoDBStorage()
        await storage.connect()
        
        aggregator = NewsAggregator(storage)
        await aggregator.initialize()
        
        # Start background tasks
        asyncio.create_task(periodic_cleanup())
        asyncio.create_task(health_monitor())
        
        logger.info("News Aggregator API started successfully")
        yield
        
    except Exception as e:
        logger.error(f"Startup failed: {e}")
        raise
    
    # Shutdown
    if storage:
        await storage.disconnect()
    
    logger.info("News Aggregator API shut down")

app = FastAPI(
    title="Match News Aggregator API",
    description="Free news aggregation system for football matches",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Match News Aggregator API",
        "version": "1.0.0",
        "status": "running",
        "timestamp": datetime.utcnow().isoformat()
    }

@app.post("/api/v1/matches/{match_id}/aggregate")
async def trigger_aggregation(
    match_id: str = Path(..., description="Match ID"),
    request: MatchRequest = ...,
    background_tasks: BackgroundTasks = None
):
    """Trigger news aggregation for a match"""
    try:
        # Validate request
        if not request.home_team or not request.away_team:
            raise HTTPException(status_code=400, detail="Home team and away team are required")
        
        # Start aggregation in background
        background_tasks.add_task(
            aggregate_match_news,
            match_id,
            request.home_team,
            request.away_team,
            request.match_date,
            request.priority
        )
        
        return {
            "status": "aggregation_started",
            "match_id": match_id,
            "teams": f"{request.home_team} vs {request.away_team}",
            "estimated_completion": (datetime.utcnow() + timedelta(minutes=5)).isoformat()
        }
        
    except Exception as e:
        logger.error(f"Aggregation trigger failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/matches/{match_id}/news")
async def get_match_news(
    match_id: str = Path(..., description="Match ID"),
    source_type: Optional[str] = Query(None, description="Filter by source type"),
    min_quality: float = Query(0.0, ge=0.0, le=1.0, description="Minimum quality score"),
    limit: int = Query(50, ge=1, le=200, description="Maximum number of articles"),
    offset: int = Query(0, ge=0, description="Offset for pagination"),
    language: Optional[str] = Query(None, description="Filter by language")
) -> NewsResponse:
    """Get aggregated news for a match"""
    try:
        # Get articles from storage
        articles = await storage.get_articles_for_match(
            match_id=match_id,
            limit=limit + offset,
            source_type=source_type,
            min_quality=min_quality
        )
        
        # Apply language filter if specified
        if language:
            articles = [a for a in articles if a.get('language_info', {}).get('language') == language]
        
        # Apply pagination
        paginated_articles = articles[offset:offset + limit]
        
        # Get match context if available
        context = await storage.get_match_context(match_id)
        
        # Build response
        response = NewsResponse(
            match_id=match_id,
            article_count=len(paginated_articles),
            total_articles=len(articles),
            articles=paginated_articles,
            context=context,
            pagination={
                "offset": offset,
                "limit": limit,
                "total": len(articles),
                "has_more": offset + limit < len(articles)
            },
            generated_at=datetime.utcnow()
        )
        
        return response
        
    except Exception as e:
        logger.error(f"Failed to get match news: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/matches/{match_id}/insights")
async def get_match_insights(match_id: str = Path(..., description="Match ID")):
    """Get AI-generated insights from aggregated news"""
    try:
        # Get match context
        context = await storage.get_match_context(match_id)
        
        if not context:
            raise HTTPException(status_code=404, detail="No data available for this match")
        
        # Get recent articles for additional insights
        articles = await storage.get_articles_for_match(match_id, limit=100)
        
        # Generate insights
        insights = await aggregator.generate_insights(articles, context)
        
        return {
            "match_id": match_id,
            "insights": insights,
            "data_sources": context.get('source_breakdown', {}),
            "last_updated": context.get('last_updated', datetime.utcnow().isoformat())
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get match insights: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/matches/{match_id}/sources")
async def get_match_sources(match_id: str = Path(..., description="Match ID")):
    """Get source breakdown for a match"""
    try:
        articles = await storage.get_articles_for_match(match_id, limit=1000)
        
        if not articles:
            raise HTTPException(status_code=404, detail="No articles found for this match")
        
        # Analyze sources
        source_breakdown = {}
        for article in articles:
            source = article.get('source', 'unknown')
            source_type = article.get('source_type', 'unknown')
            
            if source not in source_breakdown:
                source_breakdown[source] = {
                    'count': 0,
                    'source_type': source_type,
                    'avg_quality': 0.0,
                    'articles': []
                }
            
            source_breakdown[source]['count'] += 1
            source_breakdown[source]['articles'].append({
                'title': article.get('title', ''),
                'published_at': article.get('published_at'),
                'quality_score': article.get('quality_score', 0),
                'relevance_score': article.get('relevance_score', 0)
            })
        
        # Calculate average quality
        for source_data in source_breakdown.values():
            if source_data['count'] > 0:
                source_data['avg_quality'] = sum(
                    a['quality_score'] for a in source_data['articles']
                ) / source_data['count']
        
        return {
            "match_id": match_id,
            "source_breakdown": source_breakdown,
            "total_sources": len(source_breakdown),
            "total_articles": len(articles)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get match sources: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/matches/{match_id}/timeline")
async def get_match_timeline(match_id: str = Path(..., description="Match ID")):
    """Get timeline of news articles for a match"""
    try:
        articles = await storage.get_articles_for_match(match_id, limit=500)
        
        if not articles:
            raise HTTPException(status_code=404, detail="No articles found for this match")
        
        # Sort articles by publication date
        sorted_articles = sorted(articles, key=lambda x: x.get('published_at', datetime.utcnow()))
        
        # Group by time periods
        timeline = {}
        for article in sorted_articles:
            pub_date = article.get('published_at', datetime.utcnow())
            if isinstance(pub_date, str):
                pub_date = datetime.fromisoformat(pub_date.replace('Z', '+00:00'))
            
            # Group by hour
            hour_key = pub_date.strftime('%Y-%m-%d %H:00')
            
            if hour_key not in timeline:
                timeline[hour_key] = {
                    'timestamp': hour_key,
                    'article_count': 0,
                    'articles': [],
                    'avg_quality': 0.0
                }
            
            timeline[hour_key]['article_count'] += 1
            timeline[hour_key]['articles'].append({
                'title': article.get('title', ''),
                'source': article.get('source', ''),
                'quality_score': article.get('quality_score', 0),
                'content_type': article.get('content_classification', {}).get('content_type', 'general')
            })
        
        # Calculate average quality for each time period
        for period_data in timeline.values():
            if period_data['article_count'] > 0:
                period_data['avg_quality'] = sum(
                    a['quality_score'] for a in period_data['articles']
                ) / period_data['article_count']
        
        return {
            "match_id": match_id,
            "timeline": sorted(timeline.values(), key=lambda x: x['timestamp']),
            "total_periods": len(timeline),
            "total_articles": len(articles)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get match timeline: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/matches/{match_id}/sentiment")
async def get_match_sentiment(match_id: str = Path(..., description="Match ID")):
    """Get sentiment analysis for a match"""
    try:
        articles = await storage.get_articles_for_match(match_id, limit=200)
        
        if not articles:
            raise HTTPException(status_code=404, detail="No articles found for this match")
        
        # Analyze sentiment
        sentiment_data = await aggregator.analyze_match_sentiment(articles)
        
        return {
            "match_id": match_id,
            "sentiment_analysis": sentiment_data,
            "analyzed_articles": len(articles)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get match sentiment: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/trending")
async def get_trending_topics(days: int = Query(1, ge=1, le=7, description="Number of days")):
    """Get trending topics"""
    try:
        trending = await storage.get_trending_topics(days=days)
        
        return {
            "trending_topics": trending,
            "period_days": days,
            "generated_at": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Failed to get trending topics: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/search")
async def search_articles(
    q: str = Query(..., description="Search query"),
    match_id: Optional[str] = Query(None, description="Filter by match ID"),
    limit: int = Query(50, ge=1, le=100, description="Maximum results")
):
    """Search articles"""
    try:
        results = await storage.search_articles(
            query=q,
            match_id=match_id,
            limit=limit
        )
        
        return {
            "query": q,
            "match_id": match_id,
            "results": results,
            "result_count": len(results)
        }
        
    except Exception as e:
        logger.error(f"Search failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/health")
async def health_check() -> HealthCheck:
    """Health check endpoint"""
    try:
        # Check database health
        db_health = await storage.health_check()
        
        # Check aggregator health
        aggregator_health = await aggregator.health_check()
        
        # Get storage stats
        storage_stats = await storage.get_storage_stats()
        
        overall_status = "healthy" if (
            db_health.get('status') == 'healthy' and 
            aggregator_health.get('status') == 'healthy'
        ) else "unhealthy"
        
        return HealthCheck(
            status=overall_status,
            timestamp=datetime.utcnow(),
            database=db_health,
            aggregator=aggregator_health,
            storage=storage_stats
        )
        
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return HealthCheck(
            status="error",
            timestamp=datetime.utcnow(),
            error=str(e)
        )

@app.get("/api/v1/stats")
async def get_stats():
    """Get system statistics"""
    try:
        # Get storage stats
        storage_stats = await storage.get_storage_stats()
        
        # Get source stats
        source_stats = await storage.get_source_stats()
        
        # Get aggregator stats
        aggregator_stats = await aggregator.get_stats()
        
        return {
            "storage": storage_stats,
            "sources": source_stats,
            "aggregator": aggregator_stats,
            "generated_at": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Failed to get stats: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.websocket("/api/v1/matches/{match_id}/live")
async def websocket_endpoint(websocket: WebSocket, match_id: str):
    """WebSocket endpoint for real-time updates"""
    await websocket.accept()
    
    # Add to active connections
    if match_id not in active_connections:
        active_connections[match_id] = []
    active_connections[match_id].append(websocket)
    
    try:
        # Send initial data
        articles = await storage.get_articles_for_match(match_id, limit=20)
        await websocket.send_json({
            "type": "initial_data",
            "match_id": match_id,
            "articles": articles,
            "timestamp": datetime.utcnow().isoformat()
        })
        
        # Keep connection alive and send updates
        while True:
            await asyncio.sleep(30)  # Send updates every 30 seconds
            
            # Get latest articles
            latest_articles = await storage.get_articles_for_match(match_id, limit=5)
            
            if latest_articles:
                await websocket.send_json({
                    "type": "update",
                    "match_id": match_id,
                    "new_articles": latest_articles,
                    "timestamp": datetime.utcnow().isoformat()
                })
    
    except WebSocketDisconnect:
        logger.info(f"WebSocket disconnected for match {match_id}")
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
    finally:
        # Remove from active connections
        if match_id in active_connections:
            active_connections[match_id].remove(websocket)
            if not active_connections[match_id]:
                del active_connections[match_id]

# Background task functions
async def aggregate_match_news(match_id: str, home_team: str, away_team: str, match_date: datetime, priority: str = "normal"):
    """Background task to aggregate news for a match"""
    try:
        logger.info(f"Starting aggregation for match {match_id}: {home_team} vs {away_team}")
        
        # Run aggregation
        result = await aggregator.aggregate_match_news(
            match_id=match_id,
            home_team=home_team,
            away_team=away_team,
            match_date=match_date,
            priority=priority
        )
        
        # Notify WebSocket connections
        if match_id in active_connections:
            for websocket in active_connections[match_id]:
                try:
                    await websocket.send_json({
                        "type": "aggregation_complete",
                        "match_id": match_id,
                        "result": result,
                        "timestamp": datetime.utcnow().isoformat()
                    })
                except Exception as e:
                    logger.error(f"Failed to send WebSocket update: {e}")
        
        logger.info(f"Aggregation completed for match {match_id}")
        
    except Exception as e:
        logger.error(f"Background aggregation failed for match {match_id}: {e}")

async def periodic_cleanup():
    """Background task for periodic cleanup"""
    while True:
        try:
            await asyncio.sleep(3600)  # Run every hour
            
            # Run storage cleanup
            if storage:
                await storage.cleanup_expired_data()
            
            logger.info("Periodic cleanup completed")
            
        except Exception as e:
            logger.error(f"Periodic cleanup failed: {e}")

async def health_monitor():
    """Background task for health monitoring"""
    while True:
        try:
            await asyncio.sleep(300)  # Check every 5 minutes
            
            # Check system health
            if storage:
                storage_stats = await storage.get_storage_stats()
                
                # Log warnings if approaching limits
                if storage_stats.get('storage_percentage', 0) > 85:
                    logger.warning(f"Storage usage high: {storage_stats['storage_percentage']:.1f}%")
                
                # Trigger cleanup if necessary
                if storage_stats.get('storage_percentage', 0) > 90:
                    logger.warning("Triggering emergency cleanup")
                    await storage.cleanup_expired_data()
            
        except Exception as e:
            logger.error(f"Health monitor failed: {e}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)