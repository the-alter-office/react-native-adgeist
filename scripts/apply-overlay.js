#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { root, selectApps, parseAppArgs } = require('./lib/apps');

const overlayDir = path.join(root, 'overlay');

const USAGE = `Usage:
  node scripts/apply-overlay.js [--app <rn-x.y | x.y> ...]

Copies every file in overlay/ into each app, keeping the folder structure.
Default: every app in config/matrix.json.`;

function listFiles(dir, base = dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      return listFiles(full, base);
    }
    return entry.name === '.DS_Store' ? [] : [path.relative(base, full)];
  });
}

function applyOverlay(appDir) {
  if (!fs.existsSync(path.join(appDir, 'package.json'))) {
    throw new Error(`${path.relative(root, appDir)} does not exist. Run yarn generate-app first.`);
  }
  const files = listFiles(overlayDir);
  for (const file of files) {
    const target = path.join(appDir, file);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.copyFileSync(path.join(overlayDir, file), target);
  }
  return files;
}

function main() {
  let parsed;
  try {
    parsed = parseAppArgs(process.argv.slice(2), USAGE);
  } catch (error) {
    console.error(`❌ ${error.message}`);
    process.exit(1);
  }
  if (parsed.rest.includes('--help') || parsed.rest.includes('-h')) {
    console.log(USAGE);
    return;
  }
  if (parsed.rest.length > 0) {
    console.error(`❌ Unknown argument: ${parsed.rest[0]}\n\n${USAGE}`);
    process.exit(1);
  }

  let apps;
  try {
    apps = selectApps(parsed.apps);
  } catch (error) {
    console.error(`❌ ${error.message}`);
    process.exit(1);
  }

  const failures = [];
  for (const relativeDir of apps) {
    try {
      const files = applyOverlay(path.join(root, relativeDir));
      console.log(`✅ ${relativeDir}: ${files.join(', ')}`);
    } catch (error) {
      console.error(`❌ ${error.message}`);
      failures.push(relativeDir);
    }
  }

  console.log(`\nApplied: ${apps.length - failures.length}, failed: ${failures.length} (of ${apps.length})`);
  if (failures.length > 0) {
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { applyOverlay };
