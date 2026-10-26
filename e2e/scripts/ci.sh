#!/usr/bin/env bash

# Runs every app in matrix.json on the connected emulator, one after another, and stops at the
# first failure. The SDK must already be integrated (npm run integrate-sdk -- <version>).

set -euo pipefail
cd "$(dirname "$0")/.."

for line in $(node -p "require('./matrix.json').lines.filter((entry, index) => index === 0).map((entry) => entry.line).join(' ')"); do
  echo "▶ React Native ${line}"
  npm run maestro:release -- --app "${line}"
  npm run uninstall
done
