# Football-Data.org API Reference

**Base URL**: `https://api.football-data.org/v4/`
**Auth**: `X-Auth-Token` header
**Rate Limits**: 
- Free tier: 10 requests/minute
- Date format: `YYYY-MM-DD`

## Key Endpoints

### Competitions
- `GET /competitions` - List all competitions
- `GET /competitions/{id}/matches` - Get matches for competition

### Matches
- `GET /matches` - All matches for current day
- `GET /competitions/{id}/matches?dateFrom=YYYY-MM-DD&dateTo=YYYY-MM-DD`

## Competition Codes
- **PL** - Premier League (England)
- **PD** - Primera Division (Spain) 
- **BL1** - Bundesliga (Germany)
- **SA** - Serie A (Italy)
- **FL1** - Ligue 1 (France)
- **CL** - Champions League
- **EL** - Europa League

## Filters
- `dateFrom` & `dateTo` - Date range (YYYY-MM-DD)
- `status` - SCHEDULED, LIVE, IN_PLAY, FINISHED, etc.
- `matchday` - Specific matchday number

## Example Request
```
GET https://api.football-data.org/v4/competitions/PL/matches?dateFrom=2025-09-02&dateTo=2025-09-09
X-Auth-Token: YOUR_TOKEN
```

## Current System Date
Today: **September 2, 2025**