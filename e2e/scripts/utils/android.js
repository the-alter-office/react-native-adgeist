const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { resultsDir, runCheck, runCaptured } = require('../report');

const root = path.join(__dirname, '../..');
const APP_ID_VARIABLE = 'ADGEIST_E2E_PACKAGE_NAME';
const NAMESPACE = 'ai.adgeist.e2e';
const APP_ID_META_DATA = 'com.adgeistkit.ads.ADGEIST_APP_ID';
const RELEASE_APK = 'android/app/build/outputs/apk/release/app-release.apk';

// Added to android/app/build.gradle: e2eValue("X") reads X from the environment, or else from .env.
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

// build.gradle: applicationId and the manifest's app ID come from .env (ADGEIST_E2E_PACKAGE_NAME, ADGEIST_E2E_APP_ID).
function patchBuildGradle(appDir) {
  const file = path.join(appDir, 'android/app/build.gradle');
  const patched = fs
    .readFileSync(file, 'utf8')
    .replace(/^android\s*\{/m, (block) => `${GRADLE_ENV}\n${block}`)
    .replace(
      /^([ \t]*)applicationId\b.*$/m,
      (_, indent) =>
        `${indent}applicationId e2eValue("${APP_ID_VARIABLE}")\n` +
        `${indent}manifestPlaceholders = [adgeistAppId: e2eValue("ADGEIST_E2E_APP_ID")]`
    )
    .replace(/^react\s*\{/m, (block) => `${block}\n    extraPackagerArgs = ["--reset-cache"]`);

  const expected = ['def e2eValue', 'applicationId e2eValue', 'extraPackagerArgs = ["--reset-cache"]'];
  if (!expected.every((text) => patched.includes(text))) {
    throw new Error(`${file} does not have the layout this script expects`);
  }
  fs.writeFileSync(file, `${patched.trimEnd()}\n\n${GRADLE_BUNDLE_INPUTS}`, 'utf8');
}

// AndroidManifest.xml: adds the <meta-data> entry the native SDK reads its app ID from.
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

// The patches create-apps applies; marker is the text that shows a patch is already in the file.
const patches = [
  { file: 'android/app/build.gradle', marker: 'def e2eValue', apply: patchBuildGradle },
  { file: 'android/app/src/main/AndroidManifest.xml', marker: APP_ID_META_DATA, apply: patchManifest },
];

// `adb devices`: uses ANDROID_SERIAL if set, otherwise the only connected device or emulator.
function selectDevice() {
  const devices = execFileSync('adb', ['devices'], { encoding: 'utf8' })
    .split('\n')
    .slice(1)
    .map((row) => row.trim().split(/\s+/))
    .filter(([, state]) => state === 'device')
    .map(([serial]) => serial);

  const serial = process.env.ANDROID_SERIAL || (devices.length === 1 ? devices[0] : null);
  if (!serial || !devices.includes(serial)) {
    throw new Error(
      devices.length === 0 ? 'No device or emulator connected.' : `Set ANDROID_SERIAL to one of: ${devices.join(', ')}`
    );
  }
  process.env.ANDROID_SERIAL = serial;
  return serial;
}

// `adb uninstall <package>`: removes the previous E2E app.
function uninstall(packageName) {
  try {
    execFileSync('adb', ['uninstall', packageName], { stdio: 'pipe' });
    console.log(`🗑️  Uninstalled ${packageName}`);
  } catch {
    console.log(`🗑️  ${packageName} was not installed`);
  }
}

// Nothing to install before an Android build; Gradle fetches its own dependencies.
async function prepare() {}

// `npx react-native run-android --no-packager --active-arch-only --appId <package>`: debug build served by Metro.
function metroCommand(packageName) {
  return ['react-native', 'run-android', '--no-packager', '--active-arch-only', '--appId', packageName];
}

// `adb shell pidof <package>`: true while the app process is alive.
function isRunning(packageName) {
  try {
    return execFileSync('adb', ['shell', 'pidof', packageName], { encoding: 'utf8', stdio: 'pipe' }).trim() !== '';
  } catch {
    return false;
  }
}

// `adb shell monkey -p <package>` starts the app; if it is not running 5 s later, `adb logcat -b crash` goes to crash.log.
async function launch(line, packageName) {
  execFileSync('adb', ['logcat', '-c', '-b', 'crash'], { stdio: 'pipe' });
  execFileSync('adb', ['shell', 'monkey', '-p', packageName, '-c', 'android.intent.category.LAUNCHER', '1'], {
    stdio: 'pipe',
  });
  await new Promise((resolve) => setTimeout(resolve, 5000));
  if (isRunning(packageName)) {
    console.log(`🚀 ${packageName} launched`);
    return;
  }
  const crash = execFileSync('adb', ['logcat', '-d', '-b', 'crash'], { encoding: 'utf8' });
  const crashFile = path.join(root, resultsDir(), `rn-${line}`, 'crash.log');
  fs.mkdirSync(path.dirname(crashFile), { recursive: true });
  fs.writeFileSync(crashFile, crash, 'utf8');
  console.error(crash.split('\n').filter((text) => text.includes('AndroidRuntime')).slice(0, 40).join('\n'));
  const exception = crash.match(/AndroidRuntime: ((?:[\w$]+\.)+[\w$]*(?:Exception|Error)\b.*)/)?.[1];
  throw new Error(`crashed on launch: ${exception ?? 'the app is not running 5 s after launch'}`);
}

// Checks build (`./gradlew assembleRelease`), install (`adb install -r app-release.apk`) and launch.
async function runRelease(line, dir, packageName) {
  const abi = execFileSync('adb', ['shell', 'getprop', 'ro.product.cpu.abi'], { encoding: 'utf8' }).trim();
  const gradleArgs = ['assembleRelease', `-PreactNativeArchitectures=${abi}`, '--console=plain'];
  if (process.env.CI) {
    gradleArgs.push('--no-daemon', '-Pkotlin.compiler.execution.strategy=in-process');
  }
  await runCheck(line, 'build', () => runCaptured('./gradlew', gradleArgs, path.join(dir, 'android')));
  await runCheck(line, 'install', () => runCaptured('adb', ['install', '-r', path.join(dir, RELEASE_APK)], root));
  await runCheck(line, 'launch', () => launch(line, packageName));
}

module.exports = {
  APP_ID_VARIABLE,
  NAMESPACE,
  patches,
  selectDevice,
  uninstall,
  prepare,
  metroCommand,
  runRelease,
};
