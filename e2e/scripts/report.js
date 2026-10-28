#!/usr/bin/env node

// Records each app's check results in results/summary.json, then adds the totals to it and prints
// them as a table (also to the GitHub job summary in CI).
// Run with: node scripts/report.js <line> [<line> ...]

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const root = path.join(__dirname, '..');
const summaryPath = path.join(root, 'results', 'summary.json');
const CHECKS = [
  ['integrate', 'Integrate'],
  ['sdk-install', 'SDK install'],
  ['build', 'Build'],
  ['install', 'Install'],
  ['launch', 'Launch'],
  ['maestro', 'Maestro'],
];

function readSummary() {
  return fs.existsSync(summaryPath) ? JSON.parse(fs.readFileSync(summaryPath, 'utf8')) : { apps: {} };
}

function writeSummary(summary) {
  fs.mkdirSync(path.dirname(summaryPath), { recursive: true });
  fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2) + '\n', 'utf8');
}

function recordCheck(line, check, status, detail) {
  const summary = readSummary();
  summary.apps[line] = {
    ...summary.apps[line],
    [check]: detail ? { status, detail: String(detail).split('\n')[0].slice(0, 300) } : { status },
  };
  writeSummary(summary);
}

function resetChecks(line) {
  const summary = readSummary();
  delete summary.apps[line];
  writeSummary(summary);
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

// The first check that did not pass, or null if every check passed.
function firstFailure(line, checks = {}) {
  for (const [check, title] of CHECKS) {
    const result = checks[check];
    if (result?.status !== 'passed') {
      return { line, check: title, detail: result ? result.detail ?? 'failed' : 'did not report a result, see the log' };
    }
  }
  return null;
}

function toMarkdown(summary, lines) {
  const rows = lines.map((line) => {
    const checks = summary.apps[line] ?? {};
    let blocked = false;
    const cells = CHECKS.map(([check]) => {
      if (blocked) {
        return '⏭️';
      }
      const status = checks[check]?.status;
      blocked = status !== 'passed';
      return status === 'passed' ? '✅' : status === 'failed' ? '❌' : '⚪';
    });
    return `| ${line} | ${cells.join(' | ')} |`;
  });

  const version = process.env.SDK_VERSION ? ` · SDK ${process.env.SDK_VERSION}` : '';
  return [
    `## E2E Android${version}`,
    '',
    `| React Native | ${CHECKS.map(([, title]) => title).join(' | ')} |`,
    `|---|${CHECKS.map(() => '---').join('|')}|`,
    ...rows,
    '',
    '✅ passed · ❌ failed · ⏭️ skipped after an earlier failure · ⚪ no result',
    '',
    ...(summary.failures.length > 0
      ? ['### Failures', '', ...summary.failures.map(({ line, check, detail }) => `- **${line}** · ${check}: ${detail}`), '']
      : ['All checks passed.', '']),
  ].join('\n');
}

function main() {
  const lines = process.argv.slice(2);
  if (lines.length === 0) {
    console.error('❌ Usage: node scripts/report.js <line> [<line> ...]');
    process.exit(1);
  }
  const summary = readSummary();
  summary.failures = lines.map((line) => firstFailure(line, summary.apps[line])).filter(Boolean);
  summary.total = lines.length;
  summary.failed = summary.failures.length;
  summary.passed = summary.total - summary.failed;
  writeSummary(summary);

  const markdown = toMarkdown(summary, lines);
  if (process.env.GITHUB_STEP_SUMMARY) {
    fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, markdown);
  }
  console.log(`\n${markdown}`);
  process.exit(summary.failed > 0 ? 1 : 0);
}

if (require.main === module) {
  main();
}

module.exports = { recordCheck, resetChecks, runCheck, runCaptured };
