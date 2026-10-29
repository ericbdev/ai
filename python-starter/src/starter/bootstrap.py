"""Composition root: the only place that chooses which adapter backs which port.

It builds; it never adapts. It defines no class but ``Container``: an adapter, even one between
two contexts, lives in ``adapters/`` and is only constructed here.
"""

from dataclasses import dataclass

from starter.adapters.outbound.json_file import JsonFileTaskRepository
from starter.adapters.outbound.memory import MemoryTaskRepository
from starter.adapters.outbound.system_clock import SystemClock
from starter.config import Settings
from starter.example.application.ports import TaskRepository
from starter.example.application.service import TaskService


@dataclass
class Container:
    settings: Settings
    tasks: TaskService  # the example context; replace with yours


def build_task_repository(settings: Settings) -> TaskRepository:
    if settings.storage == "file":
        return JsonFileTaskRepository(settings.data_dir / "tasks.json")
    return MemoryTaskRepository()


def build_container(settings: Settings) -> Container:
    service = TaskService(build_task_repository(settings), SystemClock())
    return Container(settings=settings, tasks=service)
