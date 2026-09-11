#!/usr/bin/env bash
set -euo pipefail

# Stable is deliberately built from a separate checkout. The development
# checkout may move ahead after a commit; the daily app must still be able to
# see those commits as pending updates and pull them itself.
dev_dir="$(cd "$(dirname "$0")/.." && pwd)"
stable_dir="${PK_STABLE_DIR:-${dev_dir}-stable}"
stable_branch="stable/pk"

if [[ ! -e "$stable_dir/.git" ]]; then
  git -C "$dev_dir" worktree add -b "$stable_branch" "$stable_dir" HEAD
fi

if [[ ! -e "$stable_dir/node_modules" && -d "$dev_dir/node_modules" ]]; then
  ln -s "$dev_dir/node_modules" "$stable_dir/node_modules"
fi

exec bash "$stable_dir/scripts/build-pk-app.sh" stable
