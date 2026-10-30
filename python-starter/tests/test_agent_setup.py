"""Every coding agent sees the same rules, skills and MCP servers (docs/agents.md).

Claude Code, Codex and Copilot each look in their own places. Each thing has one source, and
these tests fail when a tool-specific file stops pointing at it or falls out of step.
"""

import json
import re
import tomllib
from pathlib import Path

ROOT = Path(__file__).parents[1]
SKILLS = ROOT / ".agents" / "skills"
FRONTMATTER = re.compile(r"\A---\n(.*?)\n---\n", re.DOTALL)


def _frontmatter(path: Path) -> dict[str, str]:
    found = FRONTMATTER.match(path.read_text(encoding="utf-8"))
    assert found, f"{path.relative_to(ROOT)} has no frontmatter"
    fields: dict[str, str] = {}
    for line in found.group(1).splitlines():
        key, sep, value = line.partition(":")
        if sep and not line.startswith(" "):
            fields[key.strip()] = value.strip().strip('"')
    return fields


def test_claude_reads_the_rules_through_one_import():
    assert (ROOT / "CLAUDE.md").read_text(encoding="utf-8").strip() == "@AGENTS.md"


def test_every_skill_is_a_folder_named_as_its_skill_with_a_description():
    skills = sorted(p for p in SKILLS.iterdir() if p.is_dir())
    assert skills, "no skills found"
    for folder in skills:
        fields = _frontmatter(folder / "SKILL.md")
        assert fields.get("name") == folder.name
        assert fields.get("description")
    assert [p.name for p in SKILLS.iterdir() if not p.is_dir()] == []


def test_claude_sees_the_same_skills():
    """``.claude/skills`` is a symlink to ``.agents/skills``, or an up-to-date copy of it."""
    claude = ROOT / ".claude" / "skills"
    assert claude.is_dir(), "make .claude/skills a symlink to ../.agents/skills"
    for skill in SKILLS.glob("*/SKILL.md"):
        copy = claude / skill.parent.name / "SKILL.md"
        assert copy.read_text(encoding="utf-8") == skill.read_text(encoding="utf-8")
    assert {p.name for p in claude.iterdir()} == {p.name for p in SKILLS.iterdir()}


def test_codex_and_the_other_tools_list_the_same_mcp_servers():
    shared = json.loads((ROOT / ".mcp.json").read_text(encoding="utf-8"))["mcpServers"]
    codex = tomllib.loads((ROOT / ".codex" / "config.toml").read_text(encoding="utf-8"))
    codex_servers = codex.get("mcp_servers", {})
    assert set(codex_servers) == set(shared)
    for name, server in shared.items():
        assert codex_servers[name]["command"] == server["command"]
        assert codex_servers[name].get("args", []) == server.get("args", [])


def test_copilot_instructions_apply_to_python_and_defer_to_the_agent_notes():
    path = ROOT / ".github" / "instructions" / "python.instructions.md"
    assert _frontmatter(path).get("applyTo") == "**/*.py"
    assert "AGENTS.md" in path.read_text(encoding="utf-8")
