# Contributing

## Setup

This is a Yarn workspaces monorepo: the library at the root, an example app in `example/` and the Expo plugin in `plugin/`. Use Yarn, not npm.

```sh
yarn
yarn fetch-adgeistkit   # downloads the iOS AdgeistKit.xcframework (required before pod install)
```

Run the example app:

```sh
yarn example:beta       # or :qa / :prod; sets src/config.ts and starts Metro
yarn example android
yarn example ios
```

JS changes hot-reload. Native changes need a rebuild. Native sources are under `Pods > Development Pods` in Xcode and `@thealteroffice/react-native-adgeist` in Android Studio.

## Environments

| Branch | Environment | npm version    | dist-tag | AdgeistKit (iOS + Android) |
| ------ | ----------- | -------------- | -------- | -------------------------- |
| `dev`  | beta        | `X.Y.Z-beta.N` | `beta`   | as pinned                  |
| `qa`   | qa          | `X.Y.Z-qa`     | `qa`     | stable                     |
| `main` | prod        | `X.Y.Z`        | `latest` | stable                     |

- `src/config.ts` is generated. Change it with `yarn configure-build <beta|qa|prod>`.
- Never commit a modified `src/config.ts`. Its committed values are empty strings and CI fills them in. Run `git restore src/config.ts` before committing.
- To release a new version, bump `PACKAGE_VERSION` in `src/constants.ts`. Never edit the `package.json` version by hand; `yarn sync-version` derives it.

## AdgeistKit (native SDKs)

Both native SDKs are pinned in the `adgeistKit` block of `package.json`:

- `adgeistKit.ios` (`version`, `url`, `checksum`): a prebuilt `AdgeistKit.xcframework` from the [adgeist-publisher-ios-sdk releases](https://github.com/the-alter-office/adgeist-publisher-ios-sdk/releases).
- `adgeistKit.android` (`version`): the `ai.adgeist:adgeistkit` artifact on [Maven Central](https://repo1.maven.org/maven2/ai/adgeist/adgeistkit/). `android/build.gradle` reads it from `package.json`.

- `yarn fetch-adgeistkit` installs the pinned iOS version into `ios/Frameworks`, checking it against the checksum. It runs as part of `yarn prepare`, and skips the download if that version is already installed.
- `yarn update-adgeistkit <ios|android> <version>` changes one platform's pin and leaves the other untouched. It fails if the release doesn't exist. For iOS it downloads the release and computes its checksum; for Android it checks the version is on Maven Central.

```sh
yarn update-adgeistkit ios 1.0.25-beta.1
yarn update-adgeistkit android 1.1.38
yarn fetch-adgeistkit
```

Pin pre-releases such as `X.Y.Z-beta.N` on `dev`. The `qa` and `main` publishes drop the suffix from each platform's version and run `update-adgeistkit <platform> X.Y.Z`, so both stable releases must exist. The **AdgeistKit release check** fails any PR into `qa` or `main` until they do.

## Publishing

Publishing runs only from GitHub Actions (`.github/workflows/publish.yml`), using npm trusted publishing (OIDC). Keep the filename in sync with the npm trusted-publisher settings.

1. Bump `PACKAGE_VERSION` and merge to `dev`: publishes `X.Y.Z-beta.N`.
2. Promote `dev` to `qa`: publishes `X.Y.Z-qa` with the stable AdgeistKit.
3. Promote `qa` to `main`: publishes `X.Y.Z` to `latest` with the stable AdgeistKit.

Every push to these branches publishes. If the version is already on npm, the run skips the publish and the Slack notification. A manual run fails instead, so bump the version first. Results are posted to Slack via `SLACK_NOTIFICATION_WEBHOOK_URL`.

## Checks and commits

```sh
yarn typecheck
yarn lint          # yarn lint --fix to auto-fix
yarn test
```

Lefthook runs ESLint and `tsc` on commit, and commitlint on the message. Use [conventional commits](https://www.conventionalcommits.org/en) (`fix:`, `feat:`, `refactor:`, `docs:`, `test:`, `chore:`). Keep the header under 100 characters and put the details in the body.


