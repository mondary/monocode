#!/usr/bin/env bash
set -euo pipefail

project_dir="$(cd "$(dirname "$0")/.." && pwd)"
log_file="$project_dir/pk-update.log"
exec >>"$log_file" 2>&1

cd "$project_dir"
git fetch upstream
if ! git merge --no-edit upstream/main; then
  echo "CONFLIT de merge: mise à jour abandonnée, dépôt laissé en l'état pour résolution manuelle." >&2
  osascript -e 'display notification "Conflit de merge: mise à jour PKmod annulée, voir pk-update.log" with title "Mise à jour PKmod" sound name "Basso"' || true
  exit 1
fi
npm run build:pk
open -n /Applications/monocodePK.app
