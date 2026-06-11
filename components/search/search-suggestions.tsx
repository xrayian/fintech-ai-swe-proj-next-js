import { U } from '@/lib/constants';
import type { SearchResult } from '@/hooks/use-symbol-search';
import { ReactNode } from 'react';

interface SearchSuggestionsProps {
  query: string;
  results: SearchResult[];
  onSelect: (sym: string, name: string) => void;
  renderItem?: (result: SearchResult, onSelect: () => void) => ReactNode;
}

export function SearchSuggestions({ query, results, onSelect, renderItem }: SearchSuggestionsProps) {
  if (!query) return null;

  return (
    <div style={{ marginBottom: 12, maxHeight: 240, overflow: "auto", background: U.glassLo, borderRadius: 10, border: `1px solid ${U.border}` }}>
      {results.map(r => (
        renderItem ? (
          renderItem(r, () => onSelect(r.sym, r.name))
        ) : (
          <div key={r.sym} onClick={() => onSelect(r.sym, r.name)}
            style={{ padding: "8px 12px", cursor: "pointer", borderBottom: `1px solid ${U.border}`, display: "flex", alignItems: "center", gap: 8 }}
            onMouseEnter={e => (e.currentTarget.style.background = U.glass)}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
          >
            <span style={{ fontSize: 12, fontWeight: 700, color: U.text }}>{r.sym}</span>
            <span style={{ fontSize: 10, color: U.textMute, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.name}</span>
          </div>
        )
      ))}
      {query && !results.length && (
        <div style={{ padding: 12, textAlign: "center", fontSize: 11, color: U.textMute }}>No matches</div>
      )}
    </div>
  );
}
