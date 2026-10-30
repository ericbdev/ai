"""Add, complete and list tasks. This arranges: it reads the clock and the store, and leaves
every rule to ``domain.task``.
"""

from starter.example.application.ports import Clock, TaskRepository
from starter.example.domain.task import Task, TaskError


class TaskNotFound(TaskError):
    def __init__(self, task_id: str) -> None:
        super().__init__(f"no task {task_id}")


class TaskService:
    def __init__(self, tasks: TaskRepository, clock: Clock) -> None:
        self._tasks = tasks
        self._clock = clock

    async def add(self, title: str) -> Task:
        task = Task.open(task_id=await self._tasks.next_id(), title=title, now=self._clock.now())
        await self._tasks.save(task)
        return task

    async def complete(self, task_id: str) -> Task:
        task = await self._tasks.get(task_id)
        if task is None:
            raise TaskNotFound(task_id)
        done = task.complete(self._clock.now())
        await self._tasks.save(done)
        return done

    async def list(self, *, include_done: bool = False) -> list[Task]:
        return [t for t in await self._tasks.all() if include_done or not t.done]
