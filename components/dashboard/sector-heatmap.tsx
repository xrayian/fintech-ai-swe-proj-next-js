'use client';

import { U, SECTORS } from '@/lib/constants';

export function SectorHeatmap() {
  const mx = Math.max(...SECTORS.map(s => s.value));
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 6 }}>
      {SECTORS.map(s => {
        const up = s.chg >= 0;
        const int = Math.min(Math.abs(s.chg) / 3, 1);
        const rgb = up ? "52,211,153" : "251,113,133";
        return (
          <div key={s.name}
            style={{
              background: `linear-gradient(135deg,rgba(${rgb},${0.07 + int * .18}),rgba(${rgb},${0.02 + int * .07}))`,
              border: `1px solid rgba(${rgb},${0.16 + int * .3})`,
              borderRadius: 10, padding: "10px 11px", cursor: "pointer", transition: "all .2s",
              backdropFilter: "blur(8px)",
              gridColumn: s.value / mx > 0.25 ? "span 2" : "span 1"
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
            <div style={{ fontSize: 14, fontWeight: 700, color: up ? U.up : U.down, fontFamily: 'JetBrains Mono' }}>{up ? "+" : ""}{s.chg}%</div>
            <div style={{ fontSize: 9, color: U.textFaint, marginTop: 2, fontFamily: 'JetBrains Mono' }}>{s.value}%</div>
          </div>
        );
      })}
    </div>
  );
}
