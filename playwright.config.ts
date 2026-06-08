import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  // Default suite = the fast unit-level specs (security + framework adapters).
  // The editor/slash specs are wired to the live block editor in
  // docs/editor.html and now pass 20/20; they run via `npm run test:editor`
  // (kept separate only because they boot the editor bundle and take ~30s).
  testMatch: ["**/security.spec.ts", "**/adapters.spec.ts"],
  timeout: 30000,
  fullyParallel: false,
  workers: 1,
  reporter: "list",
  // CI = headless by default; locally honour PWHEADED=1 to watch a run.
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
