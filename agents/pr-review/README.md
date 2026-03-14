# pr-review Agent

A subagent for [OpenCode](https://opencode.ai) that fetches GitHub PR review comments, classifies each piece of feedback, and either proposes a code fix or drafts a clarification reply. It operates interactively, presenting each proposed change for your approval before applying it.

## Prerequisites

- [OpenCode](https://opencode.ai) installed
- [GitHub CLI](https://cli.github.com/) (`gh`) installed and authenticated
- A Git repository with an open pull request

## Installation

Copy `AGENT.md` into your OpenCode agents directory. The filename determines the agent name.

**Per-project** (available only in that project):

```sh
mkdir -p .opencode/agents
cp AGENT.md .opencode/agents/pr-review.md
```

**Global** (available across all projects):

```sh
mkdir -p ~/.config/opencode/agents
cp AGENT.md ~/.config/opencode/agents/pr-review.md
```

## Usage

Invoke the agent by mentioning it in your message:

```
@pr-review
```

Primary agents can also delegate to it automatically via the Task tool based on its description.

### Workflow

1. Fetches PR metadata and all review comments via `gh`
2. Groups comments into threads
3. For each thread, reads the referenced file for context and classifies the feedback as **actionable** or **problematic**
4. Presents each thread with a proposed code fix (actionable) or a draft reply (problematic)
5. Waits for your decision: **apply**, **skip**, **modify**, or **apply-all**
6. Outputs a summary table of all actions taken

## Permissions

| Tool | Permission |
|------|------------|
| `read`, `write`, `glob`, `grep`, `edit` | `allow` |
| `bash` | `ask` (prompts for approval) |
| `gh pr *`, `gh api *` | `allow` |
| `git diff*`, `git status*`, `git log*` | `allow` |

All other bash commands require explicit approval.

## Configuration

The agent behavior is defined entirely in `AGENT.md`. After copying it to your agents directory, you can customize it — adjust the temperature, modify permissions, or change the workflow to suit your needs.
