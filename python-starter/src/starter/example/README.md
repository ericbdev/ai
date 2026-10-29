# Example context

**Delete this context when you add your first real one**, with its tests and its rows in `AGENTS.md`, `bootstrap.py` and `adapters/` (`memory.py`, `json_file.py`, `system_clock.py`, `inbound/cli.py`). It is here to show every pattern the rules ask for, in the smallest code that runs:

- a pure aggregate whose changes return a new value and whose refusals are named errors;
- a service that arranges ports and holds no rule;
- ports owned by the context, each with an in-memory and a durable adapter that pass one contract suite;
- a clock behind a port, so the domain never reads the time;
- a driving adapter (the CLI) with its own output schema.

Its subject is a task that is opened and then completed.

## Takes and hands over

- Takes a title or a task id from a driving adapter (the CLI's `add`, `done` and `list`).
- Hands over `Task` values; the CLI turns them into its own `TaskView`.

## Ports it owns

`TaskRepository` and `Clock`, in `application/ports.py`. Adapters: `MemoryTaskRepository`, `JsonFileTaskRepository`, `SystemClock` (tests use a fixed clock).

## Modules

| Layer | Module | Concept |
|---|---|---|
| domain | `domain/task.py` | `Task` and its lifecycle (`open`, `complete`), and the refusals `BlankTitle`, `TitleTooLong` and `AlreadyDone` under `TaskError` |
| application | `application/ports.py` | the store and the clock, as this context needs them |
| application | `application/service.py` | `TaskService` (add, complete, list) and `TaskNotFound` |
