import asyncio

import pytest

from starter.adapters.outbound.memory import MemoryTaskRepository
from starter.example.application.service import TaskNotFound, TaskService
from starter.example.domain.task import AlreadyDone, BlankTitle
from tests.clock import FixedClock


def _service() -> tuple[TaskService, FixedClock]:
    clock = FixedClock()
    return TaskService(MemoryTaskRepository(), clock), clock


def test_added_tasks_are_listed_oldest_first_and_done_ones_are_hidden():
    service, clock = _service()
    first = asyncio.run(service.add("First"))
    clock.advance(1)
    asyncio.run(service.add("Second"))
    asyncio.run(service.complete(first.id))
    assert [t.title for t in asyncio.run(service.list())] == ["Second"]
    assert [t.title for t in asyncio.run(service.list(include_done=True))] == ["First", "Second"]


def test_completion_is_stamped_with_the_clock():
    service, clock = _service()
    task = asyncio.run(service.add("Task"))
    clock.advance(60)
    assert asyncio.run(service.complete(task.id)).done_at == clock.now()


def test_an_unknown_task_is_a_named_error():
    service, _ = _service()
    with pytest.raises(TaskNotFound):
        asyncio.run(service.complete("nope"))


def test_domain_refusals_pass_through_and_nothing_is_stored():
    service, _ = _service()
    with pytest.raises(BlankTitle):
        asyncio.run(service.add("  "))
    assert asyncio.run(service.list(include_done=True)) == []
    task = asyncio.run(service.add("Once"))
    asyncio.run(service.complete(task.id))
    with pytest.raises(AlreadyDone):
        asyncio.run(service.complete(task.id))
