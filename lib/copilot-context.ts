import { fetchFundamentals, fetchQuote, fetchNews, fetchSectors, } from '@/lib/providers/orchestrator';
import { SP500_TOP100 } from '@/lib/symbols/sp500-top100';
import ALL_SYMBOLS from '@/lib/symbols/stock-symbols.json';
import type { NormalizedFundamentals } from '@/lib/providers/types';

const ENTITY_SYMBOLS = ALL_SYMBOLS.map(s => s.sym);

// Bangladeshi Common Names & Tickers
const BD_SYMBOLS = [
  { sym: "GP", name: "grameenphone" },
  { sym: "ROBI", name: "robi" },
  { sym: "BEXIMCO", name: "beximco" },
  { sym: "BATBC", name: "batbc" },
  { sym: "SQUAREPHARMA", name: "square pharma" },
  { sym: "WALTONHIL", name: "walton" },
  { sym: "BRACBANK", name: "brac bank" },
  { sym: "CITYBANK", name: "city bank" },
  { sym: "IDLC", name: "idlc" },
  { sym: "SUMMITPWR", name: "summit power" },
  { sym: "LHBL", name: "lafargeholcim" },
  { sym: "RENATA", name: "renata" },
  { sym: "BERGERPBL", name: "berger paints" },
  { sym: "UPGDCL", name: "united power" },
  { sym: "MJLBD", name: "mjl bangladesh" },
  { sym: "OLYMPIC", name: "olympic industries" },
  { sym: "EBL", name: "eastern bank" },
  { sym: "IBBL", name: "islami bank" },
  { sym: "DBBL", name: "dutch-bangla bank" },
  { sym: "AMCLPRAN", name: "pran" },
  { sym: "BPML", name: "bashundhara paper" },
  { sym: "ACI", name: "aci limited" },
  { sym: "TITASGAS", name: "titas gas" },
  { sym: "BSRMLTD", name: "bsrm" },
];

// Major Global International Companies (100+ Total Coverage)
const GLOBAL_SYMBOLS = [
  { sym: "TSM", name: "tsmc" }, { sym: "SONY", name: "sony" }, { sym: "SHOP", name: "shopify" },
  { sym: "SAP", name: "sap" }, { sym: "NVO", name: "novo nordisk" }, { sym: "AZN", name: "astrazeneca" },
  { sym: "HSBC", name: "hsbc" }, { sym: "RYCEY", name: "rolls-royce" }, { sym: "BUD", name: "anheuser-busch" },
  { sym: "BP", name: "bp" }, { sym: "SNY", name: "sanofi" }, { sym: "SHEL", name: "shell" },
  { sym: "ASML", name: "asml" }, { sym: "HDB", name: "hdfc bank" }, { sym: "IBN", name: "icici bank" },
  { sym: "INFY", name: "infosys" }, { sym: "WIT", name: "wipro" }, { sym: "ERIC", name: "ericsson" },
  { sym: "NOK", name: "nokia" }, { sym: "SPOT", name: "spotify" }, { sym: "RACE", name: "ferrari" },
  { sym: "STLA", name: "stellantis" }, { sym: "VWAGY", name: "volkswagen" }, { sym: "BMWYY", name: "bmw" },
  { sym: "DMLRY", name: "mercedes-benz" }, { sym: "HMC", name: "honda" }, { sym: "TM", name: "toyota" },
  { sym: "MELI", name: "mercadolibre" }, { sym: "NU", name: "nubank" }, { sym: "VALE", name: "vale" },
  { sym: "PBR", name: "petrobras" }, { sym: "AMX", name: "america movil" }, { sym: "DEO", name: "diageo" },
  { sym: "GSK", name: "gsk" }, { sym: "UL", name: "unilever" }, { sym: "ABB", name: "abb" },
  { sym: "UBS", name: "ubs" }, { sym: "LOGI", name: "logitech" }, { sym: "ARM", name: "arm" },
  { sym: "NTT", name: "ntt" }, { sym: "MUFG", name: "mitsubishi" }, { sym: "SMFG", name: "sumitomo" },
  { sym: "NMR", name: "nomura" }, { sym: "MFG", name: "mizuho" }, { sym: "BHP", name: "bhp" },
  { sym: "RIO", name: "rio tinto" }, { sym: "BTI", name: "british american tobacco" }, { sym: "DELL", name: "dell" },
  { sym: "SEA", name: "sea limited" }, { sym: "GRAB", name: "grab" }, { sym: "DIDI", name: "didi" },
  { sym: "TTE", name: "totalenergies" }, { sym: "E", name: "eni" }, { sym: "RELX", name: "relx" },
  { sym: "SAN", name: "santander" }, { sym: "BBVA", name: "bbva" }, { sym: "ING", name: "ing group" },
  { sym: "CS", name: "credit suisse" }, { sym: "DB", name: "deutsche bank" }, { sym: "BCS", name: "barclays" },
  { sym: "NWG", name: "natwest" }, { sym: "LYG", name: "lloyds" }, { sym: "VOD", name: "vodafone" },
  { sym: "ORAN", name: "orange" }, { sym: "TEF", name: "telefonica" }, { sym: "BAM", name: "brookfield" },
  { sym: "BN", name: "brookfield corp" }, { sym: "ENGIY", name: "engie" }, { sym: "CRARY", name: "credit agricole" },
  { sym: "ADRNY", name: "adidas" }, { sym: "LVMUY", name: "lvmh" }, { sym: "HNNMY", name: "h&m" },
  { sym: "IDEXY", name: "inditex" }, { sym: "NSRGY", name: "nestle" }, { sym: "PUMSY", name: "puma" },
  { sym: "AIRFP", name: "airbus" }, { sym: "DASTY", name: "dassault" }, { sym: "RHHBY", name: "roche" },
  { sym: "NVS", name: "novartis" }, { sym: "UBS", name: "ubs group" }, { sym: "VLVLY", name: "volvo" },
  { sym: "ALVWM", name: "allianz" }, { sym: "MUV2", name: "munich re" }, { sym: "BASFY", name: "basf" },
  { sym: "BAYRY", name: "bayer" }, { sym: "SIEGY", name: "siemens" }, { sym: "DTEGY", name: "deutsche telekom" },
  { sym: "TKA", name: "thyssenkrupp" }, { sym: "LHA", name: "lufthansa" }, { sym: "AIR", name: "air france" },
  { sym: "IAG", name: "international airlines group" }, { sym: "RYAAY", name: "ryanair" },
  { sym: "EL", name: "estee lauder" }, { sym: "CPRT", name: "copart" }, { sym: "FND", name: "floor & decor" },
];

const ENTITY_NAMES = [
  ...ALL_SYMBOLS.map(s => {
    const clean = s.name
      .replace(/( Inc\.| Corp\.| Corporation| Ltd\.| Co\.| plc| Group| Platforms| Technologies| Solutions)/gi, '')
      .trim()
      .toLowerCase();
    return { sym: s.sym, name: clean, firstWord: clean.split(' ')[0] };
  }),
  ...BD_SYMBOLS.map(s => ({ sym: s.sym, name: s.name, firstWord: s.name.split(' ')[0] })),
  ...GLOBAL_SYMBOLS.map(s => ({ sym: s.sym, name: s.name, firstWord: s.name.split(' ')[0] }))
];

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
