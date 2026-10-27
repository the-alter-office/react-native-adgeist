#!/usr/bin/env node

// Records each app's check results in results/rn-<line>/checks.json, and turns them into one
// summary table: results/summary.md, plus the GitHub job summary in CI.
// Run with: node scripts/report.js <line> [<line> ...]

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const root = path.join(__dirname, '..');
const resultsDir = path.join(root, 'results');
const CHECKS = [
  ['integrate', 'Integrate'],
  ['sdk-install', 'SDK install'],
  ['build', 'Build'],
  ['install', 'Install'],
  ['launch', 'Launch'],
  ['maestro', 'Maestro'],
];

function checksPath(line) {
  return path.join(resultsDir, `rn-${line}`, 'checks.json');
}

function readChecks(line) {
  const file = checksPath(line);
  return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : {};
}

function recordCheck(line, check, status, detail) {
  const checks = readChecks(line);
  checks[check] = detail ? { status, detail: String(detail).split('\n')[0].slice(0, 300) } : { status };
  fs.mkdirSync(path.dirname(checksPath(line)), { recursive: true });
  fs.writeFileSync(checksPath(line), JSON.stringify(checks, null, 2) + '\n', 'utf8');
}

function resetChecks(line) {
  fs.rmSync(checksPath(line), { force: true });
}

// Runs action and records the check as passed, or as failed with the error message (and rethrows).
async function runCheck(line, check, action) {
  try {
    await action();
    recordCheck(line, check, 'passed');
  } catch (error) {
    recordCheck(line, check, 'failed', error.message);
    throw error;
  }
}

function errorLine(output) {
  const lines = output.split('\n').map((text) => text.trim());
  const gradle = lines.findIndex((text) => text === '* What went wrong:');
  if (gradle !== -1 && lines[gradle + 1]) {
    return lines[gradle + 1];
  }
  return (
    lines.find((text) => /^npm (ERR!|error) (?!code\b)/.test(text)) ??
    lines.find((text) => /Failure \[.*\]/.test(text)) ??
    lines.findLast((text) => /\berror\b/i.test(text))
  );
}

// Like execFileSync with stdio inherit, but keeps the output so a failure carries the real error.
function runCaptured(command, args, cwd) {
  return new Promise((resolve, reject) => {
    let output = '';
    const child = spawn(command, args, { cwd, stdio: ['ignore', 'pipe', 'pipe'] });
    child.stdout.on('data', (chunk) => {
      process.stdout.write(chunk);
      output += chunk;
    });
    child.stderr.on('data', (chunk) => {
      process.stderr.write(chunk);
      output += chunk;
    });
    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) {
        return resolve();
      }
      reject(new Error(errorLine(output) || `${command} ${args.join(' ')} exited with code ${code}`));
    });
  });
}

function summary(lines) {
  const failures = [];
  const rows = lines.map((line) => {
    const checks = readChecks(line);
    let blocked = false;
    const cells = CHECKS.map(([check, title]) => {
      if (blocked) {
        return '⏭️';
      }
      const result = checks[check];
      if (result?.status === 'passed') {
        return '✅';
      }
      blocked = true;
      if (result?.status === 'failed') {
        failures.push(`- **${line}** · ${title}: ${result.detail ?? 'failed'}`);
        return '❌';
      }
      failures.push(`- **${line}** · ${title}: did not report a result, see the log`);
      return '⚪';
    });
    return `| ${line} | ${cells.join(' | ')} |`;
  });

  const version = process.env.SDK_VERSION ? ` · SDK ${process.env.SDK_VERSION}` : '';
  const markdown = [
    `## E2E Android${version}`,
    '',
    `| React Native | ${CHECKS.map(([, title]) => title).join(' | ')} |`,
    `|---|${CHECKS.map(() => '---').join('|')}|`,
    ...rows,
    '',
    '✅ passed · ❌ failed · ⏭️ skipped after an earlier failure · ⚪ no result',
    '',
    ...(failures.length > 0 ? ['### Failures', '', ...failures, ''] : ['All checks passed.', '']),
  ].join('\n');
  return { markdown, failed: failures.length > 0 };
}

function main() {
  const lines = process.argv.slice(2);
  if (lines.length === 0) {
    console.error('❌ Usage: node scripts/report.js <line> [<line> ...]');
    process.exit(1);
  }
  const { markdown, failed } = summary(lines);
  fs.mkdirSync(resultsDir, { recursive: true });
  fs.writeFileSync(path.join(resultsDir, 'summary.md'), markdown, 'utf8');
  if (process.env.GITHUB_STEP_SUMMARY) {
    fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, markdown);
  }
  console.log(`\n${markdown}`);
  process.exit(failed ? 1 : 0);
}

if (require.main === module) {
  main();
}

module.exports = { recordCheck, resetChecks, runCheck, runCaptured };
