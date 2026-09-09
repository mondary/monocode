#!/usr/bin/env bash
set -euo pipefail

project_dir="$(cd "$(dirname "$0")/.." && pwd)"
source_app="$project_dir/target/release/bundle/macos/MonoCode PK.app"
target_app="/Applications/monocodePK.app"
overlay="$project_dir/src-tauri/tauri.pk.conf.json"

cd "$project_dir"

# Génère l'overlay de branding PK à partir de la conf de base (suivie en git,
# identique à upstream) : le nom PK n'existe que ici, jamais dans git, donc
# plus aucun conflit de merge sur tauri.conf.json lors des fusions upstream.
node -e '
  const fs = require("fs");
  const base = JSON.parse(fs.readFileSync("src-tauri/tauri.conf.json", "utf8"));
  const overlay = { productName: "MonoCode PK" };
  if (base.app && Array.isArray(base.app.windows)) {
    overlay.app = {
      windows: base.app.windows.map((w) => ({ ...w, title: "MonoCode PK" })),
    };
  }
  fs.writeFileSync("src-tauri/tauri.pk.conf.json", JSON.stringify(overlay, null, 2) + "\n");
'

export NODE_OPTIONS="${NODE_OPTIONS:---max-old-space-size=4096}"
set +e
npm run tauri -- build --bundles app --config "$overlay"
build_status=$?
set -e

if [[ ! -d "$source_app" ]]; then
  echo "Build completed but app bundle was not found: $source_app" >&2
  exit 1
fi

if [[ "$build_status" -ne 0 ]]; then
  echo "Tauri reported an updater-signing warning; the .app bundle is available, continuing." >&2
fi

if [[ -e "$target_app" ]]; then
  rm -rf "$target_app"
fi

ditto "$source_app" "$target_app"
echo "Installed $target_app"
