#!/usr/bin/env bash
set -euo pipefail

project_dir="$(cd "$(dirname "$0")/.." && pwd)"
log_file="$project_dir/pk-update.log"
exec >>"$log_file" 2>&1

notify() {
  osascript -e "display notification \"$1\" with title \"Mise à jour PKmod\" sound name \"Basso\"" || true
}

cd "$project_dir"

if ! git diff --quiet || ! git diff --cached --quiet; then
  echo "Arbre de travail non propre: mise à jour abandonnée (commiter ou stasher d'abord)." >&2
  notify "Arbre non propre: mise à jour PKmod annulée, voir pk-update.log"
  exit 1
fi

git fetch upstream
if ! git merge --no-edit upstream/main; then
  # Lockfiles: la version amont suffit, ils sont régénérés au build.
  git checkout --theirs -- Cargo.lock package-lock.json 2>/dev/null || true
  git add Cargo.lock package-lock.json 2>/dev/null || true
  if test -n "$(git diff --name-only --diff-filter=U)"; then
    echo "Conflits irrésolubles sur: $(git diff --name-only --diff-filter=U | tr '\n' ' ')" >&2
    git merge --abort
    notify "Conflits de merge: mise à jour PKmod annulée, voir pk-update.log"
    exit 1
  fi
  git commit --no-edit || true
fi

npm run build:pk
open -n /Applications/monocodePK.app
