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

async function fallback<T>(primary: () => Promise<T>, secondary: () => Promise<T>): Promise<T> {
  try { return await primary(); } catch {}
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
  return fallback(
    () => fhFundamentals(symbol),
    () => avFundamentals(symbol),
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
  return fhSectors();
}
