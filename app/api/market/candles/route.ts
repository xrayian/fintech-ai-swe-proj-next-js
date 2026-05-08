import { NextRequest } from 'next/server';
import { fetchCandles } from '@/lib/providers/orchestrator';
import { getCached, setCached } from '@/lib/cache';
import { getCachedCandles, setCachedCandles } from '@/lib/candle-cache';

export async function GET(request: NextRequest) {
  const symbol = request.nextUrl.searchParams.get('symbol') || 'AAPL';

  const cached = getCached<any[]>('candles', symbol);
  if (cached) return Response.json(cached);

  const fileCached = getCachedCandles(symbol);
  if (fileCached) {
    setCached('candles', symbol, fileCached, 300000);
    return Response.json(fileCached);
  }

  try {
    const data = await fetchCandles(symbol, 'D', 100);
    if (data.length) {
      setCached('candles', symbol, data, 300000);
      setCachedCandles(symbol, data);
      return Response.json(data);
    }
    return Response.json({ error: 'Candle data unavailable' }, { status: 503 });
  } catch (e: any) {
    if (e?.status === 429) {
      return Response.json({ error: 'API rate limit reached — candle data will refresh when limits reset' }, { status: 503 });
    }
    return Response.json({ error: 'Candle data unavailable' }, { status: 503 });
  }
}
