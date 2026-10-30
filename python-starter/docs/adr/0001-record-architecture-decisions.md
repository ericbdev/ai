# 0001. Record architecture decisions

- Status: Accepted
- Date: YYYY-MM-DD

## Context

Agents and people both change this code. Neither can recover why a rule exists from the code alone, and an agent that cannot see the reason will "fix" the rule.

## Decision

Record each significant decision as an ADR in `docs/adr/`, numbered in order, in [Michael Nygard's format](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions): context, decision, consequences. Add it to the index in `docs/adr/README.md`. Never edit an accepted ADR's decision: supersede it with a new one and mark the old one `Superseded by NNNN`. Amendments that refine without reversing say so in the status line.

Significant means: it changes a boundary, a stored format, a cost, an external dependency, or a rule an agent might otherwise undo.

## Consequences

- `AGENTS.md` can state a rule in one line and link the reason.
- `tests/test_context_docs.py` fails when an ADR is missing from the index.
- Writing an ADR is cheap; skipping one is expensive later. Prefer a short one now.
