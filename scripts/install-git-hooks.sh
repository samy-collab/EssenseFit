#!/usr/bin/env bash

set -euo pipefail

if ! command -v git >/dev/null 2>&1; then
  echo "git nao encontrado."
  exit 1
fi

if ! git rev-parse --git-dir >/dev/null 2>&1; then
  echo "Este diretorio nao esta dentro de um repositorio git."
  exit 1
fi

git config core.hooksPath .githooks
chmod +x .githooks/pre-commit

echo "Hooks instalados com sucesso em .githooks."
