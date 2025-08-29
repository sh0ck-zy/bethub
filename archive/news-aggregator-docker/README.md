# Match News Aggregator v1 - Free Deployment Guide

> **100% Free News Aggregation System** - Zero monthly costs, maximum value!

## 🚀 Quick Start

### Option 1: Fly.io (Recommended)
```bash
# Install flyctl
curl -L https://fly.io/install.sh | sh

# Login and deploy
flyctl auth login
flyctl launch --copy-config
flyctl deploy
```

### Option 2: Railway.app
```bash
# Connect your GitHub repo to Railway
# It will auto-deploy from the railway.json config
```

### Option 3: Render.com
```bash
# Connect your GitHub repo to Render
# It will use the render.yaml config
```

### Option 4: Docker (Local/VPS)
```bash
# Clone and run
git clone your-repo
cd news-aggregator-docker
cp .env.example .env
# Edit .env with your settings
docker-compose up -d
```

## 📋 Prerequisites

### Required (Free)
- **MongoDB Atlas** (512MB free tier)
  - Sign up at: https://cloud.mongodb.com/
  - Create cluster and get connection string
  - Set `MONGODB_CONNECTION_STRING` in your environment

### Optional (Free APIs)
- **Reddit API** (Free, unlimited with rate limits)
  - Create app at: https://www.reddit.com/prefs/apps
  - Set `REDDIT_CLIENT_ID` and `REDDIT_CLIENT_SECRET`

- **Guardian API** (5,000 calls/day free)
  - Get key at: https://open-platform.theguardian.com/access/
  - Set `GUARDIAN_API_KEY`

- **NewsData.io** (200 calls/day free)
  - Get key at: https://newsdata.io/
  - Set `NEWSDATA_API_KEY`

- **Currents API** (600 calls/day free)
  - Get key at: https://currentsapi.services/
  - Set `CURRENTS_API_KEY`

## 🛠️ Configuration

### Environment Variables
Copy `.env.example` to `.env` and configure:

```bash
# Required
MONGODB_CONNECTION_STRING=mongodb+srv://...

# Optional (but recommended)
REDDIT_CLIENT_ID=your_reddit_client_id
REDDIT_CLIENT_SECRET=your_reddit_client_secret
GUARDIAN_API_KEY=your_guardian_api_key
NEWSDATA_API_KEY=your_newsdata_api_key
CURRENTS_API_KEY=your_currents_api_key
```

### MongoDB Atlas Setup
1. Create free cluster at https://cloud.mongodb.com/
2. Create database user
3. Whitelist your IP (or use 0.0.0.0/0 for development)
4. Get connection string from "Connect" → "Connect your application"

## 🔧 Deployment Options

### Fly.io (Free 2,048 hours/month)
```bash
# Set secrets
flyctl secrets set MONGODB_CONNECTION_STRING="your-connection-string"
flyctl secrets set REDDIT_CLIENT_ID="your-reddit-client-id"
flyctl secrets set REDDIT_CLIENT_SECRET="your-reddit-client-secret"
flyctl secrets set GUARDIAN_API_KEY="your-guardian-api-key"

# Deploy
flyctl deploy
```

### Railway.app (500 hours/month free)
1. Connect GitHub repo
2. Set environment variables in dashboard
3. Auto-deploys from `railway.json`

### Render.com (750 hours/month free)
1. Connect GitHub repo
2. Set environment variables in dashboard
3. Uses `render.yaml` configuration

### Docker Compose (Local/VPS)
```bash
# Development
docker-compose up -d

# Production with Redis
docker-compose --profile with-redis up -d

# With local MongoDB
docker-compose --profile with-local-db up -d
```

## 📊 API Endpoints

### Core Endpoints
- `POST /api/v1/matches/{match_id}/aggregate` - Trigger aggregation
- `GET /api/v1/matches/{match_id}/news` - Get match news
- `GET /api/v1/matches/{match_id}/insights` - Get AI insights
- `GET /api/v1/matches/{match_id}/sentiment` - Get sentiment analysis

### Utility Endpoints
- `GET /api/v1/health` - Health check
- `GET /api/v1/stats` - System statistics
- `GET /api/v1/trending` - Trending topics
- `GET /api/v1/search` - Search articles
- `WS /api/v1/matches/{match_id}/live` - Real-time updates

## 🧪 Testing

### Test the API
```bash
# Health check
curl https://your-app.fly.dev/api/v1/health

# Trigger aggregation
curl -X POST "https://your-app.fly.dev/api/v1/matches/test-match/aggregate" \
  -H "Content-Type: application/json" \
  -d '{
    "home_team": "Manchester United",
    "away_team": "Liverpool",
    "match_date": "2024-03-15T15:00:00Z"
  }'

# Get match news
curl "https://your-app.fly.dev/api/v1/matches/test-match/news"
```

### Example Usage
```python
import requests

# Trigger aggregation
response = requests.post(
    "https://your-app.fly.dev/api/v1/matches/mu-vs-liv/aggregate",
    json={
        "home_team": "Manchester United",
        "away_team": "Liverpool", 
        "match_date": "2024-03-15T15:00:00Z"
    }
)

# Get aggregated news
news = requests.get(
    "https://your-app.fly.dev/api/v1/matches/mu-vs-liv/news?limit=20&min_quality=0.7"
)
```

## 🔄 WebSocket Real-time Updates

```javascript
const ws = new WebSocket('wss://your-app.fly.dev/api/v1/matches/test-match/live');

ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    
    switch(data.type) {
        case 'initial_data':
            console.log('Initial articles:', data.articles);
            break;
        case 'update':
            console.log('New articles:', data.new_articles);
            break;
        case 'aggregation_complete':
            console.log('Aggregation finished:', data.result);
            break;
    }
};
```

## 📈 Monitoring & Maintenance

### Storage Management
The system automatically manages storage within MongoDB's 512MB free tier:
- Articles expire after 30 days
- Contexts expire after 7 days
- Automatic cleanup runs every 24 hours

### Health Monitoring
```bash
# Check system health
curl https://your-app.fly.dev/api/v1/health

# Get system stats
curl https://your-app.fly.dev/api/v1/stats
```

### Rate Limiting
- RSS feeds: 60 requests/minute
- Reddit API: 60 requests/minute
- News APIs: 10 requests/minute
- Web scraping: 30 requests/minute

## 🐛 Troubleshooting

### Common Issues

**MongoDB Connection Error**
```bash
# Check connection string format
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/database?retryWrites=true&w=majority
```

**Reddit API Not Working**
```bash
# Verify client ID and secret
# Check Reddit app configuration
```

**Memory Issues**
```bash
# Increase cleanup frequency
CLEANUP_INTERVAL_HOURS=12

# Reduce article retention
ARTICLE_RETENTION_DAYS=14
```

### Logs
```bash
# Fly.io
flyctl logs

# Railway
# Check dashboard logs

# Docker
docker-compose logs news-aggregator
```

## 🔧 Advanced Configuration

### Custom Source Weights
Edit `src/lib/news-aggregator/config.py`:
```python
QUALITY_SCORING = {
    'source_weights': {
        'bbc_sport': 0.95,
        'your_custom_source': 0.80,
        # ... add more sources
    }
}
```

### Add Custom RSS Feeds
```python
RSS_SOURCES = {
    'custom_feed': 'https://yoursite.com/rss.xml',
    # ... add more feeds
}
```

## 🚀 Scaling Up

When you're ready to scale beyond free tiers:

1. **MongoDB Atlas** → $57/month (10GB)
2. **Twitter API** → $100/month (Basic tier)
3. **Redis Cache** → $5/month (Railway/Render)
4. **Higher compute** → $10-20/month

## 📝 License

MIT License - Feel free to modify and use for your projects!

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Add tests for new features
4. Submit pull request

## 📞 Support

- GitHub Issues: Report bugs and request features
- Documentation: Full API docs at `/docs` endpoint
- Health Check: Always available at `/api/v1/health`

---

**Happy aggregating!** 🎉

*Built with ❤️ for the football community*