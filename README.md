# AI Agent Files Repository

A repository of agent and skill documentation files for use with AI coding assistants like GitHub Copilot. This repo stores supportive agent files in markdown format following GitHub's standard for agent skills and custom instructions.

## Overview

This repository provides documented agents and skills that AI assistants can use to understand how to perform specific tasks:

- **Skills**: Documented capabilities using the [GitHub Copilot Skills standard](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/coding-agent/create-skills)
- **Agents**: Behavior definitions and orchestration patterns in markdown format
- **Templates**: Reusable templates for creating new skills and agents

## Structure

```
src/
├── skills/              # Skill documentation (SKILL.md files)
│   ├── text-analysis-skill/
│   │   └── SKILL.md
│   ├── code-formatter-skill/
│   │   └── SKILL.md
│   ├── template-skill/   # Template for new skills
│   │   └── SKILL.md
│   └── README.md
└── agents/              # Agent documentation (AGENT.md files)
    ├── base-agent/
    │   └── AGENT.md
    ├── simple-agent/
    │   └── AGENT.md
    └── README.md
```

## Skills

Skills are documented capabilities that define specific tasks AI assistants can perform. Each skill follows the standard markdown format with YAML frontmatter.

### Available Skills

1. **Text Analysis Skill** - Analyze text for word count, sentiment, keywords, and readability
2. **Code Formatter Skill** - Format and beautify code (JSON, JavaScript, etc.)
3. **Template Skill** - Starter template for creating new skills

See [Skills Documentation](src/skills/README.md) for complete details.

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

See [Agents Documentation](src/agents/README.md) for complete details.

## Creating New Skills

1. Copy the template from `src/skills/template-skill/SKILL.md`
2. Create a new directory: `src/skills/your-skill/`
3. Update the YAML frontmatter with your skill's name and description
4. Document the skill's behavior, inputs, and outputs
5. Add usage examples

## Creating New Agents

1. Create a new directory: `src/agents/your-agent/`
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

This is a documentation repository - no build tools are required. All files are markdown.

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
