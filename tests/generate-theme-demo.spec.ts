import { test, expect } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";

/**
 * Generate theme-demo.gif
 * This test records theme switching animations and converts to GIF
 */
test("Generate theme demo GIF", async ({ page, context }) => {
  // Start recording
  await context.tracing.start({
    screenshots: true,
    snapshots: true,
  });

  // Navigate to main page
  await page.goto("http://localhost:3000");
  await page.waitForLoadState("networkidle");

  // Wait for page to be fully loaded
  await page.waitForTimeout(1000);

  // Create screenshots directory if it doesn't exist
  const screenshotsDir = path.join(process.cwd(), "temp-screenshots");
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  const screenshots: string[] = [];
  let frameCount = 0;

  // Helper function to capture frame
  const captureFrame = async (name: string) => {
    const framePath = path.join(
      screenshotsDir,
      `frame-${String(frameCount).padStart(4, "0")}.png`,
    );
    await page.screenshot({ path: framePath, fullPage: false });
    screenshots.push(framePath);
    frameCount++;
  };

  // Initial state - show some components
  await page.waitForTimeout(500);
  await captureFrame("initial");

  // Capture multiple frames of initial state
  for (let i = 0; i < 10; i++) {
    await page.waitForTimeout(100);
    await captureFrame(`initial-${i}`);
  }

  // Switch to Dark mode
  await page.locator('.mode-btn[data-mode="dark"]').first().click();
  await page.waitForTimeout(300);

  // Capture dark mode transition
  for (let i = 0; i < 15; i++) {
    await page.waitForTimeout(50);
    await captureFrame(`dark-${i}`);
  }

  // Hold on dark mode
  for (let i = 0; i < 10; i++) {
    await page.waitForTimeout(100);
    await captureFrame(`dark-hold-${i}`);
  }

  // Switch to Cold theme
  await page.locator('.theme-btn[data-theme="cold"]').first().click();
  await page.waitForTimeout(300);

  // Capture cold theme transition
  for (let i = 0; i < 15; i++) {
    await page.waitForTimeout(50);
    await captureFrame(`cold-${i}`);
  }

  // Hold on cold theme
  for (let i = 0; i < 10; i++) {
    await page.waitForTimeout(100);
    await captureFrame(`cold-hold-${i}`);
  }

  // Switch back to Light mode
  await page.locator('.mode-btn[data-mode="light"]').first().click();
  await page.waitForTimeout(300);

  // Capture light mode transition
  for (let i = 0; i < 15; i++) {
    await page.waitForTimeout(50);
    await captureFrame(`light-${i}`);
  }

  // Hold on light mode
  for (let i = 0; i < 10; i++) {
    await page.waitForTimeout(100);
    await captureFrame(`light-hold-${i}`);
  }

  // Switch back to Warm theme
  await page.locator('.theme-btn[data-theme="warm"]').first().click();
  await page.waitForTimeout(300);

  // Capture warm theme transition
  for (let i = 0; i < 15; i++) {
    await page.waitForTimeout(50);
    await captureFrame(`warm-${i}`);
  }

  // Hold on final state
  for (let i = 0; i < 10; i++) {
    await page.waitForTimeout(100);
    await captureFrame(`final-${i}`);
  }

  console.log(`\n✓ Captured ${frameCount} frames`);
  console.log(`\nTo convert to GIF, run:`);
  console.log(
    `  ffmpeg -i temp-screenshots/frame-%04d.png -vf "fps=10,scale=1280:-1:flags=lanczos" -loop 0 docs/assets/theme-demo.gif`,
  );
  console.log(`\nOr use ImageMagick:`);
  console.log(
    `  convert -delay 10 -loop 0 temp-screenshots/frame-*.png docs/assets/theme-demo.gif`,
  );
  console.log(`\nTo optimize GIF size:`);
  console.log(
    `  gifsicle -O3 --colors 256 docs/assets/theme-demo.gif -o docs/assets/theme-demo-optimized.gif`,
  );

  await context.tracing.stop();
});
