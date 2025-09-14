import { test, expect } from '@playwright/test';

test('Check if editor loads', async ({ page }) => {
  // Navigate to editor
  await page.goto('http://localhost:3000/editor.html');
  
  // Wait for page to load
  await page.waitForLoadState('networkidle');
  
  // Take screenshot for debugging
  await page.screenshot({ path: 'editor-loaded.png' });
  
  // Check if editor exists
  const editor = await page.locator('#editor').count();
  console.log(`Editor elements found: ${editor}`);
  
  // Check if any blocks exist
  const blocks = await page.locator('.editor-block').count();
  console.log(`Editor blocks found: ${blocks}`);
  
  // Get all block classes
  const blockElements = await page.locator('.editor-block').all();
  for (let i = 0; i < Math.min(3, blockElements.length); i++) {
    const className = await blockElements[i].getAttribute('class');
    const text = await blockElements[i].textContent();
    console.log(`Block ${i}: class="${className}", text="${text?.substring(0, 50)}"`);
  }
  
  // Try to click on last block
  if (blocks > 0) {
    const lastBlock = page.locator('.editor-block').last();
    await lastBlock.click();
    console.log('Clicked on last block');
    
    // Try typing slash
    await page.keyboard.type('/');
    await page.waitForTimeout(500);
    
    // Check if menu appeared
    const menuVisible = await page.locator('.slash-menu').isVisible().catch(() => false);
    console.log(`Slash menu visible: ${menuVisible}`);
    
    if (!menuVisible) {
      // Check if there's any active class
      const activeMenu = await page.locator('.slash-menu.active').count();
      console.log(`Active slash menu count: ${activeMenu}`);
    }
  }
  
  expect(blocks).toBeGreaterThan(0);
});