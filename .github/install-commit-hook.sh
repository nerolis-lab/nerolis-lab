#!/bin/bash

# Exit if running in a CI environment
if [ -n "$CI" ]; then
  echo "CI environment detected. Skipping git hook installation."
  exit 0
fi

HOOK_SOURCE=".github/commit-msg"
HOOK_TARGET=".git/hooks/commit-msg"

# Exit if .git/hooks directory doesn't exist
if [ ! -d "$(dirname "$HOOK_TARGET")" ]; then
  echo "Git hooks directory not found. Skipping hook installation."
  exit 0
fi

cp "$HOOK_SOURCE" "$HOOK_TARGET"
chmod +x "$HOOK_TARGET"

echo "Git hook installed successfully."
