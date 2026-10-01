#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { Buffer } = require('buffer');

const RELEASES_URL =
  'https://github.com/the-alter-office/adgeist-publisher-ios-sdk/releases/download';

const packageJsonPath = path.join(__dirname, '../package.json');

async function main() {
  const version = process.argv[2];
  if (!version) {
    throw new Error('Usage: yarn update-adgeistkit <version>');
  }

  const url = `${RELEASES_URL}/${version}/AdgeistKit.xcframework.zip`;

  console.log(`⬇️  Downloading AdgeistKit ${version}`);
  const res = await fetch(url);
  if (res.status === 404) {
    throw new Error(`AdgeistKit release ${version} not found at ${url}`);
  }
  if (!res.ok)
    throw new Error(`Download failed: ${res.status} ${res.statusText}`);
  const zip = Buffer.from(await res.arrayBuffer());

  const checksum = crypto.createHash('sha256').update(zip).digest('hex');

  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  packageJson.adgeistKit = { version, url, checksum };

  fs.writeFileSync(
    packageJsonPath,
    JSON.stringify(packageJson, null, 2) + '\n',
    'utf8'
  );

  console.log(`✅ Updated adgeistKit in package.json to ${version}`);
  console.log(`   checksum: ${checksum}`);
}

main().catch((e) => {
  console.error(`❌ ${e.message}`);
  process.exit(1);
});
