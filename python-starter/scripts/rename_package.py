"""Rename the ``starter`` package, its command and its references, once, on a fresh copy.

    uv run python scripts/rename_package.py my_app

It moves ``src/starter`` to ``src/my_app`` and replaces the package name in source, tests and
config. In Markdown it replaces only code references (``src/starter``, ``starter.module``,
``uv run starter``, ``--env-file .env starter``), so prose such as "this starter" stays.
The command becomes ``my-app``. Run ``make check`` after it.
"""

import re
import sys
from pathlib import Path

ROOT = Path(__file__).parents[1]
OLD = "starter"
SKIP = {".venv", ".git", ".pytest_cache", ".ruff_cache", "__pycache__", "uv.lock"}
SUFFIXES = {".py", ".toml", ".md", ".yml", ".yaml", ".json", ".example", ""}
WORD = re.compile(rf"(?<![-\w]){OLD}(?![-\w])")
PROSE_CODE = re.compile(rf"(?<=src/){OLD}\b|(?<=\.env ){OLD}\b|(?<![-\w]){OLD}(?=\.\w)")


def main(name: str) -> int:
    if not re.fullmatch(r"[a-z][a-z0-9_]*", name) or name == OLD:
        print(f"usage: rename_package.py NEW_NAME (snake_case, not {OLD!r})", file=sys.stderr)
        return 2
    src = ROOT / "src" / OLD
    if not src.exists():
        print(f"{src} does not exist: already renamed?", file=sys.stderr)
        return 1
    command = name.replace("_", "-")
    for path in sorted(ROOT.rglob("*")):
        if not path.is_file() or SKIP & set(path.relative_to(ROOT).parts):
            continue
        if path.suffix not in SUFFIXES or path == Path(__file__):
            continue
        text = path.read_text(encoding="utf-8")
        new = text.replace(f'{OLD} = "{OLD}.', f'{command} = "{OLD}.')  # the script entry
        new = new.replace(f"uv run {OLD} ", f"uv run {command} ").replace(
            f"$(UV_RUN_ENV) {OLD} ", f"$(UV_RUN_ENV) {command} "
        )
        new = PROSE_CODE.sub(name, new) if path.suffix == ".md" else WORD.sub(name, new)
        if new != text:
            path.write_text(new, encoding="utf-8")
    src.rename(ROOT / "src" / name)
    print(f"renamed {OLD} to {name}; the command is {command}. Now: uv sync && make check")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1] if len(sys.argv) > 1 else ""))
