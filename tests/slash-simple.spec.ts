import { test, expect } from '@playwright/test';

test('Simple slash test', async ({ page }) => {
  await page.goto('/editor.html');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(500);
  
  // Find an empty block (new paragraph)
  const emptyBlock = page.locator('.editor-block').last();
  
  // Click on it
  await emptyBlock.click();
  await page.waitForTimeout(200);
  
  // Type slash directly
  await page.keyboard.type('/');
  
  // Wait for input event to process
  await page.waitForTimeout(500);
  
  // Check if menu appeared - try multiple times
  let menuExists = await page.locator('.slash-menu').count();
  let menuActive = await page.locator('.slash-menu.active').count();
  let menuVisible = await page.locator('.slash-menu.active').isVisible().catch(() => false);
  
  // If not visible, wait a bit more and check again
  if (!menuVisible) {
    await page.waitForTimeout(500);
    menuExists = await page.locator('.slash-menu').count();
    menuActive = await page.locator('.slash-menu.active').count();
    menuVisible = await page.locator('.slash-menu.active').isVisible().catch(() => false);
  }
  
  console.log(`Menu elements: ${menuExists}`);
  console.log(`Active menu elements: ${menuActive}`);
  console.log(`Menu visible: ${menuVisible}`);
  
  // Check block content
  const blockContent = await emptyBlock.textContent();
  console.log(`Block content after typing: "${blockContent}"`);
  
  // Try to trigger checkShortcuts manually
  const manualTrigger = await page.evaluate(() => {
    const editor = (window as any).editor;
    if (!editor) return 'No editor';
    
    const blocks = document.querySelectorAll('.editor-block');
    const lastBlock = blocks[blocks.length - 1] as HTMLElement;
    const lastIndex = blocks.length - 1;
    
    // Manually call checkShortcuts
    editor.checkShortcuts(lastBlock, lastIndex);
    
    // Wait a bit for DOM updates
    return new Promise(resolve => {
      setTimeout(() => {
        const menu = document.querySelector('.slash-menu');
        const menuActive = document.querySelector('.slash-menu.active');
        const result = {
          menuExists: menu !== null,
          menuActive: menuActive !== null,
          menuClasses: menu ? menu.className : 'no menu',
          menuDisplay: menu ? (window.getComputedStyle(menu).display) : 'no menu'
        };
        resolve(JSON.stringify(result));
      }, 100);
    });
  });
  
  console.log(`Manual trigger result: ${manualTrigger}`);
  
  expect(menuActive).toBeGreaterThan(0);
});