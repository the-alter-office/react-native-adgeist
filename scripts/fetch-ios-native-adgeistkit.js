#!/usr/bin/env node

const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');
const { Buffer } = require('buffer');
const { execFileSync } = require('child_process');

const root = path.join(__dirname, '..');
const adgeistKit = require(path.join(root, 'package.json')).adgeistKit?.ios;
const frameworksDir = path.join(root, 'ios/Frameworks');
const target = path.join(frameworksDir, 'AdgeistKit.xcframework');
const stampPath = path.join(frameworksDir, '.adgeistkit-checksum');

function findXCFramework(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory() || entry.name === '__MACOSX') continue;
    const full = path.join(dir, entry.name);
    if (entry.name.endsWith('.xcframework')) return full;
    const nested = findXCFramework(full);
    if (nested) return nested;
  }
  return null;
}

async function main() {
  if (!adgeistKit || !adgeistKit.url || !adgeistKit.checksum) {
    throw new Error(
      'Missing "adgeistKit.ios.url" / "adgeistKit.ios.checksum" in package.json'
    );
  }

  if (
    fs.existsSync(target) &&
    fs.existsSync(stampPath) &&
    fs.readFileSync(stampPath, 'utf8').trim() === adgeistKit.checksum
  ) {
    console.log(`✅ AdgeistKit ${adgeistKit.version} already present`);
    return;
  }

  console.log(`⬇️  Downloading AdgeistKit ${adgeistKit.version}`);
  const res = await fetch(adgeistKit.url);
  if (!res.ok)
    throw new Error(`Download failed: ${res.status} ${res.statusText}`);
  const zip = Buffer.from(await res.arrayBuffer());

  const checksum = crypto.createHash('sha256').update(zip).digest('hex');
  if (checksum !== adgeistKit.checksum) {
    throw new Error(
      `Checksum mismatch: expected ${adgeistKit.checksum}, got ${checksum}`
    );
  }

  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'adgeistkit-'));
  try {
    const zipPath = path.join(tmp, 'AdgeistKit.zip');
    fs.writeFileSync(zipPath, zip);
    execFileSync('unzip', ['-q', zipPath, '-d', tmp]);

    const extracted = findXCFramework(tmp);
    if (!extracted)
      throw new Error('No .xcframework found in the downloaded zip');

    fs.rmSync(target, { recursive: true, force: true });
    fs.mkdirSync(frameworksDir, { recursive: true });
    fs.cpSync(extracted, target, { recursive: true });
    fs.writeFileSync(stampPath, adgeistKit.checksum + '\n');
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }

  console.log(
    `✅ AdgeistKit ${adgeistKit.version} installed to ios/Frameworks`
  );
}

main().catch((e) => {
  console.error(`❌ ${e.message}`);
  process.exit(1);
});
