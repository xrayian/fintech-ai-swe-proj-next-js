'use client';

import { useState, useEffect, useRef } from 'react';
import { Trophy, ChevronUp, ChevronDown } from 'lucide-react';
import { U, SCORECARD } from '@/lib/constants';
import { ScoreBadge } from '@/components/ai/score-badge';
import { GlassCard } from '@/components/shared/glass-card';

interface StockSelectorProps {
  value: string;
  onChange: (val: string) => void;
  exclude?: string;
  accent: string;
  accentRgb: string;
  label: string;
  isWinner?: boolean;
}

export function StockSelector({ value, onChange, exclude, accent, accentRgb, label, isWinner = false }: StockSelectorProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = (SCORECARD as any)[value];

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} style={{ position: "relative", flex: 1 }}>
      <GlassCard onClick={() => setOpen(!open)} style={{
        padding: "18px 20px", cursor: "pointer",
        position: "relative", overflow: "hidden", transition: "all .2s",
        borderColor: open ? accent : U.border,
        boxShadow: open ? `0 0 0 1px ${accent}, 0 8px 32px rgba(${accentRgb},0.15)` : "none"
      }}>
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 1,
          background: `linear-gradient(90deg,transparent,${accent},transparent)`, opacity: open ? 1 : 0.5
        }} />
        <div style={{
          fontSize: 9, fontWeight: 600, color: `rgba(${accentRgb},0.7)`,
          textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: 10,
          display: "flex", alignItems: "center", gap: 5
        }}>
          <div style={{ width: 5, height: 5, borderRadius: "50%", background: accent }} />
          {label}
        </div>
        <div style={{ display: "flex", justifyItems: "space-between", alignItems: "flex-start" }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: U.text, lineHeight: 1, letterSpacing: "-0.03em" }}>{value}</div>
            <div style={{ fontSize: 11, color: U.textDim, marginTop: 5 }}>{selected?.name}</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
            <ScoreBadge score={selected?.score || 0} isWinner={isWinner} />
            <div style={{ fontSize: 10, color: isWinner ? accent : `rgba(${accentRgb},0.5)`, display: "flex", alignItems: "center", gap: 4, fontWeight: isWinner ? 600 : 400 }}>
              {isWinner ? <Trophy size={10} /> : (open ? <ChevronUp size={10} /> : <ChevronDown size={10} />)}
              {isWinner ? "Leader" : (open ? "Collapse" : "Change")}
            </div>
          </div>
        </div>
        <div style={{ marginTop: 12, display: "flex", gap: 7, flexWrap: "wrap" }}>
          <span style={{
            background: `rgba(${accentRgb},0.12)`, color: accent, borderRadius: 999, border: `1px solid rgba(${accentRgb},0.25)`,
            padding: "4px 10px", fontSize: 10, fontWeight: 600
          }}>{selected?.verdict}</span>
          <span style={{
            background: U.glassLo, color: U.textMute, borderRadius: 999, border: `1px solid ${U.border}`,
            padding: "4px 10px", fontSize: 10, fontWeight: 500
          }}>{selected?.tag}</span>
        </div>
      </GlassCard>

      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 8px)", left: 0, right: 0, zIndex: 100,
          background: U.glass, backdropFilter: "blur(24px) saturate(150%)", borderRadius: 14, border: `1px solid ${U.borderHi}`,
          overflow: "hidden", boxShadow: `0 16px 48px rgba(0,0,0,0.5), 0 0 0 1px ${U.border}`, animation: "fi .15s ease"
        }}>
          {Object.entries(SCORECARD).map(([sym, d]: [string, any]) => {
            const isSelected = sym === value;
            const isExcluded = sym === exclude;
            return (
              <div key={sym} onClick={() => { if (!isExcluded) { onChange(sym); setOpen(false); } }}
                style={{
                  display: "flex", alignItems: "center", gap: 12, padding: "11px 16px", cursor: isExcluded ? "not-allowed" : "pointer",
                  background: isSelected ? `rgba(${accentRgb},0.1)` : isExcluded ? "rgba(255,255,255,0.01)" : "transparent",
                  borderBottom: `1px solid ${U.border}`, opacity: isExcluded ? 0.35 : 1, transition: "background .12s"
                }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: isSelected ? accent : U.text }}>{sym}</span>
                    {isSelected && <span style={{ fontSize: 9, color: accent, fontWeight: 600, background: `rgba(${accentRgb},0.12)`, padding: "2px 6px", borderRadius: 999 }}>selected</span>}
                    {isExcluded && <span style={{ fontSize: 9, color: U.textMute }}>in use</span>}
                  </div>
                  <div style={{ fontSize: 10, color: U.textMute, marginTop: 2 }}>{d.name}</div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: U.text, fontFamily: 'JetBrains Mono' }}>{d.score}<span style={{ fontSize: 9, color: U.textMute }}>/10</span></div>
                  <div style={{ fontSize: 9, color: U.textMute, marginTop: 2 }}>P/E {d.pe}×</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
