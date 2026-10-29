"""The root of every rule error. Each context subclasses it once and names one class per refusal.

Never raise a bare ``ValueError`` or ``KeyError`` for a rule, and never subclass one: an adapter
that catches a built-in to map a rule also maps every bug that raises it.
"""


class DomainError(Exception):
    """A rule refused an input. Inbound adapters map each subclass to one response."""
