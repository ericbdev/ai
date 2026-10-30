# AGENTS.md

Rules for every task in this repository. Claude Code, Codex and Copilot all load this file.

## Read next

- **Changing a context:** read its `README.md` (`src/starter/<context>/README.md`) first.
- **Deciding what a feature does:** read [`PRODUCT.md`](PRODUCT.md).
- **Naming a type, function, file or test:** use the terms in [`GLOSSARY.md`](GLOSSARY.md).
- **Adding a call that leaves the process:** follow [`docs/external-calls.md`](docs/external-calls.md).
- **A rule here looks wrong:** read its ADR in [`docs/adr/`](docs/adr/README.md) and [`TASTE.md`](TASTE.md), then propose a superseding ADR.
- **Adding a skill or an MCP server:** follow [`docs/agents.md`](docs/agents.md).
- **Editing this file, a skill or any doc an agent reads:** follow [writing-for-agents](https://github.com/mattpocock/skills/blob/main/skills/productivity/writing-for-agents/SKILL.md).

## Product objectives

<!-- Replace with your product's 3–5 objectives, each a rule and its reason. These three are the
starter's defaults; keep the ones that hold. -->

1. **Checkable.** A reader can trace every result to its input. Anything derived or uncertain sits beside the checkable result, labelled.
2. **Repeatable.** The same input and configuration give the same result. Paid or slow calls are cached and capped.
3. **Throwaway by default.** Tests and default settings need no credentials, network or running service.

## Placing code

Ask two questions, in order ([ADR 0002](docs/adr/0002-bounded-contexts-then-layers.md)).

1. **Which context owns it?** The one whose language and rules it speaks.

   | Context | Package | Owns |
   |---|---|---|
   | Example | `example/` | the starter's example: a task, opened then completed. Delete it with your first context |
   | Shared kernel | `shared/` | what every context agrees on and none owns alone |

   Code one context uses lives in that context. Code a second context needs moves to `shared/` in the same change, one module per concept. The **outer ring** (`bootstrap.py`, `config.py`, `adapters/`) is the only code that touches more than one context.
2. **Does it decide or arrange?** `domain/` **decides**: pure, synchronous, deterministic; time, ids and settings arrive as arguments. `application/` **arranges**: it calls ports in order, caches, retries, caps spend and handles failure. A product rule written as an `if` in a service belongs in the domain.

## Boundaries

- **Ports** are `Protocol`s in the calling context's `application/ports.py`. Each has an in-memory adapter that passes the real adapter's **contract suite** ([ADR 0004](docs/adr/0004-every-port-has-a-contract-suite.md)).
- **I/O libraries** live in the outer ring. Untrusted data is validated by a pydantic model in its adapter, then accepted by a domain rule.
- **`bootstrap.py`** constructs adapters; its only class is `Container`.
- **Refusals:** each rule failure is its own class under the context's error (`AlreadyDone` under `TaskError` under `DomainError`). Inbound adapters catch named classes and map each to one response.
- **Wire schemas** are declared in the inbound adapter (`TaskView`); domain types stay internal.
- **Modules** are named for their concept. A helper two modules share is public and lives where both can import it.
- **Settings** live in `config.py` as `APP_` environment variables with **throwaway** defaults. A setting that changes a result is part of its cache key.
- **Gates:** `tests/test_architecture.py` and `tests/test_context_docs.py` encode these rules. When one fails, change the code; a change to a rule starts as an ADR.

## Python

- `uv` runs everything; add dependencies with `uv add`.
- Types pass `make typecheck` (ty) and ruff's annotation rules on every `domain/` and `application/` function:
  - Narrow until the checker passes, with no ignore comments.
  - A closed set is a `Literal` or `StrEnum`, and a mapping keyed by one uses that type.
  - A record of three or more values has named fields (frozen dataclass, `NamedTuple` or model).
  - Parameters of the same type are keyword-only (`*, task_id, owner_id`).
  - `X | None` is resolved where it appears: look it up, branch, or raise the context's refusal.
  - `Any` marks only genuinely untyped data, such as a raw JSON payload.
  - The `[[tool.ty.overrides]]` baseline only shrinks.
- Domain values are frozen dataclasses; pydantic models sit at trust boundaries (HTTP, files, settings, third-party payloads).
- Tests are named for the behaviour they pin (`test_a_done_task_cannot_be_completed_again`). Domain tests use hand-built inputs, application tests use the in-memory adapters, adapter tests run the contract suite.

## Before you finish

1. Every module you added has its row in its context's `README.md`; a new context has a row in the table above.
2. A decision an agent might undo has an ADR (the `record-decision` skill); a shortcut you left has an entry in [`docs/tech-debt.md`](docs/tech-debt.md).
3. A change to a boundary, a stored format, spend, an external call or auth has been through the `adversarial-review` skill.
4. `make check` is green.

## Commands

- `make help` lists the targets; `make check` runs what CI runs.
- The `make` targets load `.env`; a command you run by hand sees it only through `uv run --env-file .env`.
- Deploy scripts run `uv run starter check-config --require-durable`, which fails on throwaway settings.
- Commit titles are one sentence saying what changed and why.
