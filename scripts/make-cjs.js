#!/usr/bin/env node
/**
 * Produces the CommonJS require() entries for the UMD bundles that must ALSO
 * stay available as browser <script> .js URLs (dist/ui.js and the per-component
 * dist/ui/components/*.js).
 *
 * Why a copy instead of an extra rollup output: the package is "type":"module",
 * so Node parses a .js file as ESM and the UMD wrapper exposes nothing to
 * require(). A .cjs sibling forces CommonJS so require() gets the named API. We
 * copy rather than emit a second rollup output because adding ~12 extra outputs
 * tips Node 24 + @rollup/plugin-typescript into a reproducible EBADF flake.
 *
 * The framework wrappers (react/vue/jquery/web-components/index) are emitted
 * directly as .cjs by rollup — they are not browser <script> entries — so they
 * are not handled here.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.join(__dirname, "..", "dist");

/** Copy a UMD .js bundle to its .cjs sibling. */
function toCjs(jsFile) {
  const cjsFile = jsFile.replace(/\.js$/, ".cjs");
  fs.copyFileSync(jsFile, cjsFile);
  return path.relative(DIST, cjsFile);
}

const made = [];

// 1. Main integrated bundle.
const mainUmd = path.join(DIST, "ui.js");
if (fs.existsSync(mainUmd)) made.push(toCjs(mainUmd));

// 2. Per-component UMD bundles (skip the .esm.js ESM siblings).
const componentsDir = path.join(DIST, "ui", "components");
if (fs.existsSync(componentsDir)) {
  for (const entry of fs.readdirSync(componentsDir)) {
    if (entry.endsWith(".js") && !entry.endsWith(".esm.js")) {
      made.push(toCjs(path.join(componentsDir, entry)));
    }
  }
}

console.log(
  `[make-cjs] wrote ${made.length} .cjs require entries: ${made.join(", ")}`,
);
