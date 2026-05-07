interface CacheEntry<T> {
  data: T;
  expiry: number;
}

const store = new Map<string, CacheEntry<any>>();

const TTL = {
  candles: { '1': 30000, '5': 60000, '15': 60000, '30': 120000, '60': 120000, D: 300000, W: 1800000, M: 3600000 },
};

export function cachedCandles(symbol: string, resolution: string, count: number): any[] | null {
  const key = `candles:${symbol}:${resolution}:${count}`;
  const entry = store.get(key);
  if (entry && entry.expiry > Date.now()) return entry.data;
  store.delete(key);
  return null;
}

export function setCandles(symbol: string, resolution: string, count: number, data: any[]): void {
  const key = `candles:${symbol}:${resolution}:${count}`;
  const ttl = (TTL.candles as any)[resolution] || 300000;
  store.set(key, { data, expiry: Date.now() + ttl });
}

export function getCached<T>(ns: string, key: string): T | null {
  const entry = store.get(`${ns}:${key}`);
  if (entry && entry.expiry > Date.now()) return entry.data;
  store.delete(`${ns}:${key}`);
  return null;
}

export function setCached<T>(ns: string, key: string, data: T, ttlMs: number): void {
  store.set(`${ns}:${key}`, { data, expiry: Date.now() + ttlMs });
}
