# Contributing

## Setup

This is a Yarn workspaces monorepo: the library at the root, an example app in `example/` and the Expo plugin in `plugin/`. Use Yarn, not npm.

```sh
yarn
yarn fetch-adgeistkit   # downloads the iOS AdgeistKit.xcframework (required before pod install)
```

Run the example app:

```sh
yarn example:beta       # or :qa / :prod; sets src/env.ts and starts Metro
yarn example android
yarn example ios
```

JS changes hot-reload. Native changes need a rebuild. Native sources are under `Pods > Development Pods` in Xcode and `@thealteroffice/react-native-adgeist` in Android Studio.

## Environments

| Branch | Environment | npm version  | dist-tag | AdgeistKit (iOS) |
| ------ | ----------- | ------------ | -------- | ---------------- |
| `main` | beta        | `X.Y.Z-beta` | `beta`   | as pinned        |
| `qa`   | qa          | `X.Y.Z-qa`   | `qa`     | stable           |
| `prod` | prod        | `X.Y.Z`      | `latest` | stable           |

- `src/env.ts` is generated. Change it with `yarn set-env <beta|qa|prod>` or `yarn set-env --domain <url>`.
- Never commit a modified `src/env.ts`. Its committed values are empty strings and CI fills them in. Run `git restore src/env.ts` before committing.
- To release a new version, bump `PACKAGE_VERSION` in `src/constants.ts`. Never edit the `package.json` version by hand; `yarn sync-version` derives it.

## AdgeistKit (iOS native SDK)

The iOS SDK is a prebuilt `AdgeistKit.xcframework`, downloaded from the [adgeist-publisher-ios-sdk releases](https://github.com/the-alter-office/adgeist-publisher-ios-sdk/releases). It is pinned in the `adgeistKit` block of `package.json` (`version`, `url`, `checksum`).

- `yarn fetch-adgeistkit` installs the pinned version into `ios/Frameworks`, checking it against the checksum. It runs as part of `yarn prepare`, and skips the download if that version is already installed.
- `yarn update-adgeistkit <version>` changes the pin. It downloads that release, computes its checksum and rewrites the `adgeistKit` block. It fails if the release doesn't exist.

```sh
yarn update-adgeistkit 1.0.25-beta.1
yarn fetch-adgeistkit
```

Pin a pre-release such as `X.Y.Z-beta.N` on `main`. The `qa` and `prod` publishes drop the suffix and run `update-adgeistkit X.Y.Z`, so the stable `X.Y.Z` release must exist. The **AdgeistKit release check** fails any PR into `qa` or `prod` until it does.

## Publishing

Publishing runs only from GitHub Actions (`.github/workflows/publish.yml`), using npm trusted publishing (OIDC). Keep the filename in sync with the npm trusted-publisher settings.

1. Bump `PACKAGE_VERSION` and merge to `main`: publishes `X.Y.Z-beta`.
2. Promote `main` to `qa`: publishes `X.Y.Z-qa` with the stable AdgeistKit.
3. Promote `qa` to `prod`: publishes `X.Y.Z` to `latest` with the stable AdgeistKit.

Every push to these branches publishes. If the version is already on npm, the run skips the publish and the Slack notification. A manual run fails instead, so bump the version first. Results are posted to Slack via `SLACK_NOTIFICATION_WEBHOOK_URL`.

## Checks and commits

```sh
yarn typecheck
yarn lint          # yarn lint --fix to auto-fix
yarn test
```

Lefthook runs ESLint and `tsc` on commit, and commitlint on the message. Use [conventional commits](https://www.conventionalcommits.org/en) (`fix:`, `feat:`, `refactor:`, `docs:`, `test:`, `chore:`). Keep the header under 100 characters and put the details in the body.


