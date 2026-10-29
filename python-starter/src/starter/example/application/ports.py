"""Ports the example context owns: what it needs from outside, stated in its own words.

A port lives with the context that calls it. It moves to ``shared/application/ports.py`` only
when a second context calls it.
"""

from datetime import datetime
from typing import Protocol

from starter.example.domain.task import Task


class TaskRepository(Protocol):
    async def next_id(self) -> str: ...

    async def save(self, task: Task) -> None:
        """Insert or replace the task with the same id."""
        ...

    async def get(self, task_id: str) -> Task | None: ...

    async def all(self) -> list[Task]:
        """Oldest first."""
        ...


class Clock(Protocol):
    def now(self) -> datetime:
        """The current time, timezone-aware (UTC)."""
        ...
