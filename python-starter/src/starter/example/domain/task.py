"""A task and its lifecycle rules: the starter's example aggregate. Replace it with your own.

    open ──complete──► done

Pure: ids and times come in as arguments; every change returns a new task, so the caller
decides what to store. One error class per refusal, under the context's ``TaskError``.
"""

from dataclasses import dataclass, replace
from datetime import datetime

from starter.shared.domain.errors import DomainError

MAX_TITLE = 200


class TaskError(DomainError):
    """A task rule refused its input."""


class BlankTitle(TaskError):
    def __init__(self) -> None:
        super().__init__("a task needs a title")


class TitleTooLong(TaskError):
    def __init__(self, length: int) -> None:
        super().__init__(f"a title has at most {MAX_TITLE} characters, not {length}")


class AlreadyDone(TaskError):
    def __init__(self, task_id: str) -> None:
        super().__init__(f"task {task_id} is already done")


@dataclass(frozen=True)
class Task:
    id: str
    title: str
    created_at: datetime
    done_at: datetime | None = None

    @classmethod
    def open(cls, *, task_id: str, title: str, now: datetime) -> "Task":
        clean = " ".join(title.split())
        if not clean:
            raise BlankTitle()
        if len(clean) > MAX_TITLE:
            raise TitleTooLong(len(clean))
        return cls(id=task_id, title=clean, created_at=now)

    @property
    def done(self) -> bool:
        return self.done_at is not None

    def complete(self, now: datetime) -> "Task":
        if self.done:
            raise AlreadyDone(self.id)
        return replace(self, done_at=now)
