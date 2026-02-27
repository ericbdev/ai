# Text Analysis Skill

## Overview
Analyzes text and returns basic statistics, sentiment, and optional keyword extraction for quick text insights.

## Metadata
- **ID:** `text-analysis`
- **Name:** Text Analysis
- **Version:** `1.0.0`
- **Tags:** text, analysis, nlp, statistics

## Inputs
| Name | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| text | string | Yes | — | Text to analyze |
| includeKeywords | boolean | No | false | Extract the most frequent keywords |

## Behavior
- Counts characters (with and without spaces), words, sentences, and paragraphs.
- Computes average word length and estimated reading time (200 wpm).
- Performs simple sentiment classification using positive/negative keyword lists.
- Optionally extracts the top keywords while ignoring common stop words.

## Output
- `success`: boolean
- `data` (on success):
  - `characterCount`
  - `characterCountNoSpaces`
  - `wordCount`
  - `sentenceCount`
  - `paragraphCount`
  - `averageWordLength`
  - `readingTimeMinutes`
  - `sentiment`
  - `keywords` (present when `includeKeywords` is true)
- `metadata`:
  - `executionTime` (milliseconds)
  - `timestamp` (ISO 8601)
- On validation or runtime failure, `success` is `false` and `error` contains the message.

## Example
```typescript
import { TextAnalysisSkill } from '@ericbdev/ai';

const skill = new TextAnalysisSkill();
const result = await skill.execute({
  text: 'This is a great example of text analysis. It works wonderfully!',
  includeKeywords: true,
});

console.log(result);
```
