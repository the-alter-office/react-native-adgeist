#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const {
  fetchSnapshot,
  loadSnapshot,
  saveSnapshot,
  summarizeLines,
  linesInRange,
  parseLine,
  compareLines,
} = require('./lib/npm-downloads');

const root = path.join(__dirname, '..');

const USAGE = `Usage:
  node scripts/resolve-versions.js --from <x.y> --to <x.y> [options]

Options:
  --out <file>             Output file (default: config/matrix.json)
  --snapshot <file>        Use a saved downloads snapshot instead of fetching from npm
  --save-snapshot <file>   Save the fetched downloads snapshot to a file
  --force                  Overwrite the output file if it already exists
  --package <name>         npm package (default: react-native)`;

function fail(message) {
  console.error(`❌ ${message}`);
  process.exit(1);
}

function parseArgs(argv) {
  const args = { out: 'config/matrix.json', package: 'react-native', force: false };
  const valued = new Set(['--from', '--to', '--out', '--snapshot', '--save-snapshot', '--package']);

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--force') {
      args.force = true;
    } else if (arg === '--help' || arg === '-h') {
      console.log(USAGE);
      process.exit(0);
    } else if (valued.has(arg)) {
      const value = argv[++i];
      if (value === undefined || value.startsWith('--')) {
        fail(`${arg} needs a value\n\n${USAGE}`);
      }
      const key = arg.slice(2).replace(/-([a-z])/g, (_, c) => c.toUpperCase());
      args[key] = value;
    } else {
      fail(`Unknown argument: ${arg}\n\n${USAGE}`);
    }
  }

  if (!args.from || !args.to) {
    fail(`--from and --to are required\n\n${USAGE}`);
  }
  try {
    parseLine(args.from);
    parseLine(args.to);
  } catch (error) {
    fail(error.message);
  }
  if (compareLines(args.from, args.to) > 0) {
    fail(`--from ${args.from} is after --to ${args.to}`);
  }

  return args;
}

function percent(value) {
  return `${value.toFixed(2)}%`;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const outPath = path.resolve(root, args.out);

  if (fs.existsSync(outPath) && !args.force) {
    fail(
      `${path.relative(root, outPath)} already exists. It describes the apps that exist, so it is not overwritten by default. Re-run with --force to replace it.`
    );
  }

  const snapshot = args.snapshot
    ? loadSnapshot(path.resolve(root, args.snapshot))
    : await fetchSnapshot(args.package);

  if (args.saveSnapshot) {
    saveSnapshot(path.resolve(root, args.saveSnapshot), snapshot);
    console.log(`💾 Saved downloads snapshot to ${args.saveSnapshot}`);
  }

  const { selected, missing } = linesInRange(summarizeLines(snapshot), args.from, args.to);

  if (missing.length > 0) {
    fail(`No stable ${snapshot.package} versions published for line(s): ${missing.join(', ')}`);
  }

  const matrix = {
    package: snapshot.package,
    fetchedAt: snapshot.fetchedAt,
    source: snapshot.source,
    range: { from: args.from, to: args.to },
    lines: selected.map((s) => ({
      line: s.line,
      version: s.selected.version,
      downloads: s.selected.downloads,
      shareOfLine: percent(s.selected.shareOfLine),
      lineDownloads: s.total,
      lineShare: percent(s.share),
      latestPatch: s.latest,
      reason: s.selected.reason,
      appDir: `apps/rn-${s.line}`,
    })),
  };

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(matrix, null, 2) + '\n', 'utf8');

  console.log(`📦 ${snapshot.package} downloads fetched at ${snapshot.fetchedAt}\n`);
  console.table(
    matrix.lines.map((l) => ({
      line: l.line,
      version: l.version,
      downloads: l.downloads,
      'of line': l.shareOfLine,
      'line share': l.lineShare,
      latest: l.latestPatch,
      reason: l.reason,
    }))
  );
  console.log(`\n✅ Wrote ${matrix.lines.length} lines to ${path.relative(root, outPath)}`);
}

main().catch((error) => fail(error.message));
