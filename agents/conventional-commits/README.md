# conventional-commits Agent

A subagent for [OpenCode](https://opencode.ai) that analyzes staged git changes and helps craft meaningful conventional commit messages focused on the "why" behind the change. It works collaboratively: proposes a message, asks for confirmation, then commits.

## Prerequisites

- [OpenCode](https://opencode.ai) installed
- A Git repository with staged changes

## Skills

This agent relies on the **conventional-commits-reference** skill for commit type classification, message formatting rules, and analysis heuristics. The skill is co-located in this repo at [`skills/conventional-commits-reference`](../../skills/conventional-commits-reference/).

Install the skill into your project before using the agent:

```sh
npx skills add ericbdev/ai --skill conventional-commits-reference
```

## Installation

Copy `AGENT.md` into your OpenCode agents directory. The filename determines the agent name.

**Per-project** (available only in that project):

```sh
mkdir -p .opencode/agents
cp AGENT.md .opencode/agents/conventional-commits.md
```

**Global** (available across all projects):

```sh
mkdir -p ~/.config/opencode/agents
cp AGENT.md ~/.config/opencode/agents/conventional-commits.md
```

## Usage

Invoke the agent by mentioning it in your message:

```
@conventional-commits
```

## Workflow

1. Reads staged changes using `git diff --staged`
2. Infers the most likely conventional commit type and optional scope
3. Detects likely issue references from branch and git context
4. Proposes a commit message for your review
5. Waits for explicit confirmation before running `git commit`
6. Handles pre-commit hook failures collaboratively and retries

## Configuration

The agent behavior is defined in `AGENT.md` and currently uses:

- `mode: all`
- `temperature: 0.3`
- Tools: `bash: true`, `write: false`, `edit: false`
