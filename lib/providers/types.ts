export interface NormalizedQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  open: number;
  previousClose: number;
  timestamp: number;
}

export interface NormalizedCandle {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface NormalizedFundamentals {
  symbol: string;
  name: string;
  peRatio: number;
  roe: number;
  revenueCagr: number;
  netMargin: number;
  debtEquity: number;
  marketCap: number;
  score?: number;
  verdict?: string;
  tag?: string;
}

export interface NormalizedNewsItem {
  id: string;
  headline: string;
  source: string;
  timestamp: string;
  sentiment: 'Extreme Greed' | 'Greed' | 'Neutral' | 'Fear' | 'Extreme Fear';
  fearScore: number;
  relatedSymbols: string[];
  url?: string;
}

export interface NormalizedIndicators {
  rsi: number | null;
  macd: { value: number; signal: number; histogram: number } | null;
  sma20: number | null;
  sma50: number | null;
  bollingerUpper: number | null;
  bollingerMiddle: number | null;
  bollingerLower: number | null;
}

export interface NormalizedKpis {
  marketCap: string;
  sp500: string;
  fearGreed: string;
  vix: string;
  tenYearYield: string;
}

export interface NormalizedSector {
  name: string;
  value: number;
  chg: number;
}

export const DEFAULT_SYMBOLS = ['AAPL', 'MSFT', 'NVDA', 'TSLA', 'GOOGL', 'AMZN', 'META', 'NFLX'];
