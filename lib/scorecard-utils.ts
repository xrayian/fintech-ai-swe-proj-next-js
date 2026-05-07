import type { NormalizedFundamentals } from '@/lib/providers/types';

export interface ScorecardData {
  pe: number;
  roe: number;
  cagr: number;
  margin: number;
  de: number;
  score: number;
  verdict: string;
  tag: string;
  name: string;
  radar: {
    val: number;
    prof: number;
    growth: number;
    health: number;
    mom: number;
    sent: number;
  };
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

export function computeScorecard(f: NormalizedFundamentals): ScorecardData {
  const pe = f.peRatio;
  const roePct = f.roe * 100;
  const cagrPct = f.revenueCagr * 100;
  const marginPct = f.netMargin * 100;
  const de = f.debtEquity;

  const val = clamp(100 - pe * 0.8, 5, 95);
  const prof = clamp(roePct * 0.3 + marginPct * 0.7, 5, 95);
  const growth = clamp(cagrPct * 3 + 15, 5, 95);
  const health = clamp(100 - Math.min(de, 6) * 10, 5, 95);
  const mom = clamp(growth * 0.5 + val * 0.3 + prof * 0.2, 5, 95);
  const sent = clamp(prof * 0.5 + health * 0.5, 5, 95);

  const rawScore = (val * 0.05 + prof * 0.25 + growth * 0.20 + health * 0.20 + mom * 0.15 + sent * 0.15) / 10;
  const score = clamp(Math.round(rawScore * 10) / 10, 1, 10);

  const verdict =
    score >= 9 ? 'Strong Buy Signal' :
    score >= 7.5 ? 'Wise to Invest' :
    score >= 6.5 ? 'Cautious Buy' :
    score >= 5 ? 'Proceed with Caution' :
    'Avoid';

  const dims = [
    { k: 'High Growth', v: growth },
    { k: 'Margin Power', v: prof },
    { k: 'Value Growth', v: val },
    { k: 'Stable Growth', v: health },
  ].sort((a, b) => b.v - a.v);
  const tag = dims[0].k;

  return {
    pe,
    roe: Math.round(roePct * 10) / 10,
    cagr: Math.round(cagrPct * 10) / 10,
    margin: Math.round(marginPct * 10) / 10,
    de: Math.round(de * 100) / 100,
    score,
    verdict,
    tag,
    name: f.name || f.symbol,
    radar: {
      val: Math.round(val),
      prof: Math.round(prof),
      growth: Math.round(growth),
      health: Math.round(health),
      mom: Math.round(mom),
      sent: Math.round(sent),
    },
  };
}
