'use client';

import { useState, useEffect } from 'react';
import { BarChart2, Trophy, BarChart3, Zap, AlertTriangle, TrendingUp } from 'lucide-react';
import {
  RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, Legend, ResponsiveContainer
} from 'recharts';
import { U, SCORECARD, fmt } from '@/lib/constants';
import { StockSelector } from './stock-selector';
import { SectionTitle } from '@/components/shared/section-title';
import { GlassCard } from '@/components/shared/glass-card';

export default function CompareAnalytics() {
  const [mounted, setMounted] = useState(false);
  const [symA, setSymA] = useState("AAPL");
  const [symB, setSymB] = useState("MSFT");

  useEffect(() => {
    setMounted(true);
  }, []);

  const a = (SCORECARD as any)[symA];
  const b = (SCORECARD as any)[symB];

  const radarData = [
    { m: "Valuation", A: a.radar.val, B: b.radar.val },
    { m: "Profitability", A: a.radar.prof, B: b.radar.prof },
    { m: "Growth", A: a.radar.growth, B: b.radar.growth },
    { m: "Health", A: a.radar.health, B: b.radar.health },
    { m: "Momentum", A: a.radar.mom, B: b.radar.mom },
    { m: "Sentiment", A: a.radar.sent, B: b.radar.sent },
  ];

  const metrics = [
    { l: "Revenue CAGR", a: a.cagr, b: b.cagr, u: "%" },
    { l: "ROE", a: a.roe, b: b.roe, u: "%" },
    { l: "Net Margin", a: a.margin, b: b.margin, u: "%" },
    { l: "P/E Ratio", a: a.pe, b: b.pe, u: "×", inv: true },
    { l: "D/E Ratio", a: a.de, b: b.de, u: "×", inv: true },
    { l: "AI Score", a: a.score * 10, b: b.score * 10, u: "/100" },
  ];

  const winner = a.score >= b.score ? symA : symB;
  const loser = a.score >= b.score ? symB : symA;
  const winnerData = a.score >= b.score ? a : b;
  const loserData = a.score >= b.score ? b : a;
  const winnerColor = winner === symA ? U.cyan : U.violet;
  const winnerMetrics = metrics.filter(m => {
    const aw = m.inv ? m.a < m.b : m.a > m.b;
    return winner === symA ? aw : !aw;
  }).length;

  const marginEdge = a.margin >= b.margin ? { leader: symA, lVal: a.margin, fVal: b.margin } : { leader: symB, lVal: b.margin, fVal: a.margin };
  const roeEdge = a.roe >= b.roe ? { leader: symA, lVal: fmt(a.roe, 1), fVal: fmt(b.roe, 1) } : { leader: symB, lVal: fmt(b.roe, 1), fVal: fmt(a.roe, 1) };

  const verdictRows = [
    { icon: Trophy, label: "Winner", color: winnerColor, value: <><span style={{ color: winnerColor, fontWeight: 700 }}>{winner}</span><span style={{ color: U.textDim }}> — {winnerData.score}/10 AI Score</span></> },
    { icon: BarChart3, label: "Key Edge", color: U.textMute, value: <span style={{ color: U.textDim }}>Margin <span style={{ color: winnerColor, fontWeight: 600 }}>{marginEdge.lVal}%</span><span style={{ color: U.textMute }}> vs {marginEdge.fVal}%</span>{" · "}ROE <span style={{ color: winnerColor, fontWeight: 600 }}>{roeEdge.lVal}%</span><span style={{ color: U.textMute }}> vs {roeEdge.fVal}%</span></span> },
    { icon: Zap, label: "Action", color: U.amber, value: <span style={{ color: U.textDim }}>Stronger hold for <span style={{ color: U.text, fontWeight: 600 }}>12-month</span> horizon. {winner === "AAPL" || winner === "GOOGL" || winner === "META" ? "Valuation is attractive relative to growth." : "Premium justified by structural tailwinds."}</span> },
    { icon: AlertTriangle, label: "Risk", color: U.rose, value: <span style={{ color: U.textDim }}><span style={{ color: U.rose, fontWeight: 600 }}>{loser}</span> — {loserData.verdict.toLowerCase()}. P/E {loserData.pe}× warrants position-sizing discipline.</span> },
  ];

  return (
    <div style={{ animation: "fi .25s ease" }}>
      <div style={{ marginBottom: 16 }}>
        <SectionTitle icon={BarChart2}>Select two stocks to compare</SectionTitle>
        <div style={{ display: "flex", gap: 12, alignItems: "flex-start", position: "relative" }}>
          <StockSelector value={symA} onChange={setSymA} exclude={symB} accent={U.cyan} accentRgb="34,211,238" label="Stock A" isWinner={winner === symA} />
          <div style={{
            flexShrink: 0, alignSelf: "center", width: 36, height: 36, borderRadius: "50%",
            background: U.glass, border: `1px solid ${U.borderHi}`, backdropFilter: "blur(12px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 11, fontWeight: 800, color: U.textMute
          }}>VS</div>
          <StockSelector value={symB} onChange={setSymB} exclude={symA} accent={U.violet} accentRgb="167,139,250" label="Stock B" isWinner={winner === symB} />
        </div>
      </div>

      <GlassCard style={{
        padding: "14px 18px", marginBottom: 14,
        background: `linear-gradient(135deg,rgba(34,211,238,0.06),rgba(167,139,250,0.06))`,
        border: `1px solid ${winnerColor}30`, display: "flex", alignItems: "center", gap: 12
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: "50%", background: `rgba(${winner === symA ? "34,211,238" : "167,139,250"},0.15)`,
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          border: `1px solid rgba(${winner === symA ? "34,211,238" : "167,139,250"},0.25)`
        }}>
          <Trophy size={18} color={winnerColor} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: U.text, marginBottom: 4 }}>
            <span style={{ color: winnerColor }}>{winner}</span> leads with a higher AI score
            <span style={{ color: winnerColor, fontFamily: 'JetBrains Mono', marginLeft: 6 }}>{winnerData.score}/10</span>
            <span style={{ color: U.textMute, fontFamily: 'JetBrains Mono' }}> vs {loserData.score}/10</span>
          </div>
          <div style={{ fontSize: 11, color: U.textMute }}>{winner} wins <strong style={{ color: winnerColor }}>{winnerMetrics}</strong> of {metrics.length} metrics</div>
        </div>
        <div style={{ display: "flex", gap: 7, flexShrink: 0, flexWrap: "wrap", justifyContent: "flex-end" }}>
          {[
            { label: "AI Score", val: `${winnerData.score}/10`, color: winnerColor, rgb: winner === symA ? "34,211,238" : "167,139,250" },
            { label: "Margin", val: `${winnerData.margin}%`, color: winnerColor, rgb: winner === symA ? "34,211,238" : "167,139,250" },
          ].map(p => (
            <div key={p.label} style={{ background: `rgba(${p.rgb},0.1)`, border: `1px solid rgba(${p.rgb},0.22)`, borderRadius: 8, padding: "5px 10px", textAlign: "center" }}>
              <div style={{ fontSize: 9, color: U.textMute, textTransform: "uppercase", letterSpacing: "0.08em" }}>{p.label}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: p.color, fontFamily: 'JetBrains Mono', marginTop: 1 }}>{p.val}</div>
            </div>
          ))}
        </div>
      </GlassCard>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <GlassCard style={{ padding: "20px 22px", display: "flex", flexDirection: "column" }}>
          <SectionTitle>Radar — 6 Dimensions</SectionTitle>
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {mounted ? (
              <ResponsiveContainer width="100%" height={320}>
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
                  <PolarGrid stroke="rgba(255,255,255,0.07)" />
                  <PolarAngleAxis dataKey="m" tick={{ fill: U.textDim, fontSize: 10, fontFamily: 'Inter, sans-serif' }} />
                  <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar name={symA} dataKey="A" stroke={U.cyan} fill={U.cyan} fillOpacity={.1} strokeWidth={2} dot={{ fill: U.cyan, r: 3 }} />
                  <Radar name={symB} dataKey="B" stroke={U.violet} fill={U.violet} fillOpacity={.08} strokeWidth={2} dot={{ fill: U.violet, r: 3 }} />
                  <Legend formatter={(v: string) => <span style={{ color: v === symA ? U.cyan : U.violet, fontSize: 11, fontWeight: 600, fontFamily: 'Inter, sans-serif' }}>{v}</span>} />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: 320, display: "flex", alignItems: "center", justifyContent: "center", color: U.textMute }}>Initializing Radar...</div>
            )}
          </div>
        </GlassCard>

        <GlassCard style={{ padding: "20px 22px", display: "flex", flexDirection: "column" }}>
          <SectionTitle>Metric Breakdown</SectionTitle>
          <div style={{ flex: 1 }}>
            {metrics.map(m => {
              const mx = Math.max(m.a, m.b) || 1;
              const aw = m.inv ? m.a < m.b : m.a > m.b;
              const winSym = aw ? symA : symB;
              const winColor = aw ? U.cyan : U.violet;
              return (
                <div key={m.l} style={{ marginBottom: 11 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontSize: 11, color: U.textDim }}>{m.l}</span>
                      <span style={{
                        fontSize: 8, color: winColor, background: `rgba(${aw ? "34,211,238" : "167,139,250"},0.12)`,
                        padding: "1px 6px", borderRadius: 999, fontWeight: 700,
                        border: `1px solid rgba(${aw ? "34,211,238" : "167,139,250"},0.22)`,
                        display: "flex", alignItems: "center", gap: 3
                      }}>{winSym} <TrendingUp size={8} /></span>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: U.cyan, fontFamily: 'JetBrains Mono', minWidth: 44, textAlign: "right", flexShrink: 0 }}>{fmt(m.a, 1)}{m.u}</span>
                    <div style={{ flex: 1, display: "flex", gap: 2, height: 6, borderRadius: 999, overflow: "hidden" }}>
                      <div style={{ flex: m.a / mx, background: aw ? U.cyan : "rgba(34,211,238,0.18)", borderRadius: "999px 0 0 999px", transition: "flex .45s ease" }} />
                      <div style={{ flex: m.b / mx, background: !aw ? U.violet : "rgba(167,139,250,0.18)", borderRadius: "0 999px 999px 0", transition: "flex .45s ease" }} />
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 700, color: U.violet, fontFamily: 'JetBrains Mono', minWidth: 44, textAlign: "left", flexShrink: 0 }}>{fmt(m.b, 1)}{m.u}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{
            marginTop: 12, padding: "16px 18px",
            background: `linear-gradient(135deg,rgba(255,255,255,0.02),rgba(255,255,255,0.01))`,
            backdropFilter: "blur(12px)",
            border: `1px solid ${U.border}`,
            borderRadius: 14,
            borderLeft: `3px solid ${winnerColor}`,
            boxShadow: `inset 0 1px 0 rgba(255,255,255,0.05)`
          }}>
            <div style={{
              fontSize: 10, fontWeight: 700, color: U.textMute, textTransform: "uppercase",
              letterSpacing: "0.14em", marginBottom: 12, display: "flex", alignItems: "center", gap: 7
            }}>
              <Zap size={10} color={winnerColor} fill={winnerColor} /> AI Verdict
            </div>
            {verdictRows.map(row => (
              <div key={row.label} style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 8 }}>
                <div style={{
                  width: 22, height: 22, borderRadius: 6, background: U.glassLo,
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1,
                  border: `1px solid ${U.border}`
                }}>
                  <row.icon size={11} color={row.color} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <span style={{
                    fontSize: 9, fontWeight: 700, color: U.textFaint, textTransform: "uppercase",
                    letterSpacing: "0.08em"
                  }}>{row.label}</span>
                  <div style={{ fontSize: 11, color: U.textDim, lineHeight: 1.5 }}>{row.value}</div>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
