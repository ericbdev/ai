from datetime import UTC, datetime, timedelta

T0 = datetime(2026, 1, 1, 9, 0, tzinfo=UTC)


class FixedClock:
    """A clock that moves only when told to."""

    def __init__(self, now: datetime = T0) -> None:
        self._now = now

    def now(self) -> datetime:
        return self._now

    def advance(self, seconds: int) -> None:
        self._now += timedelta(seconds=seconds)
