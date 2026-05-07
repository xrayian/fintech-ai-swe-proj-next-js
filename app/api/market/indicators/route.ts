import { NextRequest } from 'next/server';
import { fetchIndicators } from '@/lib/providers/orchestrator';

export async function GET(request: NextRequest) {
  const symbol = request.nextUrl.searchParams.get('symbol') || 'AAPL';
  try {
    const data = await fetchIndicators(symbol);
    return Response.json(data);
  } catch {
    return Response.json({
      rsi: null, sma20: null, sma50: null,
      bollingerUpper: null, bollingerMiddle: null, bollingerLower: null,
      macd: null,
    });
  }
}
