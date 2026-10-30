# 0004. Every port has a fake that passes the real adapter's contract suite

- Status: Accepted
- Date: YYYY-MM-DD

## Context

Tests that need a database, a network or a key are slow, flaky and skipped. Tests that use hand-rolled mocks pass while the real adapter behaves differently. Either way the application tests stop proving anything.

## Decision

- Every port has an in-memory or offline adapter beside its real one.
- Each port has one contract suite in `tests/adapters/`, parametrised over every adapter of that port (`test_task_repository_contract.py` runs the memory and JSON-file repositories). A new adapter joins the fixture; a new behaviour joins the suite for all of them.
- Application tests use the fakes and nothing else. A behaviour that matters to the application and is not in the contract suite is added to it first.
- Time, randomness and ids reach the domain as arguments; the application gets them through ports (`Clock`), so tests fix them.
- A real adapter that needs a service the CI does not have runs its contract suite against a local stand-in (an emulator or a container) in a separate job, never by skipping the suite.

## Consequences

- `make test` is fast and needs nothing installed beyond the project.
- Adding a dependency costs a port, two adapters and a suite. That is the price of tests that keep meaning something.
- A fake that drifts from the real adapter fails the suite instead of hiding a bug.
