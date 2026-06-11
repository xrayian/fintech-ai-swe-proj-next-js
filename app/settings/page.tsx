'use client';

import { Settings as SettingsIcon, Palette, BookmarkPlus, Trash2, Plus } from 'lucide-react';
import { U } from '@/lib/constants';
import { GlassCard } from '@/components/shared/glass-card';
import { SectionTitle } from '@/components/shared/section-title';
import { useWatchlist } from '@/hooks/use-watchlist';
import { useToast } from '@/components/shared/toast-provider';
import { useTheme } from '@/components/shared/theme-provider';
import { useSymbolSearch } from '@/hooks/use-symbol-search';
import { SearchInput } from '@/components/search/search-input';
import { SearchSuggestions } from '@/components/search/search-suggestions';

export default function SettingsPage() {
  const { watchlist, addSymbol, removeSymbol, ready } = useWatchlist();
  const { query, setQuery, results, loading, clear } = useSymbolSearch();
  const { toast } = useToast();
  const { theme, toggleTheme } = useTheme();

  return (
    <div style={{ animation: "fi .4s ease", maxWidth: 900, margin: "0 auto" }}>
      <SectionTitle icon={SettingsIcon}>Settings</SectionTitle>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <GlassCard style={{ padding: "24px 26px", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18, paddingBottom: 16, borderBottom: `1px solid ${U.border}` }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: U.cyanSoft, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <BookmarkPlus size={17} color={U.cyan} />
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: U.text }}>Watchlist</div>
            <div style={{ fontSize: 11, color: U.textMute }}>{watchlist.length} symbols tracked</div>
          </div>
        </div>
        <SearchInput 
          query={query} 
          onChange={setQuery} 
          loading={loading} 
          placeholder="Search to add a symbol..."
          variant="medium"
          onClear={clear}
        />
        <SearchSuggestions
          query={query}
          results={results}
          onSelect={(sym, name) => {
            addSymbol(sym, name);
            clear();
            toast('success', `${sym} added to watchlist`);
          }}
          renderItem={(r, onSelect) => (
            <div key={r.sym} onClick={onSelect}
              style={{ padding: "8px 12px", cursor: "pointer", borderBottom: `1px solid ${U.border}`, display: "flex", alignItems: "center", gap: 8 }}
              onMouseEnter={e => (e.currentTarget.style.background = U.glass)}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            >
              <Plus size={12} color={U.emerald} />
              <span style={{ fontSize: 12, fontWeight: 700, color: U.text }}>{r.sym}</span>
              <span style={{ fontSize: 10, color: U.textMute }}>{r.name}</span>
            </div>
          )}
        />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2, maxHeight: 340, overflowY: "auto", marginTop: 8 }}>
          {ready && watchlist.map(s => (
            <div key={s.sym} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 10px", borderRadius: 8, transition: "background .15s" }}
              onMouseEnter={e => (e.currentTarget.style.background = U.glass)}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            >
              <span style={{ fontSize: 13, fontWeight: 700, color: U.text, width: 56, fontFamily: "JetBrains Mono" }}>{s.sym}</span>
              <span style={{ fontSize: 12, color: U.textMute, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.name}</span>
              <button onClick={() => { removeSymbol(s.sym); toast('info', `${s.sym} removed from watchlist`); }} style={{ background: "transparent", border: "none", cursor: "pointer", color: U.textFaint, padding: 4, borderRadius: 6, transition: "all .15s" }}
                onMouseEnter={e => { e.currentTarget.style.background = U.roseSoft; e.currentTarget.style.color = U.rose; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = U.textFaint; }}
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
        {ready && watchlist.length === 0 && (
          <div style={{ fontSize: 11, color: U.textMute, textAlign: "center", padding: "12px 0" }}>No symbols in watchlist</div>
        )}
      </GlassCard>

      <GlassCard style={{ padding: "24px 26px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18, paddingBottom: 16, borderBottom: `1px solid ${U.border}` }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: U.violetSoft, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Palette size={17} color={U.violet} />
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: U.text }}>Appearance</div>
            <div style={{ fontSize: 11, color: U.textMute }}>Display preferences</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 10px", borderRadius: 8 }}
          onMouseEnter={e => (e.currentTarget.style.background = U.glass)}
          onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
        >
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: U.text }}>Theme</div>
            <div style={{ fontSize: 11, color: U.textMute, marginTop: 1 }}>{theme === 'dark' ? 'Dark mode' : 'Light mode'}</div>
          </div>
          <div 
            onClick={toggleTheme}
            style={{
              width: 48, height: 26, borderRadius: 999, background: theme === 'dark' ? U.glassHi : U.glass, border: `1px solid ${theme === 'dark' ? U.cyan : U.border}`,
              display: "flex", alignItems: "center", padding: "0 4px", cursor: "pointer", transition: "all .3s"
            }}>
            <div style={{ 
              width: 18, height: 18, borderRadius: "50%", background: theme === 'dark' ? U.cyan : U.textMute, 
              transform: theme === 'dark' ? "translateX(20px)" : "translateX(0px)", transition: "all .3s" 
            }} />
          </div>
        </div>
        <div style={{ fontSize: 11, color: U.textFaint, marginTop: 10, padding: "0 10px" }}>Click to toggle between light and dark trading vibes.</div>
      </GlassCard>
      </div>
    </div>
  );
}
