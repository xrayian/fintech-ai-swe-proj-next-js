import { useState, useEffect, useRef } from 'react';

export interface SearchResult {
  sym: string;
  name: string;
}

export function useSymbolSearch(debounceMs = 200) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    if (!query.trim()) {
      Promise.resolve().then(() => {
        setResults([]);
        setError(null);
        setLoading(false);
      });
      return;
    }
    
    Promise.resolve().then(() => {
      setLoading(true);
      setError(null);
    });
    clearTimeout(debounceRef.current);
    
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/symbols?q=${encodeURIComponent(query)}`);
        if (!res.ok) throw new Error('Search request failed');
        const data = await res.json();
        setResults(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Search unavailable');
      } finally {
        setLoading(false);
      }
    }, debounceMs);

    return () => clearTimeout(debounceRef.current);
  }, [query, debounceMs]);

  const retry = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/symbols?q=${encodeURIComponent(query)}`);
      if (!res.ok) throw new Error('Search request failed');
      const data = await res.json();
      setResults(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Search unavailable');
    } finally {
      setLoading(false);
    }
  };

  const clear = () => {
    setQuery('');
    setResults([]);
    setError(null);
  };

  return {
    query,
    setQuery,
    results,
    setResults,
    loading,
    error,
    setError,
    retry,
    clear,
  };
}
