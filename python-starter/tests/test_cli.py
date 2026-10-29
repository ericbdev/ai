"""End to end through the driving adapter, on throwaway or temporary storage."""

import json

import pytest

from starter.adapters.inbound import cli
from starter.config import get_settings


@pytest.fixture(autouse=True)
def file_storage(monkeypatch, tmp_path):
    monkeypatch.setenv("APP_STORAGE", "file")
    monkeypatch.setenv("APP_DATA_DIR", str(tmp_path))
    get_settings.cache_clear()
    yield
    get_settings.cache_clear()


def _run(capsys, *argv: str) -> object:
    assert cli.main(list(argv)) == 0
    return json.loads(capsys.readouterr().out)


def test_add_complete_and_list(capsys):
    added = _run(capsys, "add", "Write the README")
    assert _run(capsys, "done", added["id"])["done"] is True
    assert _run(capsys, "list") == []
    assert [t["title"] for t in _run(capsys, "list", "--all")] == ["Write the README"]


def test_a_refusal_exits_non_zero_with_its_error_name(caplog):
    assert cli.main(["add", "   "]) == 1
    assert "BlankTitle" in caplog.text


def test_require_durable_fails_on_throwaway_settings(monkeypatch):
    monkeypatch.setenv("APP_STORAGE", "memory")
    get_settings.cache_clear()
    assert cli.main(["check-config", "--require-durable"]) == 2
