import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export interface UserDetails {
  userId?: string;
  userName?: string;
  email?: string;
  phone?: string;
}

export interface Event {
  eventType: string;
  eventProperties: Object;
}
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

  setUserDetails(user: Object): void;

  logEvent(event: Object): void;

  getConsentStatus(): Promise<boolean>;

  updateConsentStatus(consent: boolean): void;
}

export default TurboModuleRegistry.getEnforcing<Spec>('Adgeist');
