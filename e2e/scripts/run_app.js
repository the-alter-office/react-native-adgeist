#!/usr/bin/env node

// Runs one E2E app on the connected Android device or emulator.
// All apps share one applicationId, so only one can be installed at a time: every run uninstalls
// the previous one first.
//
//   npm run run:metro -- --app 0.77         debug build with Metro (live reload)
//   npm run run:release -- --app 0.77       release build, installed and launched
//   npm run maestro:release -- --app 0.77   release build, then the Maestro suite
//   npm run uninstall                       removes the installed E2E app

const fs = require('fs');
const path = require('path');
const net = require('net');
const { execFileSync, spawn } = require('child_process');
const { loadEnv, requireEnv } = require('./env');
const { runCheck, runCaptured } = require('./report');

const root = path.join(__dirname, '..');
const matrixPath = path.join(root, 'matrix.json');
const SDK_PACKAGE = '@thealteroffice/react-native-adgeist';
const RELEASE_APK = 'android/app/build/outputs/apk/release/app-release.apk';
const METRO_PORT = 8081;

const USAGE = `Usage:
  node scripts/run_app.js <metro | release | maestro> --app <x.y>
  node scripts/run_app.js uninstall

With more than one device connected, set ANDROID_SERIAL=<serial>.`;

function fail(message) {
  console.error(`❌ ${message}`);
  process.exit(1);
}

function run(command, args, cwd = root) {
  execFileSync(command, args, { cwd, stdio: 'inherit' });
}

function parseArgs(argv) {
  const [mode, ...rest] = argv;
  if (!['metro', 'release', 'maestro', 'uninstall'].includes(mode)) {
    fail(`Unknown mode: ${mode}\n\n${USAGE}`);
  }
  let line = null;
  for (let i = 0; i < rest.length; i++) {
    if (rest[i] === '--app' && rest[i + 1] && !line) {
      line = rest[++i].replace(/^rn-/, '');
    } else {
      fail(`Unknown argument: ${rest[i]}\n\n${USAGE}`);
    }
  }
  if (mode !== 'uninstall' && !line) {
    fail(`--app <x.y> is required\n\n${USAGE}`);
  }
  return { mode, line };
}

// The app folder, checked to be in matrix.json, created and integrated.
function appDir(line) {
  if (!fs.existsSync(matrixPath)) {
    fail('matrix.json not found. Run npm run update-matrix first.');
  }
  const entry = JSON.parse(fs.readFileSync(matrixPath, 'utf8')).lines.find((l) => l.line === line);
  if (!entry) {
    fail(`${line} is not in matrix.json`);
  }
  const dir = path.join(root, entry.appDir);
  if (!fs.existsSync(path.join(dir, 'package.json'))) {
    fail(`${entry.appDir} does not exist. Run npm run create-apps -- --app ${line} first.`);
  }
  const wanted = JSON.parse(fs.readFileSync(path.join(dir, 'package.json'), 'utf8')).dependencies?.[SDK_PACKAGE];
  if (!wanted) {
    fail(`${entry.appDir} has no SDK. Run npm run integrate-sdk -- <version> --app ${line} first.`);
  }
  const installedPath = path.join(dir, 'node_modules', SDK_PACKAGE, 'package.json');
  const installed = fs.existsSync(installedPath) ? JSON.parse(fs.readFileSync(installedPath, 'utf8')).version : null;
  if (installed !== wanted) {
    console.log(`📥 Installing ${entry.appDir} dependencies (${SDK_PACKAGE}@${wanted})`);
    run('npm', ['install', '--no-audit', '--no-fund'], dir);
  }
  return dir;
}

// Uses ANDROID_SERIAL if set, otherwise the only connected device. adb reads ANDROID_SERIAL too.
function selectDevice() {
  const devices = execFileSync('adb', ['devices'], { encoding: 'utf8' })
    .split('\n')
    .slice(1)
    .map((row) => row.trim().split(/\s+/))
    .filter(([, state]) => state === 'device')
    .map(([serial]) => serial);

  const serial = process.env.ANDROID_SERIAL || (devices.length === 1 ? devices[0] : null);
  if (!serial || !devices.includes(serial)) {
    fail(
      devices.length === 0
        ? 'No device or emulator connected.'
        : `Set ANDROID_SERIAL to one of: ${devices.join(', ')}`
    );
  }
  process.env.ANDROID_SERIAL = serial;
  return serial;
}

function uninstall(packageName) {
  try {
    execFileSync('adb', ['uninstall', packageName], { stdio: 'pipe' });
    console.log(`🗑️  Uninstalled ${packageName}`);
  } catch {
    console.log(`🗑️  ${packageName} was not installed`);
  }
}

function portIsFree(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once('error', () => resolve(false));
    server.once('listening', () => server.close(() => resolve(true)));
    server.listen(port);
  });
}

// Resolves once Metro answers on its status endpoint; rejects if Metro exits or takes over 60 s.
function waitForMetro(metro) {
  return new Promise((resolve, reject) => {
    const deadline = Date.now() + 60000;
    metro.once('exit', (code) => reject(new Error(`Metro exited with code ${code} before it was ready`)));
    const poll = async () => {
      try {
        const response = await fetch(`http://localhost:${METRO_PORT}/status`);
        if ((await response.text()).includes('packager-status:running')) {
          return resolve();
        }
      } catch {}
      if (Date.now() > deadline) {
        return reject(new Error('Metro did not start within 60 seconds'));
      }
      setTimeout(poll, 1000);
    };
    poll();
  });
}

// Debug build served by Metro. Metro keeps running until Ctrl+C.
async function runMetro(dir, packageName) {
  const metro = spawn('npm', ['start', '--', '--reset-cache'], { cwd: dir, stdio: 'inherit' });
  try {
    await waitForMetro(metro);
    run('npx', ['react-native', 'run-android', '--no-packager', '--active-arch-only', '--appId', packageName], dir);
  } catch (error) {
    metro.kill();
    throw error;
  }
  metro.on('exit', (code) => process.exit(code ?? 0));
}

function isRunning(packageName) {
  try {
    return execFileSync('adb', ['shell', 'pidof', packageName], { encoding: 'utf8', stdio: 'pipe' }).trim() !== '';
  } catch {
    return false;
  }
}

// Launches the app and fails if it is not running 5 s later; the crash buffer goes to crash.log.
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
  const crashFile = path.join(root, 'results', `rn-${line}`, 'crash.log');
  fs.mkdirSync(path.dirname(crashFile), { recursive: true });
  fs.writeFileSync(crashFile, crash, 'utf8');
  console.error(crash.split('\n').filter((text) => text.includes('AndroidRuntime')).slice(0, 40).join('\n'));
  const exception = crash.match(/AndroidRuntime: ((?:[\w$]+\.)+[\w$]*(?:Exception|Error)\b.*)/)?.[1];
  throw new Error(`crashed on launch: ${exception ?? 'the app is not running 5 s after launch'}`);
}

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

function runMaestro(line, serial) {
  return runCheck(line, 'maestro', () => {
    try {
      run('node', [
        path.join(root, 'maestro/scripts/run.js'),
        '--results-dir',
        `results/rn-${line}/maestro`,
        '--device',
        serial,
      ]);
    } catch {
      throw new Error(`flows failed, see rn-${line}/maestro/report.html`);
    }
  });
}

async function main() {
  const { mode, line } = parseArgs(process.argv.slice(2));

  if (mode === 'uninstall') {
    loadEnv();
    if (!process.env.ADGEIST_E2E_PACKAGE_NAME) {
      fail('ADGEIST_E2E_PACKAGE_NAME is missing. Add it to .env.');
    }
    selectDevice();
    uninstall(process.env.ADGEIST_E2E_PACKAGE_NAME);
    return;
  }

  try {
    requireEnv();
  } catch (error) {
    fail(error.message);
  }
  const packageName = process.env.ADGEIST_E2E_PACKAGE_NAME;
  const dir = appDir(line);
  const serial = selectDevice();
  console.log(`📱 ${serial}  📦 ${path.relative(root, dir)}`);

  if (mode === 'metro' && !(await portIsFree(METRO_PORT))) {
    fail(
      `Port ${METRO_PORT} is already in use, probably by another Metro. Stop it (Ctrl+C in its terminal, or: lsof -ti :${METRO_PORT} | xargs kill) and try again.`
    );
  }

  try {
    uninstall(packageName);
    if (mode === 'metro') {
      await runMetro(dir, packageName);
      return;
    }
    await runRelease(line, dir, packageName);
    if (mode === 'maestro') {
      await runMaestro(line, serial);
    }
  } catch (error) {
    fail(error.message);
  }
}

main();
