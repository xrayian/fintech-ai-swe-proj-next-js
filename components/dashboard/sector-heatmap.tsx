'use client';

import { useState, useEffect } from 'react';
import { U } from '@/lib/constants';
import { ErrorMessage } from '@/components/shared/error-message';

export function SectorHeatmap() {
  const [sectors, setSectors] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await fetch('/api/market/sectors');
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body?.error || 'Sector data unavailable');
        }
        const data = await res.json();
        if (!mounted) return;
        setSectors(data);
        setError(null);
      } catch (e) {
        if (mounted) setError(e instanceof Error ? e.message : 'Sector data unavailable');
      }
    };
    load();
    const iv = setInterval(load, 60000);
    return () => { mounted = false; clearInterval(iv); };
  }, []);

  if (error && !sectors.length) {
    return <ErrorMessage message={error + " — retrying every 60s"} compact />;
  }

  if (!sectors.length) {
    return (
      <div style={{ height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', color: U.textMute, fontSize: 11 }}>
        Loading sectors...
      </div>
    );
  }

  const mx = Math.max(...sectors.map(s => Math.abs(s.chg || 1)), 1);
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 6 }}>
      {sectors.map(s => {
        const up = (s.chg || 0) >= 0;
        const int = Math.min(Math.abs(s.chg || 0) / mx, 1);
        const rgb = up ? "52,211,153" : "251,113,133";
        return (
          <div key={s.name}
            style={{
              background: `linear-gradient(135deg,rgba(${rgb},${0.07 + int * .18}),rgba(${rgb},${0.02 + int * .07}))`,
              border: `1px solid rgba(${rgb},${0.16 + int * .3})`,
              borderRadius: 10, padding: "10px 11px", cursor: "pointer", transition: "all .2s",
              backdropFilter: "blur(8px)",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = `0 8px 28px rgba(${rgb},0.2)`;
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = "none";
              e.currentTarget.style.boxShadow = "none";
            }}>
            <div style={{ fontSize: 9, color: U.textDim, fontWeight: 500, marginBottom: 3 }}>{s.name}</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: up ? U.up : U.down, fontFamily: 'JetBrains Mono' }}>{up ? "+" : ""}{s.chg?.toFixed(2)}%</div>
          </div>
        );
      })}
    </div>
  );
}
