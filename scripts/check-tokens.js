#!/usr/bin/env node

/**
 * Design / theme integrity guard.
 *
 * Locks in the monochrome warm/cold theme contract so it cannot silently
 * regress:
 *   1. every `var(--token)` referenced in CSS (without a fallback) must be
 *      defined somewhere — catches the "undefined token → invalid/initial
 *      value → silently broken styling" class of bug.
 *   2. the semantic `--theme-*` token set must be identical between the warm
 *      and cold themes, so switching variant never drops a value.
 *
 * It does NOT police colour values — the palette/theme philosophy is the
 * designer's; this only guarantees the token wiring stays intact.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UI_DIR = path.join(__dirname, "..", "ui");

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(p));
    else if (entry.name.endsWith(".css")) out.push(p);
  }
  return out;
}

const cssFiles = walk(UI_DIR);

// Tokens defined anywhere (start-of-declaration `--x:`).
const defined = new Set();
// Tokens referenced via var(--x) WITHOUT a fallback.
const referenced = new Map(); // name -> first file

for (const file of cssFiles) {
  const css = fs.readFileSync(file, "utf8");
  // A custom-property definition is `--name:` (a value, not `var(--name)`
  // which is followed by `)`), so this captures declarations only.
  for (const m of css.matchAll(/(--[a-z0-9-]+)\s*:/gi)) {
    defined.add(m[1]);
  }
  // var(--x) with no comma => no fallback
  for (const m of css.matchAll(/var\(\s*(--[a-z0-9-]+)\s*\)/gi)) {
    if (!referenced.has(m[1])) referenced.set(m[1], path.relative(UI_DIR, file));
  }
}

const undefinedRefs = [...referenced.keys()]
  .filter((t) => !defined.has(t))
  .sort();

// --theme-* symmetry between warm and cold.
function themeTokens(file) {
  const css = fs.readFileSync(path.join(UI_DIR, "tokens", file), "utf8");
  return new Set(
    [...css.matchAll(/(?:^|[;{]\s*)(--theme-[a-z0-9-]+)\s*:/gi)].map(
      (m) => m[1],
    ),
  );
}
const warm = themeTokens("warm-theme.css");
const cold = themeTokens("cold-theme.css");
const onlyWarm = [...warm].filter((t) => !cold.has(t)).sort();
const onlyCold = [...cold].filter((t) => !warm.has(t)).sort();

let failed = false;

if (undefinedRefs.length) {
  failed = true;
  console.error(
    `\n✘ ${undefinedRefs.length} CSS token(s) referenced but never defined:`,
  );
  for (const t of undefinedRefs) {
    console.error(`    ${t}  (e.g. ${referenced.get(t)})`);
  }
}

if (onlyWarm.length || onlyCold.length) {
  failed = true;
  console.error("\n✘ warm/cold --theme-* token sets differ:");
  if (onlyWarm.length) console.error(`    only in warm: ${onlyWarm.join(", ")}`);
  if (onlyCold.length) console.error(`    only in cold: ${onlyCold.join(", ")}`);
}

if (failed) {
  console.error("\nDesign/theme integrity check FAILED.\n");
  process.exit(1);
}

console.log(
  `✓ Design/theme integrity OK — ${defined.size} tokens defined, ` +
    `${referenced.size} referenced, warm/cold --theme-* in sync.`,
);
