#!/usr/bin/env bash

# Runs every app in matrix.json on the connected emulator, one after another: integrates the SDK
# (SDK_VERSION), then builds, installs, launches and tests it. A failing app skips its remaining
# checks and the next app still runs. Ends with the summary table from scripts/report.js.

set -uo pipefail
cd "$(dirname "$0")/.."
: "${SDK_VERSION:?Set SDK_VERSION to the SDK version or dist-tag to test}"

lines=$(node -p "require('./matrix.json').lines.filter((entry, index) => index == 0).map((entry) => entry.line).join(' ')")
rm -rf results

for line in ${lines}; do
  echo "::group::React Native ${line}"
  if npm run integrate-sdk -- "${SDK_VERSION}" --app "${line}"; then
    npm run maestro:release -- --app "${line}"
  fi
  npm run uninstall
  echo "::endgroup::"
done

node scripts/report.js ${lines}
