'use client';

import { ArrowUp, ArrowDown } from 'lucide-react';
import {
  ComposedChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell
} from "recharts";
import { U, fmt } from '@/lib/constants';

interface CandleChartProps {
  data: any[];
  loading?: boolean;
}

const CandleShape = (props: any) => {
  const { x, width, payload, minP = 170, maxP = 240 } = props;
  if (!payload || x == null) return null;
  const { open, close, high, low, bullish } = payload;
  const H = 240, rng = maxP - minP;
  const yS = (v: number) => H - ((v - minP) / rng) * H;
  const bw = Math.max((width || 10) * .6, 2.5);
  const cx = (x || 0) + (width || 10) / 2;
  const fill = bullish ? U.up : U.down;
  const bt = yS(Math.max(open, close)), bb = yS(Math.min(open, close));
  return (
    <g>
      <line x1={cx} y1={yS(high)} x2={cx} y2={yS(low)} stroke={fill} strokeWidth={1} opacity={.5} />
      <rect x={cx - bw / 2} y={bt} width={bw} height={Math.max(Math.abs(bt - bb), 2)} fill={fill} fillOpacity={.9} rx={1} />
    </g>
  );
};

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload; if (!d) return null;
  return (
    <div style={{
      background: U.navBg, padding: "10px 14px",
      boxShadow: "0 12px 40px rgba(0,0,0,0.15)",
      border: `1px solid ${U.border}`, borderRadius: 10, backdropFilter: "blur(12px)"
    }}>
      <div style={{ fontSize: 10, color: U.textMute, marginBottom: 6, fontFamily: 'JetBrains Mono' }}>{d.date}</div>
      {[["Open", d.open], ["High", d.high], ["Low", d.low], ["Close", d.close]].map(([k, v]) => (
        <div key={k as string} style={{
          display: "flex", justifyContent: "space-between", gap: 22, fontSize: 11,
          color: k === "Close" ? (d.bullish ? U.up : U.down) : U.textDim, fontFamily: 'JetBrains Mono'
        }}>
          <span>{k as string}</span><span style={{ fontWeight: 600 }}>${fmt(v as number)}</span>
        </div>
      ))}
    </div>
  );
};

export function CandleChart({ data, loading }: CandleChartProps) {
  if (!data.length) {
    return (
      <div style={{ height: 340, display: 'flex', alignItems: 'center', justifyContent: 'center', color: U.textMute }}>
        {loading ? 'Loading chart data...' : 'No data available'}
      </div>
    );
  }

  const prices = data.flatMap(d => [d.high, d.low]);
  const minP = Math.min(...prices) - 5, maxP = Math.max(...prices) + 5;
  const last = data[data.length - 1], up = last.close >= last.open;
  const enriched = data.map(d => ({ ...d, mid: (d.open + d.close) / 2, minP, maxP }));

  return (
    <div>
      <div style={{ display: "flex", gap: 14, alignItems: "baseline", marginBottom: 18, flexWrap: "wrap" }}>
        <span style={{ fontSize: 32, fontWeight: 700, color: U.text, fontFamily: 'JetBrains Mono', letterSpacing: "-0.035em" }}>
          ${fmt(last.close)}
        </span>
        <span style={{
          fontSize: 12, fontWeight: 600, color: up ? U.up : U.down, fontFamily: 'JetBrains Mono',
          padding: "4px 10px", background: up ? U.emeraldSoft : U.roseSoft, borderRadius: 6,
          border: `1px solid rgba(${up ? "52,211,153" : "251,113,133"},0.25)`,
          display: "flex", alignItems: "center", gap: 4
        }}>
          {up ? <ArrowUp size={12} /> : <ArrowDown size={12} />} {Math.abs(last.close - last.open).toFixed(2)} ({Math.abs((last.close - last.open) / last.open * 100).toFixed(2)}%)
        </span>
        <div style={{ marginLeft: "auto", display: "flex", gap: 14, fontSize: 11, color: U.textDim, fontFamily: 'JetBrains Mono' }}>
          {[["O", last.open], ["H", last.high], ["L", last.low], ["C", last.close]].map(([k, v]) => (
            <span key={k}><span style={{ color: U.textFaint }}>{k} </span>
              <b style={{ fontWeight: 600, color: U.text }}>{fmt(v)}</b></span>
          ))}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <ComposedChart data={enriched} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="2 4" stroke={U.border} vertical={false} />
          <XAxis dataKey="date" tick={{ fill: U.textMute, fontSize: 10, fontFamily: 'JetBrains Mono' }} tickLine={false} axisLine={false} interval={9} />
          <YAxis domain={[minP, maxP]} tick={{ fill: U.textMute, fontSize: 10, fontFamily: 'JetBrains Mono' }} tickLine={false} axisLine={false} width={48} tickFormatter={v => `$${v}`} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: U.glassLo }} />
          <Bar dataKey="mid" isAnimationActive={false} shape={(p: any) => <CandleShape {...p} minP={minP} maxP={maxP} />} />
        </ComposedChart>
      </ResponsiveContainer>
      <div style={{
        fontSize: 10, fontWeight: 600, color: U.textMute, textTransform: "uppercase",
        letterSpacing: "0.14em", borderTop: `1px solid ${U.border}`, paddingTop: 10, marginTop: 10
      }}>
        Volume
      </div>
      <ResponsiveContainer width="100%" height={58}>
        <ComposedChart data={enriched} margin={{ top: 0, right: 4, bottom: 0, left: 0 }}>
          <XAxis dataKey="date" hide /><YAxis hide />
          <Bar dataKey="volume" isAnimationActive={false} radius={[2, 2, 0, 0]}>
            {enriched.map((e, i) => <Cell key={i} fill={e.bullish ? U.emeraldSoft : U.roseSoft} />)}
          </Bar>
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
