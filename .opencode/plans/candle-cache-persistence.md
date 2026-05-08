# Candle Cache Persistence Plan

## Goal
Persist historical candle data on disk so 75 AV API calls = 75 symbols (or more with cache reuse). Survives server restarts.

## Changes

### 1. Create `lib/candle-cache.ts`

File-based cache at `<cwd>/data/candles/{SYM}.json`. 24h TTL. Contents:

```ts
import fs from 'fs';
import path from 'path';

const CACHE_DIR = path.join(process.cwd(), 'data', 'candles');
const TTL = 24 * 60 * 60 * 1000;

interface CandleEntry {
  date: string; open: number; high: number; low: number; close: number; volume: number;
}
interface CandleCacheFile {
  symbol: string; fetchedAt: number; data: CandleEntry[];
}

function ensureDir(): void {
  if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });
}
function filePath(symbol: string): string {
  return path.join(CACHE_DIR, `${symbol.toUpperCase()}.json`);
}

export function getCachedCandles(symbol: string): CandleEntry[] | null {
  try {
    const fp = filePath(symbol);
    if (!fs.existsSync(fp)) return null;
    const raw = fs.readFileSync(fp, 'utf-8');
    const entry: CandleCacheFile = JSON.parse(raw);
    if (Date.now() - entry.fetchedAt > TTL) { fs.unlinkSync(fp); return null; }
    return entry.data;
  } catch { return null; }
}

export function setCachedCandles(symbol: string, data: CandleEntry[]): void {
  try {
    ensureDir();
    const entry: CandleCacheFile = { symbol: symbol.toUpperCase(), fetchedAt: Date.now(), data };
    fs.writeFileSync(filePath(symbol), JSON.stringify(entry), 'utf-8');
  } catch (e) { console.error('Failed to write candle cache:', e); }
}
```

### 2. Update `app/api/market/candles/route.ts`

Insert file cache (L2) between in-memory (L1) and AV API (L3):

```ts
import { NextRequest } from 'next/server';
import { fetchCandles } from '@/lib/providers/orchestrator';
import { getCached, setCached } from '@/lib/cache';
import { getCachedCandles, setCachedCandles } from '@/lib/candle-cache';

export async function GET(request: NextRequest) {
  const symbol = request.nextUrl.searchParams.get('symbol') || 'AAPL';

  // L1: in-memory (fast, same session)
  const cached = getCached<any[]>('candles', symbol);
  if (cached) return Response.json(cached);

  // L2: file cache (persists across restarts, 24h TTL)
  const fileCached = getCachedCandles(symbol);
  if (fileCached) {
    setCached('candles', symbol, fileCached, 300000);
    return Response.json(fileCached);
  }

  // L3: AV API (1 call per symbol per day)
  try {
    const data = await fetchCandles(symbol, 'D', 100);
    if (data.length) {
      setCached('candles', symbol, data, 300000);
      setCachedCandles(symbol, data);
      return Response.json(data);
    }
    return Response.json({ error: 'Candle data unavailable' }, { status: 503 });
  } catch (e: any) {
    if (e?.status === 429) {
      return Response.json({ error: 'API rate limit reached — candle data will refresh when limits reset' }, { status: 503 });
    }
    return Response.json({ error: 'Candle data unavailable' }, { status: 503 });
  }
}
```

### 3. Update `.gitignore`

Add line at end:
```
data/
```

## Verification
- `npm run build` — should pass
- Hit `/api/market/candles?symbol=AAPL` once with valid AV key → creates `data/candles/AAPL.json`
- Restart dev server, hit same endpoint → serves from file (no API call)
- Wait 24h or modify timestamp → re-fetches from API
