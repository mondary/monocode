#!/usr/bin/env bash
set -euo pipefail

project_dir="$(cd "$(dirname "$0")/.." && pwd)"
source_app="$project_dir/target/release/bundle/macos/MonoCode PK.app"
target_app="/Applications/MonoCodePK.app"
overlay="$project_dir/src-tauri/tauri.pk.conf.json"

cd "$project_dir"

# Signature stable: sans elle (ad-hoc), macOS traite chaque rebuild comme une
# nouvelle app et redemande les acces Documents/Desktop/Downloads (TCC).
# Prefere un certificat reel du trousseau; fallback ad-hoc sinon.
sign_identity="${PK_SIGN_IDENTITY:-}"
if [[ -z "$sign_identity" ]]; then
  sign_identity=$(
    security find-identity -v -p codesigning 2>/dev/null |
      grep -E '"(Apple Development|Developer ID Application|monocodePK)' |
      head -1 | sed 's/.*"\(.*\)".*/\1/'
  )
fi

# Génère l'overlay de branding PK à partir de la conf de base (suivie en git,
# identique à upstream) : le nom PK n'existe que ici, jamais dans git, donc
# plus aucun conflit de merge sur tauri.conf.json lors des fusions upstream.
PK_SIGN_IDENTITY="$sign_identity" node -e '
  const fs = require("fs");
  const base = JSON.parse(fs.readFileSync("src-tauri/tauri.conf.json", "utf8"));
  // Identifiant dédié : partager celui d upstream faisait traiter PK et
  // MonoCode officiel comme une seule app par LaunchServices (quit confondu,
  // dossier de donnees commun) et s entretuer a la fermeture.
  const overlay = { productName: "MonoCode PK", identifier: "com.monocode.pk" };
  if (base.app && Array.isArray(base.app.windows)) {
    overlay.app = {
      windows: base.app.windows.map((w) => ({ ...w, title: "MonoCode PK" })),
    };
  }
  const sign = process.env.PK_SIGN_IDENTITY || "";
  if (sign) {
    overlay.bundle = { macOS: { signingIdentity: sign } };
    process.stderr.write("Signing with: " + sign + "\n");
  } else {
    process.stderr.write("No codesigning identity found: ad-hoc signature (TCC prompts will repeat).\n");
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
