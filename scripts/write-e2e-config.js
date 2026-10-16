#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { root, selectApps, parseAppArgs } = require('./lib/apps');

const defaults = require(path.join(root, 'config/e2e.defaults.json'));

const USAGE = `Usage:
  node scripts/write-e2e-config.js [--app <rn-x.y | x.y> ...]

Writes e2e.config.json into each app from these environment variables, falling back to
config/e2e.defaults.json for any that are not set:

  ADGEIST_E2E_AD_UNIT_ID       ad unit ID
  ADGEIST_E2E_AD_RESPONSIVE    true | false
  ADGEIST_E2E_AD_WIDTH         width in dp (fixed ad units)
  ADGEIST_E2E_AD_HEIGHT        height in dp

Default: every app in config/matrix.json.`;

function fail(message) {
  console.error(`❌ ${message}`);
  process.exit(1);
}

function readBoolean(name, fallback) {
  const raw = process.env[name];
  if (raw === undefined || raw === '') {
    return { value: fallback, fromEnv: false };
  }
  if (!['true', 'false'].includes(raw.toLowerCase())) {
    fail(`${name} must be true or false`);
  }
  return { value: raw.toLowerCase() === 'true', fromEnv: true };
}

function readNumber(name, fallback) {
  const raw = process.env[name];
  if (raw === undefined || raw === '') {
    return { value: fallback, fromEnv: false };
  }
  const value = Number(raw);
  if (!Number.isFinite(value) || value <= 0) {
    fail(`${name} must be a positive number`);
  }
  return { value, fromEnv: true };
}

function readString(name, fallback) {
  const raw = process.env[name];
  if (raw === undefined || raw === '') {
    return { value: fallback, fromEnv: false };
  }
  return { value: raw.trim(), fromEnv: true };
}

function buildConfig() {
  const adUnitId = readString('ADGEIST_E2E_AD_UNIT_ID', defaults.adUnitId);
  const adIsResponsive = readBoolean('ADGEIST_E2E_AD_RESPONSIVE', defaults.adIsResponsive);
  const width = readNumber('ADGEIST_E2E_AD_WIDTH', defaults.adSize.width);
  const height = readNumber('ADGEIST_E2E_AD_HEIGHT', defaults.adSize.height);

  const config = {
    adUnitId: adUnitId.value,
    adIsResponsive: adIsResponsive.value,
    adSize: { width: width.value, height: height.value },
  };

  const sources = {
    adUnitId: adUnitId.fromEnv ? 'env (hidden)' : `defaults (${adUnitId.value})`,
    adIsResponsive: `${adIsResponsive.fromEnv ? 'env' : 'defaults'} (${adIsResponsive.value})`,
    adSize: `${width.fromEnv || height.fromEnv ? 'env' : 'defaults'} (${width.value}x${height.value})`,
  };

  return { config, sources, usesPlaceholder: !adUnitId.fromEnv };
}

function main() {
  let parsed;
  try {
    parsed = parseAppArgs(process.argv.slice(2), USAGE);
  } catch (error) {
    fail(error.message);
  }
  if (parsed.rest.includes('--help') || parsed.rest.includes('-h')) {
    console.log(USAGE);
    return;
  }
  if (parsed.rest.length > 0) {
    fail(`Unknown argument: ${parsed.rest[0]}\n\n${USAGE}`);
  }

  let apps;
  try {
    apps = selectApps(parsed.apps);
  } catch (error) {
    fail(error.message);
  }

  const { config, sources, usesPlaceholder } = buildConfig();
  console.log(
    `adUnitId: ${sources.adUnitId}\nadIsResponsive: ${sources.adIsResponsive}\nadSize: ${sources.adSize}\n`
  );
  if (usesPlaceholder) {
    console.warn('⚠️  ADGEIST_E2E_AD_UNIT_ID is not set: the apps use the placeholder ad unit and will not load an ad.');
  }

  const failures = [];
  for (const relativeDir of apps) {
    const appDir = path.join(root, relativeDir);
    if (!fs.existsSync(path.join(appDir, 'package.json'))) {
      console.error(`❌ ${relativeDir} does not exist. Run yarn generate-app first.`);
      failures.push(relativeDir);
      continue;
    }
    fs.writeFileSync(path.join(appDir, 'e2e.config.json'), JSON.stringify(config, null, 2) + '\n', 'utf8');
    console.log(`✅ ${relativeDir}/e2e.config.json`);
  }

  console.log(`\nWritten: ${apps.length - failures.length}, failed: ${failures.length} (of ${apps.length})`);
  if (failures.length > 0) {
    process.exit(1);
  }
}

main();
