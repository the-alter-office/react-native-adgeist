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

const HIDDEN_STEPS = ['Define variables', 'Apply configuration'];

function printFailedFlows(resultsDir) {
  const dir = path.join(root, resultsDir);
  const logName = fs.readdirSync(dir, { recursive: true }).find((file) => path.basename(file) === 'maestro.log');
  if (!logName) {
    return;
  }
  const flows = fs
    .readFileSync(path.join(dir, logName), 'utf8')
    .split(/^.*TestSuiteInteractor\.runFlow:\s+Running flow /m)
    .slice(1);

  for (const flow of flows) {
    const [name, ...lines] = flow.split('\n');
    const details = [];
    let failed = false;
    let inError = false;
    for (const line of lines) {
      const step = line.match(/onCommandFinished: (.*) (COMPLETED|FAILED)$/);
      const commandError = line.match(/CommandFailed: (.*)$/);
      if (step && !HIDDEN_STEPS.includes(step[1])) {
        failed ||= step[2] === 'FAILED';
        details.push(`   ${step[2] === 'FAILED' ? '❌' : '✅'} ${step[1]}`);
      } else if (commandError) {
        details.push(`        ${commandError[1]}`);
      } else if (/runFlow: Failed to complete flow/.test(line)) {
        failed = true;
        inError = true;
        details.push('   ❌ Flow stopped with an error');
      } else if (inError && /^(Caused by: )?[\w.$]+(Exception|Error)\b/.test(line)) {
        details.push(`        ${line.trim()}`);
      } else if (/^\d{2}:\d{2}:\d{2}\.\d{3} /.test(line)) {
        inError = false;
      }
    }
    if (failed) {
      console.log(`\n❌ ${name.trim()}\n${details.join('\n')}`);
    }
  }
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
      '--debug-output',
      resultsDir,
      ...maestroArgs,
    ],
    { cwd: root, stdio: 'inherit' }
  );
  if (result.error) {
    fail(`maestro could not start: ${result.error.message}. Install it from https://maestro.mobile.dev`);
  }
  if (result.status !== 0) {
    printFailedFlows(resultsDir);
  }
  console.log(`\n📄 Results: ${resultsDir}`);
  process.exit(result.status ?? 1);
}

main();
