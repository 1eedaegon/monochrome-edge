#!/usr/bin/env node

/**
 * Update version in HTML files from package.json
 * This script can be run by CI/CD to keep versions in sync
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read package.json
const packagePath = path.join(__dirname, "..", "package.json");
const packageJson = JSON.parse(fs.readFileSync(packagePath, "utf8"));
const version = packageJson.version;

// Files to update
const filesToUpdate = [
  path.join(__dirname, "..", "docs", "index.html"),
  // Add more files here if needed
];

// Version pattern to replace
const versionPattern = /v<!-- VERSION -->[\d.]+<!-- \/VERSION -->/g;
const replacement = `v<!-- VERSION -->${version}<!-- /VERSION -->`;

// Update each file
filesToUpdate.forEach((filePath) => {
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, "utf8");
    const updatedContent = content.replace(versionPattern, replacement);

    if (content !== updatedContent) {
      fs.writeFileSync(filePath, updatedContent, "utf8");
      console.log(
        `✓ Updated version to v${version} in ${path.basename(filePath)}`,
      );
    } else {
      console.log(`→ Version already up to date in ${path.basename(filePath)}`);
    }
  } else {
    console.warn(`⚠ File not found: ${filePath}`);
  }
});

// Keep the exported VERSION constants in sync with package.json so the
// runtime value never drifts (previously ui/index.ts and src/index.ts
// diverged from package.json).
const tsConstantFiles = [
  path.join(__dirname, "..", "ui", "index.ts"),
  path.join(__dirname, "..", "src", "index.ts"),
];
const versionConstPattern = /export const VERSION = "[\d.]+";/;
tsConstantFiles.forEach((filePath) => {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, "utf8");
  const updated = content.replace(
    versionConstPattern,
    `export const VERSION = "${version}";`,
  );
  if (content !== updated) {
    fs.writeFileSync(filePath, updated, "utf8");
    console.log(`✓ Updated VERSION to ${version} in ${path.basename(filePath)}`);
  }
});

console.log(`\n✨ Version update complete: v${version}`);
