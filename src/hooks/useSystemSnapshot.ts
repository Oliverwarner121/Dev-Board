import { useCallback, useEffect, useState } from 'react';
import { getSystemSnapshot } from '../services/system';
import type { SnapshotState } from '../types/system';

export function useSystemSnapshot(
  intervalMs = 2000,
): SnapshotState & { refresh: () => void } {
  const [state, setState] = useState<SnapshotState>({ status: 'loading' });
  const refresh = useCallback(() => {
    void getSystemSnapshot()
      .then((data) => setState({ status: 'ready', data }))
      .catch((error: unknown) =>
        setState({
          status: 'unavailable',
          message:
            error instanceof Error ? error.message : 'Metrics unavailable',
        }),
      );
  }, []);

  useEffect(() => {
    refresh();
    const timer = window.setInterval(refresh, intervalMs);
    return () => window.clearInterval(timer);
  }, [intervalMs, refresh]);

  return { ...state, refresh };
}
