import { fetchFundamentals, fetchQuote, fetchNews, fetchSectors, } from '@/lib/providers/orchestrator';
import ALL_SYMBOLS from '@/lib/symbols/stock-symbols.json';
import type { NormalizedFundamentals } from '@/lib/providers/types';

const ENTITY_SYMBOLS = ALL_SYMBOLS.map(s => s.sym);

const ENTITY_NAMES = ALL_SYMBOLS.map(s => {
  const clean = s.name
    .replace(/( Inc\.| Corp\.| Corporation| Ltd\.| Co\.| plc| Group| Platforms| Technologies| Solutions)/gi, '')
    .trim()
    .toLowerCase();
  return { sym: s.sym, name: clean, firstWord: clean.split(' ')[0] };
});

export interface Entities {
  tickers: string[];
  intent: 'compare' | 'single' | 'news' | 'sector' | 'general';
}

export function extractEntities(msg: string): Entities {
  const lower = msg.toLowerCase();
  const upper = msg.toUpperCase();
  
  // Match tickers (e.g., AAPL)
  const tickersFromSyms = ENTITY_SYMBOLS.filter(sym => new RegExp(`\\b${sym}\\b`).test(upper));
  
  // Match company names (e.g., Apple, Microsoft, Uber)
  const tickersFromNames = ENTITY_NAMES
    .filter(e => {
      if (lower.includes(e.name)) return true;
      if (e.firstWord.length > 3 && new RegExp(`\\b${e.firstWord}\\b`, 'i').test(lower)) return true;
      return false;
    })
    .map(e => e.sym);

  const tickers = [...new Set([...tickersFromSyms, ...tickersFromNames])];

  const intent: Entities['intent'] =
    /\b(compare|vs\.?|versus|difference|better|which)\b/i.test(msg) ? 'compare' :
    /\b(news|headline|sentiment)\b/i.test(msg) ? 'news' :
    /\b(sector|industry|market)\b/i.test(msg) ? 'sector' :
    tickers.length === 1 ? 'single' : 'general';

  return { tickers: [...new Set(tickers)], intent };
}

function fundamentalsLine(sym: string, f: NormalizedFundamentals): string {
  const score = f.score ? `${f.score}/10` : 'N/A';
  const verdict = f.verdict || 'N/A';
  const tag = f.tag || 'N/A';
  return `${f.name || sym} (${sym}): Score ${score} · ${verdict} · ${tag} | P/E ${f.peRatio.toFixed(1)}× · ROE ${(f.roe * 100).toFixed(1)}% · CAGR +${(f.revenueCagr * 100).toFixed(1)}% · Margin ${(f.netMargin * 100).toFixed(1)}% · D/E ${f.debtEquity.toFixed(2)}`;
}

function priceLine(sym: string, q: { price: number; change: number; changePercent: number }): string {
  return `${sym}: $${q.price.toFixed(2)} · ${q.change >= 0 ? '+' : ''}${q.change.toFixed(2)} (${q.changePercent >= 0 ? '+' : ''}${q.changePercent.toFixed(2)}%)`;
}

export async function buildContext(entities: Entities, extraSymbols?: string[]): Promise<string> {
  const { tickers, intent } = entities;
  const parts: string[] = [SYSTEM_PERSONA];
  const dataParts: string[] = [];

  const allSymbols = [...new Set([...tickers, ...(extraSymbols || [])])];

  if (allSymbols.length > 0) {
    const [fundamentals, quotes] = await Promise.all([
      Promise.allSettled(allSymbols.map(s => fetchFundamentals(s))),
      Promise.allSettled(allSymbols.map(s => fetchQuote([s]).then(q => q[0] || null))),
    ]);

    const fundLines: string[] = [];
    for (const [i, sym] of allSymbols.entries()) {
      const r = fundamentals[i];
      if (r.status === 'fulfilled' && r.value) {
        fundLines.push(fundamentalsLine(sym, r.value));
      }
    }
    if (fundLines.length) {
      dataParts.push('--- FUNDAMENTALS ---\n' + fundLines.join('\n'));
    }

    const priceLines: string[] = [];
    for (const [i, sym] of allSymbols.entries()) {
      const r = quotes[i];
      if (r.status === 'fulfilled' && r.value) {
        priceLines.push(priceLine(sym, r.value));
      }
    }
    if (priceLines.length) {
      dataParts.push('--- PRICE DATA ---\n' + priceLines.join('\n'));
    }
  }

  if (intent === 'compare' && tickers.length >= 2) {
    dataParts.push('When comparing, highlight relative strengths, risk profiles, and which suits different investment styles.');
  }

  if (intent === 'news') {
    try {
      const news = await fetchNews(tickers.length > 0 ? tickers : ENTITY_SYMBOLS);
      if (news.length > 0) {
        const newsBlock = news.map(n =>
          `[${n.sentiment}] ${n.headline} (${n.source}) — Fear: ${n.fearScore}/100`
        ).join('\n');
        dataParts.push('--- NEWS & SENTIMENT ---\n' + newsBlock);
      }
    } catch {}
  }

  if (intent === 'sector' || tickers.length === 0) {
    try {
      const sectors = await fetchSectors();
      if (sectors.length > 0) {
        const sectorBlock = sectors.map(s =>
          `${s.name}: ${s.chg >= 0 ? '+' : ''}${s.chg.toFixed(2)}%`
        ).join('\n');
        dataParts.push('--- SECTOR DATA ---\n' + sectorBlock);
      }
    } catch {}
  }

  parts.push(dataParts.join('\n\n'));
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
