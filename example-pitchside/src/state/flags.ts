import { createStore, useStore } from './store';

export interface IRemoteFlags {
  enableVmaxLive: boolean;
  enableVmaxVod: boolean;
  enableRoadblock: boolean;
  enableMastheadAd: boolean;
  gamRefreshIntervalSec: number;
  mdpAdMountDelayMs: number;
  minLiveBreakSec: number;
}

export const DEFAULT_FLAGS: IRemoteFlags = {
  enableVmaxLive: true,
  enableVmaxVod: true,
  enableRoadblock: true,
  enableMastheadAd: true,
  gamRefreshIntervalSec: 45,
  mdpAdMountDelayMs: 1500,
  minLiveBreakSec: 10,
};

export const flagsStore = createStore<IRemoteFlags>(DEFAULT_FLAGS);

export const useFlags = (): IRemoteFlags => useStore(flagsStore);

export function setFlag<K extends keyof IRemoteFlags>(key: K, value: IRemoteFlags[K]): void {
  flagsStore.set((prev) => ({ ...prev, [key]: value }));
}
