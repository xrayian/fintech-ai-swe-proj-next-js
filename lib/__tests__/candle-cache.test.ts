import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { getCachedCandles, setCachedCandles } from '../candle-cache';

const CACHE_DIR = path.join(process.cwd(), 'data', 'candles');

describe('candle-cache file operations', () => {
  beforeEach(() => {
    if (!fs.existsSync(CACHE_DIR)) {
      fs.mkdirSync(CACHE_DIR, { recursive: true });
    }
  });

  afterEach(() => {
    const files = fs.readdirSync(CACHE_DIR);
    for (const f of files) {
      if (f.endsWith('.json')) fs.unlinkSync(path.join(CACHE_DIR, f));
    }
  });

  it('returns null for uncached symbol', () => {
    expect(getCachedCandles('ZZZZ_TEST_NONE')).toBeNull();
  });

  it('stores and retrieves candle data', () => {
    const data = [
      { date: '2024-01-02', open: 100, high: 101, low: 99, close: 100.5, volume: 1000000 },
    ];
    setCachedCandles('TEST_A', data);
    expect(getCachedCandles('TEST_A')).toEqual(data);
  });

  it('round-trips multiple candles', () => {
    const data = [
      { date: '2024-01-02', open: 100, high: 101, low: 99, close: 100.5, volume: 1000000 },
      { date: '2024-01-03', open: 101, high: 102, low: 100, close: 101.5, volume: 800000 },
    ];
    setCachedCandles('TEST_B', data);
    expect(getCachedCandles('TEST_B')).toEqual(data);
  });

  it('returns null after TTL expiry', () => {
    const data = [{ date: '2024-01-02', open: 100, high: 101, low: 99, close: 100.5, volume: 1000000 }];
    setCachedCandles('TEST_EXP', data);

    const filePath = path.join(CACHE_DIR, 'TEST_EXP.json');
    const raw = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    raw.fetchedAt = Date.now() - 25 * 60 * 60 * 1000;
    fs.writeFileSync(filePath, JSON.stringify(raw));

    expect(getCachedCandles('TEST_EXP')).toBeNull();
  });

  it('handles non-existent directory gracefully', () => {
    // Should not crash if data/candles doesn't exist for a random symbol
    expect(getCachedCandles('GHOST_999')).toBeNull();
  });

  it('normalizes symbol to uppercase', () => {
    const data = [{ date: '2024-01-02', open: 100, high: 101, low: 99, close: 100.5, volume: 1000000 }];
    setCachedCandles('msft', data);
    expect(getCachedCandles('MSFT')).toEqual(data);
    expect(getCachedCandles('msft')).toEqual(data);
  });
});
