"""The command line: a driving adapter. It parses, calls a service and maps named errors.

stdout carries command output (JSON); logs go to stderr. The output shape is this adapter's
own (``TaskView``), never a domain type, so changing a rule never changes the output by accident.
"""

import argparse
import asyncio
import json
import logging
import sys

from pydantic import BaseModel

from starter.bootstrap import build_container
from starter.config import get_settings
from starter.example.domain.task import Task
from starter.shared.domain.errors import DomainError

logger = logging.getLogger("starter")


class TaskView(BaseModel):
    id: str
    title: str
    done: bool
    created_at: str

    @classmethod
    def of(cls, task: Task) -> "TaskView":
        return cls(
            id=task.id, title=task.title, done=task.done, created_at=task.created_at.isoformat()
        )


def _parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(prog="starter")
    commands = parser.add_subparsers(dest="command", required=True)
    add = commands.add_parser("add", help="add a task")
    add.add_argument("title")
    done = commands.add_parser("done", help="complete a task")
    done.add_argument("task_id")
    listing = commands.add_parser("list", help="list open tasks")
    listing.add_argument("--all", action="store_true", help="include done tasks")
    check = commands.add_parser("check-config", help="print the settings; no side effects")
    check.add_argument("--require-durable", action="store_true", help="fail on a throwaway setting")
    return parser


async def _run(args: argparse.Namespace) -> object:
    tasks = build_container(get_settings()).tasks
    if args.command == "add":
        return TaskView.of(await tasks.add(args.title)).model_dump()
    if args.command == "done":
        return TaskView.of(await tasks.complete(args.task_id)).model_dump()
    return [TaskView.of(t).model_dump() for t in await tasks.list(include_done=args.all)]


def main(argv: list[str] | None = None) -> int:
    logging.basicConfig(level=logging.INFO, stream=sys.stderr)
    args = _parser().parse_args(argv)
    if args.command == "check-config":
        settings = get_settings()
        print(settings.model_dump_json(indent=2))
        if args.require_durable and settings.throwaway:
            logger.error("a throwaway setting is selected: APP_STORAGE=memory")
            return 2
        return 0
    try:
        out = asyncio.run(_run(args))
    except DomainError as refused:
        logger.error("%s: %s", type(refused).__name__, refused)
        return 1
    print(json.dumps(out, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
