import {
  NormalizedQuote, NormalizedCandle, NormalizedFundamentals,
  NormalizedNewsItem, NormalizedIndicators,
} from './types';

const BASE = 'https://www.alphavantage.co/query';
const KEYS = () => [
  process.env.ALPHA_VANTAGE_API_KEY,
  process.env.ALPHA_VANTAGE_API_KEY_2,
  process.env.ALPHA_VANTAGE_API_KEY_3,
  process.env.ALPHA_VANTAGE_API_KEY_4,
].filter(Boolean) as string[];

class AlphaVantageError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'AlphaVantageError';
    this.status = status;
  }
}

function isRateLimited(data: any): boolean {
  return !!(
    (data.Note && data.Note.includes('API call frequency')) ||
    (data.Information && data.Information.includes('rate limit'))
  );
}

async function fetchJson(params: Record<string, string>, keyIndex = 0): Promise<any> {
  const keys = KEYS();
  const key = keys[keyIndex];
  if (!key) throw new AlphaVantageError('No API key configured', 401);
  const qs = new URLSearchParams({ ...params, apikey: key }).toString();
  const url = `${BASE}?${qs}`;
  console.warn('[AV]', params.function, params.symbol || '', `key=${keyIndex + 1}/${keys.length}`);
  const res = await fetch(url);
  if (!res.ok) throw new AlphaVantageError(`Alpha Vantage ${res.status}: ${res.statusText}`, res.status);
  const data = await res.json();
  if (isRateLimited(data) && keyIndex < keys.length - 1) {
    return fetchJson(params, keyIndex + 1);
  }
  if (data['Error Message']) {
    throw new AlphaVantageError(data['Error Message'], 400);
  }
  if (data.Information && data.Information.includes('rate limit')) {
    throw new AlphaVantageError('All API keys rate limited', 429);
  }
  return data;
}

export async function fetchQuote(symbols: string[]): Promise<NormalizedQuote[]> {
  const results = await Promise.allSettled(symbols.map(sym => fetchJson({ function: 'GLOBAL_QUOTE', symbol: sym })));
  return results
    .filter((r): r is PromiseFulfilledResult<any> => r.status === 'fulfilled')
    .map(r => {
      const q = r.value?.['Global Quote'] || {};
      return {
        symbol: q['01. symbol'] || '',
        price: parseFloat(q['05. price']) || 0,
        change: parseFloat(q['09. change']) || 0,
        changePercent: parseFloat(String(q['10. change percent'] ?? '0').replace('%', '')) || 0,
        high: parseFloat(q['03. high']) || 0,
        low: parseFloat(q['04. low']) || 0,
        open: parseFloat(q['02. open']) || 0,
        previousClose: parseFloat(q['08. previous close']) || 0,
        timestamp: Math.floor(Date.now() / 1000),
      };
    });
}

export async function fetchCandles(symbol: string, resolution: string, count: number): Promise<NormalizedCandle[]> {
  const data = await fetchJson({ function: 'TIME_SERIES_DAILY', symbol, outputsize: 'compact' });
  const series = data?.['Time Series (Daily)'];
  if (!series) return [];
  const entries = Object.entries(series)
    .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
    .map(([date, vals]: [string, any]) => ({
      date: new Date(date).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' }),
      open: parseFloat(vals['1. open']) || 0,
      high: parseFloat(vals['2. high']) || 0,
      low: parseFloat(vals['3. low']) || 0,
      close: parseFloat(vals['4. close']) || 0,
      volume: parseInt(vals['5. volume']) || 0,
    }));
  return entries.slice(-count);
}

export async function fetchFundamentals(symbol: string): Promise<NormalizedFundamentals | null> {
  const data = await fetchJson({ function: 'OVERVIEW', symbol });
  if (!data?.Symbol) return null;
  const peRatio = parseFloat(data.PERatio) || 0;
  const roe = (parseFloat(data.ReturnOnEquityTTM) || 0) / 100;
  const revenueCagr = (parseFloat(data.RevenueGrowthTTM) || 0) / 100;
  const netMargin = (parseFloat(data.ProfitMargin) || 0) / 100;
  const debtEquity = parseFloat(data.DebtToEquity) || 0;
  const marketCap = parseFloat(data.MarketCapitalization) || 0;
  if (!peRatio && !roe && !revenueCagr && !netMargin) return null;
  return { symbol, name: data.Name || '', peRatio, roe, revenueCagr, netMargin, debtEquity, marketCap };
}

export async function fetchIndicators(symbol: string): Promise<NormalizedIndicators> {
  const [rsiRes, sma20Res, sma50Res, bbRes] = await Promise.allSettled([
    fetchJson({ function: 'RSI', symbol, interval: 'daily', time_period: '14', series_type: 'close' }),
    fetchJson({ function: 'SMA', symbol, interval: 'daily', time_period: '20', series_type: 'close' }),
    fetchJson({ function: 'SMA', symbol, interval: 'daily', time_period: '50', series_type: 'close' }),
    fetchJson({ function: 'BBANDS', symbol, interval: 'daily', time_period: '20', series_type: 'close' }),
  ]);

  const lastVal = <T>(r: PromiseSettledResult<any>, key: string): T | null => {
    if (r.status !== 'fulfilled') return null;
    const series = r.value?.[key];
    if (!series) return null;
    const dates = Object.keys(series).sort();
    if (!dates.length) return null;
    return parseFloat(series[dates[dates.length - 1]][Object.keys(series[dates[dates.length - 1]])[0]]) as T;
  };

  return {
    rsi: lastVal<number>(rsiRes, 'Technical Analysis: RSI'),
    macd: null,
    sma20: lastVal<number>(sma20Res, 'Technical Analysis: SMA'),
    sma50: lastVal<number>(sma50Res, 'Technical Analysis: SMA'),
    bollingerUpper: lastVal<number>(bbRes, 'Technical Analysis: BBANDS'),
    bollingerMiddle: null,
    bollingerLower: null,
  };
}

/**
 * @deprecated Currently unused stub in the application.
 * Retained only for possible future integration.
 */
export async function fetchNews(_symbols: string[]): Promise<NormalizedNewsItem[]> {
  return [];
}
