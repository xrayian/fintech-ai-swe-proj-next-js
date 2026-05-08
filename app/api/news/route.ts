import { NextRequest } from 'next/server';
import { fetchNews } from '@/lib/providers/orchestrator';
import { SP500_TOP100 } from '@/lib/symbols/sp500-top100';

const FALLBACK_SYMBOLS = SP500_TOP100.slice(0, 8).map(s => s.sym);

export async function GET(request: NextRequest) {
  const symbols = request.nextUrl.searchParams.get('symbols')?.split(',').filter(Boolean) || FALLBACK_SYMBOLS;
  try {
    const data = await fetchNews(symbols);
    if (data.length) return Response.json(data);
    return Response.json({ error: 'News feed unavailable — updates every 60s' }, { status: 503 });
  } catch {
    return Response.json({ error: 'News feed unavailable — updates every 60s' }, { status: 503 });
  }
}
