import type { ExpoConfig } from '@expo/config-types';

import withRNAdgeist from '../index';
import {
  objCFileUpdater,
  swiftFileUpdater,
} from '../ios/withRNAdgeistAppDelegate';
import { withAdgeistAppId } from '../withAdgeistAppId';

jest.mock(
  '@thealteroffice/react-native-adgeist/package.json',
  () => ({ name: '@thealteroffice/react-native-adgeist', version: '0.0.0' }),
  { virtual: true }
);

type Mod = (config: any) => Promise<any>;

const baseConfig = (): ExpoConfig => ({
  name: 'app',
  slug: 'app',
  _internal: { projectRoot: '/tmp/app' },
});

const runMod = (
  config: any,
  platform: 'ios' | 'android',
  modName: string,
  modResults: unknown
) => {
  const mod: Mod = config.mods[platform][modName];
  return mod({
    ...config,
    modResults,
    modRequest: {
      platform,
      modName,
      projectRoot: '/tmp/app',
      platformProjectRoot: `/tmp/app/${platform}`,
      introspect: false,
    },
  });
};

const androidManifest = () => ({
  manifest: {
    $: { 'xmlns:android': 'http://schemas.android.com/apk/res/android' },
    application: [{ $: { 'android:name': '.MainApplication' } }],
  },
});

const metaData = (manifest: any) =>
  manifest.manifest.application[0]['meta-data'] ?? [];

const OBJC_APP_DELEGATE = `#import "AppDelegate.h"
#import <React/RCTBundleURLProvider.h>

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  return [super application:application didFinishLaunchingWithOptions:launchOptions];
}

@end
`;

const SWIFT_APP_DELEGATE = `import Expo
import React

@UIApplicationMain
public class AppDelegate: ExpoAppDelegate {
  public override func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
  ) -> Bool {
    return super.application(application, didFinishLaunchingWithOptions: launchOptions)
  }
}
`;

describe('withRNAdgeist', () => {
  it.each([undefined, {}, { adgeistAppId: '' }])(
    'requires adgeistAppId (%p)',
    (props) => {
      expect(() => withRNAdgeist(baseConfig(), props as never)).toThrow(
        '"adgeistAppId" is required'
      );
    }
  );

  it('registers the Info.plist, manifest and AppDelegate mods', () => {
    const config: any = withRNAdgeist(baseConfig(), { adgeistAppId: 'app-1' });

    expect(Object.keys(config.mods.ios).sort()).toEqual([
      'appDelegate',
      'infoPlist',
    ]);
    expect(Object.keys(config.mods.android)).toEqual(['manifest']);
  });

  it('runs once per config', () => {
    const once: any = withRNAdgeist(baseConfig(), { adgeistAppId: 'app-1' });
    const twice: any = withRNAdgeist(once, { adgeistAppId: 'app-1' });

    expect(twice.mods.ios.infoPlist).toBe(once.mods.ios.infoPlist);
  });

  it('writes the app id on both platforms', async () => {
    const config: any = withRNAdgeist(baseConfig(), { adgeistAppId: 'app-1' });

    const plist = await runMod(config, 'ios', 'infoPlist', {});
    const manifest = await runMod(
      config,
      'android',
      'manifest',
      androidManifest()
    );

    expect(plist.modResults.ADGEIST_APP_ID).toBe('app-1');
    expect(metaData(manifest.modResults)).toEqual([
      {
        $: {
          'android:name': 'com.adgeistkit.ads.ADGEIST_APP_ID',
          'android:value': 'app-1',
        },
      },
    ]);
  });
});

describe('withAdgeistAppId', () => {
  it('keeps existing Info.plist keys', async () => {
    const config = withAdgeistAppId(baseConfig(), { adgeistAppId: 'app-2' });

    const plist = await runMod(config, 'ios', 'infoPlist', {
      CFBundleName: 'App',
      ADGEIST_APP_ID: 'old',
    });

    expect(plist.modResults).toEqual({
      CFBundleName: 'App',
      ADGEIST_APP_ID: 'app-2',
    });
  });

  it('replaces an existing manifest entry instead of duplicating it', async () => {
    const config = withAdgeistAppId(baseConfig(), { adgeistAppId: 'app-3' });
    const manifest = androidManifest();
    (manifest.manifest.application[0] as any)['meta-data'] = [
      {
        $: {
          'android:name': 'com.adgeistkit.ads.ADGEIST_APP_ID',
          'android:value': 'old',
        },
      },
    ];

    const result = await runMod(config, 'android', 'manifest', manifest);

    expect(metaData(result.modResults)).toEqual([
      {
        $: {
          'android:name': 'com.adgeistkit.ads.ADGEIST_APP_ID',
          'android:value': 'app-3',
        },
      },
    ]);
  });

  it('fails without a main application', async () => {
    const config = withAdgeistAppId(baseConfig(), { adgeistAppId: 'app-4' });

    await expect(
      runMod(config, 'android', 'manifest', { manifest: { $: {} } })
    ).rejects.toThrow();
  });
});

describe('AppDelegate updater', () => {
  it('adds the Adgeist header before @implementation in Objective-C', () => {
    const updated = objCFileUpdater(OBJC_APP_DELEGATE);

    expect(updated).toContain('#import "Adgeist.h"');
    expect(updated.indexOf('#import "Adgeist.h"')).toBeLessThan(
      updated.indexOf('@implementation AppDelegate')
    );
    expect(updated).toContain(
      'return [super application:application didFinishLaunchingWithOptions:launchOptions];'
    );
  });

  it('is idempotent in Objective-C', () => {
    const once = objCFileUpdater(OBJC_APP_DELEGATE);

    expect(objCFileUpdater(once)).toBe(once);
  });

  it('keeps a Swift AppDelegate intact and is idempotent', () => {
    const once = swiftFileUpdater(SWIFT_APP_DELEGATE);

    expect(once).toContain(
      'return super.application(application, didFinishLaunchingWithOptions: launchOptions)'
    );
    expect(swiftFileUpdater(once)).toBe(once);
  });

  it.each([
    ['objcpp', OBJC_APP_DELEGATE, '#import "Adgeist.h"'],
    ['swift', SWIFT_APP_DELEGATE, '@react-native-adgeist/implementation'],
  ])('the %s mod applies the updater', async (language, contents, marker) => {
    const config: any = withRNAdgeist(baseConfig(), { adgeistAppId: 'app-1' });

    const result = await runMod(config, 'ios', 'appDelegate', {
      path: '/tmp/app/ios/AppDelegate',
      language,
      contents,
    });

    expect(result.modResults.contents).toContain(marker);
  });

  it('rejects an unsupported AppDelegate language', async () => {
    const config: any = withRNAdgeist(baseConfig(), { adgeistAppId: 'app-1' });

    await expect(
      runMod(config, 'ios', 'appDelegate', {
        path: '/tmp/app/ios/AppDelegate',
        language: 'kotlin',
        contents: '',
      })
    ).rejects.toThrow('Cannot add React Native Adgeist code');
  });
});
