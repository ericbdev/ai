---
name: address-pr-reviews
description: Autonomously analyze GitHub PR reviews and address feedback. Use this skill whenever the user mentions PR feedback, code reviews, review comments, handling reviewer suggestions, or addressing code review threads on an active pull request. The skill will fetch review comments, detect reviewer typos using Levenshtein distance, and determine whether feedback is actionable by applying code fixes or drafting empathetic clarification replies.
author: Eric
version: 2.1.0
config:
  tools:
    - gh
  context_window: 20
  levenshtein_threshold: 3
---

# Address PR Reviews

This skill **autonomously** processes feedback on an open Pull Request. It fetches review threads, analyzes each one, detects and corrects reviewer typos using Levenshtein distance, determines whether feedback is actionable, and either applies code fixes or generates empathetic clarification questions.

## How It Works

The skill executes the following workflow automatically:

1. **Fetch PR data** - Retrieves all unresolved review threads from the open PR using `gh pr view` and `gh api`
2. **Analyze each thread** - For each comment:
   - Extracts surrounding code context (±15 lines around the commented line)
   - Identifies code symbols (variable/function names) in that context
   - Detects potential typos in the reviewer's comment using Levenshtein distance
3. **Determine actionability** - Claude evaluates whether the feedback is:
   - **Actionable**: Improves code quality/correctness, aligns with or improves SOLID principles (OCP/DIP focus), and is in scope
   - **Problematic**: Out of scope, vague, or based on misunderstanding
4. **Apply fixes or draft replies**:
   - **Actionable**: Applies corrected code locally using git
   - **Problematic**: Generates an empathetic clarification question

## Understanding SOLID Principles for Code Review

When evaluating PR feedback, we focus on two key SOLID principles that directly impact code maintainability:

### OCP: Open/Closed Principle
**Definition**: "Code should be open for extension but closed for modification"

**Example**: Rather than modifying an existing `PaymentProcessor` class to support multiple payment methods, extend it with new implementations or use strategy pattern:
```javascript
// ❌ Violates OCP - modifying the original class
class PaymentProcessor {
  process(payment) {
    if (payment.type === 'credit') { /* ... */ }
    else if (payment.type === 'paypal') { /* ... */ }  // Had to modify existing class
  }
}

// ✓ Follows OCP - open for extension
class PaymentProcessor {
  constructor(strategy) { this.strategy = strategy; }
  process(payment) { return this.strategy.process(payment); }
}
class CreditCardPayment { process(payment) { /* ... */ } }
class PayPalPayment { process(payment) { /* ... */ } }  // New payment types extend, not modify
```

### DIP: Dependency Inversion Principle
**Definition**: "Depend on abstractions, not concrete implementations"

**Example**: Classes should receive dependencies rather than creating them internally:
```javascript
// ❌ Violates DIP - depends on concrete Logger
class UserService {
  constructor() { this.logger = new ConsoleLogger(); }  // Tightly coupled
  getUser(id) { this.logger.log(`Getting user ${id}`); }
}

// ✓ Follows DIP - depends on abstraction
class UserService {
  constructor(logger) { this.logger = logger; }  // Decoupled, injectable
  getUser(id) { this.logger.log(`Getting user ${id}`); }
}
// Can now inject any logger: ConsoleLogger, FileLogger, TestMockLogger
```

### Pragmatism & Tradeoffs
Not every code review comment must achieve perfect SOLID compliance. When evaluating feedback:
- **Prioritize**: High-impact improvements that reduce coupling or improve extensibility
- **Balance**: Weigh cleanliness against pragmatic simplicity (small utility functions don't need DI)
- **Document**: If applying a workaround or ignoring a principle, the reason should be clear

## Decision Framework

For each review thread, Claude determines actionability by evaluating:

### ✓ Actionable Feedback
- The suggestion improves code quality, correctness, or clarity
- The fix aligns with or improves SOLID principles (OCP/DIP focus), OR there's a documented reason for the tradeoff
- Any reviewer typos are corrected using Levenshtein distance (e.g., "identifer" → "identifier")
- The change is within the scope of this PR
- The fix does not introduce new issues or break existing functionality

### ✗ Problematic Feedback
- The suggestion is out of scope (e.g., "re-architect the whole auth flow" on a helper function PR)
- The feedback is vague, uninformed, or contradicts established patterns
- The reviewer may have misunderstood the code, PR intent, or context
- The suggestion requires changes beyond the PR's scope
- Fixing it would introduce technical debt or violate established patterns

### How We Evaluate SOLID Principles

When assessing whether feedback aligns with SOLID principles, follow this 4-step process:

1. **Identify the pattern**: Does the code show tight coupling (DIP violation) or difficulty extending without modifying (OCP violation)?
2. **Assess the tradeoff**: Would fixing it add complexity? Is the added complexity justified by improved testability or extensibility?
3. **Consider scope**: Is this PR the right place to fix it, or is it a larger refactoring that should be separate?
4. **Document reasoning**: If accepting the violation, explain why it's acceptable (e.g., "Simple utility, doesn't warrant DI" or "Legacy constraint, documented in issue #123")

## Implementation Details

The skill uses `scripts/address-reviews.js` to:

1. **Get the current PR** - Via `gh pr view` to identify the active PR
2. **Fetch review comments** - Using `gh api repos/{owner}/{repo}/pulls/{pr}/comments --paginate` with pagination
3. **Extract analysis data** - For each review:
   - Reads surrounding code context (±15 lines from the commented line)
   - Extracts code symbols (identifiers) from that context
   - Tokenizes the reviewer's comment to find code references
   - Detects typos using Levenshtein distance (threshold: 3 edits, adaptive)
4. **Present to Claude** - Creates a structured JSON report of all reviews with:
   - Reviewer comment and metadata
   - Full code context with line numbers
   - List of code symbols available in that context
   - Detected typo suggestions (with edit distances)
5. **Claude analyzes and acts** - For each review, Claude decides:
   - Is it actionable? → Provide a code fix suggestion
   - Is it problematic? → Draft an empathetic clarification reply

## Levenshtein Distance: Detecting Reviewer Typos

The skill uses Levenshtein Distance (edit distance) to fuzzy-match symbols mentioned in reviewer comments against actual identifiers in the code. This compensates for:

- **Reviewer typos**: "identifer" → "identifier" (distance 1)
- **Misspelled variables**: "getUserNme" → "getUserName" (distance 1)
- **Transposed characters**: "recieve" → "receive" (distance 2)
- **Missing/extra characters**: "usr" near "user" (distance 1)

### How It Works

1. Extract identifiers from the ±15 line code context (filtering out JS keywords)
2. Tokenize the reviewer's comment to find potential code references
3. For each token, compare against every code symbol using Levenshtein distance
4. Flag matches where: 0 < distance ≤ min(3, half the shorter string's length)
5. Present matches to Claude with the detected typo and corrected symbol

This allows Claude to infer the reviewer's true intent even if they made typos.

## Example Workflow

**Scenario**: Reviewer writes: "This class creates the logger directly. Use dependency injection instead."

**Current code** (violates DIP):
```javascript
class UserService {
  constructor() {
    this.logger = new ConsoleLogger();
  }
  
  getUser(id) {
    this.logger.log(`Fetching user ${id}`);
    return this.users[id];
  }
}
```

**Problem identified**: The `UserService` class is tightly coupled to `ConsoleLogger`. This violates DIP because:
- It depends on a concrete implementation, not an abstraction
- It cannot be tested with a mock logger
- Changing logging strategy requires modifying the class

**Refactored code** (follows DIP):
```javascript
class UserService {
  constructor(logger) {
    this.logger = logger;
  }
  
  getUser(id) {
    this.logger.log(`Fetching user ${id}`);
    return this.users[id];
  }
}

// Usage
const consoleLogger = new ConsoleLogger();
const userService = new UserService(consoleLogger);

// In tests
const mockLogger = { log: jest.fn() };
const userServiceForTesting = new UserService(mockLogger);
```

**Tradeoff discussion**:
- **Benefit**: `UserService` is now testable with mock loggers; logger implementation can be swapped without modifying the class
- **Cost**: Slightly more setup code; constructor now requires a dependency parameter
- **Verdict**: Actionable—DIP improvement justifies the minor added complexity

**Claude's Evaluation**:
```json
{
  "isActionable": true,
  "patch": "class UserService {\n  constructor(logger) {\n    this.logger = logger;\n  }\n  getUser(id) {\n    this.logger.log(`Fetching user ${id}`);\n    return this.users[id];\n  }\n}",
  "explanation": "Applied dependency injection for the logger. This follows the Dependency Inversion Principle—the class now depends on an abstraction (the logger parameter) rather than a concrete ConsoleLogger. This improves testability and makes the code more flexible."
}
```

## Output Behavior

After analyzing all threads:

### Actionable Feedback
- Claude provides the corrected code patch
- Code is ready to be reviewed and committed
- Explains how it improves code maintainability or follows SOLID principles. If there's a tradeoff, it's acknowledged

### Problematic Feedback  
- Claude generates an empathetic clarification question
- Question seeks to understand the reviewer's intent
- Logs the draft for your review before posting

## When to Use This Skill

Use this skill whenever:
- A user mentions they have PR feedback to address
- They want to handle code review comments on an active pull request
- They ask to apply reviewer suggestions or respond to code review threads
- They mention specific review comments that need responses or fixes

The skill works best when:
- You're in a git repository with an active GitHub pull request
- GitHub CLI (`gh`) is installed and authenticated
- You have the `gh` command available
