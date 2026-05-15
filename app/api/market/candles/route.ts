import { NextRequest } from 'next/server';
import { fetchCandles } from '@/lib/providers/orchestrator';
import { getCached, setCached } from '@/lib/cache';
import { getCachedCandles, setCachedCandles } from '@/lib/candle-cache';
import { processCandleData } from '@/lib/candleUtils';

export async function GET(request: NextRequest) {
  const symbol = request.nextUrl.searchParams.get('symbol') || 'AAPL';

  const cached = getCached<any[]>('candles', symbol);
  if (cached) return Response.json(cached);

  const fileCached = getCachedCandles(symbol);
  if (fileCached) {
    // Process cached data: validate and sort
    const processedData = processCandleData(fileCached);
    setCached('candles', symbol, processedData, 300000);
    return Response.json(processedData);
  }

  try {
    const rawData = await fetchCandles(symbol, 'D', 100);
    
    // Process and validate candle data (Issue #22)
    const processedData = processCandleData(rawData);
    
    if (processedData.length) {
      setCached('candles', symbol, processedData, 300000);
      setCachedCandles(symbol, processedData);
      return Response.json(processedData);
    }
    return Response.json({ error: 'Candle data unavailable' }, { status: 503 });
  } catch (e: any) {
    if (e?.status === 429) {
      return Response.json({ error: 'API rate limit reached — candle data will refresh when limits reset' }, { status: 503 });
    }
    return Response.json({ error: 'Candle data unavailable' }, { status: 503 });
  }
}
