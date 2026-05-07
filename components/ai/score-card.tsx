'use client';

import { useState } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { U, fmt } from '@/lib/constants';
import type { ScorecardData } from '@/lib/scorecard-utils';
import { GlassCard } from '@/components/shared/glass-card';
import { ScoreBadge } from './score-badge';

interface ScoreCardProps {
  ticker: string;
  data: ScorecardData;
  expanded: boolean;
  onToggle: () => void;
}

function generateCoach(d: ScorecardData, ticker: string): string {
  const marginDesc = d.margin > 35 ? 'exceptional' : d.margin > 20 ? 'strong' : d.margin > 10 ? 'healthy' : 'moderate';
  const growthDesc = d.cagr > 50 ? 'exceptional' : d.cagr > 20 ? 'strong' : d.cagr > 10 ? 'steady' : d.cagr > 5 ? 'moderate' : 'slowing';
  const debtDesc = d.de < 0.3 ? 'minimal' : d.de < 1 ? 'conservative' : d.de < 2 ? 'moderate' : 'elevated';
  const valDesc = d.pe < 15 ? 'attractive' : d.pe < 25 ? 'fair' : d.pe < 40 ? 'premium' : 'stretched';
  return `${d.name} shows a ${d.verdict.toLowerCase()} signal with AI Score ${d.score}/10. At ${d.pe}× P/E (${valDesc}), the ${d.tag.toLowerCase()} profile is supported by ${marginDesc} margins (${d.margin}%) and ${growthDesc} revenue growth (${d.cagr}% CAGR). ROE of ${d.roe}% and ${debtDesc} leverage (${d.de}× D/E) suggest ${d.roe > 30 ? 'efficient capital deployment' : 'room for operational improvement'}. Position sizing should reflect the ${d.score >= 7.5 ? 'favorable' : 'cautious'} risk/reward profile.`;
}

export function ScoreCard({ ticker, data, expanded, onToggle }: ScoreCardProps) {
  const [h, sh] = useState(false);
  const coachText = generateCoach(data, ticker);

  return (
    <GlassCard
      onMouseEnter={() => sh(true)}
      onMouseLeave={() => sh(false)}
      style={{
        overflow: "hidden", marginBottom: 8, transition: "all .2s",
        background: h ? U.glassHi : U.glass, borderColor: h ? U.borderHi : U.border
      }}
    >
      <div style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}
        onClick={onToggle}>
        <ScoreBadge score={data.score} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, color: U.text, fontSize: 14, letterSpacing: "-0.01em" }}>{ticker}</div>
          <div style={{ fontSize: 11, color: U.textDim, marginTop: 3 }}>{data.verdict}</div>
        </div>
        <span style={{
          background: U.violetSoft, color: U.violet, borderRadius: 999,
          padding: "4px 10px", fontSize: 10, fontWeight: 600, flexShrink: 0,
          border: "1px solid rgba(167,139,250,0.22)"
        }}>{data.tag}</span>
        {expanded ? <ChevronDown size={13} color={U.textMute} /> : <ChevronRight size={13} color={U.textMute} />}
      </div>
      {expanded && (
        <div style={{ borderTop: `1px solid ${U.border}`, padding: "14px 16px", animation: "fi .22s ease" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 7, marginBottom: 12 }}>
            {[
              { l: "P/E Ratio", v: fmt(data.pe) + "×", n: data.pe < 35 ? "Fairly Valued" : "Premium" },
              { l: "ROE", v: fmt(data.roe) + "%", n: data.roe > 30 ? "Exceptional" : "Average" },
              { l: "Rev CAGR", v: "+" + fmt(data.cagr) + "%", n: data.cagr > 20 ? "High Growth" : "Stable" },
              { l: "Net Margin", v: fmt(data.margin) + "%", n: data.margin > 20 ? "Strong" : "Moderate" },
              { l: "D/E Ratio", v: fmt(data.de, 2) + "×", n: data.de < 1 ? "Low Leverage" : "Leveraged" },
              { l: "AI Score", v: data.score + "/10", n: data.verdict },
            ].map(m => (
              <div key={m.l} style={{ background: U.glassLo, border: `1px solid ${U.border}`, borderRadius: 8, padding: "9px 11px" }}>
                <div style={{
                  fontSize: 9, color: U.textMute, fontWeight: 600,
                  textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4
                }}>{m.l}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: U.text, fontFamily: 'JetBrains Mono' }}>{m.v}</div>
                <div style={{ fontSize: 9, color: U.textDim, marginTop: 3 }}>{m.n}</div>
              </div>
            ))}
          </div>
          <div style={{
            fontSize: 12, color: U.textDim, lineHeight: 1.7, padding: "12px 14px",
            background: `linear-gradient(135deg,${U.cyanSoft},${U.violetSoft})`,
            border: "1px solid rgba(167,139,250,0.18)",
            borderRadius: 10, borderLeft: `3px solid ${U.cyan}`
          }}>
            <strong style={{ color: U.text }}>AI Coach: </strong>{coachText}
          </div>
        </div>
      )}
    </GlassCard>
  );
}
