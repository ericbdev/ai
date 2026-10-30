# AI Agent Files Repository

A repository of agent and skill documentation files for use with AI coding assistants like GitHub Copilot. This repo stores supportive agent files in markdown format following GitHub's standard for agent skills and custom instructions.

## Overview

This repository provides documented agents and skills that AI assistants can use to understand how to perform specific tasks:

- **Skills**: Documented capabilities using the [GitHub Copilot Skills standard](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/coding-agent/create-skills)
- **Agents**: Behavior definitions and orchestration patterns in markdown format
- **Templates**: Reusable templates for creating new skills and agents

## Start here

**Starting a Python project?** Copy [`python-starter/`](python-starter/README.md): a domain-agnostic, runnable base for a developer working with Claude Code, Codex or GitHub Copilot, with one set of agent instructions (`AGENTS.md`), skills and MCP servers that all three read, ADRs, type and boundary gates as tests, and a deletable example context. Its [`TASTE.md`](python-starter/TASTE.md) records the engineering judgement it encodes and where those habits cost more than they return. The [Fresh start](python-starter/README.md#fresh-start) section walks an engineer from an empty folder to a green `make check` and a first real context.

## Structure

```
agents/                  # Agent definitions (AGENT.md / AGENT.claude.md)
├── base-agent/
├── simple-agent/
├── conventional-commits/
├── orchestrator/
├── pr-review/
├── python-engineer/     # builds and reviews services in the python-starter style
└── README.md
skills/                  # Skill documentation (SKILL.md files)
├── code-formatter-skill/
├── conventional-commit/
├── template-skill/
├── text-analysis-skill/
└── README.md
python-starter/          # base for any Python project: copy it, rename it, build on it
```

## Skills

Skills are documented capabilities that define specific tasks AI assistants can perform. Each skill follows the standard markdown format with YAML frontmatter.

### Available Skills

1. **Text Analysis Skill** - Analyze text for word count, sentiment, keywords, and readability
2. **Code Formatter Skill** - Format and beautify code (JSON, JavaScript, etc.)
3. **Template Skill** - Starter template for creating new skills

See [Skills Documentation](skills/README.md) for complete details.

### Skill Format

```markdown
---
name: skill-name
description: What the skill does and when to use it
---

## Overview
Skill description

## Inputs
Parameters accepted

## Behavior
What the skill does

## Output
What the skill returns
```

## Agents

Agents define behavior patterns and how to orchestrate multiple skills to accomplish complex tasks.

### Available Agents

1. **Base Agent** - Framework documentation for understanding agent structure
2. **Simple Agent** - Basic conversational agent pattern
3. **Python Engineer** - Builds and reviews Python services to the [python-starter](python-starter/README.md) rules ([agent](agents/python-engineer/README.md))

See [Agents Documentation](agents/README.md) for complete details.

## Creating New Skills

1. Copy the template from `skills/template-skill/SKILL.md`
2. Create a new directory: `skills/your-skill/`
3. Update the YAML frontmatter with your skill's name and description
4. Document the skill's behavior, inputs, and outputs
5. Add usage examples

## Creating New Agents

1. Create a new directory: `agents/your-agent/`
2. Create an `AGENT.md` file with YAML frontmatter
3. Document the agent's purpose, capabilities, and behaviors
4. Provide usage examples and patterns

## Standards

This repository follows these standards:

- [GitHub Copilot Skills Format](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/coding-agent/create-skills)
- [About Agent Skills](https://docs.github.com/en/copilot/concepts/agents/about-agent-skills)
- Markdown with YAML frontmatter for all documentation
- Clear, trigger-friendly descriptions in frontmatter

## Development

### Prerequisites

The agent and skill files are markdown and need no build tools. [`python-starter/`](python-starter/README.md) is a Python project with its own toolchain (uv, ruff, ty, pytest); CI checks it in `.github/workflows/python-starter.yml`.

### Testing Documentation

To verify markdown files:

```bash
npm test   # Runs basic validation
npm run lint  # Checks markdown formatting
```

## Roadmap

- [x] Text analysis skill documentation
- [x] Code formatter skill documentation
- [x] Template skill scaffold
- [x] Base agent framework documentation
- [x] Simple agent pattern documentation
- [ ] Additional skill documentation (summarization, translation, etc.)
- [ ] Advanced agent patterns with planning
- [x] Python project starter (`python-starter/`)
- [ ] Prompt templates library
- [ ] Workflow automation skills

## License

MIT

## Contributing

Contributions are welcome! When adding new skills or agents:

1. Follow the standard markdown format with YAML frontmatter
2. Provide clear, trigger-friendly descriptions
3. Include practical usage examples
4. Document all behaviors and capabilities

Please feel free to submit a Pull Request.
