import { NextRequest } from 'next/server';
import { fetchIndicators } from '@/lib/providers/orchestrator';

export async function GET(request: NextRequest) {
  const symbol = request.nextUrl.searchParams.get('symbol') || 'AAPL';
  try {
    const data = await fetchIndicators(symbol);
    return Response.json(data);
  } catch {
    return Response.json(
      { error: 'Technical indicators temporarily unavailable' },
      { status: 503 }
    );
  }
}
