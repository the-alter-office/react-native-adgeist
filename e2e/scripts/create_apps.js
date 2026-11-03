#!/usr/bin/env node

// Creates one React Native app per line in matrix.json (apps/rn-<line>) at that line's version,
// and patches its Android build so the package name and AdGeist app ID come from .env, and its iOS
// project so the bundle ID and AdGeist app ID come from build settings, plus the SDK's minimum iOS version.
// Run with: npm run create-apps -- [--app 0.77 ...] [--replace] [--prune]

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const android = require('./utils/android');
const ios = require('./utils/ios');

const root = path.join(__dirname, '..');
const matrixPath = path.join(root, 'matrix.json');
const APP_NAME = 'AdgeistE2E';

const USAGE = `Usage:
  node scripts/create_apps.js [--app <x.y> ...] [--replace] [--prune]

Creates apps/rn-<line> for each line in matrix.json, using that line's React Native version.
Without --app, every line. An existing app is skipped if it is complete and on that version;
otherwise it is recreated. --replace recreates every selected app. --prune also deletes
apps/rn-* folders whose line is no longer in matrix.json.`;

function fail(message) {
  console.error(`❌ ${message}`);
  process.exit(1);
}

function parseArgs(argv) {
  const args = { apps: [], replace: false, prune: false };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--app' && argv[i + 1]) {
      args.apps.push(argv[++i].replace(/^rn-/, ''));
    } else if (argv[i] === '--replace') {
      args.replace = true;
    } else if (argv[i] === '--prune') {
      args.prune = true;
    } else {
      fail(`Unknown argument: ${argv[i]}\n\n${USAGE}`);
    }
  }
  return args;
}

function selectedLines(requested) {
  if (!fs.existsSync(matrixPath)) {
    fail('matrix.json not found. Run npm run update-matrix first.');
  }
  const lines = JSON.parse(fs.readFileSync(matrixPath, 'utf8')).lines;
  if (requested.length === 0) {
    return lines;
  }
  return requested.map((line) => lines.find((entry) => entry.line === line) ?? fail(`${line} is not in matrix.json`));
}

const PATCHES = [...android.patches, ...ios.patches];

function readAppFile(appDir, file) {
  const fullPath = path.join(root, appDir, file);
  return fs.existsSync(fullPath) ? fs.readFileSync(fullPath, 'utf8') : '';
}

function isOnVersion({ version, appDir }) {
  try {
    return JSON.parse(readAppFile(appDir, 'package.json')).dependencies['react-native'] === version;
  } catch {
    return false;
  }
}

function missingPatches({ appDir }) {
  return PATCHES.filter(({ file, marker }) => !readAppFile(appDir, file).includes(marker));
}

function isUpToDate(entry) {
  return isOnVersion(entry) && missingPatches(entry).length === 0;
}

function createApp({ line, version, appDir }) {
  execFileSync(
    'npx',
    [
      '--yes',
      '@react-native-community/cli@latest',
      'init',
      APP_NAME,
      '--template',
      `@react-native-community/template@${version}`,
      '--version',
      version,
      '--directory',
      path.join(root, appDir),
      '--package-name',
      android.NAMESPACE,
      '--title',
      `${APP_NAME} ${line}`,
      '--pm',
      'npm',
      '--skip-install',
      '--install-pods',
      'false',
      '--skip-git-init',
    ],
    { cwd: root, stdio: 'inherit' }
  );
  for (const patch of PATCHES) {
    patch.apply(path.join(root, appDir));
  }
}

// Deletes app folders whose line was dropped from matrix.json.
function pruneApps() {
  const appsDir = path.join(root, 'apps');
  const kept = new Set(selectedLines([]).map((entry) => path.basename(entry.appDir)));
  for (const name of fs.existsSync(appsDir) ? fs.readdirSync(appsDir) : []) {
    if (name.startsWith('rn-') && !kept.has(name)) {
      fs.rmSync(path.join(appsDir, name), { recursive: true, force: true });
      console.log(`🗑️  apps/${name} is not in matrix.json, removed`);
    }
  }
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const failures = [];
  if (args.prune) {
    pruneApps();
  }

  for (const entry of selectedLines(args.apps)) {
    const appDir = path.join(root, entry.appDir);
    if (fs.existsSync(appDir)) {
      if (!args.replace && isUpToDate(entry)) {
        console.log(`⏭️  ${entry.appDir} is up to date (React Native ${entry.version}), skipped`);
        continue;
      }
      if (!args.replace && isOnVersion(entry)) {
        try {
          for (const patch of missingPatches(entry)) {
            patch.apply(appDir);
            console.log(`🩹 ${entry.appDir}: patched ${patch.file}`);
          }
        } catch (error) {
          console.error(`❌ ${entry.appDir}: ${error.message}`);
          failures.push(entry.appDir);
        }
        continue;
      }
      if (!args.replace) {
        console.log(`♻️  ${entry.appDir} is incomplete or not on React Native ${entry.version}, recreating`);
      }
      fs.rmSync(appDir, { recursive: true, force: true });
    }
    fs.mkdirSync(path.dirname(appDir), { recursive: true });

    try {
      createApp(entry);
      console.log(`✅ ${entry.appDir}: React Native ${entry.version}`);
    } catch (error) {
      console.error(`❌ ${entry.appDir}: ${error.message}`);
      failures.push(entry.appDir);
    }
  }

  if (failures.length > 0) {
    fail(`Failed: ${failures.join(', ')}`);
  }
}

main();
