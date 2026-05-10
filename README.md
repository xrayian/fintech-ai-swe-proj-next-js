# NEXUS Dashboard

A fintech analytics dashboard with real-time market data, AI-powered stock analysis, and technical indicators.

## Stack

- **Framework:** Next.js 16.2.4 (App Router)
- **UI:** React 19.2.4, TypeScript 5, Tailwind CSS 4
- **Charts:** Recharts
- **Icons:** lucide-react
- **Testing:** vitest
- **AI:** Google Gemini API (via `@google/genai`)
- **Data Sources:** Finnhub, Alpha Vantage, Roic AI

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server on :3000 |
| `npm run build` | Production build + typecheck |
| `npm run start` | Start production build |
| `npm run lint` | ESLint |
| `npm test` | vitest unit tests |

## Routes

| Route | Description |
|-------|-------------|
| `/dashboard` | Market overview, KPIs, sector heatmap |
| `/technical` | RSI, SMA, Bollinger Bands for any symbol |
| `/copilot` | AI-powered stock analysis chat |
| `/compare` | Side-by-side stock comparison |
| `/news` | Market news & sentiment feed |
| `/search` | Search 500+ stocks |
| `/settings` | API key status, watchlist, cache |
| `/notifications` | Price/volume alerts (WIP) |

## Project Structure

```
app/
  api/           # Next.js Route Handlers (server-side API proxies)
  (routes)       # Page components per route
components/
  layout/        # App shell (sidebar, header, ticker tape)
  shared/        # ErrorMessage, ToastProvider
  dashboard/     # Dashboard widgets
  technical/     # Technical analysis suite
  ai/            # Copilot chat & scorecards
  compare/       # Stock comparison
hooks/
  use-live-tickers.ts
  use-watchlist.ts
  use-market-status.ts
  use-responsive.ts
lib/
  providers/     # Finnhub, Alpha Vantage, Roic AI clients
  symbols/       # Stock symbol databases
  cache.ts       # In-memory L1 cache
  candle-cache.ts # File-based L2 cache
  constants.ts   # Design tokens (U)
```

## Contributing

### Issue Tracker

All work is tracked on the [GitHub Project Board](https://github.com/users/Injabin/projects/1). The board uses these columns:

| Column | Description |
|--------|-------------|
| **Backlog** | Unrefined ideas, not yet prioritized |
| **Ready** | Refined and ready to be picked up |
| **In progress** | Actively being worked on |
| **In review** | Awaiting code review |
| **Done** | Completed and merged |

### Priority Levels

- **P0** — Critical bug or blocker. Fix immediately.
- **P1** — Important feature or fix. Should be completed in current sprint.
- **P2** — Nice-to-have. Can be deferred.

### Size Levels

- **XS** — Trivial (minutes)
- **S** — Small (hours)
- **M** — Medium (half day)
- **L** — Large (1-2 days)
- **XL** — Very large (3+ days, should be split)

### Pull Request Process

1. Pick an issue from the **Ready** column and assign yourself
2. Move it to **In progress**
3. Create a feature branch from `master`:
   ```bash
   git checkout -b feat/description
   ```
4. Follow existing code conventions:
   - `'use client'` in all page/layout components
   - Inline styles with `U.*` design tokens (no Tailwind utility classes)
   - No barrel files — import directly from source
   - Unicode escapes in JSX via `{"\uXXXX"}`
5. Run lint and tests before opening a PR:
   ```bash
   npm run lint
   npm test
   ```
6. Open a PR against `master` and request review
7. Move the issue to **In review**
8. Once approved and merged, move to **Done**

### Coding Standards

- **Design tokens:** Use `U.*` from `lib/constants.ts` for all colors, spacing, and glass effects
- **Styling:** Inline `style` props with `U.*` tokens; Tailwind only in `globals.css`
- **Data fetching:** All external API calls go through `/api/*` route handlers — no client-side direct calls
- **Error states:** Use `ErrorMessage` component or display `"\u2014"` for missing data
- **Loading states:** Use shimmer skeletons or loading fallbacks for dynamic imports

## API Keys

This project requires API keys for data providers. Set these in `.env.local`:

```
FINNHUB_API_KEY=
FINNHUB_API_KEY_2=
ALPHA_VANTAGE_API_KEY=
ALPHA_VANTAGE_API_KEY_2=
ALPHA_VANTAGE_API_KEY_3=
ALPHA_VANTAGE_API_KEY_4=
GEMINI_API_KEY=
```

## License

MIT
