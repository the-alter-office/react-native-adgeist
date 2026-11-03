const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');
const { resultsDir, runCheck, runCaptured } = require('../report');

const root = path.join(__dirname, '../..');
const APP_ID_VARIABLE = 'ADGEIST_E2E_BUNDLE_ID';
const APP_NAME = 'AdgeistE2E';
const IOS_APP_ID_KEY = '<key>ADGEIST_APP_ID</key>';
const IOS_APP_ID_VALUE = '<string>$(ADGEIST_E2E_APP_ID)</string>';
const IOS_BUNDLE_ID = `PRODUCT_BUNDLE_IDENTIFIER = "$(${APP_ID_VARIABLE})";`;
const IOS_DEPLOYMENT_TARGET = '15.6';
const RELEASE_APP = `ios/build/Build/Products/Release-iphonesimulator/${APP_NAME}.app`;

// Info.plist: adds ADGEIST_APP_ID = $(ADGEIST_E2E_APP_ID), the app ID the native SDK reads.
function patchInfoPlist(appDir) {
  const file = path.join(appDir, 'ios', APP_NAME, 'Info.plist');
  const patched = fs
    .readFileSync(file, 'utf8')
    .replace(/<dict>/, (tag) => `${tag}\n\t${IOS_APP_ID_KEY}\n\t${IOS_APP_ID_VALUE}`);
  if (!patched.includes(IOS_APP_ID_VALUE)) {
    throw new Error(`${file}: <dict> tag not found`);
  }
  fs.writeFileSync(file, patched, 'utf8');
}

// project.pbxproj: PRODUCT_BUNDLE_IDENTIFIER = $(ADGEIST_E2E_BUNDLE_ID), so the bundle ID comes from the build setting.
function patchBundleId(appDir) {
  const file = path.join(appDir, 'ios', `${APP_NAME}.xcodeproj`, 'project.pbxproj');
  const patched = fs.readFileSync(file, 'utf8').replace(/PRODUCT_BUNDLE_IDENTIFIER = .*;/g, IOS_BUNDLE_ID);
  if (!patched.includes(IOS_BUNDLE_ID)) {
    throw new Error(`${file}: PRODUCT_BUNDLE_IDENTIFIER not found`);
  }
  fs.writeFileSync(file, patched, 'utf8');
}

// Podfile and project.pbxproj: minimum iOS 15.6, which AdgeistKit needs.
function patchDeploymentTarget(appDir) {
  const podfile = path.join(appDir, 'ios', 'Podfile');
  const patchedPodfile = fs
    .readFileSync(podfile, 'utf8')
    .replace(/^platform :ios, .*$/m, `platform :ios, '${IOS_DEPLOYMENT_TARGET}'`);
  if (!patchedPodfile.includes(`platform :ios, '${IOS_DEPLOYMENT_TARGET}'`)) {
    throw new Error(`${podfile}: platform :ios line not found`);
  }
  fs.writeFileSync(podfile, patchedPodfile, 'utf8');

  const project = path.join(appDir, 'ios', `${APP_NAME}.xcodeproj`, 'project.pbxproj');
  const patchedProject = fs
    .readFileSync(project, 'utf8')
    .replace(/IPHONEOS_DEPLOYMENT_TARGET = [\d.]+;/g, `IPHONEOS_DEPLOYMENT_TARGET = ${IOS_DEPLOYMENT_TARGET};`);
  if (!patchedProject.includes(`IPHONEOS_DEPLOYMENT_TARGET = ${IOS_DEPLOYMENT_TARGET};`)) {
    throw new Error(`${project}: IPHONEOS_DEPLOYMENT_TARGET not found`);
  }
  fs.writeFileSync(project, patchedProject, 'utf8');
}

// The patches create-apps applies; marker is the text that shows a patch is already in the file.
const FMT_CXX_STANDARD = `
    installer.pods_project.targets.each do |target|
      next unless target.name == 'fmt'
      target.build_configurations.each do |build|
        build.build_settings['CLANG_CXX_LANGUAGE_STANDARD'] = 'c++17'
      end
    end`;

// Podfile post_install: compiles the fmt pod as C++17, because fmt 11.0.2 (React Native 0.79, 0.80)
// fails to build with the consteval checks of Xcode 26's clang.
function patchFmtCxxStandard(appDir) {
  const podfile = path.join(appDir, 'ios', 'Podfile');
  const patched = fs
    .readFileSync(podfile, 'utf8')
    .replace(/^([ \t]*)react_native_post_install\([\s\S]*?^\1\)$/m, (call) => `${call}\n${FMT_CXX_STANDARD}`);
  if (!patched.includes(FMT_CXX_STANDARD)) {
    throw new Error(`${podfile}: react_native_post_install(...) not found`);
  }
  fs.writeFileSync(podfile, patched, 'utf8');
}

const patches = [
  { file: `ios/${APP_NAME}/Info.plist`, marker: IOS_APP_ID_VALUE, apply: patchInfoPlist },
  { file: `ios/${APP_NAME}.xcodeproj/project.pbxproj`, marker: IOS_BUNDLE_ID, apply: patchBundleId },
  { file: 'ios/Podfile', marker: `platform :ios, '${IOS_DEPLOYMENT_TARGET}'`, apply: patchDeploymentTarget },
  { file: 'ios/Podfile', marker: "next unless target.name == 'fmt'", apply: patchFmtCxxStandard },
];

// `xcrun simctl list devices booted -j`: uses IOS_SIMULATOR_UDID if set, otherwise the only booted simulator.
function selectDevice() {
  const { devices } = JSON.parse(
    execFileSync('xcrun', ['simctl', 'list', 'devices', 'booted', '-j'], { encoding: 'utf8' })
  );
  const booted = Object.values(devices)
    .flat()
    .map((device) => device.udid);

  const udid = process.env.IOS_SIMULATOR_UDID || (booted.length === 1 ? booted[0] : null);
  if (!udid || !booted.includes(udid)) {
    throw new Error(
      booted.length === 0
        ? 'No iOS simulator booted. Boot one with: xcrun simctl boot "iPhone 17" && open -a Simulator'
        : `Set IOS_SIMULATOR_UDID to one of: ${booted.join(', ')}`
    );
  }
  process.env.IOS_SIMULATOR_UDID = udid;
  return udid;
}

// `xcrun simctl get_app_container` checks the app is there, then `xcrun simctl uninstall` removes it.
function uninstall(bundleId) {
  const udid = process.env.IOS_SIMULATOR_UDID;
  try {
    execFileSync('xcrun', ['simctl', 'get_app_container', udid, bundleId], { stdio: 'pipe' });
  } catch {
    console.log(`🗑️  ${bundleId} was not installed`);
    return;
  }
  execFileSync('xcrun', ['simctl', 'uninstall', udid, bundleId], { stdio: 'pipe' });
  console.log(`🗑️  Uninstalled ${bundleId}`);
}

// `bundle install` (the app's CocoaPods version), then `bundle exec pod install` in ios/.
async function podInstall(dir) {
  await runCaptured('bundle', ['install'], dir);
  await runCaptured('bundle', ['exec', 'pod', 'install'], path.join(dir, 'ios'));
}

// Pods must be installed before any Xcode build, including the Metro one.
function prepare(dir) {
  return podInstall(dir);
}

// The .env values Xcode fills $(ADGEIST_E2E_APP_ID) and $(ADGEIST_E2E_BUNDLE_ID) with.
function buildSettings(bundleId) {
  return [`ADGEIST_E2E_APP_ID=${process.env.ADGEIST_E2E_APP_ID}`, `${APP_ID_VARIABLE}=${bundleId}`];
}

// `npx react-native run-ios --no-packager --udid <udid> --extra-params <build settings>`: debug build served by Metro.
function metroCommand(bundleId) {
  return [
    'react-native',
    'run-ios',
    '--no-packager',
    '--udid',
    process.env.IOS_SIMULATOR_UDID,
    '--extra-params',
    buildSettings(bundleId).join(' '),
  ];
}

// `xcrun simctl spawn <udid> launchctl list`: true while UIKitApplication:<bundle ID> is listed.
function isRunning(bundleId) {
  try {
    return execFileSync('xcrun', ['simctl', 'spawn', process.env.IOS_SIMULATOR_UDID, 'launchctl', 'list'], {
      encoding: 'utf8',
      stdio: 'pipe',
    }).includes(`UIKitApplication:${bundleId}`);
  } catch {
    return false;
  }
}

// The newest AdgeistE2E*.ips crash report in ~/Library/Logs/DiagnosticReports written since the launch.
function newestCrashReport(since) {
  const dir = path.join(os.homedir(), 'Library/Logs/DiagnosticReports');
  if (!fs.existsSync(dir)) {
    return null;
  }
  return fs
    .readdirSync(dir)
    .filter((name) => name.startsWith(APP_NAME) && name.endsWith('.ips'))
    .map((name) => path.join(dir, name))
    .filter((file) => fs.statSync(file).mtimeMs >= since)
    .sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs)[0];
}

// `xcrun simctl launch` starts the app; if it is not running 5 s later, its crash report goes to crash.log.
async function launch(line, bundleId) {
  const startedAt = Date.now();
  execFileSync('xcrun', ['simctl', 'launch', process.env.IOS_SIMULATOR_UDID, bundleId], { stdio: 'pipe' });
  await new Promise((resolve) => setTimeout(resolve, 5000));
  if (isRunning(bundleId)) {
    console.log(`🚀 ${bundleId} launched`);
    return;
  }
  const report = newestCrashReport(startedAt);
  if (!report) {
    throw new Error('crashed on launch: the app is not running 5 s after launch');
  }
  const crash = fs.readFileSync(report, 'utf8');
  const crashFile = path.join(root, resultsDir(), `rn-${line}`, 'crash.log');
  fs.mkdirSync(path.dirname(crashFile), { recursive: true });
  fs.writeFileSync(crashFile, crash, 'utf8');
  const type = crash.match(/"exception"\s*:\s*\{[^}]*"type"\s*:\s*"([^"]+)"/)?.[1];
  const reason = crash.match(/"(?:indicator|reason)"\s*:\s*"([^"]+)"/)?.[1];
  throw new Error(`crashed on launch: ${[type, reason].filter(Boolean).join(', ') || path.basename(report)}`);
}

// Checks pods, build (`xcodebuild` Release for the simulator, unsigned), install (`xcrun simctl install`) and launch.
async function runRelease(line, dir, bundleId) {
  const udid = process.env.IOS_SIMULATOR_UDID;
  const xcodebuildArgs = [
    '-workspace',
    `ios/${APP_NAME}.xcworkspace`,
    '-scheme',
    APP_NAME,
    '-configuration',
    'Release',
    '-sdk',
    'iphonesimulator',
    '-destination',
    `id=${udid}`,
    '-derivedDataPath',
    'ios/build',
    '-quiet',
    'CODE_SIGNING_ALLOWED=NO',
    'ONLY_ACTIVE_ARCH=YES',
    ...buildSettings(bundleId),
  ];
  await runCheck(line, 'pods', () => podInstall(dir));
  await runCheck(line, 'build', () => runCaptured('xcodebuild', xcodebuildArgs, dir));
  await runCheck(line, 'install', () => runCaptured('xcrun', ['simctl', 'install', udid, path.join(dir, RELEASE_APP)], root));
  await runCheck(line, 'launch', () => launch(line, bundleId));
}

module.exports = {
  APP_ID_VARIABLE,
  patches,
  selectDevice,
  uninstall,
  prepare,
  metroCommand,
  runRelease,
};
