# react-native-adgeist E2E matrix (Android)

End-to-end tests for [`@thealteroffice/react-native-adgeist`](https://www.npmjs.com/package/@thealteroffice/react-native-adgeist)
across the React Native versions host apps actually use.

This branch (`e2e/matrix`) is an orphan branch. It holds no library source: every app installs
the SDK from npm, using the version published to the QA environment.

## What is verified

For each app, on an Android emulator:

1. **App launches**: the release build installs and opens without crashing.
2. **Ad rendered**: the SDK emits `AL1` (`AD_LOADED`) and no unexpected `AE*` / `AW*` / `RWAE1` code.
3. **Click handled**: tapping the ad emits `AI1` (`AD_CLICKED`).

## What is NOT verified

- **Impression and click reporting.** `AD_LOADED` means the creative rendered and `AD_CLICKED`
  means the tap was handled. Neither proves that the native SDK reported an impression or a
  click to the backend.
- iOS, production, Expo apps and old-architecture builds.

## Which React Native versions

One app per React Native minor line. Within each line, the app uses the patch version with the
most npm downloads in the last week (prereleases excluded; ties go to the higher patch; a line
with no downloads uses its latest patch). The range moves forward: new lines are added and
low-share lines are retired through a reviewed pull request.

### Resolving the versions

```
yarn resolve-versions
```

Fetches last week's per-version download counts for `react-native` from
`api.npmjs.org/versions/react-native/last-week`, merges them with the full version list from the
npm registry (so versions with zero downloads still count), and writes `config/matrix.json` for
lines 0.77 to 0.86. It refuses to overwrite an existing `config/matrix.json`; pass `--force` to
replace it.

Other options:

| Option | Purpose |
|---|---|
| `--from <x.y>` / `--to <x.y>` | Line range, inclusive |
| `--out <file>` | Output file instead of `config/matrix.json` |
| `--save-snapshot <file>` | Save the fetched download data, to replay it later |
| `--snapshot <file>` | Use saved download data instead of fetching from npm |

### `config/matrix.json` fields

Top level:

| Field | Meaning |
|---|---|
| `package` | npm package the downloads were read for (`react-native`) |
| `fetchedAt` | When the download data was fetched (ISO 8601, UTC) |
| `source` | Where the data came from |
| `range` | The `from` / `to` lines the file was generated for |
| `lines` | One entry per React Native minor line |

Each entry in `lines`:

| Field | Meaning | Example |
|---|---|---|
| `line` | React Native minor line | `0.77` |
| `version` | Selected patch: the app in `appDir` runs exactly this version | `0.77.3` |
| `downloads` | Last-week downloads of the selected patch | `65919` |
| `shareOfLine` | Selected patch's downloads as a **percentage** of its line's downloads. A high value means a clear leader; a low value means the leader can change from week to week | `"59.44%"` |
| `lineDownloads` | Last-week downloads of all stable patches in the line combined | `110906` |
| `lineShare` | The line's downloads as a **percentage** of all stable `react-native` downloads. Used to decide when a line is added (≥ 0.5%) or retired (< 1% in two consecutive monthly checks) | `"0.77%"` |
| `latestPatch` | Newest published stable patch in the line, for comparison with `version` | `0.77.3` |
| `reason` | Why `version` was selected: `most downloaded patch`, or `latest patch (no downloads in line)` | `most downloaded patch` |
| `appDir` | Folder of the app for this line | `apps/rn-0.77` |

Percentages are strings with a `%` suffix, rounded to two decimals. Scripts that compare them
read them with `parsePercent` from `scripts/lib/npm-downloads.js`. Prereleases (`-rc`, nightlies) are excluded from every
count, including the totals.

## Layout

| Path | Contents |
|---|---|
| `config/e2e.defaults.json` | Placeholder AdGeist values. Real values come only from environment variables / GitHub secrets |
| `config/matrix.json` | Each React Native line, its selected version and its app folder |
| `scripts/` | Version selection, app generation, SDK install, advisory, Slack |
| `overlay/` | The E2E screen copied into every app |
| `maestro/` | Maestro flows |
| `apps/rn-x.y/` | One React Native app per minor line |

The GitHub Actions workflows that run this live on the default branch, because
`workflow_dispatch` and `schedule` only run from there.

## Local prerequisites

- Node 20.19 or newer
- Yarn classic 1.x
- JDK 17
- Android SDK with an API 35 `google_apis` x86_64 system image
- Maestro CLI

## Secrets

Committed values are placeholders. The real AdGeist app ID, package name and ad unit ID are
provided at build time only, and are never committed, logged or uploaded as artifacts.
