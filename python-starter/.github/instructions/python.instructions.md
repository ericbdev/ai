---
applyTo: "**/*.py"
---

The rules for this repository are in `AGENTS.md` at its root; follow them. When writing or
reviewing Python here, check these first, because they are the ones a change most often breaks:

- Code sits in the bounded context that owns it; a context imports only itself and `shared/`.
- `domain/` is pure: no I/O, clock, randomness, settings or `async`. `application/` arranges
  ports and holds no product rule.
- Every port has an in-memory adapter that passes the same contract suite as the real one.
- A rule fails with its context's own error class, one per refusal; no bare `ValueError`.
- Types: no `# type: ignore`, closed sets are `Literal`, same-typed parameters are keyword-only.
- A new module has its row in its context's `README.md`.
- `make check` passes; `tests/test_architecture.py` and `tests/test_context_docs.py` are never
  relaxed to make a change pass.
