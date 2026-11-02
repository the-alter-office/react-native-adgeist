# Contributing

Contributions are always welcome, no matter how large or small!

We want this community to be friendly and respectful to each other. Please follow it in all your interactions with the project. Before contributing, please read the [code of conduct](./CODE_OF_CONDUCT.md).

## Branching and releases

| Branch            | Purpose                                     | Native SDK channel |
| ----------------- | ------------------------------------------- | ------------------ |
| `main`            | Stable production releases                  | stable             |
| `qa`              | Release staging, merged into `main`         | qa                 |
| `dev`             | Beta testing                                | beta               |
| `feat/*`, `fix/*` | Day-to-day work, always created from `main` | beta               |

The flow is:

1. Create your feature branch from `main`.
2. Open a pull request into `dev` and test the beta build.
3. Once tested, open a pull request from `dev` into `qa` for release staging.
4. After QA sign-off, `qa` is merged into `main`.

The **AdgeistKit release check** runs on every pull request into `main` and `qa`, and fails if the stable native SDK releases have not been published yet.

### Publishing

Pushing to `dev`, `qa` or `main` publishes the package to npm.

| Branch | npm version                                   | npm tag  |
| ------ | --------------------------------------------- | -------- |
| `dev`  | `PACKAGE_VERSION-beta.N`, e.g. `0.0.9-beta.3` | `beta`   |
| `qa`   | `PACKAGE_VERSION-qa`, e.g. `0.0.9-qa`         | `qa`     |
| `main` | `PACKAGE_VERSION`, e.g. `0.0.9`               | `latest` |

`PACKAGE_VERSION` in `src/constants.ts` must be a plain `x.y.z` version. Never add `-beta` to it yourself: the publish workflow adds `-beta.N` on `dev`, picking the next `N` not yet on npm. Bump `PACKAGE_VERSION` for every new release, because `qa` and `main` skip publishing a version that is already on npm. Never edit the `package.json` version by hand; `yarn sync-version` derives it.

Publishing runs only from GitHub Actions (`.github/workflows/publish.yml`), using npm trusted publishing (OIDC). Keep the filename in sync with the npm trusted-publisher settings. A manual run fails instead of skipping when the version is already on npm. Results are posted to Slack via `SLACK_NOTIFICATION_WEBHOOK_URL`.

## Native SDK channels

The native AdgeistKit versions live in `package.json`, pinned separately for each platform:

```json
"adgeistKit": {
  "android": {
    "version": "0.0.0"
  },
  "ios": {
    "version": "0.0.0",
    "url": "https://github.com/the-alter-office/adgeist-publisher-ios-sdk/releases/download/0.0.0/AdgeistKit.xcframework.zip",
    "checksum": "<sha256 of the zip>"
  }
}
```

Each channel maps those pins to a published native SDK:

| Channel | iOS (GitHub release of `adgeist-publisher-ios-sdk`) | Android                                                             |
| ------- | --------------------------------------------------- | ------------------------------------------------------------------- |
| beta    | The pinned pre-release, e.g. `0.0.0-beta.N`         | `ai.adgeist:adgeistkit:0.0.0-beta-SNAPSHOT` from Sonatype snapshots |
| qa      | Same as stable                                      | Same as stable                                                      |
| stable  | Release `0.0.0`                                     | `ai.adgeist:adgeistkit:0.0.0` from Maven Central                    |

To bump the native SDK versions on `dev`:

- **Android:** change `adgeistKit.android.version` in `package.json`. Gradle reads it at build time, nothing else to run.
- **iOS:** run `yarn update-adgeistkit ios <version>`, then `yarn prepare`. The script updates `version`, `url` and `checksum` together, so don't edit `adgeistKit.ios` by hand.

## Development workflow

This project is a monorepo managed using Yarn workspaces. It contains the following packages:

- The library package in the root directory.
- An example app in the `example/` directory.
- The Expo config plugin in the `plugin/` directory.

To get started with the project, run `yarn` in the root directory to install the required dependencies for each package, then download the iOS native SDK:

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
yarn update-adgeistkit 1.0.26-beta.1
yarn fetch-adgeistkit
```

Since the project relies on Yarn workspaces, you cannot use npm for development. `yarn fetch-adgeistkit` is required before the first `pod install`, because the podspec fails without `AdgeistKit.xcframework`.

The [example app](/example/) demonstrates usage of the library. You need to run it to test any changes you make.

It is configured to use the built library from `lib/`, so after changing the library's JavaScript or TypeScript code, run `yarn prepare` to rebuild it before the example app picks up the change. Native code changes require a rebuild of the example app.

If you want to use Android Studio or Xcode to edit the native code, you can open the `example/android` or `example/ios` directories respectively in those editors. To edit the Objective-C or Swift files, open `example/ios/AdgeistExample.xcworkspace` in Xcode and find the source files at `Pods > Development Pods > @thealteroffice/react-native-adgeist`.

To edit the Java or Kotlin files, open `example/android` in Android Studio and find the source files at `@thealteroffice/react-native-adgeist` under `Android`.

You can use various commands from the root directory to work with the project.

To configure the build for an environment and start the packager:

```sh
yarn example:beta   # or example:qa / example:prod
```

To confirm that the app is running with the new architecture, you can check the Metro logs for a message like this:

```sh
Running "AdgeistExample" with {"fabric":true,"initialProps":{"concurrentRoot":true},"rootTag":1}
```

Note the `"fabric":true` and `"concurrentRoot":true` properties.

Make sure your code passes TypeScript and ESLint. Run the following to verify:

```sh
yarn typecheck
yarn lint
```

To fix formatting errors, run the following:

```sh
yarn lint --fix
```

Remember to add tests for your change if possible. Run the unit tests by:

```sh
yarn test
```

Lefthook runs ESLint and `tsc` on commit, and commitlint on the message. Use [conventional commits](https://www.conventionalcommits.org/en) (`fix:`, `feat:`, `refactor:`, `docs:`, `test:`, `chore:`). Keep the header under 100 characters and put the details in the body.
