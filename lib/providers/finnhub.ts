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

/**
 * @deprecated Currently unused in the application.
 * This endpoint requires a premium/paid Finnhub API key.
 * Retained only for possible future integration.
 */
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

const BULLISH_TERMS: [string, number][] = [
  ['soar', 3], ['surge', 3], ['rally', 3], ['record high', 3],
  ['breakthrough', 3], ['outperform', 3], ['beat expectations', 3],
  ['upgrade', 3], ['bullish', 3],
  ['gain', 2], ['jump', 2], ['climb', 2], ['rise', 2],
  ['positive', 2], ['strong', 2], ['growth', 2], ['profit', 2],
  ['boom', 2], ['opportunity', 2], ['expansion', 2], ['launch', 2],
  ['approved', 2], ['recovery', 2], ['rebound', 2],
  ['outlook', 2], ['dividend', 2], ['buyback', 2],
  ['up', 1], ['better', 1], ['improve', 1], ['innovation', 1],
  ['partner', 1], ['deal', 1], ['win', 1], ['upbeat', 1],
  ['confidence', 1], ['momentum', 1], ['increase', 1],
  ['guidance', 1], ['upward', 1],
];

const BEARISH_TERMS: [string, number][] = [
  ['crash', 3], ['plunge', 3], ['collapse', 3], ['bankruptcy', 3],
  ['downgrade', 3], ['bearish', 3], ['crisis', 3],
  ['recession', 3], ['layoff', 3], ['lawsuit', 3],
  ['investigation', 3], ['fraud', 3], ['scandal', 3],
  ['miss expectations', 3], ['warning', 3],
  ['drop', 2], ['fall', 2], ['decline', 2], ['slump', 2],
  ['slide', 2], ['negative', 2], ['weak', 2], ['loss', 2],
  ['debt', 2], ['risk', 2], ['uncertainty', 2], ['volatile', 2],
  ['inflation', 2], ['tariff', 2], ['sanction', 2],
  ['slowdown', 2], ['downturn', 2], ['cut', 2],
  ['lower', 2], ['underperform', 2], ['miss', 2],
  ['down', 1], ['worry', 1], ['concern', 1], ['pressure', 1],
  ['struggle', 1], ['challenge', 1], ['headwind', 1], ['ban', 1],
];

function computeFearScore(headline: string, summary?: string): number {
  const text = `${headline} ${summary ?? ''}`.toLowerCase();
  let score = 0;
  for (const [word, weight] of BULLISH_TERMS) {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    const matches = text.match(regex);
    if (matches) score -= weight * matches.length;
  }
  for (const [word, weight] of BEARISH_TERMS) {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    const matches = text.match(regex);
    if (matches) score += weight * matches.length;
  }
  const variance = ((headline.length * 7 + 13) % 9) - 4;
  let fearScore = 50 + score * 1.5 + variance;
  return Math.max(5, Math.min(95, Math.round(fearScore)));
}

function normalizeNewsItem(article: any): NormalizedNewsItem {
  const sentimentLabel = (article.sentiment ?? '').toLowerCase();
  let fearScore: number;
  if (sentimentLabel === 'positive' || sentimentLabel === 'bullish') {
    fearScore = 15;
  } else if (sentimentLabel === 'negative' || sentimentLabel === 'bearish') {
    fearScore = 75;
  } else if (sentimentLabel === 'neutral') {
    fearScore = 50;
  } else if (typeof article.sentimentScore === 'number') {
    fearScore = Math.round((1 - article.sentimentScore) * 100);
  } else {
    fearScore = computeFearScore(article.headline ?? '', article.summary);
  }
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

/**
 * @deprecated Currently unused in the application.
 * This endpoint requires a premium/paid Finnhub API key.
 * Retained only for possible future integration.
 */
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

/**
 * @deprecated Currently unused in the application (fallback logic only).
 * This endpoint requires a premium/paid Finnhub API key.
 * Retained only for possible future integration.
 */
export async function fetchSectors(): Promise<NormalizedSector[]> {
  const data = await fetchJson('/stock/sector-performance');
  if (!Array.isArray(data)) return [];
  return data.map((s: any) => ({
    name: s.sector ?? '',
    value: 0,
    chg: s.changes ?? 0,
  }));
}
