#!/usr/bin/env bash
set -euo pipefail

root="$(cd "$(dirname "$0")/.." && pwd)"
master="$root/src-tauri/icons/icon-dev-master.png"
tmp="$(mktemp -d)/PKDev.iconset"
mkdir -p "$tmp"
trap 'rm -rf "${tmp%/*}"' EXIT

# The Dev master is the original monochrome MonoCode mark: white foreground,
# transparent negative space, and no opaque square behind it.
light="$tmp/master.png"
magick "$master" -alpha on "PNG32:$light"

for size in 16 32 128 256 512; do
  magick "$light" -resize "${size}x${size}" "PNG32:$tmp/icon_${size}x${size}.png"
  magick "$light" -resize "$((size * 2))x$((size * 2))" "PNG32:$tmp/icon_${size}x${size}@2x.png"
done
iconutil -c icns "$tmp" -o "$root/src-tauri/icons/icon-dev.icns"
