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

  setUserDetails(user: Object): void;

  logEvent(event: Object): void;

  getConsentStatus(): Promise<boolean>;

  updateConsentStatus(consent: boolean): void;

  trackImpression(
    campaignId: string,
    adSpaceId: string,
    publisherId: string,
    apiKey: string,
    bidId: string,
    isTestEnvironment: boolean,
    renderTime: number
  ): Promise<string>;

  trackView(
    campaignId: string,
    adSpaceId: string,
    publisherId: string,
    apiKey: string,
    bidId: string,
    isTestEnvironment: boolean,
    viewTime: number,
    visibilityRatio: number,
    scrollDepth: number,
    timeToVisible: number
  ): Promise<string>;

  trackTotalView(
    campaignId: string,
    adSpaceId: string,
    publisherId: string,
    apiKey: string,
    bidId: string,
    isTestEnvironment: boolean,
    totalViewTime: number,
    visibilityRatio: number
  ): Promise<string>;

  trackClick(
    campaignId: string,
    adSpaceId: string,
    publisherId: string,
    apiKey: string,
    bidId: string,
    isTestEnvironment: boolean
  ): Promise<string>;

  trackVideoPlayback(
    campaignId: string,
    adSpaceId: string,
    publisherId: string,
    apiKey: string,
    bidId: string,
    isTestEnvironment: boolean,
    totalPlaybackTime: number
  ): Promise<string>;

  trackVideoQuartile(
    campaignId: string,
    adSpaceId: string,
    publisherId: string,
    apiKey: string,
    bidId: string,
    isTestEnvironment: boolean,
    quartile: string
  ): Promise<string>;

  trackConversionsWithDeepLinks(url: string): void;
}

export default TurboModuleRegistry.getEnforcing<Spec>('Adgeist');
