# External calls

Read this when you add or change a call that leaves the process: an HTTP API, a database, a queue, a file outside the repository, a paid service.

1. **Port.** Declare what the context needs as a `Protocol` in its `application/ports.py`, in the context's own words. Done when the context compiles against the port alone.
2. **Adapters.** Write the in-memory adapter and the real one in `adapters/outbound/`, and a contract suite in `tests/adapters/` that runs both. Done when every behaviour the application relies on is a test in the suite.
3. **Validation.** The real adapter parses what it receives with a pydantic model. An answer that does not fit raises a named refusal; the caller gets a whole value or an error.
4. **Arrangement.** Retries, timeouts and spend caps are decided in the application layer; their values are settings in `config.py`.
5. **Caching.** A paid or slow answer is cached under a key built from everything that shapes it (inputs, versions, settings), so a change to any of them is a new key.
6. **Spend.** Each run records what it spent and stops at its cap.
7. **Wiring.** `bootstrap.py` picks the adapter from a setting whose default is throwaway. Extend `Settings.throwaway` to cover it, so `check-config --require-durable` fails while the throwaway adapter is selected. Done when `make check` passes with no network.
