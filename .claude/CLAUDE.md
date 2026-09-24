# Working rules for this project

## Do not do
- Do NOT add comments to code. Explanation goes in the chat, not the diff.
- NEVER commit. NEVER push. Not even when the work is finished.

## If I do ask you to make a change
First explain it in the chat, in plain terms: what you are going to change, in which file,
and why. Only after that explanation do you write the plan or edit the files.

## Stop and wait for my approval before:
- Creating any new file
- Modifying more than 3 files in one change
- Any destructive operation (delete, drop, remove)
- Adding a new dependency

---

# Project: `@thealteroffice/react-native-adgeist`

The React Native wrapper around the AdGeist publisher SDKs. It owns no ad logic of its own:
the native AdGeist SDKs (`ai.adgeist:adgeistkit` on Android, the `AdgeistKit` pod on iOS) do
the ad fetching, WebView rendering and impression/click/viewability reporting. This repo
exposes them to JS as one TurboModule and one native view component, and is published to npm.

## Tech stack
- TypeScript, React 19, react-native 0.79.2 (example app runs 0.78.2)
- Scaffolded by create-react-native-library as a turbo-module (kotlin-objc); built with
  react-native-builder-bob (ESM `lib/module` + `lib/typescript`)
- Codegen spec `RNAdgeistSpec`, Java package `com.adgeist`; both architectures supported
  (Android `src/newarch` vs `src/oldarch` source sets, Fabric detected at runtime in JS)
- Android: Kotlin 2.0.21, minSdk 24, targetSdk 34, compileSdk 35, Java 8 target
- iOS: Swift + Objective-C++, pod `Adgeist`, depends on `AdgeistKit`
- Yarn 3 workspaces (`example`, `plugin`) + turbo; Expo config plugin via `app.plugin.js`

## Layout
- `src/` — the public JS API (`index.tsx` re-exports provider, view and CDP client)
- `src/specs/` — codegen specs: `NativeAdgeist` (TurboModule), `HTML5AdNativeComponent` (view)
- `android/src/main/java/com/adgeist/` — shared Kotlin impl; `newarch`/`oldarch` are thin
  arch-specific wrappers over it
- `ios/` — `AdgeistImpl.swift` + `Adgeist.mm` (module), `NativeHTML5AdView.swift` +
  `NativeHTML5AdManager.mm` (view)
- `plugin/` — Expo config plugin (patches MainApplication and AppDelegate)
- `example/` — RN example app, react-navigation native-stack, screens under `src/screens/`
- `scripts/` — `set-env.js`, `sync-version.js`

## Commands
- Start example metro: `yarn example:beta` (also `:qa`, `:prod`)
- Run example: `yarn example android` / `yarn example ios`
- Typecheck / lint / tests: `yarn typecheck`, `yarn lint`, `yarn test`
- Build the library: `yarn prepare` (runs `sync-version` then `bob build`)

## Architecture, in five facts
- `AdgeistProvider` calls `destroySdk()` then `initializeSdk(...)` on mount and only renders
  its children once initialization resolves. Everything else assumes it ran.
- `NativeAdgeist` is the TurboModule: init/destroy, consent, user details, events, and the
  `trackImpression` / `trackView` / `trackTotalView` / `trackClick` / `trackVideoPlayback`
  reporting calls. `src/cdpclient/` is the thin typed wrapper over the CDP half of it.
- `HTML5AdView` is the public component. It forwards props to the native
  `HTML5AdNativeComponent`, waits one frame for the native ref, then fires the `loadAd`
  command; `destroy` is exposed through its imperative ref.
- Commands go through `AdCommands` in the spec file, which branches on Fabric vs Paper
  (`codegenNativeCommands` vs `UIManager.dispatchViewManagerCommand` with numeric ids on
  Android, string names on iOS). Keep that branch in sync when adding a command.
- On Android, `HTML5AdViewManagerImpl` holds all the real work for both architectures, keeps
  its own view→`ThemedReactContext` map for event dispatch, and wraps the native `AdView` in
  `ReactAdView` to force the measure/layout pass RN otherwise skips.

## Environment and versioning
`src/env.ts` (`PACKAGE_SUFFIX`, `BACKEND_DOMAIN`) is generated — edit it with
`yarn set-env <beta|qa|prod>` or `yarn set-env --domain <url>`, not by hand. The npm version
is derived from `PACKAGE_VERSION` in `src/constants.ts` plus that suffix, and written into
`package.json` by `yarn sync-version`, so bump `src/constants.ts`.

## When you touch the ad view
Read `.claude/Ad-persistence-scenarios.md` first. It lists the 10 lifecycle scenarios that
must never destroy a live ad. The native SDK implements them, but this layer can break them:
on Android the manager sets `watchFragmentLifecycle = false` because react-native-screens
destroys and recreates the host fragment, so teardown must come from `onDropViewInstance`.
