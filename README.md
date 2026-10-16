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

### Resolving the versions

```
yarn resolve-versions
```

Fetches last week's per-version download counts for `react-native` from
`api.npmjs.org/versions/react-native/last-week`, merges them with the full version list from the
npm registry (so versions with zero downloads still count), and writes `config/matrix.json` for
lines 0.77 to 0.86. It refuses to overwrite an existing `config/matrix.json`; pass `--force` to
replace it.

Other options:

| Option | Purpose |
|---|---|
| `--from <x.y>` / `--to <x.y>` | Line range, inclusive |
| `--out <file>` | Output file instead of `config/matrix.json` |
| `--save-snapshot <file>` | Save the fetched download data, to replay it later |
| `--snapshot <file>` | Use saved download data instead of fetching from npm |

### `config/matrix.json` fields

Top level:

| Field | Meaning |
|---|---|
| `package` | npm package the downloads were read for (`react-native`) |
| `fetchedAt` | When the download data was fetched (ISO 8601, UTC) |
| `source` | Where the data came from |
| `range` | The `from` / `to` lines the file was generated for |
| `lines` | One entry per React Native minor line |

Each entry in `lines`:

| Field | Meaning | Example |
|---|---|---|
| `line` | React Native minor line | `0.77` |
| `version` | Selected patch: the app in `appDir` runs exactly this version | `0.77.3` |
| `downloads` | Last-week downloads of the selected patch | `65919` |
| `shareOfLine` | Selected patch's downloads as a **percentage** of its line's downloads. A high value means a clear leader; a low value means the leader can change from week to week | `"59.44%"` |
| `lineDownloads` | Last-week downloads of all stable patches in the line combined | `110906` |
| `lineShare` | The line's downloads as a **percentage** of all stable `react-native` downloads. Used to decide when a line is added (≥ 0.5%) or retired (< 1% in two consecutive monthly checks) | `"0.77%"` |
| `latestPatch` | Newest published stable patch in the line, for comparison with `version` | `0.77.3` |
| `reason` | Why `version` was selected: `most downloaded patch`, or `latest patch (no downloads in line)` | `most downloaded patch` |
| `appDir` | Folder of the app for this line | `apps/rn-0.77` |

Percentages are strings with a `%` suffix, rounded to two decimals. Scripts that compare them
read them with `parsePercent` from `scripts/lib/npm-downloads.js`. Prereleases (`-rc`, nightlies) are excluded from every
count, including the totals.

## Generating an app

```
yarn generate-app 0.77.3
yarn generate-app --all
```

Creates `apps/rn-<x.y>` for each version. `--all` uses every version in `config/matrix.json`.
The same script is used for the initial apps and by the Regenerate workflow, so every app is
built the same way.

| Option | Purpose |
|---|---|
| `--all` | Generate the apps listed in `config/matrix.json`, skipping ones that already exist |
| `--replace` | Delete and recreate an app folder that already exists |
| `--skip-install` | Create and patch the app without running `yarn install` |
| `--cli-version <ver>` | `@react-native-community/cli` version used for `init` (default `latest`) |

### When an app folder already exists

| Command | Folder exists, same version | Folder exists, different version | Folder missing |
|---|---|---|---|
| `yarn generate-app 0.77.3` | ❌ error, nothing changed | ❌ error, nothing changed | ✅ generated |
| `yarn generate-app 0.77.3 --replace` | 🔁 deleted and regenerated | 🔁 deleted and regenerated | ✅ generated |
| `yarn generate-app --all` | ⏭️ skipped | ⚠️ skipped with a warning | ✅ generated |
| `yarn generate-app --all --replace` | 🔁 deleted and regenerated | 🔁 deleted and regenerated | ✅ generated |

- The existing version is read from `react-native` in the app's `package.json`. The warning
  looks like `⚠️ apps/rn-0.83 has 0.83.4, matrix.json lists 0.83.6; use --replace to update`.
  The app is not rebuilt automatically.
- With `--all`, any folder in `apps/` that `config/matrix.json` does not list is reported as
  `⚠️ apps/rn-0.76 is not in config/matrix.json`. It is never deleted; removing an app is a
  deliberate act.
- Every run ends with `Generated: N, skipped: N, failed: N`. The exit code is non-zero only when
  an app fails to generate; skipped apps and warnings do not fail the run.
- `--replace` deletes the whole app folder first, including manual edits. `react-native` and
  `@react-native/*` come out at the same exact version, but other dependencies resolve to the
  newest version their ranges allow, so `yarn.lock` can differ from the previous run.

What it does, per version:

1. Picks the `@react-native-community/template` version with the same number as the requested
   React Native version (the template is published in lockstep with React Native, e.g.
   template `0.77.3` creates a React Native `0.77.3` app). If that exact version does not exist,
   it uses the closest lower stable patch in the same line and prints a warning.
2. Runs `@react-native-community/cli init AdgeistE2E` into `apps/rn-<x.y>` with package name
   `ai.adgeist.e2e`, without installing dependencies or CocoaPods.
3. Pins `react-native` and every `@react-native/*` package in the app's `package.json` to the
   exact requested version, so the app is correct even when step 1 fell back to a lower template.
   It also sets `"packageManager": "yarn@1.22.22"`, so Corepack uses Yarn classic in the app.
   `init` runs with `--pm npm` on purpose: with `--pm yarn` the CLI runs `yarn set version` in the
   repo root and leaves a `.yarnrc.yml` that forces Yarn 3 everywhere.
4. Patches `android/app/build.gradle` so `applicationId` and the `ADGEIST_APP_ID` manifest
   placeholder come from the Gradle properties `e2eApplicationId` and `e2eAdgeistAppId`,
   falling back to the placeholders in `config/e2e.defaults.json`. In CI they are set through
   the `ORG_GRADLE_PROJECT_e2eApplicationId` and `ORG_GRADLE_PROJECT_e2eAdgeistAppId`
   environment variables, so real values are never committed.
5. Adds the `com.adgeistkit.ads.ADGEIST_APP_ID` `<meta-data>` entry to
   `android/app/src/main/AndroidManifest.xml`, using that placeholder.
6. Copies `overlay/` into the app (see [The E2E screen](#the-e2e-screen)).
7. Runs `yarn install` and checks that `node_modules/react-native` is the requested version.

The Java/Kotlin `namespace` stays `ai.adgeist.e2e` in every app; only `applicationId` changes.
Each app keeps the template's release build type, which signs with the debug keystore.

To build an app's release APK (one ABI is enough for an emulator):

```
cd apps/rn-0.77/android
./gradlew assembleRelease -PreactNativeArchitectures=arm64-v8a
```

Use `x86_64` instead of `arm64-v8a` on an Intel machine or a CI emulator.

## Installing the SDK

```
yarn install-sdk qa
yarn install-sdk 0.0.34-qa
yarn install-sdk qa --app rn-0.77
yarn install-sdk 0.0.40-qa --check
```

Installs `@thealteroffice/react-native-adgeist` at one exact version in the apps listed in
`config/matrix.json`, or only in the apps given with `--app` (`rn-0.77` or `0.77`, repeatable).

1. Resolves the argument against the npm registry. A dist-tag (`qa`, `latest`, `beta`) becomes
   its exact version; an exact version must be published. Otherwise it stops with
   `... is not available on npm` and lists the current dist-tags, before touching any app.
2. In each app, checks that Yarn classic is active, then runs
   `yarn add @thealteroffice/react-native-adgeist@<version> --exact`, which updates the app's
   `package.json` and `yarn.lock`.
3. Checks that `node_modules/@thealteroffice/react-native-adgeist` has exactly that version.

`--check` stops after step 1 and prints the exact version. CI uses it to test whether a
newly published version is available yet. Every run ends with `Installed: N, failed: N`;
the exit code is non-zero if the version is not available or any app fails.

The committed apps carry a baseline SDK version, currently `0.0.39`. Versions before it
(for example `0.0.34-qa`) have a different `HTML5AdView` API without `onAdEvent`, which the E2E
screen depends on.
CI installs the requested version on top of it for each run without committing it.

`-beta` versions use a snapshot of the native Android SDK and need the Sonatype snapshot
repository to build; the script prints a warning for them. `-qa` and release versions use the
native SDK from Maven Central.

## The E2E screen

Every app opens directly on one screen, `overlay/App.tsx`, integrated the way a publisher would:

- `AdgeistProvider` with no backend override (the `-qa` package has the QA backend built in) and no
  `customAdgeistAppID` (the app ID comes from the `ADGEIST_APP_ID` manifest entry).
- One `HTML5AdView` inside it, using the ad unit and size from the app's `e2e.config.json`:
  `adSize` for a fixed ad unit, or `adIsResponsive` inside a box of `adSize.height` for a
  responsive one.
- `onAdEvent` records every event. A status panel above the ad summarizes them, and a log below
  the ad lists each event's code, type, message and reason.

### Status panel and test IDs

The panel sits above the ad so it is always on screen. Maestro reads it by `testID` (exposed as
the Android resource ID) and checks the exact text.

| `testID` | Text | Meaning |
|---|---|---|
| `e2e-root` | (whole screen) | Present once the app has launched: the **app launches** check |
| `status-init` | `init: initializing` / `init: initialized` / `init: error: <message>` | `AdgeistProvider` state |
| `status-ad-rendered` | `ad rendered: no` → `ad rendered: yes` | `yes` once `AL1` (`AD_LOADED`) arrives: the **ad rendered** check |
| `status-click-handled` | `click handled: no` → `click handled: yes` | `yes` once `AI1` (`AD_CLICKED`) arrives: the **click handled** check |
| `status-unexpected` | `unexpected: none` or `unexpected: AE1, AW6` | Every distinct `AE*`, `RWAE1` or `AW*` code received, except allowed warnings |
| `event-log` | `events: none` or `events: AL1, AI1` | Every code received, in order |
| `ad-container` | (the ad) | The box around `HTML5AdView`, used to tap the ad |

Allowed warnings are listed in `ALLOWED_WARNING_CODES` in `overlay/App.tsx`. It is empty, so any
warning counts as unexpected. Events are kept in React state, so the panel keeps its values
while the app is in the background, for example after a tap opens a browser.

`overlay/` is the only source of the screen. Change it there, then copy it into the apps:

```
yarn apply-overlay
yarn apply-overlay --app rn-0.77
```

`generate-app` applies it automatically, so regenerated apps get the same screen.

### Ad unit configuration

Each app reads `e2e.config.json`, which is git-ignored and must exist before the app is built,
because the release build bundles it into the APK:

```
export ADGEIST_E2E_AD_UNIT_ID=<ad unit id>
export ADGEIST_E2E_AD_RESPONSIVE=false
export ADGEIST_E2E_AD_WIDTH=320
export ADGEIST_E2E_AD_HEIGHT=480
yarn write-e2e-config
```

Any variable that is not set falls back to `config/e2e.defaults.json`, which holds placeholders.
With the placeholder ad unit the app still starts, but the ad request is rejected (for example
`AW6`), which is enough to check the integration is wired up. The ad unit ID is printed as
`env (hidden)` and is never written anywhere except the git-ignored `e2e.config.json`.

The AdGeist app ID and the package name are not in `e2e.config.json`; they are Gradle
properties (see [Generating an app](#generating-an-app)):

```
cd apps/rn-0.77/android
./gradlew assembleRelease -PreactNativeArchitectures=arm64-v8a \
  -Pe2eAdgeistAppId=<app id> -Pe2eApplicationId=<package name>
```

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

- Node 20.19.4 or newer (React Native 0.81+ requires it, and Yarn classic enforces it)
- Yarn classic 1.x
- JDK 17
- Android SDK with an API 35 `google_apis` x86_64 system image
- Maestro CLI

## Secrets

Committed values are placeholders. The real AdGeist app ID, package name and ad unit ID are
provided at build time only, and are never committed, logged or uploaded as artifacts.
