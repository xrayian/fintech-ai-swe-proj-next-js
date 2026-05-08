import type { NormalizedFundamentals } from './types';

const BASE = 'https://api.roic.ai/v2/fundamental/ratios';

interface RoicResponse {
  date: string;
  ticker?: string;
  return_com_eqy?: number;
  profit_margin?: number;
  tot_debt_to_tot_eqy?: number;
}

function extractFirst(data: unknown): RoicResponse | null {
  if (!data) return null;
  if (Array.isArray(data)) return (data as RoicResponse[])[0] ?? null;
  if (typeof data === 'object') return data as RoicResponse;
  return null;
}

export async function fetchFundamentals(symbol: string): Promise<NormalizedFundamentals | null> {
  const [profitability, credit] = await Promise.allSettled([
    fetchJson(`${BASE}/profitability/${symbol}?limit=1`),
    fetchJson(`${BASE}/credit/${symbol}?limit=1`),
  ]);

  const profitabilityData = profitability.status === 'fulfilled'
    ? extractFirst(profitability.value) : null;
  const creditData = credit.status === 'fulfilled'
    ? extractFirst(credit.value) : null;

  const roe = profitabilityData?.return_com_eqy != null ? profitabilityData.return_com_eqy / 100 : 0;
  const netMargin = profitabilityData?.profit_margin != null ? profitabilityData.profit_margin / 100 : 0;
  const debtEquity = creditData?.tot_debt_to_tot_eqy != null ? creditData.tot_debt_to_tot_eqy / 100 : 0;

  if (!roe && !netMargin && !debtEquity) return null;

  return {
    symbol,
    name: '',
    peRatio: 0,
    roe,
    revenueCagr: 0,
    netMargin,
    debtEquity,
    marketCap: 0,
  };
}

async function fetchJson(url: string): Promise<unknown> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Roic AI ${res.status}: ${res.statusText}`);
  return res.json();
}
