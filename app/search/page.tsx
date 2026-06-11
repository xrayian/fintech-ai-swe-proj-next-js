'use client';

import { Search as SearchIcon, Loader2 } from 'lucide-react';
import { U } from '@/lib/constants';
import { GlassCard } from '@/components/shared/glass-card';
import { ErrorMessage } from '@/components/shared/error-message';
import { SectionTitle } from '@/components/shared/section-title';
import { useWatchlist } from '@/hooks/use-watchlist';
import { useSymbolSearch } from '@/hooks/use-symbol-search';
import { SearchInput } from '@/components/search/search-input';
import { SearchResults } from '@/components/search/search-results';

export default function SearchPage() {
  const { query, setQuery, results, loading, error, retry } = useSymbolSearch();
  const { watchlist } = useWatchlist();



  return (
    <div style={{ animation: "fi .4s ease" }}>
      <SectionTitle icon={SearchIcon}>Search</SectionTitle>

      <SearchInput 
        query={query} 
        onChange={setQuery} 
        loading={loading} 
        placeholder="Search all NYSE symbols..."
        variant="large"
        resultCount={results.length}
        autoFocus={true}
      />

      {loading && (
        <GlassCard style={{ padding: "40px", textAlign: "center" }}>
          <Loader2 size={24} color={U.textMute} style={{ animation: "spin .8s linear infinite" }} />
        </GlassCard>
      )}

      {!loading && error && (
        <div style={{ marginBottom: 14 }}>
          <ErrorMessage message={error} onRetry={retry} />
        </div>
      )}

      {!loading && !error && results.length === 0 && query && (
        <GlassCard style={{ padding: "32px", textAlign: "center" }}>
          <div style={{ fontSize: 13, color: U.textMute }}>No results for &quot;{query}&quot;</div>
          <div style={{ fontSize: 11, color: U.textFaint, marginTop: 4 }}>Try a ticker symbol like AAPL or a company name</div>
        </GlassCard>
      )}

      {!loading && results.length === 0 && !query && (
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

      {!loading && <SearchResults results={results} />}
    </div>
  );
}
