---
name: new-context
description: Adds a bounded context to src/starter. Use when a feature brings its own nouns and rules, when code fits no existing context, or when the user asks for a new context or module area.
---

The rules this skill applies are in `AGENTS.md` (Placing code, Boundaries); read them first.

1. **Confirm it is a context.** Name its nouns and two of its rules. Done when neither fits an existing context's README and the code is more than a helper for one context (a helper stays in that context).
2. **Write the domain tests** in `tests/domain/test_<concept>.py` with hand-built inputs, one test per rule and per refusal. Done when every rule you named fails its test.
3. **Write the domain** in `src/starter/<context>/domain/`: frozen dataclasses, the context's error under `DomainError`, one class per refusal. Done when the domain tests pass.
4. **Add each port** to `application/ports.py`, with an in-memory adapter, the real adapter and a contract suite that runs both. Done when the suite passes for every adapter.
5. **Write the service** in `application/`, with tests that use the in-memory adapters. Done when every use case has a test.
6. **Wire it** in `bootstrap.py` and the inbound adapter that drives it, with a wire schema there.
7. **Document it:** `src/starter/<context>/README.md` in the shape of `example/README.md`, a row in the context table of `AGENTS.md` (package written as `` `<context>/` ``), and its terms in `GLOSSARY.md`.
8. **Check.** Done when `make check` is green; the architecture and docs tests find the context by themselves.
