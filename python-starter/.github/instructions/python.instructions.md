---
applyTo: "**/*.py"
---

Follow `AGENTS.md` at the repository root. Check these in every Python change; they are the rules a change most often breaks:

- Code sits in the context that owns it, and a context imports only itself and `shared/`.
- `domain/` is pure and synchronous: time, ids and settings arrive as arguments. `application/` arranges ports and holds no product rule.
- Each port has an in-memory adapter that passes the real adapter's contract suite.
- Each rule failure raises its own refusal class under the context's error.
- Types narrow until ty passes, closed sets are `Literal`, and same-typed parameters are keyword-only.
- A new module has its row in its context's `README.md`.
- `make check` is green, with `tests/test_architecture.py` and `tests/test_context_docs.py` unchanged unless an ADR changes a rule.
