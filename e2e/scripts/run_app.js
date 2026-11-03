#!/usr/bin/env node

// Runs one E2E app on the connected Android device or emulator, or on the booted iOS simulator.
// All apps share one app ID, so only one can be installed at a time: every run uninstalls
// the previous one first.
//
//   npm run run:metro -- --app 0.77         debug build with Metro (live reload)
//   npm run run:release -- --app 0.77       release build, installed and launched
//   npm run maestro:release -- --app 0.77   release build, then the Maestro suite
//   npm run uninstall                       removes the installed E2E app
//
// Add --platform android or --platform ios to any of them; without it, the script asks.

const fs = require('fs');
const path = require('path');
const net = require('net');
const readline = require('readline');
const { execFileSync, spawn } = require('child_process');
const { requireEnv, appIdOnDevice } = require('./env');
const { platform, resultsDir, runCheck } = require('./report');
const android = require('./utils/android');
const ios = require('./utils/ios');

const root = path.join(__dirname, '..');
const matrixPath = path.join(root, 'matrix.json');
const SDK_PACKAGE = '@thealteroffice/react-native-adgeist';
const METRO_PORT = 8081;

const USAGE = `Usage:
  node scripts/run_app.js <metro | release | maestro> --app <x.y> [--platform <android | ios>]
  node scripts/run_app.js uninstall [--platform <android | ios>]

Without --platform (or E2E_PLATFORM), asks for the platform in the terminal.
With more than one device connected, set ANDROID_SERIAL=<serial>.
With more than one simulator booted, set IOS_SIMULATOR_UDID=<udid>.`;

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
    } else if (rest[i] === '--platform' && rest[i + 1]) {
      process.env.E2E_PLATFORM = rest[++i];
    } else {
      fail(`Unknown argument: ${rest[i]}\n\n${USAGE}`);
    }
  }
  if (mode !== 'uninstall' && !line) {
    fail(`--app <x.y> is required\n\n${USAGE}`);
  }
  return { mode, line };
}

// The version inside a local SDK build (.tgz) the app was integrated with.
function tarballVersion(file, appDir) {
  if (!fs.existsSync(file)) {
    fail(`${appDir} uses the local SDK build ${file}, which no longer exists. Run integrate-sdk again.`);
  }
  const pkg = execFileSync('tar', ['-xOzf', file, 'package/package.json'], { encoding: 'utf8' });
  return JSON.parse(pkg).version;
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
  const dependency = JSON.parse(fs.readFileSync(path.join(dir, 'package.json'), 'utf8')).dependencies?.[SDK_PACKAGE];
  if (!dependency) {
    fail(`${entry.appDir} has no SDK. Run npm run integrate-sdk -- <version> --app ${line} first.`);
  }
  const wanted = dependency.startsWith('file:') ? tarballVersion(dependency.slice(5), entry.appDir) : dependency;
  const installedPath = path.join(dir, 'node_modules', SDK_PACKAGE, 'package.json');
  const installed = fs.existsSync(installedPath) ? JSON.parse(fs.readFileSync(installedPath, 'utf8')).version : null;
  if (installed !== wanted) {
    console.log(`📥 Installing ${entry.appDir} dependencies (${SDK_PACKAGE}@${wanted})`);
    run('npm', ['install', '--no-audit', '--no-fund'], dir);
  }
  return dir;
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

const TARGETS = { android, ios };

// Debug build served by Metro. Metro keeps running until Ctrl+C.
async function runMetro(target, dir, appId) {
  await target.prepare(dir);
  const metro = spawn('npm', ['start', '--', '--reset-cache'], { cwd: dir, stdio: 'inherit' });
  try {
    await waitForMetro(metro);
    run('npx', target.metroCommand(appId), dir);
  } catch (error) {
    metro.kill();
    throw error;
  }
  metro.on('exit', (code) => process.exit(code ?? 0));
}

function runMaestro(line, device) {
  const maestroDir = path.join(resultsDir(), `rn-${line}`, 'maestro');
  return runCheck(line, 'maestro', () => {
    try {
      run('node', [path.join(root, 'maestro/scripts/run.js'), '--results-dir', maestroDir, '--device', device]);
    } catch {
      throw new Error(`flows failed, see ${path.relative('results', maestroDir)}/report.html`);
    }
  });
}

async function askPlatform() {
  if (!process.stdin.isTTY) {
    fail(`--platform <android | ios> is required\n\n${USAGE}`);
  }
  const prompt = readline.createInterface({ input: process.stdin, output: process.stdout });
  let answer = '';
  while (!TARGETS[answer]) {
    answer = (await new Promise((resolve) => prompt.question('Platform (android/ios): ', resolve))).trim().toLowerCase();
  }
  prompt.close();
  return answer;
}

async function main() {
  const { mode, line } = parseArgs(process.argv.slice(2));
  if (!process.env.E2E_PLATFORM) {
    process.env.E2E_PLATFORM = await askPlatform();
  }
  let target;
  try {
    target = TARGETS[platform()];
  } catch (error) {
    fail(error.message);
  }

  if (mode === 'uninstall') {
    try {
      const appId = appIdOnDevice();
      target.selectDevice();
      target.uninstall(appId);
    } catch (error) {
      fail(error.message);
    }
    return;
  }

  let appId;
  let device;
  try {
    requireEnv();
    appId = appIdOnDevice();
    device = target.selectDevice();
  } catch (error) {
    fail(error.message);
  }
  const dir = appDir(line);
  console.log(`📱 ${device}  📦 ${path.relative(root, dir)}`);

  if (mode === 'metro' && !(await portIsFree(METRO_PORT))) {
    fail(
      `Port ${METRO_PORT} is already in use, probably by another Metro. Stop it (Ctrl+C in its terminal, or: lsof -ti :${METRO_PORT} | xargs kill) and try again.`
    );
  }

  try {
    target.uninstall(appId);
    if (mode === 'metro') {
      await runMetro(target, dir, appId);
      return;
    }
    await target.runRelease(line, dir, appId);
    if (mode === 'maestro') {
      await runMaestro(line, device);
    }
  } catch (error) {
    fail(error.message);
  }
}

main();
