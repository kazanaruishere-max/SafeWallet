# SafeWallet Design Document v1.0

## Architecture Overview

```
┌─────────────┐
│ PWA Client  │ Next.js 15, Socket.io-client
└──────┬──────┘
       │ HTTPS
┌──────▼──────────────────────────────────┐
│ Edge API (Hono.js, Cloudflare Workers)  │
│ - /api/scan, /api/check-scam            │
│ - Rate limit: 100 req/min               │
└──────┬──────────────────────────────────┘
       │
   ┌───┴───┬──────────┬──────────────┐
   ▼       ▼          ▼              ▼
┌─────┐ ┌────┐  ┌─────────┐   ┌──────────┐
│ OCR │ │ AI │  │ OJK API │   │WhatsApp  │
│Tess │ │Cla │  │Registry │   │Business  │
│erac │ │ude │  └─────────┘   └──────────┘
│t.js │ │3.5 │
└─────┘ └────┘
       │
   ┌───┴────┬──────────┐
   ▼        ▼          ▼
┌──────┐ ┌─────┐  ┌────────┐
│Supa  │ │Redis│  │BullMQ  │
│base  │ │Cache│  │Queue   │
└──────┘ └─────┘  └────────┘
```

**Design Principles:**
1. Edge-first (Cloudflare global <50ms latency)
2. Async-heavy (OCR/AI via BullMQ, don't block)
3. Cache-aggressive (Redis 60% hit rate target)
4. Mobile-first (90% users on mobile)

## Core Components

### 1. OCR Engine
```typescript
// lib/ocr.ts
import Tesseract from 'tesseract.js';

export async function extractTransactions(imageFile: File) {
  const { data: { text } } = await Tesseract.recognize(
    imageFile, 
    'eng+ind',
    { logger: m => console.log(m) }
  );
  
  return parseTransactions(text); // Regex patterns for ID banks
}

function parseTransactions(text: string) {
  const pattern = /(\d{2}\/\d{2})\s+(.+?)\s+([\d,]+)/;
  return text.split('\n')
    .map(line => line.match(pattern))
    .filter(Boolean)
    .map(m => ({
      date: m[1],
      merchant: m[2],
      amount: parseFloat(m[3].replace(/,/g, ''))
    }));
}
```

### 2. AI Analyzer
```typescript
// lib/ai.ts
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1'
});

export async function analyzeHealth(txns: Txn[], income: number) {
  const cacheKey = `analysis:${hash(txns)}`;
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);
  
  const prompt = `
Income: Rp ${income}
Spending (30d): ${JSON.stringify(txns)}
Return JSON: { healthScore: 0-100, insights: [], recommendations: [] }
  `.trim();
  
  const result = await client.messages.create({
    model: 'anthropic/claude-sonnet-4-20250514',
    max_tokens: 1500,
    messages: [{ role: 'user', content: prompt }]
  });
  
  const analysis = JSON.parse(result.content[0].text);
  await redis.setex(cacheKey, 3600, JSON.stringify(analysis));
  return analysis;
}
```

### 3. Scam Detector
```typescript
// lib/scam.ts
export async function detectScam(input: {
  text: string;
  url?: string;
  company?: string;
}) {
  const redFlags = [];
  
  // Check 1: Unrealistic returns
  const returnMatch = input.text.match(/(\d+)%.*bulan/i);
  if (returnMatch && parseInt(returnMatch[1]) > 5) {
    redFlags.push({
      type: 'unrealistic_returns',
      severity: 'critical',
      found: `${returnMatch[1]}% per month = ${returnMatch[1] * 12}% per year`
    });
  }
  
  // Check 2: OJK license
  if (input.company) {
    const licensed = await checkOJK(input.company);
    if (!licensed) {
      redFlags.push({
        type: 'unlicensed',
        severity: 'critical'
      });
    }
  }
  
  // Check 3: Domain age (if URL provided)
  if (input.url) {
    const age = await getDomainAge(input.url);
    if (age < 90) {
      redFlags.push({
        type: 'new_domain',
        severity: 'high',
        found: `${age} days old`
      });
    }
  }
  
  const riskScore = calculateRisk(redFlags);
  return { riskScore, redFlags, verdict: riskScore > 70 ? 'JANGAN' : 'HATI-HATI' };
}
```

### 4. WhatsApp Bot
```typescript
// lib/whatsapp.ts
import { Queue } from 'bullmq';

const queue = new Queue('whatsapp', { connection: redis });

export async function scheduleDailyMessages() {
  queue.add(
    'daily-budget',
    {},
    { 
      repeat: { 
        pattern: '0 7 * * *',  // 7 AM Jakarta
        tz: 'Asia/Jakarta' 
      } 
    }
  );
}

// Worker
queue.process(async (job) => {
  const users = await getActiveUsers();
  for (const user of users) {
    const budget = await calcDailyBudget(user);
    await sendWhatsApp(user.phone, `
☀️ Pagi ${user.name}!
Budget: Rp ${budget.toLocaleString('id-ID')}
💡 ${getDailyTip(user)}
    `.trim());
  }
});
```

## Database Schema
```sql
-- Supabase PostgreSQL
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(20),
  monthly_income BIGINT,
  plan VARCHAR(20) DEFAULT 'free',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE scans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  image_url TEXT,
  ocr_text TEXT,
  health_score INT,
  insights JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_scans_user ON scans(user_id, created_at DESC);

CREATE TABLE scam_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  input_text TEXT,
  risk_score INT,
  red_flags JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## API Routes
```typescript
// app/api/scan/route.ts
export async function POST(req: Request) {
  const { imageBase64 } = await req.json();
  const user = await authenticate(req);
  
  // Check quota
  const scansThisMonth = await countScans(user.id);
  if (user.plan === 'free' && scansThisMonth >= 3) {
    return Response.json({ error: 'Quota exceeded' }, { status: 429 });
  }
  
  // Enqueue job (async processing)
  const jobId = await queue.add('process-scan', {
    userId: user.id,
    imageBase64
  });
  
  return Response.json({ jobId, status: 'processing' });
}

// app/api/scan/[jobId]/route.ts
export async function GET(req: Request, { params }) {
  const job = await queue.getJob(params.jobId);
  if (!job) return Response.json({ error: 'Not found' }, { status: 404 });
  
  if (job.isCompleted()) {
    return Response.json(job.returnvalue);
  }
  
  return Response.json({ status: 'processing' });
}
```

## WebSocket Events
```typescript
// Real-time updates for async jobs
io.on('connection', (socket) => {
  socket.on('subscribe:job', (jobId) => {
    queue.on('completed', (completedJob) => {
      if (completedJob.id === jobId) {
        socket.emit('job:completed', completedJob.returnvalue);
      }
    });
  });
});
```

## Caching Strategy
```typescript
// lib/cache.ts
const CACHE_KEYS = {
  analysis: (hash) => `analysis:${hash}`,
  scam: (hash) => `scam:${hash}`,
  user: (id) => `user:${id}`
};

const CACHE_TTL = {
  analysis: 3600,  // 1 hour
  scam: 86400,     // 24 hours
  user: 300        // 5 minutes
};

export async function cacheGet(key: string) {
  const cached = await redis.get(key);
  return cached ? JSON.parse(cached) : null;
}

export async function cacheSet(key: string, value: any, ttl: number) {
  await redis.setex(key, ttl, JSON.stringify(value));
}
```

## Error Handling
```typescript
// middleware/error.ts
export function errorHandler(err, req, res, next) {
  console.error(err);
  await sentry.captureException(err);
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: err.message });
  }
  
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  return res.status(500).json({ error: 'Internal server error' });
}
```

## Performance Targets
| Metric | Target | Measure |
|--------|--------|---------|
| API latency | <100ms | p95 |
| OCR processing | <3s | p95 |
| AI analysis | <5s | p95 |
| Page load | <2s | Lighthouse |
| Cache hit rate | >60% | Redis stats |

## Security
- TLS 1.3 only
- Secrets encrypted at rest (AES-256)
- Rate limiting (100 req/min per IP)
- Input validation (Zod schemas)
- SQL injection prevention (parameterized queries)
- XSS prevention (sanitize outputs)

## Monitoring
```typescript
// lib/monitoring.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0.1,
  beforeSend(event) {
    // Scrub sensitive data
    if (event.request?.data) {
      delete event.request.data.phoneNumber;
      delete event.request.data.income;
    }
    return event;
  }
});
```

## Deployment
```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm test
      - run: npm run build
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-args: '--prod'
```

## Scalability Plan
**0-1k users:** Current architecture (free tiers)  
**1k-10k users:** Upgrade Supabase ($25/mo), Upstash ($10/mo)  
**10k-100k users:** Add read replicas, CDN caching, horizontal scaling  
**100k+ users:** Migrate to dedicated infra, implement sharding

## Token Optimization Notes
This doc uses:
- Inline code (not separate files)
- Concise explanations (no verbose prose)
- Essential diagrams only (ASCII, not image)
- Collapsed implementation details
- Minimal repetition

**Estimated token savings:** 70% vs. standard design doc  
**Antigravity IDE compatibility:** ✅ Optimized for Claude Sonnet/Opus 4.6
