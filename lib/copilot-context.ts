import { TICKERS, SCORECARD, NEWS, SECTORS, fmt } from '@/lib/constants';

const KNOWN_SYMS = new Set(TICKERS.map(t => t.sym));

export interface Entities {
  tickers: string[];
  intent: 'compare' | 'single' | 'news' | 'sector' | 'general';
}

export function extractEntities(msg: string): Entities {
  const upper = msg.toUpperCase();
  const tickers = TICKERS
    .map(t => t.sym)
    .filter(sym => new RegExp(`\\b${sym}\\b`).test(upper));

  const intent: Entities['intent'] =
    /\b(compare|vs\.?|versus|difference|better|which)\b/i.test(msg) ? 'compare' :
    /\b(news|headline|sentiment)\b/i.test(msg) ? 'news' :
    /\b(sector|industry|market)\b/i.test(msg) ? 'sector' :
    tickers.length === 1 ? 'single' : 'general';

  return { tickers: [...new Set(tickers)], intent };
}

export function buildContext(entities: Entities): string {
  const { tickers, intent } = entities;
  const parts: string[] = [SYSTEM_PERSONA];

  if (tickers.length > 0) {
    const scoreSection = tickers
      .filter(sym => SCORECARD[sym as keyof typeof SCORECARD])
      .map(sym => {
        const d = SCORECARD[sym as keyof typeof SCORECARD];
        return `${d.name} (${sym}): Score ${d.score}/10 · ${d.verdict} · ${d.tag} | P/E ${d.pe}× · ROE ${fmt(d.roe)}% · CAGR +${d.cagr}% · Margin ${d.margin}% · D/E ${d.de}`;
      });
    if (scoreSection.length) {
      parts.push('--- SCORECARD DATA ---\n' + scoreSection.join('\n'));
    }

    const priceSection = tickers
      .map(sym => {
        const t = TICKERS.find(t => t.sym === sym);
        return t ? `${t.sym} (${t.name}): $${t.price} · ${t.chg >= 0 ? '+' : ''}${t.chg} (${t.pct >= 0 ? '+' : ''}${t.pct}%)` : null;
      })
      .filter(Boolean);
    if (priceSection.length) {
      parts.push('--- PRICE DATA ---\n' + priceSection.join('\n'));
    }
  }

  if (intent === 'compare' && tickers.length >= 2) {
    parts.push('When comparing, highlight relative strengths, risk profiles, and which suits different investment styles.');
  }

  if (intent === 'news') {
    const newsBlock = NEWS.map(n =>
      `[${n.region}] ${n.headline} (${n.source}, ${n.time}) — Fear: ${n.fear}/100 · Sentiment: ${n.sentiment}`
    ).join('\n');
    parts.push('--- NEWS & SENTIMENT ---\n' + newsBlock);
  }

  if (intent === 'sector' || tickers.length === 0) {
    const sectorBlock = SECTORS.map(s =>
      `${s.name}: ${s.value}% of market · ${s.chg >= 0 ? '+' : ''}${s.chg}%`
    ).join('\n');
    parts.push('--- SECTOR WEIGHTS ---\n' + sectorBlock);
  }

  return parts.join('\n\n');
}

const SYSTEM_PERSONA = `You are NEXUS Copilot, a financial AI assistant for the NEXUS Market Intelligence dashboard. You have access to real-time market data provided below.

NEVER:
- Make up data or metrics. Only use the information given.
- Perform tasks outside of providing financial insights based on the data.
- If asked about something you don't have data on, admit that you don't have enough information rather than guessing.

Rules:
- Ground every answer in the data provided. Do not make up metrics.
- Be concise and direct. Use **bold** for key numbers and terms.
- When asked about a stock, cite specific metrics (P/E, ROE, CAGR, margin, D/E, AI score).
- When comparing, present a balanced view of pros and cons.
- Admit when you don't have enough data rather than guessing.
- Keep responses under 250 words unless asked for detail.`;
