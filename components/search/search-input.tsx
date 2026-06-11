import { Search as SearchIcon, Loader2, X } from 'lucide-react';
import { U } from '@/lib/constants';

interface SearchInputProps {
  query: string;
  onChange: (val: string) => void;
  loading?: boolean;
  placeholder?: string;
  variant?: "large" | "medium" | "small";
  accent?: string;
  onClear?: () => void;
  resultCount?: number;
  autoFocus?: boolean;
}

export function SearchInput({ query, onChange, loading = false, placeholder = "Search...", variant = "medium", accent = U.cyan, onClear, resultCount, autoFocus = false }: SearchInputProps) {
  if (variant === "large") {
    return (
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        background: U.glass, border: `1px solid ${query ? accent : U.border}`,
        borderRadius: 14, padding: "12px 16px", marginBottom: 16,
        transition: "all .2s"
      }}>
        <SearchIcon size={16} color={query ? accent : U.textMute} />
        <input
          value={query} onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          style={{
            flex: 1, background: "transparent", border: "none", outline: "none",
            color: U.text, fontSize: 14, lineHeight: 1.5
          }}
        />
        {loading && <Loader2 size={14} color={U.textMute} style={{ animation: "spin .8s linear infinite" }} />}
        {!loading && query && resultCount !== undefined && (
          <span style={{ fontSize: 11, color: U.textMute, background: U.glassLo, padding: "3px 10px", borderRadius: 999 }}>
            {resultCount} results
          </span>
        )}
        {!loading && query && onClear && (
          <X size={14} color={U.textMute} style={{ cursor: "pointer", marginLeft: 4 }} onClick={onClear} />
        )}
      </div>
    );
  }

  if (variant === "small") {
    return (
      <div style={{ 
        display: "flex", alignItems: "center", gap: 6, 
        background: U.glassLo, border: `1px solid ${query ? accent : U.border}`, 
        borderRadius: 8, padding: "6px 10px", transition: "all .15s" 
      }}>
        <SearchIcon size={11} color={query ? accent : U.textMute} />
        <input 
          value={query} onChange={e => onChange(e.target.value)} 
          placeholder={placeholder}
          autoFocus={autoFocus}
          style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: U.text, fontSize: 11 }} 
        />
        {loading && <Loader2 size={11} color={U.textMute} style={{ animation: "spin 1s linear infinite" }} />}
        {!loading && query && onClear && (
          <X size={12} color={U.textMute} style={{ cursor: "pointer", flexShrink: 0 }} onClick={onClear} />
        )}
      </div>
    );
  }

  // medium (default)
  return (
    <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
      <input 
        value={query} onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        style={{ flex: 1, background: U.glassLo, border: `1px solid ${query ? accent : U.border}`, borderRadius: 10, padding: "8px 12px", color: U.text, fontSize: 12, outline: "none" }}
      />
      {loading && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 34, height: 34, borderRadius: 10, border: `1px solid ${U.border}`, background: U.glassLo }}>
          <Loader2 size={14} color={U.textMute} style={{ animation: "spin 1s linear infinite" }} />
        </div>
      )}
      {!loading && query && onClear && (
        <div onClick={onClear} style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 34, height: 34, borderRadius: 10, border: `1px solid ${U.border}`, background: U.glassLo, cursor: "pointer" }}>
          <X size={14} color={U.textMute} />
        </div>
      )}
    </div>
  );
}
