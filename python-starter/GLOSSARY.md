# Glossary

The words this codebase uses. Agents and people use these terms in code, tests, docs and commits, and avoid the listed synonyms. Add your product's terms as you name them; replace the example's when you delete it.

## Architecture

**Context** (bounded context):
A top-level package under `src/starter/` with its own language, rules and ports.
_Avoid_: module (for a whole context), feature folder, service

**Shared kernel**:
The `shared/` package: what every context agrees on and none owns alone. Code arrives here on its second use.
_Avoid_: common, utils, core

**Outer ring**:
`bootstrap.py`, `config.py` and `adapters/`: the only code that touches more than one context.

**Decides / arranges**:
What `domain/` and `application/` do. Domain code decides (pure rules); application code arranges (ports in order, caching, retries, spend).
_Avoid_: business logic, orchestration

**Port**:
A `Protocol` a context declares for something it needs from outside.
_Avoid_: interface, repository (unless it stores aggregates)

**Adapter**:
A class in `adapters/` that fills a port (outbound) or drives a context (inbound).

**Contract suite**:
The tests every adapter of one port passes, in-memory and real alike.
_Avoid_: integration tests

**Refusal**:
A rule failure, raised as its own exception class under the context's error.
_Avoid_: validation error, exception (for rule failures)

**Throwaway**:
A setting that keeps nothing past the process (`APP_STORAGE=memory`); the default for every setting.
_Avoid_: offline, dev mode

**Wire schema**:
The shape an inbound adapter sends out (`TaskView`), declared in that adapter.
_Avoid_: DTO

## Example context

**Task**:
The example's aggregate: **open** until **completed**, completed at most once.
