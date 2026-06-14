'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Circle, AlertTriangle, Search as SearchIcon, X } from 'lucide-react';
import { U } from '@/lib/constants';
import { Chip } from '@/components/shared/chip';
import { GlassCard } from '@/components/shared/glass-card';
import { ErrorMessage } from '@/components/shared/error-message';
import { useWatchlist } from '@/hooks/use-watchlist';

const CandleChart = dynamic(() => import('./candle-chart').then(m => m.CandleChart), {
  ssr: false,
  loading: () => <div style={{ height: 340, display: 'flex', alignItems: 'center', justifyContent: 'center', color: U.textMute }}>Loading Chart...</div>
});

const CNT_MAP: Record<string, number> = { "1D": 5, "1W": 10, "1M": 22, "3M": 66, "1Y": 100 };

function ema(arr: number[], p: number): number | null {
  if (arr.length < p) return null;
  const k = 2 / (p + 1);
  let val = arr.slice(0, p).reduce((s, v) => s + v, 0) / p;
  for (let i = p; i < arr.length; i++) val = arr[i] * k + val * (1 - k);
  return val;
}

function computeIndicators(candles: { open: number; high: number; low: number; close: number; volume: number }[]) {
  const c = candles.map(x => x.close);
  const l = c.length;
  if (!l) return null;

  const pvSum = candles.reduce((s, x) => s + ((x.high + x.low + x.close) / 3) * x.volume, 0);
  const vSum = candles.reduce((s, x) => s + x.volume, 0);
  const vwap = vSum ? pvSum / vSum : null;

  const sma = (n: number) => l >= n ? c.slice(-n).reduce((s, v) => s + v, 0) / n : null;
  const sma20 = sma(20);
  const sma50 = sma(50);

  const bbMid = sma20;
  const bbStd = l >= 20 ? Math.sqrt(c.slice(-20).reduce((s, v) => s + (v - sma20!) ** 2, 0) / 20) : null;
  const bbUpper = bbMid != null && bbStd != null ? bbMid + 2 * bbStd : null;
  const bbLower = bbMid != null && bbStd != null ? bbMid - 2 * bbStd : null;

  let rsi: number | null = null;
  if (l >= 15) {
    let gains = 0, losses = 0;
    for (let i = l - 14; i < l; i++) {
      const d = c[i] - c[i - 1];
      if (d > 0) gains += d; else losses -= d;
    }
    const ag = gains / 14, al = losses / 14;
    rsi = al === 0 ? 100 : 100 - 100 / (1 + ag / al);
  }

  const ema12 = ema(c, 12);
  const ema26 = ema(c, 26);
  let macd: { value: number; signal: number; histogram: number } | null = null;
  if (ema12 != null && ema26 != null) {
    const mc = ema12 - ema26;
    const sig = c.length >= 26 + 9 ? ema(c.slice(26), 9)! : mc * 0.87;
    macd = { value: mc, signal: sig, histogram: mc - sig };
  }

  const support = candles.slice(-20).reduce((m, x) => Math.min(m, x.low), Infinity);
  const lastC = c[l - 1];
  let bbPos = "Mid-band";
  if (bbUpper != null && lastC >= bbUpper * 0.97) bbPos = "Upper Band";
  else if (bbLower != null && lastC <= bbLower * 1.03) bbPos = "Lower Band";

  return {
    rsi, vwap,
    macdValue: macd?.value ?? null,
    macdSignal: macd?.signal ?? null,
    macdHistogram: macd?.histogram ?? null,
    sma20, sma50,
    bbUpper, bbMid, bbLower, bbPos,
    support: support !== Infinity ? support : null,
  };
}

export default function TechnicalSuite({ initialSymbol }: { initialSymbol?: string }) {
  const { watchlist } = useWatchlist();
  const [sel, setSel] = useState(() => initialSymbol || watchlist[0]?.sym || "AAPL");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ sym: string; name: string }[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setSearchOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    let active = true;
    if (!searchQuery.trim()) {
      Promise.resolve().then(() => {
        if (active) setSearchResults([]);
      });
      return () => { active = false; };
    }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/symbols?q=${encodeURIComponent(searchQuery)}`);
        if (!res.ok) return;
        const data = await res.json();
        if (active) setSearchResults(data);
      } catch {}
    }, 200);
    return () => {
      active = false;
      clearTimeout(debounceRef.current);
    };
  }, [searchQuery]);
  const [tf, setTf] = useState("1M");
  const [allCandles, setAllCandles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);

  const candles = useMemo(() => {
    const n = CNT_MAP[tf] || 22;
    return allCandles.slice(-n);
  }, [allCandles, tf]);

  const loadRef = useRef<(() => void) | null>(null);
  const retry = useCallback(() => loadRef.current?.(), []);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      await Promise.resolve();
      if (!mounted) return;
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/market/candles?symbol=${sel}`);
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body?.error || 'Candle data unavailable');
        }
        const data = await res.json();
        if (!mounted) return;
        setAllCandles(data.map((x: any) => ({ ...x, bullish: x.close >= x.open })));
        setError(null);
        setLastRefreshed(new Date());
      } catch (e) {
        if (mounted) setError(e instanceof Error ? e.message : 'Candle data unavailable');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    loadRef.current = load;
    load();
    return () => { mounted = false; };
  }, [sel]);

  const inds = useMemo(() => computeIndicators(candles), [candles]);
  const lastC = candles.length ? candles[candles.length - 1].close : null;
  const firstC = candles.length ? candles[0].close : null;
  const chg = lastC != null && firstC != null ? lastC - firstC : null;
  const chgPct = lastC != null && firstC != null ? ((lastC - firstC) / firstC * 100) : null;

  const indicatorCards = [
    {
      l: "RSI (14)",
      v: inds?.rsi != null ? inds.rsi.toFixed(1) : "—",
      n: inds?.rsi != null
        ? (inds.rsi > 70 ? "Overbought — potential reversal" : inds.rsi < 30 ? "Oversold — potential bounce" : "Neutral — not overbought")
        : "Insufficient data",
      accent: inds?.rsi != null ? (inds.rsi > 70 ? U.rose : inds.rsi < 30 ? U.emerald : U.amber) : U.textDim,
    },
    {
      l: "VWAP",
      v: inds?.vwap != null ? `$${inds.vwap.toFixed(2)}` : "—",
      n: inds?.vwap != null && lastC != null
        ? (lastC >= inds.vwap ? "Price trading above VWAP ↑" : "Price trading below VWAP ↓")
        : "Insufficient data",
      accent: inds?.vwap != null ? (lastC != null && lastC >= inds.vwap ? U.cyan : U.rose) : U.textDim,
    },
    {
      l: "MACD Signal",
      v: inds?.macdHistogram != null ? `${inds.macdHistogram >= 0 ? "+" : ""}${inds.macdHistogram.toFixed(2)}` : "—",
      n: inds?.macdHistogram != null
        ? (inds.macdHistogram > 0 ? "Bullish crossover confirmed" : "Bearish crossover detected")
        : "Insufficient data",
      accent: inds?.macdHistogram != null ? (inds.macdHistogram > 0 ? U.emerald : U.rose) : U.textDim,
    },
    {
      l: "Bollinger Band",
      v: inds?.bbPos ?? "—",
      n: inds?.bbPos === "Mid-band" ? "No squeeze detected"
        : inds?.bbPos === "Upper Band" ? "Near upper band — overextended"
        : "Near lower band — potential bounce",
      accent: inds?.bbPos === "Upper Band" ? U.rose : inds?.bbPos === "Lower Band" ? U.emerald : U.textDim,
    },
    {
      l: "50D SMA",
      v: inds?.sma50 != null ? `$${inds.sma50.toFixed(2)}` : "—",
      n: inds?.sma50 != null && lastC != null
        ? `Price ${lastC >= inds.sma50 ? "+" : ""}${((lastC - inds.sma50) / inds.sma50 * 100).toFixed(1)}% ${lastC >= inds.sma50 ? "above" : "below"} SMA`
        : "Insufficient data",
      accent: U.violet,
    },
    {
      l: "Support Level",
      v: inds?.support != null ? `$${inds.support.toFixed(2)}` : "—",
      n: inds?.support != null ? "Key demand zone" : "Insufficient data",
      accent: U.rose,
    },
  ];

  return (
    <div style={{ animation: "fi .4s ease" }}>
      <div style={{ display: "flex", gap: 7, marginBottom: 14, flexWrap: "wrap", alignItems: "center" }}>
        {watchlist.slice(0, 6).map(t => <Chip key={t.sym} label={t.sym} active={sel === t.sym} onClick={() => setSel(t.sym)} />)}
        <div ref={searchRef} style={{ position: "relative" }}>
          <button onClick={() => setSearchOpen(!searchOpen)} style={{
            padding: "6px 12px", borderRadius: 999, border: `1px solid ${searchOpen ? U.cyan : U.border}`,
            background: searchOpen ? U.cyanSoft : U.glassLo, color: searchOpen ? U.cyan : U.textDim,
            fontSize: 11, fontWeight: 600, cursor: "pointer", transition: "all .15s",
            display: "flex", alignItems: "center", gap: 5
          }}><SearchIcon size={11} /> Search</button>
          {searchOpen && (
            <div style={{
              position: "absolute", top: "calc(100% + 6px)", left: 0, zIndex: 100, width: 240,
              background: U.navBg, backdropFilter: "blur(24px)", borderRadius: 12,
              border: `1px solid ${U.borderHi}`, overflow: "hidden", boxShadow: "0 12px 40px rgba(0,0,0,0.15)"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", borderBottom: `1px solid ${U.border}` }}>
                <SearchIcon size={13} color={U.textMute} />
                <input autoFocus value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Type a symbol..."
                  style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: U.text, fontSize: 12 }}
                />
                {searchQuery && <X size={13} color={U.textMute} style={{ cursor: "pointer" }} onClick={() => { setSearchQuery(''); setSearchResults([]); }} />}
              </div>
              <div style={{ maxHeight: 200, overflow: "auto" }}>
                {searchResults.slice(0, 10).map(r => (
                  <div key={r.sym} onClick={() => { setSel(r.sym); setSearchOpen(false); setSearchQuery(''); setSearchResults([]); }}
                    style={{ padding: "9px 12px", cursor: "pointer", borderBottom: `1px solid ${U.border}`, display: "flex", alignItems: "center", gap: 8 }}
                    onMouseEnter={e => (e.currentTarget.style.background = U.glass)}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                  >
                    <span style={{ fontSize: 12, fontWeight: 700, color: U.text }}>{r.sym}</span>
                    <span style={{ fontSize: 10, color: U.textMute, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.name}</span>
                  </div>
                ))}
                {searchQuery && !searchResults.length && (
                  <div style={{ padding: "16px", textAlign: "center", fontSize: 11, color: U.textMute }}>No matches</div>
                )}
              </div>
            </div>
          )}
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 5 }}>
          {["1D", "1W", "1M", "3M", "1Y"].map(t => <Chip key={t} label={t} active={tf === t} onClick={() => setTf(t)} />)}
        </div>
      </div>
      <GlassCard style={{ padding: "20px 22px", marginBottom: 14 }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 4 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: U.text }}>{sel}</span>
          {loading ? (
            <span style={{
              fontSize: 9, fontWeight: 700, color: U.amber, background: U.amberSoft,
              padding: "3px 10px", borderRadius: 999,
              border: `1px solid ${U.amberSoft}`, letterSpacing: "0.07em",
              display: "flex", alignItems: "center", gap: 5
            }}>LOADING</span>
          ) : error ? (
            <span style={{
              fontSize: 9, fontWeight: 700, color: U.rose, background: U.roseSoft,
              padding: "3px 10px", borderRadius: 999,
              border: `1px solid ${U.roseSoft}`, letterSpacing: "0.07em",
              display: "flex", alignItems: "center", gap: 5
            }}><AlertTriangle size={8} color={U.rose} /> OFFLINE</span>
          ) : (
            <span style={{
              fontSize: 9, fontWeight: 700, color: U.up, background: U.emeraldSoft,
              padding: "3px 10px", borderRadius: 999,
              border: `1px solid ${U.emeraldSoft}`, letterSpacing: "0.07em",
              display: "flex", alignItems: "center", gap: 5
            }}><Circle size={6} fill={U.up} /> CACHED</span>
          )}
          {chg != null && (
            <span style={{
              fontSize: 12, fontWeight: 600, color: chg >= 0 ? U.up : U.down,
              fontFamily: 'JetBrains Mono',
              padding: "2px 8px", background: chg >= 0 ? U.emeraldSoft : U.roseSoft, borderRadius: 6,
              border: `1px solid rgba(${chg >= 0 ? "52,211,153" : "251,113,133"},0.25)`,
            }}>
              {chg >= 0 ? "+" : ""}${chg.toFixed(2)} ({chgPct != null ? `${chg >= 0 ? "+" : ""}${chgPct.toFixed(2)}` : "—"}%)
            </span>
          )}
          <span style={{ marginLeft: "auto", fontSize: 10, color: U.textMute }}>
            {lastRefreshed ? `Updated ${lastRefreshed.toLocaleTimeString()}` : "Loading..."}
          </span>
        </div>
        {error && !candles.length && (
          <div style={{ marginBottom: 8 }}>
            <ErrorMessage message={error} onRetry={retry} />
          </div>
        )}
        <CandleChart data={candles} loading={loading} />
      </GlassCard>
      {error && !candles.length ? (
        <ErrorMessage message={error + " — indicators unavailable without chart data"} compact />
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "var(--grid-3)" as any, gap: 8 }}>
          {indicatorCards.map(ind => (
            <GlassCard key={ind.l} style={{ padding: "12px 14px", position: "relative", overflow: "hidden" }} className="glow-hover">
              <div style={{
                position: "absolute", top: 0, left: 0, right: 0, height: 2,
                background: `linear-gradient(90deg,transparent,${ind.accent},transparent)`,
                boxShadow: `0 0 12px ${ind.accent}`
              }} />
              <div style={{
                position: "absolute", top: -15, left: "50%", transform: "translateX(-50%)",
                width: 80, height: 30, background: ind.accent, opacity: 0.15, filter: "blur(15px)"
              }} />
              <div style={{
                fontSize: 9, fontWeight: 600, color: U.textMute, textTransform: "uppercase",
                letterSpacing: "0.1em", marginBottom: 5
              }}>{ind.l}</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: U.text, fontFamily: 'JetBrains Mono', letterSpacing: "-0.02em" }}>{ind.v}</div>
              <div style={{ fontSize: 10, color: U.textDim, marginTop: 4 }}>{ind.n}</div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}
