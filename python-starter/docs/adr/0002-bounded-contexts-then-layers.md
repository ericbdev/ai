# 0002. Bounded contexts first, hexagonal layers second

- Status: Accepted
- Date: YYYY-MM-DD

## Context

Code mixes rules (what counts as valid, how totals add up) with I/O (stores, fetches, third-party APIs). Tests must run fast, free and without services, and a vendor must be swappable. Splitting by layer alone (`domain/`, `application/`, `adapters/` at the top) leaves ownership unclear: a feature's rule and its service live in two trees, and shared code drifts into "utilities".

## Decision

**Cut the code by bounded context first, then by layer inside each context.** A context is a top-level package with its own language, rules and ports. The shared kernel (`shared/`) holds what every context agrees on and imports no context. The outer ring (`bootstrap.py`, `config.py`, `adapters/`) is the only code that touches more than one context.

Inside a context, `domain/` **decides** (pure: no I/O, clock, randomness, settings or `async`) and `application/` **arranges** (services and ports: call ports in order, cache, retry, cap spend, handle failure).

**Dependency inversion at every boundary.** A port lives in the context that calls it. A context that needs another's behaviour declares the interface it reads, and an outbound adapter makes the other context's service fit it. Code a second context needs moves to the shared kernel in the same change.

**Every context documents itself** in a `README.md` listing what it owns, its handoffs, its ports and each module by layer.

**Enforced:** `tests/test_architecture.py` (imports, layers, SDK placement, no grab-bag modules, a composition root that only builds) and `tests/test_context_docs.py` (READMEs match the code).

## Consequences

- Where code goes is a lookup, not a judgement call.
- A feature's code is in one folder; deleting or extracting it touches one package and the outer ring.
- Adding an external dependency means a port, an adapter, a fake and a contract test. That is the price of service-free tests and swappable vendors.
- The shared kernel can grow into a junk drawer; the guard is "only when a second context needs it, one module per concept".
