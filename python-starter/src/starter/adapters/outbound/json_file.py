"""Tasks in one JSON file: the durable adapter behind ``TaskRepository``.

Good enough for one process; swap it for a database adapter that passes the same contract
suite (``tests/adapters/test_task_repository_contract.py``) when that stops being true.
The file's shape is a stored format: add fields with defaults, never rename or retype one.
"""

import json
import os
from datetime import datetime
from pathlib import Path
from typing import Any

from starter.example.domain.task import Task


class JsonFileTaskRepository:
    def __init__(self, path: Path) -> None:
        self._path = path

    async def next_id(self) -> str:
        data = self._read()
        data["issued"] += 1
        self._write(data)
        return str(data["issued"])

    async def save(self, task: Task) -> None:
        data = self._read()
        data["tasks"][task.id] = _encode(task)
        self._write(data)

    async def get(self, task_id: str) -> Task | None:
        raw = self._read()["tasks"].get(task_id)
        return _decode(raw) if raw is not None else None

    async def all(self) -> list[Task]:
        tasks = [_decode(raw) for raw in self._read()["tasks"].values()]
        return sorted(tasks, key=lambda t: (t.created_at, t.id))

    def _read(self) -> dict[str, Any]:
        if not self._path.exists():
            return {"issued": 0, "tasks": {}}
        return json.loads(self._path.read_text(encoding="utf-8"))

    def _write(self, data: dict[str, Any]) -> None:
        # Write a sibling file and rename it over the old one, so a crash never leaves half a file.
        self._path.parent.mkdir(parents=True, exist_ok=True)
        tmp = self._path.with_suffix(".tmp")
        tmp.write_text(json.dumps(data, indent=2, sort_keys=True), encoding="utf-8")
        os.replace(tmp, self._path)


def _encode(task: Task) -> dict[str, Any]:
    return {
        "id": task.id,
        "title": task.title,
        "created_at": task.created_at.isoformat(),
        "done_at": task.done_at.isoformat() if task.done_at else None,
    }


def _decode(raw: dict[str, Any]) -> Task:
    done_at = raw.get("done_at")
    return Task(
        id=raw["id"],
        title=raw["title"],
        created_at=datetime.fromisoformat(raw["created_at"]),
        done_at=datetime.fromisoformat(done_at) if done_at else None,
    )
