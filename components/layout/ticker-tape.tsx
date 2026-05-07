'use client';

import { U, fmt } from '@/lib/constants';
import { useLiveTickers } from '@/hooks/use-live-tickers';

export function TickerTape() {
  const live = useLiveTickers();
  const vals = Object.values(live);
  const items = vals.length ? [...vals, ...vals] : [];
  
  return (
    <div style={{
      background: "rgba(255,255,255,0.02)", borderBottom: `1px solid ${U.border}`,
      backdropFilter: "blur(20px)", height: 36, overflow: "hidden", display: "flex",
      alignItems: "center", flexShrink: 0, position: "relative", zIndex: 5
    }}>
      <div style={{ display: "flex", animation: "ticker 180s linear infinite", whiteSpace: "nowrap" }}>
        {items.map((t, i) => {
          const l = live[t.sym] || t;
          const up = l.pct >= 0;
          return (
            <span key={i} style={{
              display: "inline-flex", alignItems: "center", gap: 9, padding: "0 24px",
              fontSize: 11, fontWeight: 500,
              borderRight: `1px solid ${U.border}`
            }}>
              <span style={{ color: U.text, fontWeight: 700, letterSpacing: "0.06em" }}>{t.sym}</span>
              <span style={{ color: U.textDim, fontFamily: 'JetBrains Mono' }}>${fmt(l.price)}</span>
              <span style={{ color: up ? U.up : U.down, fontWeight: 600, fontFamily: 'JetBrains Mono' }}>
                {up ? "▲" : "▼"} {Math.abs(l.pct).toFixed(2)}%
              </span>
            </span>
          );
        })}
      </div>
    </div>
  );
}
