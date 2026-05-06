'use client';

import dynamic from 'next/dynamic';
import { Globe, Activity, TrendingUp, TrendingDown } from "lucide-react";
import { U, TICKERS, fmt } from '@/lib/constants';
import { useLiveTickers } from '@/hooks/use-live-tickers';
import { KpiCard } from './kpi-card';
import { SectionTitle } from '@/components/shared/section-title';
import { GlassCard } from '@/components/shared/glass-card';

const SectorHeatmap = dynamic(() => import('./sector-heatmap').then(m => m.SectorHeatmap), { ssr: false });

export default function Dashboard() {
  const live = useLiveTickers();

  return (
    <div style={{ animation: "fi .4s ease" }}>
      <div style={{ display: "flex", gap: 10, marginBottom: 18, flexWrap: "wrap" }}>
        <KpiCard label="Total Market Cap" value="$47.3T" sub="+0.89% today" trend={1} accent={U.cyan} />
        <KpiCard label="S&P 500" value="5,842.31" sub="+1.12% today" trend={1} accent={U.emerald} />
        <KpiCard label="Fear & Greed" value="52 / 100" sub="Neutral Zone" trend={0} accent={U.amber} />
        <KpiCard label="VIX Volatility" value="18.34" sub="−2.1 from prev" trend={-1} accent={U.rose} />
        <KpiCard label="10Y Yield" value="4.31%" sub="+0.04% today" trend={1} accent={U.violet} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <GlassCard style={{ padding: "16px 18px" }}>
          <SectionTitle icon={Globe}>Global Sector Heatmap</SectionTitle>
          <SectorHeatmap />
        </GlassCard>
        <GlassCard style={{ padding: "16px 18px" }}>
          <SectionTitle icon={Activity}>Top Movers</SectionTitle>
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            {[...TICKERS].sort((a, b) => Math.abs(b.pct) - Math.abs(a.pct)).slice(0, 6).map(t => {
              const l = live[t.sym] || t;
              const up = l.pct >= 0;
              return (
                <div key={t.sym} className="glow-hover"
                  style={{
                    display: "flex", alignItems: "center", gap: 10, padding: "9px 11px",
                    background: U.glass, borderRadius: 10, cursor: "pointer",
                    border: `1px solid ${U.border}`, transition: "all .15s"
                  }}>
                  <div style={{
                    width: 32, height: 32,
                    background: up ? "rgba(52,211,153,0.12)" : "rgba(251,113,133,0.12)",
                    border: `1px solid rgba(${up ? "52,211,153" : "251,113,133"},0.2)`,
                    borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink:0
                  }}>
                    {up ? <TrendingUp size={13} color={U.up} /> : <TrendingDown size={13} color={U.down} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 12.5, color: U.text }}>{t.sym}</div>
                    <div style={{
                      fontSize: 10, color: U.textMute,
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"
                    }}>{t.name}</div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: U.text, fontFamily: 'JetBrains Mono' }}>${fmt(l.price)}</div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: up ? U.up : U.down, fontFamily: 'JetBrains Mono' }}>
                      {up ? "+" : ""}{fmt(l.pct)}%
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
