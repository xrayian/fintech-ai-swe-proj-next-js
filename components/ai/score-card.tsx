'use client';

import { useState } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { U, fmt } from '@/lib/constants';
import { GlassCard } from '@/components/shared/glass-card';
import { ScoreBadge } from './score-badge';

interface ScoreCardProps {
  ticker: string;
  data: any;
  expanded: boolean;
  onToggle: () => void;
}

export function ScoreCard({ ticker, data, expanded, onToggle }: ScoreCardProps) {
  const [h, sh] = useState(false);

  const coach: Record<string, string> = {
    AAPL: "Apple combines exceptional capital efficiency (ROE 147%) with consistent dividend growth. At P/E 28×, it trades at a modest premium to the S&P 500 but below its 5-year average of 32×. Strong free cash flow and $90B buyback program provide downside protection.",
    MSFT: "Microsoft's cloud dominance via Azure (35% YoY growth) and AI integration across Office 365 and GitHub Copilot creates durable competitive moats. Best-in-class 43% net margin with a conservative 0.52 D/E ratio signals financial resilience.",
    NVDA: "NVIDIA is at the epicenter of the AI infrastructure build-out. While the P/E of 68× appears stretched, the 84% revenue CAGR justifies this premium if GPU demand remains structural. High conviction, high volatility — position size accordingly.",
    TSLA: "Tesla's margin compression (8.2%) and slowing delivery growth are concerning near-term headwinds. However, energy storage and FSD optionality provide long-term upside. Suitable only for investors with 5+ year horizons and high risk tolerance.",
    GOOGL: "Alphabet's 22× P/E is the most attractive valuation in mega-cap tech. Search monetization remains resilient and Google Cloud is approaching profitability inflection. Near-zero debt (0.09 D/E) makes this a low-risk, high-quality compounder.",
    AMZN: "Amazon's AWS segment provides ~70% of operating income while the core retail business continues margin expansion. Revenue CAGR of 17% at a 44× P/E is reasonable for a business with cloud, ad, and logistics optionality.",
    META: "Meta's AI-driven ad targeting recovery has produced exceptional ROE (34.8%) and margin expansion (35%). With a 24× P/E and $60B+ buyback authorization, this is one of the most compelling risk/reward setups in large-cap tech.",
    NFLX: "Netflix's ad-supported tier and password-sharing crackdown have reignited subscriber growth. However, 1.24× D/E and 16.8% margin leave less room for error than peers. A solid hold for entertainment-focused portfolios.",
  };

  const coachText = coach[ticker] || `${data.name} shows a score of ${data.score}/10 with a ${data.verdict.toLowerCase()} signal. P/E of ${data.pe}× and ROE of ${fmt(data.roe, 1)}% reflect ${data.tag.toLowerCase()} characteristics. Review fundamentals before entering.`;

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
