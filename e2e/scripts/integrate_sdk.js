#!/usr/bin/env node

// Integrates the SDK into the E2E apps the way a publisher would: copies the template screens,
// adds their packages and installs the SDK version under test.
// Run with: npm run integrate-sdk -- <version or dist-tag> [--app 0.77 ...]

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { resetChecks, runCheck, runCaptured } = require('./report');

const root = path.join(__dirname, '..');
const matrixPath = path.join(root, 'matrix.json');
const templateDir = path.join(root, 'template', 'app');
const dependenciesPath = path.join(root, 'template', 'dependencies.json');
const SDK_PACKAGE = '@thealteroffice/react-native-adgeist';
const LINE_PACKAGES = ['react-native-screens', 'react-native-safe-area-context'];

const USAGE = `Usage:
  node scripts/integrate_sdk.js <version | dist-tag> [--app <x.y> ...]

Copies template/app into each app, adds the packages from template/dependencies.json and installs
the given SDK version. Without --app, every app in matrix.json.`;

function fail(message) {
  console.error(`❌ ${message}`);
  process.exit(1);
}

function parseArgs(argv) {
  const args = { spec: null, apps: [] };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--app' && argv[i + 1]) {
      args.apps.push(argv[++i]);
    } else if (!argv[i].startsWith('--') && !args.spec) {
      args.spec = argv[i];
    } else {
      fail(`Unknown argument: ${argv[i]}\n\n${USAGE}`);
    }
  }
  if (!args.spec) {
    fail(`An SDK version or dist-tag is required\n\n${USAGE}`);
  }
  return args;
}

function appDirs(requested) {
  if (requested.length > 0) {
    return requested.map((name) => path.join('apps', name.startsWith('rn-') ? name : `rn-${name}`));
  }
  if (!fs.existsSync(matrixPath)) {
    fail('matrix.json not found. Run npm run update-matrix first, or pass --app.');
  }
  return JSON.parse(fs.readFileSync(matrixPath, 'utf8')).lines.map((line) => line.appDir);
}

function npmView(args) {
  return JSON.parse(execFileSync('npm', ['view', ...args, '--json'], { encoding: 'utf8', stdio: 'pipe' }));
}

// "qa" or "0.0.39" -> the exact version published on npm.
function resolveSdkVersion(spec) {
  try {
    const version = npmView([`${SDK_PACKAGE}@${spec}`, 'version']);
    if (typeof version === 'string') {
      return version;
    }
  } catch {}
  const tags = Object.entries(npmView([SDK_PACKAGE, 'dist-tags']))
    .map(([tag, version]) => `${tag}=${version}`)
    .join(', ');
  fail(`${SDK_PACKAGE}@${spec} is not a published version or dist-tag. Dist-tags: ${tags}`);
}

function sortKeys(object) {
  return Object.fromEntries(Object.entries(object).sort(([a], [b]) => a.localeCompare(b)));
}

// Copies the template screens and adds their packages (plus any extra ones) to package.json.
function applyTemplate(appDir, extraDependencies = {}) {
  fs.cpSync(templateDir, appDir, { recursive: true, filter: (src) => path.basename(src) !== '.DS_Store' });

  const packagePath = path.join(appDir, 'package.json');
  const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  const line = pkg.dependencies['react-native'].split('.').slice(0, 2).join('.');
  const template = JSON.parse(fs.readFileSync(dependenciesPath, 'utf8'));

  pkg.dependencies = sortKeys({
    ...pkg.dependencies,
    ...template.default,
    ...template.lines?.[line],
    ...extraDependencies,
  });
  pkg.devDependencies = sortKeys({ ...pkg.devDependencies, ...template.devDependencies });
  fs.writeFileSync(packagePath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
}

// A new line has no entry under "lines" yet, so it got the default (latest) versions. Saves what was
// installed (as ~major.minor.0), so recreating this app later keeps versions that work with its line.
function saveLineVersions(appDir, line) {
  const template = JSON.parse(fs.readFileSync(dependenciesPath, 'utf8'));
  if (template.lines?.[line]) {
    return;
  }
  const versions = Object.fromEntries(
    LINE_PACKAGES.map((name) => {
      const installedPath = path.join(appDir, 'node_modules', name, 'package.json');
      const [major, minor] = JSON.parse(fs.readFileSync(installedPath, 'utf8')).version.split('.');
      return [name, `~${major}.${minor}.0`];
    })
  );
  template.lines = { ...template.lines, [line]: versions };
  fs.writeFileSync(dependenciesPath, JSON.stringify(template, null, 2) + '\n', 'utf8');
  console.log(`📌 Saved ${Object.entries(versions).map(([name, range]) => `${name}@${range}`).join(', ')} for React Native ${line} in template/dependencies.json`);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const version = resolveSdkVersion(args.spec);
  console.log(`📦 ${SDK_PACKAGE}@${version}`);
  if (version.includes('-beta')) {
    console.warn('⚠️  Beta builds need the Sonatype snapshot repository to build the native Android SDK.');
  }

  const failures = [];
  for (const relativeDir of appDirs(args.apps)) {
    const appDir = path.join(root, relativeDir);
    const line = path.basename(relativeDir).replace(/^rn-/, '');
    resetChecks(line);
    try {
      await runCheck(line, 'integrate', () => {
        if (!fs.existsSync(path.join(appDir, 'package.json'))) {
          throw new Error(`${relativeDir} does not exist. Run npm run create-apps first.`);
        }
        applyTemplate(appDir, { [SDK_PACKAGE]: version });
      });
      await runCheck(line, 'sdk-install', async () => {
        await runCaptured('npm', ['install', '--no-audit', '--no-fund'], appDir);
        const installedPath = path.join(appDir, 'node_modules', SDK_PACKAGE, 'package.json');
        const installed = JSON.parse(fs.readFileSync(installedPath, 'utf8')).version;
        if (installed !== version) {
          throw new Error(`installed ${SDK_PACKAGE} is ${installed}, expected ${version}`);
        }
        saveLineVersions(appDir, line);
      });
      console.log(`✅ ${relativeDir}`);
    } catch (error) {
      console.error(`❌ ${relativeDir}: ${error.message}`);
      failures.push(relativeDir);
    }
  }

  if (failures.length > 0) {
    fail(`Failed: ${failures.join(', ')}`);
  }
}

main();
