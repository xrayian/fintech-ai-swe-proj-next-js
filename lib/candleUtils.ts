/**
 * Candlestick chart utilities for OHLC data processing
 * Fixes: Issue #22 - Candlestick chart sorting issue
 * 
 * Ensures candlestick data is properly sorted and validated
 */

export interface CandleData {
  time: string | Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

/**
 * Validate OHLC relationships
 * Ensures: High >= Open, High >= Close, High >= Low
 *          Low <= Open, Low <= Close, Low <= High
 */
export const validateOHLC = (candle: CandleData): boolean => {
  const { open, high, low, close } = candle;
  
  return (
    high >= open &&
    high >= close &&
    high >= low &&
    low <= open &&
    low <= close &&
    low <= high &&
    !isNaN(open) &&
    !isNaN(high) &&
    !isNaN(low) &&
    !isNaN(close)
  );
};

/**
 * Sort candlestick data chronologically (oldest to newest)
 * Fixes: Issue #22 - OCHL chart not sorted properly
 */
export const sortCandleData = (candles: CandleData[]): CandleData[] => {
  return [...candles].sort((a, b) => {
    const timeA = new Date(a.time).getTime();
    const timeB = new Date(b.time).getTime();
    return timeA - timeB;
  });
};

/**
 * Process and validate candlestick data
 * - Sorts by date (chronologically)
 * - Removes invalid OHLC entries
 * - Returns clean, ready-to-plot data
 */
export const processCandleData = (candles: CandleData[]): CandleData[] => {
  if (!candles || candles.length === 0) return [];
  
  // Validate each candle
  const validCandles = candles.filter(validateOHLC);
  
  // Sort chronologically
  const sorted = sortCandleData(validCandles);
  
  return sorted;
};

/**
 * Get candle data for a specific time range
 */
export const getCandleRange = (
  candles: CandleData[],
  startDate: Date,
  endDate: Date
): CandleData[] => {
  const startTime = startDate.getTime();
  const endTime = endDate.getTime();
  
  return candles.filter(candle => {
    const candleTime = new Date(candle.time).getTime();
    return candleTime >= startTime && candleTime <= endTime;
  });
};

export default { validateOHLC, sortCandleData, processCandleData, getCandleRange };
