# Fix AV API Call Avalanche

## Root Cause
When Finnhub fundamentals (`/stock/metric`) returns 503 (known issue), the KPI route falls back to AV for **16 calls per 30s tick**:
- 8 `fetchFundamentals` × AV fallback = 8 calls
- 8 `fetchNews` × AV fallback = 8 calls (returns [])
- Total: 16 AV calls × 30s → all 4 keys × 25/day exhausted in ~3 minutes

## Fix 1: `app/api/kpis/route.ts`

Import Finnhub directly (skip orchestrator fallback to AV). Add 25s server cache.

```ts
import { fetchKpis } from '@/lib/providers/orchestrator';
import { fetchFundamentals as fhFundamentals, fetchNews as fhNews } from '@/lib/providers/finnhub';
import { SP500_TOP100 } from '@/lib/symbols/sp500-top100';
import { getCached, setCached } from '@/lib/cache';

const DEFAULTS = SP500_TOP100.slice(0, 8).map(s => s.sym);

function fmtMarketCap(n: number): string {
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}T`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(1)}B`;
  return `$${n.toFixed(0)}M`;
}

export async function GET() {
  const cached = getCached<any>('kpis', 'response');
  if (cached) return Response.json(cached);

  try {
    const [kpiData, fundamentalsResults, news] = await Promise.all([
      fetchKpis(),
      Promise.allSettled(DEFAULTS.map(s => fhFundamentals(s).catch(() => null))),
      fhNews(DEFAULTS).catch(() => [] as any[]),
    ]);

    let totalMarketCap = 0;
    for (const r of fundamentalsResults) {
      if (r.status === 'fulfilled' && r.value?.marketCap) totalMarketCap += r.value.marketCap;
    }

    const avgFear = news.length
      ? Math.round(news.reduce((s: number, n: any) => s + n.fearScore, 0) / news.length)
      : null;

    const body = {
      marketCap: totalMarketCap > 0 ? fmtMarketCap(totalMarketCap) : '—',
      sp500: kpiData.sp500,
      fearGreed: avgFear !== null ? `${100 - avgFear} / 100` : '—',
      vix: kpiData.vix,
      tenYearYield: kpiData.tenYearYield,
    };

    setCached('kpis', 'response', body, 25000);
    return Response.json(body);
  } catch {
    return Response.json({ error: 'Market KPI data unavailable — retrying every 30s' }, { status: 503 });
  }
}
```

**Changes:**
- Import `fetchFundamentals` + `fetchNews` from `finnhub.ts` directly (no AV fallback)
- `.catch(() => null)` on each symbol's fundamentals — silently skip failures
- `fhNews(DEFAULTS).catch(() => [])` — AV returns [] anyway, skip it
- `getCached`/`setCached` with 25s TTL on the response — prevents duplicate calls from rapid re-mounts

## Fix 2: `app/api/market/status/route.ts`

Replace direct AV `GLOBAL_QUOTE` call with orchestrator's `fetchQuote` (uses key rotation). Or just skip AV check entirely (AV's status is known — always limited).

**Replace entire file:**

```ts
import { fetchQuote } from '@/lib/providers/orchestrator';

export async function GET() {
  const checkFinnhub = async (): Promise<boolean> => {
    try {
      const res = await fetch(
        `https://finnhub.io/api/v1/quote?symbol=AAPL&token=${process.env.FINNHUB_API_KEY}`,
        { signal: AbortSignal.timeout(5000) }
      );
      return res.ok;
    } catch { return false; }
  };

  try {
    if (await checkFinnhub()) return Response.json({ online: true, source: 'finnhub' });
  } catch {}

  return Response.json({ online: false, source: null });
}
```

**Changes:**
- Removed `checkAV()` entirely — AV health check is not useful and wastes calls
- Only checks Finnhub

## Fix 3: `lib/providers/orchestrator.ts`

Remove the AV fallback from `fetchNews` — AV's `fetchNews` returns `[]` anyway, so the fallback is a pointless call.

```ts
export async function fetchNews(symbols: string[]): Promise<NormalizedNewsItem[]> {
  return fhNews(symbols);
}
```

Also remove `fetchNews as avNews` from the AV import:

```ts
import {
  fetchQuote as avQuote, fetchCandles as avCandles,
  fetchFundamentals as avFundamentals,
  fetchIndicators as avIndicators,
} from './alpha-vantage';
```

## Fix 4: `lib/providers/alpha-vantage.ts`

Add console.warn logging to `fetchJson` to detect every AV call:

Add after the rate-limit check, before `return data`:

```ts
console.warn('[AV] fetchJson:', params.function, params.symbol || params.Symbol || '(no symbol)', `keyIndex=${keyIndex}`);
```

Or add at the very start of `fetchJson` before any logic:

```ts
console.warn('[AV]', params.function, params.symbol || '', `key=${keyIndex}/${keys.length-1}`);
```

## Verification

1. `npm run build` — must pass
2. Start dev server
3. Load dashboard → check server logs for `[AV]` messages — should be zero
4. If Finnhub fundamentals is down, KPI should show "—" for market cap instead of cascading to AV
