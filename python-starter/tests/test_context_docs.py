"""Each bounded context documents itself, and the docs stay true to the code.

A context's README lists every module it holds and names every port it owns; the agent notes
name every context. A module added, moved or removed without its README row fails here.
"""

import ast
import re

import pytest

from tests.test_architecture import CONTEXTS, PKG

ROOT = PKG.parents[1]
LISTED = re.compile(r"`((?:domain|application)/\w+\.py)`")


def _readme(context: str) -> str:
    path = PKG / context / "README.md"
    assert path.exists(), f"add {path.relative_to(ROOT)}"
    return path.read_text(encoding="utf-8")


def _modules(context: str) -> set[str]:
    base = PKG / context
    return {
        p.relative_to(base).as_posix()
        for layer in ("domain", "application")
        for p in (base / layer).glob("*.py")
        if p.name != "__init__.py"
    }


@pytest.mark.parametrize("context", CONTEXTS)
def test_a_context_readme_lists_exactly_its_modules(context):
    listed = set(LISTED.findall(_readme(context)))
    modules = _modules(context)
    assert modules - listed == set(), f"add these to {context}/README.md"
    assert listed - modules == set(), f"{context}/README.md lists modules that do not exist"


@pytest.mark.parametrize("context", CONTEXTS)
def test_a_context_readme_names_every_port_it_owns(context):
    ports = PKG / context / "application" / "ports.py"
    if not ports.exists():
        return
    tree = ast.parse(ports.read_text(encoding="utf-8"))
    names = [n.name for n in tree.body if isinstance(n, ast.ClassDef)]
    readme = _readme(context)
    assert [name for name in names if f"`{name}`" not in readme] == []


def test_the_agent_notes_name_every_context():
    agents = (ROOT / "AGENTS.md").read_text(encoding="utf-8")
    assert [c for c in CONTEXTS if f"`{c}/`" not in agents] == []


def test_every_adr_is_in_the_index():
    adrs = ROOT / "docs" / "adr"
    index = (adrs / "README.md").read_text(encoding="utf-8")
    files = sorted(p.name for p in adrs.glob("[0-9][0-9][0-9][0-9]-*.md"))
    assert [f for f in files if f not in index] == []


def test_paths_the_agent_notes_link_exist():
    agents = (ROOT / "AGENTS.md").read_text(encoding="utf-8")
    links = re.findall(r"\]\(((?!https?:)[^)#]+)", agents)
    assert [link for link in links if not (ROOT / link).exists()] == []
