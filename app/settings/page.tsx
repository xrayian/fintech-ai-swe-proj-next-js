'use client';

import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Server, Palette, CheckCircle, XCircle, BookmarkPlus, Trash2, Plus, RefreshCw } from 'lucide-react';
import { U } from '@/lib/constants';
import { GlassCard } from '@/components/shared/glass-card';
import { SectionTitle } from '@/components/shared/section-title';
import { useWatchlist } from '@/hooks/use-watchlist';
import { useToast } from '@/components/shared/toast-provider';

export default function SettingsPage() {
  const [conn, setConn] = useState<Record<string, boolean>>({});
  const { watchlist, addSymbol, removeSymbol, ready } = useWatchlist();
  const [addQuery, setAddQuery] = useState('');
  const [addResults, setAddResults] = useState<{ sym: string; name: string }[]>([]);
  const [clearing, setClearing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetch('/api/settings').then(r => r.json()).then(setConn).catch(() => {});
  }, []);

  const clearCache = async () => {
    setClearing(true);
    try {
      const res = await fetch('/api/cache', { method: 'DELETE' });
      const data = await res.json();
      if (data.ok) {
        toast('success', `Cleared ${data.cleared} cached candle files`);
      } else {
        toast('error', data.error || 'Failed to clear cache');
      }
    } catch {
      toast('error', 'Cache clear request failed');
    } finally {
      setClearing(false);
    }
  };

  useEffect(() => {
    if (!addQuery.trim()) { setAddResults([]); return; }
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/symbols?q=${encodeURIComponent(addQuery)}`);
        if (!res.ok) return;
        setAddResults(await res.json());
      } catch {}
    }, 200);
    return () => clearTimeout(t);
  }, [addQuery]);

  const connections = [
    { name: 'Finnhub', ok: conn.finnhub, label: 'Market data (primary)' },
    { name: 'Alpha Vantage', ok: conn.alphaVantage, label: 'Market data (fallback)' },
    { name: 'Gemini AI', ok: conn.gemini, label: 'AI Copilot' },
  ];

  return (
    <div style={{ animation: "fi .4s ease", maxWidth: 640 }}>
      <SectionTitle icon={SettingsIcon}>Settings</SectionTitle>

      <GlassCard style={{ padding: "20px 22px", marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: U.cyanSoft, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <BookmarkPlus size={16} color={U.cyan} />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: U.text }}>Watchlist</div>
            <div style={{ fontSize: 10, color: U.textMute }}>{watchlist.length} symbols tracked</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <input value={addQuery} onChange={e => setAddQuery(e.target.value)}
            placeholder="Search to add a symbol..."
            style={{ flex: 1, background: U.glassLo, border: `1px solid ${U.border}`, borderRadius: 10, padding: "8px 12px", color: U.text, fontSize: 12, outline: "none" }}
          />
        </div>
        {addQuery && (
          <div style={{ marginBottom: 12, maxHeight: 160, overflow: "auto", background: U.glassLo, borderRadius: 10, border: `1px solid ${U.border}` }}>
            {addResults.map(r => (
              <div key={r.sym} onClick={() => { addSymbol(r.sym, r.name); setAddQuery(''); setAddResults([]); toast('success', `${r.sym} added to watchlist`); }}
                style={{ padding: "8px 12px", cursor: "pointer", borderBottom: `1px solid ${U.border}`, display: "flex", alignItems: "center", gap: 8 }}
                onMouseEnter={e => (e.currentTarget.style.background = U.glass)}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                <Plus size={12} color={U.emerald} />
                <span style={{ fontSize: 12, fontWeight: 700, color: U.text }}>{r.sym}</span>
                <span style={{ fontSize: 10, color: U.textMute }}>{r.name}</span>
              </div>
            ))}
            {addQuery && !addResults.length && <div style={{ padding: 12, textAlign: "center", fontSize: 11, color: U.textMute }}>No matches</div>}
          </div>
        )}
        {ready && watchlist.slice(0, 12).map(s => (
          <div key={s.sym} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0", borderBottom: `1px solid ${U.border}` }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: U.text, width: 52 }}>{s.sym}</span>
            <span style={{ fontSize: 11, color: U.textMute, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.name}</span>
            <button onClick={() => { removeSymbol(s.sym); toast('info', `${s.sym} removed from watchlist`); }} style={{ background: "transparent", border: "none", cursor: "pointer", color: U.textFaint, padding: 4 }}>
              <Trash2 size={12} />
            </button>
          </div>
        ))}
        {ready && watchlist.length > 12 && (
          <div style={{ fontSize: 10, color: U.textMute, textAlign: "center", padding: "8px 0" }}>
            +{watchlist.length - 12} more symbols
          </div>
        )}
      </GlassCard>

      <GlassCard style={{ padding: "20px 22px", marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: U.cyanSoft, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Server size={16} color={U.cyan} />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: U.text }}>API Connections</div>
            <div style={{ fontSize: 10, color: U.textMute }}>Data provider status</div>
          </div>
        </div>
        {connections.map(c => {
          return (
            <div key={c.name} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: `1px solid ${U.border}` }}>
              {c.ok ? <CheckCircle size={16} color={U.emerald} /> : <XCircle size={16} color={U.rose} />}
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: U.text }}>{c.name}</div>
                <div style={{ fontSize: 10, color: U.textMute }}>{c.label}</div>
              </div>
              <span style={{ fontSize: 10, fontWeight: 600, color: c.ok ? U.emerald : U.rose, background: c.ok ? U.emeraldSoft : U.roseSoft, padding: "3px 10px", borderRadius: 999 }}>{c.ok ? 'Connected' : 'Not set'}</span>
            </div>
          );
        })}
        <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${U.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: U.text }}>Candle Cache</div>
            <div style={{ fontSize: 10, color: U.textMute }}>Clears cached historical data, forcing fresh API calls</div>
          </div>
          <button onClick={clearCache} disabled={clearing} style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "8px 14px", borderRadius: 10,
            border: `1px solid ${U.borderHi}`,
            background: U.glassHi, color: clearing ? U.textMute : U.text,
            fontSize: 11, fontWeight: 600, cursor: clearing ? "not-allowed" : "pointer",
            opacity: clearing ? 0.6 : 1, transition: "all .15s"
          }}>
            <RefreshCw size={12} style={{ animation: clearing ? "spin .8s linear infinite" : "none" }} />
            {clearing ? "Clearing..." : "Clear Cache"}
          </button>
        </div>
      </GlassCard>

      <GlassCard style={{ padding: "20px 22px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: U.violetSoft, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Palette size={16} color={U.violet} />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: U.text }}>Appearance</div>
            <div style={{ fontSize: 10, color: U.textMute }}>Display preferences</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0" }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: U.text }}>Theme</div>
            <div style={{ fontSize: 10, color: U.textMute }}>Dark mode (default)</div>
          </div>
          <div style={{
            width: 44, height: 24, borderRadius: 999, background: U.glassHi, border: `1px solid ${U.border}`,
            display: "flex", alignItems: "center", padding: "0 4px", cursor: "not-allowed", opacity: 0.6
          }}>
            <div style={{ width: 16, height: 16, borderRadius: "50%", background: U.cyan, marginLeft: "auto" }} />
          </div>
        </div>
        <div style={{ fontSize: 10, color: U.textFaint, marginTop: 8 }}>Theme customization coming soon.</div>
      </GlassCard>
    </div>
  );
}
