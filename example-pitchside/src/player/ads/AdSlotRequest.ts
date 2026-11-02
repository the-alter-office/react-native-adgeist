import type { IAdCreative } from '../../types/ads';

export interface IAdSlotRequest {
  tagId: string;
  promise: Promise<IAdCreative | null>;
  settled: boolean;
  creative: IAdCreative | null;
}

export function createSlotRequest(tagId: string, request: () => Promise<IAdCreative | null>): IAdSlotRequest {
  const slot: IAdSlotRequest = { tagId, promise: Promise.resolve(null), settled: false, creative: null };
  slot.promise = request()
    .then((creative) => {
      slot.settled = true;
      slot.creative = creative;
      return creative;
    })
    .catch((error: unknown) => {
      console.error('Ad slot request failed', tagId, error);
      slot.settled = true;
      return null;
    });
  return slot;
}

export const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));
