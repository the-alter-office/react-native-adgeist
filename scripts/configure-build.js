#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ENVIRONMENTS = {
  beta: {
    suffix: '-beta',
    domain: 'https://beta.v2.bg-services.adgeist.ai',
    autoIncrement: true,
  },
  qa: {
    suffix: '-qa',
    domain: 'https://qa.v2.bg-services.adgeist.ai',
  },
  prod: {
    suffix: '',
    domain: 'https://qa.v2.bg-services.adgeist.ai',
  },
};

const USAGE = `Usage:
  yarn configure-build <beta|qa|prod>             Set PACKAGE_SUFFIX and BACKEND_DOMAIN for an environment
  yarn configure-build <beta|qa|prod> --publish   Same, resolving the next published beta number (CI)`;

const root = path.join(__dirname, '..');
const configPath = path.join(root, 'src/config.ts');
const constantsPath = path.join(root, 'src/constants.ts');
const packageJsonPath = path.join(root, 'package.json');

function fail(message) {
  console.error(`❌ ${message}`);
  process.exit(1);
}

function replaceConstant(content, name, value) {
  const regex = new RegExp(`export const ${name} = ['"][^'"]*['"]`);

  if (!regex.test(content)) {
    fail(`Could not find ${name} in config.ts`);
  }

  return content.replace(regex, `export const ${name} = '${value}'`);
}

function baseVersion() {
  const constants = fs.readFileSync(constantsPath, 'utf8');
  const match = constants.match(
    /export const PACKAGE_VERSION = ['"]([^'"]+)['"]/
  );

  if (!match) {
    fail('Could not find PACKAGE_VERSION in constants.ts');
  }

  if (!/^\d+\.\d+\.\d+$/.test(match[1])) {
    fail(
      `PACKAGE_VERSION must be a plain x.y.z version without a suffix, got "${match[1]}"`
    );
  }

  return match[1];
}

function isNotFound(error) {
  return `${error.stdout ?? ''}${error.stderr ?? ''}`.includes('E404');
}

function publishedVersions(name) {
  try {
    const output = execFileSync('npm', ['view', name, 'versions', '--json'], {
      stdio: ['ignore', 'pipe', 'pipe'],
    }).toString();
    return [].concat(JSON.parse(output));
  } catch (error) {
    if (isNotFound(error)) {
      return [];
    }

    fail(
      `Could not read published versions of ${name} from npm, re-run the workflow: ${error.message}`
    );
  }
}

function nextSuffix(base, suffix) {
  const { name } = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const prefix = `${base}${suffix}.`;
  const numbers = publishedVersions(name)
    .filter((v) => v.startsWith(prefix) && /^\d+$/.test(v.slice(prefix.length)))
    .map((v) => Number(v.slice(prefix.length)));

  return `${suffix}.${Math.max(0, ...numbers) + 1}`;
}

const args = process.argv.slice(2);
const publish = args.includes('--publish');
const envName = args.find((arg) => !arg.startsWith('--'));
const env = ENVIRONMENTS[envName];

if (!env) {
  fail(`Unknown environment: ${envName ?? '(none)'}\n\n${USAGE}`);
}

const base = baseVersion();
let suffix = env.suffix;

if (publish && env.autoIncrement) {
  suffix = nextSuffix(base, env.suffix);
}

let content = fs.readFileSync(configPath, 'utf8');
content = replaceConstant(content, 'PACKAGE_SUFFIX', suffix);
content = replaceConstant(content, 'BACKEND_DOMAIN', env.domain);
fs.writeFileSync(configPath, content, 'utf8');
console.log(
  `✅ Environment set to ${envName} (PACKAGE_SUFFIX='${suffix}', BACKEND_DOMAIN='${env.domain}')`
);
