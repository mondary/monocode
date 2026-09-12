#!/usr/bin/env bash
set -euo pipefail

# Variante passée par l'app appelante (sync_pk_upstream) : "dev" reconstruit
# et relance la version dev, tout le reste la version quotidienne.
variant="${1:-stable}"
case "$variant" in
  dev)
    build_cmd="build:pk:dev"
    app_path="/Applications/MonoCodePK-Dev.app"
    ;;
  *)
    build_cmd="build:pk"
    app_path="/Applications/MonoCodePK.app"
    ;;
esac

project_dir="$(cd "$(dirname "$0")/.." && pwd)"
log_file="$project_dir/pk-update.log"
exec >>"$log_file" 2>&1

# GUI-launched Tauri commands do not inherit the interactive shell PATH.
# Include the common Homebrew and nvm locations so npm is available during
# an update started from MonoCode itself.
export PATH="/opt/homebrew/bin:/usr/local/bin:$HOME/.nvm/current/bin:$PATH"

notify() {
  osascript -e "display notification \"$1\" with title \"Mise à jour PKmod\" sound name \"Basso\"" || true
}

cd "$project_dir"
echo "--- sync variant=$variant $(date) ---"

if ! git diff --quiet || ! git diff --cached --quiet; then
  echo "Arbre de travail non propre: mise à jour abandonnée (commiter ou stasher d'abord)." >&2
  notify "Arbre non propre: mise à jour PKmod annulée, voir pk-update.log"
  exit 1
fi

# Commits PK poussés depuis une autre machine: les intégrer avant l'amont.
branch=$(git rev-parse --abbrev-ref HEAD)
source_branch="${PK_UPDATE_BRANCH:-perso/pk}"
git fetch -q origin "$source_branch" 2>/dev/null || true
if [ "$(git rev-list --count "HEAD..origin/$source_branch" 2>/dev/null || echo 0)" -gt 0 ]; then
  # Keep local PK hunks when both branches changed the same lines. Git still
  # brings in every non-overlapping commit from the pushed PK branch.
  if ! git merge --no-edit -X ours "origin/$source_branch"; then
    git checkout --theirs -- Cargo.lock package-lock.json 2>/dev/null || true
    git add Cargo.lock package-lock.json 2>/dev/null || true
    if test -n "$(git diff --name-only --diff-filter=U)"; then
      echo "Conflits irrésolubles sur: $(git diff --name-only --diff-filter=U | tr '\n' ' ')" >&2
      git merge --abort
      notify "Conflits de merge PK: mise à jour PKmod annulée, voir pk-update.log"
      exit 1
    fi
    git commit --no-edit || true
  fi
fi
 # The fork deliberately changes a few shared files (App, changelog and
 # version metadata). Prefer the PK hunk only where lines overlap; all
 # non-overlapping upstream changes are merged automatically.
if ! git merge --no-edit -X ours upstream/main; then
  # Lockfiles: la version amont suffit, ils sont régénérés au build.
  git checkout --theirs -- Cargo.lock package-lock.json 2>/dev/null || true
  git add Cargo.lock package-lock.json 2>/dev/null || true
  # Upstream tests can evolve in parallel with PK-only test coverage. Prefer
  # the upstream test file; production source conflicts still stop the sync.
  while IFS= read -r conflict; do
    case "$conflict" in
      *.test.ts|*.test.tsx|*.spec.ts|*.spec.tsx)
        git checkout --theirs -- "$conflict"
        git add -- "$conflict"
        ;;
    esac
  done < <(git diff --name-only --diff-filter=U)
  if test -n "$(git diff --name-only --diff-filter=U)"; then
    echo "Conflits irrésolubles sur: $(git diff --name-only --diff-filter=U | tr '\n' ' ')" >&2
    git merge --abort
    notify "Conflits de merge: mise à jour PKmod annulée, voir pk-update.log"
    exit 1
  fi
  git commit --no-edit || true
fi

npm run "$build_cmd"
open -n "$app_path"
