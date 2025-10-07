#!/usr/bin/env node

/**
 * Generate changelog from git commit messages
 * This script runs when version is updated
 */

import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read package.json
const packagePath = path.join(__dirname, "..", "package.json");
const packageJson = JSON.parse(fs.readFileSync(packagePath, "utf8"));
const currentVersion = packageJson.version;

// Get git tags to find last version
function getLastVersion() {
  try {
    const tags = execSync("git tag --sort=-version:refname", {
      encoding: "utf8",
    })
      .trim()
      .split("\n")
      .filter((tag) => tag.match(/^v?\d+\.\d+\.\d+$/));

    return tags[0] || null;
  } catch {
    return null;
  }
}

// Get commits since last version
function getCommitsSince(lastTag) {
  try {
    const range = lastTag ? `${lastTag}..HEAD` : "HEAD";
    const commits = execSync(
      `git log ${range} --pretty=format:"%H|%s|%b|%an|%ae|%ad" --date=short`,
      { encoding: "utf8" },
    ).trim();

    if (!commits) return [];

    return commits.split("\n").map((line) => {
      const [hash, subject, body, author, email, date] = line.split("|");
      return { hash, subject, body, author, email, date };
    });
  } catch {
    return [];
  }
}

// Categorize commits by type
function categorizeCommits(commits) {
  const categories = {
    "Breaking Changes": [],
    Features: [],
    "Bug Fixes": [],
    Performance: [],
    Documentation: [],
    Refactor: [],
    Style: [],
    Test: [],
    Chore: [],
    Other: [],
  };

  commits.forEach((commit) => {
    // Skip commits without a subject
    if (!commit.subject) {
      return;
    }
    const subject = commit.subject.toLowerCase();

    if (subject.includes("breaking") || subject.startsWith("!:")) {
      categories["Breaking Changes"].push(commit);
    } else if (subject.startsWith("feat") || subject.startsWith("feature")) {
      categories["Features"].push(commit);
    } else if (subject.startsWith("fix") || subject.startsWith("bug")) {
      categories["Bug Fixes"].push(commit);
    } else if (subject.startsWith("perf")) {
      categories["Performance"].push(commit);
    } else if (subject.startsWith("docs")) {
      categories["Documentation"].push(commit);
    } else if (subject.startsWith("refactor")) {
      categories["Refactor"].push(commit);
    } else if (subject.startsWith("style")) {
      categories["Style"].push(commit);
    } else if (subject.startsWith("test")) {
      categories["Test"].push(commit);
    } else if (subject.startsWith("chore")) {
      categories["Chore"].push(commit);
    } else {
      categories["Other"].push(commit);
    }
  });

  return categories;
}

// Generate markdown changelog
function generateMarkdown(version, date, categories) {
  let markdown = `## [${version}] - ${date}\n\n`;

  Object.entries(categories).forEach(([category, commits]) => {
    if (commits.length > 0) {
      markdown += `### ${category}\n\n`;
      commits.forEach((commit) => {
        const shortHash = commit.hash.substring(0, 7);
        markdown += `- ${commit.subject} ([${shortHash}](../../commit/${commit.hash}))\n`;
      });
      markdown += "\n";
    }
  });

  return markdown;
}

// Generate HTML changelog for documentation
function generateHTML(version, date, categories) {
  let html = `<div class="changelog-entry" data-version="${version}">
    <h3 class="changelog-version">v${version} <span class="changelog-date">${date}</span></h3>
    <div class="changelog-content">`;

  Object.entries(categories).forEach(([category, commits]) => {
    if (commits.length > 0) {
      html += `
        <div class="changelog-category">
            <h4 class="changelog-category-title">${category}</h4>
            <ul class="changelog-list">`;

      commits.forEach((commit) => {
        const shortHash = commit.hash.substring(0, 7);
        html += `
                <li>
                    <span class="changelog-commit">${escapeHtml(commit.subject)}</span>
                    <a href="#" class="changelog-hash" title="${commit.hash}">${shortHash}</a>
                </li>`;
      });

      html += `
            </ul>
        </div>`;
    }
  });

  html += `
    </div>
</div>`;

  return html;
}

function escapeHtml(text) {
  const map = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

// Update CHANGELOG.md
function updateChangelogFile(markdown) {
  const changelogPath = path.join(__dirname, "..", "CHANGELOG.md");
  let existingChangelog = "";

  if (fs.existsSync(changelogPath)) {
    existingChangelog = fs.readFileSync(changelogPath, "utf8");
    // Remove the header if it exists
    const headerEnd = existingChangelog.indexOf("## ");
    if (headerEnd > 0) {
      existingChangelog = existingChangelog.substring(headerEnd);
    }
  }

  const header = `# Changelog

All notable changes to Monochrome Edge UI Components will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

`;

  const newChangelog = header + markdown + existingChangelog;
  fs.writeFileSync(changelogPath, newChangelog, "utf8");
}

// Update HTML documentation with changelog
function updateHTMLChangelog(html) {
  const indexPath = path.join(__dirname, "..", "index.html");
  let indexContent = fs.readFileSync(indexPath, "utf8");

  // Check if changelog section exists
  if (!indexContent.includes('id="changelog"')) {
    console.log("⚠ Changelog section not found in index.html");
    return;
  }

  // Find the changelog container
  const changelogStart = indexContent.indexOf("<!-- CHANGELOG_START -->");
  const changelogEnd = indexContent.indexOf("<!-- CHANGELOG_END -->");

  if (changelogStart === -1 || changelogEnd === -1) {
    console.log("⚠ Changelog markers not found in index.html");
    return;
  }

  // Replace changelog content
  const before = indexContent.substring(
    0,
    changelogStart + "<!-- CHANGELOG_START -->".length,
  );
  const after = indexContent.substring(changelogEnd);

  indexContent = before + "\n" + html + "\n                    " + after;
  fs.writeFileSync(indexPath, indexContent, "utf8");
}

// Main execution
function main() {
  const lastVersion = getLastVersion();
  const commits = getCommitsSince(lastVersion);

  if (commits.length === 0) {
    console.log("No new commits since last version");
    return;
  }

  const categories = categorizeCommits(commits);
  const date = new Date().toISOString().split("T")[0];

  // Generate changelog formats
  const markdown = generateMarkdown(currentVersion, date, categories);
  const html = generateHTML(currentVersion, date, categories);

  // Update files
  updateChangelogFile(markdown);
  updateHTMLChangelog(html);

  console.log(`✓ Generated changelog for v${currentVersion}`);
  console.log(`  - ${commits.length} commits categorized`);
  console.log(`  - Updated CHANGELOG.md`);
  console.log(`  - Updated index.html`);
}

main();
