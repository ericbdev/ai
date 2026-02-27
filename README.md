# AI Toolkit

A comprehensive AI toolkit featuring reusable skills, agents, and prompts for building intelligent applications.

## Overview

This toolkit provides modular, reusable components for AI applications:

- **Skills**: Self-contained capabilities that perform specific tasks
- **Agents**: Coming soon - intelligent entities that can use multiple skills
- **Prompts**: Coming soon - reusable prompt templates

## Installation

```bash
npm install @ericbdev/ai
```

## Quick Start

```typescript
import { TextAnalysisSkill } from '@ericbdev/ai';

const skill = new TextAnalysisSkill();
const result = await skill.execute({
  text: 'Your text here',
  includeKeywords: true,
});

console.log(result);
```

## Skills

Skills are the core building blocks of this toolkit. Each skill is a self-contained unit that performs a specific task.

### Available Skills

1. **Text Analysis Skill** - Analyze text for word count, sentiment, keywords, and more
2. **Code Formatter Skill** - Format and beautify code (JSON, JavaScript, etc.)

See [Skills Documentation](src/skills/README.md) for detailed information about each skill.

### Creating Custom Skills

```typescript
import { BaseSkill, SkillInput, SkillOutput } from '@ericbdev/ai';

export class MySkill extends BaseSkill {
  constructor() {
    super({
      id: 'my-skill',
      name: 'My Custom Skill',
      description: 'What this skill does',
      version: '1.0.0',
      tags: ['custom'],
      inputSchema: {
        input1: {
          type: 'string',
          description: 'Input description',
          required: true,
        },
      },
    });
  }

  protected async run(input: SkillInput): Promise<SkillOutput> {
    // Your implementation
    return {
      success: true,
      data: { /* your result */ },
    };
  }
}
```

## Examples

Check out the [examples directory](src/examples/) for complete working examples:

- [Text Analysis Example](src/examples/text-analysis-example.ts)
- [Code Formatter Example](src/examples/code-formatter-example.ts)

## Development

### Setup

```bash
# Install dependencies
npm install

# Build the project
npm run build
```

### Project Structure

```
src/
├── types/          # TypeScript type definitions
│   └── skill.ts    # Skill interface and types
├── skills/         # Skill implementations
│   ├── BaseSkill.ts
│   ├── TextAnalysisSkill.ts
│   ├── CodeFormatterSkill.ts
│   ├── README.md
│   └── index.ts
├── agents/         # Agent implementations (coming soon)
├── examples/       # Usage examples
└── index.ts        # Main entry point
```

## Roadmap

- [x] Core skill interface and base class
- [x] Text analysis skill
- [x] Code formatter skill
- [ ] Agent framework
- [ ] More skills (summarization, translation, etc.)
- [ ] Prompt templates
- [ ] CLI tool
- [ ] Web UI for skill testing

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
