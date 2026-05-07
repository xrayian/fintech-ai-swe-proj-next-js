import { fetchKpis, fetchFundamentals, fetchNews } from '@/lib/providers/orchestrator';
import { SP500_TOP100 } from '@/lib/symbols/sp500-top100';

const DEFAULTS = SP500_TOP100.slice(0, 8).map(s => s.sym);

function fmtMarketCap(n: number): string {
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}T`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(1)}B`;
  return `$${n.toFixed(0)}M`;
}

export async function GET() {
  try {
    const [kpiData, fundamentalsResults, news] = await Promise.all([
      fetchKpis(),
      Promise.allSettled(DEFAULTS.map(s => fetchFundamentals(s))),
      fetchNews(DEFAULTS).catch(() => [] as any[]),
    ]);

    let totalMarketCap = 0;
    for (const r of fundamentalsResults) {
      if (r.status === 'fulfilled' && r.value?.marketCap) totalMarketCap += r.value.marketCap;
    }

    const avgFear = news.length
      ? Math.round(news.reduce((s: number, n: any) => s + n.fearScore, 0) / news.length)
      : null;

    return Response.json({
      marketCap: totalMarketCap > 0 ? fmtMarketCap(totalMarketCap) : '—',
      sp500: kpiData.sp500,
      fearGreed: avgFear !== null ? `${100 - avgFear} / 100` : '—',
      vix: kpiData.vix,
      tenYearYield: kpiData.tenYearYield,
    });
  } catch {
    return Response.json({ error: 'Market KPI data unavailable — retrying every 30s' }, { status: 503 });
  }
}
