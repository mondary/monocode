#!/usr/bin/env bash
set -euo pipefail

# Stable is deliberately built from a separate checkout. The development
# checkout may move ahead after a commit; the daily app must still be able to
# see those commits as pending updates and pull them itself.
dev_dir="$(cd "$(dirname "$0")/.." && pwd)"
stable_dir="${PK_STABLE_DIR:-${dev_dir}-stable}"
stable_branch="stable/pk"

# The updater runs from the stable checkout itself. Do not create a nested
# worktree in that case: build the checkout that was just fast-forwarded.
if [[ "$(git -C "$dev_dir" branch --show-current 2>/dev/null || true)" == "$stable_branch" ]]; then
  exec bash "$dev_dir/scripts/build-pk-app.sh" stable
fi

if [[ ! -e "$stable_dir/.git" ]]; then
  git -C "$dev_dir" worktree add -b "$stable_branch" "$stable_dir" HEAD
fi

if [[ ! -d "$stable_dir/node_modules" && -d "$dev_dir/node_modules" ]]; then
  ln -s "$dev_dir/node_modules" "$stable_dir/node_modules"
fi

exec bash "$stable_dir/scripts/build-pk-app.sh" stable
