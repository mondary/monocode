#!/usr/bin/env bash
set -euo pipefail

ROOT="$(CDPATH= cd -- "$(dirname "$0")/.." && pwd)"
VERSION="$(tr -d '[:space:]' < "$ROOT/VERSION")"
APP="${PK_APP_PATH:-$ROOT/../monocodePK-stable/target/release/bundle/macos/MonoCode PK.app}"
RELEASE_DIR="${PK_RELEASE_DIR:-$ROOT/releases}"
BACKGROUND="$ROOT/packaging/dmg-background.gif"
DMG="$RELEASE_DIR/MonoCodePK_${VERSION}_aarch64.dmg"
STAGE="$(mktemp -d "${TMPDIR:-/tmp}/monocodepk-dmg.XXXXXX")"

cleanup() {
  rm -rf "$STAGE"
}
trap cleanup EXIT

mkdir -p "$RELEASE_DIR" "$ROOT/packaging"
if [[ ! -f "$BACKGROUND" || "${PK_REGENERATE_DMG_BACKGROUND:-0}" == "1" ]]; then
  python3 "$ROOT/scripts/generate-pk-dmg-background.py" "$BACKGROUND"
fi

if [[ ! -d "$APP" ]]; then
  echo "App absente, lancement du build PK stable..." >&2
  (cd "$ROOT" && npm run build:pk)
fi
if [[ ! -d "$APP" ]]; then
  echo "Bundle introuvable: $APP" >&2
  exit 1
fi

rm -f "$DMG"
cp -R "$APP" "$STAGE/MonoCode PK.app"

if command -v create-dmg >/dev/null 2>&1; then
  if ! create-dmg \
      --volname "MonoCode PK $VERSION" \
      --window-size 660 400 \
      --icon-size 128 \
      --icon "MonoCode PK.app" 180 170 \
      --app-drop-link 480 170 \
      --hide-extension "MonoCode PK.app" \
      --background "$BACKGROUND" \
      "$DMG" "$STAGE"; then
    rm -f "$DMG"
    hdiutil create -volname "MonoCode PK $VERSION" -srcfolder "$STAGE" \
      -format UDZO -imagekey zlib-level=9 "$DMG"
  fi
else
  ln -s /Applications "$STAGE/Applications"
  hdiutil create -volname "MonoCode PK $VERSION" -srcfolder "$STAGE" \
    -format UDZO -imagekey zlib-level=9 "$DMG"
fi

echo "Built $DMG"
shasum -a 256 "$DMG"
