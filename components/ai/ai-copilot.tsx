'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Sparkles, Bot, Send, Star, Lightbulb, Loader2, MessageSquare, BarChart3, Plus } from 'lucide-react';
import { U, SCORECARD } from '@/lib/constants';
import { computeScorecard, type ScorecardData } from '@/lib/scorecard-utils';
import type { NormalizedFundamentals } from '@/lib/providers/types';
import { SP500_TOP100 } from '@/lib/symbols/sp500-top100';
import { useResponsive } from '@/hooks/use-responsive';
import { CubeLogo } from '@/components/shared/cube-logo';

const COPILOT_SYMBOLS = SP500_TOP100.slice(0, 10).map(s => s.sym);
import { ScoreCard } from './score-card';
import { useSymbolSearch } from '@/hooks/use-symbol-search';
import { SearchInput } from '@/components/search/search-input';
import { SearchSuggestions } from '@/components/search/search-suggestions';

type Message = {
  role: "assistant" | "user";
  content: string;
};

const AI_INIT: Message[] = [{ role: "assistant", content: "**Welcome.** I'm your AI Copilot for market intelligence. I can analyze stocks using live fundamental data — ask about valuations, compare tickers, or explore market sectors.\n\n**Try asking:**\n- *\"Is AAPL wise to invest now?\"*\n- *\"Compare MSFT vs GOOGL\"*\n- *\"What's the risk on TSLA?\"*" }];

export default function AICopilot() {
  const { isMobile } = useResponsive();
  const [view, setView] = useState<'chat' | 'scores'>('chat');
  const [msgs, sm] = useState<Message[]>(AI_INIT);
  const [inp, si] = useState("");
  const [loading, sl] = useState(false);
  const [exp, se] = useState<string | null>(null);
  const [inputFocus, sif] = useState(false);
  const [streamBuf, sst] = useState("");
  const { query: searchQuery, setQuery: setSearchQuery, results: searchResults, loading: searching, clear: clearSearch } = useSymbolSearch();
  const [loadingSymbols, setLoadingSymbols] = useState<Set<string>>(new Set());
  const [fundamentalsMap, setFundamentalsMap] = useState<Record<string, NormalizedFundamentals>>({});
  const bot = useRef<HTMLDivElement>(null);
  const inpRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    fetch(`/api/fundamentals?symbols=${COPILOT_SYMBOLS.join(',')}`)
      .then(r => r.ok ? r.json() : [])
      .then(data => {
        const map: Record<string, NormalizedFundamentals> = {};
        for (const item of (Array.isArray(data) ? data : [])) {
          if (item.symbol) map[item.symbol] = item;
        }
        if (Object.keys(map).length > 0) setFundamentalsMap(map);
      })
      .catch(() => {});
  }, []);




  const loadSymbol = useCallback(async (sym: string) => {
    if (fundamentalsMap[sym]) return;
    setLoadingSymbols(p => new Set(p).add(sym));
    try {
      const res = await fetch(`/api/fundamentals?symbol=${sym}`);
      if (!res.ok) return;
      const data = await res.json();
      if (data?.symbol) setFundamentalsMap(p => ({ ...p, [data.symbol]: data }));
    } catch {} finally {
      setLoadingSymbols(p => { const n = new Set(p); n.delete(sym); return n; });
    }
  }, [fundamentalsMap]);

  const scorecardMap = useMemo(() => {
    const map: Record<string, ScorecardData> = {};
    for (const [sym, f] of Object.entries(fundamentalsMap)) {
      map[sym] = computeScorecard(f);
    }
    if (Object.keys(map).length === 0) return SCORECARD as unknown as Record<string, ScorecardData>;
    return map;
  }, [fundamentalsMap]);

  useEffect(() => { bot.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);

  const dynamicPrompts = useMemo(() => {
    const entries = Object.entries(scorecardMap);
    if (!entries.length) return [];
    const byScore = [...entries].sort((a, b) => b[1].score - a[1].score);
    const top = byScore.slice(0, 3);
    const prompts: string[] = [];
    if (top.length >= 2) {
      prompts.push(`Compare ${top[0][0]} vs ${top[1][0]}`);
    }
    if (top.length >= 1) {
      prompts.push(`Is ${top[0][0]} wise to invest right now?`);
    }
    if (top.length >= 3) {
      prompts.push(`What's the risk on ${top[2][0]}?`);
    }
    if (entries.length > 1) {
      prompts.push(`Which stock has the best fundamentals?`);
    }
    const worst = byScore[byScore.length - 1];
    if (worst && worst[1].score < 6) {
      prompts.push(`Why is ${worst[0]} rated low?`);
    }
    return prompts.slice(0, 6);
  }, [scorecardMap]);

  const send = useCallback(async (overrideText?: string) => {
    const text = overrideText ?? inp;
    if (!text.trim() || loading) return;
    const um = { role: "user" as const, content: text };
    sm(p => [...p, um]); si(""); sl(true); sst("");

    try {
      const res = await fetch('/api/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...msgs, um], symbols: Object.keys(scorecardMap) }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || `API error ${res.status}`);
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      let buf = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });

        const lines = buf.split('\n');
        buf = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const json = line.slice(6).trim();
          if (json === '[DONE]') continue;
          try {
            const parsed = JSON.parse(json);
            const chunk = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
            if (chunk) {
              acc += chunk;
              sst(acc);
            }
          } catch { /* skip malformed chunks */ }
        }
      }

      sm(p => [...p, { role: "assistant", content: acc }]);
      sst("");
    } catch (err) {
      const errMsg = `Sorry, I encountered an error: ${err instanceof Error ? err.message : 'Unknown error'}`;
      sm(p => [...p, { role: "assistant", content: errMsg }]);
    } finally {
      sl(false);
    }
  }, [inp, loading, msgs]);

  const clearChat = () => { sm(AI_INIT); };

  const md = (t: string) => t
    .replace(/\*\*(.*?)\*\*/g, `<strong style="color:${U.text};font-weight:700">$1</strong>`)
    .replace(/\*(.*?)\*/g, `<em style="color:${U.textDim}">$1</em>`)
    .replace(/\n\n/g, "</p><p style='margin-top:8px'>")
    .replace(/\n/g, "<br/>")
    .replace(/^- (.+)/gm, `<span style="display:flex;gap:6px;padding:2px 0"><span style="color:${U.cyan};flex-shrink:0">\u203A</span><span>$1</span></span>`);

  const scoresPanel = (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
      <div style={{ padding: isMobile ? "10px 14px" : "14px 18px", borderBottom: `1px solid ${U.border}`, flexShrink: 0 }}>
        {!isMobile && <div style={{ fontSize: 10, fontWeight: 600, color: U.textMute, textTransform: "uppercase", letterSpacing: "0.14em", display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}><Star size={10} color={U.violet} /> Scorecards</div>}
        {!isMobile && <div style={{ fontSize: 11, color: U.textFaint, marginBottom: 8 }}>AI-scored investment signals</div>}
        <SearchInput 
          query={searchQuery} 
          onChange={setSearchQuery} 
          loading={searching} 
          placeholder="Search any symbol..."
          variant="small"
          accent={U.violet}
          onClear={clearSearch}
        />
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: isMobile ? "8px 12px" : "12px 14px" }}>
        {searchQuery.trim() ? (
          <>
            {Object.entries(scorecardMap).filter(([sym, d]) => sym.toLowerCase().includes(searchQuery.toLowerCase()) || d.name.toLowerCase().includes(searchQuery.toLowerCase())).map(([sym, d]) => (
              <ScoreCard key={sym} ticker={sym} data={d} expanded={exp === sym} onToggle={() => se(exp === sym ? null : sym)} />
            ))}
            {searchResults.filter(r => !scorecardMap[r.sym]).length > 0 && Object.entries(scorecardMap).filter(([sym, d]) => sym.toLowerCase().includes(searchQuery.toLowerCase()) || d.name.toLowerCase().includes(searchQuery.toLowerCase())).length > 0 && (
              <div style={{ padding: "8px 14px 4px", fontSize: 9, fontWeight: 600, color: U.textFaint, textTransform: "uppercase", letterSpacing: "0.1em" }}>More results from search</div>
            )}
            <SearchSuggestions
              query={searchQuery}
              results={searchResults.filter(r => !scorecardMap[r.sym])}
              onSelect={loadSymbol}
              renderItem={(r, onSelect) => {
                const loading = loadingSymbols.has(r.sym);
                return (
                  <div key={r.sym} onClick={onSelect} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", cursor: "pointer", background: U.glass, border: `1px solid ${U.border}`, borderRadius: 10, marginBottom: 6, transition: "all .15s" }}
                    onMouseEnter={e => { e.currentTarget.style.background = U.glassHi; e.currentTarget.style.borderColor = U.borderHi; }}
                    onMouseLeave={e => { e.currentTarget.style.background = U.glass; e.currentTarget.style.borderColor = U.border; }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: U.text, letterSpacing: "-0.01em" }}>{r.sym}</div>
                      <div style={{ fontSize: 10, color: U.textMute, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.name}</div>
                    </div>
                    {loading ? <Loader2 size={12} color={U.cyan} style={{ animation: "spin 1s linear infinite" }} />
                      : <span style={{ width: 26, height: 26, borderRadius: 8, background: U.cyanSoft, border: `1px solid rgba(34,211,238,0.25)`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, cursor: "pointer" }}><Plus size={13} color={U.cyan} /></span>}
                  </div>
                );
              }}
            />
          </>
        ) : (
          Object.entries(scorecardMap).map(([sym, d]) => (
            <ScoreCard key={sym} ticker={sym} data={d} expanded={exp === sym} onToggle={() => se(exp === sym ? null : sym)} />
          ))
        )}
        {searchQuery.trim() && !searching && searchResults.length === 0 && (
          <div style={{ padding: "24px", textAlign: "center", fontSize: 11, color: U.textMute }}>No matching tickers</div>
        )}
      </div>
      {!isMobile && (
        <div style={{ padding: "10px 16px", borderTop: `1px solid ${U.border}`, flexShrink: 0 }}>
          <div style={{ fontSize: 10, color: U.textFaint, lineHeight: 1.5, display: "flex", alignItems: "flex-start", gap: 6 }}>
            <Lightbulb size={10} color={U.violet} style={{ flexShrink: 0, marginTop: 2 }} />
            Click a scorecard to expand its full financial breakdown, then ask the Copilot about it.
          </div>
        </div>
      )}
    </div>
  );

  const chatPanel = (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden", position: "relative" }}>
      <div style={{ padding: isMobile ? "0 14px" : "0 20px", height: isMobile ? 48 : 56, borderBottom: `1px solid ${U.border}`, display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
        <div style={{ position: "relative", width: isMobile ? 28 : 32, height: isMobile ? 28 : 32, flexShrink: 0 }}>
          <div style={{ position: "absolute", inset: -4, background: `radial-gradient(ellipse, ${U.cyanSoft}, transparent 70%)`, borderRadius: "50%" }} />
          <CubeLogo size={isMobile ? 28 : 32} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: isMobile ? 12 : 14, fontWeight: 600, color: U.text, lineHeight: 1, fontFamily: "'Inter',sans-serif", letterSpacing: "-0.02em" }}>AI Copilot</div>
          <div style={{ fontSize: 10, color: U.textMute, marginTop: 3, display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: U.emerald, display: "inline-block", boxShadow: `0 0 6px ${U.emeraldSoft}`, animation: "pulse-dot 2s ease infinite" }} />
            {isMobile ? "AI financial intel" : "Online \u00B7 AI financial intelligence"}
          </div>
        </div>
        {!isMobile && (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ fontSize: 10, color: U.textMute, background: U.cardBg, border: U.cardBorder, borderRadius: 12, padding: "4px 10px", display: "flex", alignItems: "center", gap: 5, boxShadow: U.cardShadow }}>
              <Bot size={10} color={U.textMute} />{msgs.length} messages
            </div>
            <button onClick={clearChat} style={{ fontSize: 10, color: U.textMute, cursor: "pointer", background: U.cardBg, border: U.cardBorder, borderRadius: 12, padding: "5px 10px", transition: "all .15s", boxShadow: U.cardShadow }}>{'\u2715'} Clear</button>
          </div>
        )}
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: isMobile ? "12px" : "20px", display: "flex", flexDirection: "column", gap: isMobile ? 10 : 14 }}>
        {msgs.length === 1 && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: isMobile ? "32px 12px 0" : "60px 20px 0", gap: 20, animation: "fi .4s ease" }}>
            <div style={{ position: "relative", width: isMobile ? 56 : 72, height: isMobile ? 56 : 72 }}>
              <div style={{ position: "absolute", inset: -12, background: `radial-gradient(ellipse, ${U.cyanSoft}, transparent 70%)`, borderRadius: "50%" }} />
              <div style={{ width: "100%", height: "100%", borderRadius: "50%", background: U.cardBg, border: U.cardBorder, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", zIndex: 1, boxShadow: U.cardShadow }}>
                <CubeLogo size={isMobile ? 34 : 44} />
              </div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: isMobile ? 15 : 17, fontWeight: 600, color: U.text, marginBottom: 6, fontFamily: "'Inter',sans-serif", letterSpacing: "-0.02em" }}>Your AI Financial Copilot</div>
              <div style={{ fontSize: 12, color: U.textMute, lineHeight: 1.6, maxWidth: 340 }}>Ask anything about stocks, valuations, market signals, or investment strategies.</div>
            </div>
          </div>
        )}
        {msgs.map((m, i) => (
          <div key={i} style={{ display: "flex", flexDirection: m.role === "user" ? "row-reverse" : "row", alignItems: "flex-start", gap: isMobile ? 8 : 10, animation: "fi .22s ease" }}>
            {m.role === "assistant" && <CubeLogo size={isMobile ? 24 : 28} />}
            {m.role === "user" && <div style={{ width: isMobile ? 24 : 28, height: isMobile ? 24 : 28, background: U.cardBg, border: U.cardBorder, borderRadius: "50%", flexShrink: 0, marginTop: 2, display: "flex", alignItems: "center", justifyContent: "center", fontSize: isMobile ? 9 : 11, fontWeight: 600, color: U.textDim }}>U</div>}
            <div style={{ maxWidth: isMobile ? "82%" : "72%", padding: isMobile ? "10px 14px" : "12px 16px", fontSize: isMobile ? 12.5 : 13, lineHeight: 1.7, color: U.text, borderRadius: 12, background: m.role === "user" ? U.glass : U.cardBg, border: U.cardBorder, boxShadow: U.cardShadow }} dangerouslySetInnerHTML={{ __html: md(m.content) }} />
          </div>
        ))}
        {loading && streamBuf && (
          <div style={{ display: "flex", alignItems: "flex-start", gap: isMobile ? 8 : 10, animation: "fi .2s ease" }}>
            <CubeLogo size={isMobile ? 24 : 28} />
            <div style={{ maxWidth: isMobile ? "82%" : "72%", padding: isMobile ? "10px 14px" : "12px 16px", fontSize: isMobile ? 12.5 : 13, lineHeight: 1.7, color: U.text, borderRadius: 12, background: U.cardBg, border: U.cardBorder, boxShadow: U.cardShadow }} dangerouslySetInnerHTML={{ __html: md(streamBuf) }} />
          </div>
        )}
        {loading && !streamBuf && (
          <div style={{ display: "flex", alignItems: "flex-start", gap: isMobile ? 8 : 10, animation: "fi .2s ease" }}>
            <CubeLogo size={isMobile ? 24 : 28} />
            <div style={{ padding: "14px 18px", background: U.cardBg, border: U.cardBorder, borderRadius: 12, display: "flex", alignItems: "center", gap: 6, boxShadow: U.cardShadow }}>
              {[0, 1, 2].map(j => <span key={j} style={{ width: 6, height: 6, borderRadius: "50%", background: `linear-gradient(135deg,${U.cyan},${U.violet})`, display: "inline-block", animation: `dp 1.4s ease ${j * 0.18}s infinite` }} />)}
              <span style={{ fontSize: 11, color: U.textMute, marginLeft: 4, fontWeight: 500 }}>Analyzing{'\u2026'}</span>
            </div>
          </div>
        )}
        <div ref={bot} />
      </div>
      <div className="chip-scroll" style={{ padding: isMobile ? "6px 14px" : "8px 18px", borderTop: `1px solid ${U.border}`, display: "flex", gap: 6, overflowX: "auto", flexShrink: 0 }}>
        <div style={{ fontSize: 9, fontWeight: 600, color: U.textFaint, textTransform: "uppercase", letterSpacing: "0.12em", flexShrink: 0, alignSelf: "center", marginRight: 4 }}>Quick:</div>
        {dynamicPrompts.map(p => (
          <button key={p} onClick={() => send(p)} style={{ padding: "6px 16px", borderRadius: 999, border: U.cardBorder, background: U.cardBg, color: U.textDim, cursor: "pointer", fontSize: 11, fontWeight: 500, whiteSpace: "nowrap", flexShrink: 0, transition: "all .15s", boxShadow: U.cardShadow }}>{p}</button>
        ))}
      </div>
      <div style={{ padding: isMobile ? "8px 12px" : "12px 18px", borderTop: `1px solid ${U.border}`, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 10, background: U.inputBg, border: `1px solid ${inputFocus ? U.cyan : U.border}`, borderRadius: 999, padding: isMobile ? "8px 14px" : "10px 16px", transition: "all .2s", boxShadow: inputFocus ? `${U.insetShadow}, 0 0 0 2px ${U.cyanSoft}` : U.insetShadow }}>
          <textarea ref={inpRef} value={inp} onChange={e => { si(e.target.value); e.target.style.height = "auto"; e.target.style.height = Math.min(e.target.scrollHeight, 80) + "px"; }} onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }} onFocus={() => sif(true)} onBlur={() => sif(false)} placeholder="Ask about any stock, valuation, or market signal..." rows={1} style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: U.text, fontSize: isMobile ? 12.5 : 13, lineHeight: 1.5, resize: "none", overflow: "hidden", minHeight: 22, maxHeight: 80 }} />
          <button onClick={() => send()} disabled={loading || !inp.trim()} style={{ width: 34, height: 34, borderRadius: 999, border: "none", background: inp.trim() && !loading ? `linear-gradient(135deg,${U.cyan},${U.violet})` : U.glass, display: "flex", alignItems: "center", justifyContent: "center", cursor: inp.trim() && !loading ? "pointer" : "not-allowed", flexShrink: 0, transition: "all .2s", boxShadow: inp.trim() && !loading ? `0 0 16px ${U.cyanSoft}` : "none" }}><Send size={14} color={inp.trim() && !loading ? "white" : U.textFaint} /></button>
        </div>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden", borderRadius: 14, border: U.cardBorder, background: U.cardBg, boxShadow: U.cardShadow, backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)", paddingBottom: "var(--copilot-pb)" as any }}>
        <div style={{ display: "flex", padding: "8px 12px", gap: 6, borderBottom: `1px solid ${U.border}`, flexShrink: 0 }}>
          <button onClick={() => setView('chat')} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "8px 0", borderRadius: 10, border: "none", cursor: "pointer", fontSize: 11, fontWeight: 600, background: view === 'chat' ? U.glassHi : "transparent", color: view === 'chat' ? U.cyan : U.textMute, transition: "all .15s" }}>
            <MessageSquare size={13} /> Chat
          </button>
          <button onClick={() => setView('scores')} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "8px 0", borderRadius: 10, border: "none", cursor: "pointer", fontSize: 11, fontWeight: 600, background: view === 'scores' ? U.glassHi : "transparent", color: view === 'scores' ? U.cyan : U.textMute, transition: "all .15s" }}>
            <BarChart3 size={13} /> Scorecards
          </button>
        </div>
        <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
          {view === 'chat' ? chatPanel : scoresPanel}
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "var(--copilot-cols)" as any, gridTemplateRows: "var(--copilot-rows)" as any, gap: 0, paddingBottom: "var(--copilot-pb)" as any, height: "100%", overflow: "hidden", borderRadius: 14, border: U.cardBorder, background: U.cardBg, boxShadow: U.cardShadow, backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)" }}>
      <div style={{ display: "flex", flexDirection: "column", borderRight: `1px solid ${U.border}`, overflow: "hidden", background: U.glassLo, backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}>
        {scoresPanel}
      </div>
      <div style={{ display: "flex", flexDirection: "column", overflow: "hidden", position: "relative", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}>
        {chatPanel}
      </div>
    </div>
  );
}
