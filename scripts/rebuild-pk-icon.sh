#!/usr/bin/env bash
# Regenerates every PK app icon from one master PNG.
#
# Usage: scripts/rebuild-pk-icon.sh [master.png]
# Default master: src-tauri/macos/AppIcon.icon/Assets/icon.png (1024x1024)
#
# Edit the master, run this script, then run scripts/build-pk-app.sh.
set -euo pipefail

MASTER="${1:-src-tauri/macos/AppIcon.icon/Assets/icon.png}"
[ -f "$MASTER" ] || { echo "Master not found: $MASTER" >&2; exit 1; }

TMP="$(mktemp -d)/PK.iconset"
mkdir -p "$TMP"

for size in 16 32 128 256 512; do
  magick "$MASTER" -resize "${size}x${size}" "$TMP/icon_${size}x${size}.png"
  magick "$MASTER" -resize "$((size * 2))x$((size * 2))" "$TMP/icon_${size}x${size}@2x.png"
done

iconutil -c icns "$TMP" -o src-tauri/icons/icon.icns
cp "$TMP/icon_32x32.png" src-tauri/icons/32x32.png
cp "$TMP/icon_128x128.png" src-tauri/icons/128x128.png
cp "$TMP/icon_128x128@2x.png" src-tauri/icons/128x128@2x.png
magick "$MASTER" -resize "512x512" src-tauri/icons/icon.png
rm -rf "$(dirname "$TMP")"

echo "Icons regenerated from: $MASTER"
echo "Now run: scripts/build-pk-app.sh"
