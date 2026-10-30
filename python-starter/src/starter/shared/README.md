# Shared kernel

What every bounded context agrees on and none owns alone ([ADR 0002](../../../docs/adr/0002-bounded-contexts-then-layers.md)). It imports no context; every context may import it.

Code comes here only when a second context needs it, in the same change that makes the second context use it, one module per concept. If only one context uses a module, it belongs in that context. Start small: a kernel that grows faster than the contexts is a junk drawer.

## Modules

| Layer | Module | Concept |
|---|---|---|
| domain | `domain/errors.py` | `DomainError`, the root every context's rule errors subclass |
