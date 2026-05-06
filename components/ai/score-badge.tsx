'use client';

import { U } from '@/lib/constants';

interface ScoreBadgeProps {
  score: number;
  isWinner?: boolean;
}

export function ScoreBadge({ score, isWinner = false }: ScoreBadgeProps) {
  const [bg, fg, glow] =
    score >= 8 ? [U.emeraldSoft, U.emerald, "rgba(52,211,153,0.25)"] :
      score >= 6 ? [U.cyanSoft, U.cyan, "rgba(34,211,238,0.25)"] :
        score >= 4 ? [U.amberSoft, U.amber, "rgba(251,191,36,0.25)"] :
          [U.roseSoft, U.rose, "rgba(251,113,133,0.25)"];

  return (
    <div style={{
      background: bg, borderRadius: 10, padding: "8px 12px", textAlign: "center", minWidth: 54, flexShrink: 0,
      border: `1px solid ${glow}`,
      boxShadow: isWinner ? `0 0 28px ${glow}, 0 0 8px ${glow}` : `0 0 12px ${glow}`
    }}>
      <div style={{ fontSize: 20, fontWeight: 700, color: fg, fontFamily: 'JetBrains Mono', lineHeight: 1, letterSpacing: "-0.03em" }}>{score}</div>
      <div style={{ fontSize: 8, color: fg, marginTop: 3, fontWeight: 600, letterSpacing: "0.1em", opacity: .75 }}>/10</div>
    </div>
  );
}
