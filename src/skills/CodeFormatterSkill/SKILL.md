# Code Formatter Skill

# Code Formatter Skill

---
name: code-formatter
description: Format code snippets, especially JSON and JavaScript, to make them readable. Use whenever a user needs JSON prettified, JS cleaned up, or general whitespace-normalized code output.
---

## Overview
Formats code snippets with dedicated JSON handling, basic JavaScript cleanup, and generic whitespace normalization.

## Metadata
- **ID:** `code-formatter`
- **Name:** Code Formatter
- **Version:** `1.0.0`
- **Tags:** code, format, json, beautify

## Inputs
| Name | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| code | string | Yes | — | The code snippet to format |
| language | string | No | `json` | Target language (`json`, `javascript`, or other) |
| indent | number | No | `2` | Indentation size used for JSON/JavaScript formatting |

## Behavior
- For `json`, parses and pretty-prints the payload with the requested indentation (throws on invalid JSON).
- For `javascript`/`js`, performs lightweight brace/semicolon-based indentation while preserving string content.
- For other languages, trims empty lines and normalizes whitespace.
- Returns `success: false` with an error message when formatting fails (for example, invalid JSON input).

## Output
- `success`: boolean
- `data` (on success):
  - `formatted`
  - `language`
  - `originalLength`
  - `formattedLength`
- `metadata`:
  - `executionTime` (milliseconds)
  - `timestamp` (ISO 8601)
- On failure, `error` contains the reason and `data` is omitted.

## Example
```typescript
import { CodeFormatterSkill } from '@ericbdev/ai';

const skill = new CodeFormatterSkill();
const result = await skill.execute({
  code: '{"name":"test","value":123}',
  language: 'json',
  indent: 2,
});

console.log(result.data?.formatted);
```
