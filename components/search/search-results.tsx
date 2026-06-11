import Link from 'next/link';
import { TrendingUp, BarChart3, ExternalLink } from 'lucide-react';
import { U } from '@/lib/constants';
import { GlassCard } from '@/components/shared/glass-card';
import type { SearchResult } from '@/hooks/use-symbol-search';

interface SearchResultsProps {
  results: SearchResult[];
}

export function SearchResults({ results }: SearchResultsProps) {
  if (results.length === 0) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
      {results.map(t => (
        <GlassCard key={t.sym} style={{ padding: "14px 18px", display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10,
            background: `linear-gradient(135deg,${U.cyanSoft},${U.violetSoft})`,
            display: "flex", alignItems: "center", justifyContent: "center",
            border: `1px solid ${U.borderHi}`, flexShrink: 0
          }}>
            <TrendingUp size={16} color={U.cyan} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: U.text }}>{t.sym}</span>
              <span style={{ fontSize: 11, color: U.textMute }}>{t.name}</span>
            </div>
            <div style={{ display: "flex", gap: 12, marginTop: 6 }}>
              <Link href={`/compare?symbol=${t.sym}`} style={{ textDecoration: "none", fontSize: 10, color: U.textFaint, display: "flex", alignItems: "center", gap: 4 }}>
                <BarChart3 size={10} /> Compare
              </Link>
              <Link href={`/technical?symbol=${t.sym}`} style={{ textDecoration: "none", fontSize: 10, color: U.textFaint, display: "flex", alignItems: "center", gap: 4 }}>
                <TrendingUp size={10} /> Technicals
              </Link>
              <Link href={`/copilot?symbol=${t.sym}`} style={{ textDecoration: "none", fontSize: 10, color: U.textFaint, display: "flex", alignItems: "center", gap: 4 }}>
                <ExternalLink size={10} /> AI Copilot
              </Link>
            </div>
          </div>
        </GlassCard>
      ))}
    </div>
  );
}
