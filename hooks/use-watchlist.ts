'use client';

import { useState, useEffect, useCallback } from 'react';
import { SP500_TOP100 } from '@/lib/symbols/sp500-top100';
import type { SymbolEntry } from '@/lib/symbols/sp500-top100';

const STORAGE_KEY = 'nexus-watchlist';

export function useWatchlist() {
  const [watchlist, setWatchlist] = useState<SymbolEntry[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (!active) return;
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length) {
            setWatchlist(parsed);
            setReady(true);
            return;
          }
        }
      } catch {}
      setWatchlist(SP500_TOP100);
      setReady(true);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(SP500_TOP100));
      } catch {}
    });
    return () => { active = false; };
  }, []);

  const addSymbol = useCallback((sym: string, name: string) => {
    setWatchlist(prev => {
      if (prev.some(s => s.sym === sym)) return prev;
      const next = [...prev, { sym, name }];
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  const removeSymbol = useCallback((sym: string) => {
    setWatchlist(prev => {
      const next = prev.filter(s => s.sym !== sym);
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  const isWatched = useCallback((sym: string) => {
    return watchlist.some(s => s.sym === sym);
  }, [watchlist]);

  return { watchlist, addSymbol, removeSymbol, isWatched, ready };
}
