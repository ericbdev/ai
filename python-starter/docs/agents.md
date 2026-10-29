# Working with a coding agent

This repository is set up for Claude Code, OpenAI Codex and GitHub Copilot. Each reads the same rules, skills and MCP servers, so it does not matter which one a person uses, or whether a team mixes them. Each thing has one source; the tool-specific files only point at it, and `tests/test_agent_setup.py` fails when they drift apart.

## Where each tool looks

| | Rules | Skills | MCP servers |
|---|---|---|---|
| **Source** | `AGENTS.md` | `.agents/skills/<name>/SKILL.md` | `.mcp.json` |
| **Claude Code** | `CLAUDE.md`, which is `@AGENTS.md` | `.claude/skills`, a symlink to `.agents/skills` | `.mcp.json` (approve it on first open) |
| **Codex** (CLI, IDE, app) | `AGENTS.md` | `.agents/skills` | `.codex/config.toml`, read only once you trust the project |
| **Copilot** (VS Code, cloud agent, code review) | `AGENTS.md`; `.github/instructions/python.instructions.md` for `*.py` files, which code review also reads | `.agents/skills` (it also reads `.claude/skills`, so it may list each skill twice) | VS Code reads the root `.mcp.json`; the cloud agent's servers are set in the repository's Copilot settings on GitHub |

On Windows, git may check the `.claude/skills` symlink out as a plain file. Enable symlinks (`git config core.symlinks true` and Developer Mode) or copy the folder; the test above tells you when the copy is stale.

## Adding things

- **Any of these:** write it the way [writing-for-agents](https://github.com/mattpocock/skills/blob/main/skills/productivity/writing-for-agents/SKILL.md) describes: every always-loaded line earns its place, a pointer says when to follow it, material only some tasks need sits behind a pointer, each meaning lives in one place, and rules state the behaviour you want.
- **A rule:** edit `AGENTS.md` if every task needs it, or the doc it applies to if only some do (a context README, `docs/external-calls.md`). The Python checks in `.github/instructions/python.instructions.md` are a deliberate copy for Copilot code review; update them when those rules change.
- **A term:** add it to `GLOSSARY.md`, with the synonyms to avoid.
- **A skill:** add `.agents/skills/<name>/SKILL.md` with `name` (equal to the folder name) and `description` (its trigger cases, front-loaded) in its frontmatter, and steps that each end on a checkable condition. Every tool sees it.
- **An MCP server:** add it to `.mcp.json` (`mcpServers`) and to `.codex/config.toml` (`[mcp_servers.<name>]`) in the same change. Servers that need a person's credentials (GitHub, a tracker) go in that person's user configuration instead, never in the repository.

## MCP servers

Keep the shared set small: every server's tool list costs context on every turn.

| Server | Why | Notes |
|---|---|---|
| [code-review-graph](https://pypi.org/project/code-review-graph/) | A structural graph of the code: callers, callees, impact radius, tests for a function. Cheaper than reading files to answer "what does this change touch?" | Runs with `uvx`, nothing to install. Build the graph once with `uvx code-review-graph build`; its data lives in `.code-review-graph/` (git-ignored). Use it to *find* code; read the file before you change it. |

Per person, at user scope:

| Server | Why |
|---|---|
| GitHub (remote MCP, `https://api.githubcopilot.com/mcp/`) | Pull requests, reviews, CI logs and issues without leaving the session. The Copilot cloud agent has it by default. |
| Your docs or tracker | Only when tasks or specs live there. |

## Permissions

- **Claude Code:** `.claude/settings.json` allows the `make` targets and read-only git commands without a prompt, and denies reading `.env`.
- **Codex:** keep its default sandbox and approval settings; add project settings to `.codex/config.toml` only when your team agrees on others.
- **Copilot:** approve tools per session in VS Code; the cloud agent's firewall and setup steps are repository settings on GitHub.

## Keeping the code graph fresh (optional)

A Claude Code hook can run `code-review-graph update --skip-flows` after every edit. It keeps the graph current but needs the CLI installed (`uv tool install code-review-graph`) and adds a few seconds per edit. To opt in with Claude Code, add to `.claude/settings.local.json`:

```json
{
  "hooks": {
    "PostToolUse": [
      { "matcher": "Edit|Write", "hooks": [{ "type": "command", "command": "code-review-graph update --skip-flows", "timeout": 30 }] }
    ]
  }
}
```

With Codex or Copilot, run `uvx code-review-graph update` before a large task instead.

## Skills in this repository

- `new-context`: add a bounded context the way ADR 0002 requires.
- `record-decision`: write an ADR and update the index.
- `adversarial-review`: review a change in rounds, verify each finding, fix or file it.

Shared skills and agents live in the [ericbdev/ai](https://github.com/ericbdev/ai) repository; install the ones you use with `npx skills add @ericbdev/ai/<skill>`.
