import {
  type ConfigPlugin,
  AndroidConfig,
  withAndroidManifest,
  withInfoPlist,
} from '@expo/config-plugins';

const ANDROID_META_DATA_KEY = 'com.adgeistkit.ads.ADGEIST_APP_ID';
const IOS_INFO_PLIST_KEY = 'ADGEIST_APP_ID';

export const withAdgeistAppId: ConfigPlugin<{ adgeistAppId: string }> = (
  config,
  { adgeistAppId }
) => {
  config = withAndroidManifest(config, (cfg) => {
    const mainApplication = AndroidConfig.Manifest.getMainApplicationOrThrow(
      cfg.modResults
    );
    AndroidConfig.Manifest.addMetaDataItemToMainApplication(
      mainApplication,
      ANDROID_META_DATA_KEY,
      adgeistAppId
    );
    return cfg;
  });

  return withInfoPlist(config, (cfg) => {
    cfg.modResults[IOS_INFO_PLIST_KEY] = adgeistAppId;
    return cfg;
  });
};
