'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Circle, TrendingUp } from 'lucide-react';
import { U, TICKERS, CANDLE_DATA } from '@/lib/constants';
import { Chip } from '@/components/shared/chip';
import { GlassCard } from '@/components/shared/glass-card';

const CandleChart = dynamic(() => import('./candle-chart').then(m => m.CandleChart), { 
  ssr: false,
  loading: () => <div style={{ height: 340, display: 'flex', alignItems: 'center', justifyContent: 'center', color: U.textMute }}>Loading Chart...</div>
});

export default function TechnicalSuite() {
  const [sel, ss] = useState("AAPL");
  const [tf, st] = useState("1M");

  return (
    <div style={{ animation: "fi .4s ease" }}>
      <div style={{ display: "flex", gap: 7, marginBottom: 14, flexWrap: "wrap", alignItems: "center" }}>
        {TICKERS.slice(0, 6).map(t => <Chip key={t.sym} label={t.sym} active={sel === t.sym} onClick={() => ss(t.sym)} />)}
        <div style={{ marginLeft: "auto", display: "flex", gap: 5 }}>
          {["1D", "1W", "1M", "3M", "1Y"].map(t => <Chip key={t} label={t} active={tf === t} onClick={() => st(t)} />)}
        </div>
      </div>
      <GlassCard style={{ padding: "20px 22px", marginBottom: 14 }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 4 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: U.text }}>{sel}</span>
          <span style={{
            fontSize: 9, fontWeight: 700, color: U.up, background: U.emeraldSoft,
            padding: "3px 10px", borderRadius: 999,
            border: "1px solid rgba(52,211,153,0.28)", letterSpacing: "0.07em",
            animation: "pulse-dot 2.5s ease infinite",
            display: "flex", alignItems: "center", gap: 5
          }}><Circle size={6} fill={U.up} /> LIVE 250ms</span>
          <span style={{ marginLeft: "auto", fontSize: 10, color: U.textMute }}>OHLC + Volume Overlay</span>
        </div>
        <CandleChart data={CANDLE_DATA} />
      </GlassCard>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
        {[
          { l: "RSI (14)", v: "58.4", n: "Neutral — not overbought", accent: U.amber },
          { l: "VWAP", v: "$212.41", n: "Price trading above VWAP ↑", accent: U.cyan },
          { l: "MACD Signal", v: "+1.84", n: "Bullish crossover confirmed", accent: U.emerald },
          { l: "Bollinger Band", v: "Mid-band", n: "No squeeze detected", accent: U.textDim },
          { l: "50D SMA", v: "$208.30", n: "Price +3.1% above SMA", accent: U.violet },
          { l: "Support Level", v: "$207.20", n: "Key demand zone (3 touches)", accent: U.rose },
        ].map(ind => (
          <GlassCard key={ind.l} style={{ padding: "12px 14px", position: "relative", overflow: "hidden" }}>
            <div style={{
              position: "absolute", top: 0, left: 0, right: 0, height: 1,
              background: `linear-gradient(90deg,transparent,${ind.accent},transparent)`
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
    </div>
  );
}
