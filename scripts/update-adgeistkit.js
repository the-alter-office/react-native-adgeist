#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { Buffer } = require('buffer');

const IOS_RELEASES_URL =
  'https://github.com/the-alter-office/adgeist-publisher-ios-sdk/releases/download';
const ANDROID_RELEASES_URL =
  'https://repo1.maven.org/maven2/ai/adgeist/adgeistkit';

const USAGE = 'Usage: yarn update-adgeistkit <ios|android> <version>';

const packageJsonPath = path.join(__dirname, '../package.json');

async function resolveIos(version) {
  const url = `${IOS_RELEASES_URL}/${version}/AdgeistKit.xcframework.zip`;

  console.log(`⬇️  Downloading AdgeistKit ios ${version}`);
  const res = await fetch(url);
  if (res.status === 404) {
    throw new Error(`AdgeistKit ios release ${version} not found at ${url}`);
  }
  if (!res.ok)
    throw new Error(`Download failed: ${res.status} ${res.statusText}`);
  const zip = Buffer.from(await res.arrayBuffer());

  const checksum = crypto.createHash('sha256').update(zip).digest('hex');

  return { version, url, checksum };
}

async function resolveAndroid(version) {
  const url = `${ANDROID_RELEASES_URL}/${version}/`;

  console.log(`🔎 Checking AdgeistKit android ${version} on Maven Central`);
  const res = await fetch(url);
  if (res.status === 404) {
    throw new Error(
      `AdgeistKit android release ${version} not found at ${url}`
    );
  }
  if (!res.ok)
    throw new Error(
      `Maven Central check failed: ${res.status} ${res.statusText}`
    );

  return { version };
}

const PLATFORMS = {
  ios: resolveIos,
  android: resolveAndroid,
};

async function main() {
  const [platform, version] = process.argv.slice(2);
  if (!Object.hasOwn(PLATFORMS, platform) || !version) {
    throw new Error(USAGE);
  }

  const updatedAdgeistKitEntry = await PLATFORMS[platform](version);

  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  packageJson.adgeistKit = {
    ...packageJson.adgeistKit,
    [platform]: updatedAdgeistKitEntry,
  };

  fs.writeFileSync(
    packageJsonPath,
    JSON.stringify(packageJson, null, 2) + '\n',
    'utf8'
  );

  console.log(
    `✅ Updated adgeistKit.${platform} in package.json to ${version}`
  );
  if (updatedAdgeistKitEntry.checksum) {
    console.log(`   checksum: ${updatedAdgeistKitEntry.checksum}`);
  }
}

main().catch((e) => {
  console.error(`❌ ${e.message}`);
  process.exit(1);
});
