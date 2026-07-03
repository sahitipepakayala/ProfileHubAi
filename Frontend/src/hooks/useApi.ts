import { useState, useCallback } from "react";

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

/**
 * Wraps an async API call with loading/error/data state, so components don't
 * each reimplement the same try/catch/setState boilerplate your pages
 * currently write by hand (see the pattern repeated across JobDetail,
 * CandidateDashboard, etc.). Not currently used anywhere — available if you
 * want to refactor toward it later.
 *
 * Usage:
 *   const { data, loading, error, execute } = useApi(getJobMatches);
 *   useEffect(() => { execute(jobId); }, [jobId]);
 */
export function useApi<T, Args extends unknown[]>(
  apiFn: (...args: Args) => Promise<T>
) {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(
    async (...args: Args) => {
      setState({ data: null, loading: true, error: null });
      try {
        const result = await apiFn(...args);
        setState({ data: result, loading: false, error: null });
        return result;
      } catch (err: any) {
        const message = err.response?.data?.message || "Something went wrong. Please try again.";
        setState({ data: null, loading: false, error: message });
        throw err;
      }
    },
    [apiFn]
  );

  return { ...state, execute };
}