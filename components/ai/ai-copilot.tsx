'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Sparkles, Bot, Send, Star, Search as SearchIcon, Lightbulb } from 'lucide-react';
import { U, SCORECARD } from '@/lib/constants';
import { computeScorecard, type ScorecardData } from '@/lib/scorecard-utils';
import type { NormalizedFundamentals } from '@/lib/providers/types';
import { SP500_TOP100 } from '@/lib/symbols/sp500-top100';

const COPILOT_SYMBOLS = SP500_TOP100.slice(0, 10).map(s => s.sym);
import { ScoreCard } from './score-card';

type Message = {
  role: "assistant" | "user";
  content: string;
};

const AI_INIT: Message[] = [{ role: "assistant", content: "**Welcome.** I'm your AI Copilot for market intelligence. I can analyze stocks using live fundamental data — ask about valuations, compare tickers, or explore market sectors.\n\n**Try asking:**\n- *\"Is AAPL wise to invest now?\"*\n- *\"Compare MSFT vs GOOGL\"*\n- *\"What's the risk on TSLA?\"*" }];

export default function AICopilot() {
  const [msgs, sm] = useState<Message[]>(AI_INIT);
  const [inp, si] = useState("");
  const [loading, sl] = useState(false);
  const [exp, se] = useState<string | null>(null);
  const [inputFocus, sif] = useState(false);
  const [streamBuf, sst] = useState("");
  const [searchQuery, setSearchQuery] = useState('');
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
        body: JSON.stringify({ messages: [...msgs, um] }),
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
    .replace(/^- (.+)/gm, `<span style="display:flex;gap:6px;padding:2px 0"><span style="color:${U.cyan};flex-shrink:0">›</span><span>$1</span></span>`);

  return (
    <div style={{
      display: "grid", gridTemplateColumns: "340px 1fr", gap: 0,
      height: "100%", overflow: "hidden", borderRadius: 14,
      border: `1px solid ${U.border}`, backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
    }}>
      {/* LEFT PANEL */}
      <div style={{
        display: "flex", flexDirection: "column", borderRight: `1px solid ${U.border}`,
        background: "rgba(5,5,8,0.6)", overflow: "hidden",
      }}>
        <div style={{
          padding: "14px 16px", borderBottom: `1px solid ${U.border}`,
          background: `linear-gradient(180deg,rgba(167,139,250,0.06),transparent)`, flexShrink: 0,
        }}>
          <div style={{
            fontSize: 10, fontWeight: 700, color: U.textMute, textTransform: "uppercase",
            letterSpacing: "0.14em", display: "flex", alignItems: "center", gap: 6, marginBottom: 2
          }}>
            <Star size={10} color={U.violet} /> Scorecards
          </div>
          <div style={{ fontSize: 11, color: U.textFaint, marginBottom: 8 }}>AI-scored investment signals</div>
          <div style={{
            display: "flex", alignItems: "center", gap: 6, background: U.glassLo,
            border: `1px solid ${searchQuery ? U.violet : U.border}`, borderRadius: 8, padding: "6px 10px",
            transition: "all .15s"
          }}>
            <SearchIcon size={11} color={searchQuery ? U.violet : U.textMute} />
            <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder="Filter tickers..."
              style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: U.text, fontSize: 11 }}
            />
          </div>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "12px 12px" }}>
          {Object.entries(scorecardMap)
            .filter(([sym, d]) => !searchQuery.trim() || sym.toLowerCase().includes(searchQuery.toLowerCase()) || d.name.toLowerCase().includes(searchQuery.toLowerCase()))
            .map(([sym, d]) => (
            <ScoreCard key={sym} ticker={sym} data={d} expanded={exp === sym} onToggle={() => se(exp === sym ? null : sym)} />
          ))}
          {searchQuery && Object.entries(scorecardMap).filter(([sym, d]) => sym.toLowerCase().includes(searchQuery.toLowerCase()) || d.name.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
            <div style={{ padding: "20px", textAlign: "center", fontSize: 11, color: U.textMute }}>No matching tickers</div>
          )}
        </div>
        <div style={{ padding: "10px 14px", borderTop: `1px solid ${U.border}`, flexShrink: 0, background: "rgba(5,5,8,0.4)" }}>
          <div style={{ fontSize: 10, color: U.textFaint, lineHeight: 1.5, display: "flex", alignItems: "flex-start", gap: 6 }}>
            <Lightbulb size={10} color={U.violet} style={{ flexShrink: 0, marginTop: 2 }} />
            Click a scorecard to expand its full financial breakdown, then ask the Copilot about it.
          </div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div style={{ display: "flex", flexDirection: "column", background: "rgba(10,10,15,0.5)", overflow: "hidden", position: "relative" }}>
        <div style={{
          padding: "0 18px", height: 52, borderBottom: `1px solid ${U.border}`,
          display: "flex", alignItems: "center", gap: 10,
          background: `linear-gradient(135deg,rgba(34,211,238,0.05),rgba(167,139,250,0.05))`, flexShrink: 0,
        }}>
          <div style={{
            width: 30, height: 30, borderRadius: "50%", flexShrink: 0,
            background: `linear-gradient(135deg,${U.cyan},${U.violet})`,
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: `0 0 16px rgba(34,211,238,0.35)`,
          }}>
            <Sparkles size={13} color="#0a0a0f" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: U.text, lineHeight: 1 }}>NEXUS Copilot</div>
            <div style={{ fontSize: 10, color: U.textMute, marginTop: 2, display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{
                width: 5, height: 5, borderRadius: "50%", background: U.emerald,
                display: "inline-block", boxShadow: `0 0 5px ${U.emerald}`, animation: "pulse-dot 2s ease infinite"
              }} />
              Online · AI financial intelligence
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{
              fontSize: 10, color: U.textMute, background: U.glassLo,
              border: `1px solid ${U.border}`, borderRadius: 6, padding: "3px 8px", display: "flex", alignItems: "center", gap: 5
            }}>
              <Bot size={10} color={U.textMute} />
              {msgs.length} messages
            </div>
            <button onClick={clearChat} style={{
              fontSize: 10, color: U.textMute, cursor: "pointer", background: U.glassLo,
              border: `1px solid ${U.border}`, borderRadius: 6, padding: "4px 9px", transition: "all .15s",
            }}>✕ Clear</button>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "20px 20px 12px", display: "flex", flexDirection: "column", gap: 16 }}>
          {msgs.length === 1 && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "32px 20px 0", gap: 16, animation: "fi .4s ease" }}>
              <div style={{
                width: 56, height: 56, borderRadius: "50%", background: `linear-gradient(135deg,${U.cyan},${U.violet})`,
                display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 32px rgba(34,211,238,0.3)`,
              }}>
                <Sparkles size={22} color="#0a0a0f" />
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: U.text, marginBottom: 4 }}>Your AI Financial Copilot</div>
                <div style={{ fontSize: 12, color: U.textMute, lineHeight: 1.6, maxWidth: 320 }}>Ask anything about stocks, valuations, market signals, or investment strategies.</div>
              </div>
            </div>
          )}
          {msgs.map((m, i) => (
            <div key={i} style={{ display: "flex", flexDirection: m.role === "user" ? "row-reverse" : "row", alignItems: "flex-start", gap: 10, animation: "fi .22s ease" }}>
              {m.role === "assistant" && (
                <div style={{
                  width: 28, height: 28, background: `linear-gradient(135deg,${U.cyan},${U.violet})`,
                  borderRadius: "50%", flexShrink: 0, marginTop: 2, display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: `0 0 10px rgba(34,211,238,0.25)`,
                }}><Bot size={12} color="#0a0a0f" /></div>
              )}
              {m.role === "user" && (
                <div style={{
                  width: 28, height: 28, background: "rgba(255,255,255,0.12)", border: `1px solid rgba(255,255,255,0.2)`,
                  borderRadius: "50%", flexShrink: 0, marginTop: 2, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: U.text
                }}>U</div>
              )}
              <div style={{
                maxWidth: "72%", padding: "11px 15px", fontSize: 13, lineHeight: 1.7, color: m.role === "user" ? "#06070a" : U.text,
                borderRadius: m.role === "user" ? "16px 4px 16px 16px" : "4px 16px 16px 16px",
                background: m.role === "user" ? "rgba(255,255,255,0.93)" : `linear-gradient(135deg,rgba(34,211,238,0.06),rgba(167,139,250,0.04))`,
                border: `1px solid ${m.role === "user" ? "rgba(255,255,255,0.2)" : "rgba(167,139,250,0.18)"}`,
                backdropFilter: "blur(10px)", boxShadow: m.role === "assistant" ? `0 2px 16px rgba(0,0,0,0.3)` : `0 2px 12px rgba(0,0,0,0.2)`,
              }} dangerouslySetInnerHTML={{ __html: md(m.content) }} />
            </div>
          ))}
          {loading && streamBuf && (
            <div style={{ display: "flex", alignItems: "flex-start", gap: 10, animation: "fi .2s ease" }}>
              <div style={{ width: 28, height: 28, background: `linear-gradient(135deg,${U.cyan},${U.violet})`, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}><Bot size={12} color="#0a0a0f" /></div>
              <div style={{ maxWidth: "72%", padding: "11px 15px", fontSize: 13, lineHeight: 1.7, color: U.text, borderRadius: "4px 16px 16px 16px", background: `linear-gradient(135deg,rgba(34,211,238,0.06),rgba(167,139,250,0.04))`, border: "1px solid rgba(167,139,250,0.18)", backdropFilter: "blur(10px)", boxShadow: `0 2px 16px rgba(0,0,0,0.3)` }} dangerouslySetInnerHTML={{ __html: md(streamBuf) }} />
            </div>
          )}
          {loading && !streamBuf && (
            <div style={{ display: "flex", alignItems: "flex-start", gap: 10, animation: "fi .2s ease" }}>
              <div style={{ width: 28, height: 28, background: `linear-gradient(135deg,${U.cyan},${U.violet})`, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}><Bot size={12} color="#0a0a0f" /></div>
              <div style={{ padding: "13px 18px", background: `linear-gradient(135deg,rgba(34,211,238,0.06),rgba(167,139,250,0.04))`, border: "1px solid rgba(167,139,250,0.18)", borderRadius: "4px 16px 16px 16px", display: "flex", alignItems: "center", gap: 5 }}>
                {[0, 1, 2].map(j => <span key={j} style={{ width: 6, height: 6, borderRadius: "50%", background: `linear-gradient(135deg,${U.cyan},${U.violet})`, display: "inline-block", animation: `dp 1.4s ease ${j * 0.18}s infinite` }} />)}
                <span style={{ fontSize: 11, color: U.textMute, marginLeft: 4 }}>Analyzing…</span>
              </div>
            </div>
          )}
          <div ref={bot} />
        </div>

        <div className="chip-scroll" style={{ padding: "8px 16px", borderTop: `1px solid ${U.border}`, display: "flex", gap: 6, overflowX: "auto", flexShrink: 0, background: "rgba(5,5,8,0.4)" }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: U.textFaint, textTransform: "uppercase", letterSpacing: "0.12em", flexShrink: 0, alignSelf: "center", marginRight: 4 }}>Quick:</div>
          {dynamicPrompts.map(p => (
            <button key={p} onClick={() => send(p)} style={{
              padding: "5px 12px", borderRadius: 999, border: `1px solid ${U.border}`, background: U.glassLo, color: U.textDim, cursor: "pointer",
              fontSize: 11, fontWeight: 500, whiteSpace: "nowrap", flexShrink: 0, transition: "all .15s",
            }}>{p}</button>
          ))}
        </div>

        <div style={{ padding: "12px 16px", borderTop: `1px solid ${U.border}`, background: "rgba(5,5,8,0.6)", flexShrink: 0 }}>
          <div style={{
            display: "flex", alignItems: "flex-end", gap: 10, background: inputFocus ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.03)",
            border: `1px solid ${inputFocus ? "rgba(34,211,238,0.35)" : U.border}`, borderRadius: 14, padding: "10px 14px", transition: "all .2s",
          }}>
            <textarea
              ref={inpRef} value={inp}
              onChange={e => { si(e.target.value); e.target.style.height = "auto"; e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px"; }}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
              onFocus={() => sif(true)} onBlur={() => sif(false)}
              placeholder="Ask about any stock, valuation, or market signal…"
              rows={1}
              style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: U.text, fontSize: 13, lineHeight: 1.6, resize: "none", overflow: "hidden", minHeight: 22, maxHeight: 120 }} />
            <button onClick={() => send()} disabled={loading || !inp.trim()} style={{
              width: 34, height: 34, borderRadius: 10, border: "none",
              background: inp.trim() && !loading ? `linear-gradient(135deg,${U.cyan},${U.violet})` : "rgba(255,255,255,0.06)",
              display: "flex", alignItems: "center", justifyContent: "center", cursor: inp.trim() && !loading ? "pointer" : "not-allowed",
              flexShrink: 0, transition: "all .2s", boxShadow: inp.trim() && !loading ? `0 0 16px rgba(34,211,238,0.35)` : "none",
            }}><Send size={14} color={inp.trim() && !loading ? "#0a0a0f" : U.textFaint} /></button>
          </div>
        </div>
      </div>
    </div>
  );
}
