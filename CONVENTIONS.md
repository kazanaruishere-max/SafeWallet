# 📏 CONVENTIONS.md — SafeWallet Code Style & Patterns

> Konsistensi > kreativitas. Ikuti konvensi ini agar codebase tetap maintainable.
> Berlaku untuk semua human developer dan AI coding assistant.

---

## 1. Naming Conventions

### Files & Folders
| Jenis | Format | Contoh |
|-------|--------|--------|
| React Component | `kebab-case.tsx` | `health-scanner.tsx` |
| Utility/lib | `kebab-case.ts` | `ocr-engine.ts` |
| Hook | `use-<name>.ts` | `use-scan.ts` |
| Store (Zustand) | `<name>-store.ts` | `auth-store.ts` |
| Type definitions | `<domain>.ts` | `api.ts`, `database.ts` |
| API route | `route.ts` (Next.js convention) | `app/api/scan/route.ts` |
| Test file | `<name>.test.ts` | `ocr-engine.test.ts` |
| E2E test | `<name>.spec.ts` | `health-scanner.spec.ts` |
| ADR | `NNN-<title>.md` | `001-next-js.md` |

### Variables & Functions
| Jenis | Format | Contoh |
|-------|--------|--------|
| Variable | `camelCase` | `healthScore`, `scanResult` |
| Function | `camelCase` | `analyzeHealth()`, `detectScam()` |
| Constant | `UPPER_SNAKE_CASE` | `MAX_FILE_SIZE`, `CACHE_TTL` |
| Component | `PascalCase` | `HealthScanner`, `ScamDetector` |
| Type/Interface | `PascalCase` | `ScanResult`, `UserProfile` |
| Enum value | `UPPER_SNAKE_CASE` | `BadgeType.FIRST_SCAN` |
| Database column | `snake_case` | `health_score`, `created_at` |
| API endpoint | `kebab-case` | `/api/scam-check` |
| Event name | `kebab-case` | `scan-completed` |

---

## 2. TypeScript Patterns

### Use `type` over `interface` (unless extending)
```typescript
// ✅ DO — type for data shapes
type ScanResult = {
  scan_id: string;
  health_score: number;
  categories: Record<string, number>;
};

// ✅ DO — interface for extension
interface BaseEntity {
  id: string;
  created_at: string;
}

interface Scan extends BaseEntity {
  health_score: number;
}

// ❌ DON'T — interface for simple types
interface ScanResult { ... }  // Use type instead
```

### Error Handling
```typescript
// ✅ DO — structured error handling in API routes
export async function POST(req: Request) {
  try {
    const body = scanSchema.safeParse(await req.json());
    if (!body.success) {
      return Response.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: body.error.message } },
        { status: 400 }
      );
    }
    // ... logic
  } catch (error) {
    console.error('[scan] Error:', error);
    Sentry.captureException(error);
    return Response.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Terjadi kesalahan' } },
      { status: 500 }
    );
  }
}

// ❌ DON'T — unhandled promises, generic catches
const data = await fetch(url);  // No try/catch!
```

### Null Handling
```typescript
// ✅ DO — explicit null checks
const user = await getUser(id);
if (!user) return notFound();

// ✅ DO — optional chaining with fallback
const score = scan?.health_score ?? 0;

// ❌ DON'T — non-null assertion
const score = scan!.health_score;  // Dangerous
```

---

## 3. React Component Patterns

### Component Structure
```typescript
// components/features/health-scanner/score-card.tsx

// 1. Imports (external → internal → types)
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import type { ScanResult } from '@/types/api';

// 2. Types (component-specific)
type ScoreCardProps = {
  result: ScanResult;
  onRetry?: () => void;
};

// 3. Component (named export, not default)
export function ScoreCard({ result, onRetry }: ScoreCardProps) {
  // 3a. Hooks first
  const [isExpanded, setIsExpanded] = useState(false);

  // 3b. Derived state
  const isGoodScore = result.health_score >= 70;

  // 3c. Handlers
  const handleToggle = () => setIsExpanded(prev => !prev);

  // 3d. Render
  return (
    <Card>
      <CardContent>
        <span>{result.health_score}</span>
      </CardContent>
    </Card>
  );
}
```

### Rules
- **Named exports** — `export function Component`, bukan `export default`
- **One component per file** — kecuali sub-components yang hanya dipakai di file itu
- **Co-locate** — styles, tests, types di folder yang sama jika hanya dipakai di situ
- **No prop drilling >2 levels** — gunakan Zustand store atau React Context

---

## 4. API Route Patterns

### Standard API Route
```typescript
// app/api/scan/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { scanSchema } from '@/lib/validation';
import { rateLimitMiddleware } from '@/middleware/rate-limit';

export async function POST(req: Request) {
  // 1. Auth
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return unauthorized();

  // 2. Rate limit
  const rateLimited = await rateLimitMiddleware(req, user.id);
  if (rateLimited) return rateLimited;

  // 3. Validate
  const body = scanSchema.safeParse(await req.json());
  if (!body.success) return validationError(body.error);

  // 4. Business logic
  const result = await processLogic(body.data);

  // 5. Response
  return Response.json({ success: true, data: result });
}
```

**Order:** Auth → Rate Limit → Validate → Logic → Response

---

## 5. Git Conventions

### Branch Naming
```
feat/<task>      → Fitur baru (feat/health-scanner)
fix/<issue>      → Bug fix (fix/ocr-blur-detection)
chore/<task>     → Maintenance (chore/update-deps)
hotfix/<issue>   → Emergency fix (hotfix/auth-bypass)
docs/<topic>     → Documentation (docs/api-spec)
```

### Commit Messages (Conventional Commits)
```
<type>(<scope>): <description>

feat(scanner): add bank statement OCR processing
fix(auth): resolve magic link expiry issue
chore(deps): bump next.js to 15.1.1
docs(api): update scam-check response schema
test(scanner): add unit tests for score calculation
perf(cache): implement Redis response caching
refactor(scam): extract OJK check into separate module
```

**Types:** `feat`, `fix`, `chore`, `docs`, `test`, `perf`, `refactor`, `ci`
**Scope:** `scanner`, `scam`, `auth`, `dashboard`, `whatsapp`, `payment`, `deps`, `api`, `cache`

### PR Template
```markdown
## What does this PR do?
<!-- Jelaskan perubahan -->

## Related task
<!-- Link ke MASTER_PLAN.md task # -->

## Checklist
- [ ] Tests pass (`pnpm test`)
- [ ] Security guidelines checked
- [ ] API contract unchanged (or API_SPECIFICATION.md updated)
- [ ] No secrets in code
- [ ] MASTER_PLAN.md updated (task status)
```

---

## 6. Database Conventions

| Rule | Contoh |
|------|--------|
| Table: plural `snake_case` | `users`, `scam_checks` |
| Column: singular `snake_case` | `health_score`, `created_at` |
| Primary key: always `id UUID` | `id UUID PRIMARY KEY DEFAULT gen_random_uuid()` |
| Foreign key: `<table>_id` | `user_id UUID REFERENCES users(id)` |
| Timestamps: always include | `created_at`, `updated_at` |
| Soft delete: no (hard delete + audit log) | `ON DELETE CASCADE` |
| JSONB: for flexible data | `categories JSONB`, `red_flags JSONB` |
| Index: frequent query columns | `CREATE INDEX idx_scans_user ON scans(user_id)` |

---

## 7. Comment & Documentation Style

```typescript
// ✅ DO — Explain WHY, not WHAT
// Cache AI response karena prompt yang sama sering diulang user (60% hit rate)
await redis.setex(cacheKey, 3600, JSON.stringify(result));

// ❌ DON'T — Obvious comments
// Set cache with 1 hour TTL
await redis.setex(cacheKey, 3600, JSON.stringify(result));

// ✅ DO — JSDoc for exported functions
/**
 * Analyze bank statement transactions and generate health score.
 * Uses Claude 3.5 via OpenRouter with structured JSON output.
 *
 * @param transactions - Parsed OCR transactions
 * @param income - Monthly income for ratio calculations
 * @returns Health score (0-100) + categorized insights
 */
export async function analyzeHealth(transactions: Transaction[], income: number): Promise<ScanResult> {
```

**Language rule:** Code in English, comments in Indonesian (untuk menjelaskan konteks bisnis Indonesia).

---

*Jika ada konvensi baru, tambahkan di sini dan announce ke tim.*
