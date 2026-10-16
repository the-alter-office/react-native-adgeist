#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { fetchJson, registryUrl, parseVersion, compareLines } = require('./lib/npm-downloads');
const { YARN_CLASSIC, run, assertYarnClassic } = require('./lib/yarn');

const root = path.join(__dirname, '..');
const matrixPath = path.join(root, 'config/matrix.json');
const defaults = require(path.join(root, 'config/e2e.defaults.json'));

const APP_NAME = 'AdgeistE2E';
const NAMESPACE = 'ai.adgeist.e2e';
const TEMPLATE_PACKAGE = '@react-native-community/template';
const MIN_LINE = '0.75';
const APP_ID_META_DATA = 'com.adgeistkit.ads.ADGEIST_APP_ID';

const USAGE = `Usage:
  node scripts/generate-app.js <x.y.z> [<x.y.z> ...] [options]
  node scripts/generate-app.js --all [options]

Creates apps/rn-<x.y> for each React Native version.

Options:
  --all                  Generate every version listed in config/matrix.json
  --replace              Delete and recreate an app folder that already exists
  --skip-install         Create and patch the app, but do not run yarn install
  --cli-version <ver>    @react-native-community/cli version used for init (default: latest)`;

function fail(message) {
  console.error(`❌ ${message}`);
  process.exit(1);
}

function parseArgs(argv) {
  const args = { versions: [], all: false, replace: false, skipInstall: false, cliVersion: 'latest' };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--all') {
      args.all = true;
    } else if (arg === '--replace') {
      args.replace = true;
    } else if (arg === '--skip-install') {
      args.skipInstall = true;
    } else if (arg === '--cli-version') {
      const value = argv[++i];
      if (!value || value.startsWith('--')) {
        fail(`--cli-version needs a value\n\n${USAGE}`);
      }
      args.cliVersion = value;
    } else if (arg === '--help' || arg === '-h') {
      console.log(USAGE);
      process.exit(0);
    } else if (arg.startsWith('--')) {
      fail(`Unknown option: ${arg}\n\n${USAGE}`);
    } else {
      args.versions.push(arg);
    }
  }

  if (args.all && args.versions.length > 0) {
    fail('Pass either --all or explicit versions, not both');
  }
  if (!args.all && args.versions.length === 0) {
    fail(`Pass at least one version, or --all\n\n${USAGE}`);
  }

  return args;
}

function readMatrix() {
  if (!fs.existsSync(matrixPath)) {
    return null;
  }
  return JSON.parse(fs.readFileSync(matrixPath, 'utf8'));
}

async function resolveTemplateVersion(target) {
  const doc = await fetchJson(registryUrl(TEMPLATE_PACKAGE), {
    headers: { Accept: 'application/vnd.npm.install-v1+json' },
  });

  const candidates = Object.keys(doc.versions || {})
    .map(parseVersion)
    .filter((t) => t && t.line === target.line);

  if (candidates.some((t) => t.version === target.version)) {
    return target.version;
  }

  const lower = candidates
    .filter((t) => t.patch < target.patch)
    .sort((a, b) => b.patch - a.patch)[0];
  if (lower) {
    console.warn(
      `⚠️  No ${TEMPLATE_PACKAGE}@${target.version}, using ${lower.version}; react-native is pinned to ${target.version} afterwards`
    );
    return lower.version;
  }

  throw new Error(
    `No stable ${TEMPLATE_PACKAGE} version at or below ${target.version} in line ${target.line}`
  );
}

function pinReactNative(appDir, version) {
  const file = path.join(appDir, 'package.json');
  const pkg = JSON.parse(fs.readFileSync(file, 'utf8'));
  const changed = [];

  for (const field of ['dependencies', 'devDependencies']) {
    for (const name of Object.keys(pkg[field] || {})) {
      if ((name === 'react-native' || name.startsWith('@react-native/')) && pkg[field][name] !== version) {
        changed.push(`${name} ${pkg[field][name]} -> ${version}`);
        pkg[field][name] = version;
      }
    }
  }

  if (!pkg.dependencies?.['react-native']) {
    throw new Error(`${file} has no react-native dependency`);
  }

  pkg.packageManager = YARN_CLASSIC;

  fs.writeFileSync(file, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
  if (changed.length > 0) {
    console.log(`📌 Pinned to ${version}:\n   ${changed.join('\n   ')}`);
  }
}

function patchBuildGradle(appDir) {
  const file = path.join(appDir, 'android/app/build.gradle');
  if (!fs.existsSync(file)) {
    if (fs.existsSync(`${file}.kts`)) {
      throw new Error(`${file}.kts uses the Kotlin DSL, which generate-app.js does not patch yet`);
    }
    throw new Error(`${file} not found`);
  }

  let content = fs.readFileSync(file, 'utf8');

  if (!new RegExp(`namespace\\s+["']${NAMESPACE.replace(/\./g, '\\.')}["']`).test(content)) {
    throw new Error(`${file} does not declare namespace "${NAMESPACE}"`);
  }

  if (!content.includes('e2eApplicationId')) {
    const applicationId = /^(\s*)applicationId\s+["'][^"']+["']\s*$/m;
    if (!applicationId.test(content)) {
      throw new Error(`${file}: applicationId line not found`);
    }
    content = content.replace(
      applicationId,
      (_, indent) =>
        `${indent}applicationId(project.findProperty("e2eApplicationId") ?: "${defaults.packageName}")\n` +
        `${indent}manifestPlaceholders = [adgeistAppId: project.findProperty("e2eAdgeistAppId") ?: "${defaults.adgeistAppId}"]`
    );
  }

  fs.writeFileSync(file, content, 'utf8');
}

function patchManifest(appDir) {
  const file = path.join(appDir, 'android/app/src/main/AndroidManifest.xml');
  let content = fs.readFileSync(file, 'utf8');

  if (!content.includes(APP_ID_META_DATA)) {
    const application = /<application\b[^>]*>/;
    if (!application.test(content)) {
      throw new Error(`${file}: <application> tag not found`);
    }
    content = content.replace(
      application,
      (tag) =>
        `${tag}\n      <meta-data\n        android:name="${APP_ID_META_DATA}"\n        android:value="\${adgeistAppId}" />`
    );
  }

  fs.writeFileSync(file, content, 'utf8');
}

function appReactNativeVersion(appDir) {
  const file = path.join(appDir, 'package.json');
  if (!fs.existsSync(file)) {
    return null;
  }
  return JSON.parse(fs.readFileSync(file, 'utf8')).dependencies?.['react-native'] ?? null;
}

function warnUnlistedApps(matrix) {
  const appsDir = path.join(root, 'apps');
  if (!fs.existsSync(appsDir)) {
    return;
  }
  const listed = new Set(matrix.lines.map((l) => path.normalize(l.appDir)));
  for (const entry of fs.readdirSync(appsDir, { withFileTypes: true })) {
    const relativeDir = path.join('apps', entry.name);
    if (entry.isDirectory() && !listed.has(relativeDir)) {
      console.warn(`⚠️  ${relativeDir} is not in config/matrix.json`);
    }
  }
}

function verifyInstalled(appDir, version) {
  const file = path.join(appDir, 'node_modules/react-native/package.json');
  if (!fs.existsSync(file)) {
    throw new Error(`${file} not found after install`);
  }
  const installed = JSON.parse(fs.readFileSync(file, 'utf8')).version;
  if (installed !== version) {
    throw new Error(`Installed react-native is ${installed}, expected ${version}`);
  }
}

async function generateApp(version, args, matrix) {
  const target = parseVersion(version);
  if (!target) {
    throw new Error(`"${version}" is not a plain x.y.z React Native version`);
  }
  if (compareLines(target.line, MIN_LINE) < 0) {
    throw new Error(`React Native ${target.line} is older than ${MIN_LINE}, which this generator supports`);
  }

  const relativeDir = `apps/rn-${target.line}`;
  const appDir = path.join(root, relativeDir);

  const entry = matrix?.lines?.find((l) => l.line === target.line);
  if (entry && entry.version !== version) {
    console.warn(
      `⚠️  config/matrix.json lists ${entry.version} for ${target.line}, generating ${version}`
    );
  }

  if (fs.existsSync(appDir)) {
    if (!args.replace && args.all) {
      const existing = appReactNativeVersion(appDir);
      if (existing === version) {
        console.log(`⏭️  ${relativeDir} exists (${version}), skipped`);
      } else {
        console.warn(
          `⚠️  ${relativeDir} has ${existing ?? 'no react-native version'}, matrix.json lists ${version}; use --replace to update`
        );
      }
      return 'skipped';
    }
    if (!args.replace) {
      throw new Error(`${relativeDir} already exists. Re-run with --replace to recreate it.`);
    }
    console.log(`🗑️  Removing ${relativeDir}`);
    fs.rmSync(appDir, { recursive: true, force: true });
  }
  fs.mkdirSync(path.dirname(appDir), { recursive: true });

  const templateVersion = await resolveTemplateVersion(target);
  console.log(`\n🧱 React Native ${version}: ${TEMPLATE_PACKAGE}@${templateVersion} -> ${relativeDir}`);

  run(
    'npx',
    [
      '--yes',
      `@react-native-community/cli@${args.cliVersion}`,
      'init',
      APP_NAME,
      '--template',
      `${TEMPLATE_PACKAGE}@${templateVersion}`,
      '--directory',
      appDir,
      '--package-name',
      NAMESPACE,
      '--title',
      `${APP_NAME} ${target.line}`,
      '--pm',
      'npm',
      '--skip-install',
      '--install-pods',
      'false',
      '--skip-git-init',
    ],
    root
  );

  pinReactNative(appDir, version);
  patchBuildGradle(appDir);
  patchManifest(appDir);

  if (!args.skipInstall) {
    assertYarnClassic(appDir);
    run('yarn', ['install', '--non-interactive'], appDir);
    verifyInstalled(appDir, version);
  }

  console.log(`✅ ${relativeDir} created with React Native ${version}`);
  return 'generated';
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const matrix = readMatrix();

  let versions = args.versions;
  if (args.all) {
    if (!matrix) {
      fail('config/matrix.json not found. Run yarn resolve-versions first.');
    }
    versions = matrix.lines.map((l) => l.version);
  }

  const generated = [];
  const skipped = [];
  const failures = [];
  for (const version of versions) {
    try {
      const status = await generateApp(version, args, matrix);
      (status === 'skipped' ? skipped : generated).push(version);
    } catch (error) {
      console.error(`❌ ${version}: ${error.message}`);
      failures.push(version);
    }
  }

  if (args.all) {
    warnUnlistedApps(matrix);
  }

  console.log(
    `\nGenerated: ${generated.length}, skipped: ${skipped.length}, failed: ${failures.length} (of ${versions.length})`
  );

  if (failures.length > 0) {
    fail(`${failures.length} of ${versions.length} app(s) failed: ${failures.join(', ')}`);
  }
  console.log('🎉 Done');
}

main().catch((error) => fail(error.message));
