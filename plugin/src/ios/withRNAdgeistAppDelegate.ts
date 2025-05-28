import {
  type ConfigPlugin,
  type ExportedConfigWithProps,
  withAppDelegate,
} from '@expo/config-plugins';
import { type AppDelegateProjectFile } from '@expo/config-plugins/build/ios/Paths';
import { mergeContents } from '@expo/config-plugins/build/utils/generateCode';

export const withRNAdgeistAppDelegate: ConfigPlugin = (config) => {
  return withAppDelegate(config, readAppDelegateFileAndUpdateContents);
};

async function readAppDelegateFileAndUpdateContents(
  config: ExportedConfigWithProps<AppDelegateProjectFile>
): Promise<ExportedConfigWithProps<AppDelegateProjectFile>> {
  const { modResults: appDelegateFile } = config;

  const worker = getCompatibleFileUpdater(appDelegateFile.language);
  appDelegateFile.contents = worker(appDelegateFile.contents);

  return config;
}

function getCompatibleFileUpdater(
  language: AppDelegateProjectFile['language']
): (originalContents: string) => string {
  switch (language) {
    case 'objc':
    case 'objcpp': {
      return objCFileUpdater;
    }
    case 'swift':
      return swiftFileUpdater;
    default:
      throw new Error(
        `Cannot add React Native Adgeist code to AppDelegate of language "${language}"`
      );
  }
}

export function swiftFileUpdater(originalContents: string): string {
  const wantsToAddAnyCodeBlock = ``;

  const rightBeforeLastClosingBrace =
    /didFinishLaunchingWithOptions:\s*launchOptions\)/g;
  const pasteInTheListJustAfterTheClosingBracket = 2;

  const results = mergeContents({
    tag: '@react-native-adgeist/implementation',
    src: originalContents,
    newSrc: wantsToAddAnyCodeBlock,
    anchor: rightBeforeLastClosingBrace,
    offset: pasteInTheListJustAfterTheClosingBracket,
    comment: '// React Native Ageist',
  });

  return results.contents;
}

export function objCFileUpdater(originalContents: string): string {
  const libraryHeaderImportCodeBlock = '#import "Adgeist.h"\n';
  const rightBeforeAppDelegateImplementation = /@implementation\s+\w+/g;

  const headerImportMergeResults = mergeContents({
    tag: '@react-native-adgeist/library-header-import',
    src: originalContents,
    newSrc: libraryHeaderImportCodeBlock,
    anchor: rightBeforeAppDelegateImplementation,
    offset: 0,
    comment: '// React Native Ageist',
  });

  const wantsToAddAnyCodeBlock = ``;
  const rightBeforeLastClosingEnd = /@end[^@]*$/g;

  const implementationMergeResults = mergeContents({
    tag: '@react-native-adgeist/implementation',
    src: headerImportMergeResults.contents,
    newSrc: wantsToAddAnyCodeBlock,
    anchor: rightBeforeLastClosingEnd,
    offset: 0,
    comment: '// React Native Ageist',
  });

  return implementationMergeResults.contents;
}
