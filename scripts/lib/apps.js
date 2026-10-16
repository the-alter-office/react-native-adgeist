const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '../..');
const matrixPath = path.join(root, 'config/matrix.json');

function selectApps(requested) {
  if (requested.length > 0) {
    return requested.map((name) => path.join('apps', name.startsWith('rn-') ? name : `rn-${name}`));
  }
  if (!fs.existsSync(matrixPath)) {
    throw new Error('config/matrix.json not found. Run yarn resolve-versions first, or pass --app.');
  }
  return JSON.parse(fs.readFileSync(matrixPath, 'utf8')).lines.map((l) => path.normalize(l.appDir));
}

function parseAppArgs(argv, usage) {
  const apps = [];
  const rest = [];
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--app') {
      const value = argv[++i];
      if (!value || value.startsWith('--')) {
        throw new Error(`--app needs a value\n\n${usage}`);
      }
      apps.push(value);
    } else {
      rest.push(argv[i]);
    }
  }
  return { apps, rest };
}

module.exports = { root, selectApps, parseAppArgs };
