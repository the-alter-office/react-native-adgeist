const path = require('path');
const android = require('./utils/android');
const ios = require('./utils/ios');

const ENV_FILE = path.join(__dirname, '../.env');

const APP_ID_VARIABLES = {
  android: android.APP_ID_VARIABLE,
  ios: ios.APP_ID_VARIABLE,
};

const REQUIRED = [
  'ADGEIST_E2E_APP_ID',
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

function appIdVariable() {
  const name = process.env.E2E_PLATFORM || 'android';
  if (!APP_ID_VARIABLES[name]) {
    throw new Error(`Unknown platform: ${name}. Use android or ios.`);
  }
  return APP_ID_VARIABLES[name];
}

function appIdOnDevice() {
  loadEnv();
  const variable = appIdVariable();
  if (!process.env[variable]) {
    throw new Error(`${variable} is missing. Add it to .env.`);
  }
  return process.env[variable];
}

function requireEnv() {
  loadEnv();
  const missing = [appIdVariable(), ...REQUIRED].filter((name) => !process.env[name]);
  if (missing.length > 0) {
    throw new Error(`Missing values: ${missing.join(', ')}. Add them to .env at the repo root.`);
  }
}

module.exports = { loadEnv, requireEnv, appIdVariable, appIdOnDevice };
