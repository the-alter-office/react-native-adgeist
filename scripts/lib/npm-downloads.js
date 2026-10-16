const fs = require('fs');

const STABLE_VERSION = /^(\d+)\.(\d+)\.(\d+)$/;
const LINE = /^(\d+)\.(\d+)$/;

function downloadsUrl(pkg) {
  return `https://api.npmjs.org/versions/${encodeURIComponent(pkg)}/last-week`;
}

function registryUrl(pkg) {
  return `https://registry.npmjs.org/${pkg.replace('/', '%2F')}`;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchJson(url, { headers = {}, retries = 3 } = {}) {
  let lastError;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, { headers });
      if (res.ok) {
        return await res.json();
      }
      lastError = new Error(`GET ${url} failed: ${res.status} ${res.statusText}`);
      if (res.status < 500 && res.status !== 429) {
        break;
      }
    } catch (error) {
      lastError = new Error(`GET ${url} failed: ${error.message}`);
    }

    if (attempt < retries) {
      await sleep(1000 * 2 ** (attempt - 1));
    }
  }

  throw lastError;
}

function parseVersion(version) {
  const match = STABLE_VERSION.exec(version);
  if (!match) {
    return null;
  }
  const [major, minor, patch] = match.slice(1).map(Number);
  return { version, major, minor, patch, line: `${major}.${minor}` };
}

function parseLine(line) {
  const match = LINE.exec(String(line));
  if (!match) {
    throw new Error(`Invalid version line "${line}", expected <major>.<minor> such as 0.77`);
  }
  return { major: Number(match[1]), minor: Number(match[2]) };
}

function compareLines(a, b) {
  const x = parseLine(a);
  const y = parseLine(b);
  return x.major - y.major || x.minor - y.minor;
}

async function fetchSnapshot(pkg = 'react-native') {
  const [downloadsDoc, registryDoc] = await Promise.all([
    fetchJson(downloadsUrl(pkg)),
    fetchJson(registryUrl(pkg), {
      headers: { Accept: 'application/vnd.npm.install-v1+json' },
    }),
  ]);

  if (!downloadsDoc || typeof downloadsDoc.downloads !== 'object') {
    throw new Error(`Unexpected response from ${downloadsUrl(pkg)}`);
  }
  if (!registryDoc || typeof registryDoc.versions !== 'object') {
    throw new Error(`Unexpected response from ${registryUrl(pkg)}`);
  }

  const downloads = {};
  for (const version of Object.keys(registryDoc.versions)) {
    if (parseVersion(version)) {
      downloads[version] = 0;
    }
  }
  for (const [version, count] of Object.entries(downloadsDoc.downloads)) {
    if (parseVersion(version)) {
      downloads[version] = Number(count) || 0;
    }
  }

  return {
    package: pkg,
    fetchedAt: new Date().toISOString(),
    source: 'npm downloads API (last-week) + registry version list',
    downloads,
  };
}

function loadSnapshot(file) {
  const snapshot = JSON.parse(fs.readFileSync(file, 'utf8'));
  if (!snapshot || typeof snapshot.downloads !== 'object') {
    throw new Error(`${file} is not a downloads snapshot`);
  }
  return snapshot;
}

function saveSnapshot(file, snapshot) {
  fs.writeFileSync(file, JSON.stringify(snapshot, null, 2) + '\n', 'utf8');
}

function toPercent(part, whole) {
  return whole > 0 ? Number(((part / whole) * 100).toFixed(2)) : 0;
}

function parsePercent(value) {
  if (typeof value === 'number') {
    return value;
  }
  const parsed = Number.parseFloat(String(value).replace('%', ''));
  if (Number.isNaN(parsed)) {
    throw new Error(`Invalid percentage "${value}"`);
  }
  return parsed;
}

function pickVersion(patches) {
  const total = patches.reduce((sum, p) => sum + p.downloads, 0);
  const byPatchDesc = [...patches].sort((a, b) => b.patch - a.patch);

  if (total === 0) {
    return { ...byPatchDesc[0], reason: 'latest patch (no downloads in line)' };
  }

  const top = byPatchDesc.reduce((best, p) => (p.downloads > best.downloads ? p : best));
  return { ...top, reason: 'most downloaded patch' };
}

function summarizeLines(snapshot) {
  const lines = new Map();
  let grandTotal = 0;

  for (const [version, downloads] of Object.entries(snapshot.downloads)) {
    const parsed = parseVersion(version);
    if (!parsed) {
      continue;
    }
    grandTotal += downloads;
    if (!lines.has(parsed.line)) {
      lines.set(parsed.line, []);
    }
    lines.get(parsed.line).push({ ...parsed, downloads });
  }

  return [...lines.entries()]
    .map(([line, patches]) => {
      const sorted = patches.sort((a, b) => a.patch - b.patch);
      const total = sorted.reduce((sum, p) => sum + p.downloads, 0);
      const selected = pickVersion(sorted);
      return {
        line,
        total,
        share: toPercent(total, grandTotal),
        latest: sorted[sorted.length - 1].version,
        selected: {
          version: selected.version,
          downloads: selected.downloads,
          shareOfLine: toPercent(selected.downloads, total),
          reason: selected.reason,
        },
        patches: sorted.map(({ version, downloads }) => ({ version, downloads })),
      };
    })
    .sort((a, b) => compareLines(a.line, b.line));
}

function linesInRange(summaries, from, to) {
  const selected = summaries.filter(
    (s) => compareLines(s.line, from) >= 0 && compareLines(s.line, to) <= 0
  );

  const present = new Set(selected.map((s) => s.line));
  const { major, minor: fromMinor } = parseLine(from);
  const { major: toMajor, minor: toMinor } = parseLine(to);
  const missing = [];
  if (major === toMajor) {
    for (let minor = fromMinor; minor <= toMinor; minor++) {
      if (!present.has(`${major}.${minor}`)) {
        missing.push(`${major}.${minor}`);
      }
    }
  }

  return { selected, missing };
}

module.exports = {
  fetchJson,
  registryUrl,
  fetchSnapshot,
  loadSnapshot,
  saveSnapshot,
  summarizeLines,
  linesInRange,
  pickVersion,
  toPercent,
  parsePercent,
  parseVersion,
  parseLine,
  compareLines,
};
