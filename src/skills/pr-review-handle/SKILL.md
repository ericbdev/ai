---
name: address-pr-reviews
description: Pulls GitHub PR reviews, resolves ambiguities using SOLID principles and Levenshtein distance, and applies code fixes or drafts empathetic replies locally.
author: Eric
version: 1.1.0
config:
  tools:
    - gh
    - node
  context_window: 15
  levenshtein_threshold: 3
---

# Address PR Reviews

This skill automates the process of addressing feedback on an open Pull Request. It prioritizes code integrity by analyzing surrounding symbols to resolve reviewer typos (SOLID Principles + Levenshtein Distance) and handles problematic feedback by drafting clarifying questions.

## Usage
1. Ensure you are in a git repository with an open PR.
2. Run the skill to fetch unresolved threads.
3. For each thread, analyze the feedback and determine if it is actionable.
4. Apply approved fixes locally or draft empathetic replies.
5. Run a verification command to validate changes.

## Analysis Criteria

For each review thread, you (the invoking LLM) must determine:

### Actionable Feedback
- The suggestion improves code quality, correctness, or clarity.
- The fix adheres to SOLID principles (e.g., single responsibility, open/closed, dependency inversion) and maintains the function's expected behavior and type contracts.
- If the reviewer has a typo (e.g., "identifer" instead of "identifier"), use **Levenshtein Distance** to fuzzy-match against actual code symbols and infer the correct intent.
- The change is within the scope of this PR.

**Output:**
```json
{
  "isActionable": true,
  "patch": "corrected code snippet or full replacement",
  "explanation": "why this fix is correct and maintains contracts"
}
```

### Problematic Feedback
- The suggestion is out of scope (e.g., "re-architect the whole auth flow" on a helper function PR).
- The feedback is vague or uninformed.
- The reviewer may have misunderstood the code or PR intent.

**Output:**
```json
{
  "isActionable": false,
  "empatheticReply": "an open-ended question that seeks clarification on the reviewer's intent"
}
```

## Script
The execution logic is located in `scripts/address-reviews.js`.

## Workflow for the Invoking LLM

1. Extract each review thread (file, line, comment body).
2. Read the local file context (±15 lines around the commented line).
3. Extract symbols from the code context and tokens from the reviewer comment.
4. Compute **Levenshtein Distance** between comment tokens and code symbols to detect reviewer typos (threshold: 3, adaptive to token length).
5. Analyze the feedback:
   - Review the fuzzy match suggestions (e.g., "identifer" → "identifier", distance: 1).
   - Is it fixing a typo? Verify the intended symbol exists in context.
   - Does it adhere to SOLID principles and maintain the code's expected behavior and type contracts?
 - Is it actionable and in scope?
6. Provide your analysis as a JSON response.
7. The skill will apply patches and prompt for verification.

### Fetching online review threads from CLI/API
- Use GitHub CLI directly: `gh pr view <pr-number> --json reviewThreads,reviews,comments` (uses your existing GitHub auth; no third-party tooling).
- REST fallback via the CLI: `gh api repos/:owner/:repo/pulls/:number/reviews` plus `gh api repos/:owner/:repo/pulls/:number/comments` (add `--paginate` if needed). Both return the same online review content shown in the PR UI.

## Levenshtein Distance

The skill uses [Levenshtein Distance](https://en.wikipedia.org/wiki/Levenshtein_distance) (edit distance) to fuzzy-match symbols mentioned in reviewer comments against actual identifiers in the surrounding code. This compensates for:

- **Reviewer typos**: "identifer" → "identifier" (distance 1)
- **Misspelled variable names**: "getUserNme" → "getUserName" (distance 1)
- **Transposed characters**: "recieve" → "receive" (distance 2)
- **Missing/extra characters**: "usr" near "user" (distance 1)

### How it works

1. **Symbol extraction**: All identifiers (variable names, function names, properties) are extracted from the ±15 lines of code context. Common JS keywords are filtered out.
2. **Comment tokenization**: Potential symbol references are extracted from the reviewer's comment — both backtick-quoted code spans and bare camelCase/snake_case tokens.
3. **Fuzzy matching**: Each comment token is compared against every code symbol. If the Levenshtein distance is > 0 and ≤ the adaptive threshold (min of 3 or half the shorter string's length), it's flagged as a likely typo.
4. **Output**: Matches are presented to the invoking LLM with the original token, the best matching symbol, and the edit distance to inform the analysis.

## Example

**Thread**: "Change `usr.id` to `user.identifer`"
**Context**: File shows `const user = { id: 123, identifier: "abc" }`

**Levenshtein Matches**:
- `usr` → `user` (distance: 1)
- `identifer` → `identifier` (distance: 1)

**Your Analysis**:
- Typo detected: "identifer" → "identifier" (confirmed by Levenshtein distance of 1)
- "usr" likely refers to "user" (distance: 1)
- Both symbols exist in scope.
- Check function signature: does it expect `id` or `identifier`?
- If `identifier` matches the contract, it's actionable.

**Response**:
```json
{
  "isActionable": true,
  "patch": "const result = user.identifier;",
  "explanation": "Corrected typo from 'identifer' to 'identifier'. Symbol exists in context and matches the expected return type."
}
```
