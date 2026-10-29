"""Enforce the bounded contexts and the hexagonal layers by reading imports (ADR 0002).

The package is cut first by bounded context, then by layer inside each context:

    shared/                         the shared kernel; imports no context
    <context>/                      one package per bounded context, e.g. example/
    bootstrap.py, config.py, adapters/    the outer ring that wires contexts together

A context imports only itself and the shared kernel. Inside a context, ``domain`` decides (pure:
no I/O, settings, async or application layer) and ``application`` arranges (it reaches the
outside only through ports). Do not relax a rule here to make a change pass.
"""

import ast
from pathlib import Path

import pytest

PKG = Path(__file__).parents[1] / "src" / "starter"
NAME = PKG.name

# Libraries that reach outside the process. Only the outer ring may import them.
IO_LIBS = {
    "httpx", "requests", "urllib.request", "socket", "subprocess", "sqlite3", "boto3",
    "botocore", "fastapi", "starlette", "uvicorn", "pydantic_settings", "sqlalchemy",
}  # fmt: skip

OUTER = {f"{NAME}.bootstrap", f"{NAME}.config", f"{NAME}.adapters"}
ROOT = {NAME, f"{NAME}.__version__"}
ADAPTER_RULES = {
    "adapters/outbound": {f"{NAME}.adapters.inbound", f"{NAME}.bootstrap"},
    "adapters/inbound": {f"{NAME}.adapters.outbound"},
}


def _contexts() -> tuple[str, ...]:
    """Every package under the root but ``adapters``: adding a context needs no edit here."""
    return tuple(
        sorted(
            p.name for p in PKG.iterdir() if (p / "__init__.py").exists() and p.name != "adapters"
        )
    )


CONTEXTS = _contexts()


def _imports(path: Path) -> set[str]:
    names: set[str] = set()
    for node in ast.walk(ast.parse(path.read_text(encoding="utf-8"))):
        if isinstance(node, ast.Import):
            names.update(a.name for a in node.names)
        elif isinstance(node, ast.ImportFrom) and node.module and node.level == 0:
            names.add(node.module)
            names.update(f"{node.module}.{a.name}" for a in node.names)
    return names


def _within(name: str, prefix: str) -> bool:
    return name == prefix or name.startswith(prefix + ".")


def _module(path: Path) -> str:
    parts = path.relative_to(PKG).with_suffix("").parts
    return ".".join((NAME, *(p for p in parts if p != "__init__")))


def _context(module: str) -> str | None:
    return next((c for c in CONTEXTS if _within(module, f"{NAME}.{c}")), None)


def _layer(module: str) -> str | None:
    context = _context(module)
    if context is None:
        return None
    rest = module.removeprefix(f"{NAME}.{context}").lstrip(".").split(".")
    return rest[0] if rest[0] in ("domain", "application") else None


def _is_outer(module: str) -> bool:
    return any(_within(module, outer) for outer in OUTER)


def _sources() -> list[Path]:
    return sorted(PKG.rglob("*.py"))


def test_there_is_a_shared_kernel_and_at_least_one_context():
    """Guards the rules below against passing on an empty tree."""
    assert "shared" in CONTEXTS and len(CONTEXTS) >= 2


def test_every_module_belongs_to_a_context_layer_or_the_outer_ring():
    stray = [
        _module(p)
        for p in _sources()
        if p.name != "__init__.py" and _layer(_module(p)) is None and not _is_outer(_module(p))
    ]
    assert stray == []


def test_a_context_imports_only_itself_and_the_shared_kernel():
    offenders = []
    for path in _sources():
        me = _context(_module(path))
        if me is None:
            continue
        allowed = {me} if me == "shared" else {me, "shared"}
        for name in sorted(_imports(path)):
            if _within(name, NAME) and name not in ROOT and _context(name) not in allowed:
                offenders.append(f"{_module(path)} imports {name}")
    assert offenders == []


def test_domain_layers_decide_and_never_arrange():
    offenders = []
    for path in _sources():
        module = _module(path)
        if _layer(module) != "domain":
            continue
        for name in sorted(_imports(path)):
            if (
                _layer(name) == "application"
                or any(_within(name, lib) for lib in IO_LIBS)
                or _is_outer(name)
            ):
                offenders.append(f"{module} imports {name}")
        tree = ast.parse(path.read_text(encoding="utf-8"))
        offenders += [
            f"{module} defines async {n.name}"
            for n in ast.walk(tree)
            if isinstance(n, ast.AsyncFunctionDef)
        ]
    assert offenders == []


def test_application_layers_reach_the_outside_only_through_ports():
    offenders = [
        f"{_module(p)} imports {name}"
        for p in _sources()
        if _layer(_module(p)) == "application"
        for name in sorted(_imports(p))
        if any(_within(name, lib) for lib in IO_LIBS) or _is_outer(name)
    ]
    assert offenders == []


@pytest.mark.parametrize("folder", ADAPTER_RULES)
def test_adapters_stay_on_their_side(folder):
    offenders = [
        f"{p.relative_to(PKG)} imports {name}"
        for p in sorted((PKG / folder).rglob("*.py"))
        for name in sorted(_imports(p))
        if any(_within(name, banned) for banned in ADAPTER_RULES[folder])
    ]
    assert offenders == []


def test_io_libraries_are_imported_only_by_the_outer_ring():
    """Given any context, then it reaches the outside only through a port an adapter fills."""
    offenders = [
        f"{_module(p)} imports {name}"
        for p in _sources()
        if _context(_module(p)) is not None
        for name in _imports(p)
        if any(_within(name, lib) for lib in IO_LIBS)
    ]
    assert offenders == []


def test_no_module_imports_a_private_name_from_another():
    offenders = [
        f"{_module(p)} imports {node.module}.{alias.name}"
        for p in _sources()
        for node in ast.walk(ast.parse(p.read_text(encoding="utf-8")))
        if isinstance(node, ast.ImportFrom) and node.module and _within(node.module, NAME)
        for alias in node.names
        if alias.name.startswith("_") and not alias.name.startswith("__")
    ]
    assert offenders == []


def test_no_grab_bag_modules():
    """A module is named for its concept; ``utils`` and friends have no owner."""
    banned = {"utils", "helpers", "common", "misc"}
    assert [p for p in _sources() if p.stem in banned or p.parent.name in banned] == []


def test_the_composition_root_builds_and_never_adapts():
    tree = ast.parse((PKG / "bootstrap.py").read_text(encoding="utf-8"))
    assert {n.name for n in tree.body if isinstance(n, ast.ClassDef)} == {"Container"}
