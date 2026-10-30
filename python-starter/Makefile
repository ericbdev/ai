SHELL := bash
.SHELLFLAGS := -o pipefail -c
.DEFAULT_GOAL := help
.PHONY: help install test lint typecheck fmt check run rename

ARGS ?= list --all

# The app reads only its environment. These targets load .env when it exists; a variable
# already set in the shell wins. `make test` never loads it.
UV_RUN_ENV := uv run $(if $(wildcard .env),--env-file .env)

help:               ## list the targets
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-12s\033[0m %s\n", $$1, $$2}'

install:            ## install dependencies into .venv
	uv sync

test:               ## run the tests: no network, keys or services
	uv run pytest -q

lint:               ## ruff check and format check
	uv run ruff check .
	uv run ruff format --check .

typecheck:          ## ty over src/, warnings as errors
	uv run ty check

fmt:                ## fix what ruff can
	uv run ruff check --fix .
	uv run ruff format .

check: lint typecheck test ## everything CI runs

# `make run` keeps tasks in ./.data so they outlive the process; tests use memory.
run: export APP_STORAGE ?= file

run:                ## run the CLI (loads .env): make run ARGS='add "Write the README"'
	$(UV_RUN_ENV) starter $(ARGS)

rename:             ## rename the package once: make rename NAME=my_app
	uv run python scripts/rename_package.py "$(NAME)"
