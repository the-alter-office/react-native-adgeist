# react-native-adgeist E2E matrix (Android)

End-to-end tests for [`@thealteroffice/react-native-adgeist`](https://www.npmjs.com/package/@thealteroffice/react-native-adgeist)
across the React Native versions host apps actually use.

This branch (`e2e/matrix`) is an orphan branch. It holds no library source: every app installs
the SDK from npm, using the version published to the QA environment.

## What is verified

For each app, on an Android emulator:

1. **App launches**: the release build installs and opens without crashing.
2. **Ad rendered**: the SDK emits `AL1` (`AD_LOADED`) and no unexpected `AE*` / `AW*` / `RWAE1` code.
3. **Click handled**: tapping the ad emits `AI1` (`AD_CLICKED`).

## What is NOT verified

- **Impression and click reporting.** `AD_LOADED` means the creative rendered and `AD_CLICKED`
  means the tap was handled. Neither proves that the native SDK reported an impression or a
  click to the backend.
- iOS, production, Expo apps and old-architecture builds.

## Which React Native versions

One app per React Native minor line. Within each line, the app uses the patch version with the
most npm downloads in the last week (prereleases excluded; ties go to the higher patch; a line
with no downloads uses its latest patch). The range moves forward: new lines are added and
low-share lines are retired through a reviewed pull request.

## Layout

| Path | Contents |
|---|---|
| `config/e2e.defaults.json` | Placeholder AdGeist values. Real values come only from environment variables / GitHub secrets |
| `config/matrix.json` | Each React Native line, its selected version and its app folder |
| `scripts/` | Version selection, app generation, SDK install, advisory, Slack |
| `overlay/` | The E2E screen copied into every app |
| `maestro/` | Maestro flows |
| `apps/rn-x.y/` | One React Native app per minor line |

The GitHub Actions workflows that run this live on the default branch, because
`workflow_dispatch` and `schedule` only run from there.

## Local prerequisites

- Node 20.19 or newer
- Yarn classic 1.x
- JDK 17
- Android SDK with an API 35 `google_apis` x86_64 system image
- Maestro CLI

## Secrets

Committed values are placeholders. The real AdGeist app ID, package name and ad unit ID are
provided at build time only, and are never committed, logged or uploaded as artifacts.
