# Reference: Analysis & Detection Heuristics

## Classifying Changes by Commit Type

When examining staged changes to suggest a commit type, use these pattern signals:

### Feature patterns → `feat`
- New files in `src/features/`, `src/pages/`, or similar feature directories
- New exports from index files
- New public functions or components

### Bug fix patterns → `fix`
- Changes in error handling
- Logic corrections
- Edge case handling in existing code
- Files with "bug" or "issue" references

### Refactoring patterns → `refactor`
- No functional changes, only structure
- Renamed files/functions/classes
- Internal reorganization
- No new features added

### Performance patterns → `perf`
- Optimization comments in code
- Caching implementations
- Algorithm improvements

### Test patterns → `test`
- Changes only to test files
- New test coverage

### Tooling patterns → `chore`
- Changes to config files
- Dependency updates
- Build script changes

## Detecting Issue References

Search for issue references in multiple places:

1. **Branch name** - Extract from patterns like `fix/issue-123`, `feature/#456`, `456-description`
2. **Commit history** - Look at recent commits in the branch for issue numbers
3. **File contents** - Search comments or code for `TODO: #123` or `FIXME: #456`
4. **Git log** - Check if related changes have issue references
