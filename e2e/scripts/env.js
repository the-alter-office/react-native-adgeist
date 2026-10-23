const path = require('path');

const ENV_FILE = path.join(__dirname, '../.env');

const REQUIRED = [
  'ADGEIST_E2E_APP_ID',
  'ADGEIST_E2E_PACKAGE_NAME',
  'ADGEIST_E2E_AD1_UNIT_ID',
  'ADGEIST_E2E_AD2_UNIT_ID',
  'ADGEIST_E2E_AD3_UNIT_ID',
];

function loadEnv() {
  try {
    process.loadEnvFile(ENV_FILE);
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }
}

function requireEnv() {
  loadEnv();
  const missing = REQUIRED.filter((name) => !process.env[name]);
  if (missing.length > 0) {
    throw new Error(`Missing values: ${missing.join(', ')}. Add them to .env at the repo root.`);
  }
}

module.exports = { loadEnv, requireEnv };
