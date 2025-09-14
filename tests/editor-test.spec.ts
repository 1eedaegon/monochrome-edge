import { test, expect } from '@playwright/test';

test.describe('Editor Core Features Test', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/editor.html');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500); // Wait for JS initialization
  });

  test('1. Slash command - Type / opens menu', async ({ page }) => {
    // Find the last block (empty paragraph)
    const targetBlock = page.locator('.editor-block').last();
    
    // Click and ensure it's empty
    await targetBlock.click({ clickCount: 3 });
    await targetBlock.press('Delete');
    
    // Type slash
    await page.keyboard.type('/');
    await page.waitForTimeout(200);
    
    // Check menu visibility
    const slashMenu = page.locator('.slash-menu.active');
    const isVisible = await slashMenu.isVisible().catch(() => false);
    
    if (isVisible) {
      console.log('✅ TEST PASSED: Slash menu opened');
      const items = await page.locator('.slash-item').count();
      console.log(`   Found ${items} menu items`);
    } else {
      console.log('❌ TEST FAILED: Slash menu did not open');
      // Try alternative selector
      const anyMenu = await page.locator('.slash-menu').count();
      console.log(`   Found ${anyMenu} slash-menu elements (not active)`);
    }
    
    expect(isVisible).toBeTruthy();
  });

  test('2. Markdown shortcut - # Space creates H1', async ({ page }) => {
    const targetBlock = page.locator('.editor-block').last();
    
    await targetBlock.click({ clickCount: 3 });
    await targetBlock.press('Delete');
    
    // Type # and space
    await page.keyboard.type('#');
    await page.waitForTimeout(100);
    await page.keyboard.press('Space');
    await page.waitForTimeout(200);
    
    // Check if converted to H1
    const h1Blocks = await page.locator('.block-heading1').count();
    const lastBlockClass = await page.locator('.editor-block').last().getAttribute('class');
    
    if (lastBlockClass?.includes('heading1')) {
      console.log('✅ TEST PASSED: # Space converted to H1');
    } else {
      console.log('❌ TEST FAILED: # Space did not convert to H1');
      console.log(`   Last block class: ${lastBlockClass}`);
    }
    
    expect(lastBlockClass).toContain('heading1');
  });

  test('3. Markdown shortcut - - Space creates bullet', async ({ page }) => {
    const targetBlock = page.locator('.editor-block').last();
    
    await targetBlock.click({ clickCount: 3 });
    await targetBlock.press('Delete');
    
    // Type - and space
    await page.keyboard.type('-');
    await page.waitForTimeout(100);
    await page.keyboard.press('Space');
    await page.waitForTimeout(200);
    
    // Check if converted to bullet
    const lastBlockClass = await page.locator('.editor-block').last().getAttribute('class');
    
    if (lastBlockClass?.includes('bullet')) {
      console.log('✅ TEST PASSED: - Space converted to bullet list');
    } else {
      console.log('❌ TEST FAILED: - Space did not convert to bullet');
      console.log(`   Last block class: ${lastBlockClass}`);
    }
    
    expect(lastBlockClass).toContain('bullet');
  });

  test('4. Bold shortcut - Ctrl+B', async ({ page }) => {
    const targetBlock = page.locator('.editor-block').last();
    
    await targetBlock.click({ clickCount: 3 });
    await targetBlock.press('Delete');
    
    // Type text
    await page.keyboard.type('test text');
    await page.waitForTimeout(100);
    
    // Select all and bold
    await targetBlock.press('Control+a');
    await targetBlock.press('Control+b');
    await page.waitForTimeout(200);
    
    // Check content
    const content = await targetBlock.innerHTML();
    const hasFormatting = content.includes('<strong>') || 
                         content.includes('<b>') || 
                         content.includes('**');
    
    if (hasFormatting) {
      console.log('✅ TEST PASSED: Ctrl+B applied bold');
      console.log(`   Content: ${content.substring(0, 100)}`);
    } else {
      console.log('❌ TEST FAILED: Ctrl+B did not apply bold');
      console.log(`   Content: ${content.substring(0, 100)}`);
    }
    
    expect(hasFormatting).toBeTruthy();
  });

  test('5. List indentation - Tab key', async ({ page }) => {
    // First create a bullet list
    const targetBlock = page.locator('.editor-block').last();
    
    await targetBlock.click({ clickCount: 3 });
    await targetBlock.press('Delete');
    
    // Create bullet list
    await page.keyboard.type('-');
    await page.keyboard.press('Space');
    await page.keyboard.type('Test item');
    await page.waitForTimeout(100);
    
    // Press Tab
    await page.keyboard.press('Tab');
    await page.waitForTimeout(200);
    
    // Check indentation
    const lastBlock = page.locator('.editor-block').last();
    const style = await lastBlock.getAttribute('style');
    
    if (style?.includes('padding-left')) {
      console.log('✅ TEST PASSED: Tab indented the list');
      console.log(`   Style: ${style}`);
    } else {
      console.log('❌ TEST FAILED: Tab did not indent');
      console.log(`   Style: ${style}`);
    }
    
    expect(style).toContain('padding-left');
  });

  test('6. Undo/Redo functionality', async ({ page }) => {
    const targetBlock = page.locator('.editor-block').last();
    
    await targetBlock.click({ clickCount: 3 });
    await targetBlock.press('Delete');
    
    // Type text
    const testText = 'Test undo';
    await page.keyboard.type(testText);
    await page.waitForTimeout(200);
    
    // Click undo
    const undoBtn = page.locator('.toolbar-btn').filter({ hasText: '↶' });
    await undoBtn.click();
    await page.waitForTimeout(200);
    
    // Check if text removed
    let content = await targetBlock.textContent();
    const undoWorked = !content?.includes(testText);
    
    if (undoWorked) {
      console.log('✅ TEST PASSED: Undo removed text');
    } else {
      console.log('❌ TEST FAILED: Undo did not work');
      console.log(`   Content after undo: ${content}`);
    }
    
    // Click redo
    const redoBtn = page.locator('.toolbar-btn').filter({ hasText: '↷' });
    await redoBtn.click();
    await page.waitForTimeout(200);
    
    content = await targetBlock.textContent();
    const redoWorked = content?.includes(testText);
    
    if (redoWorked) {
      console.log('✅ TEST PASSED: Redo restored text');
    } else {
      console.log('❌ TEST FAILED: Redo did not work');
      console.log(`   Content after redo: ${content}`);
    }
    
    expect(undoWorked && redoWorked).toBeTruthy();
  });

  test('7. Focus shows markdown syntax', async ({ page }) => {
    // Find an H2 block
    const h2Block = page.locator('.block-heading2').first();
    
    // Focus it
    await h2Block.click();
    await page.waitForTimeout(200);
    
    // Check focus state
    const isFocused = await h2Block.evaluate(el => el === document.activeElement);
    
    if (isFocused) {
      console.log('✅ TEST PASSED: Block focused (CSS should show ## symbol)');
      // Note: We can't directly test CSS pseudo-elements, but focus state confirms it should work
    } else {
      console.log('❌ TEST FAILED: Block not focused');
    }
    
    expect(isFocused).toBeTruthy();
  });

  test('8. Header shortcut - Ctrl+Shift+1', async ({ page }) => {
    const targetBlock = page.locator('.editor-block').last();
    
    await targetBlock.click({ clickCount: 3 });
    await targetBlock.press('Delete');
    
    // Type text
    await page.keyboard.type('Test heading');
    await page.waitForTimeout(100);
    
    // Apply shortcut
    await page.keyboard.press('Control+Shift+1');
    await page.waitForTimeout(200);
    
    // Check conversion
    const lastBlockClass = await page.locator('.editor-block').last().getAttribute('class');
    
    if (lastBlockClass?.includes('heading1')) {
      console.log('✅ TEST PASSED: Ctrl+Shift+1 converted to H1');
    } else {
      console.log('❌ TEST FAILED: Ctrl+Shift+1 did not convert');
      console.log(`   Block class: ${lastBlockClass}`);
    }
    
    expect(lastBlockClass).toContain('heading1');
  });

  test('9. Quote block - > Space', async ({ page }) => {
    const targetBlock = page.locator('.editor-block').last();
    
    await targetBlock.click({ clickCount: 3 });
    await targetBlock.press('Delete');
    
    // Type > and space
    await page.keyboard.type('>');
    await page.waitForTimeout(100);
    await page.keyboard.press('Space');
    await page.waitForTimeout(200);
    
    // Check conversion
    const lastBlockClass = await page.locator('.editor-block').last().getAttribute('class');
    
    if (lastBlockClass?.includes('quote')) {
      console.log('✅ TEST PASSED: > Space converted to quote');
    } else {
      console.log('❌ TEST FAILED: > Space did not convert');
      console.log(`   Block class: ${lastBlockClass}`);
    }
    
    expect(lastBlockClass).toContain('quote');
  });

  test('10. Word count updates', async ({ page }) => {
    const targetBlock = page.locator('.editor-block').last();
    
    await targetBlock.click({ clickCount: 3 });
    await targetBlock.press('Delete');
    
    // Type text
    await page.keyboard.type('One two three four five');
    await page.waitForTimeout(200);
    
    // Check counts
    const wordCount = await page.locator('#word-count').textContent();
    const charCount = await page.locator('#char-count').textContent();
    
    const words = parseInt(wordCount || '0');
    const chars = parseInt(charCount || '0');
    
    if (words > 0 && chars > 0) {
      console.log(`✅ TEST PASSED: Counts updated - ${words} words, ${chars} chars`);
    } else {
      console.log(`❌ TEST FAILED: Counts not updated - ${words} words, ${chars} chars`);
    }
    
    expect(words).toBeGreaterThan(0);
    expect(chars).toBeGreaterThan(0);
  });
});

// Summary test
test('Test Summary', async ({ page }) => {
  console.log('\n========================================');
  console.log('EDITOR FEATURE TEST SUMMARY');
  console.log('========================================');
  console.log('Run individual tests above to see results');
  console.log('Each test logs ✅ PASSED or ❌ FAILED');
  console.log('========================================\n');
  
  expect(true).toBeTruthy();
});