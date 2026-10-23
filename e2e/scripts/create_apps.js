#!/usr/bin/env node

// Creates one React Native app per line in matrix.json (apps/rn-<line>) at that line's version,
// and patches its Android build so the package name and AdGeist app ID come from .env.
// Run with: npm run create-apps -- [--app 0.77 ...] [--replace]

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const root = path.join(__dirname, '..');
const matrixPath = path.join(root, 'matrix.json');
const APP_NAME = 'AdgeistE2E';
const NAMESPACE = 'ai.adgeist.e2e';
const APP_ID_META_DATA = 'com.adgeistkit.ads.ADGEIST_APP_ID';

const USAGE = `Usage:
  node scripts/create_apps.js [--app <x.y> ...] [--replace]

Creates apps/rn-<line> for each line in matrix.json, using that line's React Native version.
Without --app, every line. An existing app is skipped if it is complete and on that version;
otherwise it is recreated. --replace recreates every selected app.`;

// Added to android/app/build.gradle: reads a value from the environment, or else from .env.
const GRADLE_ENV = `def e2eDotEnv = { ->
    def values = [:]
    def file = rootProject.file("../../../.env")
    if (file.exists()) {
        file.eachLine { line ->
            def trimmed = line.trim()
            if (!trimmed || trimmed.startsWith("#")) {
                return
            }
            def match = (trimmed =~ /^(?:export\\s+)?([A-Za-z_][A-Za-z0-9_]*)\\s*=\\s*(.*)$/)
            if (match.matches()) {
                values[match.group(1)] = match.group(2).replaceAll(/^(['"])(.*)\\1$/, '$2')
            }
        }
    }
    return values
}()

def e2eValue = { String variable ->
    def value = System.getenv(variable) ?: e2eDotEnv[variable]
    if (!value) {
        throw new GradleException("\${variable} is not set. Add it to .env, or export it.")
    }
    return value
}
`;

// Appended to android/app/build.gradle: re-bundles the JS when .env changes.
const GRADLE_BUNDLE_INPUTS = `tasks.matching { it.name.startsWith("createBundle") && it.name.endsWith("JsAndAssets") }.configureEach { task ->
    task.inputs.file(rootProject.file("../../../.env")).optional(true)
}
`;

function fail(message) {
  console.error(`❌ ${message}`);
  process.exit(1);
}

function parseArgs(argv) {
  const args = { apps: [], replace: false };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--app' && argv[i + 1]) {
      args.apps.push(argv[++i].replace(/^rn-/, ''));
    } else if (argv[i] === '--replace') {
      args.replace = true;
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

function patchBuildGradle(appDir) {
  const file = path.join(appDir, 'android/app/build.gradle');
  const patched = fs
    .readFileSync(file, 'utf8')
    .replace(/^android\s*\{/m, (block) => `${GRADLE_ENV}\n${block}`)
    .replace(
      /^([ \t]*)applicationId\b.*$/m,
      (_, indent) =>
        `${indent}applicationId e2eValue("ADGEIST_E2E_PACKAGE_NAME")\n` +
        `${indent}manifestPlaceholders = [adgeistAppId: e2eValue("ADGEIST_E2E_APP_ID")]`
    )
    .replace(/^react\s*\{/m, (block) => `${block}\n    extraPackagerArgs = ["--reset-cache"]`);

  const expected = ['def e2eValue', 'applicationId e2eValue', 'extraPackagerArgs = ["--reset-cache"]'];
  if (!expected.every((text) => patched.includes(text))) {
    throw new Error(`${file} does not have the layout this script expects`);
  }
  fs.writeFileSync(file, `${patched.trimEnd()}\n\n${GRADLE_BUNDLE_INPUTS}`, 'utf8');
}

// Adds the manifest entry the native SDK reads its app ID from.
function patchManifest(appDir) {
  const file = path.join(appDir, 'android/app/src/main/AndroidManifest.xml');
  const patched = fs
    .readFileSync(file, 'utf8')
    .replace(
      /<application\b[^>]*>/,
      (tag) => `${tag}\n      <meta-data\n        android:name="${APP_ID_META_DATA}"\n        android:value="\${adgeistAppId}" />`
    );
  if (!patched.includes(APP_ID_META_DATA)) {
    throw new Error(`${file}: <application> tag not found`);
  }
  fs.writeFileSync(file, patched, 'utf8');
}

// True if the app exists, is on the matrix version and has both patches.
function isUpToDate({ version, appDir }) {
  const read = (file) => {
    const fullPath = path.join(root, appDir, file);
    return fs.existsSync(fullPath) ? fs.readFileSync(fullPath, 'utf8') : '';
  };
  try {
    return (
      JSON.parse(read('package.json')).dependencies['react-native'] === version &&
      read('android/app/build.gradle').includes('def e2eValue') &&
      read('android/app/src/main/AndroidManifest.xml').includes(APP_ID_META_DATA)
    );
  } catch {
    return false;
  }
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
      NAMESPACE,
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
  patchBuildGradle(path.join(root, appDir));
  patchManifest(path.join(root, appDir));
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const failures = [];

  for (const entry of selectedLines(args.apps)) {
    const appDir = path.join(root, entry.appDir);
    if (fs.existsSync(appDir)) {
      if (!args.replace && isUpToDate(entry)) {
        console.log(`⏭️  ${entry.appDir} is up to date (React Native ${entry.version}), skipped`);
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
