"""In-memory adapters. Each passes the same contract suite as its durable counterpart."""

from starter.example.domain.task import Task


class MemoryTaskRepository:
    def __init__(self) -> None:
        self._tasks: dict[str, Task] = {}
        self._issued = 0

    async def next_id(self) -> str:
        self._issued += 1
        return str(self._issued)

    async def save(self, task: Task) -> None:
        self._tasks[task.id] = task

    async def get(self, task_id: str) -> Task | None:
        return self._tasks.get(task_id)

    async def all(self) -> list[Task]:
        return sorted(self._tasks.values(), key=lambda t: (t.created_at, t.id))
