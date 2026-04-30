/**
 * Copies non-shiny Pokémon portrait images from the main app into guide emoji assets.
 *
 * Source: frontend/public/images/avatar/portrait/*.png (same paths as image-utils `avatarImage` portrait, non-shiny).
 * Target: guides/images/emojis/pokemon/
 *
 * Skips *_shiny.png only. Removes extra PNGs under the target folder that are no longer present in the source set.
 *
 * Usage (from repo root or from guides/):
 *   node guides/scripts/sync-pokemon-emojis-from-frontend.mjs
 *   cd guides && npm run sync-pokemon-emojis
 */

import { cp, mkdir, readdir, rm, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const REPO_ROOT = path.resolve(__dirname, '..', '..');
const SOURCE_DIR = path.join(REPO_ROOT, 'frontend', 'public', 'images', 'avatar', 'portrait');
const DEST_DIR = path.join(REPO_ROOT, 'guides', 'images', 'emojis', 'pokemon');

/**
 * Non-shiny portrait PNGs only (shiny uses *_shiny.png in the same folder per image-utils.avatarImage).
 *
 * @param {string} filename
 * @returns {boolean}
 */
function isNonShinyPortraitPng(filename) {
  if (!filename.toLowerCase().endsWith('.png')) {
    return false;
  }
  return !filename.endsWith('_shiny.png');
}

async function pathExists(filePath) {
  try {
    await stat(filePath);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  if (!(await pathExists(SOURCE_DIR))) {
    console.error(`Source directory missing: ${SOURCE_DIR}`);
    console.error('Ensure frontend Pokémon PNGs are present (often git-LFS or a full checkout).');
    process.exitCode = 1;
    return;
  }

  const names = (await readdir(SOURCE_DIR)).filter(isNonShinyPortraitPng);
  if (names.length === 0) {
    console.error(`No matching non-shiny PNG portraits under ${SOURCE_DIR}.`);
    process.exitCode = 1;
    return;
  }

  names.sort((a, b) => a.localeCompare(b));

  await mkdir(DEST_DIR, { recursive: true });

  let copied = 0;
  for (const name of names) {
    const src = path.join(SOURCE_DIR, name);
    const dest = path.join(DEST_DIR, name);
    await cp(src, dest);
    copied += 1;
  }

  const destEntries = (await readdir(DEST_DIR)).filter((f) => f.toLowerCase().endsWith('.png'));
  const sourceSet = new Set(names);
  let removed = 0;
  for (const entry of destEntries) {
    if (!sourceSet.has(entry)) {
      await rm(path.join(DEST_DIR, entry));
      removed += 1;
    }
  }

  console.log(
    `Synced ${copied} Pokémon portrait emoji PNGs from frontend → ${path.relative(REPO_ROOT, DEST_DIR)}` +
      (removed > 0 ? ` (removed ${removed} stale PNG(s) in target)` : '')
  );
}

main();
