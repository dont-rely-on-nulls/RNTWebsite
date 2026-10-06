#!/bin/sh
# Copies the browser build of RNT (../Web) into static/try/explorer, where
# the Try it page loads it, and the Explorer's screenshot beside the images.
#
#   scripts/update-explorer.sh              # build ../Web, then copy it
#   scripts/update-explorer.sh path/to/web  # copy a build that already exists
set -eu

site=$(cd "$(dirname "$0")/.." && pwd)
if [ $# -gt 0 ]; then
  build=$1
else
  build=$(nix build "$site/../Web" --no-link --print-out-paths)
fi

out="$site/static/try/explorer"
rm -rf "$out"
mkdir -p "$out"
for f in index.html app.js rnt.js rnt.wasm rnt.data; do
  cp "$build/$f" "$out/$f"
done
chmod 644 "$out"/*

shot="$site/../Explorer/docs/explorer.png"
if [ -f "$shot" ]; then
  sips -s format jpeg -s formatOptions 82 -Z 1580 "$shot" --out "$site/static/images/explorer.jpg" >/dev/null
fi

du -sh "$out"/*
