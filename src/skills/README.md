# Skills

Skills are reusable capabilities documented in markdown format following the [GitHub Copilot Skills standard](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/coding-agent/create-skills). Each skill performs a specific task and is documented with YAML frontmatter describing when and how to use it.

## Standard Format

Skills follow the standard `SKILL.md` format with:
- **YAML frontmatter**: name, description, and optional metadata
- **Markdown body**: Instructions, examples, and guidelines

See the [GitHub documentation](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/coding-agent/create-skills) for complete details on creating skills.

## Available Skills

### 1. Text Analysis Skill

Analyzes text and provides comprehensive insights including word count, readability, sentiment, and keywords.

See full specification in [TextAnalysisSkill/SKILL.md](./TextAnalysisSkill/SKILL.md).

**Trigger**: Use when analyzing text for counts, readability, sentiment, or keyword extraction.

**Capabilities:**
- Count words, sentences, characters, and paragraphs
- Calculate reading time
- Analyze average word length
- Basic sentiment analysis (positive/negative/neutral)
- Extract keywords (optional)

### 2. Code Formatter Skill

Formats code snippets with dedicated JSON handling, basic JavaScript cleanup, and generic whitespace normalization.

See full specification in [CodeFormatterSkill/SKILL.md](./CodeFormatterSkill/SKILL.md).

**Trigger**: Use when formatting code, especially JSON prettification or JavaScript cleanup.

**Capabilities:**
- Format JSON with proper indentation
- Basic JavaScript formatting
- Generic code formatting (whitespace cleanup)
- Validate JSON syntax

### 3. Template Skill

Starter `SKILL.md` template to use when creating new skills.

See [TemplateSkill/SKILL.md](./TemplateSkill/SKILL.md) for the scaffold structure.

**Purpose**: Provides a complete example following the GitHub Copilot skills standard with all recommended sections.

## Skill File Structure

Each skill should be in its own directory with a `SKILL.md` file:

```
skills/
  YourSkill/
    SKILL.md        # Required: Skill definition
    script.sh       # Optional: Supporting script
    examples.md     # Optional: Additional examples
```

### SKILL.md Format

```markdown
---
name: skill-name
description: What the skill does and when to use it. This helps Copilot decide when to load the skill.
---

## Overview
Brief description

## Inputs
Parameters the skill accepts

## Behavior
What the skill does

## Output
What the skill returns

## Example
Usage example
```

## Creating Custom Skills

To create a new skill:

1. **Create a directory** in `src/skills/YourSkill/`
2. **Copy the template** from [TemplateSkill/SKILL.md](./TemplateSkill/SKILL.md)
3. **Update the frontmatter** with your skill's name and trigger description
4. **Document the behavior** clearly in the markdown body
5. **Add examples** showing how to use the skill
6. **Include any scripts** the skill needs to execute

### Frontmatter Guidelines

- **name**: Lowercase, use hyphens for spaces (e.g., `my-skill-name`)
- **description**: Clear, trigger-friendly description that helps Copilot know when to use this skill
- Include specific keywords and use cases in the description

### Best Practices

1. **Clear Descriptions**: Write descriptions that clearly indicate when the skill should be used
2. **Complete Documentation**: Document all inputs, outputs, and behaviors
3. **Provide Examples**: Include practical, working examples
4. **Keep It Focused**: Each skill should do one thing well
5. **Follow Standards**: Use the GitHub Copilot skills format
6. **Version Appropriately**: Track changes with semantic versioning

## Skills vs Agents

- **Skills** define specific, actionable capabilities (what can be done)
- **Agents** define behavior patterns and orchestration (how to do it)
- Skills are used by agents to accomplish tasks
- Skills should be reusable across different agents

## Additional Resources

- [GitHub Copilot Skills Documentation](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/coding-agent/create-skills)
- [About Agent Skills](https://docs.github.com/en/copilot/concepts/agents/about-agent-skills)
- [Template Skill](./TemplateSkill/SKILL.md) - Complete example following the standard
