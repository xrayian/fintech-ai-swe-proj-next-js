'use client';

import { useState, useEffect, useRef } from 'react';
import { Trophy, ChevronUp, ChevronDown, Search as SearchIcon } from 'lucide-react';
import { U } from '@/lib/constants';
import type { ScorecardData } from '@/lib/scorecard-utils';
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
  options: Record<string, ScorecardData>;
}

interface SearchResult {
  sym: string;
  name: string;
}

export function StockSelector({ value, onChange, exclude, accent, accentRgb, label, isWinner = false, options }: StockSelectorProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [apiResults, setApiResults] = useState<SearchResult[]>([]);
  const ref = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const selected = options[value];

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    let active = true;
    if (!search.trim()) {
      Promise.resolve().then(() => {
        if (active) setApiResults([]);
      });
      return () => { active = false; };
    }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/symbols?q=${encodeURIComponent(search)}`);
        if (!res.ok) return;
        const data = await res.json();
        if (active) setApiResults(data);
      } catch {}
    }, 200);
    return () => {
      active = false;
      clearTimeout(debounceRef.current);
    };
  }, [search]);

  const optionEntries = Object.entries(options);
  const filteredOptions = optionEntries.filter(([sym, d]) =>
    !search || sym.toLowerCase().includes(search.toLowerCase()) ||
    d.name.toLowerCase().includes(search.toLowerCase())
  );

  const apiOnly = apiResults.filter(r => !options[r.sym]);

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
            <div style={{ fontSize: 11, color: U.textDim, marginTop: 5 }}>{selected?.name || "\u2014"}</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
            {selected ? <ScoreBadge score={selected.score} isWinner={isWinner} /> : (
              <div style={{
                borderRadius: 12, padding: "8px 12px", textAlign: "center", minWidth: 50, flexShrink: 0,
                background: U.glassLo,
              }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: U.textMute, fontFamily: "'Inter',sans-serif", lineHeight: 1, letterSpacing: "-0.03em" }}>{"\u2014"}</div>
                <div style={{ fontSize: 8, color: U.textMute, marginTop: 3, fontWeight: 500, letterSpacing: "0.08em", opacity: .5 }}>/10</div>
              </div>
            )}
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
          }}>{selected?.verdict || "\u2014"}</span>
          <span style={{
            background: U.glassLo, color: U.textMute, borderRadius: 999, border: `1px solid ${U.border}`,
            padding: "4px 10px", fontSize: 10, fontWeight: 500
          }}>{selected?.tag || "\u2014"}</span>
        </div>
      </GlassCard>

      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 8px)", left: 0, right: 0, zIndex: 100,
          background: U.glass, backdropFilter: "blur(24px) saturate(150%)", borderRadius: 14, border: `1px solid ${U.borderHi}`,
          overflow: "hidden", boxShadow: `0 16px 48px rgba(0,0,0,0.5), 0 0 0 1px ${U.border}`, animation: "fi .15s ease"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderBottom: `1px solid ${U.border}` }}>
            <SearchIcon size={13} color={U.textMute} />
            <input autoFocus value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search any symbol..."
              style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: U.text, fontSize: 12 }}
            />
          </div>
          <div style={{ maxHeight: 240, overflow: "auto" }}>
            {filteredOptions.map(([sym, d]) => {
              const isSelected = sym === value;
              const isExcluded = sym === exclude;
              return (
                <div key={sym} onClick={() => { if (!isExcluded) { onChange(sym); setOpen(false); setSearch(''); } }}
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
            {search && apiOnly.length > 0 && (
              <>
                <div style={{ padding: "8px 14px 4px", fontSize: 9, fontWeight: 700, color: U.textFaint, textTransform: "uppercase", letterSpacing: "0.1em", borderBottom: `1px solid ${U.border}` }}>
                  More results from search
                </div>
                {apiOnly.map(r => (
                  <div key={r.sym} onClick={() => { onChange(r.sym); setOpen(false); setSearch(''); }}
                    style={{ padding: "11px 16px", cursor: "pointer", borderBottom: `1px solid ${U.border}`, display: "flex", alignItems: "center", gap: 8 }}
                    onMouseEnter={e => (e.currentTarget.style.background = U.glass)}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: U.text }}>{r.sym}</span>
                      <div style={{ fontSize: 10, color: U.textMute, marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.name}</div>
                    </div>
                    <span style={{ fontSize: 9, color: U.cyan, background: U.cyanSoft, padding: "2px 7px", borderRadius: 999, fontWeight: 600 }}>load</span>
                  </div>
                ))}
              </>
            )}
            {search && !filteredOptions.length && !apiOnly.length && (
              <div style={{ padding: "16px", textAlign: "center", fontSize: 11, color: U.textMute }}>No matches</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
