#!/usr/bin/env node

// Runs the Maestro tests against the E2E app already installed on the device.
// Run with: node maestro/scripts/run.js [--results-dir <dir>] [maestro test options]

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { loadEnv } = require('../../scripts/env');

const root = path.join(__dirname, '../..');
const workspace = path.join('maestro', '.maestro');

function fail(message) {
  console.error(`❌ ${message}`);
  process.exit(1);
}

function main() {
  const maestroArgs = process.argv.slice(2);
  let resultsDir = path.join('results', 'maestro');
  const index = maestroArgs.indexOf('--results-dir');
  if (index !== -1) {
    resultsDir = maestroArgs[index + 1];
    if (!resultsDir) {
      fail('--results-dir needs a folder');
    }
    maestroArgs.splice(index, 2);
  }

  loadEnv();
  const appId = process.env.ADGEIST_E2E_PACKAGE_NAME;
  if (!appId) {
    fail('ADGEIST_E2E_PACKAGE_NAME is missing. Add it to .env.');
  }

  fs.rmSync(path.join(root, resultsDir), { recursive: true, force: true });
  fs.mkdirSync(path.join(root, resultsDir, 'screenshots'), { recursive: true });

  const result = spawnSync(
    'maestro',
    [
      'test',
      workspace,
      '-e',
      `APP_ID=${appId}`,
      '--format',
      'junit',
      '--output',
      path.join(resultsDir, 'report.xml'),
      '--test-output-dir',
      resultsDir,
      ...maestroArgs,
    ],
    { cwd: root, stdio: 'inherit' }
  );
  if (result.error) {
    fail(`maestro could not start: ${result.error.message}. Install it from https://maestro.mobile.dev`);
  }
  console.log(`\n📄 Results: ${resultsDir}`);
  process.exit(result.status ?? 1);
}

main();
