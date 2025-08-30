# Public API Endpoints

Base path: `/api`

## Health
GET `/v1/health`

Response 200 example:
```json
{
  "status": "ok",
  "timestamp": "2025-01-01T00:00:00.000Z",
  "environment": "development",
  "version": "BetHub MVP",
  "services": { "api": "healthy", "database": "healthy" },
  "uptime": 123,
  "memory": { "used": 123, "total": 456 }
}
```

Errors: 500 `{ status: "error", error, message }`

## Test
GET `/v1/test`

Response 200:
```json
{ "success": true, "message": "Test endpoint working", "timestamp": "..." }
```

## Today Matches
GET `/v1/today`

Query params:
- `admin` (optional): `true|false`

Response 200:
```json
{
  "success": true,
  "matches": [
    {
      "id": "fd-123",
      "league": "Premier League",
      "home_team": "Arsenal",
      "away_team": "Chelsea",
      "kickoff_utc": "2025-01-01T12:00:00Z",
      "status": "PRE",
      "venue": "Emirates Stadium",
      "referee": null,
      "odds": null,
      "home_score": null,
      "away_score": null,
      "current_minute": null,
      "is_published": true,
      "analysis_status": "none",
      "created_at": "...",
      "home_team_logo": "...",
      "away_team_logo": "...",
      "league_logo": "..."
    }
  ],
  "total": 1,
  "source": "football-data-api|fallback",
  "spotlight_match": { }
}
```

Errors: 500 `{ success: false, error }`

## Match by ID
GET `/v1/match/{id}`

Response 200:
```json
{
  "success": true,
  "match": {
    "id": "...",
    "league": "...",
    "home_team": "...",
    "away_team": "...",
    "analysis": null
  }
}
```

Errors:
- 400 `{ error: "Match ID is required" }`
- 404 `{ error: "Match not found" }`
- 500 `{ error: "Internal server error" }`

## Match Stream (SSE)
GET `/v1/match/{id}/stream`

Headers: `Accept: text/event-stream`

Events:
- `connected`: `{}`
- `analysis`: `{ matchId, snapshotTs, status, aiInsights, stats }`

## Unsplash Search
GET `/v1/unsplash`

Query params:
- `query` (required)
- `count` (optional, default 10)
- `team` (optional)

Response 200:
```json
{
  "success": true,
  "images": [
    { "id": "...", "url": "...", "thumbnailUrl": "...", "description": "...", "photographer": "...", "team": "", "tags": ["..."] }
  ],
  "source": "unsplash-api|mock|mock-fallback|mock-error"
}
```

Errors: 400 `{ error: "Query parameter is required" }`

## Admin: Matches
GET `/v1/admin/matches`

Response 200:
```json
{ "success": true, "matches": [], "total": 0, "source": "real-api-for-admin" }
```

## Admin: Toggle Publish
POST `/v1/admin/toggle-publish`

Auth: Admin required (Bearer token) or dev-mode without header

Request body:
```json
{ "matchId": "string", "isPublished": true }
```

Responses:
- 200 `{ success: true, message, data: { matchId, isPublished } }`
- 400 `{ error }`
- 500 `{ error }`

## Sync Matches
POST `/v1/sync-matches`

Response 200:
```json
{ "success": true, "message": "Successfully synced N matches", "synced": 123, "matches": [{ "league": "...", "homeTeam": "...", "awayTeam": "...", "kickoff": "..." }] }
```

## Add Real Matches (Seed)
POST `/v1/add-real-matches`

Response 200:
```json
{ "success": true, "message": "Added N real matches from Football Data", "matches": [{ "league": "...", "homeTeam": "...", "awayTeam": "...", "kickoff": "...", "venue": "..." }] }
```

## Ingest Analysis (Internal)
POST `/v1/ingest/analysis`

Headers: `x-api-key: <INTERNAL_API_KEY>`

Body example:
```json
{ "matchId": "string", "snapshotTs": "2025-01-01T00:00:00Z", "status": "LIVE", "aiInsights": [], "stats": {} }
```

Responses:
- 200 `{ message: "Snapshot ingested successfully" }`
- 401 `{ message: "Unauthorized" }`
- 500 `{ error }`

## Cron: Autonomous Sync
GET `/cron/autonomous-sync`

Headers: `Authorization: Bearer <CRON_SECRET>` in production; optional in dev

Triggers `/api/v1/admin/autonomous-sync` (internal)

Responses:
- 200 `{ success, message, timestamp, stats }`
- 500 `{ success: false, error }`

## Payments

### Checkout
POST `/payments/checkout`

Body:
```json
{ "userId": "uuid", "email": "user@example.com" }
```

Responses:
- 200 `{ success: true, sessionId, url }`
- 400 `{ error: "User ID and email are required" }`
- 404 `{ error: "User not found" }`
- 503 `{ error: "Payment system is not configured" | "Database is not configured" }`
- 500 `{ error: "Failed to create checkout session" }`

### Webhook
POST `/payments/webhook`

Headers:
- `stripe-signature: <sig>`

Behavior:
- Verifies signature using `STRIPE_WEBHOOK_SECRET`
- Handles `checkout.session.completed`, `customer.subscription.deleted`, `invoice.payment_failed`

Responses:
- 200 `{ received: true }`
- 400 `{ error: "Missing signature or webhook secret" | "Invalid signature" }`
- 503 `{ error: "Payment system is not configured" }`
- 500 `{ error: "Webhook processing failed" }`