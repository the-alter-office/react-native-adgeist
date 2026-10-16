# E2E Android matrix plan for `@thealteroffice/react-native-adgeist`

Status: planned, not started. Implementation starts only on explicit approval.

## Ground rules for every phase
- Each phase is approved before it starts. Under CLAUDE.md, approval is also required before creating any file, changing more than 3 files at once, deleting anything, or adding a dependency.
- Claude never commits or pushes. You commit at the end of each phase.
- AdGeist values stay **placeholders** until the real ones are provided. In CI they come only from **GitHub secrets**.

## Target layout

`e2e/matrix` is an **orphan branch**: no library source, because the apps install the SDK from npm.

```
e2e/matrix (orphan branch)
├── README.md                    what this is, how to run locally, what's NOT verified
├── package.json                 script entry points only (no workspaces, no deps)
├── config/
│   ├── matrix.json              line → { version, downloads, share, appDir }
│   └── e2e.defaults.json        placeholders: adUnitId, appId, packageName, adSize/responsive
├── scripts/
│   ├── lib/npm-downloads.js     shared: fetch + filter + group + pick patch
│   ├── resolve-versions.js      Phase 1
│   ├── generate-app.js          Phase 2 (reused by Phase 12)
│   ├── apply-overlay.js         Phases 4–5 (called by generate-app)
│   ├── install-sdk.js           Phase 3
│   ├── write-e2e-config.js      Phase 4
│   ├── run-local.sh             Phase 7
│   ├── advise.js                Phase 10
│   └── slack-notify.js          Phase 11
├── overlay/                     files copied into every app (App.tsx, e2e screen)
├── maestro/                     flows + subflows
└── apps/
    ├── rn-0.77/ … rn-0.86/      one RN app per minor line

main (only workflow YAMLs; workflow_dispatch/schedule must live on the default branch)
└── .github/workflows/
    ├── e2e-android.yml          Phases 8, 9, 11
    ├── e2e-advisory.yml         Phase 10 (monthly)
    └── e2e-regenerate.yml       Phase 12
```

**Local prerequisites:** Node (the version from `.nvmrc`; check that nvm loads in non-interactive shells), Yarn classic 1.x, JDK 17, Android SDK with an API 35 `google_apis` x86_64 system image, and the Maestro CLI.

---

## Phase 0: Branch skeleton
**Goal:** an empty, well-structured `e2e/matrix` branch.

**Steps:**
1. `git worktree add --orphan -b e2e/matrix ../react-native-adgeist-e2e`, used instead of an in-place `git switch --orphan`, so `dev`'s ignored build folders don't end up in the branch. After the first commit, the worktree is removed and the branch is checked out in the main folder. The root-level `/lib/`, `/ios/`, `/android/`, `/example/`, `/plugin/` entries in `.gitignore` hide `dev`'s leftovers when switching.
2. Create the folder layout above.
3. Add `README.md`, `package.json` (scripts only), and `config/e2e.defaults.json` with placeholders.
4. Add a `.gitignore` covering `node_modules`, Android `build/`, the generated `e2e.config.json`, and Maestro output.

**Touches:** new branch; `README.md`, `package.json`, `.gitignore`, `config/e2e.defaults.json`.

**Done:** the branch exists with the skeleton and contains no library files.

**Verify:** `git ls-files` on the branch shows only skeleton files; `main` is unchanged.

## Phase 1: Determine the RN versions
**Goal:** `config/matrix.json` with the most-downloaded patch for each line from 0.77 to 0.86.

**Steps:**
1. `scripts/lib/npm-downloads.js`:
   - Fetch `api.npmjs.org/versions/react-native/last-week`, plus the full version list from `registry.npmjs.org/react-native`, so versions with zero downloads still count.
   - Keep only plain `x.y.z` versions (no `-rc`, no nightlies).
   - Group by minor and compute each patch's downloads and the line's share of the total.
   - Pick the top patch, breaking ties toward the higher patch; if the whole line has zero downloads, pick the latest patch.
2. `scripts/resolve-versions.js --from 0.77 --to 0.86` writes `config/matrix.json` with `{ line, version, downloads, lineShare, appDir, fetchedAt }`.
3. Keep the library module reusable: Phase 10 uses it unchanged.

**Touches:** `scripts/lib/npm-downloads.js`, `scripts/resolve-versions.js`, `config/matrix.json`.

**Done:** `matrix.json` lists 10 lines with one exact version each.

**Verify:** run the script and spot-check 2–3 lines against the "Versions" tab on npmjs.com. Data from 2026-10-14 gave 0.78.0, 0.80.0, 0.83.6 and 0.86.3, but the values change week to week.

## Phase 2: Generator script + the 10 apps
**Goal:** one reproducible script that creates an app for a given RN version, used to create all 10 apps.

**Steps:**
1. `scripts/generate-app.js <x.y.z>`:
   - Run `npx @react-native-community/cli@latest init AdgeistE2E --version x.y.z --directory apps/rn-x.y --pm yarn --skip-git-init --install-pods false`.
   - Check the flags work on each target version; older templates may need different flags.
   - Set the Java/Kotlin `namespace` to a fixed committed value.
   - Make `applicationId` and the manifest `ADGEIST_APP_ID` read from Gradle properties (`e2eApplicationId`, `e2eAdgeistAppId`), defaulting to placeholders. This lets CI inject secrets through `ORG_GRADLE_PROJECT_*` environment variables without committing them.
   - Keep the template's release build type, which already signs with the debug keystore.
   - Keep `ios/` (iOS is out of scope, but the folder costs nothing).
2. You run the script locally for each of the 10 versions from `matrix.json`. That's the "manual" creation, done with the same script as CI.
3. Fill in `appDir` in `matrix.json`.

**Touches:** `scripts/generate-app.js`, `apps/rn-0.77` … `apps/rn-0.86`, `config/matrix.json`.

**Done:** 10 apps exist, each at its exact RN version, and each builds a release APK.

**Verify:** for each app: `yarn install && (cd android && ./gradlew assembleRelease)` succeeds, and `node_modules/react-native/package.json` shows the expected version.

## Phase 3: Install the SDK
**Goal:** every app depends on a specific SDK version and builds with it linked.

**Steps:**
1. `scripts/install-sdk.js <sdkVersion> [--app rn-x.y | --all]`:
   - First check `npm view @thealteroffice/react-native-adgeist@<sdkVersion> version`, and exit with a clear "not available" message if it fails. CI reuses this check.
   - Then run `yarn add @thealteroffice/react-native-adgeist@<sdkVersion> --exact` in each app.
2. Commit a baseline (the current `qa` dist-tag version) so the stored apps are complete. CI overrides it at run time without committing.

**Touches:** `scripts/install-sdk.js`, each app's `package.json` and `yarn.lock`.

**Done:** all 10 apps build release APKs with the SDK autolinked.

**Verify:** `./gradlew assembleRelease` passes in each app, and the installed version in `node_modules/@thealteroffice/react-native-adgeist/package.json` matches. A deliberately bogus version fails with the "not available" message.

## Phase 4: Integrate the SDK (render an ad, wire up `onAdEvent`)
**Goal:** the first screen of every app renders the E2E ad, the way a publisher would integrate it.

**Steps:**
1. `overlay/App.tsx`:
   - `AdgeistProvider` with no domain override (the `-qa` build has the QA domain baked in) and no `customAdgeistAppID` (the app ID comes from the manifest, the documented path).
   - Inside it, `HTML5AdView` on the first screen, with `adUnitID` and `adSize` or `adIsResponsive` read from `e2e.config.json`.
   - `onAdEvent` appends `{ code, type, message }` to state.
2. `scripts/write-e2e-config.js`: writes each app's gitignored `e2e.config.json` from the environment variables (`ADGEIST_E2E_AD_UNIT_ID`, `ADGEIST_E2E_AD_WIDTH`, `ADGEIST_E2E_AD_HEIGHT`, `ADGEIST_E2E_AD_RESPONSIVE`), falling back to `config/e2e.defaults.json`.
3. `scripts/apply-overlay.js`: copies `overlay/` into an app. `generate-app.js` calls it, so regenerated apps come out identical.
4. Apply the overlay to all 10 apps.

**Touches:** `overlay/`, `scripts/write-e2e-config.js`, `scripts/apply-overlay.js`, `scripts/generate-app.js`, `apps/*/App.tsx`.

**Done:** each app opens directly on the ad screen.

**Verify:**
- With placeholders, the app runs and shows a rejection code (`AW6`), which proves the wiring works end to end.
- With real values exported locally, the creative renders.

## Phase 5: Make the screens Maestro-friendly
**Goal:** every check Maestro makes is visible on screen and addressable by ID.

**Steps:**
1. A status panel **above** the ad, so it stays on screen. Each row has a `testID`:
   - `e2e-root`: present once the app has launched
   - `status-init`: "initialized" or "init error: …"
   - `status-ad-rendered`: "ad rendered: yes" once `AL1` arrives
   - `status-click-handled`: "click handled: yes" once `AI1` arrives
   - `status-unexpected`: any `AE*`, `RWAE1`, or `AW*` codes not in the allowlist (the allowlist starts empty)
   - `event-log`: every code received, in order
2. Wrap the ad in `<View testID="ad-container">` so Maestro can tap it.
3. Keep the event state in React state, so it survives the app going to the background during the click.

**Touches:** `overlay/` (and re-applied to `apps/*`).

**Done:** all IDs exist on every app.

**Verify:** `maestro hierarchy` on a running app shows each ID; the status rows update as events arrive.

## Phase 6: Maestro flows for local testing
**Goal:** flows that implement the three named checks.

**Steps:**
1. `maestro/subflows/launch.yaml`: `launchApp` (clear state), assert `e2e-root` is visible. This is the "app launches" check.
2. `maestro/subflows/ad-rendered.yaml`: `extendedWaitUntil` "ad rendered: yes" (30 s), then assert `status-unexpected` is empty. This is the "ad rendered" check.
3. `maestro/subflows/click-handled.yaml`: tap `ad-container`, return to the app (depends on the tap behavior; see open question 1), then `extendedWaitUntil` "click handled: yes" (10 s). This is the "click handled" check.
4. `maestro/ad-flow.yaml` chains the three, with `appId: ${APP_ID}` passed in through `-e`.

**Touches:** `maestro/`.

**Done:** the flow passes on one app with real values.

**Verify:** `maestro test maestro/ad-flow.yaml -e APP_ID=<package>` passes. With a wrong ad unit, it fails at "ad rendered."

## Phase 7: Test everything locally
**Goal:** one command runs the full matrix on a local emulator and prints a summary.

**Steps:**
1. `scripts/run-local.sh <sdkVersion>`. For each app in `matrix.json`, it runs these steps and records which step failed, if any: `install-sdk` → `write-e2e-config` → `yarn install` → `assembleRelease` → `adb install` → `maestro test`.
2. It writes `results/<line>.json` with `{ line, rnVersion, appDir, sdkVersion, failedStep, detail }`. Phase 11 uses this same format.
3. It fixes any app-specific issues found along the way.

**Touches:** `scripts/run-local.sh`, `results/` (gitignored); app fixes only if needed.

**Done:** all 10 apps pass locally, or each failure is understood and written down.

**Verify:** run it against the current QA version and read the summary plus the `results/*.json` files.

## Phase 8: CI, install the SDK version and build the apps
**Goal:** a manual workflow that builds every app against a requested SDK version.

**Steps:**
1. `.github/workflows/e2e-android.yml` on `main`:
   - **Trigger:** `workflow_dispatch`.
   - **Inputs:** `sdk_version` (required) and `matrix_ref` (default `e2e/matrix`, so a Regenerate PR branch can be tested before merging).
   - **Permissions:** `contents: read`.
2. Job `prepare`:
   - Check out `matrix_ref`.
   - Run the version-availability check. If the version isn't available, set `available=false`, skip all other jobs, and let the report job send "skipped (version not available)".
   - Emit the matrix from `matrix.json` with `fromJSON`.
3. Job `e2e` (matrix with one entry per app, `fail-fast: false`):
   - Check out the matrix ref; set up Node and JDK 17 (temurin); cache Gradle (`gradle/actions/setup-gradle`) and Yarn.
   - Install the SDK, write the E2E config, run `assembleRelease`.
   - Pass secrets only as step environment variables: `ORG_GRADLE_PROJECT_e2eAdgeistAppId`, `ORG_GRADLE_PROJECT_e2eApplicationId`, and `ADGEIST_E2E_*`.
4. Each cell writes `results/<line>.json` and uploads it as a small artifact.
5. Since the repo is public: never upload APKs; pin actions to commit SHAs.

**Touches:** `main`: `.github/workflows/e2e-android.yml`; `e2e/matrix`: possibly small script tweaks for CI.

**Done:** dispatching with a valid QA version produces 10 green build cells. A bogus version builds nothing.

**Verify:** run it from the Actions tab both ways and check the per-cell result artifacts.

## Phase 9: CI, run the Maestro tests
**Goal:** each matrix cell installs its APK on an emulator and runs the flow.

**Steps:**
1. In the `e2e` job, enable KVM (a udev-rule step) and use `reactivecircus/android-emulator-runner` pinned to API 35 `google_apis` x86_64.
2. Cache the AVD and its snapshot with `actions/cache`. Make emulator boot a separate step with a retry, and report boot failures as `failedStep: emulator`, never as an SDK failure.
3. Install a pinned Maestro version, then `adb install` and `maestro test --format junit`.
4. Map the failed subflow to `failedStep` (`launch` / `ad-rendered` / `click-handled`) and include the received event codes in `detail`.
5. **Artifacts** (14-day retention): Maestro report, screenshots, and a **filtered logcat**. The filter drops `AdgeistImpl` init lines, because they log the app ID (`android/src/main/java/com/adgeist/modules/AdgeistImpl.kt:28`), and redacts secret values.

**Touches:** `main`: `.github/workflows/e2e-android.yml`.

**Done:** every cell reports pass, or the exact failing step with event codes.

**Verify:** one green run, plus one deliberately broken run (wrong ad unit secret) showing `failedStep: ad-rendered` on every cell, with artifacts present and no secrets in them.

## Phase 10: Version advisory check
**Goal:** detect new lines, patch drift and retirement candidates.

**Steps:**
1. `scripts/advise.js` reuses `lib/npm-downloads.js` and compares against `matrix.json`:
   - **New line:** a minor newer than any in the matrix with ≥ 0.5% share. Its target is the most-downloaded patch.
   - **Drift:** the line's new leader has ≥ 20% more downloads in that line than the current patch.
   - **Retire:** the line's share is below 1% in two consecutive monthly checks.
2. Output `advisory.json` plus a readable summary.
3. **State for the retirement rule:** download the previous advisory run's artifact (90-day retention covers a monthly cadence). This avoids bot commits.
4. `.github/workflows/e2e-advisory.yml` on `main`: `schedule` monthly (`0 6 1 * *`) plus `workflow_dispatch`.
5. The `e2e-android.yml` report job also runs `advise.js`, so every E2E run includes the advisory.

**Touches:** `scripts/advise.js`; `main`: `.github/workflows/e2e-advisory.yml`, `e2e-android.yml`.

**Done:** the advisory runs on a schedule and on demand.

**Verify:** run locally. With the 2026-10-14 data it should immediately report **0.87 as a new line** (6.1% share). You can also re-run it against a saved snapshot to check that the output is deterministic.

## Phase 11: Slack integration
**Goal:** every run reports to Slack using only `status`, `text`, `runUrl` and `regenerateUrl`.

**Steps:**
1. `scripts/slack-notify.js` builds the payload and posts it to `secrets.E2E_SLACK_WEBHOOK_URL` (a Slack Workflow Builder webhook; no Block Kit). A `--dry-run` flag prints the payload instead of posting it.
2. **E2E messages** come from a `report` job (`needs: e2e`, `if: always()`) that aggregates `results/*.json`:
   - `status`: `passed` / `failed (N of 10)` / `skipped (version not available)`
   - `text`:
     - the SDK version
     - one line per app: `✅ RN 0.86.3 — ad rendered, click handled`
     - for each failure: `❌ RN 0.83.6 (apps/rn-0.83) — failed at: ad-rendered — codes: AE1`
     - the advisory section
     - a footer: "impression/click reporting not verified"
   - `runUrl`: the run page
   - `regenerateUrl`: the Regenerate workflow page if the advisory found changes; otherwise a fixed placeholder (see open question 5)
3. **Advisory messages** from the monthly workflow use the same four variables, with `status` set to `action needed` or `no changes`.
4. Message text never contains secrets.

**Touches:** `scripts/slack-notify.js`; `main`: `e2e-android.yml`, `e2e-advisory.yml`.

**Done:** both kinds of message arrive in Slack.

**Verify:** check the dry-run output first, then do a real dispatch and look at the message in Slack.

## Phase 12: Regenerate flow and PR generation
**Goal:** one click on "Run workflow" turns the advisory into a PR against `e2e/matrix`.

**Steps:**
1. `.github/workflows/e2e-regenerate.yml` on `main`: `workflow_dispatch` with no required inputs.
2. Check out `e2e/matrix` and run `advise.js` on fresh data. Then:
   - for each new or drifted line, run `generate-app.js` (overlay included) into `apps/rn-x.y`, replacing the existing folder
   - for each retired line, remove the app folder
   - install the baseline SDK version and update `matrix.json`
3. Open or update a PR with `peter-evans/create-pull-request`:
   - base `e2e/matrix`, fixed branch name `e2e/regenerate`, so re-runs update the same PR
   - the PR body lists every add, drift and retirement, with download numbers
4. **Token:** `GITHUB_TOKEN` with `contents: write` and `pull-requests: write`. Nothing runs automatically on these PRs; you test one by dispatching E2E with `matrix_ref=e2e/regenerate`. That means no GitHub App is needed (see open question 3).
5. **Repo setting:** "Allow GitHub Actions to create and approve pull requests" must be turned on.

**Touches:** `main`: `.github/workflows/e2e-regenerate.yml`; `e2e/matrix`: possibly script tweaks.

**Done:** running the workflow opens a PR that adds `apps/rn-0.87` and updates `matrix.json`.

**Verify:** inspect the PR diff, then run E2E against `matrix_ref=e2e/regenerate` and confirm the new app passes before merging.

---

## Open questions
1. **Tap behavior on the E2E creative:** does a tap open an external browser, an in-app browser, or nothing? This decides how `click-handled.yaml` returns to the app.
2. **Ad unit type:** fixed (exact width × height) or responsive? If fixed and the creative can be a companion ad, it needs ≥ 320×320.
3. **Token choice:** because Regenerate PRs are tested through a manual dispatch rather than automatic PR CI, plain `GITHUB_TOKEN` is enough. Use a GitHub App instead only if CI should run automatically on those PRs.
4. **Retirement:** at 2026-10-14 shares, 0.77, 0.78, 0.80 and 0.82 are all below 1%, so two monthly checks after go-live they'll be proposed for retirement. Is that acceptable, or should the initial 10 be exempt?
5. **The `regenerateUrl` placeholder** when there's nothing to regenerate: link to the `e2e/matrix` branch page, or to the Actions page?

## Assumptions (already confirmed, listed for reference)
- Android only, QA only, E2E only. No iOS, production, Expo or old-architecture cells.
- Apps are stored in the orphan branch `e2e/matrix`; workflow YAMLs live on `main`.
- Initial apps are created manually by running the same generator script CI uses. Generation is otherwise only used by the Regenerate flow.
- Apps use their template defaults (new architecture on), Yarn classic, JDK 17, and the Node version from each template. Release builds use debug signing.
- E2E is triggered manually only (`workflow_dispatch`), after first checking that the SDK version is available. The advisory runs monthly. All cells run in parallel and every failure is reported.
- The version rule is the most-downloaded plain patch per line (latest patch if the line has zero downloads; ties go to the higher patch), with no follow-up run on the latest patch. The range moves forward: new lines added and low-share lines retired via the Regenerate PR flow.
- Secrets (public repo): `ADGEIST_E2E_APP_ID`, `ADGEIST_E2E_PACKAGE_NAME`, `ADGEIST_E2E_AD_UNIT_ID`, `ADGEIST_E2E_AD_WIDTH`, `ADGEIST_E2E_AD_HEIGHT`, `ADGEIST_E2E_AD_RESPONSIVE`, `E2E_SLACK_WEBHOOK_URL`. Everything committed is a placeholder. APKs are never uploaded as artifacts.
- Notifications go to Slack only.
- The check names are "app launches," "ad rendered" and "click handled." Reporting of impressions and clicks is explicitly not verified.
