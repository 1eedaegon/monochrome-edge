import { test, expect } from '@playwright/test';

test('Slash in new block after Enter', async ({ page }) => {
  // Capture console logs
  page.on('console', msg => {
    if (msg.text().includes('Input event') || msg.text().includes('Showing')) {
      console.log('Browser:', msg.text());
    }
  });
  
  await page.goto('/editor.html');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(500);
  
  // Find a bullet block (has content)
  const bulletBlock = page.locator('.block-bullet').first();
  
  // Click at end of bullet block
  await bulletBlock.click();
  await page.keyboard.press('End');
  
  // Press Enter to create new block
  console.log('Pressing Enter to create new block...');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(300);
  
  // Now type slash in the new block
  console.log('Typing slash...');
  await page.keyboard.type('/');
  await page.waitForTimeout(500);
  
  // Check current focused block
  const focusedContent = await page.evaluate(() => {
    const focused = document.activeElement;
    return {
      tagName: focused?.tagName,
      className: focused?.className,
      content: focused?.textContent,
      isEditable: focused?.getAttribute('contenteditable')
    };
  });
  
  console.log('Focused element:', JSON.stringify(focusedContent));
  
  // Check menu
  const menuActive = await page.locator('.slash-menu.active').count();
  console.log(`Menu active: ${menuActive}`);
  
  // Try manual trigger
  const manualResult = await page.evaluate(() => {
    const editor = (window as any).editor;
    if (!editor) return 'No editor';
    
    const focused = document.activeElement as HTMLElement;
    if (!focused || !focused.classList.contains('editor-block')) {
      return 'No focused block';
    }
    
    const index = parseInt(focused.dataset.index || '0');
    editor.showSlashMenu(focused, index);
    
    const menu = document.querySelector('.slash-menu.active');
    return menu ? 'Menu shown manually' : 'Manual trigger failed';
  });
  
  console.log('Manual trigger:', manualResult);
  
  // Re-check menu after manual trigger
  await page.waitForTimeout(200);
  const menuAfterManual = await page.locator('.slash-menu.active').count();
  console.log(`Menu after manual: ${menuAfterManual}`);
  
  expect(menuAfterManual).toBeGreaterThan(0);
});