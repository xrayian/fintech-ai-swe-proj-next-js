import { NextRequest } from 'next/server';
import { fetchQuote } from '@/lib/providers/orchestrator';
import { DEFAULT_SYMBOLS } from '@/lib/providers/types';
import { TICKERS } from '@/lib/constants';

export async function GET(request: NextRequest) {
  const symbols = request.nextUrl.searchParams.get('symbols')?.split(',').filter(Boolean) || DEFAULT_SYMBOLS;
  try {
    const data = await fetchQuote(symbols);
    const enriched = data.map((q, i) => {
      const fallback = TICKERS.find(t => t.sym === symbols[i]) || TICKERS[0];
      return { ...q, symbol: q.symbol || symbols[i] || fallback.sym, name: fallback.name };
    });
    return Response.json(enriched);
  } catch {
    const fallback = symbols.map(sym => {
      const t = TICKERS.find(t => t.sym === sym);
      return t ? { symbol: t.sym, name: t.name, price: t.price, change: t.chg, changePercent: t.pct, high: t.price, low: t.price, open: t.price, previousClose: t.price, timestamp: Date.now() } : null;
    }).filter(Boolean);
    return Response.json(fallback);
  }
}
