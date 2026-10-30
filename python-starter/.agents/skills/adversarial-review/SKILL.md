---
name: adversarial-review
description: Reviews a change in rounds, verifying each finding before acting on it. Use before merging a change to a boundary, a stored format, spend, an external call or auth, or when the user asks for an adversarial or deep review.
---

Treat the change as wrong until each claim survives a check.

1. **Scope.** Read the diff, the ADRs it touches and the README of every context it changes. Done when you can list what the change claims to do.
2. **Hunt.** Record each suspicion with a file and a line, along these axes:
   - correctness: a wrong result, an unhandled `None`, a rule in the arranging layer, a broad catch;
   - boundaries: a cross-context import, a domain type on the wire, a port in the wrong context, an in-memory adapter that no longer matches the real one;
   - cost and determinism: a paid call uncached or uncapped, a cache key missing an ingredient (an input, a version, a setting);
   - untrusted data: anything shown or stored before its adapter validated it and a domain rule accepted it;
   - types: `str` where a `Literal` belongs, positional parameters of one type, an ignore comment.
3. **Verify.** Trace a real input to the failure, or write the failing test. Mark each suspicion *verified*, *read in code; not run*, or *dropped*. Done when every suspicion carries one mark.
4. **Act.** Fix each verified defect with a test that failed before the fix. A verified issue you leave goes to `docs/tech-debt.md` with its severity and how it was verified.
5. **Repeat** from step 2. Done when a round ends with no verified High or Medium, and `make check` is green after the last fix.
6. **Report** per round: found, verified, fixed, filed.
