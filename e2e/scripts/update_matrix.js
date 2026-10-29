#!/usr/bin/env node

// Picks the most downloaded React Native patch for each minor line and saves it to matrix.json,
// only when a line or its version changed.
// Run with: npm run update-matrix

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const root = path.join(__dirname, '..');
const matrixPath = path.join(root, 'matrix.json');
const PACKAGE = 'react-native';
const STABLE_VERSION = /^(\d+)\.(\d+)\.(\d+)$/;
const LINE_COUNT = 10;

const USAGE = `Usage:
  node scripts/update_matrix.js

Writes matrix.json: for each of the newest ${LINE_COUNT} React Native minor lines, the patch version
with the most npm downloads in the last week. matrix.json is only rewritten when a line was added
or removed, or a line's version changed.`;

function fail(message) {
  console.error(`❌ ${message}`);
  process.exit(1);
}

// Orders two lines such as "0.79" and "0.100": by major first, then by minor.
function compareLines(a, b) {
  const [aMajor, aMinor] = a.split('.').map(Number);
  const [bMajor, bMinor] = b.split('.').map(Number);
  return aMajor - bMajor || aMinor - bMinor;
}

// The newest LINE_COUNT lines, up to the "latest" dist-tag's line. The cap skips placeholder
// releases such as react-native@1000.0.0.
function selectLines(publishedLines) {
  const newest = latestVersion().split('.').slice(0, 2).join('.');
  return publishedLines
    .filter((line) => compareLines(line, newest) <= 0)
    .sort(compareLines)
    .slice(-LINE_COUNT);
}

// What changed between the saved matrix and the new one, comparing only line and version.
function matrixChanges(previous, lines) {
  const before = new Map(previous.map((entry) => [entry.line, entry.version]));
  const after = new Map(lines.map((entry) => [entry.line, entry.version]));
  const changes = [];
  const apps = [];
  for (const [line, version] of after) {
    if (!before.has(line)) {
      changes.push(`+ ${line} (${version})`);
      apps.push(line);
    } else if (before.get(line) !== version) {
      changes.push(`${line}: ${before.get(line)} → ${version}`);
      apps.push(line);
    }
  }
  for (const line of before.keys()) {
    if (!after.has(line)) {
      changes.push(`- ${line}`);
    }
  }
  return { changes, apps };
}

// In GitHub Actions, passes the result on to the next steps.
function writeOutputs(changes, apps) {
  if (!process.env.GITHUB_OUTPUT) {
    return;
  }
  fs.appendFileSync(
    process.env.GITHUB_OUTPUT,
    `changed=${changes.length > 0}\napps=${apps.join(' ')}\nchanges<<CHANGES_EOF\n${changes.join('\n')}\nCHANGES_EOF\n`,
    'utf8'
  );
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
  return JSON.parse(
    execFileSync('npm', ['view', PACKAGE, 'versions', '--json'], {
      encoding: 'utf8',
    })
  );
}

function latestVersion() {
  return execFileSync('npm', ['view', PACKAGE, 'dist-tags.latest'], {
    encoding: 'utf8',
  }).trim();
}

function percent(part, whole) {
  return `${(whole > 0 ? (part / whole) * 100 : 0).toFixed(2)}%`;
}

async function main() {
  if (process.argv.length > 2) {
    fail(`Unknown argument: ${process.argv[2]}\n\n${USAGE}`);
  }
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
    patchesByLine
      .get(line)
      .push({ version, patch: Number(match[3]), downloads: count });
  }

  const lines = [];

  // Pick the most downloaded patch of each line.
  console.log(patchesByLine.keys());

  for (const line of selectLines([...patchesByLine.keys()])) {
    const patches = patchesByLine.get(line);
    patches.sort((a, b) => a.patch - b.patch);
    const lineDownloads = patches.reduce((sum, p) => sum + p.downloads, 0);
    const latest = patches[patches.length - 1];
    const top =
      lineDownloads === 0
        ? latest
        : patches.reduce((best, p) =>
            p.downloads >= best.downloads ? p : best
          );

    lines.push({
      line,
      version: top.version,
      downloads: top.downloads,
      shareOfLine: percent(top.downloads, lineDownloads),
      lineDownloads,
      lineShare: percent(lineDownloads, totalDownloads),
      latestPatch: latest.version,
      reason:
        lineDownloads === 0
          ? 'latest patch (no downloads in line)'
          : 'most downloaded patch',
      appDir: `apps/rn-${line}`,
    });
  }

  const previous = fs.existsSync(matrixPath)
    ? JSON.parse(fs.readFileSync(matrixPath, 'utf8')).lines
    : [];
  const { changes, apps } = matrixChanges(previous, lines);
  writeOutputs(changes, apps);
  if (changes.length === 0) {
    console.log('\n✅ No changes, matrix.json is up to date');
    return;
  }

  const matrix = {
    package: PACKAGE,
    fetchedAt: new Date().toISOString(),
    source: 'npm downloads API (last-week) + npm view versions',
    range: { from: lines[0].line, to: lines[lines.length - 1].line },
    lines,
  };
  fs.writeFileSync(matrixPath, JSON.stringify(matrix, null, 2) + '\n', 'utf8');
  console.log(
    `\n✅ Updated matrix.json:\n${changes.map((change) => `   ${change}`).join('\n')}`
  );
}

main().catch((error) => fail(error.message));
