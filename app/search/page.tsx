'use client';

import { useState, useEffect } from 'react';
import { Search as SearchIcon, TrendingUp, BarChart3, ExternalLink, Loader2 } from 'lucide-react';
import { U } from '@/lib/constants';
import { GlassCard } from '@/components/shared/glass-card';
import { SectionTitle } from '@/components/shared/section-title';
import { useWatchlist } from '@/hooks/use-watchlist';
import Link from 'next/link';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{ sym: string; name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const { watchlist } = useWatchlist();

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/symbols?q=${encodeURIComponent(query)}`);
        if (!res.ok) return;
        setResults(await res.json());
      } catch {} finally {
        setLoading(false);
      }
    }, 200);
    return () => clearTimeout(t);
  }, [query]);

  const filtered = results;

  return (
    <div style={{ animation: "fi .4s ease" }}>
      <SectionTitle icon={SearchIcon}>Search</SectionTitle>

      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        background: U.glass, border: `1px solid ${query ? U.cyan : U.border}`,
        borderRadius: 14, padding: "12px 16px", marginBottom: 16,
        transition: "all .2s"
      }}>
        <SearchIcon size={16} color={query ? U.cyan : U.textMute} />
        <input
          value={query} onChange={e => setQuery(e.target.value)}
          placeholder="Search all NYSE symbols..."
          style={{
            flex: 1, background: "transparent", border: "none", outline: "none",
            color: U.text, fontSize: 14, lineHeight: 1.5
          }}
        />
        {loading && <Loader2 size={14} color={U.textMute} style={{ animation: "spin .8s linear infinite" }} />}
        {!loading && query && (
          <span style={{ fontSize: 11, color: U.textMute, background: U.glassLo, padding: "3px 10px", borderRadius: 999 }}>
            {filtered.length} results
          </span>
        )}
      </div>

      {loading && (
        <GlassCard style={{ padding: "40px", textAlign: "center" }}>
          <Loader2 size={24} color={U.textMute} style={{ animation: "spin .8s linear infinite" }} />
        </GlassCard>
      )}

      {!loading && filtered.length === 0 && query && (
        <GlassCard style={{ padding: "32px", textAlign: "center" }}>
          <div style={{ fontSize: 13, color: U.textMute }}>No results for &quot;{query}&quot;</div>
          <div style={{ fontSize: 11, color: U.textFaint, marginTop: 4 }}>Try a ticker symbol like AAPL or a company name</div>
        </GlassCard>
      )}

      {!loading && filtered.length === 0 && !query && (
        <GlassCard style={{ padding: "40px 24px", textAlign: "center" }}>
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: U.glass, border: `1px solid ${U.border}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <SearchIcon size={22} color={U.textMute} />
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, color: U.text, marginBottom: 6 }}>Search across NYSE stocks</div>
          <div style={{ fontSize: 12, color: U.textMute, lineHeight: 1.6 }}>Type a ticker or company name to find fundamentals, charts, and AI analysis.</div>
          <div style={{ display: "flex", gap: 6, justifyContent: "center", flexWrap: "wrap", marginTop: 16 }}>
            {watchlist.slice(0, 12).map(t => (
              <span key={t.sym} style={{ background: U.glassLo, color: U.textDim, padding: "4px 12px", borderRadius: 999, fontSize: 11, fontWeight: 600, border: `1px solid ${U.border}` }}>{t.sym}</span>
            ))}
          </div>
        </GlassCard>
      )}

      {!loading && filtered.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
          {filtered.map(t => (
            <Link key={t.sym} href={`/compare?symbol=${t.sym}`} style={{ textDecoration: "none" }}>
              <GlassCard style={{ padding: "14px 18px", display: "flex", alignItems: "center", gap: 14, cursor: "pointer" }}>
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
                  <div style={{ display: "flex", gap: 12, marginTop: 4 }}>
                    <span style={{ fontSize: 10, color: U.textFaint, display: "flex", alignItems: "center", gap: 4 }}>
                      <BarChart3 size={10} /> View comparison
                    </span>
                    <span style={{ fontSize: 10, color: U.textFaint, display: "flex", alignItems: "center", gap: 4 }}>
                      <ExternalLink size={10} /> Full analysis
                    </span>
                  </div>
                </div>
              </GlassCard>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
