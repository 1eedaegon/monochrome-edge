import { test, expect } from '@playwright/test';

test('Debug - Check event handlers', async ({ page }) => {
  await page.goto('/editor.html');
  await page.waitForLoadState('networkidle');
  
  // Add console listener
  page.on('console', msg => {
    if (msg.type() === 'log') {
      console.log('Browser log:', msg.text());
    }
  });
  
  // Check if editor exists
  const editorExists = await page.evaluate(() => {
    const editor = document.getElementById('editor');
    console.log('Editor element:', editor);
    return editor !== null;
  });
  console.log(`Editor exists: ${editorExists}`);
  
  // Check if BlockEditor class exists
  const blockEditorExists = await page.evaluate(() => {
    console.log('Window.editor:', (window as any).editor);
    return typeof (window as any).BlockEditor !== 'undefined';
  });
  console.log(`BlockEditor class exists: ${blockEditorExists}`);
  
  // Check event listeners on a block
  const hasListeners = await page.evaluate(() => {
    const block = document.querySelector('.editor-block');
    if (!block) return 'No blocks found';
    
    // Try to trigger input event manually
    const inputEvent = new Event('input', { bubbles: true });
    block.dispatchEvent(inputEvent);
    
    return 'Block found and event dispatched';
  });
  console.log(`Event test: ${hasListeners}`);
  
  // Try to manually trigger slash menu
  const slashTest = await page.evaluate(() => {
    const editor = (window as any).editor;
    if (!editor) return 'No editor instance';
    
    const block = document.querySelector('.editor-block:last-child') as HTMLElement;
    if (!block) return 'No last block';
    
    // Try to call showSlashMenu directly
    if (editor.showSlashMenu) {
      editor.showSlashMenu(block, 0);
      return 'showSlashMenu called';
    }
    
    return 'showSlashMenu not found';
  });
  console.log(`Slash menu test: ${slashTest}`);
  
  // Check if slash menu exists in DOM
  await page.waitForTimeout(500);
  const slashMenuCount = await page.locator('.slash-menu').count();
  console.log(`Slash menu elements in DOM: ${slashMenuCount}`);
  
  // Try typing in contenteditable
  const block = page.locator('.editor-block').last();
  await block.click();
  
  // Check if contenteditable
  const isEditable = await block.evaluate(el => {
    const editable = el.getAttribute('contenteditable');
    console.log('ContentEditable:', editable);
    return editable === 'true';
  });
  console.log(`Block is editable: ${isEditable}`);
  
  // Try different input methods
  await page.keyboard.insertText('/');
  await page.waitForTimeout(200);
  
  const content1 = await block.textContent();
  console.log(`After insertText('/'): "${content1}"`);
  
  await block.press('Backspace');
  await page.keyboard.type('/');
  await page.waitForTimeout(200);
  
  const content2 = await block.textContent();
  console.log(`After type('/'): "${content2}"`);
  
  // Check slash menu again
  const menuVisible = await page.locator('.slash-menu.active').isVisible().catch(() => false);
  console.log(`Menu visible after typing: ${menuVisible}`);
  
  expect(editorExists).toBeTruthy();
});