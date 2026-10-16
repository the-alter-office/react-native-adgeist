#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { fetchJson, registryUrl } = require('./lib/npm-downloads');
const { run, assertYarnClassic } = require('./lib/yarn');

const root = path.join(__dirname, '..');
const matrixPath = path.join(root, 'config/matrix.json');

const SDK_PACKAGE = '@thealteroffice/react-native-adgeist';

const USAGE = `Usage:
  node scripts/install-sdk.js <version | dist-tag> [options]

Installs ${SDK_PACKAGE} at an exact version in the E2E apps.
A dist-tag (qa, latest, beta) is resolved to its exact version first.

Options:
  --app <rn-x.y | x.y>   Install only in this app (repeatable). Default: every app in config/matrix.json
  --check                Only check that the version is published, print it, and exit`;

function fail(message) {
  console.error(`❌ ${message}`);
  process.exit(1);
}

function parseArgs(argv) {
  const args = { spec: null, apps: [], check: false };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--check') {
      args.check = true;
    } else if (arg === '--app') {
      const value = argv[++i];
      if (!value || value.startsWith('--')) {
        fail(`--app needs a value\n\n${USAGE}`);
      }
      args.apps.push(value.startsWith('rn-') ? value : `rn-${value}`);
    } else if (arg === '--help' || arg === '-h') {
      console.log(USAGE);
      process.exit(0);
    } else if (arg.startsWith('--')) {
      fail(`Unknown option: ${arg}\n\n${USAGE}`);
    } else if (args.spec) {
      fail(`Only one version or dist-tag can be given\n\n${USAGE}`);
    } else {
      args.spec = arg;
    }
  }

  if (!args.spec) {
    fail(`A version or dist-tag is required\n\n${USAGE}`);
  }
  return args;
}

async function resolveSdkVersion(spec) {
  const doc = await fetchJson(registryUrl(SDK_PACKAGE), {
    headers: { Accept: 'application/vnd.npm.install-v1+json' },
  });
  const tags = doc['dist-tags'] || {};
  const versions = doc.versions || {};

  if (tags[spec]) {
    return { version: tags[spec], via: `dist-tag "${spec}"` };
  }
  if (versions[spec]) {
    return { version: spec, via: 'exact version' };
  }

  const known = Object.entries(tags)
    .map(([tag, version]) => `${tag}=${version}`)
    .join(', ');
  throw new Error(`${SDK_PACKAGE}@${spec} is not available on npm. Dist-tags: ${known}`);
}

function selectApps(requested) {
  if (requested.length > 0) {
    return requested.map((name) => path.join('apps', name));
  }
  if (!fs.existsSync(matrixPath)) {
    fail('config/matrix.json not found. Run yarn resolve-versions first, or pass --app.');
  }
  return JSON.parse(fs.readFileSync(matrixPath, 'utf8')).lines.map((l) => path.normalize(l.appDir));
}

function installedVersion(appDir) {
  const file = path.join(appDir, 'node_modules', SDK_PACKAGE, 'package.json');
  return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')).version : null;
}

function installInApp(relativeDir, version) {
  const appDir = path.join(root, relativeDir);
  if (!fs.existsSync(path.join(appDir, 'package.json'))) {
    throw new Error(`${relativeDir} does not exist. Run yarn generate-app first.`);
  }

  assertYarnClassic(appDir);
  run('yarn', ['add', `${SDK_PACKAGE}@${version}`, '--exact', '--non-interactive'], appDir);

  const installed = installedVersion(appDir);
  if (installed !== version) {
    throw new Error(`${relativeDir}: installed ${SDK_PACKAGE} is ${installed ?? 'missing'}, expected ${version}`);
  }
  console.log(`✅ ${relativeDir}: ${SDK_PACKAGE}@${version}`);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  let resolved;
  try {
    resolved = await resolveSdkVersion(args.spec);
  } catch (error) {
    fail(error.message);
  }

  console.log(`📦 ${SDK_PACKAGE}@${resolved.version} (${resolved.via})`);

  if (resolved.version.includes('-beta')) {
    console.warn(
      '⚠️  Beta builds use a snapshot of the native Android SDK. The apps need the Sonatype snapshot repository (https://central.sonatype.com/repository/maven-snapshots/) to build.'
    );
  }

  if (args.check) {
    console.log(resolved.version);
    return;
  }

  const apps = selectApps(args.apps);
  const installed = [];
  const failures = [];

  for (const relativeDir of apps) {
    try {
      installInApp(relativeDir, resolved.version);
      installed.push(relativeDir);
    } catch (error) {
      console.error(`❌ ${error.message}`);
      failures.push(relativeDir);
    }
  }

  console.log(`\nInstalled: ${installed.length}, failed: ${failures.length} (of ${apps.length})`);
  if (failures.length > 0) {
    fail(`${failures.length} of ${apps.length} app(s) failed: ${failures.join(', ')}`);
  }
  console.log('🎉 Done');
}

main().catch((error) => fail(error.message));
