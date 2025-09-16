#!/usr/bin/env node

/**
 * Update version in HTML files from package.json
 * This script can be run by CI/CD to keep versions in sync
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read package.json
const packagePath = path.join(__dirname, '..', 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
const version = packageJson.version;

// Files to update
const filesToUpdate = [
    path.join(__dirname, '..', 'index.html'),
    path.join(__dirname, '..', 'docs', 'index.html'),
    // Add more files here if needed
];

// Version pattern to replace
const versionPattern = /v<!-- VERSION -->[\d.]+<!-- \/VERSION -->/g;
const replacement = `v<!-- VERSION -->${version}<!-- /VERSION -->`;

// Update each file
filesToUpdate.forEach(filePath => {
    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');
        const updatedContent = content.replace(versionPattern, replacement);
        
        if (content !== updatedContent) {
            fs.writeFileSync(filePath, updatedContent, 'utf8');
            console.log(`✓ Updated version to v${version} in ${path.basename(filePath)}`);
        } else {
            console.log(`→ Version already up to date in ${path.basename(filePath)}`);
        }
    } else {
        console.warn(`⚠ File not found: ${filePath}`);
    }
});

console.log(`\n✨ Version update complete: v${version}`);