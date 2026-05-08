import {
  NormalizedQuote, NormalizedCandle, NormalizedFundamentals,
  NormalizedNewsItem, NormalizedIndicators, NormalizedKpis, NormalizedSector,
} from './types';
import {
  fetchQuote as fhQuote,
  fetchFundamentals as fhFundamentals, fetchNews as fhNews,
  fetchKpis as fhKpis, fetchSectors as fhSectors,
} from './finnhub';
import {
  fetchQuote as avQuote, fetchCandles as avCandles,
  fetchFundamentals as avFundamentals,
  fetchIndicators as avIndicators,
} from './alpha-vantage';
import { fetchFundamentals as roicFundamentals } from './roic-ai';
import { fetchSectorPerformance } from '@/lib/sectors';

async function fallback<T>(primary: () => Promise<T>, secondary: () => Promise<T>): Promise<T> {
  try {
    const result = await primary();
    if (result != null) return result;
  } catch {}
  return secondary();
}

export async function fetchQuote(symbols: string[]): Promise<NormalizedQuote[]> {
  return fallback(
    () => fhQuote(symbols),
    () => avQuote(symbols),
  );
}

export async function fetchCandles(symbol: string, resolution: string, count: number): Promise<NormalizedCandle[]> {
  return avCandles(symbol, resolution, count);
}

export async function fetchFundamentals(symbol: string): Promise<NormalizedFundamentals | null> {
  const fh = await fhFundamentals(symbol).catch(() => null);

  if (fh) {
    const roic = await roicFundamentals(symbol).catch(() => null);
    if (roic) {
      return {
        ...fh,
        roe: fh.roe || roic.roe,
        netMargin: fh.netMargin || roic.netMargin,
        debtEquity: fh.debtEquity || roic.debtEquity,
      };
    }
    return fh;
  }

  return fallback(
    () => avFundamentals(symbol),
    () => roicFundamentals(symbol),
  );
}

export async function fetchNews(symbols: string[]): Promise<NormalizedNewsItem[]> {
  return fhNews(symbols);
}

export async function fetchIndicators(symbol: string): Promise<NormalizedIndicators> {
  return avIndicators(symbol);
}

export async function fetchKpis(): Promise<NormalizedKpis> {
  return fhKpis();
}

export async function fetchSectors(): Promise<NormalizedSector[]> {
  const etfSectors = await fetchSectorPerformance();
  if (etfSectors.length > 0) {
    return etfSectors.map(s => ({ name: s.name, value: 0, chg: s.chg }));
  }
  try { return await fhSectors(); } catch { return []; }
}
