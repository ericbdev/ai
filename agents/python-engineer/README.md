# python-engineer Agent

A [Claude Code](https://claude.com/claude-code) subagent that builds and reviews Python services in the style of [python-starter](../../python-starter/README.md): bounded contexts with hexagonal layers, gates enforced as tests, throwaway defaults, and every port with a fake that passes the real adapter's contract suite.

The taste it works to is in [`python-starter/TASTE.md`](../../python-starter/TASTE.md).

## Installation

**Per-project:**

```sh
mkdir -p .claude/agents
cp AGENT.claude.md .claude/agents/python-engineer.md
```

**Global:**

```sh
mkdir -p ~/.claude/agents
cp AGENT.claude.md ~/.claude/agents/python-engineer.md
```

It reads the project's `AGENTS.md` first; in a project started from python-starter the two agree. Pair it with the starter's skills (`new-context`, `record-decision`, `adversarial-review` in `.agents/skills/`).

This file is a Claude Code subagent. With Codex or Copilot, the same behaviour comes from the starter's `AGENTS.md` and skills, which both tools read.

## Usage

```
Add a context that imports invoices from CSV
Review this branch against the boundary rules
@python-engineer: add a SQLite adapter for TaskRepository
```

## Workflow

1. Reads `AGENTS.md`, `PRODUCT.md` and the README of each context it will touch
2. Writes the domain rule and its tests first
3. Adds the port, a fake and the contract suite entry
4. Writes the service, then wires the real model adapter
5. Runs `make check`, updates context READMEs, ADRs and the debt register
6. Runs an adversarial review for risky changes and reports what it verified
