#!/usr/bin/env node
/**
 * Runs `rollup -c <config>` and retries on the Node 24 "EBADF: bad file
 * descriptor" flake.
 *
 * Under Node 24, rollup's parallel output-write queue intermittently throws
 * EBADF mid-build (the file descriptors are double-managed by libuv). It is not
 * a config error — the same command succeeds on a later attempt. esbuild
 * transpile + maxParallelFileOps:1 cut the failure rate sharply but not to
 * zero, so this wrapper retries until the build completes, keeping the rest of
 * the build pipeline deterministic.
 *
 * Usage: node scripts/rollup-retry.js [rollup.config.js]
 */
import { spawnSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const config = process.argv[2] || "rollup.config.js";
const MAX_ATTEMPTS = 25;
const rollupBin = path.join(__dirname, "..", "node_modules", ".bin", "rollup");

for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
  const result = spawnSync(rollupBin, ["-c", config], {
    encoding: "utf8",
    stdio: ["inherit", "inherit", "pipe"],
  });

  // Forward rollup's stderr (minus the noisy FD warnings) so real errors show.
  const stderr = result.stderr || "";
  process.stderr.write(
    stderr
      .split("\n")
      .filter(
        (l) =>
          !/Warning: File descriptor|unmanaged mode|trace-warnings/.test(l),
      )
      .join("\n"),
  );

  if (result.status === 0) {
    if (attempt > 1)
      console.log(`[rollup-retry] ${config} succeeded on attempt ${attempt}`);
    process.exit(0);
  }

  const isFlake = /EBADF/.test(stderr);
  if (!isFlake) {
    console.error(
      `[rollup-retry] ${config} failed with a non-EBADF error — not retrying.`,
    );
    process.exit(result.status || 1);
  }
  console.error(
    `[rollup-retry] EBADF flake on attempt ${attempt}/${MAX_ATTEMPTS}, retrying…`,
  );
}

console.error(
  `[rollup-retry] ${config} still failing after ${MAX_ATTEMPTS} attempts.`,
);
process.exit(1);
