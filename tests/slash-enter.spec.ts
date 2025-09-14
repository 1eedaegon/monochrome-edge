import { test, expect } from '@playwright/test';

test('Slash after Enter in new block', async ({ page }) => {
  await page.goto('/editor.html');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(500);
  
  // Find a heading or bullet block
  const bulletBlock = page.locator('.block-bullet').first();
  
  // Click at the end of the bullet block
  await bulletBlock.click();
  
  // Move cursor to end
  await page.keyboard.press('End');
  
  // Press Enter to create new block
  await page.keyboard.press('Enter');
  await page.waitForTimeout(200);
  
  // Now type slash in the new block
  await page.keyboard.type('/');
  await page.waitForTimeout(500);
  
  // Check if menu appeared
  const menuActive = await page.locator('.slash-menu.active').count();
  const menuVisible = await page.locator('.slash-menu.active').isVisible().catch(() => false);
  
  console.log(`Menu active: ${menuActive}`);
  console.log(`Menu visible: ${menuVisible}`);
  
  // Get current block content
  const currentBlock = page.locator('.editor-block:focus');
  const content = await currentBlock.textContent().catch(() => 'no focused block');
  console.log(`Current block content: "${content}"`);
  
  // Try without checking block count to avoid timeout
  
  expect(menuActive).toBeGreaterThan(0);
});