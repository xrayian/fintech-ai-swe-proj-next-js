# NYSE Scaling Plan — Top 100 S&P 500 + Round Robin

## Context

Current app tracks 8 hardcoded stocks (`DEFAULT_SYMBOLS`, `TICKERS`). Goal: cover the full NYSE (~2,800 stocks) as a searchable universe, with a default watchlist of the top 100 S&P 500 constituents polled via round-robin.

## Constraint

Finnhub free tier: **60 req/min**. Every API call is per-symbol (no batch quote endpoint). Must fit within this budget.

## Rate Budget

| Pattern | Requests | Rate |
|---------|----------|------|
| Round-robin: poll 10 symbols every 10s | 10 req / 10s | **60 req/min** (fills the entire budget) |
| Full cycle: 100 symbols ÷ 10 per tick | 10 ticks | Each symbol refreshes **every 100s** |
| Search: Finnhub symbol list | 1 req / session | Negligible |
| Total | | ≤ 61 req/min |

Every top-100 symbol gets fresh data every 100 seconds — one uniform tier.

## Implementation Steps

### Step 1 — `lib/symbols/sp500-top100.ts`

Static list of the top ~100 S&P 500 constituents by market cap. `{sym, name}` pairs only — no price data. This avoids burning 100+ API calls just to discover which stocks exist. Manually refreshed quarterly (~5-10 symbol swaps per year).

### Step 2 — `hooks/use-watchlist.ts`

- On mount: checks `localStorage['nexus-watchlist']`
- If empty: writes default `SP500_TOP100` as the initial watchlist
- Exports `{ watchlist, addSymbol, removeSymbol, isWatched }`
- `watchlist` is the source of truth for ticker tape + dashboard

### Step 3 — Modify `hooks/use-live-tickers.ts`

Replace the current "fetch all 8 at once every 10s" with round-robin:

- Reads `watchlist` from `useWatchlist()`
- Maintains a `cursorRef` pointing to the next 10-symbol chunk
- Every 10s: fetches `GET /api/market/quote?symbols=CHUNK`
- Advances cursor by 10 (wraps at 100)
- Merges returned quotes into the `TickerData` map (older chunks persist between refreshes)

### Step 4 — `GET /api/symbols` + `GET /api/symbols/search`

- `GET /api/symbols` — Fetches Finnhub `GET /stock/symbol?exchange=NYSE` (one call, returns ~2,800 symbols with names/sectors). In-memory cache with 24h TTL.
- `GET /api/symbols/search?q=...` — Server-side prefix search over the cached list. Returns top 20 matches.
- Powers stock selector autocomplete across all pages.

### Step 5 — Frontend Changes

| Component | Change |
|-----------|--------|
| **Dashboard** | Top Movers reads from `useLiveTickers` (already does) |
| **Ticker Tape** | Reads from `useLiveTickers` (already does) |
| **Compare / Technical / ScoreCard** | Stock selectors become search-backed autocomplete via `/api/symbols/search` |
| **Search page** | Wire search input to `/api/symbols/search` + navigate on select |
| **Settings page** | Add "Watchlist" section: view current size, clear/reset to default |

### Step 6 — Cleanup

- Remove `TICKERS` and `DEFAULT_SYMBOLS` — replaced by `SP500_TOP100` + `useWatchlist`
- `use-live-tickers.ts` no longer imports `TICKERS` — gets symbols from watchlist hook

## What Stays Unchanged

| Piece | Why |
|-------|-----|
| All API routes | Already accept `?symbols=` params |
| `/api/kpis` | Market-wide via SPY/VIX/TNX indices |
| `/api/market/sectors` | Already aggregated by Finnhub in one call |
| Error handling | Three-state pattern already in place |
| Copilot | Already fetches live data per query |

## Risk

The static top-100 list drifts over time (stock splits, new S&P 500 members, rankings changing). Mitigation: quarterly manual refresh, plus users can add/remove symbols via the watchlist Settings UI.
