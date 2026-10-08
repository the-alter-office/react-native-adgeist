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

## Commit message convention

We follow the [conventional commits specification](https://www.conventionalcommits.org/en) for our commit messages:

- `fix`: bug fixes, e.g. fix crash due to deprecated method.
- `feat`: new features, e.g. add new method to the module.
- `refactor`: code refactor, e.g. migrate from class components to hooks.
- `docs`: changes into documentation, e.g. add usage example for the module.
- `test`: adding or updating tests, e.g. add integration tests using detox.
- `chore`: tooling changes, e.g. change CI config.

Keep the header under 100 characters and put the details in the body. Our commit-msg hook runs commitlint to verify that your commit message matches this format when committing.

## Linting and tests

We use [TypeScript](https://www.typescriptlang.org/) for type checking, [ESLint](https://eslint.org/) with [Prettier](https://prettier.io/) for linting and formatting the code, and [Jest](https://jestjs.io/) for testing.

Our pre-commit hooks run ESLint on the staged files and `tsc` when committing. They do not run the tests, so run `yarn test` yourself before opening a pull request.

## Scripts

The `package.json` file contains various scripts for common tasks:

- `yarn`: setup project by installing dependencies.
- `yarn typecheck`: type-check files with TypeScript.
- `yarn lint`: lint files with ESLint (`yarn lint --fix` to auto-fix).
- `yarn test`: run unit tests with Jest.
- `yarn example:beta`: configure the build for beta and start the Metro server for the example app (also `:qa`, `:prod`).
- `yarn example android`: run the example app on Android.
- `yarn example ios`: run the example app on iOS.
- `yarn configure-build <beta|qa|prod>`: generate `src/config.ts` for an environment.
- `yarn fetch-adgeistkit`: install the pinned iOS AdgeistKit into `ios/Frameworks`.
- `yarn update-adgeistkit <ios|android> <version>`: change a platform's AdgeistKit pin.
- `yarn prepare`: build the library.

## Sending a pull request

> **Working on your first pull request?** You can learn how from this _free_ series: [How to Contribute to an Open Source Project on GitHub](https://app.egghead.io/playlists/how-to-contribute-to-an-open-source-project-on-github).

When you're sending a pull request:

- Prefer small pull requests focused on one change.
- Verify that linters and tests are passing.
- Review the documentation to make sure it looks good.
- For pull requests that change the API or implementation, discuss with maintainers first by opening an issue.
