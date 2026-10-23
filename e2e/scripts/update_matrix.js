#!/usr/bin/env node

// Picks the most downloaded React Native patch for each minor line and saves it to matrix.json.
// Run with: npm run update-matrix

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const root = path.join(__dirname, '..');
const matrixPath = path.join(root, 'matrix.json');
const PACKAGE = 'react-native';
const STABLE_VERSION = /^(\d+)\.(\d+)\.(\d+)$/;
const LINE = /^(\d+)\.(\d+)$/;

const USAGE = `Usage:
  node scripts/update_matrix.js --from <x.y> --to <x.y>

Writes matrix.json: for each React Native minor line from --from to --to, the patch version with
the most npm downloads in the last week. An existing matrix.json is replaced.`;

function fail(message) {
  console.error(`❌ ${message}`);
  process.exit(1);
}

// "0.77" -> 77, so lines can be compared.
function lineNumber(line) {
  const match = LINE.exec(line ?? '');
  if (!match) {
    fail(`Invalid line "${line}", expected <major>.<minor> such as 0.77\n\n${USAGE}`);
  }
  return Number(match[1]) * 1000 + Number(match[2]);
}

// Reads --from and --to.
function parseArgs(argv) {
  const args = { from: null, to: null };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--from' || argv[i] === '--to') {
      args[argv[i].slice(2)] = argv[++i];
    } else {
      fail(`Unknown argument: ${argv[i]}\n\n${USAGE}`);
    }
  }
  if (!args.from || !args.to) {
    fail(`--from and --to are required\n\n${USAGE}`);
  }
  if (lineNumber(args.from) > lineNumber(args.to)) {
    fail(`--from ${args.from} is after --to ${args.to}`);
  }
  return args;
}

// Last week's downloads per version.
async function fetchDownloads() {
  const url = `https://api.npmjs.org/versions/${PACKAGE}/last-week`;
  const response = await fetch(url);
  if (!response.ok) {
    fail(`GET ${url} failed: ${response.status} ${response.statusText}`);
  }
  return (await response.json()).downloads;
}

// All published versions.
function publishedVersions() {
  return JSON.parse(execFileSync('npm', ['view', PACKAGE, 'versions', '--json'], { encoding: 'utf8' }));
}

function percent(part, whole) {
  return `${(whole > 0 ? (part / whole) * 100 : 0).toFixed(2)}%`;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const downloads = await fetchDownloads();
  const patchesByLine = new Map();
  let totalDownloads = 0;

  // Group stable versions by minor line.
  for (const version of publishedVersions()) {
    const match = STABLE_VERSION.exec(version);
    if (!match) {
      continue;
    }
    const line = `${match[1]}.${match[2]}`;
    const count = downloads[version] ?? 0;
    totalDownloads += count;
    if (!patchesByLine.has(line)) {
      patchesByLine.set(line, []);
    }
    patchesByLine.get(line).push({ version, patch: Number(match[3]), downloads: count });
  }

  const from = lineNumber(args.from);
  const to = lineNumber(args.to);
  const missing = [];
  const lines = [];

  // Pick the most downloaded patch of each line.
  for (let number = from; number <= to; number++) {
    const line = `${Math.floor(number / 1000)}.${number % 1000}`;
    const patches = patchesByLine.get(line);
    if (!patches) {
      missing.push(line);
      continue;
    }

    patches.sort((a, b) => a.patch - b.patch);
    const lineDownloads = patches.reduce((sum, p) => sum + p.downloads, 0);
    const latest = patches[patches.length - 1];
    const top =
      lineDownloads === 0 ? latest : patches.reduce((best, p) => (p.downloads >= best.downloads ? p : best));

    lines.push({
      line,
      version: top.version,
      downloads: top.downloads,
      shareOfLine: percent(top.downloads, lineDownloads),
      lineDownloads,
      lineShare: percent(lineDownloads, totalDownloads),
      latestPatch: latest.version,
      reason: lineDownloads === 0 ? 'latest patch (no downloads in line)' : 'most downloaded patch',
      appDir: `apps/rn-${line}`,
    });
  }

  if (missing.length > 0) {
    fail(`No stable ${PACKAGE} versions published for line(s): ${missing.join(', ')}`);
  }

  const matrix = {
    package: PACKAGE,
    fetchedAt: new Date().toISOString(),
    source: 'npm downloads API (last-week) + npm view versions',
    range: { from: args.from, to: args.to },
    lines,
  };
  fs.writeFileSync(matrixPath, JSON.stringify(matrix, null, 2) + '\n', 'utf8');

  console.table(lines.map(({ appDir, ...row }) => row));
  console.log(`\n✅ Wrote ${lines.length} lines to matrix.json`);
}

main().catch((error) => fail(error.message));
