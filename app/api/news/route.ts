import { NextRequest } from 'next/server';
import { fetchNews } from '@/lib/providers/orchestrator';
import { NEWS, TICKERS } from '@/lib/constants';

export async function GET(request: NextRequest) {
  const symbols = request.nextUrl.searchParams.get('symbols')?.split(',').filter(Boolean) || TICKERS.map(t => t.sym);
  try {
    const data = await fetchNews(symbols);
    if (data.length) return Response.json(data);
  } catch { /* fall through to fallback */ }
  return Response.json(NEWS.map(n => ({
    id: String(n.id), headline: n.headline, source: n.source,
    timestamp: n.time, sentiment: n.sentiment, fearScore: n.fear,
    relatedSymbols: [],
  })));
}
