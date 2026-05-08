import fs from 'fs';
import path from 'path';

const CACHE_DIR = path.join(process.cwd(), 'data', 'candles');
const TTL = 24 * 60 * 60 * 1000;

interface CandleEntry {
  date: string; open: number; high: number; low: number; close: number; volume: number;
}
interface CandleCacheFile {
  symbol: string; fetchedAt: number; data: CandleEntry[];
}

function ensureDir(): void {
  if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });
}
function filePath(symbol: string): string {
  return path.join(CACHE_DIR, `${symbol.toUpperCase()}.json`);
}

export function getCachedCandles(symbol: string): CandleEntry[] | null {
  try {
    const fp = filePath(symbol);
    if (!fs.existsSync(fp)) return null;
    const raw = fs.readFileSync(fp, 'utf-8');
    const entry: CandleCacheFile = JSON.parse(raw);
    if (Date.now() - entry.fetchedAt > TTL) { fs.unlinkSync(fp); return null; }
    return entry.data;
  } catch { return null; }
}

export function setCachedCandles(symbol: string, data: CandleEntry[]): void {
  try {
    ensureDir();
    const entry: CandleCacheFile = { symbol: symbol.toUpperCase(), fetchedAt: Date.now(), data };
    fs.writeFileSync(filePath(symbol), JSON.stringify(entry), 'utf-8');
  } catch (e) { console.error('Failed to write candle cache:', e); }
}
