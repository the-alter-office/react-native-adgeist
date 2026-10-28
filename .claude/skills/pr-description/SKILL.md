---
name: pr-description
description: Write a PR title and description for the current branch in this project's fixed format. Use whenever the user asks for a PR title, PR description, PR summary, or to open/create a pull request.
---

# PR title and description

## Pick the branches
Arguments: `$ARGUMENTS`

- Two names (`dev main`, or `from dev to main`): SOURCE is the first, TARGET is the second.
- One name (`dev`): SOURCE is that branch, TARGET is `main`.
- No arguments: SOURCE is the current branch, TARGET is `main`.

## Gather the changes
1. Run `git fetch origin` so the comparison uses what is on GitHub.
2. Use `origin/SOURCE` and `origin/TARGET`. If `origin/SOURCE` does not exist (branch not pushed), use the local SOURCE and say so.
3. Run `git log origin/TARGET..origin/SOURCE --oneline` and `git diff origin/TARGET...origin/SOURCE --stat`.
4. Read `git diff origin/TARGET...origin/SOURCE` for any file whose change is not clear from the stat.
5. If the log is empty, reply that SOURCE has nothing new for TARGET and stop.
6. Only when SOURCE is the current branch: if there are uncommitted changes (`git status`), mention they are not included.

## Title rules
- Exactly one line, at most 72 characters.
- Starts with one prefix: `feat:`, `fix:`, `chore:`, `refactor:`, `perf:`, `docs:`, `ci:`.
  Pick the one that fits the most important change.
- Summarises ALL changes on the branch, not only the latest commit.
- Lowercase after the prefix, no trailing period.

## Description rules
- Only a bullet list. No headings, no intro sentence, no closing sentence.
- One bullet per distinct change, ordered most important first.
- Every bullet fits on one line (about 100 characters max). Split long ideas into two bullets.
- Start each bullet with a verb in past tense: Added, Removed, Fixed, Changed, Renamed.
- Name the class, file or JSON key when it helps a reviewer, wrapped in backticks.
- Do NOT add a "Generated with Claude Code" line or any other footer.

## Output
Reply with exactly this, and nothing else:

**Title**
```
<title>
```

**Description**
```
- <bullet>
- <bullet>
```

Do not create or push the PR unless the user explicitly asks.
