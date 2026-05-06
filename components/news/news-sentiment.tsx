'use client';

import { useState } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { U, NEWS } from '@/lib/constants';
import { GlassCard } from '@/components/shared/glass-card';

export default function NewsSentiment() {
  const [exp, se] = useState<number | null>(null);

  const ss = (s: string) => {
    return ({
      "Extreme Greed": { bg: U.emeraldSoft, c: U.emerald, rgb: "52,211,153" },
      "Greed": { bg: U.cyanSoft, c: U.cyan, rgb: "34,211,238" },
      "Neutral": { bg: U.glass, c: U.textDim, rgb: "255,255,255" },
      "Fear": { bg: U.amberSoft, c: U.amber, rgb: "251,191,36" },
      "Extreme Fear": { bg: U.roseSoft, c: U.rose, rgb: "251,113,133" },
    } as any)[s] || { bg: U.glass, c: U.textDim, rgb: "255,255,255" };
  };

  return (
    <div style={{ animation: "fi .4s ease" }}>
      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        {[
          { l: "Fear & Greed", v: "52", s: "Neutral", accent: U.cyan },
          { l: "Bullish Articles", v: "64%", s: "of feed", accent: U.emerald },
          { l: "Bearish Articles", v: "28%", s: "of feed", accent: U.rose },
          { l: "AI Processed", v: "847", s: "today", accent: U.violet },
        ].map(k => (
          <GlassCard key={k.l} style={{ padding: "14px 18px", flex: 1, minWidth: 120, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg,transparent,${k.accent},transparent)` }} />
            <div style={{ fontSize: 9, fontWeight: 600, color: U.textMute, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 6 }}>{k.l}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: U.text, fontFamily: 'JetBrains Mono', lineHeight: 1.1 }}>{k.v}</div>
            <div style={{ fontSize: 10, color: U.textDim, marginTop: 5 }}>{k.s}</div>
          </GlassCard>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
        {NEWS.map(item => {
          const { bg, c, rgb } = ss(item.sentiment);
          const isE = exp === item.id;
          return (
            <GlassCard key={item.id} className="glow-hover" style={{ overflow: "hidden", cursor: "pointer", transition: "all .2s" }} onClick={() => se(isE ? null : item.id)}>
              <div style={{ padding: "13px 16px", display: "flex", alignItems: "flex-start", gap: 12 }}>
                <div style={{
                  background: bg, borderRadius: 9, padding: "8px 10px", textAlign: "center",
                  flexShrink: 0, minWidth: 52, border: `1px solid rgba(${rgb},0.22)`, boxShadow: `0 0 16px rgba(${rgb},0.15)`
                }}>
                  <div style={{ fontSize: 17, fontWeight: 700, color: c, fontFamily: 'JetBrains Mono', lineHeight: 1 }}>{item.fear}</div>
                  <div style={{ fontSize: 7, color: c, fontWeight: 600, textTransform: "uppercase", marginTop: 2, opacity: .8 }}>F/G</div>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12.5, color: U.text, lineHeight: 1.45, marginBottom: 6, fontWeight: 500 }}>{item.headline}</div>
                  <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                    <span style={{ fontSize: 10, color: U.textMute }}>{item.source}</span>
                    <span style={{ fontSize: 10, color: U.textMute }}>{item.time}</span>
                    <span style={{ fontSize: 10, color: U.textDim }}>{item.region}</span>
                    <span style={{ marginLeft: "auto", fontSize: 10, fontWeight: 600, color: c, background: bg, padding: "3px 10px", borderRadius: 999, flexShrink: 0, border: `1px solid rgba(${rgb},0.25)` }}>{item.sentiment}</span>
                  </div>
                </div>
                {isE ? <ChevronDown size={13} color={U.textMute} /> : <ChevronRight size={13} color={U.textMute} />}
              </div>
              {isE && (
                <div style={{ borderTop: `1px solid ${U.border}`, padding: "13px 16px", animation: "fi .2s ease" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7, marginBottom: 12 }}>
                    {[["Fear Score", item.fear + "/100"], ["Sentiment", item.sentiment], ["AI Confidence", "91%"], ["Market Impact", item.fear > 60 ? "High Risk" : "Moderate"]].map(([k, v]) => (
                      <div key={k} style={{ background: U.glassLo, border: `1px solid ${U.border}`, borderRadius: 8, padding: "8px 11px" }}>
                        <div style={{ fontSize: 9, color: U.textMute, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>{k}</div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: c, fontFamily: 'JetBrains Mono', marginTop: 3 }}>{v}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{
                    fontSize: 12, color: U.textDim, lineHeight: 1.7, padding: "12px 14px",
                    background: `linear-gradient(135deg,rgba(${rgb},0.07),rgba(${rgb},0.03))`,
                    border: `1px solid rgba(${rgb},0.18)`, borderRadius: 10, borderLeft: `3px solid ${c}`
                  }}>
                    <strong style={{ color: U.text }}>AI Analysis: </strong>
                    {item.fear > 60 ? "This article signals elevated market fear. Historically, fear scores above 60 correlate with short-term selling pressure. Consider reducing exposure to correlated assets." : item.fear < 30 ? "Strong greed signal detected. While bullish for momentum strategies, be cautious of overbought conditions." : "Neutral signal — market appears fairly priced for this event."}
                  </div>
                </div>
              )}
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
}
