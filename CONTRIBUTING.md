# Contributing

Contributions are always welcome, no matter how large or small!

We want this community to be friendly and respectful to each other. Please follow it in all your interactions with the project. Before contributing, please read the [code of conduct](./CODE_OF_CONDUCT.md).

## Development workflow

This project is a monorepo managed using [Yarn workspaces](https://yarnpkg.com/features/workspaces). It contains the following packages:

- The library package in the root directory.
- An example app in the `example/` directory.

To get started with the project, run `yarn` in the root directory to install the required dependencies for each package:

```sh
yarn
```

> Since the project relies on Yarn workspaces, you cannot use [`npm`](https://github.com/npm/cli) for development.

The [example app](/example/) demonstrates usage of the library. You need to run it to test any changes you make.

It is configured to use the local version of the library, so any changes you make to the library's source code will be reflected in the example app. Changes to the library's JavaScript code will be reflected in the example app without a rebuild, but native code changes will require a rebuild of the example app.

If you want to use Android Studio or XCode to edit the native code, you can open the `example/android` or `example/ios` directories respectively in those editors. To edit the Objective-C or Swift files, open `example/ios/AdgeistExample.xcworkspace` in XCode and find the source files at `Pods > Development Pods > @thealteroffice/react-native-adgeist`.

To edit the Java or Kotlin files, open `example/android` in Android studio and find the source files at `@thealteroffice/react-native-adgeist` under `Android`.

You can use various commands from the root directory to work with the project.

To start the packager:

```sh
yarn example start
```

To run the example app on Android:

```sh
yarn example android
```

To run the example app on iOS:

```sh
yarn example ios
```

To confirm that the app is running with the new architecture, you can check the Metro logs for a message like this:

```sh
Running "AdgeistExample" with {"fabric":true,"initialProps":{"concurrentRoot":true},"rootTag":1}
```

Note the `"fabric":true` and `"concurrentRoot":true` properties.

## Environments

The SDK targets three backend environments, mapped to git branches:

| Branch | Environment | `PACKAGE_SUFFIX` | `BACKEND_DOMAIN`                         | npm version | dist-tag |
| ------ | ----------- | ---------------- | ---------------------------------------- | ----------- | -------- |
| `main` | beta        | `-beta`          | `https://beta.v2.bg-services.adgeist.ai` | `X.Y.Z-beta`| `beta`   |
| `qa`   | qa          | `-qa`            | `https://qa.v2.bg-services.adgeist.ai`   | `X.Y.Z-qa`  | `qa`     |
| `prod` | prod        | (empty)          | `https://v2.bg-services.adgeist.ai`      | `X.Y.Z`     | `latest` |

- Environment values (`PACKAGE_SUFFIX`, `BACKEND_DOMAIN`) live in `src/env.ts`.
- The package version (`PACKAGE_VERSION`) lives in `src/constants.ts`.
- The committed baseline of `src/env.ts` is **empty strings**, on every branch. You prefill it locally with `yarn set-env` while developing, and the publish workflow writes the real values for the target environment at publish time — so promoting `main` → `qa` → `prod` never causes merge conflicts.

### Switching environments locally

```sh
yarn set-env beta|qa|prod          # set PACKAGE_SUFFIX and BACKEND_DOMAIN in src/env.ts
yarn set-env --domain <url>        # set only BACKEND_DOMAIN (e.g. http://localhost:3000)
```

To run the example app against a specific environment (switches env.ts, then starts Metro):

```sh
yarn example:beta
yarn example:qa
yarn example:prod
```

Then run `yarn example android` or `yarn example ios` in another terminal.

> **Never push a modified `src/env.ts` to the remote repo.** Its committed values must stay empty strings — the publish workflow fills them in. Before committing, restore it with `git restore src/env.ts`.

### Versioning

`scripts/sync-version.js` (run automatically by the `prepare` script) sets the `package.json` version to `PACKAGE_VERSION` (from `src/constants.ts`) + `PACKAGE_SUFFIX` (from `src/env.ts`) — e.g. `0.0.32` + `-beta` → `0.0.32-beta`. To cut a new version, bump `PACKAGE_VERSION` in `src/constants.ts` only; never edit the `package.json` version by hand.

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

### Commit message convention

We follow the [conventional commits specification](https://www.conventionalcommits.org/en) for our commit messages:

- `fix`: bug fixes, e.g. fix crash due to deprecated method.
- `feat`: new features, e.g. add new method to the module.
- `refactor`: code refactor, e.g. migrate from class components to hooks.
- `docs`: changes into documentation, e.g. add usage example for the module..
- `test`: adding or updating tests, e.g. add integration tests using detox.
- `chore`: tooling changes, e.g. change CI config.

Our pre-commit hooks verify that your commit message matches this format when committing.

### Linting and tests

[ESLint](https://eslint.org/), [Prettier](https://prettier.io/), [TypeScript](https://www.typescriptlang.org/)

We use [TypeScript](https://www.typescriptlang.org/) for type checking, [ESLint](https://eslint.org/) with [Prettier](https://prettier.io/) for linting and formatting the code, and [Jest](https://jestjs.io/) for testing.

Our pre-commit hooks verify that the linter and tests pass when committing.

### Publishing to npm

Publishing is done from GitHub Actions via the **Publish** workflow (`.github/workflows/publish.yml`) — never from a local machine. It uses [npm trusted publishing (OIDC)](https://docs.npmjs.com/trusted-publishers), so no npm tokens are involved; the workflow filename `publish.yml` must stay in sync with the trusted-publisher config in the npm package settings.

Release flow:

1. Bump `PACKAGE_VERSION` in `src/constants.ts` and merge to `main`.
2. GitHub → Actions → **Publish** → Run workflow on `main` → publishes `X.Y.Z-beta` under the `beta` dist-tag.
3. Promote `main` → `qa`, run Publish on `qa` → publishes `X.Y.Z-qa` under the `qa` dist-tag.
4. Promote `qa` → `prod`, run Publish on `prod` → publishes `X.Y.Z` under `latest`.

The workflow resolves the environment from the branch it runs on (see the table above) and fails fast if:

- it is run from any branch other than `main`, `qa`, or `prod`, or
- the resolved version already exists on npm — bump `PACKAGE_VERSION` first.

Consumers install prod with a plain `npm install @thealteroffice/react-native-adgeist`; pre-release builds via the `@beta` / `@qa` dist-tags.

A Slack notification step exists in the workflow (currently commented out). Enabling it requires the `SLACK_NOTIFICATION_WEBHOOK_URL` repository secret.

### Scripts

The `package.json` file contains various scripts for common tasks:

- `yarn`: setup project by installing dependencies.
- `yarn typecheck`: type-check files with TypeScript.
- `yarn lint`: lint files with ESLint.
- `yarn test`: run unit tests with Jest.
- `yarn example start`: start the Metro server for the example app.
- `yarn example android`: run the example app on Android.
- `yarn example ios`: run the example app on iOS.
- `yarn example:beta` / `yarn example:qa` / `yarn example:prod`: switch environment and start Metro.
- `yarn set-env <beta|qa|prod>`: set `PACKAGE_SUFFIX` and `BACKEND_DOMAIN` in `src/env.ts`.
- `yarn set-env --domain <url>`: point `BACKEND_DOMAIN` at an arbitrary backend for local development.
- `yarn sync-version`: sync the `package.json` version from `src/constants.ts` + `src/env.ts` (runs automatically via `prepare`).

### Sending a pull request

> **Working on your first pull request?** You can learn how from this _free_ series: [How to Contribute to an Open Source Project on GitHub](https://app.egghead.io/playlists/how-to-contribute-to-an-open-source-project-on-github).

When you're sending a pull request:

- Prefer small pull requests focused on one change.
- Verify that linters and tests are passing.
- Review the documentation to make sure it looks good.
- Follow the pull request template when opening a pull request.
- For pull requests that change the API or implementation, discuss with maintainers first by opening an issue.
