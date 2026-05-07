import {
  NormalizedQuote, NormalizedCandle, NormalizedFundamentals,
  NormalizedNewsItem, NormalizedIndicators, NormalizedKpis, NormalizedSector,
} from './types';
import {
  fetchQuote as fhQuote, fetchCandles as fhCandles,
  fetchFundamentals as fhFundamentals, fetchNews as fhNews,
  fetchIndicators as fhIndicators, fetchKpis as fhKpis, fetchSectors as fhSectors,
  isRateLimited as fhRateLimited,
} from './finnhub';
import {
  fetchQuote as avQuote, fetchCandles as avCandles,
  fetchFundamentals as avFundamentals, fetchNews as avNews,
  fetchIndicators as avIndicators,
} from './alpha-vantage';

async function fallback<T>(primary: () => Promise<T>, secondary: () => Promise<T>): Promise<T> {
  try {
    return await primary();
  } catch (err) {
    if (fhRateLimited(err)) {
      return await secondary();
    }
    throw err;
  }
}

export async function fetchQuote(symbols: string[]): Promise<NormalizedQuote[]> {
  return fallback(
    () => fhQuote(symbols),
    () => avQuote(symbols),
  );
}

export async function fetchCandles(symbol: string, resolution: string, count: number): Promise<NormalizedCandle[]> {
  return fallback(
    () => fhCandles(symbol, resolution, count),
    () => avCandles(symbol, resolution, count),
  );
}

export async function fetchFundamentals(symbol: string): Promise<NormalizedFundamentals | null> {
  return fallback(
    () => fhFundamentals(symbol),
    () => avFundamentals(symbol),
  );
}

export async function fetchNews(symbols: string[]): Promise<NormalizedNewsItem[]> {
  return fallback(
    () => fhNews(symbols),
    () => avNews(symbols),
  );
}

export async function fetchIndicators(symbol: string): Promise<NormalizedIndicators> {
  return fallback(
    () => fhIndicators(symbol),
    () => avIndicators(symbol),
  );
}

export async function fetchKpis(): Promise<NormalizedKpis> {
  return fhKpis();
}

export async function fetchSectors(): Promise<NormalizedSector[]> {
  return fhSectors();
}
