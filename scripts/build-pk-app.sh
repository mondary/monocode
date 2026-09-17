#!/usr/bin/env bash
set -euo pipefail

project_dir="$(cd "$(dirname "$0")/.." && pwd)"
variant="${1:-}"
build_dir="${PK_BUILD_DIR:-$project_dir/build}"
install_app="${PK_INSTALL:-1}"

# Deux variantes cohabitent : la version quotidienne (stable) et une version
# dev que l'agent peut tuer/relancer pendant le développement. L'identifiant
# de bundle distinct isole LaunchServices, les permissions TCC et les données
# applicatives, donc les deux apps tournent simultanément sans interférer.
case "$variant" in
  dev)
    product_name="MonoCode PK Dev"
    identifier="com.monocode.pk.dev"
    target_app="/Applications/MonoCodePK-Dev.app"
    overlay="$project_dir/src-tauri/tauri.pk.dev.conf.json"
    ;;
  "" | stable)
    product_name="MonoCode PK"
    identifier="com.monocode.pk"
    target_app="/Applications/MonoCodePK.app"
    overlay="$project_dir/src-tauri/tauri.pk.conf.json"
    ;;
  *)
    echo "Usage: $0 [stable|dev]" >&2
    exit 1
    ;;
esac
source_app="$build_dir/target/release/bundle/macos/${product_name}.app"

cd "$project_dir"
export CARGO_TARGET_DIR="$build_dir/target"
mkdir -p "$build_dir"

# Signature stable: sans elle (ad-hoc), macOS traite chaque rebuild comme une
# nouvelle app et redemande les acces Documents/Desktop/Downloads (TCC).
# Prefere un certificat reel du trousseau; fallback ad-hoc sinon.
sign_identity="${PK_SIGN_IDENTITY:-}"
if [[ -z "$sign_identity" ]]; then
  # Pas de certificat sur la machine (CI) : le pipeline echoue, on retombe
  # sur la signature ad-hoc definie plus bas.
  sign_identity=$(
    (security find-identity -v -p codesigning 2>/dev/null || true) |
      (grep -E '"(Apple Development|Developer ID Application|monocodePK)' || true) |
      head -1 | sed 's/.*"\(.*\)".*/\1/'
  )
fi

# Génère l'overlay de branding PK à partir de la conf de base (suivie en git,
# identique à upstream) : le nom PK n'existe que ici, jamais dans git, donc
# plus aucun conflit de merge sur tauri.conf.json lors des fusions upstream.
PK_SIGN_IDENTITY="$sign_identity" \
PK_PRODUCT_NAME="$product_name" \
PK_IDENTIFIER="$identifier" \
PK_OVERLAY="$overlay" node -e '
  const fs = require("fs");
  const base = JSON.parse(fs.readFileSync("src-tauri/tauri.conf.json", "utf8"));
  // Identifiant dédié : partager celui d upstream faisait traiter PK et
  // MonoCode officiel comme une seule app par LaunchServices (quit confondu,
  // dossier de donnees commun) et s entretuer a la fermeture.
  const name = process.env.PK_PRODUCT_NAME;
  const overlay = { productName: name, identifier: process.env.PK_IDENTIFIER };
  // Local Dev builds are not updater releases and need no updater signature.
  if (process.env.PK_IDENTIFIER.endsWith(".dev")) {
    overlay.bundle = { createUpdaterArtifacts: false };
  }
  if (base.app && Array.isArray(base.app.windows)) {
    overlay.app = {
      windows: base.app.windows.map((w) => ({ ...w, title: name })),
    };
  }
  const sign = process.env.PK_SIGN_IDENTITY || "";
  if (sign) {
    overlay.bundle = { ...overlay.bundle, macOS: { signingIdentity: sign } };
    process.stderr.write("Signing with: " + sign + "\n");
  } else {
    process.stderr.write("No codesigning identity found: ad-hoc signature (TCC prompts will repeat).\n");
  }
  fs.writeFileSync(process.env.PK_OVERLAY, JSON.stringify(overlay, null, 2) + "\n");
'

export NODE_OPTIONS="${NODE_OPTIONS:---max-old-space-size=4096}"
build_start=$(date +%s)
set +e
npm run tauri -- build --bundles app --config "$overlay"
build_status=$?
set -e
if [[ ! -d "$source_app" ]]; then
  echo "Build completed but app bundle was not found: $source_app" >&2
  exit 1
fi

# Un compile error leaves the previous bundle in place; tauri exits nonzero
# for late updater-signing errors too. Distinguish them by bundle freshness:
# only a bundling pass that ran after the build started can be trusted.
if [[ "$(stat -f %m "$source_app")" -lt "$build_start" ]]; then
  echo "Build failed and the bundle in $build_dir/target/ is stale (not rebuilt); aborting install." >&2
  exit 1
fi

if [[ "$build_status" -ne 0 ]]; then
  echo "Tauri reported an updater-signing warning; the .app bundle is available, continuing." >&2
fi

# CFBundleIconName points at the compiled AppIcon asset catalog (Assets.car),
# which shadows CFBundleIconFile in Dock/Cmd+Tab. That catalog is stale —
# regenerating it needs actool/Xcode — so drop the key and let macOS render
# the regenerated icon.icns instead.
if /usr/libexec/PlistBuddy -c 'Print :CFBundleIconName' "$source_app/Contents/Info.plist" >/dev/null 2>&1; then
  /usr/libexec/PlistBuddy -c 'Delete :CFBundleIconName' "$source_app/Contents/Info.plist"
fi

# Info.plist is sealed by the bundle signature: re-sign after editing it,
# keeping tauri's entitlements and hardened runtime. Ad-hoc when no identity.
entitlements="$(mktemp /tmp/pk-entitlements.XXXXXX).plist"
cat >"$entitlements" <<'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>com.apple.security.cs.allow-jit</key><true/>
  <key>com.apple.security.cs.allow-unsigned-executable-memory</key><true/>
</dict>
</plist>
EOF
if [[ -z "$sign_identity" ]]; then
  sign_identity="-"
fi
codesign --force --deep --options runtime \
  --entitlements "$entitlements" --sign "$sign_identity" "$source_app"
rm -f "$entitlements"

if [[ "$install_app" == "0" ]]; then
  echo "Built $source_app (not installed)"
  exit 0
fi

if [[ -e "$target_app" ]]; then
  previous_app="/tmp/$(basename "$target_app").previous.$$.app"
  mv "$target_app" "$previous_app"
  echo "Previous app moved to $previous_app"
fi

ditto "$source_app" "$target_app"
echo "Installed $target_app"
