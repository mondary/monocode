#!/usr/bin/env bash
set -euo pipefail

project_dir="$(cd "$(dirname "$0")/.." && pwd)"
log_file="$project_dir/pk-update.log"
exec >>"$log_file" 2>&1

cd "$project_dir"
git fetch upstream
git merge --no-edit upstream/main
npm run build:pk
open -n /Applications/monocodePK.app
