#!/usr/bin/env node

/**
 * Resolve version conflicts by taking the higher version
 * Useful for merge conflicts in package.json
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";
import semver from "semver";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getConflictedFiles() {
  try {
    const result = execSync("git diff --name-only --diff-filter=U", {
      encoding: "utf8",
    });
    return result.trim().split("\n").filter(Boolean);
  } catch {
    return [];
  }
}

function resolvePackageJsonConflict(filePath) {
  const content = fs.readFileSync(filePath, "utf8");

  // Check if there's a version conflict
  if (!content.includes("<<<<<<< HEAD")) {
    console.log("No conflict found in package.json");
    return false;
  }

  // Extract versions from conflict markers
  const versionPattern = /"version":\s*"([^"]+)"/g;
  const versions = [];
  let match;

  while ((match = versionPattern.exec(content)) !== null) {
    versions.push(match[1]);
  }

  if (versions.length < 2) {
    console.error("Could not find conflicting versions");
    return false;
  }

  // Get the higher version
  const higherVersion = versions.reduce((highest, current) => {
    return semver.gt(current, highest) ? current : highest;
  });

  console.log(`Found versions: ${versions.join(", ")}`);
  console.log(`Using higher version: ${higherVersion}`);

  // Read the file again and resolve conflict
  let resolvedContent = fs.readFileSync(filePath, "utf8");

  // Remove conflict markers and use higher version
  resolvedContent = resolvedContent.replace(
    /<<<<<<< HEAD[\s\S]*?=======[\s\S]*?>>>>>>> [^\n]+/g,
    `"version": "${higherVersion}"`,
  );

  // Write resolved content
  fs.writeFileSync(filePath, resolvedContent, "utf8");

  // Stage the resolved file
  execSync(`git add ${filePath}`);

  console.log(
    `✓ Resolved version conflict in ${path.basename(filePath)} to v${higherVersion}`,
  );
  return true;
}

function main() {
  const conflictedFiles = getConflictedFiles();

  if (conflictedFiles.length === 0) {
    console.log("No conflicted files found");
    return;
  }

  console.log(`Found ${conflictedFiles.length} conflicted file(s)`);

  // Handle package.json conflicts
  const packageJsonPath = path.join(__dirname, "..", "package.json");
  if (conflictedFiles.includes("package.json")) {
    if (resolvePackageJsonConflict(packageJsonPath)) {
      // After resolving package.json, update other files
      execSync("npm run version:update", { stdio: "inherit" });
      execSync("npm run changelog", { stdio: "inherit" });

      // Stage updated files
      execSync("git add docs/index.html CHANGELOG.md");

      console.log("\n✨ Version conflict resolved successfully!");
      console.log("You can now continue with your merge or rebase.");
    }
  } else {
    console.log("No package.json conflicts to resolve");
  }

  // Check if there are still conflicts
  const remainingConflicts = getConflictedFiles();
  if (remainingConflicts.length > 0) {
    console.log(
      `\n⚠️  Still have conflicts in: ${remainingConflicts.join(", ")}`,
    );
    console.log("Please resolve these manually.");
  }
}

// Check if semver is installed
try {
  require.resolve("semver");
} catch {
  console.log("Installing semver...");
  execSync("npm install --no-save semver", { stdio: "inherit" });
}

main();
