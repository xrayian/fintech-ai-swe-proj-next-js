'use client';

import { useState, useEffect } from 'react';

function isMarketOpen(): boolean {
  const now = new Date();
  const et = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
  const day = et.getDay();
  const minutes = et.getHours() * 60 + et.getMinutes();
  return day >= 1 && day <= 5 && minutes >= 570 && minutes < 960;
}

function formatTimestamp(): string {
  const now = new Date();
  return now.toLocaleString('en-US', {
    timeZone: 'America/New_York',
    hour: 'numeric', minute: '2-digit',
    hour12: true, month: 'short', day: 'numeric', year: 'numeric',
  }) + ' EST';
}

export function useMarketStatus() {
  const [status, setStatus] = useState({
    online: false,
    source: null as string | null,
    marketOpen: false,
    timestamp: '',
  });

  useEffect(() => {
    const check = async () => {
      const marketOpen = isMarketOpen();
      const timestamp = formatTimestamp();
      try {
        const res = await fetch('/api/market/status');
        const data = res.ok ? await res.json() : { online: false, source: null };
        setStatus({ ...data, marketOpen, timestamp });
      } catch {
        setStatus({ online: false, source: null, marketOpen, timestamp });
      }
    };
    check();
    const iv = setInterval(check, 30000);
    return () => clearInterval(iv);
  }, []);

  return status;
}
