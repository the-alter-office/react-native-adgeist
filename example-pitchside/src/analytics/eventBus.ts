import { createStore, useStore } from '../state/store';

export type AnalyticsEventName =
  | 'adOpportunity'
  | 'preroll_loading_start'
  | 'preroll_loading_end'
  | 'adBreakStarted'
  | 'adStarted'
  | 'adEnded'
  | 'adSkipped'
  | 'adClicked'
  | 'onAdError'
  | 'adBreakEnded'
  | 'adBreakSkipped'
  | 'ad_timer_start'
  | 'CSAILoaded'
  | 'SSAILoaded'
  | 'display_ad_request'
  | 'display_ad_exposure'
  | 'display_ad_no_fill'
  | 'display_ad_click';

export type AnalyticsPayload = Record<string, string | number | boolean | null>;

export interface IAnalyticsEvent {
  seq: number;
  name: AnalyticsEventName;
  payload: AnalyticsPayload;
  at: number;
}

interface IAdStats {
  opportunitySec: number;
  filledSec: number;
}

const MAX_LOG = 200;
let seq = 0;

export const eventLogStore = createStore<IAnalyticsEvent[]>([]);
export const adStatsStore = createStore<IAdStats>({ opportunitySec: 0, filledSec: 0 });

export function track(name: AnalyticsEventName, payload: AnalyticsPayload = {}): void {
  seq += 1;
  const event: IAnalyticsEvent = { seq, name, payload, at: Date.now() };
  eventLogStore.set((prev) => [event, ...prev].slice(0, MAX_LOG));
  if (name === 'adOpportunity' && typeof payload.adBreakDuration === 'number') {
    const opportunity = payload.adBreakDuration;
    adStatsStore.set((prev) => ({ ...prev, opportunitySec: prev.opportunitySec + opportunity }));
  }
  if (name === 'adBreakEnded' && typeof payload.filledSec === 'number') {
    const filled = payload.filledSec;
    adStatsStore.set((prev) => ({ ...prev, filledSec: prev.filledSec + filled }));
  }
  if (__DEV__) {
    console.log(`[analytics] ${name}`, payload);
  }
}

export function clearEventLog(): void {
  eventLogStore.set(() => []);
  adStatsStore.set(() => ({ opportunitySec: 0, filledSec: 0 }));
}

export const useEventLog = (): IAnalyticsEvent[] => useStore(eventLogStore);
export const useAdStats = (): IAdStats => useStore(adStatsStore);
