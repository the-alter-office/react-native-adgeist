# AdGeist React Native SDK: E2E Matrix

End-to-end tests for [`@thealteroffice/react-native-adgeist`](https://www.npmjs.com/package/@thealteroffice/react-native-adgeist),
run against the React Native versions that publishers actually use.

## Why this exists

Publishers integrate the AdGeist SDK into apps built on many different React Native versions,
and we cannot ask them to upgrade. A release that works on the latest React Native can still
break an app on an older one: a build failure, a crash on launch, or an ad that never renders.
Unit tests and a single example app don't catch that.

This E2E suite answers one question before every SDK release: **does the new SDK version work in a
real app on each React Native version our publishers run?**

## How it works: matrix testing

- **The matrix.** One test app per React Native minor line (0.77, 0.78, …). Each app uses the
  patch version of its line with the most npm downloads, so we test what host apps really run.
  The list moves forward as new React Native versions gain users.
- **Real apps.** Each app is a plain React Native app with the SDK installed from npm, the same way
  a publisher installs it. It has a few screens, each rendering a different ad format (companion,
  banner, display).
- **The same checks in every app, in order.** A step only runs if the previous one passed:
  - **Install:** the SDK version under test installs into the app without errors
  - **Build:** the app builds as a release APK (Android) or a release simulator app (iOS),
    including the SDK's native code
  - **Deploy:** the app installs on an Android emulator or an iOS simulator
  - **Run**, driven by [Maestro](https://maestro.mobile.dev):
    - the app launches and the SDK initializes
    - each ad renders
    - tapping an ad is handled
- **When.** The matrix runs after an SDK version is published to the QA environment and before it
  is promoted to production. A failure names the React Native version where the SDK broke.

## Package manager: npm

Use **npm** for everything in this E2E suite, both its scripts and the generated apps.
Don't use Yarn or pnpm: the apps are installed and their lockfiles (`package-lock.json`) written
with npm, and mixing package managers produces conflicting lockfiles and installs.

Run the scripts with `npm run`.

## Configuration: `.env`

All AdGeist values the apps need are kept in one file, `.env`, next to `package.json`. It is
git-ignored and never committed; each person creates their own, and CI gets the same values from
GitHub secrets.

```
ADGEIST_E2E_APP_ID=
ADGEIST_E2E_PACKAGE_NAME=
ADGEIST_E2E_BUNDLE_ID=

ADGEIST_E2E_AD1_UNIT_ID=
ADGEIST_E2E_AD1_RESPONSIVE=
ADGEIST_E2E_AD1_WIDTH=
ADGEIST_E2E_AD1_HEIGHT=

ADGEIST_E2E_AD2_UNIT_ID=
ADGEIST_E2E_AD2_RESPONSIVE=
ADGEIST_E2E_AD2_WIDTH=
ADGEIST_E2E_AD2_HEIGHT=

ADGEIST_E2E_AD3_UNIT_ID=
ADGEIST_E2E_AD3_RESPONSIVE=
ADGEIST_E2E_AD3_WIDTH=
ADGEIST_E2E_AD3_HEIGHT=
```

Write each line as `KEY=value`, with no spaces around `=`. A variable set in your shell overrides
the value in `.env`. The scripts, the app build and the Maestro tests all read this file
themselves, so nothing needs to be exported. After changing an ad value, rebuild the app (for
example `npm run run:release -- --app 0.77`); the values are built into the app.

## Choosing the React Native versions: `update-matrix`

**Why.** We want to test the React Native versions publishers actually run, not just the newest
one. The best public signal for that is how often each version is downloaded from npm.

**What it does.** `npm run update-matrix` reads last week's npm download counts for
`react-native`, and for each of the newest 10 minor lines picks the patch version with the most
downloads. It writes the result to `matrix.json`: one entry per line, with the chosen version and
the app folder (`apps/rn-<line>`) that tests it. Every other script reads `matrix.json` to know
which apps exist and which version each one runs.

**When to use it.**
- Once, before generating the apps for the first time.
- Whenever you want to check whether publishers have moved to a different patch of a line, for
  example before a release.

`matrix.json` is only rewritten when a line was added or removed, or a line's version changed, and
the script prints those changes. When a new React Native line comes out, the window moves: the new
line is added and the oldest one dropped. The window size (10) is `LINE_COUNT` in
`scripts/update_matrix.js`.

**Weekly update.** The `E2E matrix update` workflow runs this every Monday on `dev`. If anything
changed, it runs `create-apps -- --prune` (creates new and changed apps, deletes dropped ones),
integrates the SDK into those apps, opens or updates a PR to `dev`, and posts the PR link to Slack.
A new line gets the latest `react-native-screens` and `react-native-safe-area-context` (the
`default` versions in `template/dependencies.json`), and `integrate-sdk` saves the installed
versions under `lines` for that line, so recreating its app later keeps versions that work with it.

**Skipped versions.** `SKIPPED_VERSIONS` in `scripts/update_matrix.js` lists patches that are never
picked. React Native 0.80.0–0.80.2 have a Gradle bug, fixed in 0.80.3: the app's C++ build can start
before libraries have generated their code, so the SDK and any other library with generated code
(react-native-screens, react-native-safe-area-context) fail to build. It is a React Native bug, so the
matrix tests the most downloaded patch that isn't skipped. The SDK-side workaround is kept, commented
out, in the SDK's `android/build.gradle`.

## Creating the apps: `create-apps`

**Why.** Each React Native line needs its own real app, created the same way a publisher starts a
new React Native project, so the SDK is tested in exactly the setup host apps use.

**What it does.** `npm run create-apps` creates one app per line in `matrix.json`, in
`apps/rn-<line>`, using that line's React Native version and the official React Native template.
It then prepares the app's Android build to take the package name (`ADGEIST_E2E_PACKAGE_NAME`)
and AdGeist app ID from `.env`, and its iOS project to take the bundle ID
(`PRODUCT_BUNDLE_IDENTIFIER = $(ADGEIST_E2E_BUNDLE_ID)`) and AdGeist app ID (`ADGEIST_APP_ID` in
`Info.plist` = `$(ADGEIST_E2E_APP_ID)`) as build settings, and target iOS 15.6, the minimum the
SDK supports. It does not install the SDK; that is the next step.

Apps that are on the right version but miss one of these preparations are patched in place, not
recreated.

**When to use it.**
- After `update-matrix`, to create the apps for the first time.
- After `update-matrix` changed a line's version: that app is recreated at the new version.
- When an app is broken or half-created: it is recreated.

Apps that are already complete and on the right version are left alone, so running it again is
safe. To recreate specific apps anyway, pass `--app <line>` and `--replace`. `--prune` also deletes
`apps/rn-*` folders whose line is no longer in `matrix.json`. See
[CONTRIBUTING.md](CONTRIBUTING.md) for what happens in each case.

## Installing the SDK: `integrate-sdk`

**Why.** We test a specific SDK release, installed from npm exactly as a publisher would install
it, inside apps that use it the way publishers do.

**What it does.** `npm run integrate-sdk -- <version or dist-tag>` installs that SDK version into
the apps. A dist-tag such as `qa` or `latest` is first turned into its exact version. For each app
it copies in the E2E screens from `template/app/` (one screen per ad format), adds the packages
those screens need, sets the SDK to the exact version and runs `npm install`, then checks that the
installed SDK is that version. It is the same for Android and iOS; the iOS CocoaPods are
installed later, when the app is run with `--platform ios`.

**When to use it.**
- After `create-apps`, to put the SDK into new apps.
- Whenever you test a new SDK release, for example after a version is published to QA.
- After changing anything in `template/`, so the apps get the updated screens.

**Testing an unpublished SDK build.** Run `npm pack` in the SDK repo root, then pass the `.tgz` instead
of a version: `npm run integrate-sdk -- ../thealteroffice-react-native-adgeist-0.0.39.tgz --app 0.80`.
The app then installs the SDK from that file. Don't commit an app integrated this way; integrate it
again with a published version first.

Running it again with the same version is safe. Without `--app` it works on every app in
`matrix.json`; pass `--app <line>` for specific apps. See [CONTRIBUTING.md](CONTRIBUTING.md) for
what happens in each case.

## Running and testing an app

**Why.** Every app uses the same package name (Android) and bundle ID (iOS), so only one can be installed on a device at a time.
These scripts run one app at a time, and always remove the previously installed E2E app first.

| Script | What it does |
|---|---|
| `npm run run:metro -- --app <line>` | Starts Metro and runs a debug build with live reload. Use it while working on the app's screens |
| `npm run run:release -- --app <line>` | Builds a release APK, installs it and opens the app. This is the build the tests use |
| `npm run maestro:release -- --app <line>` | Does `run:release`, then runs the Maestro tests. Results go to `results/<platform>/rn-<line>/maestro` |
| `npm run uninstall` | Removes the installed E2E app from the device |

Add `--platform android` or `--platform ios` to any of them, for example
`npm run maestro:release -- --app 0.79 --platform ios`. Without it, the script asks
`Platform (android/ios):` in the terminal.

**When to use them.** After `integrate-sdk`. Use `maestro:release` to test an SDK release on one
React Native line, `run:release` to check an app by hand, and `run:metro` while changing the
template screens.

Connect one emulator or device before running them. With more than one connected, set
`ANDROID_SERIAL=<serial>`. See [CONTRIBUTING.md](CONTRIBUTING.md) for what happens in each case.
`adb devices` lists the serials in its first column; only rows with the state `device` can be used:

```bash
adb devices                    # emulator-5554   device
ANDROID_SERIAL=emulator-5554 npm run maestro:release -- --app 0.79
```

Each check (integrate, SDK install, Pods on iOS, build, install, launch, Maestro) is saved to
`results/<platform>/summary.json`. `scripts/ci.sh` runs every app (set `PLATFORM=android` or `PLATFORM=ios`) and,
in CI, shows the table on the run's Summary page.

## iOS

Needs a Mac with Xcode, Ruby with Bundler (for CocoaPods) and Maestro. Boot one simulator first:

```bash
xcrun simctl boot "iPhone 17" && open -a Simulator
npm run integrate-sdk -- qa --app 0.79
npm run maestro:release -- --app 0.79 --platform ios
PLATFORM=ios SDK_VERSION=qa ./scripts/ci.sh          # every app, like CI
```

With more than one simulator booted, set `IOS_SIMULATOR_UDID=<udid>`. The UDID is the value in
brackets in `xcrun simctl list devices booted` (`xcrun simctl list devices` shows every simulator,
booted or not):

```bash
xcrun simctl list devices booted   # iPhone 17 (97103CB5-8FAC-4B18-84DA-B0C2F8783AE1) (Booted)
IOS_SIMULATOR_UDID=97103CB5-8FAC-4B18-84DA-B0C2F8783AE1 npm run maestro:release -- --app 0.79 --platform ios
```

Before building, the run
installs the app's CocoaPods (`bundle install`, then `bundle exec pod install` in `ios/`),
recorded as the **Pods** check. The release build runs
`xcodebuild` for the simulator without code signing and passes `ADGEIST_E2E_APP_ID` and
`ADGEIST_E2E_BUNDLE_ID` as build settings, so `.env` stays the single source of these values. A
launch crash report is copied to `results/ios/rn-<line>/crash.log`.

The Maestro tests can also be run on their own against an installed app; see
[maestro/README.md](maestro/README.md).

## Scope

- Android and iOS (simulator), against the QA backend.

## CI

`.github/workflows/e2e.yml` runs on a push to `qa`, or by hand from the Actions tab (with an
optional `sdk_version`). It has four jobs:

| Job | Runner | What it does |
|---|---|---|
| `pack` | Ubuntu | Push only: builds the QA SDK (`yarn configure-build qa --publish`, stable AdgeistKit, `npm pack`) and uploads the `.tgz` as the `sdk-tgz` artifact |
| `android` | Ubuntu | Boots an API 35 emulator and runs `PLATFORM=android scripts/ci.sh`; results in the `e2e-results-android` artifact |
| `ios` | macOS | Selects Xcode 26, boots an iPhone simulator and runs `PLATFORM=ios scripts/ci.sh`; results in the `e2e-results-ios` artifact |
| `report` | Ubuntu | Reads both `summary.json` files, writes the combined table to the run's Summary page and sends one Slack message |

`android` and `ios` run in parallel and test the same `.tgz` on a push; on a manual run they install
`sdk_version`, or else the `E2E_SDK_VERSION` repository variable. The values in `.env` come from
repository variables of the same names, including both `ADGEIST_E2E_PACKAGE_NAME` and
`ADGEIST_E2E_BUNDLE_ID`. Slack uses the `SLACK_AUTOMATION_TEST_WEBHOOK_URL` secret; without it the
report job skips the message.
- The checks confirm that the SDK reports an ad as rendered and a click as handled. They do not
  verify that impressions or clicks were recorded by the backend.
