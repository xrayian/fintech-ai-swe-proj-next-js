'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Sparkles, Bot, Send, Star, ChevronDown, ChevronRight, X, Lightbulb } from 'lucide-react';
import { U, SCORECARD, QUICK_PROMPTS } from '@/lib/constants';
import { ScoreCard } from './score-card';

type Message = {
  role: "assistant" | "user";
  content: string;
};

const AI_INIT: Message[] = [{ role: "assistant", content: "**Good morning.** I'm your AI Copilot for market intelligence. I've analyzed 847 data points since market open.\n\n**Today's quick pulse:**\n- Risk-On sentiment detected across tech and growth sectors\n- **NVDA** showing breakout volume — 2.3× daily average\n- Caution: Elevated fear index in Asia-Pacific markets\n\nAsk me anything — *\"Is AAPL wise to invest now?\"* or *\"Compare MSFT vs GOOGL\"*" }];

export default function AICopilot() {
  const [msgs, sm] = useState<Message[]>(AI_INIT);
  const [inp, si] = useState("");
  const [loading, sl] = useState(false);
  const [exp, se] = useState<string | null>(null);
  const [inputFocus, sif] = useState(false);
  const bot = useRef<HTMLDivElement>(null);
  const inpRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { bot.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);

  const send = useCallback(async (overrideText?: string) => {
    const text = overrideText ?? inp;
    if (!text.trim() || loading) return;
    const um = { role: "user" as const, content: text };
    sm(p => [...p, um]); si(""); sl(true);
    
    // Simulation of AI response as external API might not be available or need key
    setTimeout(() => {
        const response = "I've analyzed the current market data. Based on **fundamental metrics** and **sentiment analysis**, this asset shows a strong profile. The current P/E ratio is aligned with historical averages, while ROE continues to outperform sector peers.";
        sm(p => [...p, { role: "assistant" as const, content: response }]);
        sl(false);
    }, 1500);
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
          <div style={{ fontSize: 11, color: U.textFaint }}>AI-scored investment signals</div>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "12px 12px" }}>
          {Object.entries(SCORECARD).map(([sym, d]) => (
            <ScoreCard key={sym} ticker={sym} data={d} expanded={exp === sym} onToggle={() => se(exp === sym ? null : sym)} />
          ))}
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
          {loading && (
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
          {QUICK_PROMPTS.map(p => (
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
