import { useCallback, useEffect, useState } from 'react';
import { listProjects } from '../services/launcher';
import type { ProjectsState } from '../types/launcher';

export function useProjects(): ProjectsState & { refresh: () => void } {
  const [state, setState] = useState<ProjectsState>({ status: 'loading' });
  const refresh = useCallback(() => {
    void listProjects()
      .then((data) => setState({ status: 'ready', data }))
      .catch((error: unknown) =>
        setState({
          status: 'unavailable',
          message:
            error instanceof Error ? error.message : 'Projects unavailable',
        }),
      );
  }, []);

  useEffect(refresh, [refresh]);

  return { ...state, refresh };
}
