---
name: new-context
description: Add a new bounded context to this Python package the way ADR 0002 requires - package, layers, ports, fakes, README and agent notes. Use when a feature has its own language and rules and does not belong to an existing context.
---

# New bounded context

1. **Check it is a context.** It has its own nouns and its own rules, and usually a port of its own. If it is a helper for one context, put it in that context. If two contexts need it, it is a shared-kernel module, not a context.
2. **Create the package** `src/starter/<context>/` with `__init__.py`, and only the layers it needs:
   - `domain/` for rules: pure functions and frozen dataclasses, the context's error class (`<Context>Error(DomainError)`) and one subclass per refusal.
   - `application/ports.py` for the `Protocol`s it calls, and `application/service.py` (or a module per use case) for the code that arranges them.
3. **Write the domain tests first** (`tests/domain/test_<concept>.py`), with hand-built inputs. Name each test for the behaviour.
4. **Adapters:** for each new port, an in-memory adapter in `adapters/outbound/`, the real one, and a contract suite both pass (ADR 0004). Wire them in `bootstrap.py` only.
5. **Document:** `src/starter/<context>/README.md` in the shape of `example/README.md` (what it owns, takes and hands over, ports, every module by layer), and a row in the context table in `AGENTS.md` with the package written as `` `<context>/` ``.
6. **Run** `make check`. `test_architecture.py` and `test_context_docs.py` find the new context by themselves; fix what they report, never the tests.
7. If the context changes a boundary, a stored format or a cost, record it with the `record-decision` skill.
