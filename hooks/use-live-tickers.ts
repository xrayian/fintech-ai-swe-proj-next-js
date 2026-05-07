'use client';

import { useState, useEffect, useRef } from 'react';
import { TICKERS } from '@/lib/constants';

export type TickerData = typeof TICKERS[0];

export function useLiveTickers() {
  const [live, sl] = useState(() =>
    Object.fromEntries(TICKERS.map(t => [t.sym, { ...t }]))
  );
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    const poll = async () => {
      try {
        const res = await fetch('/api/market/quote');
        if (!res.ok || !mounted.current) return;
        const data = await res.json();
        if (!mounted.current) return;
        sl(() =>
          Object.fromEntries(
            TICKERS.map(t => {
              const q = Array.isArray(data) ? data.find((d: any) => d.symbol === t.sym) : null;
              return [t.sym, {
                sym: t.sym,
                name: t.name,
                price: q?.price ?? t.price,
                chg: q?.change ?? t.chg,
                pct: q?.changePercent ?? t.pct,
              }];
            })
          )
        );
      } catch { /* keep previous values on error */ }
    };

    poll();
    const iv = setInterval(poll, 10000);
    return () => { mounted.current = false; clearInterval(iv); };
  }, []);

  return live;
}
