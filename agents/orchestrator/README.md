# Planner Agent

Technical planning specialist for [Claude Code](https://claude.com/claude-code). Delegates planning requests into structured implementation roadmaps with explicit user sign-off checkpoints.

Unlike sibling agents in this repo (which are [OpenCode](https://opencode.ai) agents), this agent runs in Claude Code and follows Claude Code's agent execution model.

## Usage

Invoke by delegating planning requests to Claude Code:

```
Help me plan a new feature
Create an implementation spec for X
How should I architect this system?
```

Claude Code dispatches to this agent automatically when it detects planning-oriented language. Or explicitly mention it in your request:

```
@planner: help me design the auth flow
```

## Workflow

1. **Understand scope** — Reads relevant project files (CLAUDE.md, README, package.json, etc.) to understand existing architecture
2. **Clarify ambiguity** — Asks one focused question if needed; makes reasonable assumptions otherwise
3. **Write plan** — Produces structured markdown plan with phases, tasks, dependencies, and risk assessment
4. **Checkpoint** — Presents plan and explicitly waits for user approval before proceeding
5. **Phased execution** — After approval, breaks plan into phases and executes each with user review between phases

## Configuration

- **Model**: Claude Sonnet 4.5 (optimized for planning and reasoning)
- **Temperature**: Default (for thoughtful, nuanced analysis)
- **Available tools**: Read, Write, Glob, Grep, Bash (for repo exploration)

## Plan Format

Generated plans use this structure:

```
# Project Name

## Overview
- Problem, success criteria, users

## Technical Approach
- Architecture, key APIs, trade-offs

## Implementation Plan
- Phases (Foundation → Core → Polish)
- Tasks with complexity and dependencies

## Considerations
- Assumptions, constraints, risks

## Out of Scope
- Features deferred for later
```

## Notes

- No code is written until you explicitly approve the plan
- Plans are saved to `.claude/state/plan.md` for persistence
- Approval triggers task creation for each phase
