"""
MongoDB Storage Layer for News Aggregator
Optimized for MongoDB Atlas Free Tier (512MB storage)
"""

import asyncio
import logging
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from pymongo import MongoClient, IndexModel, ASCENDING, DESCENDING
from pymongo.errors import DuplicateKeyError, ConnectionFailure
import motor.motor_asyncio

from ..config import MONGODB_CONFIG, DATA_RETENTION

logger = logging.getLogger(__name__)

class MongoDBStorage:
    def __init__(self, connection_string: str = None):
        self.connection_string = connection_string or MONGODB_CONFIG['connection_string']
        self.database_name = MONGODB_CONFIG['database']
        self.collections = MONGODB_CONFIG['collections']
        
        # Async client
        self.client = None
        self.db = None
        
        # Collection references
        self.articles_collection = None
        self.matches_collection = None
        self.contexts_collection = None
        self.sources_collection = None
        
        # Storage statistics
        self.storage_stats = {
            'total_articles': 0,
            'storage_used': 0,
            'storage_limit': 512 * 1024 * 1024,  # 512MB in bytes
            'last_cleanup': None
        }
    
    async def connect(self):
        """Connect to MongoDB Atlas"""
        try:
            self.client = motor.motor_asyncio.AsyncIOMotorClient(
                self.connection_string,
                serverSelectionTimeoutMS=5000
            )
            
            # Test connection
            await self.client.admin.command('ping')
            
            self.db = self.client[self.database_name]
            
            # Get collection references
            self.articles_collection = self.db[self.collections['articles']]
            self.matches_collection = self.db[self.collections['matches']]
            self.contexts_collection = self.db[self.collections['contexts']]
            self.sources_collection = self.db[self.collections['sources']]
            
            # Create indexes
            await self._create_indexes()
            
            logger.info("Successfully connected to MongoDB Atlas")
            
        except Exception as e:
            logger.error(f"Failed to connect to MongoDB: {e}")
            raise
    
    async def disconnect(self):
        """Disconnect from MongoDB"""
        if self.client:
            self.client.close()
            logger.info("Disconnected from MongoDB")
    
    async def _create_indexes(self):
        """Create necessary indexes for optimal performance"""
        try:
            # Articles collection indexes
            await self.articles_collection.create_indexes([
                IndexModel([('match_id', ASCENDING), ('published_at', DESCENDING)]),
                IndexModel([('hash', ASCENDING)], unique=True),
                IndexModel([('source_type', ASCENDING), ('quality_score', DESCENDING)]),
                IndexModel([('expires_at', ASCENDING)]),
                IndexModel([('collected_at', DESCENDING)]),
                IndexModel([('relevance_score', DESCENDING)]),
                IndexModel([('tags', ASCENDING)]),
                IndexModel([('language_info.language', ASCENDING)]),
                IndexModel([('content_classification.content_type', ASCENDING)]),
            ])
            
            # Matches collection indexes
            await self.matches_collection.create_indexes([
                IndexModel([('match_date', DESCENDING)]),
                IndexModel([('home_team', ASCENDING), ('away_team', ASCENDING)]),
                IndexModel([('status', ASCENDING)]),
            ])
            
            # Contexts collection indexes
            await self.contexts_collection.create_indexes([
                IndexModel([('match_id', ASCENDING)]),
                IndexModel([('created_at', DESCENDING)]),
                IndexModel([('expires_at', ASCENDING)]),
            ])
            
            # Sources collection indexes
            await self.sources_collection.create_indexes([
                IndexModel([('source_name', ASCENDING)]),
                IndexModel([('date', DESCENDING)]),
            ])
            
            logger.info("Database indexes created successfully")
            
        except Exception as e:
            logger.error(f"Failed to create indexes: {e}")
    
    async def store_article(self, article: Dict[str, Any]) -> bool:
        """Store a single article with automatic deduplication"""
        try:
            # Add storage metadata
            article['stored_at'] = datetime.utcnow()
            article['expires_at'] = datetime.utcnow() + timedelta(days=DATA_RETENTION['articles_days'])
            
            # Ensure hash exists
            if 'hash' not in article:
                article['hash'] = self._generate_hash(article)
            
            # Insert with upsert to handle duplicates
            await self.articles_collection.replace_one(
                {'hash': article['hash']},
                article,
                upsert=True
            )
            
            return True
            
        except DuplicateKeyError:
            # Article already exists, update last_seen
            await self.articles_collection.update_one(
                {'hash': article['hash']},
                {'$set': {'last_seen': datetime.utcnow()}}
            )
            return False
            
        except Exception as e:
            logger.error(f"Failed to store article: {e}")
            return False
    
    async def store_articles_batch(self, articles: List[Dict[str, Any]]) -> Dict[str, int]:
        """Store multiple articles in batch"""
        results = {'stored': 0, 'duplicates': 0, 'errors': 0}
        
        if not articles:
            return results
        
        # Prepare articles for storage
        prepared_articles = []
        for article in articles:
            article['stored_at'] = datetime.utcnow()
            article['expires_at'] = datetime.utcnow() + timedelta(days=DATA_RETENTION['articles_days'])
            
            if 'hash' not in article:
                article['hash'] = self._generate_hash(article)
            
            prepared_articles.append(article)
        
        # Use bulk operations for efficiency
        bulk_operations = []
        for article in prepared_articles:
            bulk_operations.append({
                'replaceOne': {
                    'filter': {'hash': article['hash']},
                    'replacement': article,
                    'upsert': True
                }
            })
        
        try:
            # Execute bulk operation
            result = await self.articles_collection.bulk_write(bulk_operations, ordered=False)
            
            results['stored'] = result.upserted_count + result.modified_count
            results['duplicates'] = len(articles) - results['stored']
            
            logger.info(f"Batch storage: {results['stored']} stored, {results['duplicates']} duplicates")
            
        except Exception as e:
            logger.error(f"Batch storage failed: {e}")
            results['errors'] = len(articles)
        
        return results
    
    async def get_articles_for_match(self, match_id: str, limit: int = 100, 
                                   source_type: str = None, min_quality: float = 0.0) -> List[Dict[str, Any]]:
        """Get articles for a specific match"""
        try:
            # Build query
            query = {'match_id': match_id}
            
            if source_type:
                query['source_type'] = source_type
            
            if min_quality > 0:
                query['quality_score'] = {'$gte': min_quality}
            
            # Execute query
            cursor = self.articles_collection.find(query).sort([
                ('relevance_score', DESCENDING),
                ('quality_score', DESCENDING),
                ('published_at', DESCENDING)
            ]).limit(limit)
            
            articles = await cursor.to_list(length=limit)
            
            # Remove MongoDB ObjectId for JSON serialization
            for article in articles:
                article.pop('_id', None)
            
            return articles
            
        except Exception as e:
            logger.error(f"Failed to get articles for match {match_id}: {e}")
            return []
    
    async def store_match_context(self, match_id: str, context: Dict[str, Any]) -> bool:
        """Store aggregated context for a match"""
        try:
            context_doc = {
                'match_id': match_id,
                'context': context,
                'created_at': datetime.utcnow(),
                'expires_at': datetime.utcnow() + timedelta(days=DATA_RETENTION['contexts_days'])
            }
            
            await self.contexts_collection.replace_one(
                {'match_id': match_id},
                context_doc,
                upsert=True
            )
            
            return True
            
        except Exception as e:
            logger.error(f"Failed to store match context: {e}")
            return False
    
    async def get_match_context(self, match_id: str) -> Optional[Dict[str, Any]]:
        """Get stored context for a match"""
        try:
            doc = await self.contexts_collection.find_one({'match_id': match_id})
            
            if doc:
                doc.pop('_id', None)
                return doc['context']
            
            return None
            
        except Exception as e:
            logger.error(f"Failed to get match context: {e}")
            return None
    
    async def store_match_info(self, match_info: Dict[str, Any]) -> bool:
        """Store match information"""
        try:
            match_info['updated_at'] = datetime.utcnow()
            
            await self.matches_collection.replace_one(
                {'match_id': match_info['match_id']},
                match_info,
                upsert=True
            )
            
            return True
            
        except Exception as e:
            logger.error(f"Failed to store match info: {e}")
            return False
    
    async def get_recent_matches(self, days: int = 7) -> List[Dict[str, Any]]:
        """Get recent matches"""
        try:
            since_date = datetime.utcnow() - timedelta(days=days)
            
            cursor = self.matches_collection.find({
                'match_date': {'$gte': since_date}
            }).sort('match_date', DESCENDING)
            
            matches = await cursor.to_list(length=None)
            
            for match in matches:
                match.pop('_id', None)
            
            return matches
            
        except Exception as e:
            logger.error(f"Failed to get recent matches: {e}")
            return []
    
    async def update_source_stats(self, source_name: str, stats: Dict[str, Any]) -> bool:
        """Update statistics for a source"""
        try:
            doc = {
                'source_name': source_name,
                'date': datetime.utcnow().date(),
                'stats': stats,
                'updated_at': datetime.utcnow()
            }
            
            await self.sources_collection.replace_one(
                {'source_name': source_name, 'date': doc['date']},
                doc,
                upsert=True
            )
            
            return True
            
        except Exception as e:
            logger.error(f"Failed to update source stats: {e}")
            return False
    
    async def get_source_stats(self, source_name: str = None, days: int = 30) -> List[Dict[str, Any]]:
        """Get source statistics"""
        try:
            since_date = datetime.utcnow().date() - timedelta(days=days)
            
            query = {'date': {'$gte': since_date}}
            if source_name:
                query['source_name'] = source_name
            
            cursor = self.sources_collection.find(query).sort('date', DESCENDING)
            stats = await cursor.to_list(length=None)
            
            for stat in stats:
                stat.pop('_id', None)
                stat['date'] = stat['date'].isoformat()
            
            return stats
            
        except Exception as e:
            logger.error(f"Failed to get source stats: {e}")
            return []
    
    async def cleanup_expired_data(self) -> Dict[str, int]:
        """Clean up expired data to stay within storage limits"""
        cleanup_results = {
            'articles_removed': 0,
            'contexts_removed': 0,
            'sources_removed': 0
        }
        
        try:
            current_time = datetime.utcnow()
            
            # Clean up expired articles
            articles_result = await self.articles_collection.delete_many({
                'expires_at': {'$lt': current_time}
            })
            cleanup_results['articles_removed'] = articles_result.deleted_count
            
            # Clean up expired contexts
            contexts_result = await self.contexts_collection.delete_many({
                'expires_at': {'$lt': current_time}
            })
            cleanup_results['contexts_removed'] = contexts_result.deleted_count
            
            # Clean up old source stats
            old_date = current_time.date() - timedelta(days=DATA_RETENTION['source_stats_days'])
            sources_result = await self.sources_collection.delete_many({
                'date': {'$lt': old_date}
            })
            cleanup_results['sources_removed'] = sources_result.deleted_count
            
            # Update cleanup timestamp
            self.storage_stats['last_cleanup'] = current_time
            
            logger.info(f"Cleanup completed: {cleanup_results}")
            
        except Exception as e:
            logger.error(f"Cleanup failed: {e}")
        
        return cleanup_results
    
    async def get_storage_stats(self) -> Dict[str, Any]:
        """Get current storage statistics"""
        try:
            # Get collection stats
            articles_count = await self.articles_collection.count_documents({})
            matches_count = await self.matches_collection.count_documents({})
            contexts_count = await self.contexts_collection.count_documents({})
            
            # Get database stats
            db_stats = await self.db.command('dbstats')
            
            # Calculate storage usage
            storage_used = db_stats.get('dataSize', 0)
            storage_limit = self.storage_stats['storage_limit']
            
            # Get article distribution by source
            pipeline = [
                {'$group': {
                    '_id': '$source_type',
                    'count': {'$sum': 1},
                    'avg_quality': {'$avg': '$quality_score'}
                }}
            ]
            
            source_distribution = []
            async for doc in self.articles_collection.aggregate(pipeline):
                source_distribution.append({
                    'source_type': doc['_id'],
                    'count': doc['count'],
                    'avg_quality': round(doc['avg_quality'], 2)
                })
            
            return {
                'storage_used': storage_used,
                'storage_limit': storage_limit,
                'storage_percentage': (storage_used / storage_limit * 100) if storage_limit > 0 else 0,
                'collections': {
                    'articles': articles_count,
                    'matches': matches_count,
                    'contexts': contexts_count
                },
                'source_distribution': source_distribution,
                'last_cleanup': self.storage_stats['last_cleanup'],
                'database_stats': {
                    'collections': db_stats.get('collections', 0),
                    'indexes': db_stats.get('indexes', 0),
                    'index_size': db_stats.get('indexSize', 0)
                }
            }
            
        except Exception as e:
            logger.error(f"Failed to get storage stats: {e}")
            return {}
    
    async def search_articles(self, query: str, match_id: str = None, limit: int = 50) -> List[Dict[str, Any]]:
        """Search articles by text query"""
        try:
            # Build search query
            search_query = {
                '$or': [
                    {'title': {'$regex': query, '$options': 'i'}},
                    {'summary': {'$regex': query, '$options': 'i'}},
                    {'content': {'$regex': query, '$options': 'i'}},
                    {'tags': {'$regex': query, '$options': 'i'}}
                ]
            }
            
            if match_id:
                search_query['match_id'] = match_id
            
            cursor = self.articles_collection.find(search_query).sort([
                ('relevance_score', DESCENDING),
                ('quality_score', DESCENDING)
            ]).limit(limit)
            
            articles = await cursor.to_list(length=limit)
            
            for article in articles:
                article.pop('_id', None)
            
            return articles
            
        except Exception as e:
            logger.error(f"Search failed: {e}")
            return []
    
    async def get_trending_topics(self, days: int = 1) -> List[Dict[str, Any]]:
        """Get trending topics from recent articles"""
        try:
            since_date = datetime.utcnow() - timedelta(days=days)
            
            # Aggregate tags from recent articles
            pipeline = [
                {'$match': {'collected_at': {'$gte': since_date}}},
                {'$unwind': '$tags'},
                {'$group': {
                    '_id': '$tags',
                    'count': {'$sum': 1},
                    'avg_quality': {'$avg': '$quality_score'},
                    'sources': {'$addToSet': '$source'}
                }},
                {'$sort': {'count': -1}},
                {'$limit': 20}
            ]
            
            trending = []
            async for doc in self.articles_collection.aggregate(pipeline):
                trending.append({
                    'topic': doc['_id'],
                    'count': doc['count'],
                    'avg_quality': round(doc['avg_quality'], 2),
                    'sources': doc['sources']
                })
            
            return trending
            
        except Exception as e:
            logger.error(f"Failed to get trending topics: {e}")
            return []
    
    def _generate_hash(self, article: Dict[str, Any]) -> str:
        """Generate hash for article deduplication"""
        import hashlib
        
        title = article.get('title', '')
        url = article.get('link', '') or article.get('url', '')
        content = article.get('content', '') or article.get('summary', '')
        
        hash_content = f"{title}{url}{content}"
        return hashlib.md5(hash_content.encode('utf-8')).hexdigest()
    
    async def health_check(self) -> Dict[str, Any]:
        """Check database health"""
        try:
            # Test connection
            await self.client.admin.command('ping')
            
            # Test write operation
            test_doc = {'test': True, 'timestamp': datetime.utcnow()}
            await self.db.test_collection.insert_one(test_doc)
            await self.db.test_collection.delete_one({'test': True})
            
            # Get server status
            server_info = await self.client.server_info()
            
            return {
                'status': 'healthy',
                'connected': True,
                'server_version': server_info.get('version', 'unknown'),
                'database': self.database_name,
                'last_check': datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            return {
                'status': 'unhealthy',
                'connected': False,
                'error': str(e),
                'last_check': datetime.utcnow().isoformat()
            }
    
    async def __aenter__(self):
        await self.connect()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.disconnect()


# Utility functions for storage management
async def optimize_storage_usage(storage: MongoDBStorage) -> Dict[str, Any]:
    """Optimize storage usage for free tier"""
    optimization_results = {}
    
    # Run cleanup
    cleanup_results = await storage.cleanup_expired_data()
    optimization_results['cleanup'] = cleanup_results
    
    # Get storage stats
    stats = await storage.get_storage_stats()
    optimization_results['stats'] = stats
    
    # If approaching limit, remove oldest articles
    if stats.get('storage_percentage', 0) > 80:
        # Remove oldest articles beyond retention
        older_date = datetime.utcnow() - timedelta(days=DATA_RETENTION['articles_days'] // 2)
        
        result = await storage.articles_collection.delete_many({
            'collected_at': {'$lt': older_date}
        })
        
        optimization_results['emergency_cleanup'] = result.deleted_count
    
    return optimization_results


async def backup_critical_data(storage: MongoDBStorage) -> Dict[str, Any]:
    """Backup critical match contexts (for disaster recovery)"""
    try:
        # Get recent match contexts
        recent_contexts = await storage.contexts_collection.find({
            'created_at': {'$gte': datetime.utcnow() - timedelta(days=7)}
        }).to_list(length=None)
        
        # Simple backup to file (in production, use cloud storage)
        import json
        backup_file = f"backup_contexts_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.json"
        
        with open(backup_file, 'w') as f:
            # Convert ObjectId to string for JSON serialization
            for context in recent_contexts:
                context['_id'] = str(context['_id'])
                context['created_at'] = context['created_at'].isoformat()
                context['expires_at'] = context['expires_at'].isoformat()
            
            json.dump(recent_contexts, f, indent=2)
        
        return {
            'backup_file': backup_file,
            'contexts_backed_up': len(recent_contexts),
            'backup_time': datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Backup failed: {e}")
        return {'error': str(e)}