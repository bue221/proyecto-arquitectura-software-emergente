#!/usr/bin/env bash
# Publishes ./wiki to the GitHub Wiki remote.
# Prerequisite (one-time): open the Wiki tab and create the first page in the GitHub UI
# so that <repo>.wiki.git exists.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
WIKI_SRC="$ROOT/wiki"
TMP="$(mktemp -d)"
REMOTE="https://github.com/bue221/proyecto-arquitectura-software-emergente.wiki.git"

cleanup() { rm -rf "$TMP"; }
trap cleanup EXIT

if [[ ! -d "$WIKI_SRC" ]]; then
  echo "Missing $WIKI_SRC" >&2
  exit 1
fi

echo "Cloning wiki remote…"
if ! git clone "$REMOTE" "$TMP/wiki" 2>/dev/null; then
  cat >&2 <<'EOF'
GitHub Wiki remote does not exist yet.

1. Open: https://github.com/bue221/proyecto-arquitectura-software-emergente/wiki
2. Click "Create the first page" (title can be Home)
3. Save the page
4. Re-run: ./scripts/publish-wiki.sh
EOF
  exit 1
fi

rsync -a --delete --exclude .git "$WIKI_SRC"/ "$TMP/wiki"/
cd "$TMP/wiki"
git add -A
if git diff --cached --quiet; then
  echo "Wiki already up to date."
  exit 0
fi
git commit -m "docs(wiki): sync from monorepo wiki/ folder"
git push origin HEAD
echo "Published: https://github.com/bue221/proyecto-arquitectura-software-emergente/wiki"
