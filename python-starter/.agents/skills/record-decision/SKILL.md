---
name: record-decision
description: Record an architecture or product decision as an ADR (context, decision, consequences) and add it to the index. Use when a change alters a boundary, a stored format, a cost, an external dependency, or a rule an agent might otherwise undo, or when the user says "write an ADR" or "record this decision".
---

# Record a decision

1. Find the next number in `docs/adr/README.md`. Copy `docs/adr/template.md` to `docs/adr/NNNN-short-title.md`.
2. **Context:** the forces, in plain words: what hurt, what it costs, the options considered and why each lost. Numbers beat adjectives (a measured cost, a failure rate, a run that broke).
3. **Decision:** what we will do, in full sentences, specific enough that a reviewer can check a diff against it. Name the files, settings and tests that carry it.
4. **Consequences:** what gets easier, what gets harder, what is now debt (add it to `docs/tech-debt.md`), and which earlier ADRs it amends or supersedes.
5. If it supersedes or amends one, update that ADR's status line only; never rewrite an accepted decision.
6. Add the row to the index table. Link the ADR from `AGENTS.md` where the rule it creates is stated, in one line.
