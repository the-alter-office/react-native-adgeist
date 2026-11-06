import { createStore, useStore } from './store';

export type Tier = 'FREE' | 'PASS';

interface IEntitlementState {
  tier: Tier;
}

export const entitlementStore = createStore<IEntitlementState>({ tier: 'FREE' });

export const useEntitlement = (): IEntitlementState => useStore(entitlementStore);

export function setTier(tier: Tier): void {
  entitlementStore.set((prev) => ({ ...prev, tier }));
}

export function canWatch(state: IEntitlementState, isPremium: boolean): boolean {
  return !isPremium || state.tier === 'PASS';
}
