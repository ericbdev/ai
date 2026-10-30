# Python starter

A base for a new Python project, whatever its domain, set up for a developer working with a coding agent: Claude Code, Codex or GitHub Copilot. It is built the way [`TASTE.md`](TASTE.md) describes: bounded contexts with hexagonal layers, gates that are tests, throwaway defaults, and agent instructions that fit on a screen.

It holds no product of its own. One small, deletable `example/` context shows every pattern the rules ask for: a pure aggregate with named refusals, a service that only arranges, ports with an in-memory and a durable adapter that pass one contract suite, a clock behind a port, and a CLI with its own output schema.

## What is here

```
python-starter/
├── AGENTS.md            rules for agents and people; Codex and Copilot read it directly
├── CLAUDE.md            "@AGENTS.md": Claude Code reads the same rules
├── GLOSSARY.md          the words the code uses, and the synonyms to avoid
├── TASTE.md             the judgement calls behind the rules, and their costs
├── PRODUCT.md           who it is for and what good means (fill in first)
├── pyproject.toml       uv, ruff (annotations on inner rings), ty, pytest
├── Makefile             install, test, lint, typecheck, check, run, rename
├── .env.example         every setting, throwaway defaults
├── .mcp.json            MCP servers for Claude Code and VS Code (Copilot)
├── .agents/skills/      skills for every agent: new-context, record-decision, adversarial-review
├── .claude/
│   ├── settings.json    Claude Code: allow the safe commands, deny reading .env
│   └── skills           symlink to .agents/skills
├── .codex/config.toml   Codex: the same MCP servers
├── .github/
│   ├── instructions/    Copilot: the Python checks for *.py files (and code review)
│   └── workflows/       CI: lint, types, tests, smoke run
├── docs/
│   ├── adr/             0001 record decisions · 0002 contexts then layers
│   │                    0003 config from the environment · 0004 every port has a contract suite
│   ├── agents.md        how each agent finds the rules, skills and MCP servers
│   ├── external-calls.md the steps for a call that leaves the process
│   └── tech-debt.md     shortcuts we chose to leave
├── scripts/rename_package.py
├── src/starter/
│   ├── shared/          shared kernel: grows only when a second context needs something
│   ├── example/         a deletable example context: domain/ decides, application/ arranges
│   ├── adapters/        inbound (CLI) and outbound (memory and JSON-file stores, system clock)
│   ├── bootstrap.py     composition root: picks adapters, nothing else
│   └── config.py        settings from APP_* environment variables only
└── tests/
    ├── test_architecture.py   the boundaries, as import rules
    ├── test_context_docs.py   READMEs, ADR index and agent notes match the code
    ├── test_agent_setup.py    every agent sees the same rules, skills and servers
    ├── domain/ application/ adapters/   rules, services on fakes, adapter contracts
    └── test_cli.py            end to end
```

## Fresh start

You need [uv](https://docs.astral.sh/uv/getting-started/installation/) and git. Python 3.12+ is installed by uv if missing.

1. **Copy the folder into a new repository.**

   ```bash
   git clone https://github.com/ericbdev/ai.git /tmp/ai
   cp -r /tmp/ai/python-starter my-app && cd my-app
   git init && git add -A && git commit -m "Start from python-starter"
   ```

2. **Install and prove it works.**

   ```bash
   make install
   make check                                  # ruff, ty, pytest: green, no services needed
   make run ARGS='add "Write the README"'      # the example CLI; data lands in ./.data
   make run ARGS='list --all'
   ```

3. **Rename the package** (once, before you write code):

   ```bash
   make rename NAME=my_app && uv sync && make check
   ```

4. **Say what you are building.** Fill in `PRODUCT.md`, the *Product objectives* of `AGENTS.md`, and your first terms in `GLOSSARY.md`. Keep them short. Date the four ADRs (replace `YYYY-MM-DD`) and keep or supersede each.

5. **Set up your agent.** Build the code graph once (`uvx code-review-graph build`), then open the folder in your tool:
   - **Claude Code:** run `claude` in the folder and approve the project MCP server when asked. It reads `CLAUDE.md` and `.claude/skills`.
   - **Codex:** run `codex` in the folder and trust the project, so it loads `.codex/config.toml`. It reads `AGENTS.md` and `.agents/skills`.
   - **Copilot in VS Code:** open the folder and use agent mode; it reads `AGENTS.md`, `.github/instructions/`, `.agents/skills` and `.mcp.json`. For the Copilot cloud agent, add the MCP server in the repository's Copilot settings on GitHub.

   Add servers that need your own credentials (GitHub, a tracker) at user scope. [`docs/agents.md`](docs/agents.md) has the full map and how to add a skill or server so every tool sees it.

6. **Build your first context** with the `new-context` skill ("add a context for ..."). Then delete `example/`, its tests and its rows; `example/README.md` lists them.

7. **Turn on CI** by pushing: `.github/workflows/ci.yml` runs the same `make check` steps and a smoke run.

## Working rules, in one screen

- Place code by **which context owns it**, then **does it decide (domain) or arrange (application)**.
- Every port has a fake that passes the real adapter's contract suite.
- Untrusted data is validated in its adapter and accepted by a domain rule before anything relies on it.
- Settings come from the environment; defaults are throwaway; deploys run `check-config --require-durable`.
- A gate that fails is fixed in the code, never relaxed. Baselines only shrink.
- A decision an agent might undo gets an ADR; a shortcut you leave gets a debt entry.
- `make check` before every push.

The reasons are in [`TASTE.md`](TASTE.md) and [`docs/adr/`](docs/adr/README.md).

## Related

`TASTE.md` explains the judgement behind the rules and where the same habits cost more than they return. Shared agents and skills live in the [`ericbdev/ai`](https://github.com/ericbdev/ai) repository, including the [`python-engineer`](https://github.com/ericbdev/ai/tree/main/agents/python-engineer) agent that works to these rules.
