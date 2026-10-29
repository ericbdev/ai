# 0003. Configuration from the environment only, throwaway by default

- Status: Accepted
- Date: YYYY-MM-DD

## Context

An app that reads `.env` by itself points any hand-run command at whatever `.env` selects: a real database, a paid API. Settings scattered through the code are hard to audit, and a deploy that starts on throwaway settings loses data without an error.

## Decision

- The app reads configuration from environment variables (`APP_` prefix) through one `pydantic-settings` class, and never opens `.env`. The Makefile passes `.env` to `uv run --env-file`; a variable already in the shell wins.
- Every default is throwaway and needs no credentials (`APP_STORAGE=memory`).
- `check-config` prints the settings with no side effects; `--require-durable` fails when a throwaway setting is selected, so a deploy never starts on one.
- A closed set of choices is a `Literal`, so an unknown value fails at start-up.
- Logs go to stderr as one stream; stdout is command output.

## Consequences

- `uv run starter ...` started by hand is throwaway unless you export variables or pass `--env-file`.
- As the app grows, split settings per context (one class each, composed by `Settings`), and test that every setting belongs to one owner.
