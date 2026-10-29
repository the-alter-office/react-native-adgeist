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
  - **Build:** the app builds as a release APK, including the SDK's native Android code
  - **Deploy:** the APK installs on an Android emulator
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

## Creating the apps: `create-apps`

**Why.** Each React Native line needs its own real app, created the same way a publisher starts a
new React Native project, so the SDK is tested in exactly the setup host apps use.

**What it does.** `npm run create-apps` creates one app per line in `matrix.json`, in
`apps/rn-<line>`, using that line's React Native version and the official React Native template.
It then prepares the app's Android build to take the package name and AdGeist app ID from `.env`.
It does not install the SDK; that is the next step.

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
installed SDK is that version.

**When to use it.**
- After `create-apps`, to put the SDK into new apps.
- Whenever you test a new SDK release, for example after a version is published to QA.
- After changing anything in `template/`, so the apps get the updated screens.

Running it again with the same version is safe. Without `--app` it works on every app in
`matrix.json`; pass `--app <line>` for specific apps. See [CONTRIBUTING.md](CONTRIBUTING.md) for
what happens in each case.

## Running and testing an app

**Why.** Every app uses the same package name, so only one can be installed on a device at a time.
These scripts run one app at a time, and always remove the previously installed E2E app first.

| Script | What it does |
|---|---|
| `npm run run:metro -- --app <line>` | Starts Metro and runs a debug build with live reload. Use it while working on the app's screens |
| `npm run run:release -- --app <line>` | Builds a release APK, installs it and opens the app. This is the build the tests use |
| `npm run maestro:release -- --app <line>` | Does `run:release`, then runs the Maestro tests. Results go to `results/rn-<line>/maestro` |
| `npm run uninstall` | Removes the installed E2E app from the device |

**When to use them.** After `integrate-sdk`. Use `maestro:release` to test an SDK release on one
React Native line, `run:release` to check an app by hand, and `run:metro` while changing the
template screens.

Connect one emulator or device before running them. With more than one connected, set
`ANDROID_SERIAL=<serial>`. See [CONTRIBUTING.md](CONTRIBUTING.md) for what happens in each case.

Each check (integrate, SDK install, build, install, launch, Maestro) is saved to
`results/summary.json`. In CI, `scripts/ci.sh` runs every app and shows the table on the run's
Summary page.

The Maestro tests can also be run on their own against an installed app; see
[maestro/README.md](maestro/README.md).

## Scope

- Android only, against the QA backend.
- The checks confirm that the SDK reports an ad as rendered and a click as handled. They do not
  verify that impressions or clicks were recorded by the backend.
