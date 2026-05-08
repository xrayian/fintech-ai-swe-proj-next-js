# Implementation Plan: Phase Out Demo Data + Friendly Error States

## Core Principle
**Never silently show demo/fake data.** Every component must have three explicit states: **loading → data | error**. If an API call fails, the UI shows a clear, human-readable message — not hidden fallback data.

---

## Phase 0 — Foundation: Error Handling Pattern

### 0.1 New shared component
`components/shared/error-message.tsx`
- Glass card with AlertTriangle icon + error message + optional Retry button
- Fade-in animation, amber accent stripe

### 0.2 Strip fallback from all 6 existing API routes
Remove hidden fallback to hardcoded constants. On provider failure → `Response.json({ error }, { status: 503 })`.

| Route | Remove fallback | Error message |
|-------|----------------|---------------|
| `/api/market/quote` | `TICKERS` constant | `"Live price feed unavailable — retrying every 10s"` |
| `/api/market/candles` | `CANDLE_DATA` | `"Candle data unavailable — try a different timeframe"` |
| `/api/market/indicators` | `{ rsi: null, ... }` | `"Technical indicators temporarily unavailable"` |
| `/api/news` | `NEWS` constant | `"News feed unavailable — updates every 60s"` |
| `/api/fundamentals` | `SCORECARD` constant | `"Fundamental data unavailable for {symbol}"` |
| `/api/market/status` | (no change needed) | — |

### 0.3 New API routes

| Route | Implementation |
|-------|---------------|
| `GET /api/market/sectors` | Finnhub `fetchSectors()` → AV fallback → `Response.json(data)` or 503 |
| `GET /api/kpis` | Finnhub `fetchKpis()` → AV fallback → `Response.json(data)` or 503 |

---

## Phase 1 — Components: Replace Hardcoded Data

### 1a. `dashboard/dashboard.tsx` — KPI cards
- Fetch `GET /api/kpis` every 30s via `useEffect`
- Replace 5 hardcoded strings with state from API
- Trend icons derive from API response
- Error: 5 greyed-out cards with `"—"` values + tooltip `"Market data feed unavailable — retrying every 30s"`

### 1b. `dashboard/sector-heatmap.tsx` — Sector grid
- Fetch `GET /api/market/sectors` every 60s
- Replace `SECTORS` constant import
- Error: grid cells with `"—"` + tooltip `"Sector data unavailable"`

### 1c. `news/news-sentiment.tsx` — News feed + summary KPIs
- Fetch `GET /api/news` every 60s
- Replace `NEWS` import
- Summary KPIs computed from fetched data (avg fear, bullish/bearish ratio, total count)
- AI Analysis: template with real fear score injected
- Error: empty list + banner `"Unable to fetch latest news — feed updates every 60s"`

### 1d. `compare/compare-analytics.tsx` + `stock-selector.tsx`
- Replace `SCORECARD` with `GET /api/fundamentals?symbol={sym}` for both symbols
- `stock-selector.tsx`: use `TRACKED_SYMBOLS` instead of `Object.entries(SCORECARD)`
- Error per symbol: grey bars + `"Fundamentals unavailable for {symbol}"`

### 1e. `ai/score-card.tsx` — Live data + auto-generated coach
- Remove hardcoded `coach` object
- Accept just `ticker: string`, fetch fundamentals on expand (lazy)
- `generateCoachText(symbol, fundamentals)` — pure function, evaluates metric thresholds:
  - ROE > 30% → "exceptional capital efficiency (ROE {x}%)"
  - ROE 15-30% → "healthy returns (ROE {x}%)"
  - ROE < 15% → "below-average ROE of {x}%"
  - P/E < 25 → "attractive P/E of {x}×"
  - P/E > 40 → "elevated P/E of {x}×"
  - CAGR > 20% → "strong revenue momentum (+{x}% CAGR)"
  - Margin > 25% → "best-in-class {x}% net margin"
  - D/E < 0.5 → "conservative balance sheet ({x}× D/E)"
  - Score ≥ 8 → "Strong buy signal"
  - Score 6-7 → "Moderate buy signal"
  - Score < 6 → "Caution warranted"
- Error: grey state + inline error message

### 1f. `ai/ai-copilot.tsx` — Left panel + initial message
- Left panel: batch fetch `GET /api/fundamentals?symbol={sym}` for all 8 symbols on mount
- `AI_INIT`: remove fake stats, use generic greeting
- `QUICK_PROMPTS` keep as-is

---

## Phase 2 — Copilot Context: Live Data

### 2a. `lib/copilot-context.ts`
- Remove `import { TICKERS, SCORECARD, NEWS, SECTORS }`
- Change `buildContext(entities)` → `buildContext(entities, liveData)`
- Each section only included if corresponding live data provided

### 2b. `app/api/copilot/route.ts`
- Before `buildContext()`, fetch fresh data from providers per request
- Skip failed sections rather than using stale constants

---

## Phase 3 — Clean Up `lib/constants.ts`

| Export | Action | Replacement |
|--------|--------|-------------|
| `U` | **KEEP** | — |
| `fmt` | **KEEP** | — |
| `QUICK_PROMPTS` | **KEEP** | — |
| `TICKERS` | **REPLACE** | `TRACKED_SYMBOLS` — `{sym, name}` only |
| `SECTORS` | **REMOVE** | `/api/market/sectors` |
| `NEWS` | **REMOVE** | `/api/news` |
| `SCORECARD` | **REMOVE** | `/api/fundamentals` |
| `CANDLE_DATA` + `genCandles()` | **REMOVE** | `/api/market/candles` |

Update all imports across the codebase to use `TRACKED_SYMBOLS`.

---

## Phase 4 — Stub Pages

| Page | Proposal |
|------|----------|
| `/settings` | Minimal functional: theme toggle placeholder, API connection status |
| `/notifications` | Empty state: "No notifications yet" + stub "Create Alert" button |
| `/search` | Search input + "Search across 8 tracked symbols" empty state |

---

## Phase 5 — `header.tsx` Subtitle Cleanup

- `SUBS["/technical"]`: remove "250ms" reference, update to "30s live polling"
- Other descriptions: remove references to hardcoded data
