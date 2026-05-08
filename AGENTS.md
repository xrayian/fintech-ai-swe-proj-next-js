<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# NEXUS Dashboard — Agent Instructions

## Stack
- **Next.js 16.2.4** (App Router), **React 19.2.4**, **TypeScript 5**, **Tailwind CSS 4**
- **Recharts** (charts), **lucide-react** (icons)
- **vitest** (unit tests in `lib/__tests__/`)

## Commands
```sh
npm run dev      # dev server on :3000
npm run build    # production build (typechecks included)
npm run start    # start production build
npm run lint     # eslint (config in eslint.config.mjs)
npm test         # vitest run
```

## Architecture
- **Root `/`** redirects to `/dashboard`
- **`app/layout.tsx`** is `'use client'` — the entire app is client-rendered
- Routes: `/dashboard`, `/technical`, `/copilot`, `/compare`, `/news`, `/settings`, `/notifications`, `/search`
- Path alias `@/*` → `./*` (e.g. `import { U } from '@/lib/constants'`)
- All market data flows through server-side API routes (`/api/*`) — no client-side direct API calls
- `searchParams` in page components are `Promise` in Next.js 16 — must be awaited

## Project structure
```
app/                    # App Router pages (one page.tsx per route)
  api/                  # Next.js Route Handlers (server-side API proxies)
    market/
      candles/route.ts  # AV-only, 3-layer cache (L1 memory → L2 file → L3 API)
      indicators/route.ts
      quote/route.ts    # Finnhub primary, AV fallback, 100-symbol default
      sectors/route.ts  # ETF-based sector performance
      status/route.ts   # Finnhub-only market status
    symbols/route.ts    # Finnhub search + static JSON fallback (518 entries)
    fundamentals/route.ts  # Finnhub → AV → Roic AI fallback chain
    kpis/route.ts       # Finnhub-only KPIs + composite fear/greed
    news/route.ts       # Finnhub-only news
    copilot/route.ts    # Gemini streaming with buildContext for fundamentals
    cache/route.ts      # DELETE endpoint to clear file-based candle cache
    settings/route.ts   # Shows all API key statuses
components/
  layout/               # App shell (sidebar, ticker-tape, etc.)
  shared/               # ErrorMessage, toast-provider
  dashboard/            # Dashboard page components (sector-heatmap, etc.)
  technical/            # Technical analysis page
  compare/              # Stock comparison page
  ai/                   # Copilot page (ai-copilot, score-card)
hooks/
  use-live-tickers.ts   # Round-robin 5 symbols/10s via Finnhub
  use-watchlist.ts      # localStorage watchlist, defaults to SP500_TOP100
  use-market-status.ts  # Polls /api/market/status every 30s
lib/
  providers/
    finnhub.ts          # Finnhub API client (2-key rotation, 60 calls/min)
    alpha-vantage.ts    # Alpha Vantage client (4-key rotation, 25 calls/day each)
    roic-ai.ts          # Roic AI client (free, no key, ROE/margin/DE only)
    orchestrator.ts     # Per-endpoint fallback/merge logic
    types.ts            # Normalized data interfaces
  symbols/
    sp500-top100.ts     # Static list of 100 S&P 500 entries
    stock-symbols.json  # Bundled 518-entry search DB
  sectors.ts            # Sector ETF performance (11 SPDR ETFs via Finnhub)
  cache.ts              # In-memory L1 cache (25s-5min TTLs)
  candle-cache.ts       # File-based persistence at data/candles/{SYM}.json, 24h TTL
  constants.ts          # Design tokens (U), TICKERS, SCORECARD (8 static), fmt()
  scorecard-utils.ts    # computeScorecard: NormalizedFundamentals → ScorecardData
  copilot-context.ts    # buildContext for Gemini: fundamentals + quotes + news + sectors
  design.md             # Visual design system documentation
  __tests__/            # vitest unit tests
```

## Provider architecture

### Fundamentals data flow (orchestrator.ts:fetchFundamentals)
1. **Finnhub** (`/stock/metric?metric=all`) — primary, most reliable. All FIELDS are PERCENTAGES needing `/100`
2. **Roic AI** (api.roic.ai, no key) — fills ROE/margin/DE gaps when Finnhub returns zeros
3. **Alpha Vantage** (`OVERVIEW`) — only when Finnhub returns null entirely (preserves 25/day budget)
4. **SCORECARD** (component-level fallback) — hardcoded data for original 8 symbols only

### Critical: Finnhub `/stock/metric` field name mapping
The API returns these field names (NOT the obvious camelCase names):
```typescript
// CORRECT mappings (actual Finnhub API response keys):
peRatio:          m.peBasicExclExtraTTM         // decimal, no division needed
roe:              m.roeTTM / 100                // percentage → decimal
revenueCagr:      m.revenueGrowthTTMYoy / 100   // percentage → decimal
netMargin:        m.netProfitMarginTTM / 100    // percentage → decimal
debtEquity:       m['totalDebt/totalEquityQuarterly'] ?? m['totalDebt/totalEquityAnnual']  // ratio, no division
marketCap:        m.marketCapitalization         // raw number
// Do NOT use: returnOnEquityTTM, revenueGrowthTTM, profitMarginTTM, totalDebtToEquityTTM — these are undefined
```

### Quote data flow
- **Finnhub** primary (`/quote?symbol=X` — no symbol in response, route enriches from input array)
- **Alpha Vantage** fallback (GLOBAL_QUOTE)
- Round-robin: 5 symbols every 10s via `useLiveTickers`

### Sector data flow
- **Finnhub `/stock/sector-performance`** is DEAD (302 redirect to homepage)
- **Replaced by** `lib/sectors.ts` fetching 11 SPDR sector ETFs (XLK, XLF, XLV, etc.) via Finnhub `/quote`
- Only 11 API calls, refreshed every 60s client-side

### Candle data flow (AV-only, 3-layer cache)
- **L1**: In-memory cache (5min TTL) in `lib/cache.ts`
- **L2**: File cache at `data/candles/{SYM}.json` (24h TTL) in `lib/candle-cache.ts`
- **L3**: Alpha Vantage `TIME_SERIES_DAILY` (compact = 100 points)
- Finnhub `/stock/candle` is premium-only (403 on free key) — skip entirely

### Indicator data flow
- **AV-only**: RSI, SMA(20/50), BBANDS via Alpha Vantage technical indicators
- Finnhub indicator endpoint is premium

## API keys & constraints
- **Finnhub free tier**: 60 calls/min. 2 keys in rotation (rotate on 429). Works for: quote, search, company-news, stock/metric. Broken: stock/sector-performance (302), stock/candle (premium).
- **Alpha Vantage free tier**: 25 calls/day per key (down from 500). 4 keys = 100/day total. Detects `Note` (per-minute) and `Information` (daily) rate limit messages. Used only for: candles, indicators, fundamentals (fallback only).
- **Roic AI**: No key needed. Only AAPL reliably returns data (403 for most other tickers). Provides: `return_com_eqy` (ROE %), `profit_margin` (%), `tot_debt_to_tot_eqy` (D/E %). All need `/100` for decimal format.

## UI patterns
- **Design tokens**: `lib/constants.ts` exports `U` object; CSS custom properties in `globals.css`. Components use both. `design.md` documents the visual system.
- **Live tickers**: `useLiveTickers()` hook polls `/api/market/quote` with round-robin 5 symbols/10s — used in `TickerTape` and `Dashboard`.
- **Watchlist**: `useWatchlist()` reads/writes `nexus-watchlist` in localStorage, defaults to SP500_TOP100.
- **`next/dynamic`**: `SectorHeatmap` uses `dynamic(() => import(...), { ssr: false })`.
- **Inline styles**: Components use inline `style` props with `U.*` tokens, NOT Tailwind utility classes.
- **No barrel files**: Import directly from the source file.
- **`CLAUDE.md`** defers to `AGENTS.md` via `@AGENTS.md`.
- **Toast notifications**: `ToastProvider` context with 4 types, 4s auto-dismiss.
- **Error states**: `ErrorMessage` component with optional retry. API routes return 503 with user-friendly messages. Components show "—" or "N/A" for missing data — no hardcoded false values.
- **Loading states**: Shimmer skeletons for KPIs/Top Movers. Loading fallback for dynamic imports.
- **Unicode in JSX**: Use `\u` escapes in JSX text via `{"\u2014"}` (NOT literal `\u2014` in JSX).

## Relevant agent skills (`.agents/skills/`)
- `next-best-practices` — Next.js conventions
- `vercel-react-best-practices` — React perf optimization from Vercel
- `frontend-design` — polished UI generation
- `web-design-guidelines` — UI/accessibility review

## Design reference
- Dark glassmorphism (`bg: #0a0a0f`, glass: `rgba(255,255,255,0.04)`)
- Accent colors: `cyan`, `violet`, `emerald` (up), `rose` (down)
- GlassCard pattern: `backdrop-filter: blur(24px) saturate(150%)`, border-radius 14px
