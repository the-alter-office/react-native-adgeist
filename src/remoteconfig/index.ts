import Adgeist from '../specs/NativeAdgeist';
import type { AdgeistRemoteConfig } from '../types/AdgeistRemoteConfig';

const parseRemoteConfig = (
  rawJson: string | null
): AdgeistRemoteConfig | null => {
  if (!rawJson) {
    return null;
  }
  try {
    return JSON.parse(rawJson) as AdgeistRemoteConfig;
  } catch {
    return null;
  }
};

export const getRemoteConfig = async (): Promise<AdgeistRemoteConfig | null> =>
  parseRemoteConfig(await Adgeist.getRemoteConfig());

export const fetchRemoteConfig =
  async (): Promise<AdgeistRemoteConfig | null> =>
    parseRemoteConfig(await Adgeist.fetchRemoteConfig());
