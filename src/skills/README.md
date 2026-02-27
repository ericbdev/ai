# Skills

Skills are reusable capabilities in the AI toolkit. Each skill performs a specific task and can be executed with various inputs.

## Available Skills

### 1. Text Analysis Skill

Analyzes text and provides comprehensive insights.

See full specification in [TextAnalysisSkill/SKILL.md](./TextAnalysisSkill/SKILL.md).

**ID:** `text-analysis`

**Capabilities:**
- Count words, sentences, characters, and paragraphs
- Calculate reading time
- Analyze average word length
- Basic sentiment analysis (positive/negative/neutral)
- Extract keywords (optional)

**Input:**
```typescript
{
  text: string;           // Required: The text to analyze
  includeKeywords?: boolean; // Optional: Extract keywords (default: false)
}
```

**Output:**
```typescript
{
  success: boolean;
  data: {
    characterCount: number;
    characterCountNoSpaces: number;
    wordCount: number;
    sentenceCount: number;
    paragraphCount: number;
    averageWordLength: number;
    readingTimeMinutes: number;
    sentiment: 'positive' | 'negative' | 'neutral';
    keywords?: string[];  // If includeKeywords is true
  };
  metadata: {
    executionTime: number;
    timestamp: string;
  };
}
```

**Example:**
```typescript
import { TextAnalysisSkill } from '@ericbdev/ai';

const skill = new TextAnalysisSkill();
const result = await skill.execute({
  text: 'This is a great example of text analysis. It works wonderfully!',
  includeKeywords: true,
});

console.log(result);
// {
//   success: true,
//   data: {
//     characterCount: 64,
//     characterCountNoSpaces: 54,
//     wordCount: 11,
//     sentenceCount: 2,
//     paragraphCount: 1,
//     averageWordLength: 4.91,
//     readingTimeMinutes: 1,
//     sentiment: 'positive',
//     keywords: ['example', 'analysis', 'works', 'wonderfully', 'great']
//   },
//   metadata: {
//     executionTime: 5,
//     timestamp: '2026-02-27T02:51:32.209Z'
//   }
// }
```

### 2. Code Formatter Skill

Formats and beautifies code with support for multiple languages.

See full specification in [CodeFormatterSkill/SKILL.md](./CodeFormatterSkill/SKILL.md).

**ID:** `code-formatter`

**Capabilities:**
- Format JSON with proper indentation
- Basic JavaScript formatting
- Generic code formatting (whitespace cleanup)
- Validate JSON syntax

**Input:**
```typescript
{
  code: string;        // Required: The code to format
  language?: string;   // Optional: Language type (default: 'json')
  indent?: number;     // Optional: Indentation spaces (default: 2)
}
```

**Output:**
```typescript
{
  success: boolean;
  data: {
    formatted: string;
    language: string;
    originalLength: number;
    formattedLength: number;
  };
  metadata: {
    executionTime: number;
    timestamp: string;
  };
}
```

**Example:**
```typescript
import { CodeFormatterSkill } from '@ericbdev/ai';

const skill = new CodeFormatterSkill();
const result = await skill.execute({
  code: '{"name":"test","value":123}',
  language: 'json',
  indent: 2,
});

console.log(result.data.formatted);
// {
//   "name": "test",
//   "value": 123
// }
```

## Creating Custom Skills

To create a custom skill, extend the `BaseSkill` class:

```typescript
import { BaseSkill, SkillInput, SkillOutput } from '@ericbdev/ai';

export class MyCustomSkill extends BaseSkill {
  constructor() {
    super({
      id: 'my-custom-skill',
      name: 'My Custom Skill',
      description: 'Description of what this skill does',
      version: '1.0.0',
      tags: ['custom', 'example'],
      inputSchema: {
        param1: {
          type: 'string',
          description: 'First parameter',
          required: true,
        },
        param2: {
          type: 'number',
          description: 'Second parameter',
          required: false,
          default: 10,
        },
      },
    });
  }

  protected async run(input: SkillInput): Promise<SkillOutput> {
    // Implement your skill logic here
    const result = {
      // Your processing logic
    };

    return {
      success: true,
      data: result,
    };
  }
}
```

## Skill Interface

All skills implement the `Skill` interface:

```typescript
interface Skill {
  id: string;
  name: string;
  description: string;
  version: string;
  tags?: string[];
  inputSchema?: {...};
  execute(input: SkillInput): Promise<SkillOutput>;
}
```

The `BaseSkill` class provides:
- Automatic input validation
- Error handling
- Execution time tracking
- Consistent output format
- Metadata collection
