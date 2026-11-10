# SDK workflow

Shared rules for all Adgeist SDK repos (Android, iOS, React Native, Web, Unity; publisher and advertiser). These override CONTRIBUTING where they differ.

## Branches
- `main`: current production-stable code.
- `dev`: integration; every task PR targets it first.
- `qa`: QA builds; promoted from the same task branch after the `dev` merge.

## Branching
- New task: `git fetch origin`, then create a new branch from `origin/main`. Never branch from `dev` or `qa`.
- Follow-up to a task: commit on that task's existing branch, not a new one.
- If the earlier PR from that branch already merged, open a new PR from the same branch.

## Pull requests
- Task done: open a PR from the task branch to `dev`. Wait for review.
- After the `dev` PR merges: open a PR from the same branch to `qa`, titled `(QA) <original title>`.
- Body: short summary of the work done in the session. Nothing else.
- No risk assessments, no long test-plan sections.
- Commit/push only when the user asked and `CLAUDE.md` allows.

## Coding rules
- Don't overengineer. Smallest change that does the job.
- Reference implementation given (e.g. a branch): mirror exactly that and nothing more.
- Before adding an API, look for an existing function in this repo and in the native SDKs. Don't add a parallel API.
- SDKs expose simple functions. The host app is responsible for calling them correctly (e.g. ATT only while the app is active). No app-state handling inside the SDK.
- New error paths: PostHog capture only. No `logD` / `Logger.log`.
- Fix lint problems, including pre-existing ones. Don't just report them.

## Builds and tests
- Run builds, tests and lint in the cloud environment.
- Don't ask the user to run anything on their own computer.
- Exception: artifacts that can't be built in the cloud (APK, AAR, xcframework). The user builds those from the commands in CONTRIBUTING; point to them.

## Replies
- Short and terse. No emoji. No risk assessments.
