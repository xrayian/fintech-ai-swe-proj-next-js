# Implementation Plan: NEXUS Dashboard

## 1. Core Structure
- [ ] Migrate `globals.css` with design tokens and keyframes.
- [ ] Create `components/shared` for primitive UI (Btn, Chip, GlassCard).
- [ ] Implement `components/layout` for Sidebar, Header, TickerTape, AmbientBg.

## 2. Shared Logic
- [ ] Create `hooks/use-live-tickers.ts` for 250ms price simulation.
- [ ] Define data constants in `lib/constants.ts` (TICKERS, SECTORS, SCORECARD).

## 3. Modular Components
- [ ] `Dashboard`: KPI Cards, Sector Heatmap, Top Movers.
- [ ] `Technical`: CandleChart (Recharts), Indicators.
- [ ] `Copilot`: AI Chat interface, Scorecards Panel.
- [ ] `Compare`: Stock Selector, Radar Chart, Metric Comparison.
- [ ] `News`: Sentiment Feed, Analysis breakdown.

## 4. Routes (App Router)
- [ ] `/` (Redirect to /dashboard or Overview)
- [ ] `/dashboard`
- [ ] `/technical`
- [ ] `/copilot`
- [ ] `/compare`
- [ ] `/news`
- [ ] Implement skeleton routes for hinted features (Settings, Notifications, Search).

## 5. Verification
- [ ] Ensure dark glassmorphism consistency.
- [ ] Verify 250ms live updates.
- [ ] Test mobile responsiveness (sidebar toggle).
