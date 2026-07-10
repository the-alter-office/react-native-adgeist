#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Read version from constants.ts and suffix from env.ts
const constantsPath = path.join(__dirname, '../src/constants.ts');
const constantsContent = fs.readFileSync(constantsPath, 'utf8');
const envPath = path.join(__dirname, '../src/env.ts');
const envContent = fs.readFileSync(envPath, 'utf8');

// Extract version and suffix using regex
const versionMatch = constantsContent.match(
  /export const PACKAGE_VERSION = ['"]([^'"]+)['"]/
);

if (!versionMatch) {
  console.error('❌ Could not find PACKAGE_VERSION in constants.ts');
  process.exit(1);
}

const suffixMatch = envContent.match(
  /export const PACKAGE_SUFFIX = ['"]([^'"]*)['"]/
);

if (!suffixMatch) {
  console.error('❌ Could not find PACKAGE_SUFFIX in env.ts');
  process.exit(1);
}

const version = versionMatch[1] + suffixMatch[1];
console.log(`📦 Version from constants.ts + env.ts: ${version}`);

// Read and update package.json
const packageJsonPath = path.join(__dirname, '../package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

if (packageJson.version === version) {
  console.log('✅ package.json version is already in sync');
  process.exit(0);
}

packageJson.version = version;

// Write back to package.json with proper formatting
fs.writeFileSync(
  packageJsonPath,
  JSON.stringify(packageJson, null, 2) + '\n',
  'utf8'
);

console.log(`✅ Updated package.json version to ${version}`);
