import { readFileSync } from 'fs';
import { join } from 'path';

import NativeAdgeistMock from '../specs/__mocks__/NativeAdgeist';

const root = join(__dirname, '..', '..');
const read = (file: string) => readFileSync(join(root, file), 'utf8');

const packageJson = JSON.parse(read('package.json'));
const specMethods = Object.keys(NativeAdgeistMock);

const ios = {
  module: read('ios/Adgeist.mm'),
  adView: read('ios/NativeHTML5AdManager.mm'),
  preview: read('ios/NativeAdPreviewManager.mm'),
};

const android = {
  impl: read('android/src/main/java/com/adgeist/modules/AdgeistImpl.kt'),
  newArch: read('android/src/newarch/java/com/Adgeist.kt'),
  oldArch: read('android/src/oldarch/java/com/Adgeist.kt'),
  adViewImpl: read(
    'android/src/main/java/com/adgeist/components/HTML5AdViewManagerImpl.kt'
  ),
  previewImpl: read(
    'android/src/main/java/com/adgeist/components/AdPreviewViewManagerImpl.kt'
  ),
  oldArchAdView: read('android/src/oldarch/java/com/HTML5AdViewManager.kt'),
  oldArchPreview: read('android/src/oldarch/java/com/AdPreviewViewManager.kt'),
};

const constant = (source: string, name: string) =>
  source.match(new RegExp(`${name}\\s*=\\s*(\\S+)`))?.[1];

describe('Adgeist TurboModule contract', () => {
  it('is registered as "Adgeist" on both platforms', () => {
    expect(ios.module).toMatch(/RCT_EXPORT_MODULE\(Adgeist\)/);
    expect(constant(android.impl, 'const val NAME')).toBe('"Adgeist"');
  });

  it.each(specMethods)('exports %s on iOS', (method) => {
    expect(ios.module).toMatch(new RegExp(`RCT_EXPORT_METHOD\\(${method}[:)]`));
  });

  it.each(specMethods)(
    'implements %s on the Android new architecture',
    (method) => {
      expect(android.newArch).toMatch(new RegExp(`override fun ${method}\\(`));
    }
  );

  it.each(specMethods)(
    'exposes %s on the Android old architecture',
    (method) => {
      expect(android.oldArch).toMatch(
        new RegExp(`@ReactMethod\\s+fun ${method}\\(`)
      );
    }
  );
});

describe('Native view contract', () => {
  const components = [
    {
      name: 'HTML5AdNativeComponent',
      iosManager: ios.adView,
      androidImpl: android.adViewImpl,
      androidOldArch: android.oldArchAdView,
      commands: { loadAd: 1, destroy: 2 },
    },
    {
      name: 'AdPreviewNativeComponent',
      iosManager: ios.preview,
      androidImpl: android.previewImpl,
      androidOldArch: android.oldArchPreview,
      commands: { loadAd: 1 },
    },
  ];

  it.each(components)('$name is in the codegen component providers', (c) => {
    expect(packageJson.codegenConfig.android.componentProvider).toHaveProperty(
      c.name
    );
    expect(packageJson.codegenConfig.ios.componentProvider).toHaveProperty(
      c.name
    );
  });

  it.each(components)('$name is the native view manager name', (c) => {
    expect(c.iosManager).toMatch(
      new RegExp(`RCT_EXPORT_MODULE\\(${c.name}\\)`)
    );
    expect(constant(c.androidImpl, 'const val NAME')).toBe(`"${c.name}"`);
  });

  it.each(components)('$name handles every command on iOS Paper', (c) => {
    for (const command of Object.keys(c.commands)) {
      expect(c.iosManager).toMatch(
        new RegExp(`RCT_EXPORT_METHOD\\(${command}:`)
      );
    }
  });

  it.each(components)(
    '$name uses the command ids the JS layer sends on Android Paper',
    (c) => {
      const ids: Record<string, string> = {
        loadAd: 'COMMAND_LOAD_AD',
        destroy: 'COMMAND_DESTROY',
      };
      for (const [command, id] of Object.entries(c.commands)) {
        expect(c.androidOldArch).toMatch(
          new RegExp(`"${command}",\\s*${ids[command]}`)
        );
        expect(constant(c.androidOldArch, `const val ${ids[command]}`)).toBe(
          String(id)
        );
      }
    }
  );
});
