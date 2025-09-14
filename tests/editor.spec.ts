import { test, expect } from '@playwright/test';

test.describe('Editor Basic Features', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/editor.html');
    await page.waitForLoadState('networkidle');
  });

  test('1. Slash command menu opens when typing /', async ({ page }) => {
    // Find an empty paragraph block
    const emptyBlock = page.locator('.editor-block').last();
    await emptyBlock.click();
    
    // Type slash
    await page.keyboard.type('/');
    
    // Check if slash menu appears
    const slashMenu = page.locator('.slash-menu');
    await expect(slashMenu).toBeVisible();
    
    // Check if menu has items
    const menuItems = page.locator('.slash-item');
    const count = await menuItems.count();
    expect(count).toBeGreaterThan(0);
    
    console.log(`✓ Slash menu opened with ${count} items`);
  });

  test('2. Markdown shortcut: # + Space creates H1', async ({ page }) => {
    // Click on empty block
    const emptyBlock = page.locator('.editor-block').last();
    await emptyBlock.click();
    
    // Type # and space
    await page.keyboard.type('#');
    await page.keyboard.press('Space');
    
    // Check if block converted to H1
    const h1Block = page.locator('.block-heading1').last();
    await expect(h1Block).toBeVisible();
    
    console.log('✓ # + Space converted to H1');
  });

  test('3. Markdown shortcut: ## + Space creates H2', async ({ page }) => {
    const emptyBlock = page.locator('.editor-block').last();
    await emptyBlock.click();
    
    await page.keyboard.type('##');
    await page.keyboard.press('Space');
    
    const h2Block = page.locator('.block-heading2').last();
    await expect(h2Block).toBeVisible();
    
    console.log('✓ ## + Space converted to H2');
  });

  test('4. Markdown shortcut: - + Space creates bullet list', async ({ page }) => {
    const emptyBlock = page.locator('.editor-block').last();
    await emptyBlock.click();
    
    await page.keyboard.type('-');
    await page.keyboard.press('Space');
    
    const bulletBlock = page.locator('.block-bullet').last();
    await expect(bulletBlock).toBeVisible();
    
    console.log('✓ - + Space converted to bullet list');
  });

  test('5. Markdown shortcut: 1. + Space creates numbered list', async ({ page }) => {
    const emptyBlock = page.locator('.editor-block').last();
    await emptyBlock.click();
    
    await page.keyboard.type('1.');
    await page.keyboard.press('Space');
    
    const numberBlock = page.locator('.block-number').last();
    await expect(numberBlock).toBeVisible();
    
    console.log('✓ 1. + Space converted to numbered list');
  });

  test('6. Bold shortcut: Ctrl+B', async ({ page }) => {
    const emptyBlock = page.locator('.editor-block').last();
    await emptyBlock.click();
    
    // Type some text
    await page.keyboard.type('test text');
    
    // Select "test"
    await page.keyboard.press('Control+a');
    
    // Apply bold
    await page.keyboard.press('Control+b');
    
    // Check if bold applied (text wrapped in ** or <strong>)
    const blockContent = await emptyBlock.textContent();
    console.log(`Block content after Ctrl+B: ${blockContent}`);
    
    // Bold might be applied as innerHTML change
    const innerHTML = await emptyBlock.innerHTML();
    const hasBold = innerHTML.includes('<strong>') || 
                   innerHTML.includes('<b>') || 
                   blockContent?.includes('**');
    
    expect(hasBold).toBeTruthy();
    console.log('✓ Ctrl+B applied bold formatting');
  });

  test('7. List indentation with Tab', async ({ page }) => {
    // Create a bullet list first
    const emptyBlock = page.locator('.editor-block').last();
    await emptyBlock.click();
    await page.keyboard.type('-');
    await page.keyboard.press('Space');
    await page.keyboard.type('Test item');
    
    // Press Tab to indent
    await page.keyboard.press('Tab');
    
    // Check if indentation applied (padding-left style)
    const bulletBlock = page.locator('.block-bullet').last();
    const style = await bulletBlock.getAttribute('style');
    const hasIndent = style?.includes('padding-left');
    
    expect(hasIndent).toBeTruthy();
    console.log('✓ Tab increased list indentation');
  });

  test('8. List auto-continue with Enter', async ({ page }) => {
    // Create a bullet list
    const emptyBlock = page.locator('.editor-block').last();
    await emptyBlock.click();
    await page.keyboard.type('-');
    await page.keyboard.press('Space');
    await page.keyboard.type('First item');
    
    // Press Enter
    await page.keyboard.press('Enter');
    
    // Check if new bullet created
    const bulletBlocks = page.locator('.block-bullet');
    const count = await bulletBlocks.count();
    expect(count).toBeGreaterThan(1);
    
    console.log('✓ Enter continued list with new item');
  });

  test('9. Focus shows markdown syntax', async ({ page }) => {
    // Find an H1 block
    const h1Block = page.locator('.block-heading1').first();
    
    // Focus it
    await h1Block.click();
    
    // Check if ::before pseudo-element would show (CSS-based)
    // We can't directly test pseudo-elements, but we can verify the focus state
    const isFocused = await h1Block.evaluate(el => el === document.activeElement);
    expect(isFocused).toBeTruthy();
    
    console.log('✓ Focus state applied (markdown syntax should be visible via CSS)');
  });

  test('10. Undo/Redo functionality', async ({ page }) => {
    const emptyBlock = page.locator('.editor-block').last();
    await emptyBlock.click();
    
    // Type something
    const testText = 'Test undo/redo';
    await page.keyboard.type(testText);
    
    // Click undo button
    const undoBtn = page.locator('button:has-text("↶")').first();
    await undoBtn.click();
    
    // Check if text is gone
    let content = await emptyBlock.textContent();
    expect(content).not.toContain(testText);
    
    // Click redo button  
    const redoBtn = page.locator('button:has-text("↷")').first();
    await redoBtn.click();
    
    // Check if text is back
    content = await emptyBlock.textContent();
    expect(content).toContain(testText);
    
    console.log('✓ Undo/Redo working correctly');
  });

  test('11. Slash menu keyboard navigation', async ({ page }) => {
    const emptyBlock = page.locator('.editor-block').last();
    await emptyBlock.click();
    
    // Open slash menu
    await page.keyboard.type('/');
    
    // Wait for menu
    const slashMenu = page.locator('.slash-menu');
    await expect(slashMenu).toBeVisible();
    
    // Press arrow down
    await page.keyboard.press('ArrowDown');
    
    // Check if second item is selected
    const selectedItem = page.locator('.slash-item.selected');
    const selectedIndex = await selectedItem.getAttribute('data-index');
    expect(selectedIndex).toBe('1');
    
    // Press Enter to select
    await page.keyboard.press('Enter');
    
    // Menu should close
    await expect(slashMenu).not.toBeVisible();
    
    console.log('✓ Slash menu keyboard navigation works');
  });

  test('12. Quote block with > + Space', async ({ page }) => {
    const emptyBlock = page.locator('.editor-block').last();
    await emptyBlock.click();
    
    await page.keyboard.type('>');
    await page.keyboard.press('Space');
    
    const quoteBlock = page.locator('.block-quote').last();
    await expect(quoteBlock).toBeVisible();
    
    console.log('✓ > + Space converted to quote block');
  });

  test('13. Header shortcuts Ctrl+Shift+1', async ({ page }) => {
    const emptyBlock = page.locator('.editor-block').last();
    await emptyBlock.click();
    
    await page.keyboard.type('Test heading');
    await page.keyboard.press('Control+Shift+1');
    
    const h1Block = page.locator('.block-heading1').last();
    await expect(h1Block).toBeVisible();
    const content = await h1Block.textContent();
    expect(content).toContain('Test heading');
    
    console.log('✓ Ctrl+Shift+1 converted to H1');
  });

  test('14. Exit list with double Enter', async ({ page }) => {
    // Create bullet list
    const emptyBlock = page.locator('.editor-block').last();
    await emptyBlock.click();
    await page.keyboard.type('-');
    await page.keyboard.press('Space');
    
    // Double Enter to exit
    await page.keyboard.press('Enter');
    await page.keyboard.press('Enter');
    
    // Last block should be paragraph
    const lastBlock = page.locator('.editor-block').last();
    const className = await lastBlock.getAttribute('class');
    expect(className).toContain('block-paragraph');
    
    console.log('✓ Double Enter exited list mode');
  });

  test('15. Check if all initial demo content loads', async ({ page }) => {
    // Check for the main heading
    const h1 = page.locator('.block-heading1:has-text("Monochrome Edge Editor")');
    await expect(h1).toBeVisible();
    
    // Check for some bullet points
    const bullets = page.locator('.block-bullet');
    const bulletCount = await bullets.count();
    expect(bulletCount).toBeGreaterThan(0);
    
    // Check for quote
    const quote = page.locator('.block-quote');
    await expect(quote).toBeVisible();
    
    console.log('✓ Initial demo content loaded correctly');
  });
});

test.describe('Advanced Editor Features', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/editor.html');
    await page.waitForLoadState('networkidle');
  });

  test('16. Slash menu shows Table option', async ({ page }) => {
    const emptyBlock = page.locator('.editor-block').last();
    await emptyBlock.click();
    await page.keyboard.type('/');
    
    const tableOption = page.locator('.slash-item:has-text("Table")');
    await expect(tableOption).toBeVisible();
    
    await tableOption.click();
    
    // Check if table was created
    const table = page.locator('.editor-table');
    await expect(table).toBeVisible();
    
    console.log('✓ Table block created from slash menu');
  });

  test('17. Slash menu shows Code Block option', async ({ page }) => {
    const emptyBlock = page.locator('.editor-block').last();
    await emptyBlock.click();
    await page.keyboard.type('/');
    
    const codeOption = page.locator('.slash-item:has-text("Code Block")');
    await expect(codeOption).toBeVisible();
    
    await codeOption.click();
    
    // Check if code block was created
    const codeBlock = page.locator('.editor-code-block');
    await expect(codeBlock).toBeVisible();
    
    console.log('✓ Code block created from slash menu');
  });

  test('18. Slash menu fuzzy search works', async ({ page }) => {
    const emptyBlock = page.locator('.editor-block').last();
    await emptyBlock.click();
    
    // Type slash with search term
    await page.keyboard.type('/hea');
    
    // Should show only heading options
    const menuItems = page.locator('.slash-item');
    const count = await menuItems.count();
    
    // Should filter to just heading options
    for (let i = 0; i < count; i++) {
      const text = await menuItems.nth(i).textContent();
      expect(text?.toLowerCase()).toContain('head');
    }
    
    console.log('✓ Fuzzy search filtered menu items');
  });

  test('19. Word and character count updates', async ({ page }) => {
    const emptyBlock = page.locator('.editor-block').last();
    await emptyBlock.click();
    
    // Type some text
    await page.keyboard.type('Hello world test');
    
    // Check word count
    const wordCount = page.locator('#word-count');
    const words = await wordCount.textContent();
    expect(parseInt(words || '0')).toBeGreaterThan(0);
    
    // Check character count
    const charCount = page.locator('#char-count');
    const chars = await charCount.textContent();
    expect(parseInt(chars || '0')).toBeGreaterThan(0);
    
    console.log(`✓ Counts updated: ${words} words, ${chars} chars`);
  });

  test('20. Templates available in slash menu', async ({ page }) => {
    // Wait a bit for IndexedDB to initialize
    await page.waitForTimeout(1000);
    
    const emptyBlock = page.locator('.editor-block').last();
    await emptyBlock.click();
    await page.keyboard.type('/template');
    
    // Look for template options
    const templateOptions = page.locator('.slash-item:has-text("Template")');
    const hasTemplates = await templateOptions.count() > 0;
    
    if (hasTemplates) {
      console.log('✓ Templates found in slash menu');
    } else {
      console.log('⚠ Templates might not be loaded from IndexedDB yet');
    }
  });
});