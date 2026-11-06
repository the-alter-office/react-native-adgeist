import type { Spec } from '../NativeAdgeist';

const NativeAdgeist: jest.Mocked<Spec> = {
  initializeSdk: jest.fn().mockResolvedValue(true),
  destroySdk: jest.fn().mockResolvedValue(true),
  fetchCreative: jest.fn().mockResolvedValue({}),
  setUserDetails: jest.fn(),
  logEvent: jest.fn(),
  getConsentStatus: jest.fn().mockResolvedValue(false),
  updateConsentStatus: jest.fn(),
  trackImpression: jest.fn().mockResolvedValue(''),
  trackView: jest.fn().mockResolvedValue(''),
  trackTotalView: jest.fn().mockResolvedValue(''),
  trackClick: jest.fn().mockResolvedValue(''),
  trackVideoPlayback: jest.fn().mockResolvedValue(''),
};

export default NativeAdgeist;
