---
name: record-decision
description: Writes an architecture decision record in docs/adr. Use when a change alters a boundary, a stored format, a cost or an external dependency, when it sets a rule an agent might otherwise undo, or when the user asks for an ADR.
---

1. **Number it.** Copy `docs/adr/template.md` to `docs/adr/NNNN-short-title.md`, NNNN being the next number in `docs/adr/README.md`.
2. **Context:** the forces, in plain words: what hurt, what it cost, each option considered and why it lost. Numbers beat adjectives. Done when a reader who missed the discussion could pick the same option.
3. **Decision:** what we will do, in full sentences, naming the files, settings and tests that carry it. Done when a reviewer could check a diff against it.
4. **Consequences:** what gets easier, what gets harder, what becomes debt (with its entry in `docs/tech-debt.md`), and which earlier ADRs it amends or supersedes.
5. **Link it.** Update only the status line of any ADR it amends or supersedes; add the row to `docs/adr/README.md`; where `AGENTS.md` states the rule, link the ADR on that line. Done when `make check` is green (it checks the index).
