"""
Configuration for the Match News Aggregator v1
All free APIs and sources configuration
"""

import os
from typing import Dict, List

# RSS Feed Sources - Completely Free
RSS_SOURCES = {
    # Major Sports Outlets
    'bbc_sport': 'http://feeds.bbci.co.uk/sport/football/rss.xml',
    'guardian_football': 'https://www.theguardian.com/football/rss',
    'espn_fc': 'https://www.espn.com/espn/rss/soccer/news',
    'sky_sports': 'https://www.skysports.com/rss/12040',
    'cnn_sport': 'http://rss.cnn.com/rss/edition.rss',
    'reuters_sport': 'https://feeds.reuters.com/reuters/UKSportsNews',
    
    # Club Specific (Major European Teams)
    'manutd_official': 'https://www.manutd.com/en/rss',
    'liverpool_official': 'https://www.liverpoolfc.com/rss/news',
    'arsenal_official': 'https://www.arsenal.com/rss/news',
    'chelsea_official': 'https://www.chelseafc.com/en/rss',
    'tottenham_official': 'https://www.tottenhamhotspur.com/rss',
    'manchestercity_official': 'https://www.mancity.com/rss/news',
    'realmadrid_official': 'https://www.realmadrid.com/en/rss/news',
    'barcelona_official': 'https://www.fcbarcelona.com/en/feed',
    'juventus_official': 'https://www.juventus.com/en/rss',
    'acmilan_official': 'https://www.acmilan.com/en/rss',
    'bayernmunich_official': 'https://fcbayern.com/en/rss',
    'borussia_dortmund': 'https://www.bvb.de/eng/News/RSS',
    
    # League Specific
    'premier_league': 'https://www.premierleague.com/en-gb/news/rss',
    'laliga': 'https://www.laliga.com/rss/news',
    'bundesliga': 'https://www.bundesliga.com/en/rss',
    'serie_a': 'https://www.legaseriea.it/en/rss',
    'ligue_1': 'https://www.ligue1.com/rss/news',
    'champions_league': 'https://www.uefa.com/uefachampionsleague/news/rss.xml',
    'europa_league': 'https://www.uefa.com/uefaeuropaleague/news/rss.xml',
    
    # Football Analytics & Tactics
    'football_outsiders': 'https://www.footballoutsiders.com/rss.xml',
    'the_athletic_free': 'https://theathletic.com/soccer/feed/',
    'football_365': 'https://www.football365.com/rss',
    'goal_com': 'https://www.goal.com/feeds/news?fmt=rss',
    'transfermarkt': 'https://www.transfermarkt.com/rss/news',
}

# Reddit Configuration
REDDIT_CONFIG = {
    'client_id': os.getenv('REDDIT_CLIENT_ID', ''),
    'client_secret': os.getenv('REDDIT_CLIENT_SECRET', ''),
    'user_agent': 'MatchNewsAggregator/1.0',
    'read_only': True,
    'target_subreddits': [
        'soccer',
        'PremierLeague',
        'LaLiga',
        'Bundesliga',
        'SerieA',
        'Ligue1',
        'ChampionsLeague',
        'EuropaLeague',
        'football',
        'footballtactics',
        'FantasyPL',
        'reddevils',  # Manchester United
        'LiverpoolFC',
        'Gunners',  # Arsenal
        'chelseafc',
        'coys',  # Tottenham
        'MCFC',  # Manchester City
        'realmadrid',
        'Barca',
        'Juve',
        'ACMilan',
        'fcbayern',
        'borussiadortmund',
    ]
}

# Team to Subreddit Mapping
TEAM_SUBREDDITS = {
    'Manchester United': 'reddevils',
    'Liverpool': 'LiverpoolFC',
    'Arsenal': 'Gunners',
    'Chelsea': 'chelseafc',
    'Tottenham': 'coys',
    'Manchester City': 'MCFC',
    'Real Madrid': 'realmadrid',
    'Barcelona': 'Barca',
    'Juventus': 'Juve',
    'AC Milan': 'ACMilan',
    'Bayern Munich': 'fcbayern',
    'Borussia Dortmund': 'borussiadortmund',
}

# Nitter Instances (Twitter via RSS)
NITTER_INSTANCES = [
    'https://nitter.net',
    'https://nitter.it',
    'https://nitter.unixfox.eu',
    'https://nitter.fdn.fr',
    'https://nitter.pussthecat.org',
]

# Key Twitter Accounts to Monitor
TWITTER_ACCOUNTS = {
    'journalists': [
        'FabrizioRomano',
        'David_Ornstein',
        'JamesPearceLFC',
        'SamLee',
        'hirstclass',
        'bbcsport_david',
        'MiguelDelaney',
        'honigstein',
        'DiMarzio',
        'RMadridInfo',
        'BarcaUniversal',
        'JuventusFC',
        'acmilan',
        'FCBayern',
        'BVB',
    ],
    'clubs': [
        'ManUtd',
        'LFC',
        'Arsenal',
        'ChelseaFC',
        'SpursOfficial',
        'ManCity',
        'realmadrid',
        'FCBarcelona',
        'juventusfc',
        'acmilan',
        'FCBayern',
        'BVB',
    ],
    'leagues': [
        'premierleague',
        'LaLiga',
        'Bundesliga_EN',
        'SerieA',
        'Ligue1',
        'ChampionsLeague',
        'EuropaLeague',
    ]
}

# News APIs - Free Tiers
NEWS_APIS = {
    'guardian': {
        'url': 'https://content.guardianapis.com/search',
        'key': os.getenv('GUARDIAN_API_KEY', ''),
        'daily_limit': 5000,
        'rate_limit': 12,  # requests per second
    },
    'newsdata': {
        'url': 'https://newsdata.io/api/1/news',
        'key': os.getenv('NEWSDATA_API_KEY', ''),
        'daily_limit': 200,
        'rate_limit': 1,  # requests per second
    },
    'currents': {
        'url': 'https://api.currentsapi.services/v1/search',
        'key': os.getenv('CURRENTS_API_KEY', ''),
        'daily_limit': 600,
        'rate_limit': 1,
    }
}

# Club Official Website Patterns
CLUB_WEBSITES = {
    'Manchester United': 'https://www.manutd.com',
    'Liverpool': 'https://www.liverpoolfc.com',
    'Arsenal': 'https://www.arsenal.com',
    'Chelsea': 'https://www.chelseafc.com',
    'Tottenham': 'https://www.tottenhamhotspur.com',
    'Manchester City': 'https://www.mancity.com',
    'Real Madrid': 'https://www.realmadrid.com',
    'Barcelona': 'https://www.fcbarcelona.com',
    'Juventus': 'https://www.juventus.com',
    'AC Milan': 'https://www.acmilan.com',
    'Bayern Munich': 'https://fcbayern.com',
    'Borussia Dortmund': 'https://www.bvb.de',
}

# MongoDB Configuration (Free Atlas Tier)
MONGODB_CONFIG = {
    'connection_string': os.getenv('MONGODB_CONNECTION_STRING', ''),
    'database': 'match_news_aggregator',
    'collections': {
        'articles': 'articles',
        'matches': 'matches',
        'contexts': 'match_contexts',
        'sources': 'source_stats',
    },
    'indexes': [
        [('match_id', 1), ('published_at', -1)],
        [('hash', 1)],
        [('source_type', 1), ('quality_score', -1)],
        [('expires_at', 1)],
    ]
}

# Quality Scoring Configuration
QUALITY_SCORING = {
    'source_weights': {
        'bbc_sport': 0.95,
        'guardian_football': 0.92,
        'sky_sports': 0.88,
        'espn_fc': 0.85,
        'official_club': 0.90,
        'premier_league': 0.88,
        'champions_league': 0.85,
        'reddit_match_thread': 0.75,
        'reddit_discussion': 0.65,
        'twitter_verified': 0.70,
        'twitter_journalist': 0.75,
        'scraped_news': 0.60,
        'google_news': 0.55,
    },
    'content_multipliers': {
        'breaking_news': 1.3,
        'exclusive': 1.2,
        'match_preview': 1.1,
        'match_report': 1.15,
        'injury_news': 1.1,
        'transfer_news': 1.05,
        'opinion': 0.8,
        'rumor': 0.6,
    },
    'engagement_weights': {
        'reddit_upvotes': 0.001,
        'reddit_comments': 0.002,
        'twitter_likes': 0.0001,
        'twitter_retweets': 0.0002,
    }
}

# Caching Configuration
CACHE_CONFIG = {
    'directory': '/tmp/match_news_cache',
    'default_expire': 3600,  # 1 hour
    'contexts_expire': 7200,  # 2 hours
    'source_stats_expire': 86400,  # 24 hours
}

# Rate Limiting Configuration
RATE_LIMITS = {
    'rss_feeds': {
        'requests_per_minute': 60,
        'concurrent_requests': 10,
    },
    'reddit_api': {
        'requests_per_minute': 60,
        'concurrent_requests': 5,
    },
    'web_scraping': {
        'requests_per_minute': 30,
        'concurrent_requests': 3,
        'delay_between_requests': 2,
    },
    'news_apis': {
        'requests_per_minute': 10,
        'concurrent_requests': 2,
    }
}

# Language Detection Configuration
LANGUAGE_CONFIG = {
    'supported_languages': ['en', 'es', 'fr', 'de', 'it', 'pt'],
    'default_language': 'en',
    'translation_threshold': 0.7,  # Confidence threshold for language detection
}

# Logging Configuration
LOGGING_CONFIG = {
    'level': 'INFO',
    'format': '%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    'file': 'news_aggregator.log',
    'max_size': 10485760,  # 10MB
    'backup_count': 5,
}

# Data Retention Configuration
DATA_RETENTION = {
    'articles_days': 30,
    'contexts_days': 7,
    'source_stats_days': 90,
    'cache_hours': 24,
}

# Default Headers for Web Requests
DEFAULT_HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Compatible; MatchNewsAggregator/1.0; +https://bethub.com)',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
    'Accept-Encoding': 'gzip, deflate',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
}

# Team Name Variations (for better matching)
TEAM_VARIATIONS = {
    'Manchester United': ['Man United', 'ManUtd', 'United', 'MUFC'],
    'Manchester City': ['Man City', 'City', 'MCFC'],
    'Liverpool': ['LFC', 'The Reds'],
    'Arsenal': ['Gunners', 'AFC'],
    'Chelsea': ['Blues', 'CFC'],
    'Tottenham': ['Spurs', 'THFC'],
    'Real Madrid': ['Madrid', 'Los Blancos', 'RM'],
    'Barcelona': ['Barca', 'Barça', 'FCB'],
    'Bayern Munich': ['Bayern', 'FCB'],
    'Borussia Dortmund': ['Dortmund', 'BVB'],
}

# API Endpoints Configuration
API_CONFIG = {
    'base_path': '/api/v1/news',
    'endpoints': {
        'aggregate': '/matches/{match_id}/aggregate',
        'news': '/matches/{match_id}/news',
        'insights': '/matches/{match_id}/insights',
        'sources': '/matches/{match_id}/sources',
        'live': '/matches/{match_id}/live',
        'health': '/health',
        'stats': '/stats',
    },
    'pagination': {
        'default_limit': 50,
        'max_limit': 200,
    }
}