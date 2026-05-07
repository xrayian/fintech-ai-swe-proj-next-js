import { NextRequest } from 'next/server';
import { fetchFundamentals } from '@/lib/providers/orchestrator';
import { SCORECARD } from '@/lib/constants';

export async function GET(request: NextRequest) {
  const symbol = request.nextUrl.searchParams.get('symbol') || 'AAPL';
  try {
    const data = await fetchFundamentals(symbol);
    if (data) return Response.json(data);
  } catch { /* fall through to fallback */ }
  const fallback = SCORECARD[symbol as keyof typeof SCORECARD];
  return Response.json(fallback ? { symbol, ...fallback, peRatio: fallback.pe, revenueCagr: fallback.cagr, netMargin: fallback.margin, debtEquity: fallback.de, marketCap: 0 } : null);
}
