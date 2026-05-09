'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Globe, Activity, TrendingUp, TrendingDown } from "lucide-react";
import { U, fmt } from '@/lib/constants';
import { useLiveTickers } from '@/hooks/use-live-tickers';
import { KpiCard } from './kpi-card';
import { SectionTitle } from '@/components/shared/section-title';
import { GlassCard } from '@/components/shared/glass-card';
import { ErrorMessage } from '@/components/shared/error-message';

const SectorHeatmap = dynamic(() => import('./sector-heatmap').then(m => m.SectorHeatmap), {
  ssr: false,
  loading: () => <div style={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', color: U.textMute, fontSize: 11 }}>Loading sectors...</div>
});

function SkeletonCard() {
  return (
    <div style={{
      flex: 1, minWidth: "var(--kpi-min-w)" as any, padding: "16px 18px", borderRadius: 14,
      background: U.glass, border: `1px solid ${U.border}`,
      overflow: "hidden", position: "relative",
    }}>
      <div style={{
        height: 10, width: "50%", borderRadius: 4, marginBottom: 10,
        background: `linear-gradient(90deg,${U.glassLo},${U.glassHi},${U.glassLo})`,
        backgroundSize: "200% 100%", animation: "shimmer 1.5s ease infinite",
      }} />
      <div style={{
        height: 22, width: "70%", borderRadius: 4, marginBottom: 6,
        background: `linear-gradient(90deg,${U.glassLo},${U.glassHi},${U.glassLo})`,
        backgroundSize: "200% 100%", animation: "shimmer 1.5s ease infinite 200ms",
      }} />
      <div style={{
        height: 10, width: "40%", borderRadius: 4,
        background: `linear-gradient(90deg,${U.glassLo},${U.glassHi},${U.glassLo})`,
        backgroundSize: "200% 100%", animation: "shimmer 1.5s ease infinite 400ms",
      }} />
    </div>
  );
}

function MoverSkeleton() {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10, padding: "9px 11px",
      background: U.glass, borderRadius: 10,
      border: `1px solid ${U.border}`,
    }}>
      <div style={{
        width: 32, height: 32, borderRadius: "50%",
        background: `linear-gradient(90deg,${U.glassLo},${U.glassHi},${U.glassLo})`,
        backgroundSize: "200% 100%", animation: "shimmer 1.5s ease infinite",
      }} />
      <div style={{ flex: 1 }}>
        <div style={{
          height: 12, width: 50, borderRadius: 4, marginBottom: 4,
          background: `linear-gradient(90deg,${U.glassLo},${U.glassHi},${U.glassLo})`,
          backgroundSize: "200% 100%", animation: "shimmer 1.5s ease infinite 200ms",
        }} />
        <div style={{
          height: 9, width: 80, borderRadius: 4,
          background: `linear-gradient(90deg,${U.glassLo},${U.glassHi},${U.glassLo})`,
          backgroundSize: "200% 100%", animation: "shimmer 1.5s ease infinite 400ms",
        }} />
      </div>
      <div style={{ textAlign: "right" }}>
        <div style={{
          height: 12, width: 55, borderRadius: 4, marginBottom: 3,
          background: `linear-gradient(90deg,${U.glassLo},${U.glassHi},${U.glassLo})`,
          backgroundSize: "200% 100%", animation: "shimmer 1.5s ease infinite 300ms",
        }} />
        <div style={{
          height: 10, width: 40, borderRadius: 4, marginLeft: "auto",
          background: `linear-gradient(90deg,${U.glassLo},${U.glassHi},${U.glassLo})`,
          backgroundSize: "200% 100%", animation: "shimmer 1.5s ease infinite 500ms",
        }} />
      </div>
    </div>
  );
}

export default function Dashboard() {
  const live = useLiveTickers();
  const [kpis, setKpis] = useState<any>(null);
  const [kpiErr, setKpiErr] = useState(false);
  const [kpiLoading, setKpiLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await fetch('/api/kpis');
        if (!res.ok) throw new Error();
        const data = await res.json();
        if (!mounted) return;
        setKpis(data);
        setKpiErr(false);
      } catch {
        if (mounted) setKpiErr(true);
      } finally {
        if (mounted) setKpiLoading(false);
      }
    };
    load();
    const iv = setInterval(load, 30000);
    return () => { mounted = false; clearInterval(iv); };
  }, []);

  const liveVals = Object.values(live);
  const hasLive = liveVals.length > 0;

  const kpiDefs = [
    { label: "Total Market Cap", value: kpis?.marketCap, accent: U.cyan },
    { label: "S&P 500", value: kpis?.sp500, accent: U.emerald },
    { label: "Fear & Greed", value: kpis?.fearGreed, accent: U.amber },
    { label: "VIX Volatility", value: kpis?.vix, accent: U.rose },
    { label: "10Y Yield", value: kpis?.tenYearYield ? kpis.tenYearYield + "%" : null, accent: U.violet },
  ];

  return (
    <div style={{ animation: "fi .4s ease" }}>
      <div style={{ display: "flex", gap: 10, marginBottom: 18, flexWrap: "wrap" }}>
        {kpiLoading ? (
          Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)
        ) : kpiErr && !kpis ? (
          <div style={{ width: "100%" }}>
            <ErrorMessage message="Failed to load market KPIs — data may be stale" compact />
          </div>
        ) : (
          kpiDefs.map(k => (
            <KpiCard key={k.label} label={k.label} value={k.value || "—"} accent={k.accent} sub={kpiErr ? "Updating..." : undefined} />
          ))
        )}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "var(--grid-2)" as any, gap: 14 }}>
        <GlassCard style={{ padding: "16px 18px" }}>
          <SectionTitle icon={Globe}>Global Sector Heatmap</SectionTitle>
          <SectorHeatmap />
        </GlassCard>
        <GlassCard style={{ padding: "16px 18px" }}>
          <SectionTitle icon={Activity}>Top Movers</SectionTitle>
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            {!hasLive ? (
              Array.from({ length: 5 }).map((_, i) => <MoverSkeleton key={i} />)
            ) : (
              liveVals.sort((a, b) => Math.abs(b.pct) - Math.abs(a.pct)).slice(0, 6).map(t => {
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
              })
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
