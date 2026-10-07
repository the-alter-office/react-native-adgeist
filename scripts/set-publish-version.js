#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ENVIRONMENTS = ['beta', 'qa', 'prod'];
const AUTO_INCREMENT = ['beta'];

const VERSION_PATTERN = /export const PACKAGE_VERSION = ['"]([^'"]+)['"]/;
const SUFFIX_PATTERN = /export const PACKAGE_SUFFIX = ['"][^'"]*['"]/;

const root = path.join(__dirname, '..');
const constantsPath = path.join(root, 'src/constants.ts');
const envPath = path.join(root, 'src/env.ts');
const packageJsonPath = path.join(root, 'package.json');

function publishedVersions(name) {
  try {
    const output = execFileSync('npm', ['view', name, 'versions', '--json'], {
      stdio: ['ignore', 'pipe', 'ignore'],
    }).toString();
    return [].concat(JSON.parse(output));
  } catch {
    return [];
  }
}

function nextSuffix(name, base, env) {
  const prefix = `${base}-${env}.`;
  const numbers = publishedVersions(name)
    .filter((v) => v.startsWith(prefix) && /^\d+$/.test(v.slice(prefix.length)))
    .map((v) => Number(v.slice(prefix.length)));

  return `-${env}.${Math.max(0, ...numbers) + 1}`;
}

function main() {
  const env = process.argv[2];
  if (!ENVIRONMENTS.includes(env)) {
    throw new Error(
      `Usage: node scripts/set-publish-version.js <${ENVIRONMENTS.join('|')}>`
    );
  }

  const constants = fs.readFileSync(constantsPath, 'utf8');
  const match = constants.match(VERSION_PATTERN);
  if (!match) throw new Error('Could not find PACKAGE_VERSION in constants.ts');

  const base = match[1];
  if (!/^\d+\.\d+\.\d+$/.test(base)) {
    throw new Error(
      `PACKAGE_VERSION must be a plain x.y.z version without a suffix, got "${base}"`
    );
  }

  const { name } = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

  if (!AUTO_INCREMENT.includes(env)) {
    console.log(`📦 ${env} uses the suffix from set-env, nothing to resolve`);
    return;
  }

  const content = fs.readFileSync(envPath, 'utf8');
  if (!SUFFIX_PATTERN.test(content)) {
    throw new Error('Could not find PACKAGE_SUFFIX in env.ts');
  }

  const suffix = nextSuffix(name, base, env);
  fs.writeFileSync(
    envPath,
    content.replace(
      SUFFIX_PATTERN,
      `export const PACKAGE_SUFFIX = '${suffix}'`
    ),
    'utf8'
  );

  console.log(`📦 Publishing ${name}@${base}${suffix} (${env})`);
}

try {
  main();
} catch (e) {
  console.error(`❌ ${e.message}`);
  process.exit(1);
}
