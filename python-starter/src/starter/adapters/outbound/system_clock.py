"""The real clock behind ``Clock``. Tests use a fixed one instead."""

from datetime import UTC, datetime


class SystemClock:
    def now(self) -> datetime:
        return datetime.now(UTC)
