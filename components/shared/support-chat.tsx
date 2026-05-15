'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, Minus } from 'lucide-react';
import { U } from '@/lib/constants';
import { useResponsive } from '@/hooks/use-responsive';

type Message = { role: 'bot' | 'user', text: string };

const SUGGESTIONS = [
  "How do I use the Technical suite?",
  "How can I compare two stocks?",
  "What is the AI Copilot?",
  "Where can I find market news?",
  "How do I manage my watchlist?",
  "What's on the dashboard?"
];

export function SupportChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [msgs, setMsgs] = useState<Message[]>([
    { role: 'bot', text: 'Hello! I am the NEXUS Assistant. I can help you navigate the dashboard and use our analysis tools. What would you like to explore?' }
  ]);
  const [inp, setInp] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [streamBuf, setStreamBuf] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const { isMobile } = useResponsive();

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [msgs, isTyping, streamBuf, isOpen, isMinimized]);

  const md = (t: string) => t
    .replace(/\*\*(.*?)\*\*/g, `<strong>$1</strong>`)
    .replace(/\*(.*?)\*/g, `<em>$1</em>`)
    .replace(/\n\n/g, "</p><p style='margin-top:8px'>")
    .replace(/\n/g, "<br/>");

  const send = async (text: string) => {
    if (!text.trim() || isTyping) return;
    const newMsg = { role: 'user' as const, text };
    setMsgs(p => [...p, newMsg]);
    setInp('');
    setIsTyping(true);
    setStreamBuf('');

    // Robust local response generator to bypass all external API limitations
    const generateResponse = (t: string) => {
      const q = t.toLowerCase();
      if (q.includes('technical') || q.includes('chart') || q.includes('indicator')) return "The **Technical** page provides RSI, SMA, and Bollinger Bands for any supported ticker. You can find it in the sidebar.";
      if (q.includes('compare') || q.includes('versus') || q.includes(' vs ')) return "Use the **Compare** tool to view two stocks side-by-side with radar charts and fundamental metrics comparison.";
      if (q.includes('copilot') || q.includes('ai chat')) return "The **AI Copilot** uses live fundamental data to provide investment signals and deep-dive analysis on specific tickers.";
      if (q.includes('news') || q.includes('sentiment')) return "Our **News** feed aggregates real-time headlines and provides a composite 'Fear & Greed' sentiment score for the market.";
      if (q.includes('watchlist') || q.includes('settings') || q.includes('api')) return "You can manage your watchlist and check your API key status in the **Settings** section.";
      if (q.includes('dashboard') || q.includes('overview')) return "The **Dashboard** gives you a high-level view of market KPIs, top movers, and a sector heatmap.";
      if (q.includes('search') || q.includes('lookup')) return "Use the search bar at the top or on the Search page to find data for over 500+ US equities.";
      
      if (q.includes('trade') || q.includes('buy') || q.includes('sell') || q.includes('deposit') || q.includes('wallet') || q.includes('money')) {
        return "NEXUS is an **analytics and research dashboard**, not a brokerage. We do not support direct trading, wallets, or fund deposits. I can help you analyze markets to make better informed decisions elsewhere!";
      }

      if (q.includes('bangladesh') || q.includes('bd ') || q.includes('dse')) {
        return "Currently, NEXUS focuses on **US Equities (S&P 500)** via our data providers. We do not have support for Bangladeshi stock exchanges at this time.";
      }

      if (q.includes('hello') || q.includes('hi ') || q === 'hi' || q.includes('hey')) return "Hello! I'm the NEXUS Assistant. I can help with dashboard features, stock lookup, comparison, and technical analysis.";
      if (q.includes('who are you') || q.includes('your name')) return "I am the NEXUS Assistant, designed to help you navigate our fintech analytics platform.";
      if (q.includes('thank')) return "You're very welcome! Let me know if you need help with our analysis tools.";
      
      return "I can help with dashboard features, stock lookup, comparison, and technical analysis. What would you like to know more about?";
    };

    setTimeout(() => {
      const reply = generateResponse(text);
      setIsTyping(false);

      // Simulated typing stream effect for smooth UI
      let i = 0;
      setStreamBuf("");
      
      const interval = setInterval(() => {
        const chunkLength = Math.max(1, Math.floor(reply.length / 40)); 
        i += chunkLength;
        if (i >= reply.length) {
          i = reply.length;
          clearInterval(interval);
          setStreamBuf('');
          setMsgs(p => [...p, { role: 'bot', text: reply }]);
        } else {
          setStreamBuf(reply.slice(0, i));
        }
      }, 20);
    }, 600);
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        style={{
          position: 'fixed', bottom: isMobile ? 80 : 24, right: isMobile ? 16 : 24, zIndex: 9999,
          width: 56, height: 56, borderRadius: '50%', background: `linear-gradient(135deg,${U.cyan},${U.violet})`,
          border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 8px 32px ${U.cyanSoft}`, transition: 'transform .15s'
        }}
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        <MessageCircle color="white" size={24} />
      </button>
    );
  }

  const w = isMobile ? '100vw' : 360;
  const h = isMobile ? '100vh' : 500;
  const b = isMobile ? 0 : 24;
  const r = isMobile ? 0 : 24;

  return (
    <div style={{
      position: 'fixed', bottom: isMinimized ? b : (isMobile ? 0 : b), right: isMobile ? 0 : r, zIndex: 9999,
      width: w, height: isMinimized ? 52 : h,
      background: U.bg, border: isMobile ? 'none' : `1px solid ${U.border}`, 
      borderRadius: isMobile ? 0 : 16, overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
      boxShadow: isMobile ? 'none' : `0 12px 48px rgba(0,0,0,0.15)`,
      transition: 'height .3s cubic-bezier(0.4, 0, 0.2, 1)',
      animation: 'fi .3s ease'
    }}>
      <div style={{
        padding: '12px 16px', background: U.headerBg, borderBottom: `1px solid ${U.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        cursor: isMinimized ? 'pointer' : 'default', backdropFilter: 'blur(12px)'
      }} onClick={() => isMinimized && setIsMinimized(false)}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: `linear-gradient(135deg,${U.cyan},${U.violet})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Bot size={14} color="white" />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: U.text }}>NEXUS Assistant</div>
            <div style={{ fontSize: 10, color: U.emerald, display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: U.emerald, display: 'inline-block', boxShadow: `0 0 6px ${U.emeraldSoft}` }} />
              Online
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {!isMobile && (
            <button onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 4 }}>
              <Minus size={18} color={U.textMute} />
            </button>
          )}
          <button onClick={(e) => { e.stopPropagation(); setIsOpen(false); setIsMinimized(false); }} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 4 }}>
            <X size={18} color={U.textMute} />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
            {msgs.map((m, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%', animation: 'fi .2s ease' }}>
                {m.role === 'bot' && (
                  <div style={{ width: 24, height: 24, borderRadius: '50%', background: U.glassHi, border: `1px solid ${U.border}`, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 2 }}>
                    <Bot size={12} color={U.text} />
                  </div>
                )}
                <div style={{
                  background: m.role === 'user' ? U.cyan : U.glassHi,
                  color: m.role === 'user' ? 'white' : U.text,
                  padding: '10px 14px', borderRadius: m.role === 'user' ? '12px 12px 0 12px' : '12px 12px 12px 0',
                  fontSize: 13, lineHeight: 1.5, border: m.role === 'user' ? 'none' : `1px solid ${U.border}`,
                  boxShadow: m.role === 'user' ? `0 4px 12px ${U.cyanSoft}` : '0 2px 8px rgba(0,0,0,0.05)'
                }} dangerouslySetInnerHTML={{ __html: md(m.text) }} />
              </div>
            ))}
            {streamBuf && (
              <div style={{ display: 'flex', gap: 8, alignSelf: 'flex-start', maxWidth: '85%', animation: 'fi .2s ease' }}>
                <div style={{ width: 24, height: 24, borderRadius: '50%', background: U.glassHi, border: `1px solid ${U.border}`, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 2 }}>
                  <Bot size={12} color={U.text} />
                </div>
                <div style={{
                  background: U.glassHi, color: U.text,
                  padding: '10px 14px', borderRadius: '12px 12px 12px 0',
                  fontSize: 13, lineHeight: 1.5, border: `1px solid ${U.border}`,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                }} dangerouslySetInnerHTML={{ __html: md(streamBuf) }} />
              </div>
            )}
            {isTyping && (
              <div style={{ display: 'flex', gap: 8, alignSelf: 'flex-start', animation: 'fi .2s ease' }}>
                <div style={{ width: 24, height: 24, borderRadius: '50%', background: U.glassHi, border: `1px solid ${U.border}`, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Bot size={12} color={U.text} />
                </div>
                <div style={{ background: U.glassHi, padding: '12px 14px', borderRadius: '12px 12px 12px 0', border: `1px solid ${U.border}`, display: 'flex', gap: 4 }}>
                  <span style={{ width: 4, height: 4, background: U.textMute, borderRadius: '50%', animation: 'dp 1.4s ease 0s infinite' }} />
                  <span style={{ width: 4, height: 4, background: U.textMute, borderRadius: '50%', animation: 'dp 1.4s ease 0.2s infinite' }} />
                  <span style={{ width: 4, height: 4, background: U.textMute, borderRadius: '50%', animation: 'dp 1.4s ease 0.4s infinite' }} />
                </div>
              </div>
            )}
          </div>

          <div style={{ padding: '0 16px 12px', borderTop: `1px solid ${U.border}`, background: U.bg }}>
            {msgs.length < 4 && (
              <div className="chip-scroll" style={{ display: 'flex', gap: 6, overflowX: 'auto', padding: '10px 0', marginBottom: 4 }}>
                {SUGGESTIONS.map(s => (
                  <button key={s} onClick={() => send(s)} style={{
                    padding: '6px 12px', borderRadius: 999, border: `1px solid ${U.borderHi}`,
                    background: U.glassHi, color: U.textDim, fontSize: 11, fontWeight: 500, whiteSpace: 'nowrap', cursor: 'pointer', transition: 'all .15s'
                  }} onMouseEnter={e => { e.currentTarget.style.color = U.cyan; e.currentTarget.style.borderColor = U.cyanSoft; }}
                     onMouseLeave={e => { e.currentTarget.style.color = U.textDim; e.currentTarget.style.borderColor = U.borderHi; }}
                  >{s}</button>
                ))}
              </div>
            )}
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', background: U.glass, border: `1px solid ${U.borderHi}`, borderRadius: 12, padding: '8px 12px', marginTop: 4 }}>
              <textarea
                value={inp}
                onChange={e => setInp(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(inp); } }}
                placeholder="Ask support..."
                rows={1}
                style={{
                  flex: 1, background: 'transparent', border: 'none', outline: 'none', color: U.text,
                  fontSize: 13, resize: 'none', maxHeight: 80, overflowY: 'auto'
                }}
              />
              <button 
                onClick={() => send(inp)}
                disabled={!inp.trim() || isTyping}
                style={{
                  width: 28, height: 28, borderRadius: 8, border: 'none',
                  background: inp.trim() && !isTyping ? U.cyan : U.glassHi,
                  cursor: inp.trim() && !isTyping ? 'pointer' : 'not-allowed',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  transition: 'all .15s'
                }}
              >
                <Send size={14} color={inp.trim() && !isTyping ? 'white' : U.textMute} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
