---
name: conventional-commits-reference
description: Conventional commit format specification, type definitions, scope conventions, and message formatting rules. Load when crafting, classifying, or validating conventional commit messages.
---

# Conventional Commits Reference

## Commit Message Format

```
type(scope): subject line that explains what you solved

Optional body explaining the problem, why this approach works,
and any context your teammates should know.

Closes #123
Refs #456
```

## Commit Types

- **feat** - A new feature or capability
- **fix** - A bug fix
- **refactor** - Code reorganization without changing behavior
- **perf** - Performance improvements
- **docs** - Documentation changes
- **style** - Code style changes (formatting, semicolons, etc.)
- **test** - Adding or updating tests
- **chore** - Build, dependency, or tooling changes
- **ci** - CI/CD configuration changes

## Scopes

Use parentheses for scope when it makes the intent clearer:
- `feat(auth)` - Authentication feature
- `fix(api)` - API bug fix
- `refactor(types)` - TypeScript type refactoring

Omit scope if the change touches multiple areas or the scope would be redundant.

## Subject Line

- Write in imperative mood: "add feature" not "added feature" or "adds feature"
- Don't capitalize the first letter
- Keep it under 50 characters
- Don't end with a period
- Make it specific enough to understand at a glance

## Body (Optional)

- Use blank line between subject and body
- Wrap at 72 characters
- Explain the "why" and "how", not just the "what"
- Reference relevant decisions or tradeoffs
- Help future developers understand your thinking

## Issue Linking

Include footer references to connect your commit to tracked work:

- `Closes #123` - This commit completes an issue
- `Refs #456` - This commit relates to an issue but doesn't close it
- `Fixes #789` - Alias for Closes

For analysis heuristics on classifying changes and detecting issue references, see [REFERENCE.md](REFERENCE.md).
