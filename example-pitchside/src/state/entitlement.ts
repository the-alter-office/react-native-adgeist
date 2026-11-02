import { createStore, useStore } from './store';

export type Tier = 'FREE' | 'PASS';

interface IEntitlementState {
  tier: Tier;
  adFundedUnlocks: string[];
}

export const entitlementStore = createStore<IEntitlementState>({ tier: 'FREE', adFundedUnlocks: [] });

export const useEntitlement = (): IEntitlementState => useStore(entitlementStore);

export function setTier(tier: Tier): void {
  entitlementStore.set((prev) => ({ ...prev, tier }));
}

export function unlockWithAds(contentId: string): void {
  entitlementStore.set((prev) =>
    prev.adFundedUnlocks.includes(contentId)
      ? prev
      : { ...prev, adFundedUnlocks: [...prev.adFundedUnlocks, contentId] },
  );
}

export function canWatch(state: IEntitlementState, contentId: string, isPremium: boolean): boolean {
  return !isPremium || state.tier === 'PASS' || state.adFundedUnlocks.includes(contentId);
}
