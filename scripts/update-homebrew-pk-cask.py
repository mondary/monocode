#!/usr/bin/env python3
"""Update the MonoCode PK cask and tap metadata for a published DMG."""

from __future__ import annotations

import re
import sys
from pathlib import Path


def replace_once(path: Path, pattern: str, replacement: str) -> None:
    content = path.read_text()
    updated, count = re.subn(pattern, replacement, content, count=1, flags=re.MULTILINE)
    if count != 1:
        raise SystemExit(f"pattern not found exactly once in {path}: {pattern}")
    path.write_text(updated)


def main() -> None:
    if len(sys.argv) != 4:
        raise SystemExit("usage: update-homebrew-pk-cask.py TAP_DIR VERSION SHA256")
    tap = Path(sys.argv[1]).resolve()
    version, sha256 = sys.argv[2:]
    cask = tap / "Casks/monocode-pk.rb"
    if not cask.is_file():
        raise SystemExit(f"missing cask: {cask}")

    replace_once(cask, r'^  version "[^"]+"$', f'  version "{version}"')
    replace_once(cask, r'^  sha256 "[^"]+"$', f'  sha256 "{sha256}"')
    (tap / "VERSION").write_text(version + "\n")

    for readme_name in ("README.md", "README_en.md"):
        readme = tap / readme_name
        if readme.is_file():
            replace_once(readme, r'(version-)[0-9.]+(-c8ff5e)', rf'\g<1>{version}\g<2>')

    changelog = tap / "CHANGELOG.md"
    if changelog.is_file():
        content = changelog.read_text()
        heading = f"### [{version}]"
        if heading not in content:
            marker = "---\n"
            entry = (
                f"\n## Releases\n\n### [{version}] - 2026-09-15\n"
                "#### Changed\n"
                f"- Cask `monocode-pk` mis à jour vers la release `pk-{version}`.\n"
            )
            content = content.replace(marker, marker + entry, 1)
            changelog.write_text(content)

    print(f"Updated Homebrew tap {tap} to {version} ({sha256})")


if __name__ == "__main__":
    main()
