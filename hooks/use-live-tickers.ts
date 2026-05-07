'use client';

import { useState, useEffect, useRef } from 'react';
import { useWatchlist } from '@/hooks/use-watchlist';

export interface TickerData {
  sym: string;
  name: string;
  price: number;
  chg: number;
  pct: number;
}

export function useLiveTickers() {
  const { watchlist, ready } = useWatchlist();
  const [live, setLive] = useState<Record<string, TickerData>>({});
  const cursorRef = useRef(0);
  const mounted = useRef(true);

  useEffect(() => {
    setLive(prev => {
      const next = { ...prev };
      for (const s of watchlist) {
        if (!next[s.sym]) {
          next[s.sym] = { sym: s.sym, name: s.name, price: 0, chg: 0, pct: 0 };
        }
      }
      return next;
    });
  }, [watchlist]);

  useEffect(() => {
    if (!ready || !watchlist.length) return;
    mounted.current = true;
    const chunkSize = 10;

    const poll = async () => {
      const chunk = watchlist.slice(cursorRef.current, cursorRef.current + chunkSize);
      cursorRef.current = (cursorRef.current + chunkSize) % watchlist.length;
      if (!chunk.length) return;

      try {
        const syms = chunk.map(s => s.sym).join(',');
        const res = await fetch(`/api/market/quote?symbols=${syms}`);
        if (!res.ok || !mounted.current) return;
        const data = await res.json();
        if (!mounted.current) return;
        setLive(prev => {
          const next = { ...prev };
          for (const q of (Array.isArray(data) ? data : [])) {
            if (q?.symbol) {
              next[q.symbol] = {
                sym: q.symbol,
                name: next[q.symbol]?.name || q.symbol,
                price: q.price ?? 0,
                chg: q.change ?? 0,
                pct: q.changePercent ?? 0,
              };
            }
          }
          return next;
        });
      } catch {}
    };

    poll();
    const iv = setInterval(poll, 10000);
    return () => { mounted.current = false; clearInterval(iv); };
  }, [watchlist, ready]);

  return live;
}
