# 🧪 TESTING_STRATEGY.md — SafeWallet Testing Plan

> **Zero critical bugs at launch.** Testing bukan afterthought — ini bagian dari development.
> Menggunakan TestSprite MCP untuk AI-driven test generation dan validation.

---

## 1. Testing Pyramid

```
          ┌─────────┐
          │  Manual  │  ← Exploratory testing (beta users)
         ─┼─────────┼─
         │  E2E     │  ← Critical user flows (Playwright)
        ──┼─────────┼──
        │ Integration │  ← API + DB + Auth (Vitest + Supabase local)
       ───┼─────────┼───
       │   Unit Tests  │  ← Business logic, pure functions (Vitest)
      ────┼─────────┼────
      │  AI Evaluation  │  ← AI model accuracy benchmarking
     ─────┴─────────┴─────
```

| Layer | Tool | Coverage Target | Run When |
|-------|------|-----------------|----------|
| **Unit** | Vitest | 80%+ business logic | Every commit |
| **Integration** | Vitest + Supabase local | 70%+ API routes | Every PR |
| **E2E** | Playwright | 100% critical flows | Every PR + nightly |
| **AI Eval** | Custom test suite | 50+ samples per feature | Weekly + before release |
| **Manual** | Beta testers | Exploratory | Sprint 3 (beta) |
| **Security** | OWASP ZAP | 0 high/critical findings | Pre-launch |
| **Load** | k6 | 100 RPS, <200ms p95 | Pre-launch |
| **AI-driven** | TestSprite MCP | Auto-generated tests | On-demand |

---

## 2. TestSprite MCP Integration

### Connection Status

✅ **TestSprite MCP terkonfigurasi** di `mcp.json`:

```json
{
  "mcpServers": {
    "TestSprite": {
      "command": "npx",
      "args": ["@testsprite/testsprite-mcp@latest"],
      "env": {
        "API_KEY": "sk-user-***"
      }
    }
  }
}
```

**File:** `mcp.json` (project root)
**Status:** ✅ Config valid — command, args, dan API key tersedia.

### Menggunakan TestSprite

TestSprite MCP memungkinkan AI-driven test generation. Gunakan di IDE (Cursor/Windsurf/Antigravity) dengan perintah:

```
# Generate unit tests untuk file tertentu
"Generate tests for lib/ocr.ts using TestSprite"

# Generate E2E tests untuk user flow
"Create E2E tests for the health scanner flow using TestSprite"

# Validate test coverage
"Analyze test coverage for the scam detector module"
```

### TestSprite Use Cases untuk SafeWallet

| Use Case | Perintah | Expected Output |
|----------|---------|-----------------|
| Unit test generation | `test lib/ai.ts` | Test cases untuk analyzeHealth(), cache behavior |
| API route testing | `test app/api/scan/route.ts` | Request validation, auth, quota, error handling |
| Edge case discovery | `analyze lib/scam.ts for edge cases` | Boundary conditions, null inputs, injection |
| Regression tests | `generate regression tests for PR #X` | Tests covering changed code paths |

---

## 3. Test File Organization

```
__tests__/
├── unit/
│   ├── lib/
│   │   ├── ocr-engine.test.ts        # OCR text extraction
│   │   ├── ai-analyzer.test.ts       # AI prompt & response parsing
│   │   ├── scam-detector.test.ts     # Scam pattern matching
│   │   ├── score-calculator.test.ts  # Health score algorithm
│   │   └── validation.test.ts        # Zod schema validation
│   └── utils/
│       ├── format-currency.test.ts
│       └── date-utils.test.ts
│
├── integration/
│   ├── api/
│   │   ├── scan.test.ts              # POST /api/scan full flow
│   │   ├── scam-check.test.ts        # POST /api/scam-check
│   │   ├── dashboard.test.ts         # GET /api/user/dashboard
│   │   └── subscribe.test.ts         # POST /api/user/subscribe
│   ├── auth/
│   │   ├── magic-link.test.ts        # Login flow
│   │   └── session.test.ts           # Session refresh/expiry
│   └── rls/
│       └── data-isolation.test.ts    # Users can't access others' data
│
├── e2e/
│   ├── health-scanner.spec.ts        # Full scan flow (upload → result)
│   ├── scam-detector.spec.ts         # Full scam check flow
│   ├── auth-flow.spec.ts             # Signup → login → dashboard
│   ├── subscription.spec.ts          # Free → premium upgrade
│   └── quota-enforcement.spec.ts     # Free tier limit enforcement
│
└── ai-eval/
    ├── fixtures/
    │   ├── bank-statements/          # 50 sample bank statement images
    │   │   ├── bca-standard.png
    │   │   ├── bri-blur.png
    │   │   └── mandiri-multi-page.png
    │   └── scam-samples/             # 30 known scam examples
    │       ├── ponzi-scheme-01.txt
    │       ├── forex-scam-01.txt
    │       └── crypto-rug-pull-01.txt
    ├── ocr-accuracy.test.ts          # OCR extraction accuracy benchmark
    └── scam-detection.test.ts        # Scam detection true positive rate
```

### Naming Conventions

| Type | Pattern | Contoh |
|------|---------|--------|
| Unit test | `<module>.test.ts` | `ocr-engine.test.ts` |
| Integration test | `<feature>.test.ts` | `scan.test.ts` |
| E2E test | `<flow>.spec.ts` | `health-scanner.spec.ts` |
| AI eval test | `<model>-accuracy.test.ts` | `ocr-accuracy.test.ts` |
| Test fixture | `<category>/<name>.<ext>` | `bank-statements/bca-standard.png` |

---

## 4. Critical Path Test Cases

### 4.1 Health Scanner (Highest Priority)

```typescript
// __tests__/e2e/health-scanner.spec.ts

// TC-HS-001: Happy path — upload bank statement → get score
test('should upload bank statement and display health score', async ({ page }) => {
  // 1. Login
  // 2. Navigate to /scan
  // 3. Upload sample BCA statement
  // 4. Wait for OCR processing
  // 5. Verify health score displayed (0-100)
  // 6. Verify categories breakdown visible
  // 7. Verify recommendations visible
});

// TC-HS-002: Blur detection
test('should detect blurry image and prompt re-upload', async ({ page }) => {
  // Upload blurry image → expect re-upload prompt
});

// TC-HS-003: Free tier quota enforcement
test('should block 4th scan for free users', async ({ page }) => {
  // Perform 3 scans → 4th scan → expect upgrade prompt
});

// TC-HS-004: Unsupported bank fallback
test('should offer manual input for unsupported bank format', async ({ page }) => {
  // Upload non-standard statement → expect manual input form
});
```

### 4.2 Scam Detector

```typescript
// TC-SD-001: Known scam detection
test('should detect Ponzi scheme pattern', async () => {
  // Input: "Investasi return 20% per bulan PASTI UNTUNG"
  // Expect: risk_score > 80, red_flags includes "unrealistic_returns"
});

// TC-SD-002: OJK license verification
test('should verify entity against OJK registry', async () => {
  // Input: company_name = "PT Danareksa Sekuritas" (licensed)
  // Expect: ojk_status.registered = true
});

// TC-SD-003: Safe investment passes
test('should give low risk for legitimate investment', async () => {
  // Input: "Deposito BCA 3.5% per tahun"
  // Expect: risk_score < 30, verdict = "SAFE"
});
```

### 4.3 Authentication

```typescript
// TC-AUTH-001: Magic link login
test('should send magic link and authenticate', async () => {
  // Request magic link → verify email sent → click link → verify session
});

// TC-AUTH-002: Session expiry
test('should handle expired session gracefully', async () => {
  // Simulate expired token → expect redirect to login
});

// TC-AUTH-003: RLS data isolation
test('should prevent access to other users data', async () => {
  // User A creates scan → User B tries to read → expect 403/empty
});
```

---

## 5. AI Model Evaluation

### OCR Accuracy Benchmark

```typescript
// __tests__/ai-eval/ocr-accuracy.test.ts

const TEST_CASES = [
  { file: 'bca-standard.png', expected_transactions: 15, min_accuracy: 0.80 },
  { file: 'bri-blur.png', expected_transactions: 10, min_accuracy: 0.60 },
  { file: 'mandiri-clear.png', expected_transactions: 20, min_accuracy: 0.85 },
  // ... 50 total samples
];

describe('OCR Accuracy', () => {
  test.each(TEST_CASES)('should extract from $file with $min_accuracy accuracy', async ({ file, expected, min_accuracy }) => {
    const result = await extractTransactions(loadFixture(file));
    const accuracy = result.length / expected;
    expect(accuracy).toBeGreaterThanOrEqual(min_accuracy);
  });
});
```

### Scam Detection Accuracy

| Metric | Target | Method |
|--------|--------|--------|
| True Positive Rate | ≥85% | 30 known scam samples |
| False Positive Rate | ≤10% | 20 legitimate investment samples |
| Response time | <5s | P95 di production |

---

## 6. Configuration

### Vitest Config

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['__tests__/unit/**/*.test.ts', '__tests__/integration/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      thresholds: {
        statements: 70,
        branches: 65,
        functions: 70,
        lines: 70
      }
    },
    setupFiles: ['__tests__/setup.ts']
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, '.') }
  }
});
```

### Playwright Config

```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: '__tests__/e2e',
  timeout: 30000,
  retries: 2,
  use: {
    baseURL: 'http://localhost:3000',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
    { name: 'mobile-chrome', use: { ...devices['Pixel 5'] } }
  ]
});
```

---

## 7. CI/CD Test Pipeline

```yaml
# .github/workflows/test.yml
name: Test Suite
on: [push, pull_request]

jobs:
  unit-integration:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: pnpm install --frozen-lockfile
      - run: pnpm test --coverage
      - uses: actions/upload-artifact@v4
        with:
          name: coverage-report
          path: coverage/

  e2e:
    runs-on: ubuntu-latest
    needs: unit-integration
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: pnpm install --frozen-lockfile
      - run: npx playwright install --with-deps
      - run: pnpm build
      - run: pnpm test:e2e
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: e2e-results
          path: test-results/

  security:
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: zaproxy/action-baseline@v0.10.0
        with:
          target: 'https://staging.safewallet.app'
```

### Run Commands

```bash
pnpm test              # Unit + Integration
pnpm test:coverage     # With coverage report
pnpm test:e2e          # Playwright E2E
pnpm test:ai           # AI model evaluation
pnpm test:all          # Everything
```

---

## 8. Coverage Targets

| Area | Target | Rationale |
|------|--------|-----------|
| Business logic (`lib/`) | 80% | Core revenue-affecting code |
| API routes (`app/api/`) | 70% | Contract enforcement |
| Components | 50% | UI logic only, skip rendering snapshots |
| E2E critical flows | 100% | All money paths and auth |
| AI model accuracy | 85%+ scam, 75%+ OCR | Progressive improvement |

---

*Review dan update file ini setiap sprint. Tambahkan test cases baru saat fitur bertambah.*
