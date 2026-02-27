# Template Skill (Example)

---
name: template-skill
description: Use as a starting point for new skills. Trigger when you need to scaffold a fresh skill with clear inputs, outputs, and workflow guidance.
---

## Overview
This SKILL.md is an example/template for creating new skills. Copy it and replace placeholders with the specifics for your skill.

## When to Use
- You are building a new skill and need a standard structure.
- You want to document inputs, outputs, and execution steps before coding.

## Capabilities
- Define metadata (name/description) in frontmatter for triggering.
- Specify inputs/outputs, edge cases, and success criteria.
- Outline step-by-step execution guidance for the skill.

## Inputs
List required and optional inputs your skill expects. Example:
| Name | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| input_a | string | Yes | — | Main input payload |
| option_b | boolean | No | false | Optional toggle |

## Outputs
Describe the shape of the output. Example fields:
- `success`: boolean
- `data`: object with fields your skill returns
- `metadata`: include `executionTime` and `timestamp`
- `error`: present when `success` is false

## Workflow
1. Validate inputs against the schema.
2. Perform the core logic (describe the key steps clearly).
3. Handle edge cases and error paths (what to do if inputs are missing/invalid).
4. Return structured output with metadata.

## Quality Bar
- Keep responses deterministic given the same inputs.
- Be explicit about assumptions and defaults.
- Fail fast on invalid inputs with clear error messages.

## Example Usage
```typescript
import { /* YourSkill */ } from '@ericbdev/ai';

const skill = new /* YourSkill */();
const result = await skill.execute({
  /* input_a: 'value', */
  /* option_b: true, */
});
```
