import { describe, it, expect } from 'vitest';
import { validateOHLC, sortCandleData, processCandleData, getCandleRange } from '../candleUtils';
import { NormalizedCandle } from '@/lib/providers/types';

const mockCandle = (overrides?: Partial<NormalizedCandle>): NormalizedCandle => ({
  date: '1/15/2025',
  open: 100,
  high: 105,
  low: 95,
  close: 102,
  volume: 1000000,
  ...overrides,
});

describe('candleUtils', () => {
  describe('validateOHLC', () => {
    it('should validate a correct OHLC candle', () => {
      const candle = mockCandle();
      expect(validateOHLC(candle)).toBe(true);
    });

    it('should reject when high < open', () => {
      const candle = mockCandle({ high: 95, open: 100 });
      expect(validateOHLC(candle)).toBe(false);
    });

    it('should reject when high < close', () => {
      const candle = mockCandle({ high: 100, close: 105 });
      expect(validateOHLC(candle)).toBe(false);
    });

    it('should reject when low > open', () => {
      const candle = mockCandle({ low: 105, open: 100 });
      expect(validateOHLC(candle)).toBe(false);
    });

    it('should reject when low > close', () => {
      const candle = mockCandle({ low: 105, close: 102 });
      expect(validateOHLC(candle)).toBe(false);
    });

    it('should reject NaN values', () => {
      const candle = mockCandle({ open: NaN });
      expect(validateOHLC(candle)).toBe(false);
    });

    it('should reject Infinity values', () => {
      const candle = mockCandle({ high: Infinity });
      expect(validateOHLC(candle)).toBe(false);
    });

    it('should reject -Infinity values', () => {
      const candle = mockCandle({ low: -Infinity });
      expect(validateOHLC(candle)).toBe(false);
    });
  });

  describe('sortCandleData', () => {
    it('should sort candles chronologically within same year', () => {
      const candles = [
        mockCandle({ date: '1/20/2025' }),
        mockCandle({ date: '1/10/2025' }),
        mockCandle({ date: '1/15/2025' }),
      ];
      const sorted = sortCandleData(candles);
      expect(sorted[0].date).toBe('1/10/2025');
      expect(sorted[1].date).toBe('1/15/2025');
      expect(sorted[2].date).toBe('1/20/2025');
    });

    it('should sort cross-year dates correctly (Issue #22)', () => {
      const candles = [
        mockCandle({ date: '5/14/2026' }),
        mockCandle({ date: '12/19/2025' }),
        mockCandle({ date: '1/15/2026' }),
      ];
      const sorted = sortCandleData(candles);
      expect(sorted[0].date).toBe('12/19/2025');
      expect(sorted[1].date).toBe('1/15/2026');
      expect(sorted[2].date).toBe('5/14/2026');
    });

    it('should handle invalid dates by placing them at the end', () => {
      const candles = [
        mockCandle({ date: '1/15/2025' }),
        mockCandle({ date: 'invalid-date' }),
        mockCandle({ date: '1/10/2025' }),
      ];
      const sorted = sortCandleData(candles);
      expect(sorted[0].date).toBe('1/10/2025');
      expect(sorted[1].date).toBe('1/15/2025');
      expect(sorted[2].date).toBe('invalid-date');
    });

    it('should not mutate original array', () => {
      const candles = [mockCandle({ date: '1/20/2025' }), mockCandle({ date: '1/10/2025' })];
      const original = JSON.stringify(candles);
      sortCandleData(candles);
      expect(JSON.stringify(candles)).toBe(original);
    });
  });

  describe('processCandleData', () => {
    it('should filter invalid candles and sort valid ones', () => {
      const candles = [
        mockCandle({ date: '1/20/2025' }),
        mockCandle({ date: '1/10/2025', high: 95 }), // Invalid: high < open
        mockCandle({ date: '1/15/2025' }),
      ];
      const processed = processCandleData(candles);
      expect(processed).toHaveLength(2);
      expect(processed[0].date).toBe('1/15/2025');
      expect(processed[1].date).toBe('1/20/2025');
    });

    it('should return empty array for null input', () => {
      expect(processCandleData(null as unknown as NormalizedCandle[])).toEqual([]);
    });

    it('should return empty array for empty input', () => {
      expect(processCandleData([])).toEqual([]);
    });

    it('should handle all invalid candles gracefully', () => {
      const candles = [
        mockCandle({ open: NaN }),
        mockCandle({ high: Infinity }),
        mockCandle({ low: -Infinity }),
      ];
      const processed = processCandleData(candles);
      expect(processed).toHaveLength(0);
    });
  });

  describe('getCandleRange', () => {
    it('should return candles within date range', () => {
      const candles = [
        mockCandle({ date: '2025-01-10' }),
        mockCandle({ date: '2025-01-15' }),
        mockCandle({ date: '2025-01-20' }),
      ];
      const start = new Date('2025-01-12');
      const end = new Date('2025-01-18');
      const result = getCandleRange(candles, start, end);
      expect(result).toHaveLength(1);
      expect(result[0].date).toBe('2025-01-15');
    });

    it('should include boundary dates', () => {
      const candles = [mockCandle({ date: '2025-01-15' })];
      const start = new Date('2025-01-15');
      const end = new Date('2025-01-15');
      const result = getCandleRange(candles, start, end);
      expect(result).toHaveLength(1);
    });

    it('should return empty array if no candles in range', () => {
      const candles = [mockCandle({ date: '2025-01-10' })];
      const start = new Date('2025-02-01');
      const end = new Date('2025-02-15');
      const result = getCandleRange(candles, start, end);
      expect(result).toHaveLength(0);
    });
  });
});
