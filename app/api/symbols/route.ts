import { NextRequest } from 'next/server';
import stockSymbols from '@/lib/symbols/stock-symbols.json';

interface FinnhubSearchResult {
  symbol: string;
  displaySymbol: string;
  description: string;
  type: string;
}

const ALL_SYMBOLS = stockSymbols as { sym: string; name: string }[];

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q')?.trim();

  if (q) {
    const key = process.env.FINNHUB_API_KEY;
    if (key) {
      try {
        const url = `https://finnhub.io/api/v1/search?q=${encodeURIComponent(q)}&exchange=US&token=${key}`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          const results: FinnhubSearchResult[] = data?.result ?? [];
          const matches = results
            .filter(s => s.type === 'Common Stock')
            .slice(0, 20)
            .map(s => ({ sym: s.symbol, name: s.description }));
          if (matches.length) return Response.json(matches);
        }
      } catch {}
    }

    const upper = q.toUpperCase();
    const local = ALL_SYMBOLS.filter(s =>
      s.sym.startsWith(upper) ||
      s.name.toUpperCase().includes(upper)
    );
    return Response.json(local.slice(0, 20));
  }

  return Response.json(ALL_SYMBOLS);
}
