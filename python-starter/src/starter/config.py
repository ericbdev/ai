"""Runtime configuration, read from environment variables (prefix ``APP_``) and nothing else.

The app never opens ``.env`` itself: the Makefile passes it to ``uv run --env-file``, so a
forgotten ``.env`` can never point a hand-run command at a real backing service. Defaults are
throwaway and need no credentials.
"""

from functools import lru_cache
from pathlib import Path
from typing import Literal

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_prefix="APP_", extra="ignore")

    storage: Literal["memory", "file"] = "memory"
    data_dir: Path = Path(".data")  # "file" only

    @property
    def throwaway(self) -> bool:
        """True when a setting keeps nothing past the process."""
        return self.storage == "memory"


@lru_cache
def get_settings() -> Settings:
    return Settings()
