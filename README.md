<!-- MONOCODE-PK-START -->
<p align="center"><img src="public/monocode-pk.png" alt="MonoCode PK" width="88" /></p>

# MonoCode PK

[🇫🇷 PK (FR)](#monocode-pk) · [🇬🇧 README officiel (EN) ci-dessous](#monocode)

Fork personnel de [MonoCode](https://github.com/hardbeat920/monocode), maintenu via merge de l'amont — version **2026.09.5**.

<p align="center">
  <img src="store/screenshots/01-monocode-pk.png" alt="MonoCode PK — workspace" width="784" />
</p>

## ✅ Fonctionnalités

- **Thèmes** : presets Dracula et Catppuccin Frappé, fonds de sidebar personnalisés, icône app teintée mauve Catppuccin.
- **Fournisseurs** : Z.ai (GLM), Xiaomi MiMo et Zen en fournisseurs directs, onglets OpenAI-compatibles, icônes et marques par fournisseur (CodexBar), filtrage des modèles NVIDIA retirés, espaces de noms OpenRouter préservés.
- **Raccourcis clavier personnalisables** : page Settings dédiée, capture native des touches, détection de conflits, menu natif reconstruit à la volée.
- **Terminal** : position du dock configurable, pac d'activité dans le header, vrais onglets terminal, sous-onglets masqués, mascot animée dans le rail pendant l'activité.
- **Navigation** : cycle global des onglets chat/terminal (⌘⌥ flèches), commits non poussés affichés et ouverture du dépôt distant.
- **Interface** : version PK (CalVer) affichée dans Settings, About en tête de General avec badge PK, nouveautés officielles et PK côte à côte, badges PK sur les réglages modifiés, choix des providers affichés dans le footer usage.
- **Mises à jour** : vérification séparée de MonoCode officiel et MonoCodePK, commits PK disponibles sur GitHub et commits locaux non poussés signalés.
- **Fichiers** : ouverture des fichiers HTML dans le navigateur depuis l'arborescence, ouverture directe de la racine Git du workspace dans Finder.

## 🧠 Utilisation

- `scripts/sync-pk-update.sh` — synchronise l'amont (fetch + merge), build, relance l'app ; dialog intégré avec bouton « Plus tard » et liste des commits en retard.

## ⚙️ Réglages

- Tout se règle dans Settings : thème, raccourcis, position du dock terminal, providers du footer usage. Les options modifiées par rapport à l'officiel portent un badge PK.

## 📦 Build & Package

- `npm run build:pk` — build release avec overlay de branding PK (`tauri.conf.json` identique à l'amont, zéro conflit de merge), installe `/Applications/MonoCodePK.app` (identifiant dédié `com.monocode.pk`, signature Apple Development stable).

## 📋 Historique

- Versions PK détaillées : sections `[2026.09.x]` dans le [CHANGELOG](CHANGELOG.md) ; le reste suit les releases officielles.

## 🔗 Liens

- [MonoCode officiel](https://github.com/hardbeat920/monocode) · branche `perso/pk` = ce fork · branche `main` = miroir de l'amont.

<!-- MONOCODE-PK-END -->


<p align="center">
  <img src="public/monocode.png" alt="MonoCode" width="88" />
</p>

<h1 align="center">MonoCode</h1>

<p align="center">
  <strong>A desktop UI for your coding agents.</strong>
</p>

<p align="center">
  <img width="1680" height="1050" alt="Screenshot 2026-09-04 at 06 34 00" src="https://github.com/user-attachments/assets/2cd4a6ec-eb1e-4b45-8627-a76442ea3874" />
</p>

Works with your subscriptions on Claude Code, Codex, Cursor, Grok Build, OpenCode, Pi, omp, and fx. If they’re installed and logged in, MonoCode can run them. Tabs are sessions. The composer is the input. MonoCode does not sell tokens.

## Install

> Install and log in to at least one provider first:
>
> - [Claude Code](https://claude.com/product/claude-code) - `claude auth login`
> - [Codex](https://developers.openai.com/codex/cli) - `codex login`
> - [Cursor CLI](https://cursor.com/cli) - `agent login`
> - [Grok Build](https://docs.x.ai/build/overview) - `curl -fsSL https://x.ai/cli/install.sh | bash` then `grok login`
> - [OpenCode](https://opencode.ai) - `opencode auth login`
> - [Pi](https://pi.dev/) - `npm install -g @earendil-works/pi-coding-agent`
> - [omp](https://omp.sh) - `curl -fsSL https://omp.sh/install | sh`
> - [fx](https://fx.sh) - `curl -fsSL https://fx.sh/setup.sh | bash` then `fx login`

macOS (Apple Silicon): download [MonoCode.dmg](https://dl.usemono.dev/MonoCode.dmg), open it, drag MonoCode to Applications.

Linux (x86_64): download the `.deb` or AppImage from [GitHub Releases](https://github.com/hardbeat920/monocode/releases/latest). Install the `.deb` with `sudo apt install ./MonoCode_*.deb`, or make the AppImage executable with `chmod +x MonoCode_*.AppImage` and run it directly.

Windows (x86_64): download the NSIS installer from [GitHub Releases](https://github.com/hardbeat920/monocode/releases/latest) and run it.

## Some notes

This is very early and you should expect bugs.

Small, focused pull requests are welcome. Anything large is worth an issue first - see [CONTRIBUTING.md](CONTRIBUTING.md).

## Build from source

Supports macOS, Linux, and Windows.

Need Node.js 20+ and a current stable Rust toolchain. On Linux, ensure standard Tauri prerequisites are installed (e.g. `libwebkit2gtk-4.1-dev`, `libgtk-3-dev`, `libsoup-3.0-dev`, `libjavascriptcoregtk-4.1-dev`). On Windows, the installer bootstraps the [WebView2](https://developer.microsoft.com/microsoft-edge/webview2/) runtime when it is missing.

```bash
npm install
npm run tauri dev
```

### Ubuntu / Debian packages

On an Ubuntu/Debian workstation, the repository can install the native Tauri prerequisites and build distributable Linux packages directly:

```bash
npm run setup:linux:deb
npm ci
npm run build:linux
```

The Linux build emits `.deb` and AppImage bundles under `target/release/bundle/`.
Tauri loads `src-tauri/tauri.linux.conf.json` automatically for Linux development and builds.

### Windows packages

```bash
npm ci
npm run build:windows
```

The Windows build emits an NSIS installer under `target/release/bundle/nsis/`.
Tauri loads `src-tauri/tauri.windows.conf.json` automatically for Windows development and builds.

## License

[MIT](LICENSE). Provider names and logos are trademarks of their owners - see [NOTICE](NOTICE).
