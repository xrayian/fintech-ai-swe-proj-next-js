import { fetchKpis } from '@/lib/providers/orchestrator';
import { fetchFundamentals as fhFundamentals, fetchNews as fhNews } from '@/lib/providers/finnhub';
import { SP500_TOP100 } from '@/lib/symbols/sp500-top100';
import { getCached, setCached } from '@/lib/cache';

const DEFAULTS = SP500_TOP100.slice(0, 8).map(s => s.sym);

function fmtMarketCap(n: number): string {
  if (n >= 1e12) return `$${(n / 1e12).toFixed(1)}T`;
  if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  return `$${(n / 1e3).toFixed(1)}K`;
}

export async function GET() {
  const cached = getCached<any>('kpis', 'response');
  if (cached) return Response.json(cached);

  try {
    const [kpiData, fundamentalsResults, news] = await Promise.all([
      fetchKpis(),
      Promise.allSettled(DEFAULTS.map(s => fhFundamentals(s).catch(() => null))),
      fhNews(DEFAULTS).catch(() => [] as any[]),
    ]);

    let totalMarketCap = 0;
    for (const r of fundamentalsResults) {
      if (r.status === 'fulfilled' && r.value?.marketCap) totalMarketCap += r.value.marketCap;
    }

    const avgFear = news.length
      ? Math.round(news.reduce((s: number, n: any) => s + n.fearScore, 0) / news.length)
      : null;

    const body = {
      marketCap: totalMarketCap > 0 ? fmtMarketCap(totalMarketCap) : '—',
      sp500: kpiData.sp500,
      fearGreed: avgFear !== null ? `${100 - avgFear} / 100` : '—',
      vix: kpiData.vix,
      tenYearYield: kpiData.tenYearYield,
    };

    setCached('kpis', 'response', body, 25000);
    return Response.json(body);
  } catch {
    return Response.json({ error: 'Market KPI data unavailable — retrying every 30s' }, { status: 503 });
  }
}
