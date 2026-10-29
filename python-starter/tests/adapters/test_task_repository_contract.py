"""One contract, every implementation: in memory and in a JSON file.

If the memory adapter passes the same suite as the durable one, application tests that use it
are testing real behaviour. A new adapter joins ``repository``; a new behaviour joins the suite.
"""

import asyncio
from datetime import timedelta

import pytest

from starter.adapters.outbound.json_file import JsonFileTaskRepository
from starter.adapters.outbound.memory import MemoryTaskRepository
from starter.example.domain.task import Task
from tests.clock import T0


@pytest.fixture(params=["memory", "file"])
def repository(request, tmp_path):
    if request.param == "memory":
        return MemoryTaskRepository()
    return JsonFileTaskRepository(tmp_path / "data" / "tasks.json")


def _task(repository, title: str, minutes: int = 0) -> Task:
    task_id = asyncio.run(repository.next_id())
    return Task.open(task_id=task_id, title=title, now=T0 + timedelta(minutes=minutes))


def test_ids_are_never_issued_twice(repository):
    ids = [asyncio.run(repository.next_id()) for _ in range(5)]
    assert len(set(ids)) == 5


def test_a_saved_task_round_trips_exactly(repository):
    task = _task(repository, "Round trip").complete(T0 + timedelta(hours=1))
    asyncio.run(repository.save(task))
    assert asyncio.run(repository.get(task.id)) == task


def test_saving_again_replaces(repository):
    task = _task(repository, "Replace")
    asyncio.run(repository.save(task))
    asyncio.run(repository.save(task.complete(T0)))
    assert asyncio.run(repository.get(task.id)).done
    assert len(asyncio.run(repository.all())) == 1


def test_an_unknown_id_is_none(repository):
    assert asyncio.run(repository.get("missing")) is None


def test_all_is_oldest_first(repository):
    later = _task(repository, "Later", minutes=5)
    sooner = _task(repository, "Sooner", minutes=1)
    for task in (later, sooner):
        asyncio.run(repository.save(task))
    assert [t.title for t in asyncio.run(repository.all())] == ["Sooner", "Later"]


def test_the_file_survives_a_new_adapter(tmp_path):
    path = tmp_path / "tasks.json"
    first = JsonFileTaskRepository(path)
    task = _task(first, "Durable")
    asyncio.run(first.save(task))
    second = JsonFileTaskRepository(path)
    assert asyncio.run(second.get(task.id)) == task
    assert asyncio.run(second.next_id()) != task.id
