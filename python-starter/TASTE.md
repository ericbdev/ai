# Taste

The engineering taste this starter encodes, for any Python project whatever its domain. The first part lists the judgement calls to copy. The second says where the same habits cost more than they return, and what this starter does instead, so you can tell which defaults to keep and which to grow into.

## The judgement calls

### Product

1. **Checkable over clever.** The primary result is one a reader can verify against the input by hand; anything uncertain or derived is shown *beside* it, labelled, never in its place. The product principle comes before the technique, and decides it.
2. **The input is the source of truth.** Nothing appears that no input supports. Anything from outside is a proposal until an adapter validates it and a pure rule accepts it.
3. **Cost is a design input.** Every paid or slow call is cached, capped or both. Everything that shapes a result (inputs, versions, settings) is part of its cache key, so a change never serves a stale result.
4. **Partial and failed are normal states**, shown to the user rather than hidden.
5. **Non-goals are written down.**

### Architecture

6. **Bounded contexts first, hexagonal layers second** ([ADR 0002](docs/adr/0002-bounded-contexts-then-layers.md)). The two questions, "which context owns it?" then "does it decide or arrange?", turn placement into a lookup.
7. **Domain decides, application arranges.** Domain code is pure: no I/O, clock, randomness, settings or `async`. An `if` in a service that states a product rule moves into the domain. An aggregate knows nothing of its store.
8. **Dependency inversion at every seam.** Ports live with their caller; a context that needs another declares the interface it reads, and an outbound adapter bridges the two, mapping enums name by name so a new value fails loudly at the seam.
9. **The shared kernel grows only on the second use**, one module per concept, and its README lists each.
10. **The composition root builds and never adapts.** Driving adapters own the wire schema and map named errors; no broad `except`.
11. **Every port has a fake that passes the real adapter's contract suite**, so application tests on fakes test real behaviour. Swappable vendors are held to parity by one suite.

### Enforcement over exhortation

12. **Rules are tests.** `test_architecture.py` reads imports with `ast` and fails on a cross-context import, an impure domain, an SDK outside `adapters/outbound/`, a private-name import, a composition root that defines an adapter, or an API that answers with a domain type.
13. **Docs are tests.** Each context README must list exactly its modules and name its ports; the agent notes must name every context. Docs cannot drift silently.
14. **Shrink-only baselines.** When a gate is added to existing code (ty, legacy wire types), the failing files are listed once and the list may only shrink. Never relax the gate.
15. **"Do not relax them to make a change pass."** Said explicitly to agents.

### Python

16. `uv` and a lockfile; ruff with annotations required on the inner rings; ty over the package with warnings as errors; pytest; Python 3.12 generics (`def f[T: Base]`).
17. Closed sets are `Literal`/`StrEnum`; records have named fields; same-typed parameters are keyword-only; `Optional` is handled where it appears; one exception class per refusal, never a subclass of `ValueError`.
18. Settings from the environment only, `.env` loaded by the launcher not the app, throwaway defaults, a `check-config` that fails on them in the deploy path. Logs to stderr, output to stdout. Twelve-factor, checked factor by factor in an ADR.

### Process

19. **ADRs for every decision that an agent might undo**, superseded rather than edited, indexed with status and amendments.
20. **A tech-debt register** with ID, severity, *how it was verified* ("read in code; not run" vs "reproduced in a test"), and when to fix it.
21. **Adversarial review in rounds** before merging risky work, with each finding verified in code or by a run before it is acted on.
22. **Tuning with frozen labels:** any heuristic is evaluated on a fixed labelled set with a spend plan, and the history of what was tried is kept.
23. **Write for the agent.** Short declarative rules stated as the behaviour you want, pointers that say when to follow them, a glossary the code uses, and every always-loaded line earning its place ([writing-for-agents](https://github.com/mattpocock/skills/blob/main/skills/productivity/writing-for-agents/SKILL.md)). Commit titles are sentences that say what changed and why.

## Where these habits cost more than they return

The same habits that keep a codebase checkable can bury it in process. Watch for these.

- **Agent notes that grow without limit.** An `AGENTS.md` that collects product theory, every command's flags, deploy steps and frontend rules costs an agent its context on every task, and the boundary rules drown in operational detail. *Starter default:* `AGENTS.md` holds only rules that apply to every task; background goes to `PRODUCT.md` and ADRs, command flags to `make help` and `--help`, per-context rules to the context README.
- **Vendor boilerplate in the house rules.** Tool installers append their own instructions ("always use this tool first"), generic skills and hooks that fire on every command. They contradict a verify-before-acting culture and often sit where the agent does not load them. *Starter default:* each tool is framed as a finder, not a gate; hooks are opt-in; skills are folders, and a test checks their shape.
- **One agent's file only.** Rules written for one tool leave the others guessing. *Starter default:* one `AGENTS.md`, imported by `CLAUDE.md`, with skills and MCP servers that Claude Code, Codex and Copilot all read ([`docs/agents.md`](docs/agents.md)).
- **Process volume for a small team.** Dozens of ADRs and debt entries are good recall but heavy upkeep, and ADRs that carry long amendment chains make a newcomer replay history to learn the current rule. *Starter default:* when an ADR collects more than two amendments, write a new one that states the current decision whole and supersede the chain.
- **A shared kernel that becomes the centre of gravity.** "Second use moves it to the kernel" is right, but when the core algorithm lives there the contexts are only shells. *Starter default:* watch the ratio of kernel to context code; move a module back when only one context uses it.
- **Validation types in the domain.** Domain types that are pydantic models make the pure layer depend on a validation library, and their serialised shape doubles as a stored format. It works; make it a conscious choice. *Starter default:* frozen dataclasses for domain values, pydantic where data crosses a trust boundary (HTTP, files, settings, third-party payloads), as the example's `Task` and the CLI's `TaskView` show.
- **Commit conventions that drift.** Pick one per repository (conventional commits or descriptive sentences) and say which in `AGENTS.md`.
- **Gates added late.** A type gate added after hundreds of commits needs a baseline of failing files. Starting typed costs almost nothing.

## In one line

Design for *verifiability*: of results by users, of the architecture by tests, of claims by checking before acting, and of cost by caps and cache keys. Keep every gate, and start every document small, so the habits scale before the paperwork does.
