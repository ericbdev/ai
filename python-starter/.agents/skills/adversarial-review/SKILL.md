---
name: adversarial-review
description: Review a change adversarially in rounds - hunt for real defects, verify each finding in the code or by running it, then fix or file it. Use before merging a risky change (a boundary, a stored format, spend, an external call, auth) or when the user asks for an adversarial or deep review.
---

# Adversarial review

Assume the change is wrong and try to prove it. A finding counts only once it is verified.

1. **Scope.** Read the diff, the ADRs it touches and the README of each context it changes. List what the change claims to do.
2. **Hunt** across these axes, writing each suspicion down with a file and line:
   - correctness: wrong result, unhandled `None`, a rule in the wrong layer, an error caught too broadly;
   - boundaries: a cross-context import, a domain type on the wire, a port in the wrong context, a fake that no longer matches the real adapter;
   - cost and determinism: a paid call not cached or capped, a cache key that misses an ingredient (an input, a version, a setting);
   - untrusted data: anything shown or stored before an adapter validated it and a domain rule accepted it;
   - types: `str` where a `Literal` belongs, positional parameters of one type, an ignore comment.
3. **Verify** each suspicion: trace a real input to the failure, or write the failing test. Mark it *verified*, *read in code; not run*, or *dropped*. Drop what you cannot make real.
4. **Act:** fix verified defects with a test that failed before the fix. A verified issue you choose not to fix goes to `docs/tech-debt.md` with its severity and how it was verified.
5. **Repeat** until a round finds no verified High or Medium. Report per round: found, verified, fixed, filed. Run `make check` after the last fix.
