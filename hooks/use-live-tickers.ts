'use client';

import { useState, useEffect } from 'react';
import { TICKERS } from '@/lib/constants';

export type TickerData = typeof TICKERS[0];

export function useLiveTickers() {
  const [live, sl] = useState(() => 
    Object.fromEntries(TICKERS.map(t => [t.sym, { ...t }]))
  );

  useEffect(() => {
    const iv = setInterval(() => sl(prev => {
      const u = { ...prev };
      TICKERS.forEach(t => {
        const o = u[t.sym];
        const d = (Math.random() - .499) * .3;
        const np = +(o.price + d).toFixed(2);
        u[t.sym] = {
          ...o,
          price: np,
          pct: +((np - t.price) / t.price * 100).toFixed(2),
          chg: +(np - t.price).toFixed(2)
        };
      });
      return u;
    }), 250);
    return () => clearInterval(iv);
  }, []);

  return live;
}
