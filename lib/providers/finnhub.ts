import {
  NormalizedQuote, NormalizedCandle, NormalizedFundamentals,
  NormalizedNewsItem, NormalizedIndicators, NormalizedKpis, NormalizedSector,
} from './types';

const BASE = 'https://finnhub.io/api/v1';
const KEYS = () => [
  process.env.FINNHUB_API_KEY,
  process.env.FINNHUB_API_KEY_2,
].filter(Boolean) as string[];

export function isRateLimited(err: unknown): boolean {
  if (err instanceof FinnhubError && err.status === 429) return true;
  return false;
}

export class FinnhubError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'FinnhubError';
    this.status = status;
  }
}

async function fetchJson(path: string, keyIndex = 0): Promise<any> {
  const keys = KEYS();
  const key = keys[keyIndex];
  if (!key) throw new FinnhubError('No API key configured', 401);
  const url = `${BASE}${path}${path.includes('?') ? '&' : '?'}token=${key}`;
  const res = await fetch(url);
  if (res.status === 429 && keyIndex < keys.length - 1) {
    return fetchJson(path, keyIndex + 1);
  }
  if (!res.ok) throw new FinnhubError(`Finnhub ${res.status}: ${res.statusText}`, res.status);
  return res.json();
}

export async function fetchQuote(symbols: string[]): Promise<NormalizedQuote[]> {
  const results = await Promise.allSettled(symbols.map(sym => fetchJson(`/quote?symbol=${sym}`)));
  return results
    .filter((r): r is PromiseFulfilledResult<any> => r.status === 'fulfilled' && r.value)
    .map(r => ({
      symbol: '',
      price: r.value.c ?? 0,
      change: r.value.d ?? 0,
      changePercent: r.value.dp ?? 0,
      high: r.value.h ?? 0,
      low: r.value.l ?? 0,
      open: r.value.o ?? 0,
      previousClose: r.value.pc ?? 0,
      timestamp: r.value.t ?? Math.floor(Date.now() / 1000),
    }));
}

export async function fetchCandles(symbol: string, resolution: string, count: number): Promise<NormalizedCandle[]> {
  const to = Math.floor(Date.now() / 1000);
  const from = to - count * { '1': 60, '5': 300, '15': 900, '30': 1800, '60': 3600, D: 86400, W: 604800, M: 2592000 }[resolution]!;
  const data = await fetchJson(`/stock/candle?symbol=${symbol}&resolution=${resolution}&from=${from}&to=${to}`);
  if (data.s === 'no_data') return [];
  if (!data.t) return [];
  return data.t.map((t: number, i: number) => ({
    date: new Date(t * 1000).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' }),
    open: data.o[i],
    high: data.h[i],
    low: data.l[i],
    close: data.c[i],
    volume: data.v[i],
  }));
}

export async function fetchFundamentals(symbol: string): Promise<NormalizedFundamentals | null> {
  const data = await fetchJson(`/stock/metric?symbol=${symbol}&metric=all`);
  const m = data?.metric;
  if (!m) return null;
  const peRatio = m.peBasicExclExtraTTM ?? 0;
  const roe = m.roeTTM != null ? m.roeTTM / 100 : 0;
  const revenueCagr = m.revenueGrowthTTMYoy != null ? m.revenueGrowthTTMYoy / 100 : 0;
  const netMargin = m.netProfitMarginTTM != null ? m.netProfitMarginTTM / 100 : 0;
  const debtEquity = m['totalDebt/totalEquityQuarterly'] ?? m['totalDebt/totalEquityAnnual'] ?? 0;
  const marketCap = m.marketCapitalization ?? 0;
  if (!peRatio && !roe && !revenueCagr && !netMargin && !debtEquity) return null;
  return { symbol, name: '', peRatio, roe, revenueCagr, netMargin, debtEquity, marketCap };
}

export async function fetchNews(symbols: string[]): Promise<NormalizedNewsItem[]> {
  const to = Math.floor(Date.now() / 1000);
  const from = to - 86400 * 7;
  const results = await Promise.allSettled(
    symbols.map(sym => fetchJson(`/company-news?symbol=${sym}&from=${new Date(from * 1000).toISOString().slice(0, 10)}&to=${new Date(to * 1000).toISOString().slice(0, 10)}`))
  );
  const seen = new Set<string>();
  const items: NormalizedNewsItem[] = [];
  for (const r of results) {
    if (r.status !== 'fulfilled' || !Array.isArray(r.value)) continue;
    for (const article of r.value) {
      if (seen.has(article.headline)) continue;
      seen.add(article.headline);
      items.push(normalizeNewsItem(article));
    }
  }
  return items.sort((a, b) => b.fearScore - a.fearScore).slice(0, 20);
}

function normalizeNewsItem(article: any): NormalizedNewsItem {
  const sentimentLabel = (article.sentiment ?? '').toLowerCase();
  const fearScore =
    sentimentLabel === 'positive' || sentimentLabel === 'bullish' ? 15 :
    sentimentLabel === 'negative' || sentimentLabel === 'bearish' ? 75 :
    sentimentLabel === 'neutral' ? 50 :
    typeof article.sentimentScore === 'number'
      ? Math.round((1 - article.sentimentScore) * 100)
      : 50;
  return {
    id: String(article.id ?? Math.random()),
    headline: article.headline ?? '',
    source: article.source ?? '',
    timestamp: article.datetime ? new Date(article.datetime * 1000).toISOString() : new Date().toISOString(),
    sentiment: scoreToSentiment(fearScore),
    fearScore,
    relatedSymbols: article.related ? article.related.split(',') : [],
    url: article.url,
  };
}

function scoreToSentiment(score: number): NormalizedNewsItem['sentiment'] {
  if (score <= 15) return 'Extreme Greed';
  if (score <= 35) return 'Greed';
  if (score <= 55) return 'Neutral';
  if (score <= 75) return 'Fear';
  return 'Extreme Fear';
}

export async function fetchIndicators(symbol: string): Promise<NormalizedIndicators> {
  const to = Math.floor(Date.now() / 1000);
  const from = to - 86400 * 60;

  const [rsiRes, sma20Res, sma50Res, bbRes] = await Promise.allSettled([
    fetchJson(`/indicator?symbol=${symbol}&resolution=D&from=${from}&to=${to}&indicator=rsi&timeperiod=14`),
    fetchJson(`/indicator?symbol=${symbol}&resolution=D&from=${from}&to=${to}&indicator=sma&timeperiod=20`),
    fetchJson(`/indicator?symbol=${symbol}&resolution=D&from=${from}&to=${to}&indicator=sma&timeperiod=50`),
    fetchJson(`/indicator?symbol=${symbol}&resolution=D&from=${from}&to=${to}&indicator=bbands&timeperiod=20`),
  ]);

  const last = <T>(r: PromiseSettledResult<any>, field: string): T | null =>
    r.status === 'fulfilled' && Array.isArray(r.value?.[field]) && r.value[field].length
      ? r.value[field][r.value[field].length - 1] : null;

  return {
    rsi: last<number>(rsiRes, 'rsi'),
    macd: null,
    sma20: last<number>(sma20Res, 'sma'),
    sma50: last<number>(sma50Res, 'sma'),
    bollingerUpper: last<number>(bbRes, 'upper'),
    bollingerMiddle: last<number>(bbRes, 'middle'),
    bollingerLower: last<number>(bbRes, 'lower'),
  };
}

export async function fetchKpis(): Promise<NormalizedKpis> {
  const [spRes, vixRes, tnxRes] = await Promise.allSettled([
    fetchJson('/quote?symbol=SPY'),
    fetchJson('/quote?symbol=VIX'),
    fetchJson('/quote?symbol=TNX'),
  ]);

  const quoteVal = (r: PromiseSettledResult<any>): string =>
    r.status === 'fulfilled' && r.value?.c ? String(r.value.c) : '—';

  return {
    marketCap: '—',
    sp500: quoteVal(spRes),
    fearGreed: '—',
    vix: quoteVal(vixRes),
    tenYearYield: quoteVal(tnxRes),
  };
}

export async function fetchSectors(): Promise<NormalizedSector[]> {
  const data = await fetchJson('/stock/sector-performance');
  if (!Array.isArray(data)) return [];
  return data.map((s: any) => ({
    name: s.sector ?? '',
    value: 0,
    chg: s.changes ?? 0,
  }));
}
