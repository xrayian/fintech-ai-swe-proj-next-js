import { describe, it, expect, beforeEach } from 'vitest';
import { getCached, setCached } from '../cache';

describe('in-memory cache (lib/cache.ts)', () => {
  beforeEach(() => {
    // clear the internal Map by setting values that expire immediately
    // and waiting a tick — simplest: we just rely on fresh state per test
  });

  it('returns null for a missing key', () => {
    expect(getCached('test', 'missing')).toBeNull();
  });

  it('returns stored data within TTL', () => {
    setCached('ns', 'k1', { foo: 'bar' }, 5000);
    expect(getCached('ns', 'k1')).toEqual({ foo: 'bar' });
  });

  it('returns null after TTL expires', async () => {
    setCached('ns', 'expire', 'data', 10);
    await new Promise(r => setTimeout(r, 30));
    expect(getCached('ns', 'expire')).toBeNull();
  });

  it('namespaces keys to avoid collision', () => {
    setCached('a', 'x', 'a-x', 5000);
    setCached('b', 'x', 'b-x', 5000);
    expect(getCached('a', 'x')).toBe('a-x');
    expect(getCached('b', 'x')).toBe('b-x');
  });

  it('overwrites existing key on re-set', () => {
    setCached('ns', 'k', 'old', 5000);
    setCached('ns', 'k', 'new', 5000);
    expect(getCached('ns', 'k')).toBe('new');
  });

  it('handles complex objects', () => {
    const obj = { arr: [1, 2, 3], nested: { a: 1 } };
    setCached('ns', 'complex', obj, 5000);
    expect(getCached('ns', 'complex')).toEqual(obj);
  });
});
