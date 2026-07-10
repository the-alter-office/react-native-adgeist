#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ENVIRONMENTS = {
  beta: {
    suffix: '-beta',
    domain: 'https://beta.v2.bg-services.adgeist.ai',
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
  yarn set-env <beta|qa|prod>     Set PACKAGE_SUFFIX and BACKEND_DOMAIN for an environment
  yarn set-env --domain <url>     Set only BACKEND_DOMAIN (local development)`;

const constantsPath = path.join(__dirname, '../src/constants.ts');

function replaceConstant(content, name, value) {
  const regex = new RegExp(`export const ${name} = ['"][^'"]*['"]`);

  if (!regex.test(content)) {
    console.error(`❌ Could not find ${name} in constants.ts`);
    process.exit(1);
  }

  return content.replace(regex, `export const ${name} = '${value}'`);
}

const args = process.argv.slice(2);
let content = fs.readFileSync(constantsPath, 'utf8');

if (args[0] === '--domain') {
  const domain = args[1];

  if (!domain) {
    console.error(`❌ Missing url after --domain\n\n${USAGE}`);
    process.exit(1);
  }

  content = replaceConstant(content, 'BACKEND_DOMAIN', domain);
  fs.writeFileSync(constantsPath, content, 'utf8');
  console.log(`✅ Set BACKEND_DOMAIN to ${domain}`);
} else {
  const env = ENVIRONMENTS[args[0]];

  if (!env) {
    console.error(`❌ Unknown environment: ${args[0] ?? '(none)'}\n\n${USAGE}`);
    process.exit(1);
  }

  content = replaceConstant(content, 'PACKAGE_SUFFIX', env.suffix);
  content = replaceConstant(content, 'BACKEND_DOMAIN', env.domain);
  fs.writeFileSync(constantsPath, content, 'utf8');
  console.log(
    `✅ Environment set to ${args[0]} (PACKAGE_SUFFIX='${env.suffix}', BACKEND_DOMAIN='${env.domain}')`
  );
}
