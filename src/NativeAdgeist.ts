import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export interface Spec extends TurboModule {
  initializeSdk(customDomain: string): Promise<boolean>;
  fetchCreative(
    apiKey: string,
    origin: string,
    adSpaceId: string,
    publisherId: string,
    isTestEnvironment: boolean
  ): Promise<Object>;
  sendCreativeAnalytic(
    campaignId: string,
    adSpaceId: string,
    publisherId: string,
    eventType: string,
    origin: string,
    apiKey: string,
    bidId: string,
    isTestEnvironment: boolean
  ): Promise<Object>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('Adgeist');
