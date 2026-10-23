# Contributing

This guide is for people working on the E2E suite itself: its scripts, the template app and the
Maestro tests. For what the suite is and why it exists, start with the [README](README.md).

A few rules for every change:

- Use **npm** only. Arguments for a script go after `--`, for example
  `npm run create-apps -- --app 0.77`. Without `--`, npm keeps flags such as `--replace` for itself
  and the script never sees them.
- Keep paths relative to the suite folder, never to the git repository root.
- Never commit `.env`.

## How `.env` reaches each part

`.env` (next to `package.json`) is the only place values are set. Four parts read it, each on its
own, so nothing ever has to be exported. In every one, a variable already set in the environment
(your shell, or CI secrets) wins over `.env`.

| Part | Reads | How |
|---|---|---|
| Node scripts (`scripts/*.js`, `maestro/scripts/run.js`) | everything | `scripts/env.js`: `loadEnv()` loads `.env` into `process.env` with Node's `process.loadEnvFile`; `requireEnv()` also stops with the list of missing required values. Programs a script starts (Gradle, Maestro) inherit that environment |
| Android build (Gradle) | `ADGEIST_E2E_PACKAGE_NAME`, `ADGEIST_E2E_APP_ID` | `create-apps` adds `e2eDotEnv` and `e2eValue` to `android/app/build.gradle`. They read the environment, or else `.env`, and set `applicationId` and the manifest's `ADGEIST_APP_ID` entry, which the native SDK reads. A missing value stops the build with `… is not set` |
| The app's JavaScript | the `ADGEIST_E2E_AD<n>_*` values | `react-native-dotenv` in the app's `babel.config.js` reads `.env` when the JavaScript is bundled. `src/config.ts` imports the values from `@env`, and the plugin replaces them with the actual strings, so they are built into the app |
| Maestro tests | `ADGEIST_E2E_PACKAGE_NAME` | `maestro/scripts/run.js` passes it to Maestro as `-e APP_ID=…`; every flow uses `appId: ${APP_ID}` |

Because the ad values are built into the app, two caches could keep old values after `.env`
changes. `create-apps` handles both in `build.gradle`: `.env` is an input of the JavaScript bundle
task, so Gradle bundles again when it changes, and `extraPackagerArgs = ["--reset-cache"]` makes
Metro start each bundle with an empty cache. With `run:metro`, Metro is also started with
`--reset-cache`.

**Adding a variable**

1. Add it to `.env`, and to the variable list and table in the README.
2. If it is required, add it to `REQUIRED` in `scripts/env.js`.
3. If the app's JavaScript needs it, import it from `@env` in `template/app/src/config.ts` and
   declare it in `template/app/src/types/env.d.ts`, then run `integrate-sdk` so the apps get the
   change.
4. If Gradle needs it, read it with `e2eValue("…")` in the Gradle code that `scripts/create_apps.js`
   adds, then recreate the apps.
5. Add it to CI's secrets.

## `create-apps` scenarios

What `npm run create-apps` does for each selected line in `matrix.json`, depending on the state of
`apps/rn-<line>`:

- **Missing:** the app is created.
- **Up to date** (its `react-native` version matches `matrix.json` and the Android patches are in
  place): the app is skipped.
- **Anything else** (an older version, a half-created folder, a missing patch): the app is deleted
  and created again.
- With **`--replace`**: every selected app is deleted and created again, whatever its state.

The examples assume `matrix.json` lists lines 0.77 to 0.86.

**Normal runs**

| # | Command | State before | What happens |
|---|---|---|---|
| 1 | `npm run create-apps` | no apps | All apps are created, in `matrix.json` order |
| 2 | `npm run create-apps` | some apps up to date | Those are skipped (`⏭️ … up to date`); the others are created |
| 3 | `npm run create-apps` | all apps up to date | All skipped. Nothing changes |
| 4 | `npm run create-apps` | `update-matrix` changed a line's version | That app is recreated at the new version (`♻️ … not on React Native …`) |
| 5 | `npm run create-apps` | an app was left half-created (failed run, Ctrl+C) | That app is recreated (`♻️ … incomplete …`) |
| 6 | `npm run create-apps -- --replace` | any | Every app is deleted and created again |
| 7 | `npm run create-apps -- --app 0.77` | 0.77 missing, outdated or incomplete | Only 0.77 is created |
| 8 | `npm run create-apps -- --app 0.77` | 0.77 up to date | 0.77 is skipped. Nothing changes |
| 9 | `npm run create-apps -- --app 0.77 --replace` | 0.77 exists | 0.77 is deleted and created again; other apps are untouched |
| 10 | `npm run create-apps -- --app 0.77 --replace` | 0.77 missing | 0.77 is created (`--replace` has nothing to delete) |
| 11 | `npm run create-apps -- --app 0.77 --app 0.81` | any | Each selected app follows rows 7 to 10; other apps are untouched |
| 12 | `npm run create-apps -- --app rn-0.77` | any | Same as `--app 0.77` |

**Errors (nothing is created)**

| # | Command or state | Result |
|---|---|---|
| 13 | `matrix.json` is missing | `matrix.json not found. Run npm run update-matrix first.` |
| 14 | `--app 0.99` (not in `matrix.json`) | `0.99 is not in matrix.json`. The whole run stops, even if other `--app` values are valid |
| 15 | `--app` without a value, or an unknown option (`--all`, `--force`) | `Unknown argument: …`, followed by the usage |
| 16 | `npm run create-apps --replace` (no `--`) | npm keeps `--replace` for itself, so this runs as rows 1 to 5, without replacing |

**When something fails part-way**

| # | Situation | Result |
|---|---|---|
| 17 | One app fails (no network, template missing, layout changed) | `❌ apps/rn-0.83: <reason>`. The remaining apps still run; the run ends with `Failed: apps/rn-0.83` |
| 18 | You run it again after row 17 | The half-created app is detected as incomplete and recreated |
| 19 | An app is recreated (with `--replace`, or because it was outdated) and creating it fails | The old folder was already deleted: that line has no app until a later run succeeds |

**Not handled**

| # | Situation | Result |
|---|---|---|
| 20 | A folder in `apps/` that is not in `matrix.json` (for example an old `rn-0.76`) | Never touched, even with `--replace`, and not reported |
| 21 | The same `--app` given twice | Processed twice: created, then skipped. With `--replace`: created, then deleted and created again |

## `integrate-sdk` scenarios

What `npm run integrate-sdk -- <version or dist-tag>` does:

- The version or dist-tag is **required**. A dist-tag (`qa`, `latest`, `beta`) is turned into its
  exact version first. This happens once, before any app is touched.
- Without `--app`, it works on every app listed in `matrix.json`; with `--app`, only on those.
- For each app: the files in `template/app/` are copied over the app, `package.json` gets the
  template packages and the SDK at the exact version, `npm install` runs, and the installed SDK
  version is checked.
- If one app fails, the others are still processed and the run ends with `Failed: <apps>`.

The examples assume `matrix.json` lists lines 0.77 to 0.86 and the dist-tags are `qa=0.0.34-qa`,
`latest=0.0.39`, `beta=0.0.39-beta.1`.

**Normal runs**

| # | Command | State before | What happens |
|---|---|---|---|
| 1 | `npm run integrate-sdk -- 0.0.39` | all apps created | Every app gets the template and SDK `0.0.39` |
| 2 | `npm run integrate-sdk -- qa` | all apps created | `qa` resolves to `0.0.34-qa`; every app gets that exact version |
| 3 | `npm run integrate-sdk -- latest` / `beta` | all apps created | Same, with `0.0.39` / `0.0.39-beta.1` (beta also prints a warning, see row 24) |
| 4 | `npm run integrate-sdk -- 0.0.39 --app 0.77` | 0.77 created | Only 0.77 is integrated; other apps are untouched |
| 5 | `npm run integrate-sdk -- qa --app 0.77 --app 0.81` | both created | Both get `0.0.34-qa` |
| 6 | `npm run integrate-sdk -- 0.0.39 --app rn-0.77` | 0.77 created | Same as `--app 0.77` |
| 7 | `npm run integrate-sdk -- --app 0.77 0.0.39` | 0.77 created | Same as row 4; the order of arguments doesn't matter |
| 8 | The same command again | already integrated with that version | Template copied again, `package.json` unchanged, quick `npm install`. Safe to repeat |
| 9 | A different version (for example `qa` after `0.0.39`) | integrated with another version | The SDK is switched to the new version (upgrade or downgrade) |
| 10 | Any version, after editing `template/` | integrated | The changed template files are copied and any changed packages installed |
| 11 | `npm run integrate-sdk -- 0.0.39` | only some apps created | The created apps are integrated; every app in `matrix.json` that isn't created yet fails with row 20's message, and the run ends with `Failed: …`. Use `--app` to integrate only the apps you have |

**Errors (no app is touched)**

| # | Command | Result |
|---|---|---|
| 12 | `npm run integrate-sdk` | `An SDK version or dist-tag is required` |
| 13 | `npm run integrate-sdk -- --app 0.77` | Same as row 12 |
| 14 | `npm run integrate-sdk -- 9.9.9-qa` | `… is not a published version or dist-tag. Dist-tags: …` |
| 15 | A range or partial version (`0.0`, `^0.0.38`) | Same as row 14, because it matches more than one version |
| 16 | Two versions (`0.0.39 qa`) | `Unknown argument: qa` |
| 17 | An unknown option, or `--app` without a value | `Unknown argument: …`, followed by the usage |
| 18 | No `--app` and no `matrix.json` | `matrix.json not found. Run npm run update-matrix first, or pass --app.` |
| 19 | `npm run integrate-sdk 0.0.39 --app 0.77` (no `--`) | npm keeps `--app` for itself and passes `0.0.39 0.77`: `Unknown argument: 0.77` |

**Per-app problems (the other apps continue; the run ends with `Failed: …`)**

| # | Situation | Result |
|---|---|---|
| 20 | The app is not created (or `--app 0.99`) | `apps/rn-0.99: does not exist. Run npm run create-apps first.` |
| 21 | `npm install` fails (no network, a peer dependency conflict `ERESOLVE`) | `Command failed: npm install …`. The app's `package.json` is already updated; running again retries the install |
| 22 | The installed SDK is not the requested version | `installed … is X, expected Y` |

**Not handled**

| # | Situation | Result |
|---|---|---|
| 23 | No network at all | Looking up the version fails before any app is touched, with a raw Node error instead of a clear message |
| 24 | A beta version | It installs, with a warning, but nothing adds the Sonatype snapshot repository the beta native SDK needs, so the app's build fails later |
| 25 | An app that was not created by `create-apps` (missing Android patches) | It installs; the problem only shows when the app is built |
| 26 | A file removed from `template/app/` | It stays in the apps; copying only adds and overwrites files |
| 27 | `--app` for a line not in `matrix.json` whose folder exists | Integrated anyway; `--app` is not checked against `matrix.json` |
| 28 | The same `--app` given twice | Processed twice |

## `run:metro`, `run:release`, `maestro:release` and `uninstall` scenarios

All four come from `scripts/run_app.js` and work on **one app at a time**, because every app has
the same package name (`ADGEIST_E2E_PACKAGE_NAME`).

Before doing anything, `run:metro`, `run:release` and `maestro:release`:

- check that the required values are in `.env`
- check that `--app <line>` is given, the line is in `matrix.json`, the app is created and the SDK
  is installed
- pick the device: `ANDROID_SERIAL` if set, otherwise the only connected device
- uninstall the previously installed E2E app, whichever line it was

Any failing step stops the run with that step's error.

**Normal runs**

| # | Command | What happens |
|---|---|---|
| 1 | `npm run run:release -- --app 0.77` | Uninstalls the E2E app, builds a release APK for the device's CPU type, installs it and opens it |
| 2 | `npm run maestro:release -- --app 0.77` | Everything in row 1, then the Maestro tests. Results go to `results/rn-0.77/maestro` |
| 3 | `npm run run:metro -- --app 0.77` | Uninstalls the E2E app, starts Metro in this terminal, waits until it is ready, then builds, installs and opens a debug build. Metro keeps running (live reload) until Ctrl+C |
| 4 | `npm run uninstall` | Removes the installed E2E app. If none is installed, it says so and succeeds |
| 5 | `npm run run:release -- --app 0.81` after testing 0.77 | 0.77 is uninstalled and 0.81 installed. Only one E2E app is ever on the device |
| 6 | `npm run run:release -- --app rn-0.77` | Same as `--app 0.77` |
| 7 | Two devices connected, `ANDROID_SERIAL=emulator-5556 npm run run:release -- --app 0.77` | Runs on `emulator-5556` only |

**Errors (nothing is uninstalled, built or installed)**

| # | Situation | Message |
|---|---|---|
| 8 | No `--app` | `--app <x.y> is required` |
| 9 | `--app` without a value, `--app` given twice, or an unknown option | `Unknown argument: …` |
| 10 | The line is not in `matrix.json` | `0.99 is not in matrix.json` |
| 11 | `matrix.json` is missing | `matrix.json not found. Run npm run update-matrix first.` |
| 12 | The app is not created | `apps/rn-0.78 does not exist. Run npm run create-apps -- --app 0.78 first.` |
| 13 | The SDK is not installed in the app | `apps/rn-0.78 has no SDK installed. Run npm run integrate-sdk -- <version> --app 0.78 first.` |
| 14 | A required value is missing in `.env` | `Missing values: …. Add them to .env at the repo root.` |
| 15 | No device or emulator connected | `No device or emulator connected.` |
| 16 | More than one device and no `ANDROID_SERIAL` | `Set ANDROID_SERIAL to one of: …` |
| 17 | `run:metro` while another Metro uses port 8081 | `Port 8081 is already in use, probably by another Metro. …` |
| 18 | `npm run run:release --app 0.77` (no `--`) | npm keeps `--app` for itself, so the script sees no `--app`: row 8 |

**Failures during a run (the run stops)**

| # | Situation | Result |
|---|---|---|
| 19 | The build fails (Gradle, CMake, Kotlin errors) | The Gradle error is shown and the run stops. Nothing is installed; the previous E2E app is already uninstalled |
| 20 | `adb install` fails (for example, the APK's CPU type doesn't match the device) | The adb error is shown and the run stops |
| 21 | `run:metro`: Metro exits while starting, or isn't ready within 60 seconds | `Metro exited with code … before it was ready` or `Metro did not start within 60 seconds`. Metro is stopped and nothing is built |
| 22 | `run:metro`: the debug build fails | Metro is stopped too |
| 23 | `maestro:release`: a test fails | The app stays installed; the failure is in the console and in `results/rn-<line>/maestro` |

**Not handled**

| # | Situation | Result |
|---|---|---|
| 24 | `run:metro` with more than one device | `ANDROID_SERIAL` is set, but the React Native CLI may still install on every connected device. Connect one device for `run:metro` |
| 25 | The emulator is locked or still booting | The app may not open, and Maestro tests fail. Unlock it or wait until it has booted |
| 26 | Several E2E apps in a row (all lines) | Not supported by these scripts; CI will run the lines one after another, using `uninstall` between them |
