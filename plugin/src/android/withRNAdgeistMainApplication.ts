import {
  type ConfigPlugin,
  type ExportedConfigWithProps,
  withAppBuildGradle,
  withMainApplication,
} from '@expo/config-plugins';
import {
  type ApplicationProjectFile,
  type GradleProjectFile,
} from '@expo/config-plugins/build/android/Paths';
import { mergeContents } from '@expo/config-plugins/build/utils/generateCode';

export const withRNAdgeistMainApplication: ConfigPlugin = (config) => {
  return withAppBuildGradle(
    withMainApplication(config, readMainApplicationFileAndUpdateContents),
    readBuildGradleFileAndUpdateContents
  );
};

// 1. MainActivity Modifications
async function readMainApplicationFileAndUpdateContents(
  config: ExportedConfigWithProps<ApplicationProjectFile>
): Promise<ExportedConfigWithProps<ApplicationProjectFile>> {
  const { modResults: mainApplicationFile } = config;

  const worker = getCompatibleFileUpdater(mainApplicationFile.language);
  mainApplicationFile.contents = worker(mainApplicationFile.contents);

  return config;
}

function readBuildGradleFileAndUpdateContents(
  config: ExportedConfigWithProps<GradleProjectFile>
) {
  const { modResults } = config;

  if (!modResults.contents.includes('implementation "ai.adgeist:adgeistkit:')) {
    modResults.contents = modResults.contents.replace(
      /dependencies\s*{/,
      `dependencies {
        implementation "ai.adgeist:adgeistkit:0.0.1" // AdgeistKit Dependency`
    );
  }

  return config;
}

function getCompatibleFileUpdater(
  language: ApplicationProjectFile['language']
): (originalContents: string) => string {
  switch (language) {
    case 'kt':
      return ktFileUpdater;
    default:
      throw new Error(
        `Cannot add React Native Orientation Director code to MainActivity of language "${language}"`
      );
  }
}

export function ktFileUpdater(originalContents: string): string {
  // Safer anchor detection
  const anchors = [
    /super\.onCreate\(/,
    /@Override\s+fun onCreate\(/,
    /class \w+ : ReactActivity/,
  ].find((anchor) => anchor.test(originalContents));

  if (!anchors) {
    throw new Error('Could not find suitable insertion point in MainActivity');
  }

  const packageImportCodeBlock = 'import com.adgeist.AdgeistPackage';
  const rightBeforeClassDeclaration = /import com.facebook.react.ReactPackage/;

  const importMergeResults = mergeContents({
    tag: '@react-native-adgeist/package-import',
    src: originalContents,
    newSrc: packageImportCodeBlock,
    anchor: rightBeforeClassDeclaration,
    offset: 0,
    comment: '// React Native Adgeist',
  });

  const onConfigurationChangedCodeBlock = `packages.add(AdgeistPackage())`;
  const rightBeforeOnReturnStatement = /return packages/;

  const implementationMergeResults = mergeContents({
    tag: '@react-native-adgeist/package-initialization',
    src: importMergeResults.contents,
    newSrc: onConfigurationChangedCodeBlock,
    anchor: rightBeforeOnReturnStatement,
    offset: 0,
    comment: '// Package Initialization',
  });

  return implementationMergeResults.contents;
}
