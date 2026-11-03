#!/usr/bin/env bash

# Runs every app in matrix.json on the connected emulator (PLATFORM=android, the default) or the
# booted simulator (PLATFORM=ios), one after another: integrates the SDK (SDK_VERSION), then builds,
# installs, launches and tests it. A failing app skips its remaining checks and the next app still
# runs. Ends with the summary table from scripts/report.js.

set -uo pipefail
cd "$(dirname "$0")/.."
: "${SDK_VERSION:?Set SDK_VERSION to the SDK version or dist-tag to test}"
PLATFORM="${PLATFORM:-android}"
export E2E_PLATFORM="${PLATFORM}"

lines=$(node -p "require('./matrix.json').lines.filter((entry, index) => index == 0).map((entry) => entry.line).join(' ')")
rm -rf "results/${PLATFORM}"

for line in ${lines}; do
  echo "::group::React Native ${line}"
  if npm run integrate-sdk -- "${SDK_VERSION}" --app "${line}"; then
    npm run maestro:release -- --app "${line}" --platform "${PLATFORM}"
  fi
  npm run uninstall -- --platform "${PLATFORM}"
  if [ -n "${CI:-}" ]; then
    app_dir=$(node -p "require('./matrix.json').lines.find((entry) => entry.line === '${line}').appDir")
    rm -rf "${app_dir}/node_modules" "${app_dir}/android/app/build" "${app_dir}/android/app/.cxx" \
      "${app_dir}/android/build" "${app_dir}/android/.gradle" "${app_dir}/ios/build" "${app_dir}/ios/Pods"
  fi
  df -h /
  free -m 2>/dev/null || true
  echo "::endgroup::"
done

node scripts/report.js ${lines}
