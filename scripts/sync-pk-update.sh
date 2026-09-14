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
export PATH="/opt/homebrew/bin:/usr/local/bin:${HOME:-/Users/clm}/.nvm/current/bin:$PATH"

# Resolve npm once, because GUI-launched processes can have a different PATH
# from the shell even after the common locations above are added.
npm_bin=""
for candidate in \
  "$(command -v npm 2>/dev/null || true)" \
  /opt/homebrew/bin/npm \
  /usr/local/bin/npm \
  "${HOME:-/Users/clm}/.nvm/current/bin/npm"; do
  if [[ -n "$candidate" && -x "$candidate" ]]; then
    npm_bin="$candidate"
    break
  fi
done
if [[ -z "$npm_bin" ]]; then
  echo "npm introuvable: PATH=$PATH" >&2
  osascript -e 'display notification "npm introuvable: mise à jour PKmod annulée, voir pk-update.log" with title "Mise à jour PKmod" sound name "Basso"' || true
  exit 1
fi

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

# Commits PK poussés depuis une autre machine: les intégrer avant le build.
# L'amont officiel n'est pas fusionné automatiquement : le fork diverge sur
# des fichiers structurants, et un merge non compilé ne doit jamais remplacer
# l'application quotidienne. L'intégration upstream se fait dans perso/pk,
# puis le build stable ne consomme que cette branche validée.
source_branch="${PK_UPDATE_BRANCH:-perso/pk}"
git fetch -q origin "$source_branch" 2>/dev/null || true
if [ "$(git rev-list --count "HEAD..origin/$source_branch" 2>/dev/null || echo 0)" -gt 0 ]; then
  if ! git merge --ff-only "origin/$source_branch"; then
    echo "La branche stable n'est pas un descendant de origin/$source_branch: synchronisation refusée." >&2
    notify "Branche stable divergente: mise à jour PKmod annulée, voir pk-update.log"
    exit 1
  fi
fi

"$npm_bin" run "$build_cmd"
open -n "$app_path"
