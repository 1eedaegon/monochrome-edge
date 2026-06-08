import { defineConfig } from "@playwright/test";

/**
 * Opt-in config for the editor test suite (editor / slash / debug specs).
 *
 * docs/editor.html mounts the real block editor (MonochromeEditor) from the
 * built bundle, so these tests run against live editor behaviour and pass
 * 20/20. Kept separate from the default run only because they boot the
 * editor bundle (requires `npm run build:editor`) and take ~30s.
 *
 * Run with: npm run test:editor
 */
export default defineConfig({
  testDir: "./tests",
  testMatch: [
    "**/editor.spec.ts",
    "**/editor-test.spec.ts",
    "**/slash-*.spec.ts",
    "**/debug-*.spec.ts",
    "**/test-input.spec.ts",
    "**/simple-test.spec.ts",
    "**/generate-theme-demo.spec.ts",
  ],
  timeout: 30000,
  fullyParallel: false,
  workers: 1,
  reporter: "list",
  use: {
    baseURL: "http://localhost:3000",
    headless: process.env.PWHEADED !== "1",
    viewport: { width: 1280, height: 720 },
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  webServer: {
    command: "npm start",
    url: "http://localhost:3000",
    reuseExistingServer: true,
  },
});
