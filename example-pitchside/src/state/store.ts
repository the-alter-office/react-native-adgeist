import { useSyncExternalStore } from 'react';

export interface IStore<T> {
  get: () => T;
  set: (updater: (prev: T) => T) => void;
  subscribe: (listener: () => void) => () => void;
}

export function createStore<T>(initial: T): IStore<T> {
  let state = initial;
  const listeners = new Set<() => void>();
  return {
    get: () => state,
    set: (updater) => {
      state = updater(state);
      listeners.forEach((listener) => listener());
    },
    subscribe: (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}

export function useStore<T>(store: IStore<T>): T {
  return useSyncExternalStore(store.subscribe, store.get, store.get);
}
