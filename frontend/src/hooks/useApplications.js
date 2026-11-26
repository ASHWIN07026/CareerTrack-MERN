import { useCallback, useEffect, useState } from 'react';
import { applicationsApi } from '../services/api.js';

// Tracks which request a result belongs to, so "loading" is derived instead of set inside effects.
function useRequest(key, fetcher) {
  const [result, setResult] = useState({ key: null, data: undefined, error: '' });

  useEffect(() => {
    const controller = new AbortController();
    fetcher(controller.signal)
      .then((data) => setResult({ key, data, error: '' }))
      .catch((err) => {
        if (err.name !== 'AbortError') setResult((prev) => ({ key, data: prev.data, error: err.message }));
      });
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return { data: result.data, error: result.key === key ? result.error : '', loading: result.key !== key };
}

export function useApplications({ search, status, sort }) {
  const [version, setVersion] = useState(0);
  const listKey = JSON.stringify([search, status, sort, version]);

  const list = useRequest(listKey, (signal) => applicationsApi.list({ search, status, sort }, signal));
  const stats = useRequest(`stats-${version}`, (signal) => applicationsApi.stats(signal));
  const refresh = useCallback(() => setVersion((v) => v + 1), []);

  return {
    applications: list.data || [],
    loading: list.loading,
    error: list.error,
    stats: stats.data || null,
    statsLoading: stats.loading,
    statsError: stats.error,
    refresh,
  };
}
