# React Native SDK (react-native-adgeist)

Repo-specific details for `@thealteroffice/react-native-adgeist`. Read with `sdk-workflow.md`.

## What it is
- RN wrapper around the AdGeist publisher native SDKs: `ai.adgeist:adgeistkit` (Android), `AdgeistKit` xcframework (iOS). No ad logic here.
- Exposes one TurboModule (`NativeAdgeist`) and native view components (`HTML5AdNativeComponent`, `AdPreviewNativeComponent`). Published to npm.
- Native source lives in `native-android-adgeist` and `native-ios-adgeist`; `adgeist-publisher-ios-sdk` hosts the iOS xcframework releases. Check them for existing functions before adding API here.

## Layout
- `src/`: public JS API (`index.tsx`), `components/`, `providers/AdgeistProvider.tsx`, `cdpclient/`, `types/`, `__tests__/`.
- `src/specs/`: codegen specs (`RNAdgeistSpec`, Java package `com.adgeist`).
- `android/src/main/java/com/adgeist/`: shared Kotlin impl; `newarch` / `oldarch` source sets are thin wrappers.
- `ios/`: Swift + ObjC++ (`AdgeistImpl.swift`, `Adgeist.mm`, view managers). Pod `Adgeist` (`Adgeist.podspec`).
- `plugin/`: Expo config plugin (`app.plugin.js`). `example/`: RN example app (RN 0.78.2). Yarn workspaces: `example`, `plugin`.
- `scripts/`: `configure-build.js`, `sync-version.js`, `fetch-ios-native-adgeistkit.js`, `update-adgeistkit.js`.

## Tooling
- Node `v20.19.0` (`.nvmrc`). Yarn 3.6.1 checked in: `node .yarn/releases/yarn-3.6.1.cjs <cmd>` if `yarn` isn't on PATH. npm can't be used for development.
- Install: `yarn` (CI uses `yarn install --immutable`).

## Commands
- `yarn typecheck` (tsc), `yarn lint` (eslint on `src` + `example`; `yarn lint --fix` for formatting), `yarn test` (jest, preset react-native).
- `yarn prepare`: `sync-version` -> `fetch-adgeistkit` -> `bob build` -> `tsc -p plugin`. Example app uses built `lib/`, so rerun after JS/TS changes.
- `yarn configure-build <beta|qa|prod>`: writes `PACKAGE_SUFFIX` and `BACKEND_DOMAIN` into `src/config.ts`.
- `yarn example:beta|qa|prod`: configure-build + Metro. `yarn example android|ios` runs the app.
- `yarn fetch-adgeistkit`: downloads pinned iOS xcframework into `ios/Frameworks` (checksum-verified). Needed before `pod install`.
- `yarn update-adgeistkit <ios|android> <version>`: rewrites the `adgeistKit.<platform>` pin. iOS computes `url` + `checksum`; android only checks Maven Central, so it fails for `-beta-SNAPSHOT` versions.
- iOS/Android app builds need Xcode / Android SDK; not available in the cloud env. Typecheck, lint, tests and `bob build` run here.

## Hooks and commits
- Lefthook pre-commit: eslint on staged files + `tsc`. commit-msg: commitlint (conventional commits, header < 100 chars).

## CI (`.github/workflows`)
- `publish.yml`: on push to `dev`, `qa`, `main` (and manual dispatch). npm trusted publishing (OIDC); keep the filename in sync with npm settings. Posts result to Slack.
- `adgeistkit-release-check.yml`: on PRs into `main` and `qa`. Fails unless the stable (`x.y.z`, suffix stripped) AdgeistKit iOS GitHub release and Android Maven Central release exist.
- No CI for lint/test/typecheck; run them locally before pushing.

## Versioning and publishing
- Bump `PACKAGE_VERSION` in `src/constants.ts` (plain `x.y.z`, never add a suffix). Never edit `package.json` `version`; `yarn sync-version` derives it from `PACKAGE_VERSION` + `PACKAGE_SUFFIX`.
- Per branch:
  - `dev`: `x.y.z-beta.N` (next unused N on npm), dist-tag `beta`, env `beta`. README gets the Sonatype snapshot repo note at publish time.
  - `qa`: `x.y.z-qa`, dist-tag `qa`, env `qa`.
  - `main`: `x.y.z`, dist-tag `latest`, env `prod`.
- `qa`/`main` pushes skip publishing if the version is already on npm, so bump `PACKAGE_VERSION` per release. Manual runs fail instead.
- `prod` uses the same `BACKEND_DOMAIN` as `qa` (`configure-build.js`).
- `src/config.ts` is committed with empty strings; CI fills it. Don't commit a configured `src/config.ts`.

## Native SDK pins (`package.json` > `adgeistKit`)
- Separate `android.version` and `ios.{version,url,checksum}`.
- On `dev` (beta channel): Android pin is `x.y.z-beta-SNAPSHOT` (Sonatype snapshots); iOS pin is a pre-release `x.y.z-beta.N` from `adgeist-publisher-ios-sdk`.
- Bump Android: edit `adgeistKit.android.version` directly; Gradle reads it at build time.
- Bump iOS: `yarn update-adgeistkit ios <version>` then `yarn prepare`. Don't hand-edit `adgeistKit.ios`. The beta release must exist first.
- `qa`/`main` publish switches both pins to the stable `x.y.z` via `update-adgeistkit` before building.

## Architecture gotchas
- `AdgeistProvider` calls `destroySdk()` then `initializeSdk(...)` on mount; children render only after init resolves.
- `HTML5AdView` waits one frame for the native ref, then fires `loadAd`. Commands go through `AdCommands` in the spec, branching Fabric (`codegenNativeCommands`) vs Paper (`UIManager.dispatchViewManagerCommand`, numeric ids on Android, string names on iOS). Keep both in sync when adding a command.
- Android `HTML5AdViewManagerImpl` does the work for both archs; wraps native `AdView` in `ReactAdView` to force layout. `watchFragmentLifecycle = false` because react-native-screens recreates the host fragment; teardown comes from `onDropViewInstance`.
- Before touching the ad view, read `.claude/Ad-persistence-scenarios.md` (10 lifecycle cases that must never destroy a live ad).
- Android library build has `minifyEnabled false`.

## Conventions (`.claude/CLAUDE.md`)
- No code comments.
- Never commit or push unless the user explicitly asks.
- Explain a change in chat before editing. Ask before creating files, changing more than 3 files, destructive ops, or new dependencies.

## Stale docs to ignore
- CONTRIBUTING's "Environments" section (`yarn set-env`, `src/env.ts`) is outdated; the real script is `yarn configure-build` and the file is `src/config.ts`.
- CONTRIBUTING's "Branching and releases" flow (PR `dev` -> `qa`) is superseded by `sdk-workflow.md`: branch from `main`, PR to `dev`, then `(QA) <title>` PR from the same branch to `qa`.
