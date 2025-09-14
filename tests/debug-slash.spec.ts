import { test, expect } from '@playwright/test';

test('Debug slash with console logs', async ({ page }) => {
  // Capture console logs
  page.on('console', msg => {
    console.log('Browser console:', msg.text());
  });
  
  await page.goto('/editor.html');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(500);
  
  // Get last block
  const lastBlock = page.locator('.editor-block').last();
  
  // Click and clear
  await lastBlock.click({ clickCount: 3 });
  await lastBlock.press('Delete');
  await page.waitForTimeout(200);
  
  // Click again to ensure focus
  await lastBlock.click();
  await page.waitForTimeout(100);
  
  console.log('--- Typing slash ---');
  
  // Type slash directly into the block
  await lastBlock.type('/');
  await page.waitForTimeout(500);
  
  // Check block content
  const content = await lastBlock.textContent();
  console.log(`Block content: "${content}"`);
  
  // Check menu
  const menuActive = await page.locator('.slash-menu.active').count();
  console.log(`Menu active: ${menuActive}`);
  
  // Check if showSlashMenu exists on window.editor
  const hasFunction = await page.evaluate(() => {
    const editor = (window as any).editor;
    return {
      hasEditor: !!editor,
      hasShowSlashMenu: !!(editor && editor.showSlashMenu),
      canCallIt: !!(editor && typeof editor.showSlashMenu === 'function')
    };
  });
  
  console.log('Function check:', JSON.stringify(hasFunction));
  
  expect(menuActive).toBeGreaterThan(0);
});