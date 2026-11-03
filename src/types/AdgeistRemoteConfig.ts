export interface AdgeistAdServerEndpoints {
  baseUrl?: string;
  adRequestPath?: string;
  impressionPath?: string;
  eventPath?: string;
}

export interface AdgeistIdentifierEndpoints {
  apiUrl?: string;
  signalingUrl?: string;
}

export interface AdgeistTelemetryEndpoints {
  ingestUrl?: string;
  apiKey?: string;
}

export interface AdgeistRemoteConfigEndpoints {
  adServer?: AdgeistAdServerEndpoints;
  identifier?: AdgeistIdentifierEndpoints;
  telemetry?: AdgeistTelemetryEndpoints;
}

export interface AdgeistPlatformFeatureFlags {
  errorTrackingEnabled?: boolean;
  benchmarkTrackingEnabled?: boolean;
}

export interface AdgeistFeatureFlags {
  web?: AdgeistPlatformFeatureFlags;
  ios?: AdgeistPlatformFeatureFlags;
  android?: AdgeistPlatformFeatureFlags;
  reactNative?: AdgeistPlatformFeatureFlags;
}

export interface AdgeistTrackingConfig {
  visibilityThreshold?: number;
}

export interface AdgeistAdSizeLimits {
  MIN_WIDTH?: number;
  MIN_HEIGHT?: number;
  MAX_WIDTH?: number;
  MAX_HEIGHT?: number;
}

export interface AdgeistAdSizes {
  banner?: AdgeistAdSizeLimits;
  display?: AdgeistAdSizeLimits;
  companion?: AdgeistAdSizeLimits;
}

export interface AdgeistSdkVersionPair {
  publisher?: string;
  advertiser?: string;
}

export interface AdgeistWebSdkVersions extends AdgeistSdkVersionPair {
  identifier?: string;
}

export interface AdgeistSdkVersions {
  web?: AdgeistWebSdkVersions;
  ios?: AdgeistSdkVersionPair;
  android?: AdgeistSdkVersionPair;
  reactNative?: AdgeistSdkVersionPair;
}

export interface AdgeistRemoteConfig {
  endpoints?: AdgeistRemoteConfigEndpoints;
  featureFlags?: AdgeistFeatureFlags;
  tracking?: AdgeistTrackingConfig;
  adSizes?: AdgeistAdSizes;
  sdkVersions?: AdgeistSdkVersions;
}
