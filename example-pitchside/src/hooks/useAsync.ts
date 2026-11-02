import { useCallback, useEffect, useState } from 'react';

type AsyncState<T> =
  | { status: 'loading'; data: null; error: null }
  | { status: 'success'; data: T; error: null }
  | { status: 'error'; data: null; error: Error };

export function useAsync<T>(load: () => Promise<T>, deps: readonly unknown[]): AsyncState<T> & { retry: () => void } {
  const [state, setState] = useState<AsyncState<T>>({ status: 'loading', data: null, error: null });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    setState({ status: 'loading', data: null, error: null });
    load()
      .then((data) => {
        if (active) setState({ status: 'success', data, error: null });
      })
      .catch((error: unknown) => {
        if (active) setState({ status: 'error', data: null, error: error instanceof Error ? error : new Error(String(error)) });
      });
    return () => {
      active = false;
    };
  }, [...deps, attempt]);

  const retry = useCallback(() => setAttempt((value) => value + 1), []);
  return { ...state, retry };
}
