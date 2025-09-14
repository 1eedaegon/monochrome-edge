import { test, expect } from '@playwright/test';

test('Slash in empty block', async ({ page }) => {
  await page.goto('/editor.html');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(500);
  
  // Clear the last block completely
  const lastBlock = page.locator('.editor-block').last();
  await lastBlock.click();
  await lastBlock.press('Control+a');
  await lastBlock.press('Delete');
  await page.waitForTimeout(200);
  
  // Verify it's empty
  const isEmpty = await lastBlock.evaluate(el => el.textContent === '');
  console.log(`Block is empty: ${isEmpty}`);
  
  // Type slash
  await page.keyboard.type('/');
  await page.waitForTimeout(500);
  
  // Check content
  const content = await lastBlock.textContent();
  console.log(`Content after slash: "${content}"`);
  
  // Check if menu appeared
  const menuActive = await page.locator('.slash-menu.active').count();
  const menuVisible = await page.locator('.slash-menu.active').isVisible().catch(() => false);
  
  console.log(`Active menu elements: ${menuActive}`);
  console.log(`Menu visible: ${menuVisible}`);
  
  // Also check via JS
  const jsCheck = await page.evaluate(() => {
    const menu = document.querySelector('.slash-menu.active');
    return {
      exists: menu !== null,
      display: menu ? window.getComputedStyle(menu).display : 'none'
    };
  });
  
  console.log(`JS check: ${JSON.stringify(jsCheck)}`);
  
  expect(menuActive).toBeGreaterThan(0);
});