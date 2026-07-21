#!/usr/bin/env bash
#
# Install the Git pre-commit hook for auto-generating manifests.
# Run once after cloning: bash scripts/install-hook.sh
#
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
HOOK_SRC="$REPO_ROOT/scripts/pre-commit"
HOOK_DST="$REPO_ROOT/.git/hooks/pre-commit"

if [ ! -f "$HOOK_SRC" ]; then
  echo "Error: $HOOK_SRC not found." >&2
  exit 1
fi

cp "$HOOK_SRC" "$HOOK_DST"
chmod +x "$HOOK_DST"
echo "✓ Pre-commit hook installed to .git/hooks/pre-commit"
echo "  Now just drop files in Galleries/ or Videos/ and commit — manifests update automatically."
