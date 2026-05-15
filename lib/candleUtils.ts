import { NormalizedCandle } from '@/lib/providers/types';

/**
 * Candlestick chart utilities for OHLC data processing
 * Fixes: Issue #22 - Candlestick chart sorting issue
 *
 * Ensures candlestick data is properly sorted and validated
 */

/**
 * Validate OHLC relationships
 * Ensures: High >= Open, High >= Close, High >= Low
 *          Low <= Open, Low <= Close, Low <= High
 *          All values are finite numbers (not NaN or Infinity)
 */
export const validateOHLC = (candle: NormalizedCandle): boolean => {
  const { open, high, low, close } = candle;

  return (
    Number.isFinite(open) &&
    Number.isFinite(high) &&
    Number.isFinite(low) &&
    Number.isFinite(close) &&
    high >= open &&
    high >= close &&
    high >= low &&
    low <= open &&
    low <= close &&
    low <= high
  );
};

/**
 * Sort candlestick data chronologically (oldest to newest)
 * Fixes: Issue #22 - OHLC chart not sorted properly
 * Handles invalid dates by placing them at the end
 */
export const sortCandleData = (candles: NormalizedCandle[]): NormalizedCandle[] => {
  return [...candles].sort((a, b) => {
    const timeA = new Date(a.date).getTime();
    const timeB = new Date(b.date).getTime();

    // Handle invalid dates (NaN) by pushing them to end
    if (isNaN(timeA) && isNaN(timeB)) return 0;
    if (isNaN(timeA)) return 1;
    if (isNaN(timeB)) return -1;

    return timeA - timeB;
  });
};

/**
 * Process and validate candlestick data
 * - Removes invalid OHLC entries
 * - Sorts by date (chronologically)
 * - Returns clean, ready-to-plot data
 */
export const processCandleData = (candles: NormalizedCandle[]): NormalizedCandle[] => {
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
  candles: NormalizedCandle[],
  startDate: Date,
  endDate: Date
): NormalizedCandle[] => {
  const startTime = startDate.getTime();
  const endTime = endDate.getTime();

  return candles.filter(candle => {
    const candleTime = new Date(candle.date).getTime();
    return candleTime >= startTime && candleTime <= endTime;
  });
};
