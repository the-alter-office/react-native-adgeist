# Maestro tests

End-to-end UI tests for the E2E apps, written in [Maestro](https://maestro.mobile.dev). They drive
the app on an Android emulator or device the way a user would: open a screen, wait for the ad, tap
it.

## What they check

The tests run against whichever E2E app is installed, so the same tests cover every React Native
version in the matrix.

| Test | Checks |
|---|---|
| `STARTUP-01` SDK initializes when the app launches | The app starts with cleared state and the SDK initializes without errors. It runs first and is the only test that launches the app |
| `COMPANION-01` Companion ad lifecycle | From Home, opens the companion ad screen; the ad loads and is shown; tapping it is handled; no unexpected error or warning events |
| `BANNER-01` Banner ad lifecycle | The same for the banner ad |
| `DISPLAY-01` Display ad lifecycle | The same for the display ad |

Every step has a label, so a failure names the test and the exact step, for example
`BANNER-01 › Step 2: tap the banner ad`. A failing test doesn't stop the others.

## Configuration

The tests need one value: the app's package name, so Maestro knows which app to launch and check.
It comes from `ADGEIST_E2E_PACKAGE_NAME` in the `.env` file next to the root `package.json` (see
"Configuration: `.env`" in the [root README](../README.md)).

Inside the tests it is called `APP_ID`. Every test and subflow starts with `appId: ${APP_ID}`. The
runner reads `ADGEIST_E2E_PACKAGE_NAME` from `.env` and passes it to Maestro as
`-e APP_ID=<package name>`; with the Maestro CLI or Maestro Studio you set `APP_ID` yourself.

The ad unit IDs in `.env` are not used by the tests; they are built into the app.

## Running them

The app must already be installed on the device (for example with
`npm run run:release -- --app 0.77`), and `.env` must contain `ADGEIST_E2E_PACKAGE_NAME`.

**With the runner** (recommended):

```
node maestro/scripts/run.js
node maestro/scripts/run.js --include-tags banner
```

It reads the package name from `.env`, runs every test, and writes the results to
`results/maestro/`: `report.xml` (JUnit) and a `screenshots/` folder with the final screen of each
test. Any other option is passed to Maestro (`--include-tags`, `--device`, …).
`npm run maestro:release` builds and installs an app, then runs this same runner.

**With the Maestro CLI directly:**

```
maestro test maestro/.maestro -e APP_ID=<package name>
```

**In Maestro Studio:** open the `maestro/.maestro` folder and set `APP_ID` to the package name in
the environment settings, then run a test from `flows/`.

## Layout

```
maestro/
├── README.md
├── scripts/
│   └── run.js                  the runner
└── .maestro/                   Maestro workspace
    ├── config.yaml             which files are tests; STARTUP-01 runs first
    ├── flows/                  the tests, one folder per area
    │   ├── startup/sdk_initializes.yaml
    │   ├── companion/lifecycle.yaml
    │   ├── banner/lifecycle.yaml
    │   └── display/lifecycle.yaml
    └── subflows/               reusable steps, never run on their own
```

The three lifecycle tests are identical apart from the ad format: they set `KIND` (`companion`,
`banner` or `display`) and the subflows use it to find that screen's elements.

## Adding a test

1. Put it in the folder of the area it tests, for example `flows/banner/persistence.yaml`. Every
   file one folder below `flows/` is picked up automatically.
2. Give it a `name` starting with an ID (`BANNER-02 …`), the tags `android` and its area, and
   `env.TEST_ID` for its screenshot.
3. Build it from labelled `runFlow` steps that call the subflows. Add a subflow when a new step is
   needed in more than one test.
4. Add it to the table above.
