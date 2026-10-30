import pytest

from starter.example.domain.task import (
    MAX_TITLE,
    AlreadyDone,
    BlankTitle,
    Task,
    TitleTooLong,
)
from tests.clock import T0


def _task(title: str = "Write the README") -> Task:
    return Task.open(task_id="1", title=title, now=T0)


def test_a_new_task_is_open_with_its_title_tidied():
    task = _task("  Write   the\nREADME ")
    assert task.title == "Write the README" and not task.done and task.created_at == T0


@pytest.mark.parametrize("title", ["", "   ", "\n\t"])
def test_a_blank_title_is_refused(title):
    with pytest.raises(BlankTitle):
        _task(title)


def test_a_title_has_a_length_limit():
    assert _task("x" * MAX_TITLE).title
    with pytest.raises(TitleTooLong):
        _task("x" * (MAX_TITLE + 1))


def test_completing_returns_a_done_task_and_leaves_the_original():
    task = _task()
    done = task.complete(T0)
    assert done.done and done.done_at == T0 and not task.done


def test_a_done_task_cannot_be_completed_again():
    with pytest.raises(AlreadyDone):
        _task().complete(T0).complete(T0)


def test_rule_errors_are_never_built_in_lookup_or_value_errors():
    assert not issubclass(AlreadyDone, ValueError | LookupError)
