# PromptBattle API

Backend API for PromptBattle - a web app where users compare AI prompts in head-to-head battles.

## Quick Start

### Prerequisites
- Node.js 18+
- Vercel account
- Google Gemini API key ([Get one here](https://ai.google.dev/))

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Add your Gemini API key to .env.local
# GEMINI_API_KEY=your_actual_key_here

# Run locally
npm run dev

# Deploy to Vercel
npm run deploy
```

### Local Development

The API will be available at: `http://localhost:3000/api`

Test endpoints:
```bash
# Create a battle
curl -X POST http://localhost:3000/api/battles \
  -H "Content-Type: application/json" \
  -d '{
    "promptA": "Write a haiku about programming",
    "promptB": "Write a short poem about coding",
    "topic": "Programming Poetry"
  }'

# List battles
curl http://localhost:3000/api/battles?limit=10&sortBy=recent

# Get specific battle
curl http://localhost:3000/api/battles/{battleId}

# Vote on a battle
curl -X POST http://localhost:3000/api/battles/{battleId}/vote \
  -H "Content-Type: application/json" \
  -d '{"vote": "A"}'
```

## API Documentation

Full API documentation is available in [BACKEND_ARCHITECTURE.md](./BACKEND_ARCHITECTURE.md).

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/battles` | Create a new battle |
| GET | `/api/battles` | List battles (with filtering/sorting) |
| GET | `/api/battles/[id]` | Get specific battle details |
| POST | `/api/battles/[id]/vote` | Cast a vote on a battle |

### Example Response

```json
{
  "battleId": "550e8400-e29b-41d4-a716-446655440000",
  "promptA": "Write a haiku about programming",
  "promptB": "Write a short poem about coding",
  "responseA": "Lines of code align\nBugs emerge from midnight work\nCoffee fuels the fix",
  "responseB": "In the digital realm we create\nLogic and loops that never wait...",
  "topic": "Programming Poetry",
  "votes": { "A": 5, "B": 3, "tie": 1 },
  "createdAt": "2026-01-19T10:30:00.000Z",
  "status": "completed"
}
```

## Architecture

### Tech Stack
- **Runtime**: Node.js 18+ (Vercel Serverless Functions)
- **Language**: TypeScript
- **AI Provider**: Google Gemini 1.5 Flash
- **Validation**: Zod
- **Storage**: In-memory (Map) - suitable for demo

### File Structure
```
promptbattle/
├── api/
│   ├── battles/
│   │   ├── index.ts              # POST/GET /api/battles
│   │   └── [id]/
│   │       ├── index.ts          # GET /api/battles/[id]
│   │       └── vote.ts           # POST /api/battles/[id]/vote
│   └── _lib/
│       ├── types.ts              # TypeScript interfaces
│       ├── storage.ts            # In-memory storage
│       ├── gemini.ts             # Gemini API service
│       ├── validation.ts         # Input validation
│       ├── rateLimit.ts          # Rate limiting
│       └── errors.ts             # Error handling
├── vercel.json                   # Vercel config
├── package.json
├── tsconfig.json
└── .env.example
```

### Key Features

✅ **Parallel AI Generation** - Both prompts processed simultaneously for 2x faster responses  
✅ **Rate Limiting** - Prevents abuse (5 battles/min, 10 votes/min per IP)  
✅ **Input Validation** - Zod schemas with custom validation rules  
✅ **Error Handling** - Comprehensive error types with retry logic  
✅ **CORS Support** - Configurable cross-origin access  
✅ **Type Safety** - Full TypeScript coverage  

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GEMINI_API_KEY` | ✅ Yes | Google Gemini API key |
| `NODE_ENV` | No | `development` or `production` |
| `ALLOWED_ORIGIN` | No | CORS allowed origin (default: `*`) |

## Rate Limits

| Endpoint | Limit |
|----------|-------|
| POST /api/battles | 5 requests per minute per IP |
| POST /api/battles/[id]/vote | 10 requests per minute per IP |
| GET /api/battles | 30 requests per minute per IP |
| GET /api/battles/[id] | 60 requests per minute per IP |

## Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `VALIDATION_ERROR` | 400 | Invalid input data |
| `INVALID_VOTE` | 400 | Vote must be A, B, or tie |
| `BATTLE_NOT_FOUND` | 404 | Battle doesn't exist |
| `ALREADY_VOTED` | 409 | User already voted |
| `GEMINI_SAFETY` | 422 | Content blocked by safety filters |
| `RATE_LIMIT` | 429 | Too many requests |
| `GEMINI_ERROR` | 500 | Gemini API failure |
| `INTERNAL_ERROR` | 500 | Unexpected error |

## Scaling Considerations

### Current Limitations (In-Memory Storage)
- ⚠️ **Data loss on redeploy** - All battles lost when redeployed
- ⚠️ **No persistence** - Data doesn't survive crashes
- ⚠️ **Memory limits** - ~1000 battles max (LRU eviction)
- ⚠️ **No distribution** - Single instance only

### Migration Path

**Phase 1: Add Redis** (when you need persistence)
- Replace Map with Vercel KV (Redis)
- No API changes needed
- Cost: ~$10/month

**Phase 2: Add Database** (when you need analytics)
- Move to PostgreSQL (Vercel Postgres/Supabase)
- Enable user accounts, analytics
- Cost: ~$25/month

**Phase 3: Add Caching** (when you have high traffic)
- Cache popular battles in Redis
- Cache leaderboard for 30s
- Reduce DB load by 80%

## Development

### Type Checking
```bash
npm run type-check
```

### Linting
```bash
npm run lint
```

### Build
```bash
npm run build
```

## Deployment

### Deploy to Vercel

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Link project:
```bash
vercel link
```

3. Add environment variable:
```bash
vercel env add GEMINI_API_KEY
```

4. Deploy:
```bash
vercel --prod
```

### Environment Variables in Vercel

Go to your project settings → Environment Variables and add:
- `GEMINI_API_KEY`: Your Google Gemini API key
- `NODE_ENV`: `production`
- `ALLOWED_ORIGIN`: Your frontend URL (e.g., `https://promptbattle.vercel.app`)

## Security

- ✅ Input validation with Zod
- ✅ Rate limiting per IP
- ✅ CORS configuration
- ✅ Content safety checks
- ✅ SQL injection prevention (N/A - no SQL)
- ✅ XSS prevention (HTML sanitization)

## Monitoring

Check Vercel logs for:
- Request/response logs (structured JSON)
- Error logs with stack traces
- Gemini API usage
- Rate limit hits

## Support

For detailed architecture documentation, see [BACKEND_ARCHITECTURE.md](./BACKEND_ARCHITECTURE.md).

## License

MIT
