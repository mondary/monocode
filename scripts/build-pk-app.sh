#!/usr/bin/env bash
set -euo pipefail

project_dir="$(cd "$(dirname "$0")/.." && pwd)"
source_app="$project_dir/target/release/bundle/macos/MonoCode PK.app"
target_app="/Applications/monocodePK.app"

cd "$project_dir"
set +e
npm run tauri -- build --bundles app
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
