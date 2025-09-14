import { test, expect } from '@playwright/test';

test('Test input events', async ({ page }) => {
  await page.goto('/test-input.html');
  await page.waitForLoadState('networkidle');
  
  const block = page.locator('.block');
  await block.click();
  
  // Clear existing text - triple click to select all
  await block.click({ clickCount: 3 });
  await block.press('Delete');
  
  // Type slash
  await page.keyboard.type('/');
  await page.waitForTimeout(200);
  
  // Check menu
  const menuActive = await page.locator('.menu.active').count();
  console.log(`Menu active: ${menuActive}`);
  
  // Get logs
  const logs = await page.locator('#log div').allTextContents();
  logs.forEach(log => console.log(log));
  
  expect(menuActive).toBeGreaterThan(0);
});