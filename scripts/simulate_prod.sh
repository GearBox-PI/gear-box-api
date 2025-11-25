#!/usr/bin/env bash
set -euo pipefail

echo "[simulate] Building production bundle..."
npm run build

if [ -f .env ]; then
  echo "[simulate] Copying .env to build/.env for local execution"
  cp .env build/.env
fi

echo "[simulate] Running migrations from compiled build..."
node build/ace.js migration:run --force
