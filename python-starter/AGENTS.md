# AGENTS.md

Rules for agents and people working in this repository. Claude Code, Codex and Copilot all read this file; skills are in `.agents/skills/` and MCP servers in `.mcp.json`, with the tool-specific files described in [`docs/agents.md`](docs/agents.md). Read this file in full before your first change; read the README of the context you are changing before you change it. Decisions and their reasons are in [`docs/adr/`](docs/adr/README.md); the taste behind them is in [`TASTE.md`](TASTE.md).

Keep this file short. It holds rules an agent must follow on every task. Product background goes in [`PRODUCT.md`](PRODUCT.md), the reasons for a rule in an ADR, a context's details in its README, and a command's flags in `make help`. A rule that is only true for one context belongs in that context's README.

## Product objectives

<!-- Replace with 3–5 numbered objectives, each one sentence of rule and one of why. The examples
are the defaults this starter assumes; keep the ones that still hold. -->

1. **Checkable over clever.** Whatever the product shows can be traced to its input by a reader. Anything uncertain is shown beside the checkable result, labelled, never in its place.
2. **Cheap and repeatable.** A run is deterministic for a given input and configuration. Paid or slow calls are cached, capped, or both, and everything that changes a result is part of its cache key.
3. **Throwaway by default.** `make test` needs no credentials, network or real backing service. The app reads only its environment; it never opens `.env` itself.

Non-goals for now: <!-- say what you are deliberately not building -->.

## Where code goes

**Bounded contexts first, layers second** ([ADR 0002](docs/adr/0002-bounded-contexts-then-layers.md)). Place code by asking two questions, in this order.

1. **Which context owns it?** The one whose language and rules it speaks.

   | Context | Package | Owns |
   |---|---|---|
   | Example | `example/` | the starter's example (a task, opened then completed); delete it for your first context |
   | Shared kernel | `shared/` | what every context agrees on and none owns alone |

   Code one context uses lives in that context. Code a second context needs moves to the shared kernel in the same change, one module per concept; never import across contexts to save the move. The outer ring, `bootstrap.py` (the composition root), `config.py` (settings) and `adapters/`, is the only code that touches more than one context.
2. **Does it decide or arrange?**
   - `domain/` **decides**: pure, deterministic functions and types. No I/O, not even through a port; no clock, randomness or settings (they come in as arguments); no `async`. You could check it by hand in a REPL.
   - `application/` **arranges**: services that call ports in order, cache, retry, cap spend and handle failure, and the context's `ports.py`. If it is `async` or calls a port, it is application.
   - When an application class grows an `if` that states a product rule, move the rule into the domain.
   - A context has only the layers it needs.

## Boundaries

- **Ports live with the context that uses them**, in its `application/ports.py`, as `Protocol`s. A port moves to `shared/application/ports.py` only when a second context calls it.
- **Every port has an in-memory or offline adapter** that passes the same contract suite as the real one ([ADR 0004](docs/adr/0004-every-port-has-a-contract-suite.md); `tests/adapters/test_task_repository_contract.py` is the pattern). A new adapter joins the suite's fixture; a new behaviour joins the suite for every adapter.
- **Libraries that reach outside the process are imported only by the outer ring** (`adapters/`, `bootstrap.py`, `config.py`). Untrusted data enters through a pydantic model at the adapter and is checked by a domain rule before anything relies on it.
- **The composition root builds; it never adapts.** `bootstrap.py` chooses adapters and defines no class but `Container`.
- **Driving adapters own the wire and map named errors.** A response schema is declared in the inbound adapter, never a domain type. A context raises its own exception types, one class per refusal, under its context error (`AlreadyDone` under `TaskError` under `DomainError`); adapters map each to one response and never catch `Exception`, `ValueError`, `KeyError` or `LookupError`.
- **No module imports another's private name.** A helper two modules need is public and lives where both may import it. No `utils`, `helpers`, `common` or `misc` module anywhere.
- **Settings:** one `pydantic-settings` class in `config.py` reads `APP_`-prefixed variables. Every default is throwaway and needs no credentials. A setting that changes output is part of the cache key.
- `tests/test_architecture.py` and `tests/test_context_docs.py` enforce all of the above. **Do not relax them to make a change pass**; if a rule is wrong, change it in an ADR first.

### Checklist for a change that adds, moves or removes code

- **New module:** pick its context and layer with the two questions, then add its row to that context's `README.md`.
- **New port:** declare it where it is called, name it in the context README, give it a fake, add it to the contract suite.
- **New context:** a top-level package with the layers it needs, a `README.md` in the same shape as `example/README.md`, and a row in the table above. The tests find it by itself.
- **A second context needs code:** move it to `shared/` in the same change, with its row in `shared/README.md`.

## Python

- Python 3.12+, `uv` for everything (`uv add`, `uv run`); never `pip install` into the project.
- **Types are how a boundary states what it accepts.** `make typecheck` (ty, warnings as errors) covers `src/`; ruff `ANN` requires annotations on every `domain/` and `application/` function, `-> None` included.
  - New code passes with no `# type: ignore` or `# ty: ignore`. Narrow instead.
  - A closed set is a `Literal` or `StrEnum`, never `str`; a mapping keyed by one is typed by it.
  - A record has named fields: no tuple of more than two items crosses a function boundary (use a frozen dataclass, `NamedTuple` or model).
  - Several parameters of one type are keyword-only (`*, source_id, owner_id`), so they cannot be swapped silently.
  - `X | None` is handled where it appears; a function that promises a value returns one or raises the context's error.
  - `Any` only where a value really is untyped (a JSON payload).
  - If you adopt the gate on old code, list the failing files in `[[tool.ty.overrides]]`; that list only shrinks.
- Frozen dataclasses for domain values; pydantic models where data crosses a trust boundary (HTTP, files, settings, third-party payloads).
- Comments say why, not what. A module docstring says what the module owns and the rule it keeps.
- **Tests** read as specifications: `test_<behaviour in words>`, with a Given/When/Then docstring when the name is not enough. Domain tests use hand-built inputs; application tests use the fakes; adapter tests run the contract suite. No test needs a network, a key or a running service.

## External calls

- Every call that leaves the process goes through a port, with retries, timeouts and spend caps decided in the application layer and set in `config.py`.
- A paid or slow answer is cached by everything that shapes it; a change to any ingredient is a new key, never a stale answer.
- Record what a run spent, and cap it per run.
- A third-party payload is validated by a pydantic model in its adapter; an answer that does not fit is a named error, never a partial value.

## Commands

- `make install`, `make test`, `make lint`, `make typecheck`, `make check` (all three, as CI runs them).
- `make run ARGS='add "Write the README"'` runs the CLI, keeping data in `./.data`. It loads `.env`, which may point at real services; a command run by hand sees `.env` only with `uv run --env-file .env`.
- `uv run starter check-config [--require-durable]` prints the settings with no side effects; `--require-durable` fails on a throwaway setting (use it in deploy scripts).
- **Before pushing:** `make check`. CI runs the same.

## Decisions and debt

- Record a significant decision as an ADR in `docs/adr/` (Nygard: context, decision, consequences) and add it to the index. Never edit an accepted ADR's decision; supersede it.
- A shortcut you choose to leave goes in [`docs/tech-debt.md`](docs/tech-debt.md) with where, why it is debt and when to fix it. Delete the entry when you fix it.
- For risky changes, run an adversarial review before merging (`.agents/skills/adversarial-review/`): verify each finding in code before acting on it.

## Writing

Plain words, short sentences, the rule first and the reason after. Name things by what they are in the product's language ("completed task", not "processed item"). Commit messages and PR titles say what changed and why in one line; the body lists what a reviewer should check.

## Glossary

<!-- One line per term of your product. Agents use these words and no synonyms. Replace the
example's terms when you delete it. -->

- **Task:** the example's aggregate; **open** until **completed**, never completed twice.
- **Throwaway:** a setting that keeps nothing past the process (`APP_STORAGE=memory`).
