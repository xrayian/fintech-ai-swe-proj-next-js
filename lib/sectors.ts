const SECTOR_ETFS: Record<string, string> = {
  'XLK': 'Technology',
  'XLV': 'Health Care',
  'XLF': 'Financials',
  'XLY': 'Consumer Discretionary',
  'XLC': 'Communication Services',
  'XLI': 'Industrials',
  'XLP': 'Consumer Staples',
  'XLE': 'Energy',
  'XLU': 'Utilities',
  'XLRE': 'Real Estate',
  'XLB': 'Materials',
};

const ETF_SYMBOLS = Object.keys(SECTOR_ETFS);

export async function fetchSectorPerformance(): Promise<{ name: string; chg: number }[]> {
  const keys = [
    process.env.FINNHUB_API_KEY,
    process.env.FINNHUB_API_KEY_2,
  ].filter(Boolean) as string[];

  if (!keys.length) return [];

  for (const key of keys) {
    try {
      const results = await Promise.allSettled(
        ETF_SYMBOLS.map(sym =>
          fetch(`https://finnhub.io/api/v1/quote?symbol=${sym}&token=${key}`)
            .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
            .then(d => ({ name: SECTOR_ETFS[sym], chg: d.dp ?? 0 }))
        )
      );
      const sectors = results
        .filter((r): r is PromiseFulfilledResult<{ name: string; chg: number }> =>
          r.status === 'fulfilled' && r.value != null
        )
        .map(r => r.value);
      if (sectors.length > 0) return sectors;
    } catch {
      continue;
    }
  }

  return [];
}
