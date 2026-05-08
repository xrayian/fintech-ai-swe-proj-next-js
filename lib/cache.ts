interface CacheEntry<T> {
  data: T;
  expiry: number;
}

const store = new Map<string, CacheEntry<any>>();

export function getCached<T>(ns: string, key: string): T | null {
  const entry = store.get(`${ns}:${key}`);
  if (entry && entry.expiry > Date.now()) return entry.data;
  store.delete(`${ns}:${key}`);
  return null;
}

export function setCached<T>(ns: string, key: string, data: T, ttlMs: number): void {
  store.set(`${ns}:${key}`, { data, expiry: Date.now() + ttlMs });
}
