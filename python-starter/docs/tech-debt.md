# Tech debt

Shortcuts we chose to leave. Add an entry when you leave one; delete it when you fix it. A decision that stays belongs in an [ADR](adr/README.md) instead.

| ID | Severity | Area | Added |
|---|---|---|---|
| [TD-001](#td-001-the-durable-task-store-is-one-json-file) | Low | Example storage | starter |

## TD-001. The durable task store is one JSON file

**Where:** `src/starter/adapters/outbound/json_file.py`.

**What we have.** `JsonFileTaskRepository` reads and rewrites the whole file on every call, with no lock.

**Why it is debt.** Two processes writing at once can lose a write, and the cost grows with the file.

**Fix when.** A second process writes, or the file passes a few thousand records: add a database adapter that passes the same contract suite.
