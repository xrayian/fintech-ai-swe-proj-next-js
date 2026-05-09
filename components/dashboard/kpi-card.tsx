'use client';

import { useState } from 'react';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { U } from '@/lib/constants';
import { GlassCard } from '@/components/shared/glass-card';

interface KpiCardProps {
  label: string;
  value: string;
  sub?: string;
  trend?: number;
  accent?: string;
}

export function KpiCard({ label, value, sub, trend, accent }: KpiCardProps) {
  const [h, sh] = useState(false);
  return (
    <GlassCard
      onMouseEnter={() => sh(true)}
      onMouseLeave={() => sh(false)}
      className="glow-hover"
      style={{
        padding: "16px 18px", flex: 1, minWidth: "var(--kpi-min-w)" as any, position: "relative", overflow: "hidden",
        transition: "all .2s", background: h ? U.glassHi : U.glass, borderColor: h ? U.borderHi : U.border
      }}
    >
      {accent && <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 1,
        background: `linear-gradient(90deg,transparent,${accent},transparent)`
      }} />}
      <div style={{
        fontSize: 10, fontWeight: 600, color: U.textMute, textTransform: "uppercase",
        letterSpacing: "0.12em", marginBottom: 8
      }}>{label}</div>
      <div style={{
        fontSize: 23, fontWeight: 700, color: U.text, fontFamily: 'JetBrains Mono',
        letterSpacing: "-0.03em", lineHeight: 1.1
      }}>{value}</div>
      {sub && <div style={{
        fontSize: 11, fontWeight: 500, marginTop: 6,
        color: trend && trend > 0 ? U.up : trend && trend < 0 ? U.down : U.textMute,
        display: "flex", alignItems: "center", gap: 3
      }}>
        {trend && trend > 0 ? <ArrowUp size={10} /> : trend && trend < 0 ? <ArrowDown size={10} /> : <Minus size={10} />} {sub}
      </div>}
    </GlassCard>
  );
}
