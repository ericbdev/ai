---
name: conventional-commits-reference
description: Conventional commit format specification, type definitions, scope conventions, message formatting rules, and change classification heuristics. Load when crafting, classifying, or validating conventional commit messages.
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

- **feat** — a new feature or capability
- **fix** — a bug fix
- **refactor** — code reorganization without changing behavior
- **perf** — performance improvements
- **docs** — documentation changes
- **style** — code style changes (formatting, semicolons, etc.)
- **test** — adding or updating tests
- **chore** — build, dependency, or tooling changes
- **ci** — CI/CD configuration changes

## Scopes

Use parentheses for scope when it makes the intent clearer:
- `feat(auth)` — authentication feature
- `fix(api)` — API bug fix
- `refactor(types)` — TypeScript type refactoring

Omit scope if the change touches multiple areas or the scope would be redundant.

## Subject Line

- Write in imperative mood: "add feature" not "added feature" or "adds feature"
- Don't capitalize the first letter
- Keep it under 50 characters
- Don't end with a period
- Make it specific enough to understand at a glance

## Body (Optional)

- Use a blank line between subject and body
- Wrap at 72 characters
- Explain the "why" and "how", not just the "what"
- Reference relevant decisions or tradeoffs
- Help future developers understand your thinking

## Issue Linking

Include footer references to connect your commit to tracked work:

- `Closes #123` — this commit completes an issue
- `Refs #456` — this commit relates to an issue but doesn't close it
- `Fixes #789` — alias for Closes

## Classifying Changes by Commit Type

When examining staged changes to suggest a commit type, use these signals:

### Feature patterns → `feat`
- New files in `src/features/`, `src/pages/`, or similar feature directories
- New exports from index files
- New public functions or components

### Bug fix patterns → `fix`
- Changes in error handling
- Logic corrections
- Edge case handling in existing code
- Files with "bug" or "issue" references in comments

### Refactoring patterns → `refactor`
- No functional changes, only structure
- Renamed files, functions, or classes
- Internal reorganization with no new behavior

### Performance patterns → `perf`
- Optimization comments in code
- Caching implementations
- Algorithm improvements

### Test patterns → `test`
- Changes only to test files
- New test coverage for existing code

### Tooling patterns → `chore`
- Changes to config files
- Dependency updates
- Build script changes

### CI patterns → `ci`
- Changes to `.github/workflows/`
- CI configuration files (`.travis.yml`, `circle.yml`, etc.)

## Detecting Issue References

Search for issue references in multiple places:

1. **Branch name** — extract from patterns like `fix/issue-123`, `feature/#456`, `456-description`
2. **Commit history** — look at recent commits in the branch for issue numbers
3. **File contents** — search comments for `TODO: #123` or `FIXME: #456`
4. **Git log** — check if related changes reference issues
