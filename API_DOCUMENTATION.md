# BetHub API Documentation

This directory contains comprehensive API documentation for the BetHub platform, including both the Next.js API routes and the Python FastAPI news aggregator.

## 📁 Files

- **`openapi.yaml`** - OpenAPI 3.0 specification for all APIs
- **`bethub-insomnia-collection.json`** - Insomnia collection for testing APIs
- **`API_DOCUMENTATION.md`** - This documentation file

## 🚀 Quick Start

### Option 1: View OpenAPI Documentation Online

1. Copy the contents of `openapi.yaml`
2. Go to [Swagger Editor](https://editor.swagger.io/) or [ReDoc](https://redocly.github.io/redoc/)
3. Paste the YAML content
4. View interactive API documentation

### Option 2: Use Insomnia for API Testing

1. Download [Insomnia](https://insomnia.rest/download)
2. Import the `bethub-insomnia-collection.json` file
3. Configure your environment variables
4. Start testing APIs

## 🔧 API Overview

### **Next.js API Routes** (Port 3000)

#### Health & Status
- `GET /api/v1/health` - System health check
- `GET /api/v1/test` - Test endpoint

#### Match Management
- `GET /api/v1/today` - Get today's matches
- `POST /api/v1/add-real-matches` - Add match data
- `POST /api/v1/sync-matches` - Sync from external sources

#### Admin Operations (Admin Only)
- `GET /api/v1/admin/matches` - List matches with filtering
- `POST /api/v1/admin/matches` - Batch operations

#### Payment Processing
- `POST /api/payments/checkout` - Create Stripe checkout
- `POST /api/payments/webhook` - Handle Stripe webhooks

#### Automated Tasks
- `POST /api/cron/autonomous-sync` - Trigger data sync

### **News Aggregator API** (Port 8000 - Python FastAPI)

#### Core Endpoints
- `GET /api/v1/status` - API status
- `POST /api/v1/matches/{id}/aggregate` - Trigger news aggregation
- `GET /api/v1/matches/{id}/news` - Get match news
- `GET /api/v1/matches/{id}/insights` - Get AI insights
- `GET /api/v1/matches/{id}/sentiment` - Sentiment analysis
- `GET /api/v1/matches/{id}/sources` - Get news sources

#### Utility Endpoints
- `GET /api/v1/health/aggregator` - Health check
- `GET /api/v1/stats` - System statistics
- `GET /api/v1/trending` - Trending topics
- `GET /api/v1/search` - Search articles

## 🛠️ Using Insomnia

### Import Collection

1. Open Insomnia
2. Click **Create** → **Import from File**
3. Select `bethub-insomnia-collection.json`
4. The collection will be imported with all endpoints organized by category

### Configure Environments

The collection includes two pre-configured environments:

#### Development Environment
```json
{
  "baseUrl": "http://localhost:3000",
  "newsApiUrl": "http://localhost:8000",
  "matchId": "match-123",
  "adminToken": "your-admin-token-here",
  "userToken": "your-user-token-here"
}
```

#### Production Environment
```json
{
  "baseUrl": "https://your-domain.com",
  "newsApiUrl": "https://news-api.your-domain.com",
  "matchId": "match-123",
  "adminToken": "your-admin-token-here",
  "userToken": "your-user-token-here"
}
```

### Environment Variables

- **`baseUrl`** - Next.js API base URL
- **`newsApiUrl`** - Python FastAPI news aggregator URL
- **`matchId`** - Sample match ID for testing
- **`adminToken`** - Admin authentication token
- **`userToken`** - User authentication token

## 📋 Testing Workflow

### 1. Health Checks
Start by testing the health endpoints to ensure services are running:
- `GET /api/v1/health` (Next.js)
- `GET /api/v1/status` (News Aggregator)
- `GET /api/v1/health/aggregator` (News Aggregator Health)

### 2. Public Endpoints
Test public endpoints that don't require authentication:
- `GET /api/v1/today`
- `GET /api/v1/test`

### 3. Admin Operations
Test admin endpoints (requires admin token):
- `GET /api/v1/admin/matches`
- `POST /api/v1/admin/matches`

### 4. News Aggregation
Test the Python FastAPI endpoints:
- `POST /api/v1/matches/{id}/aggregate`
- `GET /api/v1/matches/{id}/news`

### 5. Payment Processing
Test payment endpoints (requires user token):
- `POST /api/payments/checkout`

## 🔐 Authentication

### Admin Endpoints
Require `Authorization: Bearer {adminToken}` header

### User Endpoints
Require `Authorization: Bearer {userToken}` header

### Public Endpoints
No authentication required

## 📊 Request Examples

### Add Real Matches
```json
POST /api/v1/add-real-matches
{
  "matches": [
    {
      "home_team": "Manchester United",
      "away_team": "Liverpool",
      "league": "Premier League",
      "kickoff_utc": "2024-12-25T15:00:00Z",
      "venue": "Old Trafford",
      "referee": "Michael Oliver"
    }
  ]
}
```

### Admin Batch Operations
```json
POST /api/v1/admin/matches
{
  "action": "batch_analyze",
  "matchIds": ["match-1", "match-2"],
  "data": {}
}
```

### Trigger News Aggregation
```json
POST /api/v1/matches/match-123/aggregate
{
  "home_team": "Manchester United",
  "away_team": "Liverpool",
  "match_date": "2024-12-25T15:00:00Z",
  "priority": "high"
}
```

## 🚨 Common Issues

### CORS Errors
Ensure your Next.js and FastAPI servers have proper CORS configuration.

### Authentication Errors
- Verify tokens are valid and not expired
- Check token format: `Bearer {token}`
- Ensure user has proper permissions

### Connection Errors
- Verify services are running on correct ports
- Check firewall settings
- Ensure environment variables are correct

## 📚 Additional Resources

- [OpenAPI Specification](https://swagger.io/specification/)
- [Insomnia Documentation](https://docs.insomnia.rest/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)

## 🤝 Contributing

To update the API documentation:

1. Modify the relevant API route files
2. Update `openapi.yaml` with new endpoints/schemas
3. Update `bethub-insomnia-collection.json` with new requests
4. Test all endpoints in Insomnia
5. Update this documentation

## 📝 Notes

- The OpenAPI specification covers both Next.js and FastAPI endpoints
- Environment variables use Insomnia's templating syntax: `{{ _.variableName }}`
- All endpoints include proper error handling and status codes
- Request/response examples are provided for complex endpoints
- Authentication is handled via Bearer tokens in headers
